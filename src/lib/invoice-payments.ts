// Part payments on invoices: shared rules for the API and the admin screens.
// invoices.amount_paid is the running total of invoice_payments (see
// supabase/migrations/20261111_invoice_part_payments.sql).

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export interface InvoicePayment {
  id: string
  invoice_id: string
  amount: number
  method: string | null
  paid_at: string
  received_by: string | null
  received_by_name: string | null
  note: string | null
  created_at: string
}

interface PaidLike {
  total: number
  amount_paid?: number | null
  payment_status?: string | null
}

/** Amount received so far. Invoices marked paid before part payments existed count as paid in full. */
export function paidAmount(inv: PaidLike): number {
  const paid = Number(inv.amount_paid) || 0
  if (inv.payment_status === 'paid' && paid === 0) return Number(inv.total) || 0
  return paid
}

export function outstandingAmount(inv: PaidLike): number {
  return Math.max(0, (Number(inv.total) || 0) - paidAmount(inv))
}

export function statusFor(amountPaid: number, total: number): PaymentStatus {
  if (amountPaid <= 0) return 'unpaid'
  return amountPaid >= total ? 'paid' : 'partial'
}

export const PAYMENT_METHODS: Array<{ value: string; label: string }> = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'credit_card', label: 'Card / EFTPOS' },
  { value: 'other', label: 'Other' },
]

export function methodLabel(value: string | null | undefined): string {
  if (!value) return '—'
  const known = PAYMENT_METHODS.find((m) => m.value === value)
  if (known) return known.label
  if (value === 'property') return 'Pay at property'
  return value.replace(/_/g, ' ')
}

/** Staff allowed to remove a recorded payment or void/delete invoices. */
export function canManageInvoices(session: {
  role?: string
  permissions?: Record<string, Record<string, boolean>>
}): boolean {
  const role = String(session.role || '').toLowerCase()
  const p = session.permissions || {}
  return (
    ['super_admin', 'admin', 'manager'].includes(role) ||
    !!p?.invoices?.edit || !!p?.invoices?.delete ||
    !!p?.bookings?.edit || !!p?.bookings?.delete ||
    !!p?.finance?.edit
  )
}
