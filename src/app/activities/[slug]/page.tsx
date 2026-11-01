import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageSEO, publicPageMetadata, pageJsonLd } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import { activities, getActivityBySlug } from '@/data/activities'
import ActivityDetail from './ActivityDetail'

export function generateStaticParams() {
  return activities.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const activity = getActivityBySlug(params.slug)
  if (!activity) return { title: 'Activity Not Found' }

  return publicPageMetadata(`/activities/${activity.slug}`, {
    title: `${activity.title} | E'Nauwi Beach Resort`,
    description: activity.tagline,
  }, activity.heroImage)
}

export default function ActivityPage({
  params,
}: {
  params: { slug: string }
}) {
  const activity = getActivityBySlug(params.slug)
  if (!activity) notFound()

  return (
    <>
      <JsonLd data={pageJsonLd(`/activities/${activity.slug}`, { name: activity.title, description: activity.tagline }, [{ name: 'Efate activities', path: '/activities' }])} />
      <ActivityDetail activity={activity} heading={getPageSEO(`/activities/${activity.slug}`)?.h1} />
    </>
  )
}
