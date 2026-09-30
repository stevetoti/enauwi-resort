import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Book Your Stay | E'Nauwi Beach Resort, Efate Vanuatu",
  description:
    "Check availability and book beachfront bungalows at E'Nauwi Beach Resort on Efate, Vanuatu. Book online for families, couples and groups.",
  alternates: { canonical: '/book' },
  openGraph: {
    title: "Book Your Stay | E'Nauwi Beach Resort",
    description: 'Check availability and book your beachfront bungalow on Efate, Vanuatu.',
    url: '/book',
    images: ['/images/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
