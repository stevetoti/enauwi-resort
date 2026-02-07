import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all conference bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('conference_bookings')
      .select(`
        *,
        service:services(*)
      `)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (startDate) {
      query = query.gte('booking_date', startDate)
    }

    if (endDate) {
      query = query.lte('booking_date', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching conference bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch conference bookings' }, { status: 500 })
  }
}

// PATCH update conference booking status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, notes, total_price, booking_date, start_time, end_time } = body

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (total_price !== undefined) updateData.total_price = total_price
    if (booking_date !== undefined) updateData.booking_date = booking_date
    if (start_time !== undefined) updateData.start_time = start_time
    if (end_time !== undefined) updateData.end_time = end_time

    const { data, error } = await supabase
      .from('conference_bookings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        service:services(*)
      `)
      .single()

    if (error) throw error

    // If status changed to confirmed, send confirmation email
    if (status === 'confirmed') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://enauwi-resort.vercel.app'
      await fetch(`${baseUrl}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'concierge_email',
          data: {
            guestEmail: data.contact_email,
            guestName: data.contact_name,
            subject: 'Conference Booking Confirmed - E\'Nauwi Beach Resort',
            body: `Your conference booking has been confirmed!\n\nDate: ${data.booking_date}\nTime: ${data.start_time} - ${data.end_time}\nAttendees: ${data.number_of_attendees}\n\nWe look forward to hosting your event!`,
          },
        }),
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating conference booking:', error)
    return NextResponse.json({ error: 'Failed to update conference booking' }, { status: 500 })
  }
}
