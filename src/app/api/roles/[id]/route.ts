import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET single role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Get count of staff with this role
    const { count } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id)

    return NextResponse.json({
      ...data,
      member_count: count || 0
    })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
  }
}

// PATCH update role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, permissions } = body

    // Check if this is a system role
    const { data: existingRole } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', id)
      .single()

    if (existingRole?.is_system_role && name) {
      return NextResponse.json(
        { error: 'Cannot rename system roles' },
        { status: 400 }
      )
    }

    // Check if name is taken by another role
    if (name) {
      const { data: existing } = await supabase
        .from('roles')
        .select('id')
        .eq('name', name)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (permissions !== undefined) updateData.permissions = permissions

    const { data, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

// DELETE role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if this is a system role
    const { data: role } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', id)
      .single()

    if (role?.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 400 }
      )
    }

    // Check if role has members
    const { count } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { error: `Cannot delete role with ${count} assigned staff member(s). Please reassign them first.` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
