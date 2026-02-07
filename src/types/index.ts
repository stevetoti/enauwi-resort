export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Conversation {
  id: string
  guest_id: string
  channel: string
  language: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  language: string
  created_at: string
}

export interface Room {
  id: string
  name: string
  type: string
  description: string
  price_vt: number
  max_guests: number
  amenities: string[]
  images: string[]
  available: boolean
  created_at: string
  tagline?: string
  bed_config?: string
}

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  language: string
  preferences: Record<string, string>
  created_at: string
}

export interface Booking {
  id: string
  room_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'
  notes: string
  language: string
  total_price?: number
  num_guests: number
  special_requests?: string
  created_at: string
  room?: Room
}

export interface Staff {
  id: string
  email: string
  password_hash: string
  name: string
  role: 'super_admin' | 'manager' | 'staff'
  created_at: string
}

export interface RoomAvailability {
  id: string
  room_id: string
  date: string
  available: boolean
  price_override?: number
  room?: Room
}

export interface BookingFormData {
  checkIn?: string
  checkOut?: string
  check_in?: string
  check_out?: string
  guests: number
  roomId?: string
  room_id?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  specialRequests?: string
  special_requests?: string
  payment_method?: string
  total_price?: number
}

export interface AdminStats {
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  totalRevenue: number
  pendingBookings: number
}

export interface Service {
  id: string
  name: string
  category: 'conference' | 'food_beverage' | 'activities' | 'other_services'
  description: string
  unit_price: number
  price_unit: string
  is_placeholder_price: boolean
  amenities: string[] | null
  available: boolean
  sort_order: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ConferenceBooking {
  id: string
  service_id: string
  booking_date: string
  start_time: string
  end_time: string
  booking_type: 'half_day' | 'full_day'
  number_of_attendees: number
  special_requirements: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  total_price: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  created_at: string
  updated_at: string
  service?: Service
}

export interface ServiceOrder {
  id: string
  booking_id: string | null
  service_id: string
  quantity: number
  unit_price: number
  total_price: number
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  notes: string | null
  room_number: string | null
  guest_name: string | null
  guest_email: string | null
  created_at: string
  updated_at: string
  service?: Service
  booking?: Booking
}