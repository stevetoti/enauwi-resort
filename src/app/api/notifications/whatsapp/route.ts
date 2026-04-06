import { NextRequest, NextResponse } from 'next/server'

/**
 * WhatsApp Notification API
 *
 * Placeholder for WhatsApp Business API integration.
 * When configured, this will send booking confirmations and
 * resort updates to guests via WhatsApp.
 *
 * Future integration options:
 *   - WhatsApp Business API (Meta Cloud API)
 *   - Third-party providers (Twilio, MessageBird, etc.)
 *
 * Environment variables (to be set when configured):
 *   WHATSAPP_API_TOKEN   — API bearer token
 *   WHATSAPP_PHONE_ID    — WhatsApp Business phone number ID
 *   WHATSAPP_VERIFY_TOKEN — Webhook verification token
 */

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID

// ── Message templates ─────────────────────────────────────────────────────────

interface BookingData {
  guestName: string
  reference: string
  roomName: string
  checkIn: string
  checkOut: string
  guests: number
  totalPrice: string
}

function buildBookingMessage(data: BookingData): string {
  return [
    `🌺 *Welkam, ${data.guestName}!*`,
    ``,
    `Your booking at E'Nauwi Beach Resort has been received!`,
    ``,
    `📋 *Booking Details:*`,
    `Reference: ${data.reference}`,
    `🏨 ${data.roomName}`,
    `📅 ${data.checkIn} → ${data.checkOut}`,
    `👥 ${data.guests} guest${data.guests > 1 ? 's' : ''}`,
    `💰 ${data.totalPrice}`,
    ``,
    `Our team will confirm your booking within 24 hours.`,
    ``,
    `📞 Questions? Call +678 22170`,
    `📧 gm@enauwibeachresort.com`,
    ``,
    `_Tankyu tumas! Lukim yu long E'Nauwi!_ 🇻🇺`,
  ].join('\n')
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, template, data, message } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if WhatsApp API is configured
    if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_ID) {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'WhatsApp API not yet configured. Message queued for when integration is active.',
        preview: template === 'booking_confirmation' && data
          ? buildBookingMessage(data)
          : (message || 'No message content'),
      })
    }

    // Build the message content
    let messageText: string
    if (template === 'booking_confirmation' && data) {
      messageText = buildBookingMessage(data)
    } else if (message) {
      messageText = message
    } else {
      return NextResponse.json(
        { error: 'Either template+data or message is required' },
        { status: 400 }
      )
    }

    // Normalize phone number (ensure it starts with country code)
    const normalizedPhone = normalizePhone(phone)

    // Send via WhatsApp Business API (Meta Cloud API)
    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { body: messageText },
        })
      }
    )

    const waResult = await waResponse.json()

    if (!waResponse.ok) {
      return NextResponse.json({
        success: false,
        error: waResult.error?.message || 'WhatsApp API error',
        details: waResult,
      }, { status: waResponse.status })
    }

    return NextResponse.json({
      success: true,
      messageId: waResult.messages?.[0]?.id,
    })

  } catch {
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    )
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Strip all non-numeric except leading +
  let cleaned = phone.replace(/[^\d+]/g, '')

  // If starts with 0, assume Vanuatu local number
  if (cleaned.startsWith('0')) {
    cleaned = '678' + cleaned.slice(1)
  }

  // If no country code, assume Vanuatu (+678)
  if (!cleaned.startsWith('+') && !cleaned.startsWith('678') && cleaned.length <= 7) {
    cleaned = '678' + cleaned
  }

  // Remove leading + for WhatsApp API
  return cleaned.replace(/^\+/, '')
}
