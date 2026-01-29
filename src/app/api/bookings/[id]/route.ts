import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabase()
    const { id } = params
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'checked_in', 'checked_out']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get current booking to verify it exists and can be updated
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if cancellation is allowed
    if (status === 'cancelled') {
      if (currentBooking.status === 'checked_in' || currentBooking.status === 'checked_out') {
        return NextResponse.json(
          { error: 'Cannot cancel a booking that has already been checked in' },
          { status: 400 }
        )
      }

      // Check if it's within 24 hours of check-in
      const checkInDate = new Date(currentBooking.check_in)
      const now = new Date()
      const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
        return NextResponse.json(
          { error: 'Cannot cancel within 24 hours of check-in' },
          { status: 400 }
        )
      }
    }

    // Update the booking
    const { data: booking, error: updateError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}