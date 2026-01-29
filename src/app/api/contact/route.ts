import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('contact_requests')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new'
      })

    if (dbError) {
      console.error('Error saving contact request:', dbError)
      // Don't fail — still send emails
    }

    // Send emails
    try {
      const baseUrl = request.nextUrl.origin
      await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_form',
          data: { name, email, phone, subject, message }
        })
      })
    } catch (emailError) {
      console.error('Failed to send contact emails:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
