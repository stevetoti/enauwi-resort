'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, X, Globe, Bot, Phone, ExternalLink, CheckCircle } from 'lucide-react'
import type { ChatMessage } from '@/types'

const languages = {
  en: { name: 'English', flag: '🇬🇧' },
  bi: { name: 'Bislama', flag: '🇻🇺' },
  fr: { name: 'Français', flag: '🇫🇷' },
  zh: { name: '中文', flag: '🇨🇳' }
}

const translations = {
  en: {
    welcome: 'Welkam! Welcome to E\'Nauwi Beach Resort! How can I help you today?',
    placeholder: 'Type your message...',
    send: 'Send',
    minimize: 'Minimize chat',
    language: 'Language'
  },
  bi: {
    welcome: 'Welkam! Welkam long E\'Nauwi Beach Resort! Olsem wanem mi save helpem yu today?',
    placeholder: 'Taepem mesij blong yu...',
    send: 'Sendem',
    minimize: 'Smolmakem chat',
    language: 'Language'
  },
  fr: {
    welcome: 'Welkam! Bienvenue au E\'Nauwi Beach Resort! Comment puis-je vous aider aujourd\'hui?',
    placeholder: 'Tapez votre message...',
    send: 'Envoyer',
    minimize: 'Minimiser le chat',
    language: 'Langue'
  },
  zh: {
    welcome: 'Welkam! 欢迎来到E\'Nauwi海滩度假村！今天我可以为您做些什么？',
    placeholder: '请输入您的消息...',
    send: '发送',
    minimize: '最小化聊天',
    language: '语言'
  }
}

const quickReplies = [
  { label: '🏨 Show me rooms', message: 'Show me the available rooms and prices' },
  { label: '🏄 Activities', message: 'What activities and experiences do you offer?' },
  { label: '✈️ How to get there', message: 'How do I get to E\'Nauwi Beach Resort?' },
  { label: '📅 Book now', message: 'I want to book a room' },
]

// Room data for rendering cards
const roomData: Record<string, { name: string; image: string; price: string; description: string; amenities: string[]; apiKey: string }> = {
  '2br deluxe': {
    name: '2BR Deluxe Beachfront',
    image: '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
    price: '30,000 VT',
    description: 'Lagoon beachfront with 1 Queen + 2 Single beds',
    amenities: ['🏖️ Beachfront', '👥 4 Guests', '❄️ AC'],
    apiKey: 'beachfront-deluxe-2',
  },
  '2br superior': {
    name: '2BR Superior Lagoon View',
    image: '/images/resort/malili-rooms/living-room-8-opt-pro.jpg',
    price: '27,000 VT',
    description: 'Lagoon view with 1 Queen + 2 Single beds',
    amenities: ['🌊 Lagoon View', '👥 4 Guests', '❄️ AC'],
    apiKey: 'lagoon-view-2',
  },
  '1br deluxe': {
    name: '1BR Deluxe Beachfront',
    image: '/images/resort/malili-rooms/living-room-5-opt-pro.jpg',
    price: '25,000 VT',
    description: 'Lagoon beachfront with Queen bed',
    amenities: ['🏖️ Beachfront', '👥 2 Guests', '❄️ AC'],
    apiKey: 'beachfront-deluxe-1',
  },
  '1br superior': {
    name: '1BR Superior Lagoon View',
    image: '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg',
    price: '22,000 VT',
    description: 'Lagoon view with Queen bed',
    amenities: ['🌊 Lagoon View', '👥 2 Guests', '❄️ AC'],
    apiKey: 'lagoon-view-1',
  },
}

// Booking flow state
interface BookingData {
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: string
  check_out_date: string
  room_type: string
  num_guests: number
  special_requests: string
}

type BookingStep = 'idle' | 'name' | 'email' | 'phone' | 'dates' | 'room' | 'guests' | 'requests' | 'confirm' | 'complete'

// Detect booking intent
function detectBookingIntent(text: string): boolean {
  const lower = text.toLowerCase()
  const bookingPhrases = [
    'i want to book',
    'book a room',
    'make a reservation',
    'reserve a room',
    'i\'d like to book',
    'i would like to book',
    'can i book',
    'booking',
    'make a booking',
    'start booking',
    'book now',
    'reserve now',
    'i want to reserve',
    'accommodation booking',
  ]
  return bookingPhrases.some(phrase => lower.includes(phrase))
}

// Simple markdown renderer
function renderMarkdown(text: string): string {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-blue-400 underline hover:text-blue-300">$1</a>')
    // Lists: lines starting with - or •
    .replace(/^[\-•]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Numbers list: 1. text
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br>')
}

// Detect room mentions in text
function detectRoomMentions(text: string): string[] {
  const rooms: string[] = []
  const lower = text.toLowerCase()
  for (const key of Object.keys(roomData)) {
    if (lower.includes(key)) {
      rooms.push(key)
    }
  }
  // Also detect by price patterns
  if (lower.includes('30,000') || lower.includes('30000')) {
    if (!rooms.includes('2br deluxe')) rooms.push('2br deluxe')
  }
  if (lower.includes('27,000') || lower.includes('27000')) {
    if (!rooms.includes('2br superior')) rooms.push('2br superior')
  }
  if (lower.includes('25,000') || lower.includes('25000')) {
    if (!rooms.includes('1br deluxe')) rooms.push('1br deluxe')
  }
  if (lower.includes('22,000') || lower.includes('22000')) {
    if (!rooms.includes('1br superior')) rooms.push('1br superior')
  }
  // Detect by room type keywords
  if (lower.includes('2 bedroom') || lower.includes('two bedroom') || lower.includes('2br')) {
    if (!rooms.includes('2br deluxe')) rooms.push('2br deluxe')
    if (!rooms.includes('2br superior')) rooms.push('2br superior')
  }
  if (lower.includes('1 bedroom') || lower.includes('one bedroom') || lower.includes('1br')) {
    if (!rooms.includes('1br deluxe')) rooms.push('1br deluxe')
    if (!rooms.includes('1br superior')) rooms.push('1br superior')
  }
  if (lower.includes('beachfront') && lower.includes('deluxe')) {
    if (!rooms.includes('2br deluxe')) rooms.push('2br deluxe')
    if (!rooms.includes('1br deluxe')) rooms.push('1br deluxe')
  }
  return rooms
}

function RoomCard({ roomKey, onSelect }: { roomKey: string; onSelect?: (roomKey: string) => void }) {
  const room = roomData[roomKey]
  if (!room) return null
  
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm my-2">
      <div className="h-28 relative">
        <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-ocean-dark/80 text-white text-xs font-bold px-2 py-1 rounded-full">
          {room.price}/night
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-gray-900 mb-1">{room.name}</h4>
        <p className="text-xs text-gray-500 mb-2">{room.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {room.amenities.map((a, i) => (
            <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
        <div className="flex gap-2">
          {onSelect ? (
            <button
              onClick={() => onSelect(roomKey)}
              className="flex-1 text-center text-xs font-semibold bg-gold text-ocean-dark py-1.5 rounded-lg hover:bg-gold-light transition-colors"
            >
              Select This Room
            </button>
          ) : (
            <a
              href={`/book`}
              className="flex-1 text-center text-xs font-semibold bg-gold text-ocean-dark py-1.5 rounded-lg hover:bg-gold-light transition-colors"
            >
              Book Now
            </a>
          )}
          <a
            href="#accommodations"
            className="flex items-center justify-center gap-1 text-xs font-medium text-ocean border border-ocean/20 px-2 py-1.5 rounded-lg hover:bg-ocean-50 transition-colors"
          >
            <ExternalLink size={10} />
            View
          </a>
        </div>
      </div>
    </div>
  )
}

// Booking confirmation card
function BookingConfirmationCard({ reference, roomName, checkIn, checkOut, total }: {
  reference: string
  roomName: string
  checkIn: string
  checkOut: string
  total: string
}) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4 my-2">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="text-green-600" size={20} />
        <span className="font-semibold text-green-800">Booking Confirmed!</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Reference:</span>
          <span className="font-bold text-green-700">{reference}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Room:</span>
          <span className="text-gray-800">{roomName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Check-in:</span>
          <span className="text-gray-800">{checkIn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Check-out:</span>
          <span className="text-gray-800">{checkOut}</span>
        </div>
        <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
          <span className="text-gray-600 font-semibold">Total:</span>
          <span className="font-bold text-green-700">{total}</span>
        </div>
      </div>
      <p className="text-xs text-green-600 mt-3">
        ✉️ Confirmation email sent! Check your inbox.
      </p>
    </div>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('en')
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  
  // Booking flow state
  const [bookingStep, setBookingStep] = useState<BookingStep>('idle')
  const [bookingData, setBookingData] = useState<BookingData>({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    check_out_date: '',
    room_type: '',
    num_guests: 2,
    special_requests: '',
  })
  const [bookingResult, setBookingResult] = useState<{
    reference: string
    roomName: string
    checkIn: string
    checkOut: string
    total: string
  } | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const t = translations[currentLanguage]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: t.welcome,
        timestamp: new Date()
      }])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, t.welcome])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = 96 // ~4 lines
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [inputMessage, adjustTextareaHeight])

  // Add assistant message helper
  const addAssistantMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content,
      timestamp: new Date()
    }])
  }, [])

  // Submit booking to API
  const submitBooking = async () => {
    setIsTyping(true)
    try {
      const response = await fetch('/api/voice-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBookingResult({
          reference: result.booking_reference,
          roomName: result.room_name,
          checkIn: bookingData.check_in_date,
          checkOut: bookingData.check_out_date,
          total: result.total_price,
        })
        setBookingStep('complete')
        addAssistantMessage(`🎉 **Your booking is confirmed!**\n\nReference: **${result.booking_reference}**\n${result.room_name}\n${result.nights} night(s) - ${result.total_price}\n\nA confirmation email has been sent to ${bookingData.guest_email}.\n\nTangkyu tumas! We look forward to welcoming you to paradise! 🏝️`)
      } else {
        addAssistantMessage(`Sorry, there was an issue: ${result.message}\n\nPlease try again or call us directly at +678 22170.`)
        setBookingStep('idle')
      }
    } catch (error) {
      console.error('Booking error:', error)
      addAssistantMessage('Sorry, there was a problem processing your booking. Please call us at +678 22170.')
      setBookingStep('idle')
    } finally {
      setIsTyping(false)
    }
  }

  // Handle booking step responses
  const handleBookingInput = (text: string) => {
    const input = text.trim()
    
    switch (bookingStep) {
      case 'name':
        if (input.length < 2) {
          addAssistantMessage('Please enter your full name (at least 2 characters).')
          return
        }
        setBookingData(prev => ({ ...prev, guest_name: input }))
        setBookingStep('email')
        addAssistantMessage(`Thanks ${input}! 📧 What's your email address? (We'll send your confirmation here)`)
        break
        
      case 'email':
        if (!input.includes('@') || !input.includes('.')) {
          addAssistantMessage('Please enter a valid email address (e.g., you@example.com).')
          return
        }
        setBookingData(prev => ({ ...prev, guest_email: input }))
        setBookingStep('phone')
        addAssistantMessage('📱 What\'s your phone number? (Include country code, e.g., +61 412 345 678)')
        break
        
      case 'phone':
        if (input.length < 6) {
          addAssistantMessage('Please enter a valid phone number.')
          return
        }
        setBookingData(prev => ({ ...prev, guest_phone: input }))
        setBookingStep('dates')
        addAssistantMessage('📅 When would you like to check in and out?\n\nPlease enter dates like: "Jan 15 to Jan 20" or "2025-01-15 to 2025-01-20"')
        break
        
      case 'dates': {
        // Parse dates from input
        const dateMatch = input.match(/(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}(?:,? \d{4})?)\s*(?:to|->|-|until)\s*(\d{4}-\d{2}-\d{2}|\w+ \d{1,2}(?:,? \d{4})?)/i)
        if (dateMatch) {
          const parseDate = (str: string) => {
            const d = new Date(str)
            if (!isNaN(d.getTime())) {
              return d.toISOString().split('T')[0]
            }
            // Try parsing "Jan 15" format
            const now = new Date()
            const parsed = new Date(`${str}, ${now.getFullYear()}`)
            if (!isNaN(parsed.getTime())) {
              // If date is in the past, use next year
              if (parsed < now) {
                parsed.setFullYear(now.getFullYear() + 1)
              }
              return parsed.toISOString().split('T')[0]
            }
            return ''
          }
          
          const checkIn = parseDate(dateMatch[1])
          const checkOut = parseDate(dateMatch[2])
          
          if (checkIn && checkOut) {
            setBookingData(prev => ({ ...prev, check_in_date: checkIn, check_out_date: checkOut }))
            setBookingStep('room')
            addAssistantMessage(`Great! Check-in: **${checkIn}**, Check-out: **${checkOut}**\n\n🏨 Which room type would you prefer?\n\n1. **2BR Deluxe Beachfront** - 30,000 VT/night (4 guests)\n2. **2BR Superior Lagoon View** - 27,000 VT/night (4 guests)\n3. **1BR Deluxe Beachfront** - 25,000 VT/night (2 guests)\n4. **1BR Superior Lagoon View** - 22,000 VT/night (2 guests)\n\nJust type the number or room name!`)
            return
          }
        }
        addAssistantMessage('I couldn\'t understand those dates. Please try: "2025-01-15 to 2025-01-20" or "Jan 15 to Jan 20"')
        break
      }
        
      case 'room': {
        const lower = input.toLowerCase()
        let roomType = ''
        
        if (lower.includes('1') || lower.includes('2br deluxe') || lower.includes('beachfront') && lower.includes('2')) {
          roomType = 'beachfront-deluxe-2'
        } else if (lower.includes('2') || lower.includes('2br superior') || lower.includes('lagoon') && lower.includes('2')) {
          roomType = 'lagoon-view-2'
        } else if (lower.includes('3') || lower.includes('1br deluxe') || lower.includes('beachfront') && lower.includes('1')) {
          roomType = 'beachfront-deluxe-1'
        } else if (lower.includes('4') || lower.includes('1br superior') || lower.includes('lagoon') && lower.includes('1')) {
          roomType = 'lagoon-view-1'
        } else {
          addAssistantMessage('Please select a room:\n1. 2BR Deluxe Beachfront\n2. 2BR Superior Lagoon View\n3. 1BR Deluxe Beachfront\n4. 1BR Superior Lagoon View')
          return
        }
        
        setBookingData(prev => ({ ...prev, room_type: roomType }))
        setBookingStep('guests')
        addAssistantMessage('👥 How many guests will be staying?')
        break
      }
        
      case 'guests': {
        const num = parseInt(input)
        if (isNaN(num) || num < 1 || num > 6) {
          addAssistantMessage('Please enter a number between 1 and 6.')
          return
        }
        setBookingData(prev => ({ ...prev, num_guests: num }))
        setBookingStep('requests')
        addAssistantMessage('📝 Any special requests? (dietary needs, airport transfer, celebrations, etc.)\n\nType "none" or "skip" if you have no special requests.')
        break
      }
        
      case 'requests': {
        const inputLower = input.toLowerCase()
        if (inputLower !== 'none' && inputLower !== 'skip' && inputLower !== 'no') {
          setBookingData(prev => ({ ...prev, special_requests: input }))
        }
        setBookingStep('confirm')
        
        // Show summary
        const roomName = Object.values(roomData).find(r => r.apiKey === bookingData.room_type)?.name || bookingData.room_type
        addAssistantMessage(`📋 **Please confirm your booking:**\n\n👤 **Name:** ${bookingData.guest_name}\n📧 **Email:** ${bookingData.guest_email}\n📱 **Phone:** ${bookingData.guest_phone}\n📅 **Check-in:** ${bookingData.check_in_date}\n📅 **Check-out:** ${bookingData.check_out_date}\n🏨 **Room:** ${roomName}\n👥 **Guests:** ${bookingData.num_guests}\n${input !== 'none' && input !== 'skip' && input !== 'no' ? `📝 **Requests:** ${input}\n` : ''}\n\nType **"confirm"** to complete your booking or **"cancel"** to start over.`)
        break
      }
        
      case 'confirm': {
        const lower = input.toLowerCase()
        if (lower === 'confirm' || lower === 'yes' || lower === 'ok') {
          addAssistantMessage('⏳ Processing your booking...')
          submitBooking()
        } else if (lower === 'cancel' || lower === 'no' || lower === 'start over') {
          setBookingStep('idle')
          setBookingData({
            guest_name: '',
            guest_email: '',
            guest_phone: '',
            check_in_date: '',
            check_out_date: '',
            room_type: '',
            num_guests: 2,
            special_requests: '',
          })
          addAssistantMessage('Booking cancelled. How else can I help you today?')
        } else {
          addAssistantMessage('Please type **"confirm"** to proceed or **"cancel"** to start over.')
        }
        break
      }
    }
  }

  // Start booking flow
  const startBookingFlow = useCallback(() => {
    setBookingStep('name')
    setShowQuickReplies(false)
    addAssistantMessage('🏝️ **Let\'s book your paradise getaway!**\n\nI\'ll collect a few details to secure your reservation.\n\n👤 First, what\'s your **full name**?')
  }, [addAssistantMessage])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage
    if (!text.trim()) return

    setShowQuickReplies(false)

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // If in booking flow, handle booking input
    if (bookingStep !== 'idle' && bookingStep !== 'complete') {
      handleBookingInput(text)
      return
    }

    // Check for booking intent
    if (detectBookingIntent(text)) {
      startBookingFlow()
      return
    }

    // Normal chat flow
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: currentLanguage,
          messages: messages
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Check if AI response suggests booking
      if (data.message.toLowerCase().includes('would you like to book') || 
          data.message.toLowerCase().includes('ready to book')) {
        // Show a quick booking button after the message
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again or call us at +678 22170.',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
    // Shift+Enter = new line (default behavior)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  // Handle room selection during booking
  const handleRoomSelect = (roomKey: string) => {
    if (bookingStep === 'room') {
      const room = roomData[roomKey]
      if (room) {
        setBookingData(prev => ({ ...prev, room_type: room.apiKey }))
        setBookingStep('guests')
        setMessages(prev => [...prev, {
          role: 'user',
          content: `I'll take the ${room.name}`,
          timestamp: new Date()
        }])
        addAssistantMessage(`Excellent choice! The **${room.name}** at ${room.price}/night. 👥 How many guests will be staying?`)
      }
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[340px] sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">E&apos;Nauwi Concierge</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-blue-100">Online now</p>
                    <span className="text-[10px] text-blue-200">•</span>
                    <a href="tel:+67822170" className="text-xs text-blue-200 hover:text-white flex items-center gap-1">
                      <Phone size={9} />
                      +678 22170
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    title={t.language}
                  >
                    <Globe size={14} />
                  </button>
                  
                  <AnimatePresence>
                    {showLanguageSelector && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-32 z-10"
                      >
                        {Object.entries(languages).map(([code, lang]) => (
                          <button
                            key={code}
                            onClick={() => {
                              setCurrentLanguage(code as keyof typeof languages)
                              setShowLanguageSelector(false)
                            }}
                            className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 flex items-center space-x-2 ${
                              currentLanguage === code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                          >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                  title={t.minimize}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/30 to-white">
              {messages.map((message, index) => {
                const roomMentions = message.role === 'assistant' ? detectRoomMentions(message.content) : []
                const showRoomSelect = bookingStep === 'room' && message.role === 'assistant' && roomMentions.length > 0
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.role === 'user' ? '' : ''}`}>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div 
                            className="chat-markdown leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} 
                          />
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      
                      {/* Room Cards */}
                      {roomMentions.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {roomMentions.map((roomKey) => (
                            <RoomCard 
                              key={roomKey} 
                              roomKey={roomKey} 
                              onSelect={showRoomSelect ? handleRoomSelect : undefined}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Booking confirmation card */}
                      {bookingStep === 'complete' && bookingResult && index === messages.length - 1 && (
                        <BookingConfirmationCard {...bookingResult} />
                      )}
                    </div>
                  </motion.div>
                )
              })}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && messages.length <= 1 && bookingStep === 'idle' && (
              <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/50">
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => sendMessage(qr.message)}
                      className="text-xs px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-all font-medium"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Booking progress indicator */}
            {bookingStep !== 'idle' && bookingStep !== 'complete' && (
              <div className="px-4 py-2 border-t border-blue-100 bg-blue-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-600 font-medium">Booking in progress</span>
                  <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(['name', 'email', 'phone', 'dates', 'room', 'guests', 'requests', 'confirm'].indexOf(bookingStep) + 1) / 8 * 100}%` 
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setBookingStep('idle')
                      setBookingData({
                        guest_name: '',
                        guest_email: '',
                        guest_phone: '',
                        check_in_date: '',
                        check_out_date: '',
                        room_type: '',
                        num_guests: 2,
                        special_requests: '',
                      })
                      addAssistantMessage('Booking cancelled. How else can I help you?')
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={bookingStep !== 'idle' && bookingStep !== 'complete' 
                    ? getBookingPlaceholder(bookingStep) 
                    : t.placeholder}
                  rows={1}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none overflow-hidden"
                  style={{ minHeight: '38px', maxHeight: '96px' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0"
                  style={{ height: '38px' }}
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-center">
                Shift+Enter for new line • Enter to send
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center relative"
      >
        <MessageCircle size={24} />
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </div>
      </motion.button>
    </div>
  )
}

// Helper to get placeholder text for booking steps
function getBookingPlaceholder(step: BookingStep): string {
  switch (step) {
    case 'name': return 'Enter your full name...'
    case 'email': return 'you@example.com'
    case 'phone': return '+61 412 345 678'
    case 'dates': return 'Jan 15 to Jan 20'
    case 'room': return 'Type 1, 2, 3, or 4...'
    case 'guests': return 'Number of guests...'
    case 'requests': return 'Special requests or "none"...'
    case 'confirm': return '"confirm" or "cancel"'
    default: return 'Type your message...'
  }
}
