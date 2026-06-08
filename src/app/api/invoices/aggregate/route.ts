import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET /api/invoices/aggregate?name=...&email=...
// Gathers all of a guest's services (accommodation + restaurant + services)
// into draft line items for a single Combined Customer Invoice.
// Matching is by guest name/email; staff review the result before creating.
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const name = (searchParams.get('name') || '').trim()
    const email = (searchParams.get('email') || '').trim()

    if (!name && !email) {
      return NextResponse.json({ error: 'Provide a guest name or email' }, { status: 400 })
    }

    const items: { description: string; quantity: number; unit_price: number; total: number; source: string }[] = []
    let guestName = name
    let guestEmail = email

    const fmtDate = (d?: string | null) => (d ? String(d).split('T')[0] : '')

    // 1. Accommodation — bookings
    try {
      let q = supabaseAdmin
        .from('bookings')
        .select('guest_name, guest_email, total_price, check_in, check_out, status, room:rooms(name)')
        .neq('status', 'cancelled')
      if (email) q = q.eq('guest_email', email)
      else q = q.ilike('guest_name', `%${name}%`)
      const { data } = await q
      for (const b of (data || []) as Record<string, unknown>[]) {
        const room = Array.isArray(b.room) ? b.room[0] : b.room
        const roomName = (room as { name?: string } | null)?.name || 'Accommodation'
        const price = Number(b.total_price) || 0
        if (!guestName) guestName = String(b.guest_name || '')
        if (!guestEmail) guestEmail = String(b.guest_email || '')
        items.push({
          description: `Accommodation — ${roomName} (${fmtDate(b.check_in as string)} to ${fmtDate(b.check_out as string)})`,
          quantity: 1,
          unit_price: price,
          total: price,
          source: 'accommodation',
        })
      }
    } catch { /* table/column may differ — skip */ }

    // 2. Restaurant — orders
    try {
      const q = supabaseAdmin
        .from('orders')
        .select('order_number, room_number, total_amount, guest_name')
        .ilike('guest_name', `%${guestName || name}%`)
      const { data } = await q
      for (const o of (data || []) as Record<string, unknown>[]) {
        const amt = Number(o.total_amount) || 0
        items.push({
          description: `Restaurant order #${o.order_number ?? ''}${o.room_number ? ` (Room ${o.room_number})` : ''}`,
          quantity: 1,
          unit_price: amt,
          total: amt,
          source: 'restaurant',
        })
      }
    } catch { /* skip */ }

    // 3. Services / events — service_orders
    try {
      let q = supabaseAdmin
        .from('service_orders')
        .select('quantity, unit_price, total_price, guest_name, guest_email, service:services(name)')
      if (email) q = q.eq('guest_email', email)
      else q = q.ilike('guest_name', `%${name}%`)
      const { data } = await q
      for (const s of (data || []) as Record<string, unknown>[]) {
        const svc = Array.isArray(s.service) ? s.service[0] : s.service
        const svcName = (svc as { name?: string } | null)?.name || 'Service'
        const qty = Number(s.quantity) || 1
        const unit = Number(s.unit_price) || 0
        items.push({
          description: `${svcName}`,
          quantity: qty,
          unit_price: unit,
          total: Number(s.total_price) || qty * unit,
          source: 'service',
        })
      }
    } catch { /* skip */ }

    return NextResponse.json({ guest_name: guestName, guest_email: guestEmail, items })
  } catch {
    return NextResponse.json({ error: 'Failed to aggregate guest services' }, { status: 500 })
  }
}
