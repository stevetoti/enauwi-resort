'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Mail,
  CreditCard,
  Users,
  Hash,
  Percent,
  Loader2,
  BedDouble,
} from 'lucide-react'
import { formatVatu, formatDate } from '@/lib/utils'
import { Room } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────

interface CalendarBooking {
  id: string
  room_id: string
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out'
  total_price: number | null
  num_guests: number
  booking_reference: string | null
  discount_name: string | null
  discount_percent: number | null
}

type BookingStatus = CalendarBooking['status']

// ─── Constants ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BookingStatus, { label: string; bg: string; text: string; border: string; pill: string }> = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    pill: 'bg-amber-400',
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-300',
    pill: 'bg-teal-600',
  },
  checked_in: {
    label: 'Checked In',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    pill: 'bg-emerald-500',
  },
  checked_out: {
    label: 'Checked Out',
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-300',
    pill: 'bg-gray-400',
  },
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Helpers ─────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getFirstName(name: string): string {
  return name.split(' ')[0]
}

// ─── Component ───────────────────────────────────────────────────────────

export default function ReservationBoardPage() {
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)

  // ── Data fetching ────────────────────────────────────────────────────

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/rooms?includeAll=true')
      const json = await res.json()
      setRooms(json.rooms || [])
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    const startOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
    const endOfMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
    try {
      const res = await fetch(`/api/bookings/calendar?start=${startOfMonth}&end=${endOfMonth}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setBookings(data || [])
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setBookings([])
    }
  }, [currentYear, currentMonth, daysInMonth])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchRooms(), fetchBookings()])
      setLoading(false)
    }
    load()
  }, [fetchRooms, fetchBookings])

  // ── Navigation ───────────────────────────────────────────────────────

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const goToToday = () => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }

  const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth()
  const todayDate = today.getDate()

  // ── Build booking map: room_id -> list of bookings with their column spans ──

  const bookingMap = useMemo(() => {
    const map: Record<string, Array<CalendarBooking & { startCol: number; spanCols: number }>> = {}

    for (const booking of bookings) {
      const checkIn = parseDate(booking.check_in)
      const checkOut = parseDate(booking.check_out)
      const monthStart = new Date(currentYear, currentMonth, 1)
      const monthEnd = new Date(currentYear, currentMonth, daysInMonth)

      // Clamp to visible range
      const visibleStart = checkIn < monthStart ? monthStart : checkIn
      const visibleEnd = checkOut > monthEnd ? monthEnd : checkOut

      const startDay = visibleStart.getDate()
      const endDay = visibleEnd.getDate()

      // startCol is 0-indexed day
      const startCol = startDay - 1
      const spanCols = endDay - startDay + 1

      if (spanCols <= 0) continue

      if (!map[booking.room_id]) map[booking.room_id] = []
      map[booking.room_id].push({ ...booking, startCol, spanCols })
    }

    return map
  }, [bookings, currentYear, currentMonth, daysInMonth])

  // ── Summary stats ────────────────────────────────────────────────────

  const todayStr = toDateString(today.getFullYear(), today.getMonth(), today.getDate())
  const roomsBookedToday = useMemo(() => {
    const bookedRoomIds = new Set<string>()
    for (const b of bookings) {
      if (b.check_in <= todayStr && b.check_out >= todayStr && b.status !== 'checked_out') {
        bookedRoomIds.add(b.room_id)
      }
    }
    return bookedRoomIds.size
  }, [bookings, todayStr])

  // ── Popover handler ──────────────────────────────────────────────────

  const handleBookingClick = (booking: CalendarBooking, event: React.MouseEvent) => {
    event.stopPropagation()
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    setPopoverPosition({
      top: rect.bottom + 8,
      left: Math.min(rect.left, window.innerWidth - 340),
    })
    setSelectedBooking(booking)
  }

  const closePopover = () => {
    setSelectedBooking(null)
    setPopoverPosition(null)
  }

  // ── Cell width ───────────────────────────────────────────────────────
  const CELL_W = 48 // px per day column
  const ROOM_COL_W = 160 // px for room name column

  if (!mounted) return null

  return (
    <div className="space-y-4" onClick={closePopover}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-teal-600" />
              Reservation Board
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Visual overview of all room bookings
            </p>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                isCurrentMonth
                  ? 'border-gray-200 text-gray-400 cursor-default'
                  : 'border-teal-200 text-teal-700 hover:bg-teal-50'
              }`}
              disabled={isCurrentMonth}
            >
              Today
            </button>
            <button
              onClick={goToPrevMonth}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary and legend */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Room count */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BedDouble className="h-4 w-4 text-teal-600" />
            <span>
              <span className="font-semibold text-gray-900">{roomsBookedToday}</span> of{' '}
              <span className="font-semibold text-gray-900">{rooms.length}</span> rooms booked today
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {(Object.keys(STATUS_CONFIG) as BookingStatus[]).map((status) => {
              const cfg = STATUS_CONFIG[status]
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${cfg.pill}`} />
                  <span className="text-xs text-gray-600">{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Calendar Grid ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <BedDouble className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">No rooms found</p>
            <p className="text-sm mt-1">Add rooms to see them on the reservation board.</p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]"
          >
            <div
              style={{ minWidth: ROOM_COL_W + daysInMonth * CELL_W }}
              className="relative"
            >
              {/* ── Date header row ────────────────────────────────────── */}
              <div className="flex sticky top-0 z-20 bg-white border-b border-gray-200">
                {/* Room column header */}
                <div
                  className="shrink-0 sticky left-0 z-30 bg-white border-r border-gray-200 flex items-end px-3 py-2"
                  style={{ width: ROOM_COL_W }}
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Room
                  </span>
                </div>

                {/* Day columns */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dateObj = new Date(currentYear, currentMonth, day)
                  const dayOfWeek = dateObj.getDay()
                  const isToday = isCurrentMonth && day === todayDate
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

                  return (
                    <div
                      key={day}
                      className={`shrink-0 flex flex-col items-center justify-end py-2 border-r border-gray-100 ${
                        isToday ? 'bg-blue-50' : isWeekend ? 'bg-gray-50/50' : ''
                      }`}
                      style={{ width: CELL_W }}
                    >
                      <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                        {DAY_LABELS[dayOfWeek]}
                      </span>
                      <span
                        className={`text-sm font-semibold mt-0.5 ${
                          isToday
                            ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* ── Room rows ──────────────────────────────────────────── */}
              {rooms.map((room, roomIdx) => {
                const roomBookings = bookingMap[room.id] || []
                const isLastRoom = roomIdx === rooms.length - 1

                return (
                  <div
                    key={room.id}
                    className={`flex relative ${!isLastRoom ? 'border-b border-gray-100' : ''}`}
                    style={{ minHeight: 52 }}
                  >
                    {/* Sticky room name */}
                    <div
                      className="shrink-0 sticky left-0 z-10 bg-white border-r border-gray-200 flex items-center px-3"
                      style={{ width: ROOM_COL_W }}
                    >
                      <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 truncate">{room.name}</p>
                        <p className="text-[10px] text-gray-400 capitalize truncate">{room.type}</p>
                      </div>
                    </div>

                    {/* Day cells (background grid) */}
                    <div className="flex relative" style={{ width: daysInMonth * CELL_W }}>
                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1
                        const isToday = isCurrentMonth && day === todayDate
                        const dateObj = new Date(currentYear, currentMonth, day)
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

                        return (
                          <div
                            key={day}
                            className={`shrink-0 border-r border-gray-50 ${
                              isToday ? 'bg-blue-50/40' : isWeekend ? 'bg-gray-50/30' : ''
                            }`}
                            style={{ width: CELL_W, minHeight: 52 }}
                          />
                        )
                      })}

                      {/* Today vertical line */}
                      {isCurrentMonth && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-[5] pointer-events-none"
                          style={{ left: (todayDate - 1) * CELL_W + CELL_W / 2 }}
                        />
                      )}

                      {/* Booking bars */}
                      {roomBookings.map((booking) => {
                        const cfg = STATUS_CONFIG[booking.status]
                        const leftPx = booking.startCol * CELL_W + 2
                        const widthPx = booking.spanCols * CELL_W - 4
                        const firstName = getFirstName(booking.guest_name)
                        const initials = getInitials(booking.guest_name)

                        return (
                          <motion.button
                            key={booking.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => handleBookingClick(booking, e)}
                            className={`absolute top-2 h-8 rounded-full ${cfg.pill} text-white text-xs font-medium flex items-center gap-1 px-2.5 shadow-sm cursor-pointer hover:shadow-md hover:brightness-110 transition-all overflow-hidden whitespace-nowrap`}
                            style={{ left: leftPx, width: widthPx }}
                            title={`${booking.guest_name} (${cfg.label})`}
                          >
                            <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {initials}
                            </span>
                            {widthPx > 90 && (
                              <span className="truncate text-[11px]">{firstName}</span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Detail Popover ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedBooking && popoverPosition && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={closePopover}
            />

            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 w-[320px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
              style={{
                top: Math.min(popoverPosition.top, window.innerHeight - 400),
                left: Math.max(8, Math.min(popoverPosition.left, window.innerWidth - 340)),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Status header */}
              <div className={`px-4 py-3 ${STATUS_CONFIG[selectedBooking.status].bg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${STATUS_CONFIG[selectedBooking.status].pill}`} />
                  <span className={`text-sm font-semibold ${STATUS_CONFIG[selectedBooking.status].text}`}>
                    {STATUS_CONFIG[selectedBooking.status].label}
                  </span>
                </div>
                <button
                  onClick={closePopover}
                  className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {/* Guest name */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${STATUS_CONFIG[selectedBooking.status].pill} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {getInitials(selectedBooking.guest_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedBooking.guest_name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {selectedBooking.guest_email}
                    </p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Check-in</p>
                    <p className="font-medium text-gray-800 mt-0.5">{formatDate(selectedBooking.check_in)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Check-out</p>
                    <p className="font-medium text-gray-800 mt-0.5">{formatDate(selectedBooking.check_out)}</p>
                  </div>
                </div>

                {/* Extra details */}
                <div className="space-y-2 text-sm">
                  {selectedBooking.num_guests > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.num_guests} guest{selectedBooking.num_guests !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {selectedBooking.booking_reference && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-xs">{selectedBooking.booking_reference}</span>
                    </div>
                  )}
                  {selectedBooking.discount_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Percent className="h-4 w-4 text-gray-400" />
                      <span>{selectedBooking.discount_name} ({selectedBooking.discount_percent}% off)</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                {selectedBooking.total_price != null && selectedBooking.total_price > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      Total
                    </span>
                    <span className="text-base font-bold text-gray-900">
                      {formatVatu(selectedBooking.total_price)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
