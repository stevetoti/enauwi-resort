import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Order Status | E'Nauwi Beach Resort",
  description:
    "Track your food order at E'Nauwi Beach Resort.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
