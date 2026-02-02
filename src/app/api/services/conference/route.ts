import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/services/conference - Create a conference booking inquiry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      bookingDate,
      startTime,
      endTime,
      bookingType,
      numberOfAttendees,
      specialRequirements,
      contactName,
      contactEmail,
      contactPhone,
    } = body

    // Validate required fields
    if (!bookingDate || !startTime || !endTime || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingDate, startTime, endTime, contactName, contactEmail' },
        { status: 400 }
      )
    }

    // Determine pricing based on booking type
    // PLACEHOLDER PRICES - Update with real pricing when available
    const type = bookingType || 'full_day'
    let totalPrice = 0

    // Get the matching conference service for price lookup
    const { data: confService } = await supabase
      .from('services')
      .select('*')
      .eq('category', 'conference')
      .ilike('name', type === 'half_day' ? '%half%' : '%full%')
      .single()

    if (confService) {
      totalPrice = confService.unit_price
    } else {
      // Fallback PLACEHOLDER PRICES
      totalPrice = type === 'half_day' ? 25000 : 45000
    }

    const serviceId = confService?.id || null

    const { data, error } = await supabase
      .from('conference_bookings')
      .insert({
        service_id: serviceId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        booking_type: type,
        number_of_attendees: numberOfAttendees || 1,
        special_requirements: specialRequirements || null,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        total_price: totalPrice,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      booking: data,
      message: 'Conference booking inquiry submitted successfully. Our team will contact you to confirm.',
    })
  } catch (error) {
    console.error('Error creating conference booking:', error)
    return NextResponse.json(
      { error: 'Failed to create conference booking' },
      { status: 500 }
    )
  }
}

// GET /api/services/conference - Get conference bookings (admin)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('conference_bookings')
      .select('*, service:services(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error('Error fetching conference bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conference bookings' },
      { status: 500 }
    )
  }
}
