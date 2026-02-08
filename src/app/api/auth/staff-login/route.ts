import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
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

    // Find staff member by email
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, email, name, role, role_id, status, password_hash, profile_photo, department, department_id, position, phone')
      .eq('email', email.toLowerCase())
      .single()

    if (staffError || !staff) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check if staff is active
    if (staff.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active. Please contact administrator.' }, { status: 401 })
    }

    // Check password (simple comparison - in production use bcrypt)
    if (!staff.password_hash || staff.password_hash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login
    await supabase
      .from('staff')
      .update({ last_login: new Date().toISOString() })
      .eq('id', staff.id)

    // Fetch role permissions
    let permissions = {}
    if (staff.role_id) {
      const { data: role } = await supabase
        .from('roles')
        .select('name, permissions')
        .eq('id', staff.role_id)
        .single()
      
      if (role) {
        permissions = role.permissions || {}
      }
    }

    // Return staff info (without password)
    return NextResponse.json({
      success: true,
      staff: {
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
        permissions: permissions,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
