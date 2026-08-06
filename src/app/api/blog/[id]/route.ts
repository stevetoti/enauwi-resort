import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'

// PATCH — update a post (publish/unpublish, or edit fields)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const body = await request.json()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const f of ['title', 'excerpt', 'meta_description', 'content', 'keywords', 'status', 'cover_image'] as const) {
      if (body[f] !== undefined) updates[f] = body[f]
    }
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    const detail = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? String(e))
    return NextResponse.json({ error: 'Failed to update post', detail }, { status: 500 })
  }
}

// DELETE — remove a post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const { error } = await supabaseAdmin.from('blog_posts').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    const detail = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? String(e))
    return NextResponse.json({ error: 'Failed to delete post', detail }, { status: 500 })
  }
}
