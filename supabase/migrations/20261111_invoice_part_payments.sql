-- Part payments / deposits on invoices (Marketing request, 11 Nov 2026).
-- An invoice can now be paid in several instalments (e.g. a 50% deposit, then the
-- balance). Each instalment is a row in invoice_payments; invoices.amount_paid is
-- the running total, so the invoice/receipt can show Total / Amount Paid /
-- Outstanding Balance. Additive only: nothing existing is dropped or renamed.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  method TEXT,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  received_by UUID,
  received_by_name TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(invoice_id);

ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoice_payments_service_only" ON invoice_payments;
CREATE POLICY "invoice_payments_service_only" ON invoice_payments FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Invoices already marked paid were paid in full.
UPDATE invoices SET amount_paid = total WHERE payment_status = 'paid' AND amount_paid = 0;
