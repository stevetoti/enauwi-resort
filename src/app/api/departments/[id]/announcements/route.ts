import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET department announcements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('department_announcements')
      .select('*, author:staff(id, name, profile_photo)')
      .eq('department_id', id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching department announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST create department announcement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content, priority, pinned, created_by, expires_at } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('department_announcements')
      .insert({
        department_id: id,
        title,
        content,
        priority: priority || 'normal',
        pinned: pinned || false,
        created_by,
        expires_at
      })
      .select('*, author:staff(id, name, profile_photo)')
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating department announcement:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
