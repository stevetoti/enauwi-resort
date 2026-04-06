import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 reset attempts per IP per 5 minutes
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(ip, { id: 'reset-password', limit: 5, windowSeconds: 300 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.retryAfter) } }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Hash the incoming token and compare with stored hash
    const tokenHash = hashToken(token)

    const { data: staff, error: findError } = await supabase
      .from('staff')
      .select('id, email, reset_token_expires')
      .eq('reset_token', tokenHash)
      .single()

    if (findError || !staff) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    if (staff.reset_token_expires && new Date(staff.reset_token_expires) < new Date()) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    const { error: updateError } = await supabase
      .from('staff')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('id', staff.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
