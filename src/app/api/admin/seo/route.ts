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

// GET - Fetch SEO settings
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .limit(1)
      .single()
    
    if (error) {
      // If table doesn't exist or no data, return default settings
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return NextResponse.json({
          id: null,
          google_search_console_connected: false,
          google_analytics_connected: false,
          gsc_property_url: null,
          ga_property_id: null,
          meta_title: "E'Nauwi Beach Resort | Beachfront Paradise in Vanuatu",
          meta_description: "Experience the perfect island getaway at E'Nauwi Beach Resort on Efate Island, Vanuatu. Beachfront bungalows, swimming pool, and warm hospitality.",
          updated_at: new Date().toISOString(),
        })
      }
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    )
  }
}

// PUT - Update SEO settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    
    const {
      meta_title,
      meta_description,
      google_search_console_connected,
      google_analytics_connected,
      gsc_property_url,
      ga_property_id,
    } = body
    
    // First, check if a record exists
    const { data: existing } = await supabase
      .from('seo_settings')
      .select('id')
      .limit(1)
      .single()
    
    let data
    let error
    
    if (existing?.id) {
      // Update existing record
      const result = await supabase
        .from('seo_settings')
        .update({
          meta_title: meta_title !== undefined ? meta_title : undefined,
          meta_description: meta_description !== undefined ? meta_description : undefined,
          google_search_console_connected: google_search_console_connected !== undefined ? google_search_console_connected : undefined,
          google_analytics_connected: google_analytics_connected !== undefined ? google_analytics_connected : undefined,
          gsc_property_url: gsc_property_url !== undefined ? gsc_property_url : undefined,
          ga_property_id: ga_property_id !== undefined ? ga_property_id : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from('seo_settings')
        .insert({
          meta_title: meta_title || "E'Nauwi Beach Resort | Beachfront Paradise in Vanuatu",
          meta_description: meta_description || "Experience the perfect island getaway at E'Nauwi Beach Resort on Efate Island, Vanuatu. Beachfront bungalows, swimming pool, and warm hospitality.",
          google_search_console_connected: google_search_console_connected || false,
          google_analytics_connected: google_analytics_connected || false,
          gsc_property_url: gsc_property_url || null,
          ga_property_id: ga_property_id || null,
        })
        .select()
        .single()
      
      data = result.data
      error = result.error
    }
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating SEO settings:', error)
    return NextResponse.json(
      { error: 'Failed to update SEO settings' },
      { status: 500 }
    )
  }
}
