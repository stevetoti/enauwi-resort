import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRole)
}

// GET - List all knowledge entries
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('category')
    
    if (error) throw error
    
    return NextResponse.json({ success: true, entries: data || [] })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load knowledge base', error: String(error) },
      { status: 500 }
    )
  }
}

// POST - Add new entry
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { category, content } = await request.json()
    
    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert([{ category: category || 'general', content }])
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ success: true, entry: data })
  } catch (error) {
    console.error('Error adding knowledge entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to add entry', error: String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { id, content } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('knowledge_base')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Entry updated' })
  } catch (error) {
    console.error('Error updating knowledge entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update entry', error: String(error) },
      { status: 500 }
    )
  }
}

// DELETE - Remove entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Entry ID is required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, message: 'Entry deleted' })
  } catch (error) {
    console.error('Error deleting knowledge entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete entry', error: String(error) },
      { status: 500 }
    )
  }
}
