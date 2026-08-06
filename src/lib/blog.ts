import { supabaseAdmin } from '@/lib/supabase'
import { marked } from 'marked'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  meta_description: string | null
  content: string
  cover_image: string | null
  keywords: string | null
  status: string
  ai_generated: boolean
  author: string
  published_at: string | null
  created_at: string
}

// Public: list published posts (server-side, service role — reliable).
export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    return (data as BlogPost[]) || []
  } catch {
    return []
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    return (data as BlogPost) || null
  } catch {
    return null
  }
}

// Render markdown to HTML (server-side).
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false }) as string
}
