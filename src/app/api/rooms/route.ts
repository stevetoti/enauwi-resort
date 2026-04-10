import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

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

    const allRoomsWithStatus = []
    const bookedRoomIds = new Set<string>()

    for (const room of rooms || []) {
      // Check for conflicting bookings (overlap: existing check_in < searchCheckOut AND existing check_out > searchCheckIn)
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', room.id)
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)

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

      allRoomsWithStatus.push({
        ...room,
        price_vt: price,
        is_booked: isBooked,
        active_discount: isBooked ? null : discount,
        discounted_price: !isBooked && discount
          ? Math.round(price * (1 - discount.discount_percent / 100))
          : null,
      })
    }

    // Sort: available rooms first, then booked
    allRoomsWithStatus.sort((a, b) => (a.is_booked === b.is_booked ? 0 : a.is_booked ? 1 : -1))

    // Calculate availability counts by room type
    const typeCounts: Record<string, { total: number; available: number }> = {}
    for (const room of allRooms || []) {
      const type = room.type || room.name
      if (!typeCounts[type]) typeCounts[type] = { total: 0, available: 0 }
      typeCounts[type].total++
      if (!bookedRoomIds.has(room.id)) typeCounts[type].available++
    }

    const availableCount = allRoomsWithStatus.filter(r => !r.is_booked).length

    return NextResponse.json({
      rooms: allRoomsWithStatus,
      availability: typeCounts,
      totalRooms: allRooms?.length || 0,
      availableCount,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST — create a new room (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { name, type, description, price_vt, max_guests, amenities, bed_config, images, tagline } = body

    if (!name || !price_vt) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
    }

    // Build insert object with only the fields that have values
    const insertData: Record<string, unknown> = {
      name,
      type: type || 'bungalow',
      description: description || '',
      price_vt,
      max_guests: max_guests || 2,
      amenities: amenities || [],
      images: images || [],
      available: true,
    }
    // Optional columns (may not exist in all environments)
    if (bed_config) insertData.bed_config = bed_config
    if (tagline) insertData.tagline = tagline

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // If column doesn't exist, retry without optional fields
      if (error.message?.includes('column') && (error.message?.includes('bed_config') || error.message?.includes('tagline'))) {
        delete insertData.bed_config
        delete insertData.tagline
        const { data: retryData, error: retryError } = await supabaseAdmin
          .from('rooms')
          .insert(insertData)
          .select()
          .single()
        if (retryError) throw retryError
        return NextResponse.json(retryData, { status: 201 })
      }
      throw error
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create room'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH — update a room (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}
