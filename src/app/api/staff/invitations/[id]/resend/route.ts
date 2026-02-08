import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

// POST resend invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Use service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { id } = await params

    // Get the existing invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('staff_invitations')
      .select(`
        *,
        role:roles(id, name)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation is already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
    }

    // Generate new invitation token
    const newToken = randomBytes(32).toString('hex')
    
    // Set new expiry to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Update the invitation with new token and expiry
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('staff_invitations')
      .update({
        invitation_token: newToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        role:roles(id, name)
      `)
      .single()

    if (updateError) throw updateError

    // Send new invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://enauwi-resort.vercel.app'}/staff/onboard?token=${newToken}`

    await fetch(`${request.nextUrl.origin}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'staff_invitation',
        data: {
          email: invitation.email,
          name: invitation.name,
          roleName: invitation.role?.name || 'Staff',
          department: invitation.department || '',
          inviteUrl,
        },
      }),
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation resent successfully',
      invitation: updatedInvitation,
    })
  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 })
  }
}
