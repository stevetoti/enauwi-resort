import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'
import { sendBookingUpdateNotifications } from '@/lib/notifications'
import { getDaysBetween } from '@/lib/utils'

// GET single booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceSupabase()

    const { data, error } = await supabase
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ booking: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

// PATCH — update booking (status change OR edit details)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const supabase = createServiceSupabase()
    const { id } = params
    const body = await request.json()

    // Get current booking
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}

    // Status change
    if (body.status) {
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }

      if (body.status === 'cancelled') {
        if (currentBooking.status === 'checked_in' || currentBooking.status === 'checked_out') {
          return NextResponse.json({ error: 'Cannot cancel a booking that has already been checked in' }, { status: 400 })
        }
      }

      updates.status = body.status
    }

    // Editable fields
    if (body.guest_name !== undefined) updates.guest_name = body.guest_name
    if (body.guest_email !== undefined) updates.guest_email = body.guest_email
    if (body.guest_phone !== undefined) updates.guest_phone = body.guest_phone
    if (body.check_in !== undefined) updates.check_in = body.check_in
    if (body.check_out !== undefined) updates.check_out = body.check_out
    if (body.num_guests !== undefined) updates.num_guests = body.num_guests
    if (body.special_requests !== undefined) updates.special_requests = body.special_requests
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.total_price !== undefined) updates.total_price = body.total_price
    if (body.room_id !== undefined) updates.room_id = body.room_id

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    // If dates OR room changed, re-check availability (excludes this booking)
    if (updates.check_in || updates.check_out || updates.room_id) {
      const newCheckIn = (updates.check_in || currentBooking.check_in) as string
      const newCheckOut = (updates.check_out || currentBooking.check_out) as string
      const roomId = (updates.room_id || currentBooking.room_id) as string

      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .neq('id', id)
        .lt('check_in', newCheckOut)
        .gt('check_out', newCheckIn)

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Room is not available for the new dates' }, { status: 409 })
      }
    }

    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select('*, room:rooms(*)')
      .single()

    if (updateError) throw updateError

    // ── Notify the guest if guest-facing details changed ──────────
    // (room, dates, guest count, or price). Fire-and-forget; never blocks the save.
    try {
      const ci = (v: unknown) => String(v ?? '').split('T')[0]
      const changed: string[] = []
      if (body.room_id !== undefined && body.room_id !== currentBooking.room_id) changed.push('Room')
      if (body.check_in !== undefined && body.check_in !== ci(currentBooking.check_in)) changed.push('Check-in date')
      if (body.check_out !== undefined && body.check_out !== ci(currentBooking.check_out)) changed.push('Check-out date')
      if (body.num_guests !== undefined && Number(body.num_guests) !== Number(currentBooking.num_guests)) changed.push('Number of guests')
      if (body.total_price !== undefined && Number(body.total_price) !== Number(currentBooking.total_price)) changed.push('Total price')

      if (changed.length > 0 && booking.status !== 'cancelled' && booking.guest_email) {
        const checkIn = ci(booking.check_in)
        const checkOut = ci(booking.check_out)
        const nights = checkIn && checkOut ? getDaysBetween(checkIn, checkOut) : 0
        const baseUrl = request.nextUrl.origin

        sendBookingUpdateNotifications(baseUrl, {
          guestName: booking.guest_name,
          guestEmail: booking.guest_email,
          guestPhone: booking.guest_phone || undefined,
          reference: booking.booking_reference || booking.invoice_number || booking.id,
          roomName: booking.room?.name || 'Your room',
          checkIn: checkIn ? new Date(checkIn).toLocaleDateString('en-US', { dateStyle: 'long' }) : '',
          checkOut: checkOut ? new Date(checkOut).toLocaleDateString('en-US', { dateStyle: 'long' }) : '',
          guests: booking.num_guests || 1,
          nights,
          totalPrice: `VT ${Number(booking.total_price || 0).toLocaleString()}`,
          specialRequests: booking.special_requests || undefined,
          bookingId: booking.id,
        }, changed.join(', ')).catch(() => {})
      }
    } catch {
      // Notification failures must never block the booking update
    }

    return NextResponse.json({ booking })
  } catch {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
