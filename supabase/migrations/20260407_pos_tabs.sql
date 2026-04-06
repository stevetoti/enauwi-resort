-- ============================================
-- POS Tabs: Guest running bills
-- ============================================

-- Add tab support fields to pos_orders
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS tab_name TEXT;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS tab_status TEXT DEFAULT 'closed';
  -- 'open' = running tab, 'closed' = paid/complete
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS send_to_kitchen BOOLEAN DEFAULT false;

-- Index for quick tab lookups
CREATE INDEX IF NOT EXISTS idx_pos_orders_tab_status ON pos_orders(tab_status) WHERE tab_status = 'open';
