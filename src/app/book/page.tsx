'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Users, MapPin, Wifi, Car, Coffee, ShowerHead, AlertTriangle, Clock, CreditCard, Plane, Baby, ArrowLeft } from 'lucide-react'
import { Room } from '@/types'
import { formatVatu, getDaysBetween } from '@/lib/utils'

export default function BookPage() {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  // Set default dates (today + 1 and today + 2)
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
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        guests: guests.toString()
      })

      const response = await fetch(`/api/rooms?${params}`)
      const data = await response.json()
      
      if (data.error) {
        console.error('Error:', data.error)
        return
      }

      setRooms(data.rooms)
    } catch (error) {
      console.error('Error searching rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [checkIn, checkOut, guests])

  useEffect(() => {
    if (checkIn && checkOut) {
      searchRooms()
    }
  }, [checkIn, checkOut, guests, searchRooms])

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase()
    if (amenityLower.includes('wifi')) return <Wifi className="h-4 w-4" />
    if (amenityLower.includes('beach') || amenityLower.includes('view')) return <MapPin className="h-4 w-4" />
    if (amenityLower.includes('kitchen')) return <Coffee className="h-4 w-4" />
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="h-4 w-4" />
    if (amenityLower.includes('shower') || amenityLower.includes('bathroom')) return <ShowerHead className="h-4 w-4" />
    return <div className="h-4 w-4 bg-ocean rounded-full" />
  }

  const calculateTotal = (room: Room) => {
    if (!checkIn || !checkOut) return room.price_vt
    const nights = getDaysBetween(checkIn, checkOut)
    return room.price_vt * nights
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-ocean-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-ocean-100 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to E&apos;Nauwi Beach Resort
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-4">Book Your Stay</h1>
          <p className="text-ocean-100 text-lg">Experience island paradise at E&apos;Nauwi Beach Resort</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-in
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Check-out
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={searchRooms}
                disabled={loading || !checkIn || !checkOut}
                className="w-full bg-ocean text-white py-2 px-4 rounded-xl hover:bg-ocean-light disabled:bg-ocean/30 font-medium transition-colors shadow-lg shadow-ocean/20"
              >
                {loading ? 'Searching...' : 'Search Rooms'}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {rooms.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-ocean/5 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Room Image */}
                <div className="h-48 bg-gradient-to-br from-ocean to-ocean-light flex items-center justify-center">
                  {room.images && room.images[0] ? (
                    <img 
                      src={room.images[0]} 
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <MapPin className="h-12 w-12 mx-auto mb-2" />
                      <p className="font-medium">{room.type}</p>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-serif text-xl font-bold text-ocean mb-2">{room.name}</h3>
                    <p className="text-ocean/60 text-sm">{room.description}</p>
                  </div>

                  {/* Amenities */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-ocean/70 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs bg-ocean/5 text-ocean/70 px-2 py-1 rounded-full">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-ocean/60">
                      <Users className="h-4 w-4 mr-1" />
                      Up to {room.max_guests} guests
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-ocean">{formatVatu(room.price_vt)}</p>
                      <p className="text-sm text-ocean/50">per night</p>
                    </div>
                    {checkIn && checkOut && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gold-dark">{formatVatu(calculateTotal(room))}</p>
                        <p className="text-sm text-ocean/50">{getDaysBetween(checkIn, checkOut)} nights</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRoom(room)
                      setShowBookingForm(true)
                    }}
                    className="w-full bg-gold text-ocean-dark py-2 px-4 rounded-xl hover:bg-gold-light font-semibold transition-colors shadow-lg shadow-gold/20"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {rooms.length === 0 && !loading && checkIn && checkOut && (
          <div className="text-center py-12">
            <div className="text-ocean/50 text-lg">No available rooms found for your selected dates.</div>
            <p className="text-ocean/30 mt-2">Try different dates or reduce the number of guests.</p>
          </div>
        )}

        {/* Policies & Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in/Check-out */}
          <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-ocean" />
              <h3 className="font-serif text-lg font-bold text-ocean">Check-in & Check-out</h3>
            </div>
            <ul className="space-y-2 text-sm text-ocean/70">
              <li className="flex justify-between"><span>Check-in</span><span className="font-semibold text-ocean">2:00 PM</span></li>
              <li className="flex justify-between"><span>Check-out</span><span className="font-semibold text-ocean">10:00 AM</span></li>
              <li className="flex justify-between"><span>Late check-out</span><span className="font-semibold text-ocean">VUV 2,500/hr</span></li>
              <li className="text-ocean/40 text-xs mt-2">Late check-out subject to availability</li>
            </ul>
          </div>

          {/* Cancellation Policy */}
          <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-gold-dark" />
              <h3 className="font-serif text-lg font-bold text-ocean">Cancellation Policy</h3>
            </div>
            <ul className="space-y-2 text-sm text-ocean/70">
              <li className="flex items-start gap-2">
                <span className="text-green font-bold">✓</span>
                <span><strong className="text-ocean">14+ days</strong> before arrival — Free cancellation, full refund</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-dark font-bold">!</span>
                <span><strong className="text-ocean">Within 14 days</strong> — 50% refund of total amount</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✗</span>
                <span><strong className="text-ocean">Within 7 days / No-show</strong> — 100% charge of booking</span>
              </li>
            </ul>
          </div>

          {/* Fees & Charges */}
          <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-ocean" />
              <h3 className="font-serif text-lg font-bold text-ocean">Fees & Charges</h3>
            </div>
            <ul className="space-y-2 text-sm text-ocean/70">
              <li className="flex justify-between"><span>Tourism Levy</span><span className="font-semibold text-ocean">VUV 200/room/day</span></li>
              <li className="flex justify-between"><span>Credit card surcharge</span><span className="font-semibold text-ocean">4%</span></li>
              <li className="text-ocean/40 text-xs mt-2">Tourism levy charged at check-out. Cash and credit cards accepted.</li>
            </ul>
          </div>

          {/* Airport Shuttle & Kids */}
          <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-5 w-5 text-ocean" />
              <h3 className="font-serif text-lg font-bold text-ocean">Airport Shuttle & Kids</h3>
            </div>
            <ul className="space-y-2 text-sm text-ocean/70">
              <li className="flex justify-between"><span>Adult shuttle (one-way)</span><span className="font-semibold text-ocean">VUV 2,000</span></li>
              <li className="flex justify-between"><span>Child shuttle 2–12 yrs (one-way)</span><span className="font-semibold text-ocean">VUV 1,000</span></li>
              <li className="flex items-start gap-2 mt-2">
                <Baby className="h-4 w-4 text-ocean/50 mt-0.5 shrink-0" />
                <span>Up to 2 children under 12 stay <strong className="text-ocean">free</strong> in parent&apos;s room using existing bedding</span>
              </li>
              <li className="text-ocean/40 text-xs mt-2">Contact property 72 hours before arrival to arrange transfers</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/terms" className="text-ocean hover:text-ocean-light text-sm font-medium underline transition-colors">
            View full Terms, Conditions & Privacy Policy →
          </Link>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedRoom && (
        <BookingFormModal
          room={selectedRoom}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          onClose={() => {
            setShowBookingForm(false)
            setSelectedRoom(null)
          }}
        />
      )}
    </div>
  )
}

// Booking Form Modal Component
function BookingFormModal({
  room,
  checkIn,
  checkOut,
  guests,
  onClose
}: {
  room: Room
  checkIn: string
  checkOut: string
  guests: number
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [bookingResult, setBookingResult] = useState<{ reference: string; totalPrice: number } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkIn,
          checkOut,
          guests,
          roomId: room.id,
          ...formData
        })
      })

      const data = await response.json()
      
      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      setBookingResult(data)
      setSuccess(true)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success && bookingResult) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-xl font-bold text-ocean mb-2">Booking Confirmed!</h3>
            <p className="text-ocean/60 mb-4">
              Your booking request has been submitted. You will receive a confirmation email shortly.
            </p>
            <div className="text-left bg-ocean/5 rounded-xl p-4 mb-4">
              <p className="text-ocean"><strong>Reference:</strong> {bookingResult.reference}</p>
              <p className="text-ocean"><strong>Room:</strong> {room.name}</p>
              <p className="text-ocean"><strong>Dates:</strong> {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</p>
              <p className="text-ocean"><strong>Guests:</strong> {guests}</p>
              <p className="text-ocean"><strong>Total:</strong> {formatVatu(bookingResult.totalPrice)}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-ocean text-white py-2 px-4 rounded-xl hover:bg-ocean-light font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl font-bold text-ocean">Complete Your Booking</h3>
          <button
            onClick={onClose}
            className="text-ocean/30 hover:text-ocean transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Booking Summary */}
        <div className="bg-ocean/5 rounded-xl p-4 mb-6">
          <h4 className="font-serif font-semibold text-ocean mb-2">{room.name}</h4>
          <p className="text-ocean/60 text-sm mb-2">{new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</p>
          <p className="text-ocean/60 text-sm mb-2">{guests} guest{guests > 1 ? 's' : ''} • {getDaysBetween(checkIn, checkOut)} night{getDaysBetween(checkIn, checkOut) > 1 ? 's' : ''}</p>
          <p className="text-xl font-bold text-ocean">{formatVatu(room.price_vt * getDaysBetween(checkIn, checkOut))}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              placeholder="+678 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">Special Requests</label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean resize-none"
              rows={3}
              placeholder="Any special requests or preferences..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-ocean/10 text-ocean/70 rounded-xl hover:bg-ocean/5 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold text-ocean-dark py-2 px-4 rounded-xl hover:bg-gold-light disabled:bg-gold/30 font-semibold transition-colors shadow-lg shadow-gold/20"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
