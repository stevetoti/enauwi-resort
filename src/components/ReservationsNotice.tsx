import Link from 'next/link'
import { Mail, Phone, CalendarCheck } from 'lucide-react'
import { AVAILABILITY_NOTE, RESERVATIONS_EMAIL, RESERVATIONS_PHONE } from '@/data/accommodation-rates'

/**
 * Accommodation enquiries & reservations notice (Reservations team wording, 7 Nov 2026).
 * Presentational only (no hooks) so it renders on the server homepage and inside the
 * client booking page. Prices are intentionally not shown here (Stephen, 8 Nov 2026).
 */
export default function ReservationsNotice({
  showRequestLink = true,
  className = '',
  headingLevel = 'h2',
}: {
  showRequestLink?: boolean
  className?: string
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <div
      id="reservations"
      className={`scroll-mt-24 rounded-2xl border border-ocean/10 bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Accommodation Enquiries &amp; Reservations</p>
      <Heading className="mt-2 font-serif text-2xl font-bold text-ocean-dark sm:text-3xl">
        Thank you for your interest in staying at E&apos;Nauwi Beach Resort!
      </Heading>
      <div className="mt-4 max-w-3xl space-y-3 text-gray-700">
        <p>
          For all accommodation enquiries and reservations, please contact our Reservations team directly at{' '}
          <a href={`mailto:${RESERVATIONS_EMAIL}`} className="font-semibold text-ocean underline underline-offset-4">
            {RESERVATIONS_EMAIL}
          </a>
          .
        </p>
        <p>Our team will check availability and get back to you to confirm your booking.</p>
      </div>
      <p className="mt-4 max-w-3xl rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-900">
        <strong>Please note:</strong> {AVAILABILITY_NOTE}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={`mailto:${RESERVATIONS_EMAIL}?subject=${encodeURIComponent('Accommodation enquiry')}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:bg-ocean-light"
        >
          <Mail className="h-4 w-4" /> Email Reservations
        </a>
        {showRequestLink && (
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ocean px-5 py-3 text-sm font-semibold text-ocean transition hover:bg-ocean-50"
          >
            <CalendarCheck className="h-4 w-4" /> Send an enquiry online
          </Link>
        )}
        <a
          href={`tel:${RESERVATIONS_PHONE.replace(/\s/g, '')}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-sm font-semibold text-ocean hover:underline"
        >
          <Phone className="h-4 w-4" /> {RESERVATIONS_PHONE}
        </a>
      </div>
    </div>
  )
}
