import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// Read the SEO/analytics settings (admin only). Uses the service role so it
// works regardless of row-level security on site_settings.
export async function GET(request: NextRequest) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'seo')
      .single()
    return NextResponse.json(data?.value || {})
  } catch {
    return NextResponse.json({})
  }
}

// Save the SEO/analytics settings (admin only). Service role bypasses RLS so
// the save reliably persists (the previous client-side anon write could be
// blocked by row-level security).
export async function POST(request: NextRequest) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const value = await request.json()
    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key: 'seo', value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error('[settings/seo POST] failed:', detail)
    return NextResponse.json({ error: 'Failed to save settings', detail }, { status: 500 })
  }
}
