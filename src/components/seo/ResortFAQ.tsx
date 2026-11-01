import Link from 'next/link'
import faqData from '@/data/seo-faqs.json'

const faqs: Readonly<Record<string, readonly { readonly question: string; readonly answer: string }[] | undefined>> = faqData

export default function ResortFAQ({ path }: { path: string }) {
  const questions = faqs[path]
  if (!questions) return null

  return (
    <section aria-labelledby="resort-faq-heading" className="bg-sand/40 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 id="resort-faq-heading" className="font-serif text-2xl font-bold text-ocean-dark sm:text-3xl">Planning your visit</h2>
        <div className="mt-6 divide-y divide-ocean/10 rounded-2xl border border-ocean/10 bg-white px-5">
          {questions.map(({ question, answer }) => (
            <details key={question} className="py-4">
              <summary className="cursor-pointer font-semibold text-ocean-dark">{question}</summary>
              <p className="mt-3 max-w-3xl leading-relaxed text-ocean/80">{answer}</p>
            </details>
          ))}
        </div>
        <nav aria-label="Plan your resort stay" className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-ocean">
          <Link href="/book" className="underline underline-offset-4">Compare bungalow availability</Link>
          <Link href="/menu" className="underline underline-offset-4">Explore the restaurant menu</Link>
          <Link href="/activities" className="underline underline-offset-4">Browse Efate activities</Link>
          <Link href="/blog" className="underline underline-offset-4">Read our Vanuatu travel guides</Link>
          <Link href="/#contact" className="underline underline-offset-4">Contact the resort team</Link>
        </nav>
      </div>
    </section>
  )
}
