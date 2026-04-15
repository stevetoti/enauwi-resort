-- ============================================
-- Group Bookings (multi-room reservations)
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_id UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_group_lead BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_bookings_group_id ON bookings(group_id) WHERE group_id IS NOT NULL;

-- ============================================
-- Event date range + recurring
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_type TEXT DEFAULT 'none';
  -- 'none', 'daily', 'weekly', 'monthly'
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_end_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_occurrences INTEGER;
  -- Optional: number of occurrences (alt to end_date)
ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_parent_id UUID REFERENCES events(id) ON DELETE CASCADE;
  -- Links recurring instances back to the parent event

-- ============================================
-- Event pricing model (flat OR per-person)
-- ============================================
ALTER TABLE events ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'flat';
  -- 'flat' = total is the price, 'per_person' = price_per_person * attendees
ALTER TABLE events ADD COLUMN IF NOT EXISTS price_per_person DECIMAL(10,2);
ALTER TABLE events ADD COLUMN IF NOT EXISTS package_name TEXT;
  -- Free-text name like "Bronze Birthday Package", "Silver Birthday Package"
