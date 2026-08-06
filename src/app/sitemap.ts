import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://www.enauwibeachresort.org'

export const revalidate = 600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE}/book`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/activities`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/menu`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/blog`, changeFrequency: 'daily', priority: 0.8 },
  ]

  let posts: MetadataRoute.Sitemap = []
  try {
    const published = await getPublishedPosts()
    posts = published.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.published_at ? new Date(p.published_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch {
    posts = []
  }

  return [...staticPages, ...posts]
}
