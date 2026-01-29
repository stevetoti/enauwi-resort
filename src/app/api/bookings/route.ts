import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import { BookingFormData } from '@/types'
import { generateBookingReference, getDaysBetween } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const bookingData: BookingFormData = await request.json()
    
    const {
      checkIn,
      checkOut,
      guests,
      roomId,
      guestName,
      guestEmail,
      guestPhone,
      specialRequests
    } = bookingData

    // Validate required fields
    if (!checkIn || !checkOut || !roomId || !guestName || !guestEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
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

    // Check availability one more time
    const { data: conflicts, error: conflictsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', roomId)
      .in('status', ['confirmed', 'checked_in'])
      .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

    if (conflictsError) {
      throw conflictsError
    }

    if (conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Room is no longer available for selected dates' },
        { status: 409 }
      )
    }

    // Calculate total price
    const nights = getDaysBetween(checkIn, checkOut)
    const totalPrice = room.price_vt * nights

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
        special_requests: specialRequests,
        status: 'pending'
      })
      .select('*')
      .single()

    if (bookingError) {
      throw bookingError
    }

    // Return booking confirmation
    return NextResponse.json({
      booking,
      reference: generateBookingReference(),
      room,
      totalPrice,
      nights
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
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
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}