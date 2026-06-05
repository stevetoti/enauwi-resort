/**
 * Unified Notification Service for E'Nauwi Beach Resort
 *
 * Dispatches booking/contact notifications across all channels:
 *   1. Email   — via Resend (or /api/email/send)
 *   2. WhatsApp — placeholder (via /api/notifications/whatsapp)
 *   3. SMS     — VanuConnect placeholder (via /api/notifications/sms)
 *
 * Usage:
 *   import { sendBookingNotifications } from '@/lib/notifications'
 *   await sendBookingNotifications(baseUrl, bookingData)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingNotificationData {
  // Guest details
  guestName: string
  guestEmail: string
  guestPhone?: string

  // Booking details
  reference: string
  roomName: string
  checkIn: string       // human-readable date string
  checkOut: string      // human-readable date string
  guests: number
  nights: number
  totalPrice: string    // formatted e.g. "VT 24,000"

  // Optional
  specialRequests?: string
  bookingId?: string
}

export interface NotificationResult {
  channel: 'email' | 'whatsapp' | 'sms'
  success: boolean
  error?: string
  details?: unknown
}

// ─── Send all booking notifications ───────────────────────────────────────────

export async function sendBookingNotifications(
  baseUrl: string,
  data: BookingNotificationData
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []

  // 1. Email — guest confirmation + resort admin alert
  results.push(await sendEmailNotification(baseUrl, data))

  // 2. WhatsApp — if guest provided a phone number
  if (data.guestPhone) {
    results.push(await sendWhatsAppNotification(baseUrl, data))
  }

  // 3. SMS via VanuConnect — if guest provided a phone number
  if (data.guestPhone) {
    results.push(await sendSMSNotification(baseUrl, data))
  }

  // Log summary
  const succeeded = results.filter(r => r.success).map(r => r.channel)
  const failed = results.filter(r => !r.success).map(r => `${r.channel}: ${r.error}`)
  console.log(`[Notifications] Booking ${data.reference}: sent=[${succeeded.join(',')}] failed=[${failed.join('; ')}]`)

  return results
}

// ─── Send booking UPDATE notifications ────────────────────────────────────────
// Sent when an existing booking is edited (e.g. room type changed, dates moved).
// `changeSummary` is a short human list of what changed, e.g. "Room, Check-in date".

export async function sendBookingUpdateNotifications(
  baseUrl: string,
  data: BookingNotificationData,
  changeSummary?: string
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []

  // 1. Email — revised confirmation to guest
  try {
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking_updated',
        data: {
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          roomName: data.roomName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          totalPrice: data.totalPrice,
          reference: data.reference,
          specialRequests: data.specialRequests,
          changeSummary: changeSummary || '',
        },
      }),
    })
    const result = await response.json()
    results.push({ channel: 'email', success: response.ok && result.success !== false, details: result, error: result.error || undefined })
  } catch (error) {
    results.push({ channel: 'email', success: false, error: error instanceof Error ? error.message : 'Email send failed' })
  }

  // 2. WhatsApp + 3. SMS — only if guest provided a phone number
  if (data.guestPhone) {
    try {
      const response = await fetch(`${baseUrl}/api/notifications/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: data.guestPhone,
          template: 'booking_updated',
          data: {
            guestName: data.guestName,
            reference: data.reference,
            roomName: data.roomName,
            checkIn: data.checkIn,
            checkOut: data.checkOut,
            guests: data.guests,
            totalPrice: data.totalPrice,
          },
        }),
      })
      const result = await response.json()
      results.push({ channel: 'whatsapp', success: response.ok && result.success !== false, details: result, error: result.error || undefined })
    } catch (error) {
      results.push({ channel: 'whatsapp', success: false, error: error instanceof Error ? error.message : 'WhatsApp send failed' })
    }

    try {
      const response = await fetch(`${baseUrl}/api/notifications/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.guestPhone, message: buildUpdateSMSMessage(data) }),
      })
      const result = await response.json()
      results.push({ channel: 'sms', success: response.ok && result.success !== false, details: result, error: result.error || undefined })
    } catch (error) {
      results.push({ channel: 'sms', success: false, error: error instanceof Error ? error.message : 'SMS send failed' })
    }
  }

  const succeeded = results.filter(r => r.success).map(r => r.channel)
  const failed = results.filter(r => !r.success).map(r => `${r.channel}: ${r.error}`)
  console.log(`[Notifications] Booking UPDATED ${data.reference}: sent=[${succeeded.join(',')}] failed=[${failed.join('; ')}]`)

  return results
}

// ─── 1. Email Notification ────────────────────────────────────────────────────

async function sendEmailNotification(
  baseUrl: string,
  data: BookingNotificationData
): Promise<NotificationResult> {
  try {
    const response = await fetch(`${baseUrl}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'booking_confirmation',
        data: {
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          roomName: data.roomName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          totalPrice: data.totalPrice,
          reference: data.reference,
          specialRequests: data.specialRequests,
        }
      })
    })

    const result = await response.json()
    return {
      channel: 'email',
      success: response.ok && result.success !== false,
      details: result,
      error: result.error || undefined,
    }
  } catch (error) {
    return {
      channel: 'email',
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed',
    }
  }
}

// ─── 2. WhatsApp Notification ─────────────────────────────────────────────────

async function sendWhatsAppNotification(
  baseUrl: string,
  data: BookingNotificationData
): Promise<NotificationResult> {
  try {
    const response = await fetch(`${baseUrl}/api/notifications/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.guestPhone,
        template: 'booking_confirmation',
        data: {
          guestName: data.guestName,
          reference: data.reference,
          roomName: data.roomName,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
          totalPrice: data.totalPrice,
        }
      })
    })

    const result = await response.json()
    return {
      channel: 'whatsapp',
      success: response.ok && result.success !== false,
      details: result,
      error: result.error || undefined,
    }
  } catch (error) {
    return {
      channel: 'whatsapp',
      success: false,
      error: error instanceof Error ? error.message : 'WhatsApp send failed',
    }
  }
}

// ─── 3. SMS via VanuConnect ───────────────────────────────────────────────────

async function sendSMSNotification(
  baseUrl: string,
  data: BookingNotificationData
): Promise<NotificationResult> {
  try {
    const response = await fetch(`${baseUrl}/api/notifications/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: data.guestPhone,
        message: buildSMSMessage(data),
      })
    })

    const result = await response.json()
    return {
      channel: 'sms',
      success: response.ok && result.success !== false,
      details: result,
      error: result.error || undefined,
    }
  } catch (error) {
    return {
      channel: 'sms',
      success: false,
      error: error instanceof Error ? error.message : 'SMS send failed',
    }
  }
}

// ─── SMS message builder ──────────────────────────────────────────────────────

function buildSMSMessage(data: BookingNotificationData): string {
  return [
    `Welkam ${data.guestName}! 🌺`,
    `Booking confirmed: ${data.reference}`,
    `${data.roomName}`,
    `${data.checkIn} → ${data.checkOut}`,
    `${data.guests} guest${data.guests > 1 ? 's' : ''} · ${data.totalPrice}`,
    ``,
    `E'Nauwi Beach Resort`,
    `📞 +678 22170`,
  ].join('\n')
}

function buildUpdateSMSMessage(data: BookingNotificationData): string {
  return [
    `Hi ${data.guestName}, your E'Nauwi booking ${data.reference} has been updated. 🌺`,
    `${data.roomName}`,
    `${data.checkIn} → ${data.checkOut}`,
    `${data.guests} guest${data.guests > 1 ? 's' : ''} · ${data.totalPrice}`,
    ``,
    `Questions? Call +678 22170`,
    `E'Nauwi Beach Resort`,
  ].join('\n')
}
