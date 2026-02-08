import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST mark announcement as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { announcement_id, staff_id } = body

    if (!announcement_id || !staff_id) {
      return NextResponse.json({ error: 'Announcement ID and staff ID are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('announcement_reads')
      .upsert({
        announcement_id,
        staff_id,
        read_at: new Date().toISOString(),
      }, { onConflict: 'announcement_id,staff_id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    return NextResponse.json({ error: 'Failed to mark announcement as read' }, { status: 500 })
  }
}

// DELETE unmark announcement as read
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { announcement_id, staff_id } = body

    if (!announcement_id || !staff_id) {
      return NextResponse.json({ error: 'Announcement ID and staff ID are required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('announcement_reads')
      .delete()
      .eq('announcement_id', announcement_id)
      .eq('staff_id', staff_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unmarking announcement as read:', error)
    return NextResponse.json({ error: 'Failed to unmark announcement as read' }, { status: 500 })
  }
}
