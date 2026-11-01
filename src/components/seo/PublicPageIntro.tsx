import Link from 'next/link'
import { getPageSEO } from '@/lib/seo'

export default function PublicPageIntro({ path }: { path: string }) {
  const seo = getPageSEO(path)
  if (!seo) return null
  return (
    <header className="bg-ocean-dark px-4 py-10 text-white sm:px-6 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-white/80">
          <Link href="/" className="underline underline-offset-4">E&apos;Nauwi Beach Resort</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span aria-current="page">{path === '/menu' ? 'Restaurant' : 'Services'}</span>
        </nav>
        <h1 className="max-w-4xl font-serif text-3xl font-bold sm:text-5xl">{seo.h1}</h1>
        <p className="mt-5 max-w-3xl leading-relaxed text-white/90">{seo.intro}</p>
      </div>
    </header>
  )
}
