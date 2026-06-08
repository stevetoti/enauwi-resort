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
  } catch {
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
