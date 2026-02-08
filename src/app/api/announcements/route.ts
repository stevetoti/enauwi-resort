import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all announcements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const staffId = searchParams.get('staffId')
    const includeExpired = searchParams.get('includeExpired') === 'true'

    let query = supabaseAdmin
      .from('announcements')
      .select(`
        *,
        author:staff!announcements_author_id_fkey(id, name, email, profile_photo)
      `)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (!includeExpired) {
      const now = new Date().toISOString()
      query = query.or(`expires_at.is.null,expires_at.gt.${now}`)
    }

    const { data: announcements, error } = await query

    if (error) throw error

    // If staffId is provided, add read status
    if (staffId && announcements) {
      const { data: reads } = await supabaseAdmin
        .from('announcement_reads')
        .select('announcement_id')
        .eq('staff_id', staffId)

      const readIds = new Set(reads?.map(r => r.announcement_id) || [])

      const withReadStatus = announcements.map(ann => ({
        ...ann,
        is_read: readIds.has(ann.id),
      }))

      return NextResponse.json(withReadStatus)
    }

    return NextResponse.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST create announcement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, author_id, pinned, priority, target_roles, expires_at, hero_image, attachments, links } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title,
        content,
        author_id,
        pinned: pinned || false,
        priority: priority || 'normal',
        target_roles: target_roles || [],
        expires_at,
        hero_image: hero_image || null,
        attachments: attachments || [],
        links: links || [],
      })
      .select(`
        *,
        author:staff!announcements_author_id_fkey(id, name, email, profile_photo)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
