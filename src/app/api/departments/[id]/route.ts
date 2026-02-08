import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET single department with members, announcements, and documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get department
    const { data: department, error: deptError } = await supabaseAdmin
      .from('departments')
      .select('*')
      .eq('id', id)
      .single()

    if (deptError) throw deptError

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    // Get members
    const { data: members } = await supabaseAdmin
      .from('staff')
      .select('id, name, email, role, profile_photo, status')
      .eq('department_id', id)
      .order('name')

    // Get announcements
    const { data: announcements } = await supabaseAdmin
      .from('department_announcements')
      .select('*, author:staff(id, name)')
      .eq('department_id', id)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    // Get documents
    const { data: documents } = await supabaseAdmin
      .from('department_documents')
      .select('*, uploader:staff(id, name)')
      .eq('department_id', id)
      .order('created_at', { ascending: false })

    return NextResponse.json({
      ...department,
      members: members || [],
      announcements: announcements || [],
      documents: documents || []
    })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

// PATCH update department
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, image_url, color, is_active } = body

    // Check if name is taken by another department
    if (name) {
      const { data: existing } = await supabaseAdmin
        .from('departments')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'A department with this name already exists' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (image_url !== undefined) updateData.image_url = image_url
    if (color !== undefined) updateData.color = color
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabaseAdmin
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

// DELETE department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if department has members
    const { count } = await supabaseAdmin
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete department with ${count} active member(s). Please reassign them first.` },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}
