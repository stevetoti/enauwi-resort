import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all videos (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('department_id')
    const category = searchParams.get('category')
    const companyWide = searchParams.get('company_wide')
    const staffId = searchParams.get('staff_id')

    let query = supabaseAdmin
      .from('videos')
      .select(`
        *,
        department:departments(id, name),
        uploader:staff!uploaded_by(id, name, profile_photo)
      `)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (departmentId) {
      query = query.eq('department_id', departmentId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (companyWide === 'true') {
      query = query.eq('is_company_wide', true)
    }

    const { data: videos, error } = await query

    if (error) throw error

    // If staffId provided, add watched status
    if (staffId && videos) {
      const { data: views } = await supabaseAdmin
        .from('video_views')
        .select('video_id, completed')
        .eq('staff_id', staffId)

      const viewMap = new Map(views?.map(v => [v.video_id, v.completed]) || [])
      
      return NextResponse.json(
        videos.map(video => ({
          ...video,
          is_watched: viewMap.has(video.id),
          is_completed: viewMap.get(video.id) || false
        }))
      )
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}

// POST create new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      video_url,
      video_type = 'upload',
      thumbnail_url,
      category = 'general',
      department_id,
      is_company_wide = true,
      duration_seconds,
      file_size_bytes,
      uploaded_by,
      is_featured = false
    } = body

    if (!title || !video_url) {
      return NextResponse.json({ error: 'Title and video URL are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert({
        title,
        description,
        video_url,
        video_type,
        thumbnail_url,
        category,
        department_id: is_company_wide ? null : department_id,
        is_company_wide,
        duration_seconds,
        file_size_bytes,
        uploaded_by,
        is_featured
      })
      .select(`
        *,
        department:departments(id, name),
        uploader:staff!uploaded_by(id, name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}
