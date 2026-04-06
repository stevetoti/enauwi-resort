import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET single tab
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { data, error } = await supabaseAdmin
      .from('pos_orders')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Tab not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tab' }, { status: 500 })
  }
}

// PATCH — update tab (add items, change details, close tab)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    // Add items to existing tab
    if (body.add_items && Array.isArray(body.add_items)) {
      // Fetch current items
      const { data: current } = await supabaseAdmin
        .from('pos_orders')
        .select('items')
        .eq('id', params.id)
        .single()

      const existingItems = (current?.items as Array<{ id?: string; name: string; price: number; quantity: number }>) || []

      // Merge: if same item exists, increase quantity; otherwise add new
      const mergedItems = [...existingItems]
      for (const newItem of body.add_items) {
        const existing = mergedItems.find((i) => i.name === newItem.name && i.price === newItem.price)
        if (existing) {
          existing.quantity += newItem.quantity
        } else {
          mergedItems.push(newItem)
        }
      }

      updates.items = mergedItems
      const newTotal = mergedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      updates.subtotal = newTotal
      updates.total = newTotal
    }

    // Replace all items
    if (body.items && !body.add_items) {
      updates.items = body.items
      const newTotal = body.items.reduce((sum: number, item: { price: number; quantity: number }) =>
        sum + (item.price * item.quantity), 0)
      updates.subtotal = newTotal
      updates.total = newTotal
    }

    // Close tab (process payment)
    if (body.close === true) {
      updates.tab_status = 'closed'
      updates.closed_at = new Date().toISOString()
      updates.payment_status = 'paid'
      if (body.payment_method) updates.payment_method = body.payment_method
      if (body.guest_name) updates.guest_name = body.guest_name

      // Record finance transaction
      const { data: tab } = await supabaseAdmin
        .from('pos_orders')
        .select('total, order_number')
        .eq('id', params.id)
        .single()

      if (tab && body.payment_method !== 'room_charge') {
        await supabaseAdmin.from('finance_transactions').insert({
          date: new Date().toISOString().split('T')[0],
          category: 'Restaurant',
          subcategory: 'POS Sale',
          amount: body.total || tab.total,
          type: 'income',
          description: `Tab closed - Order #${tab.order_number}`,
          payment_method: body.payment_method || 'cash',
          created_by: session.id,
        })
      }
    }

    // Other field updates
    if (body.tab_name !== undefined) updates.tab_name = body.tab_name
    if (body.guest_name !== undefined) updates.guest_name = body.guest_name
    if (body.table_number !== undefined) updates.table_number = body.table_number
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.send_to_kitchen !== undefined) updates.send_to_kitchen = body.send_to_kitchen

    const { data, error } = await supabaseAdmin
      .from('pos_orders')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to update tab' }, { status: 500 })
  }
}

// DELETE — remove a tab
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { error } = await supabaseAdmin
      .from('pos_orders')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete tab' }, { status: 500 })
  }
}
