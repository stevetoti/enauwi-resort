import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET discounts — public for booking page, filtered by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date') // check if discount is active on this date
    const activeOnly = searchParams.get('active') !== 'false'

    let query = supabaseAdmin
      .from('room_discounts')
      .select('*')
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    if (roomId) {
      // Get discounts for specific room OR resort-wide (null room_id)
      query = query.or(`room_id.eq.${roomId},room_id.is.null`)
    }

    if (date) {
      query = query.lte('start_date', date).gte('end_date', date)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}

// POST — create a new discount (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { room_id, name, discount_percent, start_date, end_date, applies_to, min_nights } = body

    if (!name || !discount_percent || !start_date || !end_date) {
      return NextResponse.json({ error: 'Name, discount_percent, start_date, and end_date are required' }, { status: 400 })
    }

    if (discount_percent < 1 || discount_percent > 100) {
      return NextResponse.json({ error: 'Discount must be between 1% and 100%' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('room_discounts')
      .insert({
        room_id: room_id || null,
        name,
        discount_percent,
        start_date,
        end_date,
        applies_to: applies_to || 'all',
        min_nights: min_nights || 1,
        created_by: session.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}

// PATCH — update a discount
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('room_discounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 })
  }
}

// DELETE — remove a discount
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Discount ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('room_discounts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 })
  }
}
