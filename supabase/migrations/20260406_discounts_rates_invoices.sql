-- ============================================
-- Room Discounts & Promotions
-- ============================================
CREATE TABLE IF NOT EXISTS room_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT DEFAULT 'all', -- 'all', 'direct_booking', 'returning_guest'
  min_nights INTEGER DEFAULT 1,
  created_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Allow null room_id for resort-wide discounts
ALTER TABLE room_discounts ALTER COLUMN room_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE room_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discounts_public_read" ON room_discounts FOR SELECT USING (true);
CREATE POLICY "discounts_service_write" ON room_discounts FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Rate Seasons (different rates for different periods)
-- ============================================
CREATE TABLE IF NOT EXISTS rate_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  multiplier NUMERIC(4,2) DEFAULT 1.00, -- 1.5 = 50% more, 0.8 = 20% less
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_date >= start_date),
  CHECK (multiplier > 0)
);

ALTER TABLE rate_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seasons_public_read" ON rate_seasons FOR SELECT USING (true);
CREATE POLICY "seasons_service_write" ON rate_seasons FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Add pricing fields to bookings
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_price INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'property';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_reference TEXT;

-- ============================================
-- Invoices
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  room_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  num_nights INTEGER NOT NULL,
  num_guests INTEGER DEFAULT 1,
  base_rate INTEGER NOT NULL,
  base_total INTEGER NOT NULL,
  discount_name TEXT,
  discount_percent INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  subtotal INTEGER NOT NULL,
  tax_percent INTEGER DEFAULT 0,
  tax_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'property',
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  special_requests TEXT,
  issued_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_service_only" ON invoices FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Invoice line items (for activities, extras)
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total INTEGER NOT NULL,
  item_type TEXT DEFAULT 'accommodation', -- 'accommodation', 'activity', 'extra', 'fee'
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoice_items_service_only" ON invoice_items FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- Invoice counter for sequential numbering
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_counter (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_number INTEGER DEFAULT 0
);
INSERT INTO invoice_counter (id, last_number) VALUES (1, 0) ON CONFLICT DO NOTHING;

ALTER TABLE invoice_counter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "counter_service_only" ON invoice_counter FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
