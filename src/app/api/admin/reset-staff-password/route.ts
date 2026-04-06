import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Require authenticated admin session
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and newPassword are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const { data: staff, error: findError } = await supabase
      .from('staff')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    if (findError || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
      .from('staff')
      .update({ password_hash: hashedPassword })
      .eq('id', staff.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for ${staff.name}`
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
