import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'
import { activities } from '@/data/activities'
import { SITE_URL as SITE } from '@/lib/site'

export const revalidate = 600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE}/book`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/activities`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/menu`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    ...activities.map((a) => ({
      url: `${SITE}/activities/${a.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
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
