-- Quotation module: reuse the invoices table with a document type ('invoice' | 'quote').
-- A quote can later be converted into an invoice.
-- Run this in the Supabase SQL editor before the Quotes feature will work.

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS doc_type TEXT NOT NULL DEFAULT 'invoice';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS valid_until DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS quote_status TEXT;            -- draft | sent | accepted | declined | converted
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_invoice_number TEXT; -- set when a quote becomes an invoice

-- Separate sequential counter for quotation numbers (QUO-XXXXX)
CREATE TABLE IF NOT EXISTS quote_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_number INTEGER NOT NULL DEFAULT 0
);
INSERT INTO quote_counter (id, last_number) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_invoices_doc_type ON invoices(doc_type);
