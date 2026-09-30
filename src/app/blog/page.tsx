import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPublishedPosts } from '@/lib/blog'

export const revalidate = 600 // refresh the list every 10 minutes

export const metadata: Metadata = {
  title: "Travel Blog — Vanuatu & Efate Guides | E'Nauwi Beach Resort",
  description:
    "Travel tips, guides and inspiration for your Vanuatu holiday — beaches, snorkelling, activities and island life from E'Nauwi Beach Resort on Efate.",
  alternates: { canonical: '/blog' },
  openGraph: {
    title: "Vanuatu & Efate Travel Guides | E'Nauwi Beach Resort",
    description: 'Travel tips, guides and inspiration for your Vanuatu holiday.',
    url: '/blog',
    images: ['/images/og-image.jpg'],
  },
}

function formatDate(d: string | null) {
  if (!d) return ''
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
  } catch {
    return ''
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <section className="mx-auto max-w-5xl px-4 pt-28 pb-8 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-amber-600">E&apos;Nauwi Journal</p>
          <h1 className="font-serif text-4xl font-bold text-sky-900 md:text-5xl">Vanuatu Travel Guides &amp; Island Stories</h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Tips, guides and inspiration to help you plan the perfect island escape on Efate, Vanuatu.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-24">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-12 text-center text-gray-500">
              New articles are on the way — check back soon.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-44 overflow-hidden">
                    {post.cover_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-sky-600 to-cyan-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <h2 className="absolute bottom-0 p-4 font-serif text-lg font-bold leading-snug text-white">{post.title}</h2>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-3 flex-1 text-sm text-gray-600">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatDate(post.published_at)}</span>
                      <span className="font-semibold text-sky-700 group-hover:text-sky-900">Read more →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
