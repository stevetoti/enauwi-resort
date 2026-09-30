import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { activities } from '@/data/activities'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: "Things to Do on Efate, Vanuatu — Activities & Tours | E'Nauwi Beach Resort",
  description:
    "Snorkelling with dugongs, island hopping, sunset kayaking, sport fishing, turtle watching and more — guided activities and tours from E'Nauwi Beach Resort on Efate, Vanuatu.",
  alternates: { canonical: '/activities' },
  openGraph: {
    title: "Activities & Tours on Efate | E'Nauwi Beach Resort",
    description: 'Snorkelling, island hopping, kayaking, fishing and more from our beachfront resort on Efate, Vanuatu.',
    url: '/activities',
    images: ['/images/og-image.jpg'],
  },
}

export default function ActivitiesPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Activities at E'Nauwi Beach Resort",
    itemListElement: activities.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.title,
      url: `${SITE_URL}/activities/${a.slug}`,
    })),
  }

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <section className="mx-auto max-w-5xl px-4 pt-28 pb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600">Island Adventures</p>
          <h1 className="font-serif text-4xl font-bold text-sky-900 md:text-5xl">Things to Do on Efate, Vanuatu</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Guided activities and excursions from E&apos;Nauwi Beach Resort — from snorkelling our lagoon to island
            hopping and sunset kayaking.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <Link
                key={a.slug}
                href={`/activities/${a.slug}`}
                className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.heroImage}
                  alt={`${a.title} at E'Nauwi Beach Resort, Efate Vanuatu`}
                  loading="lazy"
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">{a.tag}</p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-sky-900">{a.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{a.tagline}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={14} /> {a.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} /> {a.groupSize}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 group-hover:text-amber-600">
                    Learn more <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-sky-900 px-8 py-4 font-semibold text-white transition hover:bg-sky-800"
            >
              Book your stay <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
