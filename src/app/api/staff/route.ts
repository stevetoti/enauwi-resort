import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// GET all staff members
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roleId = searchParams.get('roleId')

    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200)
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('staff')
      .select(`
        *,
        role_details:roles(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (roleId) {
      query = query.eq('role_id', roleId)
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({ data, total: count, page, limit })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

// POST create new staff
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session

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
  } catch {
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
