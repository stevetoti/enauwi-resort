import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET all tabs (open by default, or all)
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'
    const today = searchParams.get('today') === 'true'

    let query = supabaseAdmin
      .from('pos_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('tab_status', status)
    }

    if (today) {
      const todayStr = new Date().toISOString().split('T')[0]
      query = query.gte('created_at', `${todayStr}T00:00:00`)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tabs' }, { status: 500 })
  }
}

// POST — open a new tab
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { tab_name, guest_name, table_number, room_id, booking_id, items, send_to_kitchen } = body

    if (!tab_name && !guest_name && !table_number) {
      return NextResponse.json({ error: 'Tab name, guest name, or table number is required' }, { status: 400 })
    }

    // Calculate totals from items
    const parsedItems = items || []
    const subtotal = parsedItems.reduce((sum: number, item: { price: number; quantity: number }) =>
      sum + (item.price * item.quantity), 0)

    const { data, error } = await supabaseAdmin
      .from('pos_orders')
      .insert({
        tab_name: tab_name || guest_name || `Table ${table_number}`,
        tab_status: 'open',
        guest_name: guest_name || null,
        table_number: table_number || null,
        room_id: room_id || null,
        booking_id: booking_id || null,
        items: parsedItems,
        subtotal,
        tax: 0,
        total: subtotal,
        payment_status: 'pending',
        payment_method: null,
        send_to_kitchen: send_to_kitchen || false,
        served_by: session.id,
        opened_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // If send_to_kitchen, also create an entry in the orders table for kitchen display
    if (send_to_kitchen && parsedItems.length > 0) {
      await sendToKitchen(data.id, guest_name || tab_name || `Table ${table_number}`, table_number, parsedItems, subtotal)
    }

    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to open tab' }, { status: 500 })
  }
}

// Helper: send items to kitchen via the orders table
async function sendToKitchen(posOrderId: string, guestName: string, tableNumber: string | null, items: Array<{ id?: string; name: string; price: number; quantity: number }>, total: number) {
  // Create order in the guest orders table (which the kitchen display reads)
  const { data: order } = await supabaseAdmin
    .from('orders')
    .insert({
      guest_name: guestName,
      room_number: tableNumber || 'POS',
      status: 'pending',
      delivery_location: 'restaurant',
      total_amount: total,
      special_instructions: `POS Order (Tab #${posOrderId.slice(0, 8)})`,
    })
    .select('id')
    .single()

  if (!order) return

  // Add order items
  for (const item of items) {
    await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      menu_item_id: item.id || null,
      quantity: item.quantity,
      unit_price: item.price,
      notes: null,
    })
  }
}
