import type { Metadata } from 'next'
import approvedPages from '@/data/seo-pages.json'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export interface PageSEO {
  readonly title: string
  readonly description: string
  readonly h1: string
  readonly intro: string | null
}

const pages: Readonly<Record<string, PageSEO | undefined>> = approvedPages

export function getPageSEO(path: string): PageSEO | undefined {
  return pages[path]
}

export function publicPageMetadata(
  path: string,
  fallback?: { title: string; description: string },
  image = '/images/og-image.jpg',
): Metadata {
  const content = getPageSEO(path) ?? fallback
  if (!content) throw new Error(`Missing public page SEO for ${path}`)
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: path },
    openGraph: {
      title: content.title,
      description: content.description,
      url: path,
      images: [image],
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description,
      images: [image],
    },
  }
}

export interface Breadcrumb {
  readonly name: string
  readonly path: string
}

export function pageJsonLd(
  path: string,
  content: { name: string; description: string },
  parents: readonly Breadcrumb[] = [],
  type: 'WebPage' | 'CollectionPage' = 'WebPage',
) {
  const url = `${SITE_URL}${path}`
  const breadcrumbs = [
    { name: SITE_NAME, path: '/' },
    ...parents,
    { name: content.name, path },
  ]
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': type,
        '@id': `${url}#webpage`,
        url,
        name: content.name,
        description: content.description,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#resort` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      },
    ],
  }
}
