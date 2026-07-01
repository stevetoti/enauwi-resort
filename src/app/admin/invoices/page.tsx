'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Printer,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Receipt,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Clock,
  Download,
  Trash2,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { csrfHeaders } from '@/lib/csrf-client'
import { createClientSupabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  item_type: string
}

interface Invoice {
  id: string
  booking_id: string
  invoice_number: string
  guest_name: string
  guest_email: string
  guest_phone: string
  room_name: string
  check_in: string
  check_out: string
  num_nights: number
  num_guests: number
  base_rate: number
  base_total: number
  discount_name: string | null
  discount_percent: number
  discount_amount: number
  subtotal: number
  tax_percent: number
  tax_amount: number
  total: number
  payment_method: string
  payment_status: string
  notes: string | null
  special_requests: string | null
  issued_at: string
  paid_at: string | null
  items: InvoiceItem[]
  doc_type?: 'invoice' | 'quote'
  quote_status?: string | null
  valid_until?: string | null
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return `VT ${(amount || 0).toLocaleString('en-US')}`
}

// Safe date — manual invoices may have no dates
function safeDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? '—' : formatDate(value)
}

// Build a Word-openable (.doc) HTML document for an invoice/receipt
function buildInvoiceWordHtml(invoice: Invoice, isReceipt: boolean): string {
  const docTitle = invoice.doc_type === 'quote' ? 'QUOTATION' : isReceipt ? 'RECEIPT' : 'INVOICE'
  const rows =
    invoice.items && invoice.items.length > 0
      ? invoice.items
      : [{ id: 'base', description: invoice.room_name || 'Accommodation', quantity: invoice.num_nights, unit_price: invoice.base_rate, total: invoice.base_total, item_type: 'accommodation' }]

  const itemRows = rows
    .map(
      (it) => `<tr>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${it.description}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.quantity ?? ''}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(it.unit_price)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(it.total)}</td>
      </tr>`
    )
    .join('')

  const datesBlock =
    invoice.check_in || invoice.check_out
      ? `<p style="margin:2px 0;"><b>Check-in:</b> ${safeDate(invoice.check_in)} &nbsp; <b>Check-out:</b> ${safeDate(invoice.check_out)}${invoice.num_guests ? ` &nbsp; <b>Guests:</b> ${invoice.num_guests}` : ''}</p>`
      : ''

  return `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${docTitle} ${invoice.invoice_number}</title></head>
<body style="font-family:Calibri,Arial,sans-serif;color:#1f2937;font-size:11pt;">
  <table style="width:100%;border-collapse:collapse;margin-bottom:8px;"><tr>
    <td style="vertical-align:middle;width:70px;"><img src="https://www.enauwibeachresort.org/logo-enauwi.png" alt="E'Nauwi Beach Resort" width="64" style="display:block;" /></td>
    <td style="vertical-align:middle;">
      <div style="font-size:18pt;font-weight:bold;color:#439de5;">E'NAUWI BEACH RESORT</div>
      <div style="color:#6b7280;">South East Efate, Vanuatu</div>
      <div style="color:#6b7280;">+678 22170 · reservation@enauwibeachresort.com</div>
    </td>
    <td style="vertical-align:middle;text-align:right;font-size:16pt;font-weight:bold;color:#f19500;">${docTitle}</td>
  </tr></table>
  <div style="border-bottom:3px solid #f19500;margin-bottom:14px;"></div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;"><tr>
    <td style="vertical-align:top;">
      <p style="margin:2px 0;"><b>${docTitle} Number:</b> ${invoice.invoice_number}</p>
      <p style="margin:2px 0;"><b>Date:</b> ${safeDate(invoice.issued_at)}</p>
      ${isReceipt && invoice.paid_at ? `<p style="margin:2px 0;"><b>Payment Date:</b> ${safeDate(invoice.paid_at)}</p>` : ''}
    </td>
    <td style="vertical-align:top;text-align:right;">
      <p style="margin:2px 0;"><b>Bill To</b></p>
      <p style="margin:2px 0;">${invoice.guest_name}</p>
      ${invoice.guest_email ? `<p style="margin:2px 0;color:#6b7280;">${invoice.guest_email}</p>` : ''}
      ${invoice.guest_phone ? `<p style="margin:2px 0;color:#6b7280;">${invoice.guest_phone}</p>` : ''}
    </td>
  </tr></table>
  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-bottom:14px;">
    <thead><tr style="background:#f1f5f9;">
      <th style="padding:8px;text-align:left;">Description</th>
      <th style="padding:8px;text-align:center;">Qty</th>
      <th style="padding:8px;text-align:right;">Unit Price</th>
      <th style="padding:8px;text-align:right;">Total</th>
    </tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <table style="width:100%;border-collapse:collapse;margin-bottom:14px;"><tr><td></td>
    <td style="width:260px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:3px 0;color:#6b7280;">Subtotal</td><td style="padding:3px 0;text-align:right;">${formatCurrency(invoice.subtotal)}</td></tr>
        ${invoice.discount_amount > 0 ? `<tr><td style="padding:3px 0;color:#15803d;">Discount${invoice.discount_name ? ` (${invoice.discount_name})` : ''} ${invoice.discount_percent ? `${invoice.discount_percent}%` : ''}</td><td style="padding:3px 0;text-align:right;color:#15803d;">-${formatCurrency(invoice.discount_amount)}</td></tr>` : ''}
        <tr><td style="padding:6px 0;border-top:2px solid #439de5;font-weight:bold;font-size:13pt;">Total</td><td style="padding:6px 0;border-top:2px solid #439de5;text-align:right;font-weight:bold;font-size:13pt;">${formatCurrency(invoice.total)}</td></tr>
      </table>
    </td>
  </tr></table>
  <p style="margin:2px 0;"><b>Payment:</b> ${invoice.payment_method || 'Not specified'} &nbsp; <b>Status:</b> ${(invoice.payment_status || 'unpaid').toUpperCase()}</p>
  ${datesBlock}
  ${invoice.notes ? `<p style="margin:8px 0 2px;"><b>Notes:</b> ${invoice.notes}</p>` : ''}
  <table style="width:100%;border-collapse:collapse;margin-top:14px;border:1px solid #439de5;background:#f3f9fe;"><tr><td style="padding:10px 12px;">
    <div style="font-weight:bold;color:#439de5;margin-bottom:3px;">Payment Details</div>
    <div style="color:#374151;">Bank: <b>BRED Bank</b> &nbsp;·&nbsp; Account Number: <b>013134710100015</b></div>
    <div style="color:#6b7280;font-size:9pt;margin-top:2px;">For retreat/meeting bookings paying via LPO — Vendor ID: <b>ENB002</b> · Vendor Name: <b>E'Nauwi Beach Resort</b></div>
  </td></tr></table>
  <p style="margin-top:20px;text-align:center;color:#439de5;font-weight:bold;border-top:3px solid #f19500;padding-top:14px;">Thank you for choosing E'Nauwi Beach Resort!</p>
  <p style="text-align:center;color:#9ca3af;font-size:9pt;">www.enauwibeachresort.org</p>
</body></html>`
}

function statusBadge(status: string) {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <CheckCircle className="h-3 w-3" /> Paid
        </span>
      )
    case 'partial':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
          <Clock className="h-3 w-3" /> Partial
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <XCircle className="h-3 w-3" /> Unpaid
        </span>
      )
  }
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Booking type for the selector
// ---------------------------------------------------------------------------

interface BookingRow {
  id: string
  guest_name: string
  guest_email: string
  check_in: string
  check_out: string
  status: string
  total_price: number
  invoice_number: string | null
  booking_reference: string | null
  room: { name: string } | null
}

function getBookingStatusLabel(status: string, checkOut: string) {
  const today = new Date()
  const out = new Date(checkOut)
  if (status === 'cancelled') return { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  if (status === 'checked_out' || out < today) return { label: 'Past', color: 'bg-gray-100 text-gray-600' }
  if (status === 'checked_in') return { label: 'Checked In', color: 'bg-green-100 text-green-700' }
  if (status === 'confirmed') return { label: 'Active', color: 'bg-teal-100 text-teal-700' }
  return { label: 'Pending', color: 'bg-amber-100 text-amber-700' }
}

// ---------------------------------------------------------------------------
// Generate Invoice Modal — with booking selector
// ---------------------------------------------------------------------------

function GenerateModal({
  open,
  onClose,
  onGenerated,
}: {
  open: boolean
  onClose: () => void
  onGenerated: () => void
}) {
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all')
  const [generating, setGenerating] = useState<string | null>(null)
  const [error, setError] = useState('')
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!open) return
    setLoadingBookings(true)
    setError('')
    supabase
      .from('bookings')
      .select('id, guest_name, guest_email, check_in, check_out, status, total_price, invoice_number, booking_reference, room:rooms(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const rows = (data || []).map((b: Record<string, unknown>) => ({
          ...b,
          room: Array.isArray(b.room) ? b.room[0] : b.room,
        })) as BookingRow[]
        setBookings(rows)
        setLoadingBookings(false)
      })
  }, [open, supabase])

  const filtered = bookings.filter((b) => {
    // Search filter
    if (search) {
      const q = search.toLowerCase()
      const matchesSearch = b.guest_name?.toLowerCase().includes(q) ||
        b.guest_email?.toLowerCase().includes(q) ||
        b.room?.name?.toLowerCase().includes(q) ||
        b.booking_reference?.toLowerCase().includes(q)
      if (!matchesSearch) return false
    }
    // Status filter
    if (filter === 'active') {
      return ['pending', 'confirmed', 'checked_in'].includes(b.status)
    }
    if (filter === 'past') {
      return ['checked_out', 'cancelled'].includes(b.status) || new Date(b.check_out) < new Date()
    }
    return true
  })

  async function handleGenerate(bookingId: string) {
    setGenerating(bookingId)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: csrfHeaders(),
        body: JSON.stringify({ booking_id: bookingId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error([data.error, data.detail].filter(Boolean).join(' — ') || 'Failed to generate invoice')
      }
      // Mark as generated locally
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, invoice_number: 'generated' } : b))
      onGenerated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(null)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Generate Invoice</h2>
              <p className="text-sm text-gray-500">Select a booking to generate an invoice</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-2 border-b px-6 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guest, room, reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'active', 'past'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition ${
                    filter === f ? 'bg-teal-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Booking List */}
          <div className="flex-1 overflow-y-auto px-6 py-3">
            {loadingBookings ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <FileText className="mx-auto h-10 w-10 mb-2" />
                <p className="text-sm">No bookings found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((booking) => {
                  const statusInfo = getBookingStatusLabel(booking.status, booking.check_out)
                  const hasInvoice = !!booking.invoice_number
                  return (
                    <div
                      key={booking.id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition ${
                        hasInvoice ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 hover:border-teal-200 hover:bg-teal-50/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-gray-900 text-sm truncate">{booking.guest_name}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {booking.room?.name || 'Room'} &middot; {formatDate(booking.check_in)} &ndash; {formatDate(booking.check_out)}
                          {booking.total_price ? ` · VT ${booking.total_price.toLocaleString()}` : ''}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        {hasInvoice ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3.5 w-3.5" /> Invoice created
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGenerate(booking.id)}
                            disabled={generating === booking.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                          >
                            {generating === booking.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileText className="h-3.5 w-3.5" />
                            )}
                            Generate
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-3 text-right">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Manual Invoice Modal — create an invoice without a booking
// ---------------------------------------------------------------------------

interface LineItemInput {
  description: string
  quantity: number
  unit_price: number
}

function ManualInvoiceModal({
  open,
  docType = 'invoice',
  onClose,
  onCreated,
}: {
  open: boolean
  docType?: 'invoice' | 'quote'
  onClose: () => void
  onCreated: () => void
}) {
  const isQuote = docType === 'quote'
  const docLabel = isQuote ? 'Quotation' : 'Invoice'
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('property')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItemInput[]>([{ description: '', quantity: 1, unit_price: 0 }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [combineName, setCombineName] = useState('')
  const [combining, setCombining] = useState(false)

  // Combined invoice: pull a guest's accommodation + restaurant + services into line items
  async function handleCombine() {
    const q = combineName.trim() || guestName.trim()
    if (!q) { setError('Enter a guest name to combine their services'); return }
    setCombining(true); setError('')
    try {
      const res = await fetch(`/api/invoices/aggregate?name=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to find services')
      if (data.guest_name && !guestName.trim()) setGuestName(data.guest_name)
      if (data.guest_email && !guestEmail.trim()) setGuestEmail(data.guest_email)
      const found: LineItemInput[] = (data.items || []).map((it: { description: string; quantity: number; unit_price: number }) => ({
        description: it.description, quantity: it.quantity, unit_price: it.unit_price,
      }))
      if (found.length === 0) { setError('No services found for that guest'); return }
      setItems((prev) => [...prev.filter((p) => p.description.trim()), ...found])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to combine services')
    } finally {
      setCombining(false)
    }
  }

  function reset() {
    setGuestName(''); setGuestEmail(''); setGuestPhone(''); setPaymentMethod('property')
    setPaymentStatus('unpaid'); setDiscountPercent(0); setNotes('')
    setItems([{ description: '', quantity: 1, unit_price: 0 }]); setError(''); setCombineName('')
  }

  const updateItem = (i: number, patch: Partial<LineItemInput>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const addItem = () => setItems((prev) => [...prev, { description: '', quantity: 1, unit_price: 0 }])
  const removeItem = (i: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0)
  const discountAmount = Math.round(subtotal * (Number(discountPercent) || 0) / 100)
  const total = subtotal - discountAmount

  async function handleCreate() {
    setError('')
    if (!guestName.trim()) { setError('Guest name is required'); return }
    if (!items.some((it) => it.description.trim())) { setError('Add at least one line item with a description'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: csrfHeaders(),
        body: JSON.stringify({
          doc_type: docType,
          guest_name: guestName,
          guest_email: guestEmail || undefined,
          guest_phone: guestPhone || undefined,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          discount_percent: Number(discountPercent) || 0,
          notes: notes || undefined,
          items: items.filter((it) => it.description.trim()),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error([data.error, data.detail].filter(Boolean).join(' — ') || 'Failed to create invoice')
      }
      reset()
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">New {docLabel}</h2>
              <p className="text-sm text-gray-500">Create a {docLabel.toLowerCase()} with custom line items (no booking required)</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            {/* Combined invoice — pull a guest's services (invoices only) */}
            {!isQuote && (
              <div className="rounded-lg border border-dashed border-teal-300 bg-teal-50/40 p-3">
                <label className="mb-1 block text-xs font-medium text-teal-800">Combine a guest&apos;s services (optional)</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Guest name"
                    value={combineName}
                    onChange={(e) => setCombineName(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleCombine}
                    disabled={combining}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
                  >
                    {combining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Find &amp; add
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-teal-700/70">Pulls the guest&apos;s bookings, restaurant orders &amp; service orders into one invoice. Review the lines below before creating.</p>
              </div>
            )}

            {/* Guest */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Bill To (name) *</label>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
            </div>

            {/* Line items */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Line Items *</label>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input placeholder="Description" value={it.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    <input type="number" min={0} placeholder="Qty" value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: parseFloat(e.target.value) || 0 })}
                      className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-sm text-center focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    <input type="number" min={0} placeholder="Unit VT" value={it.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: parseFloat(e.target.value) || 0 })}
                      className="w-28 rounded-lg border border-gray-300 px-2 py-2 text-sm text-right focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                    <div className="w-28 px-2 py-2 text-sm text-right text-gray-600">{formatCurrency((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</div>
                    <button onClick={() => removeItem(i)} disabled={items.length === 1}
                      className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addItem} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800">
                <Plus className="h-3.5 w-3.5" /> Add line item
              </button>
            </div>

            {/* Discount + payment */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount %</label>
                <input type="number" min={0} max={100} step="0.1" value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                  <option value="property">Pay at property</option>
                  <option value="credit_card">Credit card</option>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500">
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <textarea value={notes} rows={2} onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </div>

            {/* Totals preview */}
            <div className="flex justify-end">
              <div className="w-56 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700"><span>Discount {discountPercent}%</span><span>-{formatCurrency(discountAmount)}</span></div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-1 font-bold text-gray-900"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-3">
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Create {docLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// Invoice Detail / Print View
// ---------------------------------------------------------------------------

function InvoiceDetail({
  invoice,
  onBack,
  onStatusUpdate,
}: {
  invoice: Invoice
  onBack: () => void
  onStatusUpdate: () => void
}) {
  const [receiptMode, setReceiptMode] = useState(false)
  const [markingPaid, setMarkingPaid] = useState(false)
  const [converting, setConverting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const isQuote = invoice.doc_type === 'quote'
  const canShowReceipt = !isQuote && invoice.payment_status === 'paid'

  async function handleConvert() {
    if (!confirm('Convert this quotation into an invoice? It will get a new invoice number.')) return
    setConverting(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: csrfHeaders(),
        body: JSON.stringify({ action: 'convert_to_invoice' }),
      })
      if (!res.ok) throw new Error('Failed to convert')
      onBack() // it now lives under Invoices
    } catch (err) {
      console.error('Failed to convert quote:', err)
    } finally {
      setConverting(false)
    }
  }

  async function handleMarkPaid() {
    setMarkingPaid(true)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: csrfHeaders(),
        body: JSON.stringify({ payment_status: 'paid' }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      onStatusUpdate()
    } catch (err) {
      console.error('Failed to mark as paid:', err)
    } finally {
      setMarkingPaid(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  function handleDownloadWord() {
    const html = buildInvoiceWordHtml(invoice, receiptMode)
    const blob = new Blob(['﻿', html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${isQuote ? 'Quotation' : receiptMode ? 'Receipt' : 'Invoice'}-${invoice.invoice_number}.doc`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const docTitle = isQuote ? 'QUOTATION' : receiptMode ? 'RECEIPT' : 'INVOICE'

  return (
    <div>
      {/* Toolbar (hidden when printing) */}
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex-1" />

        {canShowReceipt && (
          <button
            onClick={() => setReceiptMode(!receiptMode)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
              receiptMode
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Receipt className="h-4 w-4" />
            {receiptMode ? 'Receipt Mode' : 'Switch to Receipt'}
          </button>
        )}

        {isQuote && invoice.quote_status !== 'converted' && (
          <button
            onClick={handleConvert}
            disabled={converting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#439de5] px-3 py-2 text-sm font-medium text-white hover:bg-[#3a8acd] disabled:opacity-50"
          >
            {converting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Convert to Invoice
          </button>
        )}

        {!isQuote && invoice.payment_status !== 'paid' && (
          <button
            onClick={handleMarkPaid}
            disabled={markingPaid}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {markingPaid ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Mark as Paid
          </button>
        )}

        <button
          onClick={handleDownloadWord}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" /> Word
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          <Printer className="h-4 w-4" /> Print / PDF
        </button>
      </div>

      {/* Printable Invoice */}
      <div
        ref={printRef}
        className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        {/* Header */}
        <div className="mb-8 border-b-2 border-[#f19500] pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-enauwi.png" alt="E'Nauwi Beach Resort" className="h-16 w-auto shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-[#439de5]">E&apos;NAUWI BEACH RESORT</h1>
                <p className="mt-1 text-sm text-gray-500">South East Efate, Vanuatu</p>
                <p className="text-sm text-gray-500">+678 22170 &middot; reservation@enauwibeachresort.com</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-lg px-3 py-1 text-sm font-bold uppercase tracking-wider ${
                  receiptMode ? 'bg-[#f19500]/10 text-[#f19500]' : 'bg-[#439de5]/10 text-[#439de5]'
                }`}
              >
                {docTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {docTitle} Number
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">{invoice.invoice_number}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Date: {safeDate(invoice.issued_at)}
            </p>
            {receiptMode && invoice.paid_at && (
              <p className="mt-0.5 text-sm text-gray-500">
                Payment Date: {safeDate(invoice.paid_at)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Bill To</p>
            <p className="mt-1 font-semibold text-gray-900">{invoice.guest_name}</p>
            {invoice.guest_email && (
              <p className="text-sm text-gray-500">{invoice.guest_email}</p>
            )}
            {invoice.guest_phone && (
              <p className="text-sm text-gray-500">{invoice.guest_phone}</p>
            )}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Description</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Unit Price</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-800">{item.description}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(item.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-3 text-gray-800">{invoice.room_name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{invoice.num_nights}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(invoice.base_rate)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {formatCurrency(invoice.base_total)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>
                  Discount{invoice.discount_name ? ` (${invoice.discount_name})` : ''}{' '}
                  {invoice.discount_percent > 0 && `${invoice.discount_percent}%`}
                </span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({invoice.tax_percent}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment & Booking Info */}
        <div className="mb-8 grid grid-cols-2 gap-6 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="space-y-1.5">
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Payment:</span>{' '}
              {invoice.payment_method || 'Not specified'}
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Status:</span>{' '}
              <span
                className={`font-semibold uppercase ${
                  invoice.payment_status === 'paid'
                    ? 'text-green-700'
                    : invoice.payment_status === 'partial'
                      ? 'text-amber-700'
                      : 'text-red-700'
                }`}
              >
                {invoice.payment_status}
              </span>
            </p>
            {receiptMode && invoice.paid_at && (
              <p className="text-gray-500">
                <span className="font-medium text-gray-700">Paid:</span>{' '}
                {formatCurrency(invoice.total)} on {formatDate(invoice.paid_at)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Check-in:</span> {safeDate(invoice.check_in)}
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Check-out:</span> {safeDate(invoice.check_out)}
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Guests:</span> {invoice.num_guests || '—'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6 text-sm text-gray-500">
            <p className="font-medium text-gray-700">Notes:</p>
            <p>{invoice.notes}</p>
          </div>
        )}

        {invoice.special_requests && (
          <div className="mb-6 text-sm text-gray-500">
            <p className="font-medium text-gray-700">Special Requests:</p>
            <p>{invoice.special_requests}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="mb-6 rounded-lg border border-[#439de5]/30 bg-[#439de5]/5 p-4 text-sm">
          <p className="mb-1 font-semibold text-[#439de5]">Payment Details</p>
          <p className="text-gray-600">
            Bank: <span className="font-medium text-gray-800">BRED Bank</span>
            {' '}&middot;{' '}
            Account Number: <span className="font-medium text-gray-800">013134710100015</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            For retreat/meeting bookings paying via LPO &mdash; Vendor ID: <span className="font-medium text-gray-700">ENB002</span>
            {' '}&middot;{' '}Vendor Name: <span className="font-medium text-gray-700">E&apos;Nauwi Beach Resort</span>
          </p>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#f19500] pt-6 text-center">
          <p className="text-sm font-medium text-[#439de5]">Thank you for choosing E&apos;Nauwi Beach Resort!</p>
          <p className="mt-1 text-xs text-gray-400">www.enauwibeachresort.org</p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [docType, setDocType] = useState<'invoice' | 'quote'>('invoice')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      params.set('doc_type', docType)
      const res = await fetch(`/api/invoices?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch invoices')
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : data.invoices || [])
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, docType])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // View invoice detail
  async function viewInvoice(invoiceId: string) {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`)
      if (!res.ok) throw new Error('Failed to fetch invoice')
      const data = await res.json()
      setSelectedInvoice(data)
    } catch (err) {
      console.error('Failed to load invoice:', err)
    } finally {
      setDetailLoading(false)
    }
  }

  // If viewing a specific invoice
  if (selectedInvoice) {
    return (
      <div className="min-h-screen">
        {/* Print styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-print-area,
            #invoice-print-area * {
              visibility: visible;
            }
            #invoice-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            nav,
            aside,
            header,
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
        <div id="invoice-print-area">
          <InvoiceDetail
            invoice={selectedInvoice}
            onBack={() => setSelectedInvoice(null)}
            onStatusUpdate={() => {
              viewInvoice(selectedInvoice.id)
              fetchInvoices()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{docType === 'quote' ? 'Quotations' : 'Invoices'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {docType === 'quote'
              ? 'Create quotations and convert them to invoices when approved'
              : 'Generate and manage invoices for guest bookings'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {docType === 'quote' ? 'New Quotation' : 'New Manual Invoice'}
          </button>
          {docType === 'invoice' && (
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Generate from Booking
            </button>
          )}
        </div>
      </div>

      {/* Invoices / Quotes tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['invoice', 'quote'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setDocType(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              docType === t
                ? 'border-teal-700 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'invoice' ? 'Invoices' : 'Quotations'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by guest name or invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* Invoice List */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {debouncedSearch
                ? 'No invoices match your search. Try a different term.'
                : 'Generate your first invoice from a booking.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Invoice #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Guest Name</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-600 md:table-cell">Room</th>
                  <th className="hidden px-4 py-3 text-left font-semibold text-gray-600 lg:table-cell">Dates</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv, i) => (
                  <motion.tr
                    key={inv.id}
                    className="hover:bg-gray-50/50 transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="px-4 py-3 font-medium text-teal-700">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-gray-800">{inv.guest_name}</td>
                    <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{inv.room_name}</td>
                    <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                      {inv.check_in ? `${safeDate(inv.check_in)} – ${safeDate(inv.check_out)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-center">{statusBadge(inv.payment_status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewInvoice(inv.id)}
                        disabled={detailLoading}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Generate Modal */}
      <GenerateModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerated={fetchInvoices}
      />

      {/* Manual Invoice / Quotation Modal */}
      <ManualInvoiceModal
        open={showManualModal}
        docType={docType}
        onClose={() => setShowManualModal(false)}
        onCreated={fetchInvoices}
      />
    </div>
  )
}
