import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    if (!start || !end) {
      return NextResponse.json({ error: 'start and end dates required' }, { status: 400 })
    }

    const supabase = createServiceSupabase()

    const { data, error } = await supabase
      .from('bookings')
      .select('id, room_id, guest_name, guest_email, check_in, check_out, status, total_price, num_guests, booking_reference, discount_name, discount_percent')
      .or(`check_in.lte.${end},check_out.gte.${start}`)
      .in('status', ['pending', 'confirmed', 'checked_in', 'checked_out'])
      .order('check_in')

    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
