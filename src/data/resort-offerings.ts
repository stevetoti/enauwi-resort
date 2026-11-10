// The resort's current rates, guest charges and tours — one source for the homepage,
// /activities, the booking form, the Terms page and the AI concierge prompt.
// Source: Reservations team emails of 8 Nov 2026 + "Daily Tours & Activities" flyer.
// Booking-page prices come from rooms.price_vt, which already matches ROOM_RATES.

export interface RoomRate {
  category: string
  bedrooms: 1 | 2
  rate: number
}

export const ROOM_RATES: RoomRate[] = [
  { category: 'Beachfront Deluxe', bedrooms: 2, rate: 27000 },
  { category: 'Lagoon View', bedrooms: 2, rate: 23000 },
  { category: 'Garden View', bedrooms: 2, rate: 19550 },
  { category: 'Beachfront Deluxe', bedrooms: 1, rate: 22000 },
  { category: 'Lagoon View', bedrooms: 1, rate: 18000 },
]

export const RATES_NOTE = 'All rates are per night in Vanuatu Vatu (VT) and include breakfast.'

export interface GuestService {
  name: string
  price: string
  detail?: string
}

export const GUEST_SERVICES: GuestService[] = [
  { name: 'Airport Shuttle', price: 'VT 3,000 per adult · VT 1,500 per child (5–17 years)' },
  { name: 'Nanny Services', price: 'VT 2,000 per hour' },
  { name: 'Late Checkout', price: 'VT 10,000', detail: 'Extended checkout past 6:00 PM' },
  { name: 'Guest Laundry', price: 'Charged per item' },
  { name: 'Conference Room Hire', price: 'VT 80,000 per day' },
]

export interface Tour {
  id: string
  day: string
  name: string
  times: string[]
  highlights: string[]
  adultPrice: number // 0 = free
  childPrice: number // children 5–17 years
  place?: string
}

export const WEEKLY_TOURS: Tour[] = [
  {
    id: 'epakor-kayak',
    day: 'Monday',
    name: 'Epakor Stream Tour on Kayak',
    times: ['10:00 AM – 12:00 PM'],
    highlights: ['Kayak around the beautiful lagoon', 'Fresh sea breeze through the mangroves', 'Kayak to the natural stream'],
    adultPrice: 1000,
    childPrice: 500,
  },
  {
    id: 'epakor-walk',
    day: 'Tuesday',
    name: 'Epakor Stream Tour & Nature Walk',
    times: ['10:00 AM – 12:00 PM'],
    highlights: ['Walk to the natural stream', 'Fresh nature breeze'],
    adultPrice: 1000,
    childPrice: 500,
  },
  {
    id: 'village-handicraft',
    day: 'Wednesday',
    name: 'Village Tours & Local Handicraft',
    times: ['10:00 AM – 12:00 PM'],
    highlights: [
      'Walk through the village of Eratap',
      'Visit the local community',
      "Visit local mama's handicrafts",
      'Visit Eratap School and join fun activities with the school children',
      'Beautiful views of the small islands of Eratap',
    ],
    adultPrice: 1000,
    childPrice: 500,
  },
  {
    id: 'island-kayak',
    day: 'Thursday',
    name: 'Island Tour by Kayak',
    times: ['9:00 AM – 12:00 PM (morning trip)', '1:00 PM – 4:00 PM (afternoon trip)'],
    highlights: ['Kayak around the lagoon', 'Beautiful views'],
    adultPrice: 0,
    childPrice: 0,
  },
  {
    id: 'island-walk',
    day: 'Friday & Saturday',
    name: 'Island Tour & Nature Walk',
    times: ['9:00 AM – 12:00 PM', '1:00 PM – 4:00 PM'],
    highlights: ['Go to the island by kayak or by boat', 'Tour the island with history telling', 'Eat fresh fruits', 'Go for a swim'],
    adultPrice: 1000,
    childPrice: 500,
  },
  {
    id: 'sunday-church',
    day: 'Sunday',
    name: 'Sunday Church Service',
    times: ['10:00 AM – 12:00 PM'],
    highlights: ['Visit or attend our local church'],
    adultPrice: 0,
    childPrice: 0,
    place: 'Assemblies of God Church',
  },
]

export interface ExtraActivity {
  id: string
  name: string
  price: string
  addOnPrice: number // per adult / per hour / per trip, used as the booking-form estimate
  addOnUnit: string
}

export const MORE_ACTIVITIES: ExtraActivity[] = [
  { id: 'castaway', name: 'Castaway Island Boat Tour & Transfer', price: 'VT 1,500 per adult · VT 500 per child (5–17 years)', addOnPrice: 1500, addOnUnit: 'per adult' },
  { id: 'snorkeling', name: 'Snorkeling', price: 'VT 2,000 per adult · VT 500 per child (5–17 years)', addOnPrice: 2000, addOnUnit: 'per adult' },
  { id: 'boat-tour', name: 'Boat Tour', price: 'VT 2,000 per trip', addOnPrice: 2000, addOnUnit: 'per trip' },
  { id: 'surfing', name: 'Surfing', price: 'VT 3,000 per hour', addOnPrice: 3000, addOnUnit: 'per hour' },
]

export const TOUR_BOOKING_NOTE =
  'Book your tour or activity at the Front Desk by the day before — same-day requests cannot be guaranteed. Times may change depending on weather and availability.'

export function formatVT(amount: number): string {
  return `VT ${amount.toLocaleString('en-US')}`
}

export function tourPrice(t: Tour): string {
  if (t.adultPrice === 0) return 'Free'
  return `${formatVT(t.adultPrice)} per adult · ${formatVT(t.childPrice)} per child (5–17 years)`
}

// English knowledge block for the AI concierge (all languages include it).
export function offeringsKnowledge(): string {
  const rooms = ROOM_RATES.map((r) => `• ${r.category} ${r.bedrooms} Bedroom — ${formatVT(r.rate)}/night`).join('\n')
  const services = GUEST_SERVICES.map((s) => `• ${s.name}: ${s.detail ? `${s.detail} — ` : ''}${s.price}`).join('\n')
  const tours = WEEKLY_TOURS.map(
    (t) => `• ${t.day} — ${t.name} (${t.times.join(' / ')}${t.place ? `, ${t.place}` : ''}): ${t.highlights.join('; ')}. ${tourPrice(t)}`
  ).join('\n')
  const more = MORE_ACTIVITIES.map((a) => `• ${a.name}: ${a.price}`).join('\n')
  return `CURRENT ROOM RATES (official — always quote these):
${rooms}
${RATES_NOTE}

GUEST SERVICES & CHARGES (official):
${services}

DAILY TOURS & ACTIVITIES (weekly schedule — official, the ONLY tours the resort offers):
${tours}

MORE ACTIVITIES:
${more}

${TOUR_BOOKING_NOTE}
Do not mention any other tours (no volcano, fishing, cooking class, sand drawing or diving trips).`
}
