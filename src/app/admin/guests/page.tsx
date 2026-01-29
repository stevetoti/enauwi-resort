'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatDate, formatVatu } from '@/lib/utils'
import { Booking, Room } from '@/types'

interface GuestRecord {
  id: string
  name: string
  email: string
  phone: string | null
  language: string
  created_at: string
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<GuestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuest, setSelectedGuest] = useState<GuestRecord | null>(null)
  const [guestBookings, setGuestBookings] = useState<(Booking & { room?: Room })[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  const supabase = createClientSupabase()

  const fetchGuests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const viewGuestBookings = async (guest: GuestRecord) => {
    setSelectedGuest(guest)
    setLoadingBookings(true)

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, room:rooms(*)')
        .eq('guest_email', guest.email)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGuestBookings(data || [])
    } catch (error) {
      console.error('Error fetching guest bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const filteredGuests = guests.filter((g) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      (g.phone && g.phone.includes(q))
    )
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredGuests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => viewGuestBookings(guest)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {guest.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {guest.email}
                      </span>
                      {guest.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {guest.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Joined {formatDate(guest.created_at)}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No guests found</p>
            <p className="text-sm mt-1">
              {searchQuery
                ? 'No guests match your search criteria.'
                : 'Guest records will appear here when bookings are made.'}
            </p>
          </div>
        )}
      </div>

      {/* Guest Detail Modal */}
      {selectedGuest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Guest Profile</h3>
              <button
                onClick={() => {
                  setSelectedGuest(null)
                  setGuestBookings([])
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Guest Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">
                    {selectedGuest.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{selectedGuest.name}</p>
                  <p className="text-sm text-gray-500">{selectedGuest.email}</p>
                  {selectedGuest.phone && (
                    <p className="text-sm text-gray-400">{selectedGuest.phone}</p>
                  )}
                </div>
              </div>

              {/* Booking History */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Booking History ({guestBookings.length})
                </h4>

                {loadingBookings ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : guestBookings.length > 0 ? (
                  <div className="space-y-3">
                    {guestBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.room?.name || 'N/A'}
                          </p>
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                        </p>
                        {booking.total_price && (
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            {formatVatu(booking.total_price)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No bookings found for this guest.
                  </p>
                )}
              </div>

              {/* Join date */}
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-200">
                Guest since {formatDate(selectedGuest.created_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
