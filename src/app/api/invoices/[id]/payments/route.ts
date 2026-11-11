import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { canManageInvoices, paidAmount, statusFor } from '@/lib/invoice-payments'

// Part payments / deposits on an invoice (Marketing request, 11 Nov 2026).

const FULL = '*, items:invoice_items(*), payments:invoice_payments(*)'

function errorDetail(e: unknown): string {
  return e instanceof Error ? e.message : ((e as { message?: string })?.message ?? JSON.stringify(e))
}

async function loadInvoice(id: string) {
  const { data } = await supabaseAdmin
    .from('invoices')
    .select('id, total, amount_paid, payment_status, doc_type, voided')
    .eq('id', id)
    .single()
  return data as { id: string; total: number; amount_paid: number | null; payment_status: string; doc_type?: string; voided?: boolean } | null
}

async function fullInvoice(id: string) {
  const { data } = await supabaseAdmin.from('invoices').select(FULL).eq('id', id).single()
  return data
}

// GET — payment history (oldest first)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  const { data, error } = await supabaseAdmin
    .from('invoice_payments')
    .select('*')
    .eq('invoice_id', params.id)
    .order('paid_at', { ascending: true })
  if (error) return NextResponse.json({ error: 'Failed to load payments', detail: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

// POST — record a payment { amount, method, paid_at?, received_by?, received_by_name?, note? }
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const amount = Math.round(Number(body.amount))
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Enter an amount greater than zero' }, { status: 400 })
    }

    const inv = await loadInvoice(params.id)
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    if ((inv.doc_type || 'invoice') !== 'invoice') {
      return NextResponse.json({ error: 'Payments can only be recorded on invoices, not quotations' }, { status: 400 })
    }
    if (inv.voided) return NextResponse.json({ error: 'This invoice is void' }, { status: 400 })

    const already = paidAmount(inv)
    const outstanding = Math.max(0, inv.total - already)
    if (outstanding === 0) {
      return NextResponse.json({ error: 'This invoice is already paid in full' }, { status: 400 })
    }
    if (amount > outstanding) {
      return NextResponse.json(
        { error: `The amount is more than the outstanding balance of VT ${outstanding.toLocaleString('en-US')}` },
        { status: 400 }
      )
    }

    let paidAt = new Date().toISOString()
    if (body.paid_at && /^\d{4}-\d{2}-\d{2}$/.test(String(body.paid_at))) {
      const today = new Date().toISOString().slice(0, 10)
      // a date picked for today keeps the current time; earlier dates are stored at noon
      paidAt = String(body.paid_at) === today ? paidAt : `${body.paid_at}T12:00:00+11:00`
    }

    const { error: insErr } = await supabaseAdmin.from('invoice_payments').insert({
      invoice_id: params.id,
      amount,
      method: body.method ? String(body.method) : null,
      paid_at: paidAt,
      received_by: body.received_by || null,
      received_by_name: body.received_by_name ? String(body.received_by_name) : null,
      note: body.note ? String(body.note).slice(0, 500) : null,
    })
    if (insErr) throw insErr

    const newPaid = already + amount
    const status = statusFor(newPaid, inv.total)
    const { error: updErr } = await supabaseAdmin
      .from('invoices')
      .update({
        amount_paid: newPaid,
        payment_status: status,
        ...(body.method ? { payment_method: String(body.method) } : {}),
        ...(body.received_by_name ? { received_by: body.received_by || null, received_by_name: String(body.received_by_name) } : {}),
        ...(status === 'paid' ? { paid_at: paidAt } : {}),
      })
      .eq('id', params.id)
    if (updErr) throw updErr

    return NextResponse.json(await fullInvoice(params.id), { status: 201 })
  } catch (e) {
    const detail = errorDetail(e)
    console.error('[invoice payments POST] failed:', detail)
    return NextResponse.json({ error: 'Failed to record payment', detail }, { status: 500 })
  }
}

// DELETE ?paymentId= — remove a payment entered by mistake (managers only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session
    if (!canManageInvoices(session)) {
      return NextResponse.json({ error: 'Not authorised to remove payments' }, { status: 403 })
    }
    const paymentId = new URL(request.url).searchParams.get('paymentId')
    if (!paymentId) return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })

    const { data: pay } = await supabaseAdmin
      .from('invoice_payments')
      .select('id, amount')
      .eq('id', paymentId)
      .eq('invoice_id', params.id)
      .single()
    if (!pay) return NextResponse.json({ error: 'Payment not found' }, { status: 404 })

    const inv = await loadInvoice(params.id)
    if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const { error: delErr } = await supabaseAdmin.from('invoice_payments').delete().eq('id', paymentId)
    if (delErr) throw delErr

    const newPaid = Math.max(0, paidAmount(inv) - pay.amount)
    const status = statusFor(newPaid, inv.total)
    const { error: updErr } = await supabaseAdmin
      .from('invoices')
      .update({ amount_paid: newPaid, payment_status: status, ...(status !== 'paid' ? { paid_at: null } : {}) })
      .eq('id', params.id)
    if (updErr) throw updErr

    return NextResponse.json(await fullInvoice(params.id))
  } catch (e) {
    const detail = errorDetail(e)
    console.error('[invoice payments DELETE] failed:', detail)
    return NextResponse.json({ error: 'Failed to remove payment', detail }, { status: 500 })
  }
}
