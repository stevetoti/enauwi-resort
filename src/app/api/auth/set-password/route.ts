import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// API to set/reset a staff member's password (admin use)
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { staffId, newPassword, adminEmail } = await request.json()

    if (!staffId || !newPassword) {
      return NextResponse.json({ error: 'Staff ID and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Verify admin is making the request (optional - based on localStorage session)
    // In production, use proper JWT/session validation

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the staff member's password
    const { error } = await supabase
      .from('staff')
      .update({ password_hash: hashedPassword })
      .eq('id', staffId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }
}
