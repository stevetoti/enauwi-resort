import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Restaurant Menu | E'Nauwi Beach Resort, Efate Vanuatu",
  description:
    "Browse the E'Nauwi Beach Resort restaurant and bar menu — seafood, local Vanuatu dishes and international favourites at our beachfront restaurant on Efate.",
  alternates: { canonical: '/menu' },
  openGraph: {
    title: "Restaurant Menu | E'Nauwi Beach Resort",
    description: 'Fresh island seafood, local Vanuatu dishes and more at our beachfront restaurant.',
    url: '/menu',
    images: ['/images/og-image.jpg'],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
