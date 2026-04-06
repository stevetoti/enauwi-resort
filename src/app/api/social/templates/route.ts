import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET all templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabase
      .from('social_templates')
      .select('*')
      .order('usage_count', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ templates: data })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// CREATE a new template
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('social_templates')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ template: data })
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
