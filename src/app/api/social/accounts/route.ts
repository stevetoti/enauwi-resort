import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

// GET all connected accounts
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('id, platform, account_name, page_id, page_name, is_active, connected_at')
      .order('platform')

    if (error) throw error

    return NextResponse.json({ accounts: data || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch accounts', accounts: [] }, { status: 500 })
  }
}

// CREATE a new account
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, page_id, page_name, account_name, access_token, refresh_token, is_active = true } = body

    if (!platform || !page_id) {
      return NextResponse.json({ error: 'Platform and page_id are required' }, { status: 400 })
    }

    // Check if account for this platform already exists
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('id')
      .eq('platform', platform)
      .single()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          page_id,
          page_name,
          account_name,
          access_token: access_token || undefined,
          refresh_token: refresh_token || undefined,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ account: data })
    }

    // Create new
    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        platform,
        page_id,
        page_name,
        account_name,
        access_token,
        refresh_token,
        is_active,
        connected_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ account: data })
  } catch {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
