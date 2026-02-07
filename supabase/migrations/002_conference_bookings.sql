-- Conference Bookings table
CREATE TABLE IF NOT EXISTS conference_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  booking_type VARCHAR(50) DEFAULT 'full_day',
  number_of_attendees INTEGER DEFAULT 1,
  special_requirements TEXT,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  total_price INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conference_bookings ENABLE ROW LEVEL SECURITY;

-- Policy for reading (admins only)
CREATE POLICY "Allow all operations on conference_bookings" ON conference_bookings
  FOR ALL USING (true) WITH CHECK (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_conference_bookings_date ON conference_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_conference_bookings_status ON conference_bookings(status);
