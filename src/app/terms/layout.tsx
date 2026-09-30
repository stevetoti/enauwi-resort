import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Terms, Conditions & Policies | E'Nauwi Beach Resort",
  description:
    "Check-in and check-out times, cancellation policy and booking terms for E'Nauwi Beach Resort on Efate, Vanuatu.",
  alternates: { canonical: '/terms' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
