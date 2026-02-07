import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET message templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const category = searchParams.get('category')

    let query = supabase
      .from('message_templates')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (channel) {
      query = query.eq('channel', channel)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST create template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, channel, subject, content, variables, category, created_by } = body

    if (!name || !channel || !content) {
      return NextResponse.json({ error: 'Name, channel, and content are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        name,
        channel,
        subject,
        content,
        variables: variables || [],
        category,
        created_by,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
