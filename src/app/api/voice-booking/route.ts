import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy init to avoid build-time errors
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// Resend email helper
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'E\'Nauwi Beach Resort <noreply@totiroom.pacificwavedigital.com>',
      replyTo: 'reservation@enauwibeachresort.com',
      to: [to],
      cc: ['steve@pacificwavedigital.com', 'reservation@enauwibeachresort.com'],
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
}

// Room mapping with correct UUID IDs from database
const ROOMS = {
  'beachfront-deluxe-2': {
    id: '05e09a4e-aa78-41a0-a8ce-de9e45710e44',
    name: 'Beachfront Deluxe 2 Bedroom',
    price: 30000,
    maxGuests: 4
  },
  'lagoon-view-2': {
    id: '302109a1-b014-4ce7-b5af-bb0a303fe544',
    name: 'Lagoon View Superior 2 Bedroom',
    price: 27000,
    maxGuests: 4
  },
  'beachfront-deluxe-1': {
    id: '6f314c7c-d38d-4ed6-bcb6-f83f2bc375a3',
    name: 'Beachfront Deluxe 1 Bedroom',
    price: 25000,
    maxGuests: 2
  },
  'lagoon-view-1': {
    id: '9b37897c-b1ad-40ed-a516-949c1963d487',
    name: 'Lagoon View Superior 1 Bedroom',
    price: 22000,
    maxGuests: 2
  },
  'garden-view-2': {
    id: 'f82af187-8b17-4d22-902e-f149e4abe7cc',
    name: 'Back Garden View 2 Bedroom',
    price: 23000,
    maxGuests: 4
  }
}

function matchRoom(roomType: string) {
  const type = (roomType || '').toLowerCase()
  
  // Match by keywords
  if (type.includes('beachfront') && type.includes('2')) return ROOMS['beachfront-deluxe-2']
  if (type.includes('beachfront') || type.includes('deluxe')) return ROOMS['beachfront-deluxe-1']
  if (type.includes('lagoon') && type.includes('2')) return ROOMS['lagoon-view-2']
  if (type.includes('lagoon') || type.includes('superior')) return ROOMS['lagoon-view-1']
  if (type.includes('garden') || type.includes('back')) return ROOMS['garden-view-2']
  
  // Default to cheapest option
  return ROOMS['lagoon-view-1']
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      room_type,
      num_guests,
      special_requests,
    } = body

    // Validate required fields
    if (!guest_name || !guest_email || !guest_phone) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: guest_name, guest_email, and guest_phone are required.'
      }, { status: 400 })
    }

    // Match room by type
    const room = matchRoom(room_type || '')

    // Calculate nights and total
    let nights = 1
    if (check_in_date && check_out_date) {
      const cin = new Date(check_in_date)
      const cout = new Date(check_out_date)
      nights = Math.max(1, Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)))
    }
    const totalPrice = room.price * nights

    // Create booking in Supabase
    const { data: booking, error: bookingError } = await getSupabase()
      .from('bookings')
      .insert({
        guest_name,
        guest_email,
        guest_phone,
        check_in: check_in_date || new Date().toISOString().split('T')[0],
        check_out: check_out_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        room_id: room.id,
        num_guests: num_guests || 2,
        total_price: totalPrice,
        status: 'pending',
        special_requests: `Voice call booking. ${special_requests || ''}`.trim(),
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      // Still continue to notify even if DB fails
    }

    // Generate reference - use UUID prefix if we have booking ID
    const bookingRef = booking?.id 
      ? `ENW-${booking.id.slice(0, 8).toUpperCase()}` 
      : `ENW-${Date.now().toString().slice(-6)}`

    // Format dates for email
    const checkInFormatted = check_in_date 
      ? new Date(check_in_date).toLocaleDateString('en-US', { dateStyle: 'long' })
      : 'To be confirmed'
    const checkOutFormatted = check_out_date 
      ? new Date(check_out_date).toLocaleDateString('en-US', { dateStyle: 'long' })
      : 'To be confirmed'

    // Send confirmation email with brand colors
    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#0A4B78,#0D5A91);padding:40px 30px;text-align:center;">
    <h1 style="color:#D4A853;font-size:28px;margin:0;font-family:Georgia,serif;">E'Nauwi Beach Resort</h1>
    <p style="color:#ffffff;opacity:0.8;margin:8px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Booking Confirmation</p>
  </div>
  
  <div style="padding:30px;">
    <h2 style="color:#0A4B78;font-size:22px;margin:0 0 8px;">Welkam, ${guest_name}!</h2>
    <p style="color:#666;line-height:1.6;margin:0 0 24px;">Thank you for your voice booking with E'Nauwi Beach Resort. Our team will confirm your reservation shortly.</p>
    
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#0A4B78;font-size:16px;margin:0 0 16px;border-bottom:2px solid #D4A853;padding-bottom:8px;">Booking Details</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Reference</td><td style="padding:8px 0;color:#0A4B78;font-weight:bold;text-align:right;font-size:14px;">${bookingRef}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Room</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${room.name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Check-in</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${checkInFormatted}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Check-out</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${checkOutFormatted}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Guests</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${num_guests || 2}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:14px;">Nights</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${nights}</td></tr>
        ${special_requests ? `<tr><td style="padding:8px 0;color:#888;font-size:14px;">Notes</td><td style="padding:8px 0;color:#333;text-align:right;font-size:14px;">${special_requests}</td></tr>` : ''}
        <tr style="border-top:2px solid #D4A853;"><td style="padding:12px 0;color:#0A4B78;font-weight:bold;font-size:16px;">Total</td><td style="padding:12px 0;color:#0A4B78;font-weight:bold;text-align:right;font-size:16px;">${totalPrice.toLocaleString()} VT (~$${Math.round(totalPrice / 120)} USD)</td></tr>
      </table>
    </div>
    
    <p style="color:#666;line-height:1.6;font-size:14px;">📞 Questions? Call us at <strong>+678 22170</strong></p>
    <p style="color:#666;line-height:1.6;font-size:14px;">We look forward to welcoming you to paradise! 🏝️</p>
    <p style="color:#D4A853;font-family:Georgia,serif;font-size:16px;margin-top:24px;">Tangkyu tumas,<br>— The E'Nauwi Team</p>
  </div>
  
  <div style="background:#083D63;padding:24px 30px;text-align:center;">
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:0;">E'Nauwi Beach Resort · South East Efate, Vanuatu</p>
    <p style="color:#ffffff;opacity:0.6;font-size:12px;margin:4px 0 0;">📞 +678 22170 · ✉ reservation@enauwibeachresort.com</p>
  </div>
</div>
</body>
</html>`

    const emailSent = await sendEmail(
      guest_email,
      `Booking Confirmation - ${bookingRef} | E'Nauwi Beach Resort`,
      emailHtml
    )

    // Return success response for ElevenLabs agent
    return NextResponse.json({
      success: true,
      booking_reference: bookingRef,
      room_name: room.name,
      price_per_night: `${room.price.toLocaleString()} VT`,
      total_price: `${totalPrice.toLocaleString()} VT`,
      nights,
      email_sent: emailSent,
      message: `Booking ${bookingRef} created successfully for ${guest_name}. ${room.name} for ${nights} night(s) at ${totalPrice.toLocaleString()} VT total. Confirmation email ${emailSent ? 'sent' : 'pending'} to ${guest_email}.`
    })

  } catch (error) {
    console.error('Voice booking error:', error)
    return NextResponse.json({
      success: false,
      message: 'Sorry, there was an error processing the booking. Please try calling +678 22170 directly.'
    }, { status: 500 })
  }
}
