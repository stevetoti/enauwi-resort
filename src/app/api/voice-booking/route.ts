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
      replyTo: 'info@enauwiresort.vu',
      to: [to],
      cc: ['steve@pacificwavedigital.com'],
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Email send error:', err)
    return false
  }
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

    // Map room type to room_id and price
    const roomMap: Record<string, { id: number; name: string; price: number }> = {
      'bungalow': { id: 1, name: 'Oceanfront Bungalow', price: 12000 },
      'oceanfront': { id: 1, name: 'Oceanfront Bungalow', price: 12000 },
      'suite': { id: 2, name: 'Tropical Garden Suite', price: 18000 },
      'garden': { id: 2, name: 'Tropical Garden Suite', price: 18000 },
      'villa': { id: 3, name: 'Premium Beachfront Villa', price: 25000 },
      'premium': { id: 3, name: 'Premium Beachfront Villa', price: 25000 },
    }

    const roomKey = (room_type || 'bungalow').toLowerCase()
    const room = roomMap[roomKey] || roomMap['bungalow']

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
        guests: num_guests || 2,
        total_price: totalPrice,
        status: 'pending',
        special_requests: special_requests || '',
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking insert error:', bookingError)
      // Still continue to notify even if DB fails
    }

    const bookingRef = booking?.id ? `ENW-${String(booking.id).padStart(4, '0')}` : `ENW-${Date.now().toString().slice(-6)}`

    // Send confirmation email
    const emailHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #0e7a5a, #0a5e44); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🌴 E'Nauwi Beach Resort</h1>
    <p style="color: #a8e6cf; margin: 8px 0 0; font-size: 14px;">Booking Confirmation</p>
  </div>
  
  <div style="padding: 30px; background: #fff;">
    <p style="font-size: 16px;">Welkam, <strong>${guest_name}</strong>!</p>
    <p style="font-size: 15px;">Thank you for booking with E'Nauwi Beach Resort. Here are your details:</p>
    
    <div style="background: #f0faf5; padding: 20px; border-radius: 8px; border-left: 4px solid #0e7a5a; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>📋 Booking Reference:</strong> ${bookingRef}</p>
      <p style="margin: 5px 0;"><strong>🏠 Room:</strong> ${room.name}</p>
      <p style="margin: 5px 0;"><strong>📅 Check-in:</strong> ${check_in_date || 'To be confirmed'}</p>
      <p style="margin: 5px 0;"><strong>📅 Check-out:</strong> ${check_out_date || 'To be confirmed'}</p>
      <p style="margin: 5px 0;"><strong>👥 Guests:</strong> ${num_guests || 2}</p>
      <p style="margin: 5px 0;"><strong>🌙 Nights:</strong> ${nights}</p>
      <p style="margin: 5px 0;"><strong>💰 Total:</strong> ${totalPrice.toLocaleString()} VT (~$${Math.round(totalPrice / 120)} USD)</p>
      ${special_requests ? `<p style="margin: 5px 0;"><strong>📝 Special Requests:</strong> ${special_requests}</p>` : ''}
    </div>
    
    <p style="font-size: 15px;">Our team will confirm your booking shortly. For any questions, call us at <strong>+678 22170</strong>.</p>
    
    <p style="font-size: 15px;">We look forward to welcoming you to paradise! 🏝️</p>
    
    <p style="margin-top: 25px;">Tangkyu tumas,<br><strong>E'Nauwi Beach Resort Team</strong></p>
  </div>
  
  <div style="background: #0a5e44; padding: 15px; text-align: center;">
    <p style="color: white; margin: 0; font-size: 12px;">📞 +678 22170 | ✉️ info@enauwiresort.vu</p>
    <p style="color: #a8e6cf; margin: 5px 0 0; font-size: 11px;">South West Bay, Malekula Island, Vanuatu</p>
  </div>
</div>`

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
