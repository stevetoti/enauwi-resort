import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { generateBookingReference, getDaysBetween } from '@/lib/utils'

// POST — create a group booking (multiple rooms in one transaction)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const {
      group_name,
      check_in,
      check_out,
      guest_name,
      guest_email,
      guest_phone,
      special_requests,
      notes,
      room_ids, // array of room IDs
      guests_per_room, // optional: array matching room_ids
      payment_method = 'property',
    } = body

    if (!group_name || !check_in || !check_out || !guest_name || !guest_email || !room_ids || !Array.isArray(room_ids) || room_ids.length === 0) {
      return NextResponse.json({ error: 'group_name, dates, contact info, and at least one room are required' }, { status: 400 })
    }

    // Validate dates
    if (new Date(check_out) <= new Date(check_in)) {
      return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
    }

    const nights = getDaysBetween(check_in, check_out)

    // Check availability for ALL rooms
    const conflicts: string[] = []
    for (const roomId of room_ids) {
      const { data: roomConflicts } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['pending', 'confirmed', 'checked_in'])
        .lt('check_in', check_out)
        .gt('check_out', check_in)

      if (roomConflicts && roomConflicts.length > 0) {
        const { data: room } = await supabaseAdmin.from('rooms').select('name').eq('id', roomId).single()
        conflicts.push(room?.name || roomId)
      }
    }

    if (conflicts.length > 0) {
      return NextResponse.json({
        error: `These rooms are not available: ${conflicts.join(', ')}`
      }, { status: 409 })
    }

    // Fetch room details for pricing
    const { data: rooms } = await supabaseAdmin
      .from('rooms')
      .select('id, name, price_vt')
      .in('id', room_ids)

    if (!rooms || rooms.length !== room_ids.length) {
      return NextResponse.json({ error: 'Some rooms not found' }, { status: 404 })
    }

    // Generate one group ID for all bookings
    const groupId = crypto.randomUUID()

    // Create one booking per room
    const bookingsToCreate = room_ids.map((roomId: string, idx: number) => {
      const room = rooms.find(r => r.id === roomId)
      const numGuests = guests_per_room?.[idx] || 2
      const totalPrice = (room?.price_vt || 0) * nights
      const reference = generateBookingReference()

      return {
        room_id: roomId,
        guest_name,
        guest_email,
        guest_phone: guest_phone || null,
        check_in,
        check_out,
        num_guests: numGuests,
        total_price: totalPrice,
        base_price: totalPrice,
        discount_percent: 0,
        discount_amount: 0,
        payment_method,
        payment_status: 'unpaid',
        booking_reference: reference,
        special_requests: special_requests || null,
        notes: notes || null,
        status: 'confirmed', // admin-created group bookings are auto-confirmed
        group_id: groupId,
        group_name,
        is_group_lead: idx === 0,
      }
    })

    const { data: createdBookings, error } = await supabaseAdmin
      .from('bookings')
      .insert(bookingsToCreate)
      .select('*, room:rooms(*)')

    if (error) throw error

    return NextResponse.json({
      success: true,
      group_id: groupId,
      group_name,
      bookings: createdBookings,
      total_rooms: createdBookings?.length || 0,
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create group booking'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET — fetch a group's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('group_id')

    if (!groupId) {
      return NextResponse.json({ error: 'group_id is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('group_id', groupId)
      .order('is_group_lead', { ascending: false })

    if (error) throw error

    return NextResponse.json({ bookings: data || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 })
  }
}
