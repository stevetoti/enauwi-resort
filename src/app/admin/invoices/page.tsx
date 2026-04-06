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
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { csrfHeaders } from '@/lib/csrf-client'

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
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return `VT ${amount.toLocaleString('en-US')}`
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
// Generate Invoice Modal
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
  const [bookingId, setBookingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!bookingId.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: csrfHeaders(),
        body: JSON.stringify({ booking_id: bookingId.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to generate invoice')
      }
      setBookingId('')
      onGenerated()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
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
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Generate Invoice from Booking</h2>
            <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-gray-500">
            Enter the booking ID to generate a professional invoice. You can find booking IDs on the Bookings page.
          </p>

          <input
            type="text"
            placeholder="Paste booking ID..."
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !bookingId.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate Invoice
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
  const printRef = useRef<HTMLDivElement>(null)

  const canShowReceipt = invoice.payment_status === 'paid'

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

  const docTitle = receiptMode ? 'RECEIPT' : 'INVOICE'

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

        {invoice.payment_status !== 'paid' && (
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
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          <Printer className="h-4 w-4" /> Print
        </button>
      </div>

      {/* Printable Invoice */}
      <div
        ref={printRef}
        className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none"
      >
        {/* Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-700">E&apos;NAUWI BEACH RESORT</h1>
              <p className="mt-1 text-sm text-gray-500">South East Efate, Vanuatu</p>
              <p className="text-sm text-gray-500">+678 22170</p>
              <p className="text-sm text-gray-500">reservation@enauwibeachresort.com</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block rounded-lg px-3 py-1 text-sm font-bold uppercase tracking-wider ${
                  receiptMode ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
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
              Date: {formatDate(invoice.issued_at)}
            </p>
            {receiptMode && invoice.paid_at && (
              <p className="mt-0.5 text-sm text-gray-500">
                Payment Date: {formatDate(invoice.paid_at)}
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
              <span className="font-medium text-gray-700">Check-in:</span> {formatDate(invoice.check_in)}
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Check-out:</span> {formatDate(invoice.check_out)}
            </p>
            <p className="text-gray-500">
              <span className="font-medium text-gray-700">Guests:</span> {invoice.num_guests}
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

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm font-medium text-teal-700">Thank you for choosing E&apos;Nauwi Beach Resort!</p>
          <p className="mt-1 text-xs text-gray-400">www.enauwibeachresort.com</p>
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
      const res = await fetch(`/api/invoices?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch invoices')
      const data = await res.json()
      setInvoices(Array.isArray(data) ? data : data.invoices || [])
    } catch (err) {
      console.error('Failed to fetch invoices:', err)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

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
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and manage invoices for guest bookings
          </p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Generate from Booking
        </button>
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
                      {formatDate(inv.check_in)} &ndash; {formatDate(inv.check_out)}
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
    </div>
  )
}
