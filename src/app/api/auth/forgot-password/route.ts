import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find staff member by email
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration
    if (staffError || !staff) {
      return NextResponse.json({ success: true, message: 'If account exists, reset link sent' })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // Token expires in 1 hour

    // Store reset token in staff table
    const { error: updateError } = await supabase
      .from('staff')
      .update({ 
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('id', staff.id)

    if (updateError) {
      console.error('Error storing reset token:', updateError)
      // Try alternative: store in a separate field or just proceed
    }

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://enauwi-resort.vercel.app'}/admin/reset-password?token=${resetToken}`

    try {
      await fetch(`${request.nextUrl.origin}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'password_reset',
          data: {
            email: staff.email,
            name: staff.name,
            resetUrl,
          },
        }),
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
    }

    return NextResponse.json({ success: true, message: 'If account exists, reset link sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
