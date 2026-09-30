import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPostBySlug, getPublishedPosts, renderMarkdown } from '@/lib/blog'

export const revalidate = 600

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://www.enauwibeachresort.org'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Article not found | E\'Nauwi Beach Resort' }
  const description = post.meta_description || post.excerpt || undefined
  return {
    title: `${post.title} | E'Nauwi Beach Resort`,
    description,
    keywords: post.keywords || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `${SITE}/blog/${post.slug}`,
      publishedTime: post.published_at || undefined,
      images: [post.cover_image || '/images/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.cover_image || '/images/og-image.jpg'],
    },
  }
}

function formatDate(d: string | null) {
  if (!d) return ''
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(d))
  } catch {
    return ''
  }
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const html = renderMarkdown(post.content)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.cover_image
      ? [post.cover_image.startsWith('http') ? post.cover_image : `${SITE}${post.cover_image}`]
      : undefined,
    description: post.meta_description || post.excerpt || '',
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: "E'Nauwi Beach Resort",
      logo: { '@type': 'ImageObject', url: `${SITE}/logo-enauwi.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${post.slug}` },
  }

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-white">
        <div className="bg-gradient-to-b from-sky-50 to-white">
          <div className="mx-auto max-w-3xl px-4 pt-28 pb-6">
            <Link href="/blog" className="text-sm font-semibold text-sky-700 hover:text-sky-900">← All articles</Link>
            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-sky-900 md:text-4xl">{post.title}</h1>
            <p className="mt-3 text-sm text-gray-500">{formatDate(post.published_at)} · {post.author}</p>
          </div>
        </div>

        {post.cover_image && (
          <div className="mx-auto max-w-3xl px-4 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image} alt={post.title} className="max-h-[440px] w-full rounded-2xl object-cover" />
          </div>
        )}

        <article className="blog-content mx-auto max-w-3xl px-4 py-10" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mx-auto max-w-3xl px-4 pb-20">
          <div className="rounded-2xl bg-gradient-to-r from-sky-700 to-cyan-600 p-8 text-center text-white">
            <h3 className="font-serif text-2xl font-bold">Ready to experience it yourself?</h3>
            <p className="mt-2 opacity-90">Book your beachfront escape at E&apos;Nauwi Beach Resort, Efate.</p>
            <Link href="/book" className="mt-5 inline-block rounded-full bg-amber-400 px-8 py-3 font-semibold text-sky-900 transition hover:bg-amber-300">
              Check Availability
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// Pre-render known published slugs at build for speed/SEO
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}
