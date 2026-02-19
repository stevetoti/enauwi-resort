import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET all posts with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const platform = searchParams.get('platform')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('social_posts')
      .select('*, created_by_staff:staff!social_posts_created_by_fkey(name, email, profile_photo)', { count: 'exact' })
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }
    if (platform) {
      query = query.contains('platforms', [platform])
    }
    if (startDate) {
      query = query.gte('scheduled_at', startDate)
    }
    if (endDate) {
      query = query.lte('scheduled_at', endDate)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ posts: data, total: count })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// CREATE a new post
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      content,
      content_bislama,
      content_french,
      media_urls = [],
      platforms,
      scheduled_at,
      status = 'draft',
      ai_generated = false,
      ai_prompt,
      hashtags = [],
      post_type = 'standard',
      room_id,
      created_by
    } = body

    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        content,
        content_bislama,
        content_french,
        media_urls,
        platforms,
        scheduled_at,
        status,
        ai_generated,
        ai_prompt,
        hashtags,
        post_type,
        room_id,
        created_by
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ post: data })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
