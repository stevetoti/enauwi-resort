import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceSupabase()
    const { searchParams } = new URL(request.url)

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '1')
    const includeAll = searchParams.get('includeAll') === 'true' // For reservation board

    // Get all rooms (or only available ones)
    let roomQuery = supabase
      .from('rooms')
      .select('*')
      .order('price_vt')

    if (!includeAll) {
      roomQuery = roomQuery.eq('available', true).gte('max_guests', guests)
    }

    const { data: rooms, error: roomsError } = await roomQuery
    if (roomsError) throw roomsError

    // If no dates, return rooms with availability count
    if (!checkIn || !checkOut) {
      // Count how many of each room type are available
      const roomsWithAvailability = await Promise.all(
        (rooms || []).map(async (room) => {
          // Get active discount for today
          const today = new Date().toISOString().split('T')[0]
          const { data: discounts } = await supabase
            .from('room_discounts')
            .select('name, discount_percent')
            .eq('is_active', true)
            .lte('start_date', today)
            .gte('end_date', today)
            .or(`room_id.eq.${room.id},room_id.is.null`)
            .order('discount_percent', { ascending: false })
            .limit(1)

          const discount = discounts?.[0] || null

          return {
            ...room,
            active_discount: discount,
            discounted_price: discount
              ? Math.round(room.price_vt * (1 - discount.discount_percent / 100))
              : null,
          }
        })
      )

      return NextResponse.json({ rooms: roomsWithAvailability })
    }

    // With dates: filter by availability and add counts
    // First get ALL rooms of each type to count total
    const { data: allRooms } = await supabase
      .from('rooms')
      .select('id, name, type')
      .eq('available', true)

    const availableRooms = []
    const bookedRoomIds = new Set<string>()

    for (const room of rooms || []) {
      // Check for conflicting bookings
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', room.id)
        .in('status', ['confirmed', 'checked_in'])
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`)

      // Check room_availability for specific date overrides
      const { data: unavailableDates } = await supabase
        .from('room_availability')
        .select('id')
        .eq('room_id', room.id)
        .gte('date', checkIn)
        .lte('date', checkOut)
        .eq('available', false)

      const isBooked = (conflicts && conflicts.length > 0) || (unavailableDates && unavailableDates.length > 0)

      if (isBooked) {
        bookedRoomIds.add(room.id)
        continue
      }

      // Check for price overrides
      const { data: priceOverrides } = await supabase
        .from('room_availability')
        .select('price_override')
        .eq('room_id', room.id)
        .gte('date', checkIn)
        .lte('date', checkOut)
        .not('price_override', 'is', null)

      const price = priceOverrides?.[0]?.price_override || room.price_vt

      // Get active discount for the check-in date
      const { data: discounts } = await supabase
        .from('room_discounts')
        .select('name, discount_percent')
        .eq('is_active', true)
        .lte('start_date', checkIn)
        .gte('end_date', checkOut)
        .or(`room_id.eq.${room.id},room_id.is.null`)
        .order('discount_percent', { ascending: false })
        .limit(1)

      const discount = discounts?.[0] || null

      availableRooms.push({
        ...room,
        price_vt: price,
        active_discount: discount,
        discounted_price: discount
          ? Math.round(price * (1 - discount.discount_percent / 100))
          : null,
      })
    }

    // Calculate availability counts by room type
    const typeCounts: Record<string, { total: number; available: number }> = {}
    for (const room of allRooms || []) {
      const type = room.type || room.name
      if (!typeCounts[type]) typeCounts[type] = { total: 0, available: 0 }
      typeCounts[type].total++
      if (!bookedRoomIds.has(room.id)) typeCounts[type].available++
    }

    return NextResponse.json({
      rooms: availableRooms,
      availability: typeCounts,
      totalRooms: allRooms?.length || 0,
      availableCount: availableRooms.length,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
