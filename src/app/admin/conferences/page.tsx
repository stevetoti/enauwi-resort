'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  Check,
  X,
  ChevronDown,
  Search,
  Eye,
  MessageSquare,
  DollarSign,
  Loader2,
} from 'lucide-react'
import { formatDate, formatVatu } from '@/lib/utils'
import { ConferenceBooking } from '@/types'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

export default function ConferencesPage() {
  const [bookings, setBookings] = useState<ConferenceBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<ConferenceBooking | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const res = await fetch(`/api/conferences?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpdateStatus = async (bookingId: string, newStatus: string, additionalData?: object) => {
    setUpdating(true)
    try {
      const res = await fetch('/api/conferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
          ...additionalData,
        }),
      })

      if (res.ok) {
        fetchBookings()
        if (selectedBooking?.id === bookingId) {
          const updatedBooking = await res.json()
          setSelectedBooking(updatedBooking)
        }
      }
    } catch (error) {
      console.error('Error updating booking:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-teal-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conference Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage conference room inquiries and bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Building2 className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Event Details</th>
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.contact_name}</p>
                        <p className="text-xs text-gray-500">{booking.contact_email}</p>
                        {booking.contact_phone && (
                          <p className="text-xs text-gray-400">{booking.contact_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {booking.number_of_attendees} attendees
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {booking.booking_type.replace('_', ' ')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {formatDate(booking.booking_date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {booking.start_time} - {booking.end_time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.total_price ? formatVatu(booking.total_price) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowModal(true)
                          }}
                          className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              disabled={updating}
                              className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              disabled={updating}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No conference bookings</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Conference inquiries will appear here'}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedBooking && (
        <ConferenceDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowModal(false)
            setSelectedBooking(null)
          }}
          onUpdate={(data) => handleUpdateStatus(selectedBooking.id, data.status || selectedBooking.status, data)}
          updating={updating}
        />
      )}
    </div>
  )
}

function ConferenceDetailsModal({
  booking,
  onClose,
  onUpdate,
  updating,
}: {
  booking: ConferenceBooking
  onClose: () => void
  onUpdate: (data: { status?: string; notes?: string; total_price?: number }) => void
  updating: boolean
}) {
  const [notes, setNotes] = useState(booking.notes || '')
  const [price, setPrice] = useState(booking.total_price?.toString() || '')
  const [showPriceInput, setShowPriceInput] = useState(false)

  const handleSaveNotes = () => {
    onUpdate({ notes })
  }

  const handleSetPrice = () => {
    const priceValue = parseInt(price)
    if (!isNaN(priceValue) && priceValue > 0) {
      onUpdate({ total_price: priceValue })
      setShowPriceInput(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conference Booking Details</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Status:</span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  booking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : booking.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : booking.status === 'completed'
                    ? 'bg-teal-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>

            {booking.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdate({ status: 'confirmed' })}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  onClick={() => onUpdate({ status: 'cancelled' })}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </button>
              </div>
            )}

            {booking.status === 'confirmed' && (
              <button
                onClick={() => onUpdate({ status: 'completed' })}
                disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Mark Complete
              </button>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{booking.contact_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href={`mailto:${booking.contact_email}`} className="text-teal-600 hover:underline">
                  {booking.contact_email}
                </a>
              </div>
              {booking.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${booking.contact_phone}`} className="text-teal-600 hover:underline">
                    {booking.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500">Date</label>
              <p className="text-gray-900 font-medium">{formatDate(booking.booking_date)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Time</label>
              <p className="text-gray-900 font-medium">
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Duration</label>
              <p className="text-gray-900 font-medium capitalize">
                {booking.booking_type.replace('_', ' ')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Attendees</label>
              <p className="text-gray-900 font-medium">{booking.number_of_attendees} people</p>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-500">Price</label>
              {!showPriceInput && (
                <button
                  onClick={() => setShowPriceInput(true)}
                  className="text-xs text-teal-600 hover:underline"
                >
                  {booking.total_price ? 'Edit' : 'Set Price'}
                </button>
              )}
            </div>
            {showPriceInput ? (
              <div className="flex items-center gap-2 mt-1">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price in VT"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <button
                  onClick={handleSetPrice}
                  disabled={updating}
                  className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPriceInput(false)}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-900 mt-1">
                {booking.total_price ? formatVatu(booking.total_price) : 'Not set'}
              </p>
            )}
          </div>

          {/* Special Requirements */}
          {booking.special_requirements && (
            <div>
              <label className="text-sm text-gray-500">Special Requirements</label>
              <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                {booking.special_requirements}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-500">Internal Notes</label>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this booking..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updating || notes === booking.notes}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Save Notes
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
