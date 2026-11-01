import ServicesClient from './ServicesClient'
import PublicPageIntro from '@/components/seo/PublicPageIntro'
import ResortFAQ from '@/components/seo/ResortFAQ'
import JsonLd from '@/components/seo/JsonLd'
import { getPageSEO, pageJsonLd } from '@/lib/seo'

export default function ServicesPage() {
  const seo = getPageSEO('/services')!
  return (
    <main className="min-h-screen bg-sand">
      <JsonLd data={pageJsonLd('/services', { name: seo.h1, description: seo.description })} />
      <PublicPageIntro path="/services" />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="font-serif text-2xl font-bold text-ocean-dark">Plan your meeting or group stay</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-ocean/80">Share your preferred dates, expected numbers, and the purpose of your event. The team can advise on current facilities, accommodation availability, and the arrangements that suit your group. Confirm the venue&apos;s operating status and capacity before finalizing invitations or travel.</p>
        <p className="mt-4 max-w-3xl leading-relaxed text-ocean/80">For a useful quote, include your preferred room setup, catering needs, equipment, accessibility requirements, and any overnight stays. Ask which services are included and which are charged separately. A tailored enquiry lets the resort check the details rather than relying on a general package description.</p>
      </section>
      <ServicesClient />
      <ResortFAQ path="/services" />
    </main>
  )
}
