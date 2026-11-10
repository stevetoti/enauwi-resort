import { getPageSEO, publicPageMetadata, pageJsonLd } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import ResortFAQ from '@/components/seo/ResortFAQ'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { WEEKLY_TOURS, MORE_ACTIVITIES, TOUR_BOOKING_NOTE, tourPrice } from '@/data/resort-offerings'

export const metadata = publicPageMetadata('/activities')

export default function ActivitiesPage() {
  const seo = getPageSEO('/activities')!

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Daily Tours & Activities at E'Nauwi Beach Resort",
    itemListElement: [...WEEKLY_TOURS.map((t) => t.name), ...MORE_ACTIVITIES.map((a) => a.name)].map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
    })),
  }

  return (
    <>
      <Navbar />
      <JsonLd data={jsonLd} />
      <JsonLd data={pageJsonLd('/activities', { name: seo.h1, description: seo.description }, [], 'CollectionPage')} />
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <section className="mx-auto max-w-5xl px-4 pt-28 pb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600">Daily Tours &amp; Activities</p>
          <h1 className="font-serif text-4xl font-bold text-sky-900 md:text-5xl">Things to Do on Efate, Vanuatu</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">{seo.intro}</p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-sky-900">Weekly Tour Schedule</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {WEEKLY_TOURS.map((t) => (
              <article key={t.id} className="flex flex-col rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">{t.day}</p>
                <h3 className="mt-1 font-serif text-xl font-bold text-sky-900">{t.name}</h3>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-gray-500">
                  <Clock size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {t.times.join(' · ')}
                    {t.place ? ` · ${t.place}` : ''}
                  </span>
                </p>
                <ul className="mt-3 flex-1 space-y-1 text-sm text-gray-600">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-amber-600">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <p className={`mt-4 text-sm font-semibold ${t.adultPrice === 0 ? 'text-green-700' : 'text-sky-900'}`}>{tourPrice(t)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-sky-900">More Activities</h2>
          <dl className="divide-y divide-sky-100 rounded-2xl border border-sky-100 bg-white px-5 shadow-sm">
            {MORE_ACTIVITIES.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="font-medium text-sky-900">{a.name}</dt>
                <dd className="text-sm text-gray-600 sm:text-right">{a.price}</dd>
              </div>
            ))}
          </dl>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-600">{TOUR_BOOKING_NOTE}</p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24 text-center">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-sky-900 px-8 py-4 font-semibold text-white transition hover:bg-sky-800"
          >
            Request your stay <ArrowRight size={16} />
          </Link>
        </section>
        <ResortFAQ path="/activities" />
      </main>
      <Footer />
    </>
  )
}
