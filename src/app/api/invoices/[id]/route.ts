import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// PATCH — update payment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()

    // ── Full edit of a manual/quote document (fields + line items) ──
    if (body.action === 'edit' && Array.isArray(body.items)) {
      const guestName = String(body.guest_name || '').trim()
      if (!guestName) {
        return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
      }
      const items = (body.items as Array<Record<string, unknown>>)
        .map((it) => {
          const description = String(it.description || '').trim()
          const quantity = Number(it.quantity) || 0
          const unit_price = Number(it.unit_price) || 0
          return { description, quantity, unit_price, total: Math.round(quantity * unit_price) }
        })
        .filter((it) => it.description.length > 0)
      if (items.length === 0) {
        return NextResponse.json({ error: 'At least one line item with a description is required' }, { status: 400 })
      }
      const baseTotal = items.reduce((s, it) => s + it.total, 0)
      const discountPercent = Number(body.discount_percent) || 0
      const discountAmount = Math.round(baseTotal * discountPercent / 100)
      const subtotal = baseTotal - discountAmount
      const paymentStatus = body.payment_status ? String(body.payment_status) : 'unpaid'

      const { error: updErr } = await supabaseAdmin
        .from('invoices')
        .update({
          guest_name: guestName,
          guest_email: body.guest_email ? String(body.guest_email) : '',
          guest_phone: body.guest_phone ? String(body.guest_phone) : null,
          discount_percent: discountPercent,
          discount_amount: discountAmount,
          base_total: baseTotal,
          subtotal,
          total: subtotal,
          payment_method: body.payment_method ? String(body.payment_method) : 'property',
          payment_status: paymentStatus,
          notes: body.notes ? String(body.notes) : null,
          ...(paymentStatus === 'paid' ? { paid_at: new Date().toISOString() } : {}),
        })
        .eq('id', params.id)
      if (updErr) throw updErr

      // Replace the line items
      await supabaseAdmin.from('invoice_items').delete().eq('invoice_id', params.id)
      await supabaseAdmin.from('invoice_items').insert(
        items.map((it) => ({
          invoice_id: params.id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total: it.total,
          item_type: 'custom',
        }))
      )

      const { data: full } = await supabaseAdmin
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('id', params.id)
        .single()
      return NextResponse.json(full)
    }

    const updates: Record<string, unknown> = {}

    if (body.payment_status) {
      updates.payment_status = body.payment_status
      if (body.payment_status === 'paid') {
        updates.paid_at = new Date().toISOString()
      }
    }
    if (body.notes !== undefined) updates.notes = body.notes

    // Quote status changes (sent / accepted / declined)
    if (body.quote_status) {
      updates.quote_status = body.quote_status
    }

    // Convert a quote into an invoice: assign a fresh ENW number + flip type
    if (body.action === 'convert_to_invoice') {
      const { data: counter } = await supabaseAdmin
        .from('invoice_counter')
        .select('last_number')
        .eq('id', 1)
        .single()
      const nextNumber = (counter?.last_number || 0) + 1
      await supabaseAdmin.from('invoice_counter').update({ last_number: nextNumber }).eq('id', 1)
      updates.invoice_number = `ENW-${String(nextNumber).padStart(5, '0')}`
      updates.doc_type = 'invoice'
      updates.quote_status = 'converted'
    }

    const { data, error } = await supabaseAdmin
      .from('invoices')
      .update(updates)
      .eq('id', params.id)
      .select('*, items:invoice_items(*)')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (e) {
    const detail = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? JSON.stringify(e))
    console.error('[invoice PATCH] failed:', detail)
    return NextResponse.json({ error: 'Failed to update invoice', detail }, { status: 500 })
  }
}
