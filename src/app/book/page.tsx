'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Users, ChevronLeft, ChevronRight, Check, Star, Wifi, Wind, Coffee, Tv, Bath, ArrowLeft, X } from 'lucide-react'
import { Room } from '@/types'
import { formatVatu, getDaysBetween } from '@/lib/utils'

// Hero images for the slider
const heroImages = [
  { src: '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg', alt: 'Lagoon view from living room' },
  { src: '/images/resort/malili-rooms/beach-kayaks-opt-pro.jpg', alt: 'Beach with kayaks' },
  { src: '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg', alt: 'Comfortable queen bed' },
  { src: '/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg', alt: 'Bungalow patio' },
  { src: '/images/resort/malili-rooms/living-room-3-opt-pro.jpg', alt: 'Modern living room' },
]

// Room gallery images
const roomGalleries: Record<string, string[]> = {
  'default': [
    '/images/resort/malili-rooms/living-room-1-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
    '/images/resort/malili-rooms/amenities-tray-opt-pro.jpg',
  ],
  '1br': [
    '/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg',
    '/images/resort/malili-rooms/living-room-5-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-full-opt-pro.jpg',
    '/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg',
  ],
  '2br': [
    '/images/resort/malili-rooms/living-room-3-opt-pro.jpg',
    '/images/resort/malili-rooms/queen-bed-opt-pro.jpg',
    '/images/resort/malili-rooms/bedroom-1-opt-pro.jpg',
    '/images/resort/malili-rooms/living-kitchenette-opt-pro.jpg',
    '/images/resort/malili-rooms/bathroom-toiletries-opt-pro.jpg',
  ],
}

const amenityIcons: Record<string, React.ReactNode> = {
  'wifi': <Wifi className="w-4 h-4" />,
  'air': <Wind className="w-4 h-4" />,
  'coffee': <Coffee className="w-4 h-4" />,
  'tv': <Tv className="w-4 h-4" />,
  'bath': <Bath className="w-4 h-4" />,
}

function ImageSlider({ images, autoPlay = true }: { images: { src: string; alt: string }[]; autoPlay?: boolean }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!autoPlay) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length, autoPlay])

  return (
    <div className="relative w-full h-full overflow-hidden">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={img.src} alt={img.alt} fill className="object-cover" priority={idx === 0} />
        </div>
      ))}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-white w-6' : 'bg-white/50'}`}
          />
        ))}
      </div>
      
      {/* Arrows */}
      <button
        onClick={() => setCurrent(prev => (prev - 1 + images.length) % images.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
      >
        <ChevronLeft className="w-5 h-5 text-gray-800" />
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
      >
        <ChevronRight className="w-5 h-5 text-gray-800" />
      </button>
    </div>
  )
}

function RoomGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  return (
    <>
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
        <Image 
          src={images[current]} 
          alt="Room" 
          fill 
          className="object-cover cursor-pointer transition-transform group-hover:scale-105" 
          onClick={() => setShowLightbox(true)}
        />
        
        {/* Photo count badge */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          📷 {current + 1}/{images.length}
        </div>

        {/* Thumbnail strip */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {images.slice(0, 4).map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${idx === current ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image src={img} alt="" width={48} height={48} className="object-cover w-full h-full" />
            </button>
          ))}
          {images.length > 4 && (
            <button
              onClick={() => setShowLightbox(true)}
              className="w-12 h-12 rounded-lg bg-black/60 text-white text-xs font-bold flex items-center justify-center hover:bg-black/80"
            >
              +{images.length - 4}
            </button>
          )}
        </div>

        {/* Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev - 1 + images.length) % images.length); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev + 1) % images.length); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setShowLightbox(false)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300" onClick={() => setShowLightbox(false)}>
            <X />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
            onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev - 1 + images.length) % images.length); }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300"
            onClick={(e) => { e.stopPropagation(); setCurrent(prev => (prev + 1) % images.length); }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="relative w-full max-w-5xl h-[80vh] m-4" onClick={(e) => e.stopPropagation()}>
            <Image src={images[current]} alt="Room" fill className="object-contain" />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${idx === current ? 'border-white' : 'border-transparent opacity-50'}`}
              >
                <Image src={images[idx]} alt="" width={64} height={48} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default function BookPage() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    name: '', email: '', phone: '', requests: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  useEffect(() => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const dayAfter = new Date(today)
    dayAfter.setDate(today.getDate() + 2)
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

  const calculateNights = () => checkIn && checkOut ? getDaysBetween(checkIn, checkOut) : 1
  const calculateTotal = (room: Room) => room.price_vt * calculateNights()

  const getRoomGallery = (room: Room) => {
    const name = room.name.toLowerCase()
    if (name.includes('2') || name.includes('two')) return roomGalleries['2br']
    if (name.includes('1') || name.includes('one') || name.includes('single')) return roomGalleries['1br']
    return roomGalleries['default']
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
          special_requests: bookingData.requests,
          total_price: calculateTotal(selectedRoom),
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
          <p className="text-gray-600 mb-6">Your reservation at E&apos;Nauwi Beach Resort has been confirmed. Check your email for details.</p>
          <p className="text-sm text-gray-500 mb-6">Booking Reference: <span className="font-mono font-bold">ENW-{bookingSuccess.slice(0, 8).toUpperCase()}</span></p>
          <Link href="/" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image Slider */}
      <div className="relative h-[50vh] min-h-[400px]">
        <ImageSlider images={heroImages} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm transition">
            <ArrowLeft className="w-4 h-4" />
            Back to E&apos;Nauwi Beach Resort
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <span className="text-white/80 text-sm">Beachfront Resort</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">E&apos;Nauwi Beach Resort</h1>
            <p className="text-white/80 text-lg">Malekula Island, Vanuatu • Lagoon Beachfront</p>
          </div>
        </div>
      </div>

      {/* Search Bar - Floating */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={e => setCheckIn(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={e => setCheckOut(e.target.value)}
                  min={checkIn}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Guests</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                >
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={searchRooms}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Searching...' : 'Search Rooms'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Rooms</h2>
            <p className="text-gray-500">{calculateNights()} night{calculateNights() > 1 ? 's' : ''} • {rooms.length} room{rooms.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">🏝️</div>
            <p className="text-gray-500">Finding the perfect room for you...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🏖️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No rooms available</h3>
            <p className="text-gray-500">Try different dates or fewer guests</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {rooms.map(room => (
              <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr]">
                  {/* Room Gallery */}
                  <div className="p-4">
                    <RoomGallery images={getRoomGallery(room)} />
                  </div>

                  {/* Room Details */}
                  <div className="p-6 flex flex-col">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{room.name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{room.tagline || 'Beachfront Location'}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          9.2
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {room.amenities?.slice(0, 6).map((amenity, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                            <Check className="w-3 h-3 text-green-600" />
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Room specs */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>👥 Up to {room.max_guests} guests</span>
                        <span>🛏️ {room.bed_config || 'Queen bed'}</span>
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{calculateNights()} night{calculateNights() > 1 ? 's' : ''}</p>
                        <p className="text-3xl font-bold text-gray-900">{formatVatu(calculateTotal(room))}</p>
                        <p className="text-xs text-gray-400">includes taxes & fees</p>
                      </div>
                      <button
                        onClick={() => { setSelectedRoom(room); setShowBookingForm(true); }}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Policies */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              🕐 Check-in & Check-out
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Check-in</span><span className="font-semibold">2:00 PM</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Check-out</span><span className="font-semibold">10:00 AM</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Late check-out</span><span className="font-semibold">VUV 2,500/hr</span></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚠️ Cancellation Policy
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><span className="text-green-600">✓</span><span>14+ days before — Full refund</span></div>
              <div className="flex items-start gap-2"><span className="text-yellow-600">!</span><span>7-14 days — 50% refund</span></div>
              <div className="flex items-start gap-2"><span className="text-red-600">✕</span><span>Within 7 days — No refund</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBookingForm(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">Complete Your Booking</h3>
              <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {/* Room Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900">{selectedRoom.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{checkIn} → {checkOut} • {calculateNights()} night{calculateNights() > 1 ? 's' : ''}</p>
                <p className="text-xl font-bold text-gray-900 mt-2">{formatVatu(calculateTotal(selectedRoom))}</p>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={e => setBookingData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={e => setBookingData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={e => setBookingData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="+678 xxx xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    value={bookingData.requests}
                    onChange={e => setBookingData(prev => ({ ...prev, requests: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Any special requests..."
                  />
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={submitting || !bookingData.name || !bookingData.email}
                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
