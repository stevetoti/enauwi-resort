import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAuth } from '@/lib/auth'
import { BLOG_SEED } from '@/data/blog-seed'
import { generateAndPublishArticle } from '@/lib/blog-generate'

export const maxDuration = 60

// GET — list ALL posts (admin, incl. drafts)
export async function GET(request: NextRequest) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .order('published_at', { ascending: false })
    if (error) throw error
    return NextResponse.json(data || [])
  } catch (e) {
    const detail = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? String(e))
    return NextResponse.json({ error: 'Failed to load posts', detail }, { status: 500 })
  }
}

// POST — admin actions: seed the 10 starter articles, or generate one now
export async function POST(request: NextRequest) {
  const session = await requireAuth(request)
  if (session instanceof NextResponse) return session
  try {
    const body = await request.json().catch(() => ({}))

    if (body.action === 'generate') {
      const post = await generateAndPublishArticle()
      return NextResponse.json({ success: true, post })
    }

    if (body.action === 'seed') {
      const rows = BLOG_SEED.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        meta_description: p.meta_description,
        content: p.content,
        keywords: p.keywords,
        status: 'published',
        ai_generated: false,
        published_at: new Date().toISOString(),
      }))
      const { error } = await supabaseAdmin
        .from('blog_posts')
        .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })
      if (error) throw error
      return NextResponse.json({ success: true, seeded: rows.length })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    const detail = e instanceof Error ? e.message : ((e as { message?: string })?.message ?? String(e))
    console.error('[blog POST] failed:', detail)
    return NextResponse.json({ error: 'Action failed', detail }, { status: 500 })
  }
}
