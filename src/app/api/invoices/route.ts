import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET invoices
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    const search = searchParams.get('search')

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

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// POST — generate invoice from a booking
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { booking_id } = await request.json()

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
  } catch {
    return NextResponse.json({ error: 'Failed to generate invoice' }, { status: 500 })
  }
}
