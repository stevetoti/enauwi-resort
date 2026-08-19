'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Eye,
  X,
  CheckCircle,
  Clock,
  LogIn,
  LogOut,
  XCircle,
  Trash2,
  AlertTriangle,
  Pencil,
  Save,
  Plus,
  Users2,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { formatVatu, formatDate } from '@/lib/utils'
import { Booking, Room } from '@/types'

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled'

type BookingWithGroup = Booking & {
  group_id?: string | null
  group_name?: string | null
  room?: Room
}

const STATUS_OPTIONS: { value: BookingStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Bookings', icon: <Calendar className="h-4 w-4" /> },
  { value: 'pending', label: 'Pending', icon: <Clock className="h-4 w-4" /> },
  { value: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" /> },
  { value: 'checked_in', label: 'Checked In', icon: <LogIn className="h-4 w-4" /> },
  { value: 'checked_out', label: 'Checked Out', icon: <LogOut className="h-4 w-4" /> },
  { value: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-4 w-4" /> },
]

const TRANSITION_MAP: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled'],
  checked_in: ['checked_out'],
  checked_out: [],
  cancelled: [],
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<BookingWithGroup | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BookingWithGroup | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editingBooking, setEditingBooking] = useState<BookingWithGroup | null>(null)
  const [groupModalOpen, setGroupModalOpen] = useState(false)

  const supabase = createClientSupabase()

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('bookings')
        .select('*, room:rooms(*)')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, supabase])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update status')
      }

      // Refresh bookings
      await fetchBookings()

      // Update selected booking if open
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) =>
          prev ? { ...prev, status: newStatus as Booking['status'] } : null
        )
      }
    } catch {
      alert('Failed to update booking status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const deleteBooking = async (bookingId: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')

      // Remove from local state immediately
      setBookings(prev => prev.filter(b => b.id !== bookingId))
      setDeleteTarget(null)
      if (selectedBooking?.id === bookingId) setSelectedBooking(null)
    } catch {
      alert('Failed to delete booking')
    } finally {
      setDeleting(false)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      b.guest_name.toLowerCase().includes(q) ||
      b.guest_email.toLowerCase().includes(q) ||
      b.room?.name?.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    )
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-teal-100 text-blue-800'
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

  const statusActionColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-teal-600 hover:bg-teal-700 text-white'
      case 'checked_in':
        return 'bg-green-600 hover:bg-green-700 text-white'
      case 'checked_out':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name, email, or room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
                className="pl-2 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent appearance-none bg-white"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* New Group Booking */}
          <button
            onClick={() => setGroupModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <Users2 className="h-4 w-4" />
            New Group Booking
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-3">Guest</th>
                  <th className="px-6 py-3">Room</th>
                  <th className="px-6 py-3">Dates</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {booking.guest_name}
                          {booking.group_id && (
                            <span
                              title={booking.group_name || 'Group booking'}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-800"
                            >
                              <Users2 className="h-3 w-3" />
                              Group
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{booking.guest_email}</p>
                        {booking.guest_phone && (
                          <p className="text-xs text-gray-400">{booking.guest_phone}</p>
                        )}
                        {booking.booking_reference && (
                          <p className="mt-0.5 text-xs font-mono font-semibold text-teal-700">
                            Ref: {booking.booking_reference}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {booking.room?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <p>{formatDate(booking.check_in)}</p>
                        <p className="text-xs text-gray-400">to {formatDate(booking.check_out)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {booking.total_price ? formatVatu(booking.total_price) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit booking"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(booking)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {TRANSITION_MAP[booking.status]?.map((nextStatus) => (
                          <button
                            key={nextStatus}
                            onClick={() => updateBookingStatus(booking.id, nextStatus)}
                            disabled={updatingStatus}
                            className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${statusActionColor(
                              nextStatus
                            )} disabled:opacity-50`}
                            title={`Mark as ${nextStatus.replace('_', ' ')}`}
                          >
                            {nextStatus.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm mt-1">
              {statusFilter !== 'all'
                ? `No ${statusFilter.replace('_', ' ')} bookings`
                : 'Bookings will appear here once guests start booking.'}
            </p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusUpdate={updateBookingStatus}
          onDelete={(booking) => { setSelectedBooking(null); setDeleteTarget(booking) }}
          updatingStatus={updatingStatus}
          statusColor={statusColor}
          statusActionColor={statusActionColor}
        />
      )}

      {/* Danger Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Booking</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  You are about to permanently delete the booking for{' '}
                  <span className="font-semibold">{deleteTarget.guest_name}</span>{' '}
                  ({deleteTarget.room?.name || 'Unknown Room'},{' '}
                  {formatDate(deleteTarget.check_in)} &ndash; {formatDate(deleteTarget.check_out)}).
                </p>
                <p className="text-sm text-red-700 mt-2">
                  This will remove all booking data including any linked invoices. This cannot be recovered.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBooking(deleteTarget.id)}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Booking Modal */}
      {groupModalOpen && (
        <GroupBookingModal
          onClose={() => setGroupModalOpen(false)}
          onCreated={async () => {
            await fetchBookings()
            setGroupModalOpen(false)
          }}
        />
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <BookingEditModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={async () => {
            await fetchBookings()
            setEditingBooking(null)
          }}
        />
      )}
    </div>
  )
}

function BookingEditModal({
  booking,
  onClose,
  onSave,
}: {
  booking: Booking & { room?: Room }
  onClose: () => void
  onSave: () => Promise<void>
}) {
  const [form, setForm] = useState({
    guest_name: booking.guest_name,
    guest_email: booking.guest_email,
    guest_phone: booking.guest_phone || '',
    room_id: booking.room_id || '',
    check_in: booking.check_in?.split('T')[0] || '',
    check_out: booking.check_out?.split('T')[0] || '',
    num_guests: booking.num_guests || 1,
    total_price: booking.total_price || 0,
    special_requests: booking.special_requests || '',
    notes: booking.notes || '',
  })
  const [rooms, setRooms] = useState<Room[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Load room list for the room-type selector
  useEffect(() => {
    const supabase = createClientSupabase()
    supabase
      .from('rooms')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setRooms(data as Room[])
      })
  }, [])

  const nightsFor = (checkIn: string, checkOut: string) => {
    if (!checkIn || !checkOut) return 0
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
    return diff > 0 ? Math.ceil(diff) : 0
  }
  const nights = nightsFor(form.check_in, form.check_out)

  // Suggested total = selected room nightly rate × nights (staff can override)
  const suggestTotal = (roomId: string, checkIn: string, checkOut: string, fallback: number) => {
    const room = rooms.find((r) => r.id === roomId)
    const n = nightsFor(checkIn, checkOut)
    return room && n > 0 ? room.price_vt * n : fallback
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update booking')
      }

      await onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Booking</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
            <input type="text" required value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.guest_email}
                onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.guest_phone}
                onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
            <select value={form.room_id}
              onChange={(e) => setForm({ ...form, room_id: e.target.value, total_price: suggestTotal(e.target.value, form.check_in, form.check_out, form.total_price) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-600 focus:border-transparent">
              <option value="">Select a room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {formatVatu(r.price_vt)}/night
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
              <input type="date" required value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value, total_price: suggestTotal(form.room_id, e.target.value, form.check_out, form.total_price) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
              <input type="date" required value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value, total_price: suggestTotal(form.room_id, form.check_in, e.target.value, form.total_price) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
              <input type="number" min={1} max={10} value={form.num_guests}
                onChange={(e) => setForm({ ...form, num_guests: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Price (VT){nights > 0 ? <span className="text-gray-400 font-normal"> · {nights} night{nights > 1 ? 's' : ''}</span> : null}
              </label>
              <input type="number" min={0} value={form.total_price}
                onChange={(e) => setForm({ ...form, total_price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea value={form.special_requests} rows={2}
              onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
            <textarea value={form.notes} rows={2}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Internal notes (not visible to guest)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent" />
          </div>

          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
            Status: <span className="font-medium text-gray-700">{booking.status.replace('_', ' ')}</span>
            {' · '}Original total: <span className="font-medium text-gray-700">{booking.total_price ? formatVatu(booking.total_price) : 'N/A'}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex gap-2">
            <span aria-hidden>✉️</span>
            <span>Changing the room, dates, guests or price will automatically email{booking.guest_phone ? ' & SMS' : ''} the guest a revised confirmation.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BookingDetailModal({
  booking,
  onClose,
  onStatusUpdate,
  onDelete,
  updatingStatus,
  statusColor,
  statusActionColor,
}: {
  booking: Booking & { room?: Room }
  onClose: () => void
  onStatusUpdate: (id: string, status: string) => Promise<void>
  onDelete: (booking: Booking & { room?: Room }) => void
  updatingStatus: boolean
  statusColor: (status: string) => string
  statusActionColor: (status: string) => string
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusColor(
                booking.status
              )}`}
            >
              {booking.status.replace('_', ' ')}
            </span>
          </div>

          {/* Guest Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Guest Information</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{' '}
                <span className="font-medium">{booking.guest_name}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium">{booking.guest_email}</span>
              </p>
              {booking.guest_phone && (
                <p>
                  <span className="text-gray-500">Phone:</span>{' '}
                  <span className="font-medium">{booking.guest_phone}</span>
                </p>
              )}
            </div>
          </div>

          {/* Room Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Room</h4>
            <p className="text-sm font-medium">{booking.room?.name || 'N/A'}</p>
            {booking.room?.type && (
              <p className="text-xs text-gray-500 capitalize">{booking.room.type}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Check-in</h4>
              <p className="text-sm font-medium">{formatDate(booking.check_in)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 mb-1">Check-out</h4>
              <p className="text-sm font-medium">{formatDate(booking.check_out)}</p>
            </div>
          </div>

          {/* Price */}
          {booking.total_price && (
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Total Price</span>
              <span className="text-lg font-bold text-gray-900">
                {formatVatu(booking.total_price)}
              </span>
            </div>
          )}

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">Special Requests</h4>
              <p className="text-sm text-yellow-700">{booking.special_requests}</p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="bg-teal-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Notes</h4>
              <p className="text-sm text-teal-700">{booking.notes}</p>
            </div>
          )}

          {/* Booking date */}
          <p className="text-xs text-gray-400">
            Booked on {formatDate(booking.created_at)}
          </p>

          {/* Actions */}
          {TRANSITION_MAP[booking.status]?.length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-gray-200">
              {TRANSITION_MAP[booking.status].map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => onStatusUpdate(booking.id, nextStatus)}
                  disabled={updatingStatus}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${statusActionColor(
                    nextStatus
                  )} disabled:opacity-50`}
                >
                  {updatingStatus ? 'Updating...' : `Mark as ${nextStatus.replace('_', ' ')}`}
                </button>
              ))}
            </div>
          )}

          {/* Delete */}
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => onDelete(booking)}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete this booking
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function GroupBookingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [form, setForm] = useState({
    group_name: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    special_requests: '',
    notes: '',
  })
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([])
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/rooms?includeAll=true')
        if (!res.ok) throw new Error('Failed to load rooms')
        const data = await res.json()
        const list: Room[] = Array.isArray(data) ? data : data.rooms || []
        if (!cancelled) setRooms(list)
      } catch {
        if (!cancelled) setError('Failed to load rooms')
      } finally {
        if (!cancelled) setLoadingRooms(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const toggleRoom = (id: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const nights = (() => {
    if (!form.check_in || !form.check_out) return 0
    const inD = new Date(form.check_in)
    const outD = new Date(form.check_out)
    const ms = outD.getTime() - inD.getTime()
    const n = Math.round(ms / (1000 * 60 * 60 * 24))
    return n > 0 ? n : 0
  })()

  const selectedRooms = rooms.filter((r) => selectedRoomIds.includes(r.id))
  const perNight = selectedRooms.reduce((sum, r) => sum + (r.price_vt || 0), 0)
  const total = perNight * nights

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedRoomIds.length === 0) {
      setError('Please select at least one room')
      return
    }
    if (nights <= 0) {
      setError('Check-out must be after check-in')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: form.group_name,
          guest_name: form.guest_name,
          guest_email: form.guest_email,
          guest_phone: form.guest_phone || undefined,
          check_in: form.check_in,
          check_out: form.check_out,
          room_ids: selectedRoomIds,
          special_requests: form.special_requests || undefined,
          notes: form.notes || undefined,
        }),
      })

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'One or more selected rooms are not available for these dates')
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create group booking')
      }

      setSuccess(true)
      setTimeout(async () => {
        await onCreated()
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group booking')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Users2 className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">New Group Booking</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Group booking created successfully
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              required
              value={form.group_name}
              onChange={(e) => setForm({ ...form, group_name: e.target.value })}
              placeholder="e.g. Smith Family Holiday"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Contact Name *</label>
            <input
              type="text"
              required
              value={form.guest_name}
              onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.guest_email}
                onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.guest_phone}
                onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
              <input
                type="date"
                required
                value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
              <input
                type="date"
                required
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Rooms *</label>
            {loadingRooms ? (
              <div className="flex items-center justify-center h-24 border border-gray-200 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4">
                No rooms available
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {rooms.map((room) => {
                  const checked = selectedRoomIds.includes(room.id)
                  return (
                    <label
                      key={room.id}
                      className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 ${
                        checked ? 'bg-teal-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRoom(room.id)}
                          className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{room.name}</p>
                          {room.type && (
                            <p className="text-xs text-gray-500 capitalize">{room.type}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {formatVatu(room.price_vt || 0)}
                        <span className="text-xs text-gray-400 font-normal"> /night</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">
                <span className="font-medium">{selectedRoomIds.length}</span> room(s) selected ·{' '}
                <span className="font-medium">{nights}</span> night{nights === 1 ? '' : 's'}
              </span>
              <span className="font-bold text-gray-900">
                Total: {formatVatu(total)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
            <textarea
              value={form.special_requests}
              rows={2}
              onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              rows={2}
              placeholder="Internal admin notes"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? 'Creating...' : success ? 'Created' : 'Create Group Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
