// Published accommodation rates + how website bookings are handled.
//
// Source: E'Nauwi Reservations / Marketing email, 7 Nov 2026 ("Follow-Up on Website
// and Booking.com Synchronisation"). Rates include a light breakfast.
//
// BOOKING_MODE
//   'request'  — the website takes reservation REQUESTS only. Nothing is confirmed
//                online: the Reservations team checks availability against
//                Booking.com and confirms by email. (Current mode — there is no
//                channel manager, and instant website bookings caused double bookings.)
//   'instant'  — previous behaviour (booking confirmed on submit). Only switch back
//                once a channel manager keeps the website and Booking.com in sync.

export const BOOKING_MODE: 'request' | 'instant' = 'request'
export const IS_REQUEST_MODE = BOOKING_MODE === 'request'

export const RESERVATIONS_EMAIL = 'reservation@enauwibeachresort.com'
export const RESERVATIONS_PHONE = '+678 22170'

export interface AccommodationRate {
  id: 'beachfront-2br' | 'beachfront-1br' | 'lagoon-2br' | 'lagoon-1br' | 'garden-2br'
  label: string
  nightlyVt: number
}

export const ACCOMMODATION_RATES: AccommodationRate[] = [
  { id: 'beachfront-2br', label: '2-Bedroom Beachfront Bungalow', nightlyVt: 30000 },
  { id: 'beachfront-1br', label: '1-Bedroom Beachfront Bungalow', nightlyVt: 24000 },
  { id: 'lagoon-2br', label: '2-Bedroom Lagoon View Bungalow', nightlyVt: 25500 },
  { id: 'lagoon-1br', label: '1-Bedroom Lagoon View Bungalow', nightlyVt: 20060 },
  { id: 'garden-2br', label: '2-Bedroom Garden Bungalow', nightlyVt: 21250 },
]

export const RATES_NOTE = 'All accommodation rates include a light breakfast.'
export const AVAILABILITY_NOTE =
  'All bookings are subject to availability and confirmation by our Reservations team.'

/**
 * Match a room name to its published rate, e.g. "Bungalow 4- Beachfront Deluxe 1BR"
 * or "2BR Superior Bungalow (Lagoon View)". Returns null when the name is unclear.
 */
export function rateForRoomName(name: string): AccommodationRate | null {
  const n = name.toLowerCase()
  const beds = n.match(/(\d)\s*-?\s*(br\b|bed)/)
  const two = beds ? beds[1] === '2' : /\b(two|2)\b/.test(n)
  const one = beds ? beds[1] === '1' : /\b(one|1)\b/.test(n)
  const pick = (id: AccommodationRate['id']) => ACCOMMODATION_RATES.find((r) => r.id === id) ?? null
  if (n.includes('beachfront')) return two ? pick('beachfront-2br') : one ? pick('beachfront-1br') : null
  if (n.includes('garden')) return pick('garden-2br')
  if (n.includes('lagoon')) return two ? pick('lagoon-2br') : one ? pick('lagoon-1br') : null
  return null
}

/** Nightly rate for a room: the published rate when known, otherwise the stored price. */
export function nightlyRateVt(room: { name: string; price_vt: number }): number {
  return rateForRoomName(room.name)?.nightlyVt ?? room.price_vt
}
