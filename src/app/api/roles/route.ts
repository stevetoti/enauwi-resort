import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all roles
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('is_system_role', { ascending: false })
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

// POST create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 })
    }

    // Check if role name already exists
    const { data: existing } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('roles')
      .insert({
        name,
        description,
        permissions: permissions || {},
        is_system_role: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
