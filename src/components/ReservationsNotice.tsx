import Link from 'next/link'
import { Mail, Phone, CalendarCheck } from 'lucide-react'
import {
  ACCOMMODATION_RATES,
  AVAILABILITY_NOTE,
  RATES_NOTE,
  RESERVATIONS_EMAIL,
  RESERVATIONS_PHONE,
} from '@/data/accommodation-rates'

/**
 * Accommodation enquiries & reservations notice (Reservations team wording, 7 Nov 2026).
 * Presentational only (no hooks) so it renders on the server homepage and inside the
 * client booking page.
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
      className={`scroll-mt-24 overflow-hidden rounded-2xl border border-ocean/10 bg-white shadow-sm ${className}`}
    >
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">Accommodation Enquiries &amp; Reservations</p>
          <Heading className="mt-2 font-serif text-2xl font-bold text-ocean-dark sm:text-3xl">
            Thank you for your interest in staying at E&apos;Nauwi Beach Resort!
          </Heading>
          <p className="mt-4 text-gray-700">
            For all accommodation enquiries and reservations, please contact our Reservations team directly at{' '}
            <a href={`mailto:${RESERVATIONS_EMAIL}`} className="font-semibold text-ocean underline underline-offset-4">
              {RESERVATIONS_EMAIL}
            </a>
            .
          </p>
          <p className="mt-3 text-gray-700">Our team will check availability and get back to you to confirm your booking.</p>
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
                <CalendarCheck className="h-4 w-4" /> Send a request online
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

        <div className="border-t border-ocean/10 bg-ocean-50/60 p-6 sm:p-8 md:border-l md:border-t-0">
          <Heading className="text-lg font-bold text-ocean-dark">Accommodation Options &amp; Rates</Heading>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-ocean/15 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-semibold">Room Type</th>
                <th className="pb-2 text-right font-semibold">Nightly Rate</th>
              </tr>
            </thead>
            <tbody>
              {ACCOMMODATION_RATES.map((r) => (
                <tr key={r.id} className="border-b border-ocean/10 last:border-0">
                  <td className="py-2.5 pr-3 text-gray-800">{r.label}</td>
                  <td className="whitespace-nowrap py-2.5 text-right font-semibold tabular-nums text-ocean-dark">
                    VT {r.nightlyVt.toLocaleString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-600">{RATES_NOTE}</p>
          <p className="mt-3 rounded-lg bg-gold-50 px-3 py-2 text-sm text-gold-900">
            <strong>Please note:</strong> {AVAILABILITY_NOTE}
          </p>
        </div>
      </div>
    </div>
  )
}
