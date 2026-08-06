import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { generateAndPublishArticle } from '@/lib/blog-generate'

export const maxDuration = 60

async function handle(request: NextRequest) {
  // Allow either the Vercel cron (Authorization: Bearer CRON_SECRET) or a logged-in admin.
  const auth = request.headers.get('authorization')
  const isCron = !!process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`
  if (!isCron) {
    const session = await requireAuth(request)
    if (session instanceof NextResponse) return session
  }
  try {
    const post = await generateAndPublishArticle()
    return NextResponse.json({ success: true, post })
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    console.error('[blog generate] failed:', detail)
    return NextResponse.json({ error: 'Failed to generate article', detail }, { status: 500 })
  }
}

// Vercel cron sends GET; the admin button sends POST.
export async function GET(request: NextRequest) {
  return handle(request)
}
export async function POST(request: NextRequest) {
  return handle(request)
}
