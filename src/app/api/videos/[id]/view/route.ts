import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// POST record video view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { staff_id, watch_duration_seconds, completed } = body

    if (!staff_id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 })
    }

    // Upsert view record
    const { data, error } = await supabaseAdmin
      .from('video_views')
      .upsert({
        video_id: id,
        staff_id,
        watch_duration_seconds,
        completed: completed || false,
        watched_at: new Date().toISOString()
      }, {
        onConflict: 'video_id,staff_id'
      })
      .select()
      .single()

    if (error) throw error

    // Increment view count on video
    const { data: video } = await supabaseAdmin.from('videos').select('view_count').eq('id', id).single()
    if (video) {
      await supabaseAdmin.from('videos').update({ view_count: (video.view_count || 0) + 1 }).eq('id', id)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}
