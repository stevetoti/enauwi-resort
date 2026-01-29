import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
// Room type used in response

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabase()
    const { searchParams } = new URL(request.url)
    
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '1')

    // Get all available rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('available', true)
      .gte('max_guests', guests)
      .order('price_vt')

    if (roomsError) {
      throw roomsError
    }

    // If dates are provided, filter by availability
    if (checkIn && checkOut) {
      const availableRooms = []
      
      for (const room of rooms) {
        // Check for conflicting bookings
        const { data: conflicts, error: conflictsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('room_id', room.id)
          .in('status', ['confirmed', 'checked_in'])
          .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

        if (conflictsError) {
          throw conflictsError
        }

        // Check room_availability for specific date overrides
        const { data: availability, error: availabilityError } = await supabase
          .from('room_availability')
          .select('*')
          .eq('room_id', room.id)
          .gte('date', checkIn)
          .lte('date', checkOut)
          .eq('available', false)

        if (availabilityError) {
          throw availabilityError
        }

        // If no conflicts and no unavailable dates, room is available
        if (conflicts.length === 0 && availability.length === 0) {
          // Check for price overrides
          const { data: priceOverrides } = await supabase
            .from('room_availability')
            .select('price_override')
            .eq('room_id', room.id)
            .gte('date', checkIn)
            .lte('date', checkOut)
            .not('price_override', 'is', null)

          // Use price override if available
          const price = priceOverrides?.[0]?.price_override || room.price_vt
          availableRooms.push({ ...room, price_vt: price })
        }
      }

      return NextResponse.json({ rooms: availableRooms })
    }

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}