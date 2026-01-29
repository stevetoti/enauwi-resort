import { notFound } from 'next/navigation'
import { Metadata } from 'next'
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

  return {
    title: `${activity.title} | E'Nauwi Beach Resort Activities`,
    description: activity.tagline,
    openGraph: {
      title: `${activity.title} | E'Nauwi Beach Resort`,
      description: activity.tagline,
      images: [activity.heroImage],
    },
  }
}

export default function ActivityPage({
  params,
}: {
  params: { slug: string }
}) {
  const activity = getActivityBySlug(params.slug)
  if (!activity) notFound()

  return <ActivityDetail activity={activity} />
}
