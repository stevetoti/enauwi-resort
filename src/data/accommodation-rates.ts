// How website room bookings are handled.
//
// BOOKING_MODE
//   'request'  — the website takes reservation ENQUIRIES only. Nothing is confirmed
//                online: the Reservations team checks availability against
//                Booking.com and confirms by email. (Current mode — there is no
//                channel manager, and instant website bookings caused double bookings.
//                Requested by Reservations/Marketing, 7 Nov 2026.)
//   'instant'  — previous behaviour (booking confirmed on submit). Only switch back
//                once a channel manager keeps the website and Booking.com in sync.
//
// Prices are unchanged: rooms.price_vt (booking page) and the existing homepage/chat
// figures (Stephen, 8 Nov 2026 — do not change prices).

export const BOOKING_MODE: 'request' | 'instant' = 'request'
export const IS_REQUEST_MODE = BOOKING_MODE === 'request'

export const RESERVATIONS_EMAIL = 'reservation@enauwibeachresort.com'
export const RESERVATIONS_PHONE = '+678 22170'

export const AVAILABILITY_NOTE =
  'All bookings are subject to availability and confirmation by our Reservations team.'
