import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createSessionToken, setSessionCookie } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { requireCsrf } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    // CSRF check
    const csrfError = await requireCsrf(request)
    if (csrfError) return csrfError

    // Rate limit: 5 login attempts per IP per 60 seconds
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, { id: 'login', limit: 5, windowSeconds: 60 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find staff member by email with role in a single query
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, email, name, role, role_id, status, password_hash, profile_photo, department, department_id, position, phone, role_details:roles(name, permissions)')
      .eq('email', email.toLowerCase())
      .single()

    if (staffError || !staff) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (staff.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active. Please contact administrator.' }, { status: 401 })
    }

    if (!staff.password_hash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check password — support bcrypt hashed and legacy plaintext (auto-upgrade)
    let passwordValid = false
    const isHashed = staff.password_hash.startsWith('$2a$') || staff.password_hash.startsWith('$2b$')

    if (isHashed) {
      passwordValid = await bcrypt.compare(password, staff.password_hash)
    } else {
      passwordValid = staff.password_hash === password
      if (passwordValid) {
        // Auto-upgrade plaintext to bcrypt
        const hashedPassword = await bcrypt.hash(password, 10)
        await supabase
          .from('staff')
          .update({ password_hash: hashedPassword })
          .eq('id', staff.id)
      }
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await supabase
      .from('staff')
      .update({ last_login: new Date().toISOString() })
      .eq('id', staff.id)

    // Extract permissions from joined role
    const roleDetails = Array.isArray(staff.role_details) ? staff.role_details[0] : staff.role_details
    const permissions = (roleDetails?.permissions as Record<string, Record<string, boolean>>) || {}

    // Create JWT session token
    const token = await createSessionToken({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      role_id: staff.role_id,
      permissions,
    })

    const staffData = {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      role_id: staff.role_id,
      profile_photo: staff.profile_photo,
      department: staff.department,
      department_id: staff.department_id,
      position: staff.position,
      phone: staff.phone,
      permissions,
    }

    // Set httpOnly cookie and return staff data
    const response = NextResponse.json({ success: true, staff: staffData })
    setSessionCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
