import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/services/orders - Create a service order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      bookingId,
      serviceId,
      quantity,
      notes,
      roomNumber,
      guestName,
      guestEmail,
    } = body

    // Validate required fields
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Missing required field: serviceId' },
        { status: 400 }
      )
    }

    // Fetch the service to get pricing
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (!service.available) {
      return NextResponse.json(
        { error: 'This service is currently unavailable' },
        { status: 400 }
      )
    }

    const qty = quantity || 1
    const unitPrice = service.unit_price
    const totalPrice = unitPrice * qty

    const { data, error } = await supabaseAdmin
      .from('service_orders')
      .insert({
        booking_id: bookingId || null,
        service_id: serviceId,
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalPrice,
        status: 'pending',
        notes: notes || null,
        room_number: roomNumber || null,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
      })
      .select('*, service:services(*)')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      order: data,
      message: 'Service order placed successfully.',
    })
  } catch (error) {
    console.error('Error creating service order:', error)
    return NextResponse.json(
      { error: 'Failed to create service order' },
      { status: 500 }
    )
  }
}

// GET /api/services/orders - Get service orders
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_orders')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: data })
  } catch (error) {
    console.error('Error fetching service orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service orders' },
      { status: 500 }
    )
  }
}
