import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('staff_attendance')
      .select(`
        *,
        staff:staff(id, name, email, department, profile_photo, role_details:roles(*))
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .order('clock_in', { ascending: false })
      .range(offset, offset + limit - 1)

    if (staffId) {
      query = query.eq('staff_id', staffId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    } else if (startDate) {
      query = query.gte('date', startDate)
    } else if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, total: count, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST clock in
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const body = await request.json()
    const { staff_id, action } = body

    if (!staff_id || !action) {
      return NextResponse.json({ error: 'Staff ID and action are required' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toISOString()

    // Get existing record for today
    const { data: existing } = await supabaseAdmin
      .from('staff_attendance')
      .select('*')
      .eq('staff_id', staff_id)
      .eq('date', today)
      .single()

    if (action === 'clock_in') {
      if (existing?.clock_in) {
        return NextResponse.json({ error: 'Already clocked in today' }, { status: 400 })
      }

      // Create or update attendance record
      const { data, error } = await supabaseAdmin
        .from('staff_attendance')
        .upsert({
          staff_id,
          date: today,
          clock_in: now,
          status: 'present',
        }, { onConflict: 'staff_id,date' })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data)
    } else if (action === 'clock_out') {
      if (!existing?.clock_in) {
        return NextResponse.json({ error: 'Not clocked in today' }, { status: 400 })
      }

      if (existing?.clock_out) {
        return NextResponse.json({ error: 'Already clocked out today' }, { status: 400 })
      }

      // Calculate hours worked
      const clockIn = new Date(existing.clock_in)
      const clockOut = new Date(now)
      const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      const { data, error } = await supabaseAdmin
        .from('staff_attendance')
        .update({
          clock_out: now,
          hours_worked: Math.round(hoursWorked * 100) / 100,
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Failed to process attendance' }, { status: 500 })
  }
}
