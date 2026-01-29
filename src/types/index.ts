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
  amenities: any
  images: any
  available: boolean
}

export interface Guest {
  id: string
  name: string
  email: string
  phone: string
  language: string
  preferences: any
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
  status: string
  notes: string
  language: string
  created_at: string
}