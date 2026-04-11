import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { BookingFormData } from '@/types'
import { generateBookingReference, getDaysBetween } from '@/lib/utils'
import { sendBookingNotifications } from '@/lib/notifications'
// CSRF removed — bookings are public guest actions, not authenticated admin mutations
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()
    const bookingData: BookingFormData = await request.json()

    // Support both camelCase and snake_case field names
    const checkIn = bookingData.checkIn || bookingData.check_in
    const checkOut = bookingData.checkOut || bookingData.check_out
    const guests = bookingData.guests
    const roomId = bookingData.roomId || bookingData.room_id
    const guestName = bookingData.guestName || bookingData.guest_name
    const guestEmail = bookingData.guestEmail || bookingData.guest_email
    const guestPhone = bookingData.guestPhone || bookingData.guest_phone
    const specialRequests = bookingData.specialRequests || bookingData.special_requests
    const paymentMethod = bookingData.payment_method || 'property'

    // Validate required fields
    if (!checkIn || !checkOut || !roomId || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(guestEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate date formats (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    // Validate dates are logical
    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    // Validate string lengths
    if (guestName.length > 200 || guestEmail.length > 254) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    // Get room details for pricing
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }

    // Check availability one more time (overlap: existing check_in < newCheckOut AND existing check_out > newCheckIn)
    const { data: conflicts, error: conflictsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .lt('check_in', checkOut)
      .gt('check_out', checkIn)

    if (conflictsError) {
      throw conflictsError
    }

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Room is no longer available for selected dates' },
        { status: 409 }
      )
    }

    // Calculate total price with discounts
    const nights = getDaysBetween(checkIn, checkOut)
    const basePrice = room.price_vt * nights

    // Check for active discounts
    let discountPercent = 0
    let discountName = ''
    let discountAmount = 0

    const { data: discounts } = await supabase
      .from('room_discounts')
      .select('name, discount_percent, min_nights')
      .eq('is_active', true)
      .lte('start_date', checkIn)
      .gte('end_date', checkOut)
      .or(`room_id.eq.${roomId},room_id.is.null`)
      .order('discount_percent', { ascending: false })
      .limit(1)

    if (discounts && discounts.length > 0 && nights >= (discounts[0].min_nights || 1)) {
      discountPercent = discounts[0].discount_percent
      discountName = discounts[0].name
      discountAmount = Math.round(basePrice * discountPercent / 100)
    }

    const totalPrice = basePrice - discountAmount

    // Create or get guest record
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('id')
      .eq('email', guestEmail)
      .single()

    let guestId = existingGuest?.id

    if (!guestId) {
      const { data: newGuest, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          language: 'en'
        })
        .select('id')
        .single()

      if (guestError) {
        throw guestError
      }

      guestId = newGuest.id
    }

    // Generate booking reference
    const reference = generateBookingReference()

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        room_id: roomId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        num_guests: guests,
        total_price: totalPrice,
        base_price: basePrice,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        discount_name: discountName || null,
        payment_method: paymentMethod === 'card' ? 'credit_card' : 'property',
        payment_status: 'unpaid',
        booking_reference: reference,
        special_requests: specialRequests || null,
        status: 'pending'
      })
      .select('*')
      .single()

    if (bookingError) {
      throw bookingError
    }

    // ── Multi-channel notifications (fire-and-forget) ────────────
    const baseUrl = request.nextUrl.origin
    const formattedCheckIn = new Date(checkIn).toLocaleDateString('en-US', { dateStyle: 'long' })
    const formattedCheckOut = new Date(checkOut).toLocaleDateString('en-US', { dateStyle: 'long' })
    const formattedPrice = `VT ${totalPrice.toLocaleString()}`

    sendBookingNotifications(baseUrl, {
      guestName,
      guestEmail,
      guestPhone,
      reference,
      roomName: room.name,
      checkIn: formattedCheckIn,
      checkOut: formattedCheckOut,
      guests,
      nights,
      totalPrice: formattedPrice,
      specialRequests,
      bookingId: booking.id,
    }).catch(() => {})

    // Return booking confirmation
    return NextResponse.json({
      booking,
      reference,
      room,
      totalPrice,
      nights
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get bookings for the guest
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(*)
      `)
      .eq('guest_email', email)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ bookings })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// DELETE — delete a booking (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Delete any linked invoices first (cascade should handle, but be explicit)
    await supabaseAdmin
      .from('invoices')
      .delete()
      .eq('booking_id', id)

    const { error } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
