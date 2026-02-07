'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Calendar, Users, ChevronLeft, ChevronRight, Check, Star, ArrowLeft, X,
  MessageCircle, Sun, Gift, Heart, Cake, Sparkles, Clock, Shield,
  Percent, Phone, Waves, Camera, Fish, MapPin, Plus, Minus
} from 'lucide-react'
import { Room } from '@/types'
import { formatVatu, getDaysBetween } from '@/lib/utils'

// Hero images
const heroImages = [
  '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
  '/images/resort/malili-rooms/beach-kayaks-opt-pro.jpg',
  '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg',
]

// Room galleries
const roomGalleries: Record<string, string[]> = {
  '2br-deluxe': [
    '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-3-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg',
    '/images/resort/malili-rooms/bedroom-1-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
    '/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg',
    '/images/resort/malili-rooms/tea-coffee-station-opt-pro.jpg',
  ],
  '2br-superior': [
    '/images/resort/malili-rooms/living-room-8-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/twin-bedroom-3-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-toiletries-opt-pro.jpg',
    '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg',
    '/images/resort/malili-rooms/welcome-sofa-view-opt-pro.jpg',
  ],
  '1br-deluxe': [
    '/images/resort/malili-rooms/living-room-5-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-2-opt-pro.jpg',
    '/images/resort/malili-rooms/living-kitchenette-opt-pro.jpg',
    '/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
  ],
  '1br-superior': [
    '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-1-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-3-opt-pro.jpg',
    '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg',
    '/images/resort/malili-rooms/welcome-nawimba-opt-pro.jpg',
  ],
  'beachfront': [
    '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg',
    '/images/resort/malili-rooms/bedroom-1-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
    '/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg',
  ],
  'lagoon': [
    '/images/resort/malili-rooms/living-room-8-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/twin-bedroom-3-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-toiletries-opt-pro.jpg',
  ],
  'garden': [
    '/images/resort/malili-rooms/living-room-9-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-1-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-3-opt-pro.jpg',
    '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg',
  ],
  'default': [
    '/images/resort/malili-rooms/living-room-1-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
    '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg',
  ],
}

// Guest reviews
const reviews = [
  { name: 'Sarah M.', country: '🇦🇺 Australia', rating: 5, text: 'Absolutely magical! The lagoon views are breathtaking and staff made us feel like family.', date: 'Jan 2026' },
  { name: 'James K.', country: '🇳🇿 New Zealand', rating: 5, text: 'Best snorkeling we\'ve ever experienced. The bungalow was spotless and so peaceful.', date: 'Dec 2025' },
  { name: 'Marie L.', country: '🇫🇷 France', rating: 5, text: 'A hidden paradise! Perfect for our honeymoon. The sunset dinners were unforgettable.', date: 'Nov 2025' },
  { name: 'David T.', country: '🇺🇸 USA', rating: 5, text: 'Exceeded all expectations. Authentic Vanuatu hospitality at its finest.', date: 'Jan 2026' },
]

// Activities for add-ons
const activities = [
  { id: 'snorkel', name: 'Snorkeling Trip', price: 5000, icon: Fish, duration: '2 hours', description: 'Explore vibrant coral reefs' },
  { id: 'island', name: 'Island Hopping', price: 8000, icon: MapPin, duration: 'Half day', description: 'Visit 3 nearby islands' },
  { id: 'kayak', name: 'Kayak Adventure', price: 3000, icon: Waves, duration: '1.5 hours', description: 'Paddle through the lagoon' },
  { id: 'photo', name: 'Sunset Photoshoot', price: 12000, icon: Camera, duration: '1 hour', description: 'Professional beach photos' },
]

// Special occasions
const occasions = [
  { id: 'none', label: 'Just a getaway', icon: Sun },
  { id: 'honeymoon', label: 'Honeymoon', icon: Heart },
  { id: 'anniversary', label: 'Anniversary', icon: Sparkles },
  { id: 'birthday', label: 'Birthday', icon: Cake },
  { id: 'special', label: 'Special Celebration', icon: Gift },
]

// Weather data (simulated - would connect to real API)
function WeatherWidget() {
  const [weather] = useState({ temp: 28, condition: 'Sunny', humidity: 75 })
  return (
    <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-sky-500 to-blue-500 text-white px-3 py-1.5 rounded-full">
      <Sun className="w-4 h-4" />
      <span>{weather.temp}°C</span>
      <span className="text-white/70">|</span>
      <span>{weather.condition}</span>
    </div>
  )
}

// Live viewers indicator
function LiveViewers() {
  const [viewers, setViewers] = useState(3)
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 4) + 2)
    }, 15000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-gray-600">{viewers} guests viewing now</span>
    </div>
  )
}

// Countdown timer for special offer
function CountdownTimer() {
  const [time, setTime] = useState({ hours: 2, minutes: 0, seconds: 0 })
  useEffect(() => {
    const endTime = Date.now() + 2 * 60 * 60 * 1000
    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        clearInterval(interval)
        return
      }
      setTime({
        hours: Math.floor(remaining / (1000 * 60 * 60)),
        minutes: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((remaining % (1000 * 60)) / 1000)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(time.hours).padStart(2, '0')}</span>:
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(time.minutes).padStart(2, '0')}</span>:
      <span className="bg-gray-900 text-white px-1.5 py-0.5 rounded">{String(time.seconds).padStart(2, '0')}</span>
    </div>
  )
}

// Reviews carousel
function ReviewsCarousel() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % reviews.length), 5000)
    return () => clearInterval(timer)
  }, [])
  const review = reviews[current]
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1 mb-2">
        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
        <span className="text-sm text-gray-500 ml-2">{review.date}</span>
      </div>
      <p className="text-gray-700 text-sm mb-3 italic">&ldquo;{review.text}&rdquo;</p>
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-gray-900">{review.name}</span>
          <span className="text-gray-500 ml-2">{review.country}</span>
        </div>
        <div className="flex gap-1">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full ${i === current ? 'bg-blue-600' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Hero slider
function HeroSlider() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent(p => (p + 1) % heroImages.length), 5000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="relative w-full h-full">
      {heroImages.map((src, idx) => (
        <Image key={idx} src={src} alt="E'Nauwi Beach Resort" fill
          className={`object-cover transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
          priority={idx === 0} sizes="100vw" />
      ))}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}

// Room gallery
function RoomGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  return (
    <>
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-gray-100">
        <Image src={images[current]} alt="Room" fill className="object-cover cursor-pointer" 
          onClick={() => setShowLightbox(true)} sizes="(max-width: 768px) 100vw, 450px" loading="lazy" />
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
          📷 {current + 1}/{images.length}
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {images.slice(0, 3).map((img, idx) => (
            <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
              className={`w-10 h-10 rounded-lg overflow-hidden border-2 ${idx === current ? 'border-white' : 'border-transparent opacity-70'}`}>
              <Image src={img} alt="" width={40} height={40} className="object-cover w-full h-full" />
            </button>
          ))}
          {images.length > 3 && (
            <button onClick={() => setShowLightbox(true)} className="w-10 h-10 rounded-lg bg-black/60 text-white text-xs font-bold flex items-center justify-center">
              +{images.length - 3}
            </button>
          )}
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl" onClick={() => setShowLightbox(false)}><X /></button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white" onClick={(e) => { e.stopPropagation(); setCurrent(p => (p - 1 + images.length) % images.length); }}>
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white" onClick={(e) => { e.stopPropagation(); setCurrent(p => (p + 1) % images.length); }}>
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="relative w-full max-w-4xl h-[75vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image src={images[current]} alt="Room" fill className="object-contain" sizes="100vw" />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
            {current + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}

// WhatsApp button
function WhatsAppButton() {
  return (
    <a href="https://wa.me/67822170?text=Hi!%20I'm%20interested%20in%20booking%20at%20E'Nauwi%20Beach%20Resort"
      target="_blank" rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 flex items-center gap-2 group">
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
        Chat with us
      </span>
    </a>
  )
}

function BookingContent() {
  const searchParams = useSearchParams()
  const selectedRoomParam = searchParams.get('room')
  
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({ name: '', email: '', phone: '', requests: '' })
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [highlightedRoom, setHighlightedRoom] = useState<string | null>(selectedRoomParam)
  const [selectedOccasion, setSelectedOccasion] = useState('none')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  
  const roomRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2)
    setCheckIn(tomorrow.toISOString().split('T')[0])
    setCheckOut(dayAfter.toISOString().split('T')[0])
  }, [])

  const searchRooms = useCallback(async () => {
    if (!checkIn || !checkOut) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ checkIn, checkOut, guests: guests.toString() })
      const response = await fetch(`/api/rooms?${params}`)
      const data = await response.json()
      if (!data.error) setRooms(data.rooms)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [checkIn, checkOut, guests])

  useEffect(() => {
    if (checkIn && checkOut) searchRooms()
  }, [checkIn, checkOut, guests, searchRooms])

  useEffect(() => {
    if (selectedRoomParam && rooms.length > 0) {
      const matchingRoom = rooms.find(r => r.name.toLowerCase().includes(selectedRoomParam.split('-')[0]))
      if (matchingRoom) {
        setTimeout(() => {
          roomRefs.current[matchingRoom.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setHighlightedRoom(matchingRoom.id.toString())
          setTimeout(() => setHighlightedRoom(null), 3000)
        }, 300)
      }
    }
  }, [selectedRoomParam, rooms])

  const calculateNights = () => checkIn && checkOut ? getDaysBetween(checkIn, checkOut) : 1
  const calculateTotal = (room: Room) => room.price_vt * calculateNights()
  const calculateActivitiesTotal = () => selectedActivities.reduce((sum, id) => {
    const activity = activities.find(a => a.id === id)
    return sum + (activity?.price || 0)
  }, 0)
  const calculateGrandTotal = (room: Room) => calculateTotal(room) + calculateActivitiesTotal()

  const getRoomGallery = (room: Room) => {
    const name = room.name.toLowerCase()
    if (name.includes('beachfront') && name.includes('deluxe') && name.includes('2')) return roomGalleries['2br-deluxe']
    if (name.includes('beachfront') && name.includes('deluxe')) return roomGalleries['beachfront']
    if (name.includes('lagoon') && name.includes('superior') && name.includes('2')) return roomGalleries['2br-superior']
    if (name.includes('lagoon') && name.includes('superior')) return roomGalleries['lagoon']
    if (name.includes('garden')) return roomGalleries['garden']
    if (name.includes('2') && name.includes('deluxe')) return roomGalleries['2br-deluxe']
    if (name.includes('2') && name.includes('superior')) return roomGalleries['2br-superior']
    if (name.includes('1') && name.includes('deluxe')) return roomGalleries['1br-deluxe']
    if (name.includes('1') && name.includes('superior')) return roomGalleries['1br-superior']
    return roomGalleries['default']
  }

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  const handleBooking = async () => {
    if (!selectedRoom || !bookingData.name || !bookingData.email) return
    setSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: selectedRoom.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
          guest_name: bookingData.name,
          guest_email: bookingData.email,
          guest_phone: bookingData.phone,
          special_requests: `${selectedOccasion !== 'none' ? `[${occasions.find(o => o.id === selectedOccasion)?.label}] ` : ''}${bookingData.requests}${selectedActivities.length > 0 ? ` | Activities: ${selectedActivities.join(', ')}` : ''}`,
          total_price: calculateGrandTotal(selectedRoom),
        }),
      })
      const data = await response.json()
      if (data.booking) {
        setBookingSuccess(data.booking.id)
        setShowBookingForm(false)
      }
    } catch (error) {
      console.error('Booking error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-6">Your reservation has been confirmed. Check your email for details.</p>
          <p className="text-sm text-gray-500 mb-6">Reference: <span className="font-mono font-bold">ENW-{bookingSuccess.slice(0, 8).toUpperCase()}</span></p>
          <Link href="/" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Hero */}
      <div className="relative h-[40vh] min-h-[320px]">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back to E&apos;Nauwi
          </Link>
          <WeatherWidget />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              <span className="text-white/80 text-sm ml-1">9.4/10 · 127 reviews</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white">E&apos;Nauwi Beach Resort</h1>
            <p className="text-white/80">Malekula Island, Vanuatu</p>
          </div>
        </div>
      </div>

      {/* Book Direct Benefits Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            <span><strong>10% OFF</strong> vs booking sites</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            <span>Free welcome drink</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Free cancellation 14+ days</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <span>Direct resort support</span>
          </div>
        </div>
      </div>

      {/* Special Offer Timer */}
      <div className="bg-amber-50 border-b border-amber-200 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-amber-800">Book in the next</span>
          <CountdownTimer />
          <span className="text-amber-800">for <strong>free airport transfer</strong>!</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-4 -mt-0 pt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} min={checkIn}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 bg-white">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-end col-span-2 sm:col-span-1">
              <button onClick={searchRooms} disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Left Column - Rooms */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Available Rooms</h2>
                <p className="text-gray-500 text-sm">{calculateNights()} night{calculateNights() > 1 ? 's' : ''} • {rooms.length} available</p>
              </div>
              <LiveViewers />
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin text-3xl mb-3">🏝️</div>
                <p className="text-gray-500">Finding perfect rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-5xl mb-3">🏖️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">No rooms available</h3>
                <p className="text-gray-500 text-sm">Try different dates</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {rooms.map(room => (
                  <div key={room.id} ref={el => { roomRefs.current[room.id] = el }}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                      highlightedRoom === room.id.toString() ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-100'
                    }`}>
                    <div className="grid md:grid-cols-[380px_1fr]">
                      <div className="p-3">
                        <RoomGallery images={getRoomGallery(room)} />
                      </div>
                      <div className="p-5 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{room.name}</h3>
                              <p className="text-sm text-blue-600 font-medium">{room.tagline || 'Beachfront'}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                              <Star className="w-3 h-3 fill-current" /> 9.2
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{room.description}</p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {room.amenities?.slice(0, 5).map((amenity, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                <Check className="w-3 h-3 text-green-600" /> {amenity}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>👥 Up to {room.max_guests}</span>
                            <span>🛏️ {room.bed_config || 'Queen'}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-500">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</p>
                            <p className="text-2xl font-bold text-gray-900">{formatVatu(calculateTotal(room))}</p>
                            <p className="text-xs text-green-600 font-medium">10% less than booking sites!</p>
                          </div>
                          <button onClick={() => { setSelectedRoom(room); setShowBookingForm(true); }}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
                            Reserve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Reviews */}
            <ReviewsCarousel />

            {/* Special Occasion */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-4 h-4 text-pink-500" /> Celebrating something special?
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {occasions.map(occ => (
                  <button key={occ.id} onClick={() => setSelectedOccasion(occ.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-sm transition ${
                      selectedOccasion === occ.id ? 'bg-pink-50 border-pink-300 border-2 text-pink-700' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    <occ.icon className="w-4 h-4" />
                    <span className="text-xs">{occ.label}</span>
                  </button>
                ))}
              </div>
              {selectedOccasion !== 'none' && (
                <p className="text-xs text-pink-600 mt-2">🎉 We&apos;ll prepare a special surprise!</p>
              )}
            </div>

            {/* Add Activities */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-500" /> Add experiences
              </h3>
              <div className="space-y-2">
                {activities.map(act => (
                  <button key={act.id} onClick={() => toggleActivity(act.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                      selectedActivities.includes(act.id) ? 'bg-blue-50 border-blue-300 border-2' : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}>
                    <act.icon className={`w-5 h-5 ${selectedActivities.includes(act.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{act.name}</p>
                      <p className="text-xs text-gray-500">{act.duration} · {act.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatVatu(act.price)}</p>
                      {selectedActivities.includes(act.id) ? (
                        <Minus className="w-4 h-4 text-blue-600 ml-auto" />
                      ) : (
                        <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {selectedActivities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm">
                  <span className="text-gray-600">Activities total:</span>
                  <span className="font-bold">{formatVatu(calculateActivitiesTotal())}</span>
                </div>
              )}
            </div>

            {/* Policies */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">🕐 Check-in & Check-out</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span className="font-semibold">2:00 PM</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span className="font-semibold">10:00 AM</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBookingForm(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold">Complete Booking</h3>
              <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              {/* Room Summary */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <h4 className="font-semibold text-gray-900 text-sm">{selectedRoom.name}</h4>
                <p className="text-xs text-gray-500">{checkIn} → {checkOut} • {calculateNights()} night{calculateNights() > 1 ? 's' : ''}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Room</span>
                  <span className="font-bold">{formatVatu(calculateTotal(selectedRoom))}</span>
                </div>
                {selectedActivities.length > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">Activities ({selectedActivities.length})</span>
                    <span className="font-bold">{formatVatu(calculateActivitiesTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatVatu(calculateGrandTotal(selectedRoom))}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={bookingData.name} onChange={e => setBookingData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={bookingData.email} onChange={e => setBookingData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={bookingData.phone} onChange={e => setBookingData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" placeholder="+678 xxx xxxx" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea value={bookingData.requests} onChange={e => setBookingData(p => ({ ...p, requests: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Any requests..." />
                </div>
              </div>

              {selectedOccasion !== 'none' && (
                <div className="mt-3 p-3 bg-pink-50 rounded-xl flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-500" />
                  <span className="text-sm text-pink-700">🎉 {occasions.find(o => o.id === selectedOccasion)?.label} celebration noted!</span>
                </div>
              )}

              <button onClick={handleBooking} disabled={submitting || !bookingData.name || !bookingData.email}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-3">
                🔒 Your payment details are secure. Free cancellation up to 14 days before check-in.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin text-4xl">🏝️</div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
