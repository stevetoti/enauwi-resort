import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const VANUCONNECT_SMS_API = 'https://zqxcrvjsnunjuelmrydm.supabaseAdmin.co/functions/v1/send-sms-api'

// GET message logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('message_logs')
      .select(`
        *,
        sender:staff!message_logs_sent_by_fkey(id, name, email)
      `)
      .order('sent_at', { ascending: false })
      .limit(limit)

    if (channel) {
      query = query.eq('channel', channel)
    }

    if (startDate) {
      query = query.gte('sent_at', startDate)
    }

    if (endDate) {
      query = query.lte('sent_at', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching message logs:', error)
    return NextResponse.json({ error: 'Failed to fetch message logs' }, { status: 500 })
  }
}

// POST send message (SMS or Email)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, recipients, message, subject, sent_by, guest_id, recipient_name, template_id, message_type } = body

    if (!channel || !recipients || !message) {
      return NextResponse.json({ error: 'Channel, recipients, and message are required' }, { status: 400 })
    }

    const recipientList = Array.isArray(recipients) ? recipients : [recipients]
    const results: { recipient: string; success: boolean; error?: string }[] = []

    for (const recipient of recipientList) {
      try {
        let status = 'sent'
        let errorMessage: string | undefined

        if (channel === 'sms') {
          // Send via VanuConnect SMS API
          const smsResponse = await fetch(VANUCONNECT_SMS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: recipient,
              message: message,
            }),
          })

          const smsResult = await smsResponse.json()

          if (!smsResponse.ok || smsResult.error) {
            status = 'failed'
            errorMessage = smsResult.error || 'SMS sending failed'
          }
        } else if (channel === 'email') {
          // Send via internal email API
          const emailResponse = await fetch(`${request.nextUrl.origin}/api/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'concierge_email',
              data: {
                guestEmail: recipient,
                guestName: recipient_name || 'Guest',
                subject: subject || 'Message from E\'Nauwi Beach Resort',
                body: message,
              },
            }),
          })

          const emailResult = await emailResponse.json()

          if (!emailResponse.ok || !emailResult.success) {
            status = 'failed'
            errorMessage = emailResult.error || 'Email sending failed'
          }
        } else {
          status = 'failed'
          errorMessage = 'Invalid channel'
        }

        // Log the message
        await supabase
          .from('message_logs')
          .insert({
            recipient_id: guest_id,
            recipient_name,
            recipient_contact: recipient,
            channel,
            message_type,
            subject: channel === 'email' ? subject : null,
            message,
            template_id,
            sent_by,
            status,
            error_message: errorMessage,
          })

        results.push({ recipient, success: status === 'sent', error: errorMessage })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        results.push({ recipient, success: false, error: errorMessage })

        // Log failed attempt
        await supabase
          .from('message_logs')
          .insert({
            recipient_id: guest_id,
            recipient_name,
            recipient_contact: recipient,
            channel,
            message_type,
            subject: channel === 'email' ? subject : null,
            message,
            template_id,
            sent_by,
            status: 'failed',
            error_message: errorMessage,
          })
      }
    }

    const allSuccess = results.every(r => r.success)
    const someSuccess = results.some(r => r.success)

    return NextResponse.json({
      success: allSuccess,
      partial: !allSuccess && someSuccess,
      results,
    }, { status: allSuccess ? 200 : (someSuccess ? 207 : 500) })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
