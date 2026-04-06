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
