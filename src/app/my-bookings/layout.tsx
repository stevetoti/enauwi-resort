import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "My Bookings | E'Nauwi Beach Resort",
  description:
    "Look up and manage your reservation at E'Nauwi Beach Resort.",
  robots: { index: false, follow: true },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
