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

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['voice_greeting', 'contact_phone', 'contact_email', 'check_in_time', 'check_out_time', 'front_desk_hours'])
    
    if (error) throw error
    
    // Convert array to object for easier use
    const settings: Record<string, string> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })
    
    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error fetching voice settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load settings', error: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { voice_greeting, contact_phone, contact_email, check_in_time, check_out_time, front_desk_hours } = body
    
    const settings = [
      { key: 'voice_greeting', value: voice_greeting },
      { key: 'contact_phone', value: contact_phone },
      { key: 'contact_email', value: contact_email },
      { key: 'check_in_time', value: check_in_time },
      { key: 'check_out_time', value: check_out_time },
      { key: 'front_desk_hours', value: front_desk_hours },
    ]
    
    for (const setting of settings) {
      if (!setting.value) continue
      
      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', setting.key)
        .single()
      
      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('site_settings')
          .update({ value: setting.value, updated_at: new Date().toISOString() })
          .eq('key', setting.key)
        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: setting.key, value: setting.value })
        if (error) throw error
      }
    }
    
    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    console.error('Error saving voice settings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save settings', error: String(error) },
      { status: 500 }
    )
  }
}
