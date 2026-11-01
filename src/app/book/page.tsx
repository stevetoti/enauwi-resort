import { Suspense } from 'react'
import Link from 'next/link'
import BookingClient, { BookingHeroVisuals } from './BookingClient'
import ResortFAQ from '@/components/seo/ResortFAQ'
import JsonLd from '@/components/seo/JsonLd'
import { getPageSEO, pageJsonLd } from '@/lib/seo'

export default function BookPage() {
  const seo = getPageSEO('/book')!
  return (
    <main className="min-h-screen bg-sand/30">
      <JsonLd data={pageJsonLd('/book', { name: seo.h1, description: seo.description })} />
      <header className="relative h-[40vh] min-h-[320px]">
        <BookingHeroVisuals />
        <Link href="/" className="absolute left-4 top-4 rounded-full bg-black/40 px-4 py-2 text-sm text-white underline underline-offset-4">Back to E&apos;Nauwi</Link>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <div className="mx-auto max-w-7xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gold-light">E&apos;Nauwi Beach Resort</p>
            <h1 className="max-w-4xl font-serif text-3xl font-bold text-white sm:text-5xl">{seo.h1}</h1>
            <p className="mt-2 text-white/90">Efate Island, Vanuatu</p>
          </div>
        </div>
      </header>
      <section aria-label="Choose your accommodation" className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <p className="leading-relaxed text-ocean-dark">{seo.intro}</p>
        <p className="mt-3 text-sm leading-relaxed text-ocean/80">Choose the space that suits your party, then compare available options below. Rates and availability depend on your dates. For a group stay or a particular room request, <Link href="/#contact" className="font-semibold underline underline-offset-4">contact the resort team</Link> before making arrangements.</p>
      </section>
      <Suspense fallback={<p role="status" className="px-4 py-12 text-center text-ocean">Loading availability search...</p>}>
        <BookingClient />
      </Suspense>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="font-serif text-2xl font-bold text-ocean-dark">Plan a bungalow stay beside the lagoon</h2>
        <p className="mt-4 leading-relaxed text-ocean/80">One-bedroom options offer a base for a couple&apos;s island escape, while two-bedroom accommodation gives families and groups more room to plan their stay together. Review the room details and guest capacity shown in the availability results before choosing your bungalow.</p>
        <p className="mt-4 leading-relaxed text-ocean/80">Make time to explore the <Link href="/activities" className="font-semibold underline underline-offset-4">resort&apos;s Efate activities</Link>, browse the <Link href="/menu" className="font-semibold underline underline-offset-4">restaurant menu</Link>, or read our <Link href="/blog" className="font-semibold underline underline-offset-4">Vanuatu holiday guides</Link>. Confirm any activity arrangements, meal inclusions, transfers, and special requirements with the team.</p>
      </section>
      <ResortFAQ path="/book" />
    </main>
  )
}
