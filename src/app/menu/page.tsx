import Link from 'next/link'
import MenuClient from './MenuClient'
import PublicPageIntro from '@/components/seo/PublicPageIntro'
import ResortFAQ from '@/components/seo/ResortFAQ'
import JsonLd from '@/components/seo/JsonLd'
import { getPageSEO, pageJsonLd } from '@/lib/seo'

export default function MenuPage() {
  const seo = getPageSEO('/menu')!
  return (
    <main className="min-h-screen bg-sand/30">
      <JsonLd data={pageJsonLd('/menu', { name: seo.h1, description: seo.description })} />
      <PublicPageIntro path="/menu" />
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h2 className="font-serif text-2xl font-bold text-ocean-dark">Explore the current restaurant menu</h2>
        <p className="mt-4 leading-relaxed text-ocean/80">Browse the dishes and prices available below. The menu loads current information, so please allow a moment for categories and dishes to appear. For dining arrangements, ingredient questions, or a group meal, contact the resort before your visit so the kitchen can confirm what it can offer.</p>
        <p className="mt-4 leading-relaxed text-ocean/80">If you are planning a stay, compare <Link href="/book" className="font-semibold underline underline-offset-4">bungalow accommodation on Efate</Link> or explore <Link href="/activities" className="font-semibold underline underline-offset-4">island activities</Link>. Confirm meal inclusions with the team when booking; the restaurant menu and any accommodation package may have different terms.</p>
      </section>
      <MenuClient />
      <ResortFAQ path="/menu" />
    </main>
  )
}
