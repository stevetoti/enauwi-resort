import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET a single post
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { data, error } = await supabase
      .from('social_posts')
      .select('*, analytics:social_analytics(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

// UPDATE a post
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    const allowedFields = [
      'content', 'content_bislama', 'content_french', 'media_urls',
      'platforms', 'scheduled_at', 'status', 'hashtags', 'post_type',
      'room_id', 'approved_by', 'approved_at'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const { data, error } = await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

// DELETE a post
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}
