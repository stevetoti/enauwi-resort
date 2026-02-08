import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all staff members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roleId = searchParams.get('roleId')

    let query = supabase
      .from('staff')
      .select(`
        *,
        role_details:roles(*)
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (roleId) {
      query = query.eq('role_id', roleId)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// POST create new staff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role_id, department, phone, profile_photo } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('staff')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Staff member with this email already exists' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('staff')
      .insert({
        email,
        name,
        role_id,
        department,
        phone,
        profile_photo,
        status: 'active',
        first_login: true,
      })
      .select(`
        *,
        role_details:roles(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
