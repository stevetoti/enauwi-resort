'use client'

import { useState } from 'react'
import { Mail, Calendar, Users, MapPin, Clock, AlertCircle } from 'lucide-react'
import { Booking } from '@/types'
import { formatVatu, formatDate } from '@/lib/utils'

export default function MyBookingsPage() {
  const [email, setEmail] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const searchBookings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.error) {
        console.error('Error:', data.error)
        setBookings([])
      } else {
        setBookings(data.bookings)
      }
      setSearched(true)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-gray-100 text-gray-800'
    }
    const label = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      checked_in: 'Checked In',
      checked_out: 'Completed'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.pending}`}>
        {label[status as keyof typeof label] || 'Unknown'}
      </span>
    )
  }

  const canCancel = (booking: Booking) => {
    if (booking.status === 'cancelled' || booking.status === 'checked_in' || booking.status === 'checked_out') {
      return false
    }
    
    // Allow cancellation up to 24 hours before check-in
    const checkInDate = new Date(booking.check_in)
    const now = new Date()
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    return hoursUntilCheckIn > 24
  }

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      const data = await response.json()
      
      if (data.error) {
        alert('Error cancelling booking: ' + data.error)
        return
      }

      // Update the booking in the local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ))

      alert('Booking cancelled successfully.')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">My Bookings</h1>
          <p className="text-blue-100 text-lg">View and manage your reservations</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={searchBookings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Enter your email address to view bookings
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium whitespace-nowrap"
                >
                  {loading ? 'Searching...' : 'Find Bookings'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {booking.room?.name || 'Room'}
                          </h3>
                          <p className="text-gray-600">
                            Booking #{booking.id.slice(0, 8)}...
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <p className="font-medium">Check-in</p>
                            <p>{formatDate(booking.check_in)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <p className="font-medium">Check-out</p>
                            <p>{formatDate(booking.check_out)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <p className="font-medium">Guests</p>
                            <p>{booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-blue-600" />
                          <div>
                            <p className="font-medium">Booked</p>
                            <p>{formatDate(booking.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Room Details */}
                      {booking.room && (
                        <div className="mb-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                              {booking.room.images && booking.room.images[0] ? (
                                <img 
                                  src={booking.room.images[0]} 
                                  alt={booking.room.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <MapPin className="h-8 w-8 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 mb-1">{booking.room.type}</p>
                              <p className="text-sm text-gray-800">{booking.room.description}</p>
                              {booking.room.amenities && booking.room.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {booking.room.amenities.slice(0, 3).map((amenity, index) => (
                                    <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                      {amenity}
                                    </span>
                                  ))}
                                  {booking.room.amenities.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{booking.room.amenities.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Special Requests */}
                      {booking.special_requests && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Special Requests</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                            {booking.special_requests}
                          </p>
                        </div>
                      )}

                      {/* Pricing */}
                      {booking.total_price && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-lg font-semibold">
                            <span className="text-gray-700">Total Price:</span>
                            <span className="text-blue-900">{formatVatu(booking.total_price)}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4" />
                          {booking.status === 'pending' && 'Awaiting confirmation'}
                          {booking.status === 'confirmed' && 'Confirmed - See you soon!'}
                          {booking.status === 'cancelled' && 'This booking was cancelled'}
                          {booking.status === 'checked_in' && 'Currently checked in'}
                          {booking.status === 'checked_out' && 'Thank you for staying with us!'}
                        </div>
                        
                        {canCancel(booking) && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn&apos;t find any bookings associated with this email address.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>• Make sure you&apos;re using the same email address used for booking</p>
                  <p>• Check your spam folder for booking confirmations</p>
                  <p>• Contact us if you need assistance finding your booking</p>
                </div>
                <div className="mt-6">
                  <a
                    href="/book"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Make a New Booking
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}