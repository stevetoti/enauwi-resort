import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceRole) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceRole)
}

// GET - Fetch all website content entries
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('website_content')
      .select('*')
      .order('label')
    
    if (error) {
      // If table doesn't exist, return empty array with a message
      if (error.code === '42P01') {
        return NextResponse.json([])
      }
      throw error
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching website content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch website content' },
      { status: 500 }
    )
  }
}

// PUT - Update a website content entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { id, current_image_url, updated_by } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('website_content')
      .update({
        current_image_url,
        updated_at: new Date().toISOString(),
        updated_by,
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating website content:', error)
    return NextResponse.json(
      { error: 'Failed to update website content' },
      { status: 500 }
    )
  }
}
