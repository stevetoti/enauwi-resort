import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST mark announcement as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: announcement_id } = await params
    const body = await request.json()
    const { staff_id } = body

    if (!staff_id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 })
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
