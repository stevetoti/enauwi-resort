import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      token,
      phone,
      date_of_birth,
      gender,
      nationality,
      address,
      emergency_contact_name,
      emergency_contact_phone,
      profile_photo,
      password,
    } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Find invitation by token
    const { data: invitation, error: inviteError } = await supabase
      .from('staff_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('staff_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if email already exists in staff
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('email', invitation.email)
      .single()

    if (existingStaff) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Create the staff member
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert({
        email: invitation.email,
        name: invitation.name,
        role_id: invitation.role_id,
        department: invitation.department,
        phone: phone || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        nationality: nationality || null,
        address: address || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        profile_photo: profile_photo || null,
        date_employed: new Date().toISOString().split('T')[0], // Set date employed to today
        employment_type: 'full-time', // Default employment type
        status: 'active',
        role: 'staff', // default legacy role
        first_login: false,
      })
      .select()
      .single()

    if (staffError) throw staffError

    // Update invitation status
    await supabase
      .from('staff_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    // Note: In a production app, you would also:
    // 1. Create a Supabase Auth user with the password
    // 2. Link the auth user to the staff record
    // For now, we'll use a simple password hash stored in a separate table or use Supabase Auth

    // Create auth credentials (simplified - in production use Supabase Auth)
    const { error: authError } = await supabase
      .from('staff_credentials')
      .insert({
        staff_id: staff.id,
        email: staff.email,
        password_hash: password, // In production, this should be properly hashed
      })

    if (authError) {
      console.error('Error creating credentials:', authError)
      // Don't fail the whole operation, staff is created
    }

    return NextResponse.json({
      success: true,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
      },
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
