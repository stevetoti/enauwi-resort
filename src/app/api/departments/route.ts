import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET all departments with member counts
export async function GET() {
  try {
    // Get departments
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    // Get member counts for each department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const { count } = await supabaseAdmin
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('department_id', dept.id)

        return {
          ...dept,
          member_count: count || 0
        }
      })
    )

    return NextResponse.json(departmentsWithCounts)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

// POST create new department
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, image_url, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 })
    }

    // Check if department name already exists
    const { data: existing } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'A department with this name already exists' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('departments')
      .insert({
        name,
        description,
        image_url: image_url || '/images/resort/beach-resort-overview.jpg',
        color: color || '#0D4F8B',
        is_active: true
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
