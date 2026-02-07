import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { randomBytes } from 'crypto'

// POST send staff invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role_id, department_id, invited_by } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    // Check if email already exists in staff
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('email', email)
      .single()

    if (existingStaff) {
      return NextResponse.json({ error: 'This email is already registered as staff' }, { status: 400 })
    }

    // Check for pending invitations
    const { data: existingInvite } = await supabase
      .from('staff_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'A pending invitation already exists for this email' }, { status: 400 })
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')
    
    // Set expiry to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Get department name for storing
    let departmentName = ''
    if (department_id) {
      const { data: dept } = await supabase
        .from('departments')
        .select('name')
        .eq('id', department_id)
        .single()
      departmentName = dept?.name || ''
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('staff_invitations')
      .insert({
        email,
        name,
        role_id,
        department: departmentName,
        invitation_token: invitationToken,
        invited_by,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select(`
        *,
        role:roles(*)
      `)
      .single()

    if (error) throw error

    // Get role name for email
    const { data: role } = await supabase
      .from('roles')
      .select('name')
      .eq('id', role_id)
      .single()

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://enauwi-resort.vercel.app'}/staff/onboard?token=${invitationToken}`

    await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'staff_invitation',
        data: {
          email,
          name,
          roleName: role?.name || 'Staff',
          department: departmentName,
          inviteUrl,
        },
      }),
    })

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}
