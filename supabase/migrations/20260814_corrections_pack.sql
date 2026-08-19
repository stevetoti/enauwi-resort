-- Corrections & features pack (team email 2026-08-14)

-- 2 & 3. Invoice "Created By" / "Payment Received By" (staff dropdown, stored for audit)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS created_by_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS received_by UUID;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS received_by_name TEXT;

-- 5. Void / cancel invoices (retain for audit) + hard delete for authorised staff
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voided BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voided_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS voided_by_name TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS void_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_invoices_voided ON invoices(voided);

-- 4. Expanded expense categories: lift the old 6-value CHECK, add a 3rd level
ALTER TABLE finance_transactions DROP CONSTRAINT IF EXISTS finance_transactions_category_check;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS sub_subcategory VARCHAR(150);
