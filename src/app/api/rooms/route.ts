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

    const roomList = rooms || []
    const roomIds = roomList.map((r) => r.id)

    // Best active discount per room (room-specific or resort-wide), one query for all rooms.
    type Discount = { name: string; discount_percent: number }
    const discountFor = (
      rows: { room_id: string | null; name: string; discount_percent: number }[],
      roomId: string
    ): Discount | null => {
      let best: Discount | null = null
      for (const d of rows) {
        if (d.room_id !== null && d.room_id !== roomId) continue
        if (!best || d.discount_percent > best.discount_percent) best = { name: d.name, discount_percent: d.discount_percent }
      }
      return best
    }
    const discountsQuery = (from: string, to: string) =>
      roomIds.length
        ? supabase
            .from('room_discounts')
            .select('room_id, name, discount_percent')
            .eq('is_active', true)
            .lte('start_date', from)
            .gte('end_date', to)
            .or(`room_id.in.(${roomIds.join(',')}),room_id.is.null`)
        : Promise.resolve({ data: [] as { room_id: string | null; name: string; discount_percent: number }[], error: null })

    // If no dates, return rooms with today's discount
    if (!checkIn || !checkOut) {
      const today = new Date().toISOString().split('T')[0]
      const { data: discountRows, error: discountError } = await discountsQuery(today, today)
      if (discountError) throw discountError
      const roomsWithAvailability = roomList.map((room) => {
        const discount = discountFor(discountRows || [], room.id)
        return {
          ...room,
          active_discount: discount,
          discounted_price: discount
            ? Math.round(room.price_vt * (1 - discount.discount_percent / 100))
            : null,
        }
      })
      return NextResponse.json({ rooms: roomsWithAvailability })
    }

    // With dates: 4 queries for all rooms, in parallel (was 4 sequential queries PER room).
    const [allRoomsRes, conflictsRes, availabilityRes, discountsRes] = await Promise.all([
      supabase.from('rooms').select('id, name, type').eq('available', true),
      // Overlap: existing check_in < searchCheckOut AND existing check_out > searchCheckIn
      roomIds.length
        ? supabase
            .from('bookings')
            .select('room_id')
            .in('room_id', roomIds)
            .in('status', ['pending', 'confirmed', 'checked_in'])
            .lt('check_in', checkOut)
            .gt('check_out', checkIn)
        : Promise.resolve({ data: [] as { room_id: string }[], error: null }),
      // Date overrides (blocked dates + price overrides) in the stay range
      roomIds.length
        ? supabase
            .from('room_availability')
            .select('room_id, date, available, price_override')
            .in('room_id', roomIds)
            .gte('date', checkIn)
            .lte('date', checkOut)
            .order('date')
        : Promise.resolve({ data: [] as { room_id: string; date: string; available: boolean | null; price_override: number | null }[], error: null }),
      discountsQuery(checkIn, checkOut),
    ])
    for (const r of [allRoomsRes, conflictsRes, availabilityRes, discountsRes]) {
      if (r.error) throw r.error
    }
    const allRooms = allRoomsRes.data

    const bookedRoomIds = new Set<string>()
    for (const c of conflictsRes.data || []) bookedRoomIds.add(c.room_id)
    const priceOverride = new Map<string, number>()
    for (const row of availabilityRes.data || []) {
      if (row.available === false) bookedRoomIds.add(row.room_id)
      if (row.price_override != null && !priceOverride.has(row.room_id)) priceOverride.set(row.room_id, row.price_override)
    }

    const allRoomsWithStatus = roomList.map((room) => {
      const isBooked = bookedRoomIds.has(room.id)
      const price = priceOverride.get(room.id) || room.price_vt
      const discount = discountFor(discountsRes.data || [], room.id)
      return {
        ...room,
        price_vt: price,
        is_booked: isBooked,
        active_discount: isBooked ? null : discount,
        discounted_price: !isBooked && discount
          ? Math.round(price * (1 - discount.discount_percent / 100))
          : null,
      }
    })

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
