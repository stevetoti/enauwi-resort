import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conference Room, Services & Experiences | E'Nauwi Beach Resort",
  description:
    "Conference and event facilities, food and beverage, island adventures and guest services at E'Nauwi Beach Resort on Efate, Vanuatu.",
  alternates: { canonical: '/services' },
  openGraph: {
    title: "Services & Experiences | E'Nauwi Beach Resort",
    description: 'Conference facilities, island adventures and guest services on Efate, Vanuatu.',
    url: '/services',
    images: ['/images/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
