import { NextRequest, NextResponse } from 'next/server'

/**
 * SMS Notification API via VanuConnect
 *
 * Sends SMS messages to guests using the VanuConnect SMS gateway.
 * Stephen is setting up the E'Nauwi VanuConnect account — API key incoming.
 *
 * VanuConnect API docs: https://vanuconnect.com/api  (assumed)
 *
 * Environment variables:
 *   VANUCONNECT_API_KEY    — API key for VanuConnect
 *   VANUCONNECT_SENDER_ID  — Sender name/number (default: "ENauwi")
 *   VANUCONNECT_API_URL    — API endpoint (default: https://api.vanuconnect.com/v1/sms/send)
 */

const VANUCONNECT_API_KEY = process.env.VANUCONNECT_API_KEY
const VANUCONNECT_SENDER_ID = process.env.VANUCONNECT_SENDER_ID || 'ENauwi'
const VANUCONNECT_API_URL = process.env.VANUCONNECT_API_URL || 'https://api.vanuconnect.com/v1/sms/send'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      )
    }

    // Normalize the phone number for Vanuatu
    const normalizedPhone = normalizeVanuatuPhone(phone)

    // Check if VanuConnect is configured
    if (!VANUCONNECT_API_KEY) {
      console.log(`[SMS/VanuConnect] Not configured — would send to ${normalizedPhone}:`, message.slice(0, 80))
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'VanuConnect API not yet configured. SMS queued for when integration is active.',
        preview: {
          to: normalizedPhone,
          sender: VANUCONNECT_SENDER_ID,
          body: message,
          chars: message.length,
          segments: Math.ceil(message.length / 160),
        },
      })
    }

    // Send SMS via VanuConnect API
    const smsResponse = await fetch(VANUCONNECT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VANUCONNECT_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        to: normalizedPhone,
        from: VANUCONNECT_SENDER_ID,
        message: message,
        // VanuConnect may use different field names — adjust as needed:
        // sender_id: VANUCONNECT_SENDER_ID,
        // recipient: normalizedPhone,
        // body: message,
      })
    })

    const smsResult = await smsResponse.json()

    if (!smsResponse.ok) {
      console.error('[SMS/VanuConnect] API error:', smsResult)
      return NextResponse.json({
        success: false,
        error: smsResult.error || smsResult.message || 'VanuConnect API error',
        details: smsResult,
      }, { status: smsResponse.status })
    }

    console.log(`[SMS/VanuConnect] Sent to ${normalizedPhone}: ${smsResult.id || 'ok'}`)

    return NextResponse.json({
      success: true,
      messageId: smsResult.id || smsResult.message_id,
      details: smsResult,
    })

  } catch (error) {
    console.error('[SMS/VanuConnect] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    )
  }
}

// ── Phone normalization for Vanuatu ───────────────────────────────────────────

function normalizeVanuatuPhone(phone: string): string {
  // Strip everything except digits and leading +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.slice(1)
  }

  // If it looks like a local Vanuatu number (5-7 digits), prepend 678
  if (cleaned.length >= 5 && cleaned.length <= 7 && !cleaned.startsWith('678')) {
    cleaned = '678' + cleaned
  }

  // If starts with 0 (local dialing), replace with country code
  if (cleaned.startsWith('0')) {
    cleaned = '678' + cleaned.slice(1)
  }

  // Return with + prefix for international format
  return '+' + cleaned
}
