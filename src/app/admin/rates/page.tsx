'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Percent,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  BedDouble,
  Moon,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  Check,
  Loader2,
} from 'lucide-react'
import { formatVatu } from '@/lib/utils'
import { csrfHeaders } from '@/lib/csrf-client'
import { Room } from '@/types'

interface Discount {
  id: string
  name: string
  discount_percent: number
  start_date: string
  end_date: string
  room_id: string | null
  applies_to: string
  min_nights: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

interface DiscountForm {
  name: string
  discount_percent: number | ''
  start_date: string
  end_date: string
  room_id: string
  min_nights: number
}

const emptyForm: DiscountForm = {
  name: '',
  discount_percent: '',
  start_date: '',
  end_date: '',
  room_id: 'all',
  min_nights: 1,
}

function getDiscountStatus(discount: Discount): 'active' | 'expired' | 'upcoming' | 'inactive' {
  if (!discount.is_active) return 'inactive'
  const now = new Date()
  const start = new Date(discount.start_date)
  const end = new Date(discount.end_date)
  // Normalize to start/end of day
  now.setHours(0, 0, 0, 0)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)
  if (now > end) return 'expired'
  if (now < start) return 'upcoming'
  return 'active'
}

function statusBadge(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-gray-100 text-gray-600'
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    case 'inactive':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export default function AdminRatesPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DiscountForm>(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const fetchDiscounts = useCallback(async () => {
    try {
      const res = await fetch('/api/discounts?active=false')
      if (!res.ok) throw new Error('Failed to fetch discounts')
      const data: Discount[] = await res.json()
      setDiscounts(data)
    } catch {
      showToast('Failed to load discounts', 'error')
    }
  }, [showToast])

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms?includeAll=true')
      if (!res.ok) throw new Error('Failed to fetch rooms')
      const data = await res.json()
      setRooms(data.rooms || data || [])
    } catch {
      showToast('Failed to load rooms', 'error')
    }
  }, [showToast])

  useEffect(() => {
    Promise.all([fetchDiscounts(), fetchRooms()]).finally(() => setLoading(false))
  }, [fetchDiscounts, fetchRooms])

  const openCreateModal = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEditModal = (discount: Discount) => {
    setEditingId(discount.id)
    setForm({
      name: discount.name,
      discount_percent: discount.discount_percent,
      start_date: discount.start_date,
      end_date: discount.end_date,
      room_id: discount.room_id || 'all',
      min_nights: discount.min_nights,
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return showToast('Discount name is required', 'error')
    if (!form.discount_percent || form.discount_percent <= 0 || form.discount_percent > 100) {
      return showToast('Discount must be between 1% and 100%', 'error')
    }
    if (!form.start_date || !form.end_date) return showToast('Start and end dates are required', 'error')
    if (new Date(form.end_date) < new Date(form.start_date)) {
      return showToast('End date must be after start date', 'error')
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        discount_percent: Number(form.discount_percent),
        start_date: form.start_date,
        end_date: form.end_date,
        room_id: form.room_id === 'all' ? null : form.room_id,
        min_nights: form.min_nights || 1,
      }

      if (editingId) {
        const res = await fetch('/api/discounts', {
          method: 'PATCH',
          headers: csrfHeaders(),
          credentials: 'include',
          body: JSON.stringify({ id: editingId, ...payload }),
        })
        if (!res.ok) throw new Error('Failed to update discount')
        showToast('Discount updated successfully', 'success')
      } else {
        const res = await fetch('/api/discounts', {
          method: 'POST',
          headers: csrfHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to create discount')
        showToast('Discount created successfully', 'success')
      }

      setShowModal(false)
      await fetchDiscounts()
    } catch {
      showToast(editingId ? 'Failed to update discount' : 'Failed to create discount', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (discount: Discount) => {
    try {
      const res = await fetch('/api/discounts', {
        method: 'PATCH',
        headers: csrfHeaders(),
        credentials: 'include',
        body: JSON.stringify({ id: discount.id, is_active: !discount.is_active }),
      })
      if (!res.ok) throw new Error('Failed to toggle discount')
      showToast(
        `Discount ${discount.is_active ? 'deactivated' : 'activated'}`,
        'success'
      )
      await fetchDiscounts()
    } catch {
      showToast('Failed to update discount status', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/discounts?id=${id}`, {
        method: 'DELETE',
        headers: csrfHeaders(),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to delete discount')
      showToast('Discount deleted', 'success')
      setDeleteConfirm(null)
      await fetchDiscounts()
    } catch {
      showToast('Failed to delete discount', 'error')
    }
  }

  const getRoomName = (roomId: string | null) => {
    if (!roomId) return 'All Rooms'
    const room = rooms.find((r) => r.id === roomId)
    return room ? room.name : 'Unknown Room'
  }

  const getActiveDiscountForRoom = (roomId: string): Discount | undefined => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return discounts.find((d) => {
      if (!d.is_active) return false
      const start = new Date(d.start_date)
      const end = new Date(d.end_date)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      if (now < start || now > end) return false
      return d.room_id === null || d.room_id === roomId
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-teal-600" />
            Discounts &amp; Rates
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage room discounts and view effective rates
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create Discount
        </button>
      </div>

      {/* Active Discounts Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-teal-600" />
          All Discounts
        </h2>

        {discounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-12 text-center"
          >
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">No discounts yet</h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first discount to offer special rates to guests.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Discount
            </button>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Dates</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Applies To</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Min Nights</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {discounts.map((discount, idx) => {
                    const status = getDiscountStatus(discount)
                    return (
                      <motion.tr
                        key={discount.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{discount.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <Percent className="h-3.5 w-3.5" />
                            {discount.discount_percent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            {formatDateShort(discount.start_date)} — {formatDateShort(discount.end_date)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-gray-700">
                            <BedDouble className="h-3.5 w-3.5 text-gray-400" />
                            {getRoomName(discount.room_id)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-gray-600">
                            <Moon className="h-3.5 w-3.5 text-gray-400" />
                            {discount.min_nights}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(status)}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleActive(discount)}
                              title={discount.is_active ? 'Deactivate' : 'Activate'}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {discount.is_active ? (
                                <ToggleRight className="h-5 w-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(discount)}
                              title="Edit"
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Pencil className="h-4 w-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(discount.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {discounts.map((discount, idx) => {
                const status = getDiscountStatus(discount)
                return (
                  <motion.div
                    key={discount.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{discount.name}</h3>
                        <span className="text-amber-700 font-semibold text-sm">
                          {discount.discount_percent}% off
                        </span>
                      </div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(status)}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateShort(discount.start_date)} — {formatDateShort(discount.end_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <BedDouble className="h-3.5 w-3.5" />
                        {getRoomName(discount.room_id)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Moon className="h-3.5 w-3.5" />
                        Min {discount.min_nights} night{discount.min_nights !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => toggleActive(discount)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {discount.is_active ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-green-600" />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                            Inactive
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(discount)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(discount.id)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* Room Rates Overview */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BedDouble className="h-5 w-5 text-teal-600" />
          Room Rates Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room, idx) => {
            const activeDiscount = getActiveDiscountForRoom(room.id)
            const effectiveRate = activeDiscount
              ? Math.round(room.price_vt * (1 - activeDiscount.discount_percent / 100))
              : room.price_vt

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 text-sm mb-3">{room.name}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Base Rate</span>
                    <span className={`font-medium ${activeDiscount ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {formatVatu(room.price_vt)}/night
                    </span>
                  </div>
                  {activeDiscount && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Discount</span>
                        <span className="text-amber-600 font-medium">
                          -{activeDiscount.discount_percent}% ({activeDiscount.name})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-1 border-t border-gray-100">
                        <span className="text-gray-700 font-medium">Effective Rate</span>
                        <span className="text-teal-700 font-bold">
                          {formatVatu(effectiveRate)}/night
                        </span>
                      </div>
                    </>
                  )}
                  {!activeDiscount && (
                    <div className="text-xs text-gray-400 italic">No active discount</div>
                  )}
                </div>
              </motion.div>
            )
          })}
          {rooms.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400 text-sm">
              No rooms found
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingId ? 'Edit Discount' : 'Create Discount'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Discount Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Easter Special, Long Stay Deal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Discount Percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0.01}
                      max={100}
                      step={0.01}
                      value={form.discount_percent}
                      onChange={(e) =>
                        setForm({ ...form, discount_percent: e.target.value ? Number(e.target.value) : '' })
                      }
                      placeholder="e.g. 9.4"
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Apply To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apply To
                  </label>
                  <select
                    value={form.room_id}
                    onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Rooms</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minimum Nights */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.min_nights}
                    onChange={(e) =>
                      setForm({ ...form, min_nights: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingId ? 'Update Discount' : 'Create Discount'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Discount</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this discount? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
