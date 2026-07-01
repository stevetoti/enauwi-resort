import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// ── Next sequential invoice number (ENW-00001) ──────────────────
async function nextInvoiceNumber(): Promise<string> {
  const { data: counter } = await supabaseAdmin
    .from('invoice_counter')
    .select('last_number')
    .eq('id', 1)
    .single()

  const nextNumber = (counter?.last_number || 0) + 1
  await supabaseAdmin.from('invoice_counter').update({ last_number: nextNumber }).eq('id', 1)
  return `ENW-${String(nextNumber).padStart(5, '0')}`
}

// ── Next sequential quotation number (QUO-00001) ────────────────
async function nextQuoteNumber(): Promise<string> {
  const { data: counter } = await supabaseAdmin
    .from('quote_counter')
    .select('last_number')
    .eq('id', 1)
    .single()

  const nextNumber = (counter?.last_number || 0) + 1
  await supabaseAdmin.from('quote_counter').update({ last_number: nextNumber }).eq('id', 1)
  return `QUO-${String(nextNumber).padStart(5, '0')}`
}

// ── Create a manual invoice (no booking) from custom line items ──
async function createManualInvoice(body: Record<string, unknown>): Promise<NextResponse> {
  const guestName = String(body.guest_name || '').trim()
  if (!guestName) {
    return NextResponse.json({ error: 'Guest name is required' }, { status: 400 })
  }

  const rawItems = body.items as Array<Record<string, unknown>>
  const items = rawItems
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

  const baseTotal = items.reduce((sum, it) => sum + it.total, 0)
  const discountPercent = Number(body.discount_percent) || 0
  const discountAmount = Math.round(baseTotal * discountPercent / 100)
  const subtotal = baseTotal - discountAmount
  const total = subtotal // Vanuatu has no VAT

  const isQuote = body.doc_type === 'quote'
  const documentNumber = isQuote ? await nextQuoteNumber() : await nextInvoiceNumber()

  const insertData: Record<string, unknown> = {
    booking_id: null,
    invoice_number: documentNumber,
    guest_name: guestName,
    guest_email: body.guest_email ? String(body.guest_email) : null,
    guest_phone: body.guest_phone ? String(body.guest_phone) : null,
    room_name: body.room_name ? String(body.room_name) : null,
    check_in: body.check_in ? String(body.check_in) : null,
    check_out: body.check_out ? String(body.check_out) : null,
    num_nights: body.num_nights ? Number(body.num_nights) : null,
    num_guests: body.num_guests ? Number(body.num_guests) : null,
    base_rate: null,
    base_total: baseTotal,
    discount_name: body.discount_name ? String(body.discount_name) : null,
    discount_percent: discountPercent,
    discount_amount: discountAmount,
    subtotal,
    tax_percent: 0,
    tax_amount: 0,
    total,
    payment_method: body.payment_method ? String(body.payment_method) : 'property',
    payment_status: body.payment_status ? String(body.payment_status) : 'unpaid',
    notes: body.notes ? String(body.notes) : null,
    special_requests: null,
  }
  // Only set quote-specific columns for quotes, so invoice creation is
  // unaffected if the quotations migration hasn't been run yet.
  if (isQuote) {
    insertData.doc_type = 'quote'
    insertData.quote_status = 'draft'
    if (body.valid_until) insertData.valid_until = String(body.valid_until)
  }

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from('invoices')
    .insert(insertData)
    .select()
    .single()

  if (invoiceError) throw invoiceError

  await supabaseAdmin.from('invoice_items').insert(
    items.map((it) => ({
      invoice_id: invoice.id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      total: it.total,
      item_type: 'custom',
    }))
  )

  const { data: fullInvoice } = await supabaseAdmin
    .from('invoices')
    .select('*, items:invoice_items(*)')
    .eq('id', invoice.id)
    .single()

  return NextResponse.json(fullInvoice, { status: 201 })
}

// GET invoices
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const search = searchParams.get('search')
    const docType = searchParams.get('doc_type') || 'invoice' // 'invoice' | 'quote'

    let query = supabaseAdmin
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .order('created_at', { ascending: false })

    if (bookingId) {
      query = query.eq('booking_id', bookingId)
    }

    if (search) {
      query = query.or(`guest_name.ilike.%${search}%,invoice_number.ilike.%${search}%,guest_email.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    // Filter by document type in JS so the list still works before the
    // quotations migration adds the doc_type column (missing → treated as 'invoice').
    const filtered = (data || []).filter(
      (row: { doc_type?: string }) => (row.doc_type || 'invoice') === docType
    )

    return NextResponse.json(filtered)
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error('[invoices GET] failed:', detail)
    return NextResponse.json({ error: 'Failed to fetch invoices', detail }, { status: 500 })
  }
}

// POST — generate invoice from a booking
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()

    // ── Manual invoice (no booking) — custom line items ──────────
    if (Array.isArray(body.items) && body.items.length > 0) {
      return await createManualInvoice(body)
    }

    const booking_id = body.booking_id
    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    // Fetch booking with room details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, room:rooms(*)')
      .eq('id', booking_id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if invoice already exists
    const { data: existing } = await supabaseAdmin
      .from('invoices')
      .select('id, invoice_number')
      .eq('booking_id', booking_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Invoice already exists', invoice: existing }, { status: 409 })
    }

    // Generate sequential invoice number
    const { data: counter } = await supabaseAdmin
      .from('invoice_counter')
      .select('last_number')
      .eq('id', 1)
      .single()

    const nextNumber = (counter?.last_number || 0) + 1
    const invoiceNumber = `ENW-${String(nextNumber).padStart(5, '0')}`

    await supabaseAdmin
      .from('invoice_counter')
      .update({ last_number: nextNumber })
      .eq('id', 1)

    // Calculate pricing
    const checkIn = new Date(booking.check_in)
    const checkOut = new Date(booking.check_out)
    const numNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const baseRate = booking.room?.price_vt || 0
    const baseTotal = baseRate * numNights

    const discountPercent = booking.discount_percent || 0
    const discountAmount = Math.round(baseTotal * discountPercent / 100)
    const subtotal = baseTotal - discountAmount
    const taxPercent = 0 // Vanuatu has no VAT
    const taxAmount = 0
    const total = subtotal + taxAmount

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        booking_id,
        invoice_number: invoiceNumber,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        room_name: booking.room?.name || 'Unknown Room',
        check_in: booking.check_in,
        check_out: booking.check_out,
        num_nights: numNights,
        num_guests: booking.num_guests,
        base_rate: baseRate,
        base_total: baseTotal,
        discount_name: booking.discount_name,
        discount_percent: discountPercent,
        discount_amount: discountAmount,
        subtotal,
        tax_percent: taxPercent,
        tax_amount: taxAmount,
        total,
        payment_method: booking.payment_method || 'property',
        payment_status: booking.payment_status || 'unpaid',
        notes: booking.notes,
        special_requests: booking.special_requests,
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create accommodation line item
    await supabaseAdmin.from('invoice_items').insert({
      invoice_id: invoice.id,
      description: `${booking.room?.name || 'Room'} — ${numNights} night${numNights > 1 ? 's' : ''}`,
      quantity: numNights,
      unit_price: baseRate,
      total: baseTotal,
      item_type: 'accommodation',
    })

    // Update booking with invoice number
    await supabaseAdmin
      .from('bookings')
      .update({ invoice_number: invoiceNumber })
      .eq('id', booking_id)

    // Fetch complete invoice with items
    const { data: fullInvoice } = await supabaseAdmin
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', invoice.id)
      .single()

    return NextResponse.json(fullInvoice, { status: 201 })
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error('[invoices POST] failed:', detail)
    return NextResponse.json({ error: 'Failed to generate invoice', detail }, { status: 500 })
  }
}
