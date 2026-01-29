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
  checkIn: string
  checkOut: string
  guests: number
  roomId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  specialRequests?: string
}

export interface AdminStats {
  totalBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupancyRate: number
  totalRevenue: number
  pendingBookings: number
}