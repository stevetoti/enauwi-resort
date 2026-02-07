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

    // Send notifications (email, SMS, WhatsApp)
    const baseUrl = request.nextUrl.origin
    const notificationPromises = []

    // 1. Email notification
    notificationPromises.push(
      fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact_form',
          data: { name, email, phone, subject, message }
        })
      }).catch(err => console.error('Email notification failed:', err))
    )

    // 2. SMS to resort owner (+678 22170)
    const smsMessage = `📩 New Contact Form\n\nFrom: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\n\nSubject: ${subject}\n\n${message.slice(0, 100)}${message.length > 100 ? '...' : ''}`
    notificationPromises.push(
      fetch(`${baseUrl}/api/notifications/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+67822170',
          message: smsMessage
        })
      }).catch(err => console.error('SMS notification failed:', err))
    )

    // 3. WhatsApp to resort owner
    notificationPromises.push(
      fetch(`${baseUrl}/api/notifications/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: '+67822170',
          message: `📩 *New Contact Form Submission*\n\n*From:* ${name}\n*Email:* ${email}\n*Phone:* ${phone || 'N/A'}\n\n*Subject:* ${subject}\n\n${message}`
        })
      }).catch(err => console.error('WhatsApp notification failed:', err))
    )

    // Wait for all notifications (don't fail if some don't work)
    await Promise.allSettled(notificationPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
