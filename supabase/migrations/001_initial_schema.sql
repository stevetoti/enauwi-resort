-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    language TEXT DEFAULT 'english',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    price_vt INTEGER NOT NULL,
    max_guests INTEGER DEFAULT 2,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    available BOOLEAN DEFAULT true
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id),
    channel TEXT DEFAULT 'website',
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    num_guests INTEGER DEFAULT 1,
    total_price INTEGER,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table (without vector for now)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create staff table for admin auth
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('super_admin', 'manager', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_availability table for date-based pricing/availability
CREATE TABLE IF NOT EXISTS room_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    available BOOLEAN DEFAULT true,
    price_override INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- Create contact_requests table
CREATE TABLE IF NOT EXISTS contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample room data
INSERT INTO rooms (name, type, description, price_vt, max_guests, amenities, images) VALUES
(
    'Oceanfront Bungalow',
    'bungalow',
    'Charming beachfront bungalow with stunning ocean views, private deck, and direct beach access.',
    12000,
    2,
    '["Private deck", "Ocean view", "Beach access", "Air conditioning", "WiFi", "Mini fridge"]',
    '["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3"]'
),
(
    'Tropical Garden Suite',
    'suite',
    'Luxurious suite nestled in tropical gardens with spacious living area, kitchenette, and private bathroom.',
    18000,
    4,
    '["Garden view", "Kitchenette", "Living area", "Air conditioning", "WiFi", "Private bathroom", "Balcony"]',
    '["https://images.unsplash.com/photo-1578774204375-826dc5d996ed?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1578774635085-6c0a9a98b9ff?ixlib=rb-4.0.3"]'
),
(
    'Premium Beachfront Villa',
    'villa',
    'Exclusive beachfront villa with panoramic ocean views, private pool, full kitchen, and multiple bedrooms.',
    25000,
    6,
    '["Private pool", "Ocean view", "Full kitchen", "Multiple bedrooms", "Beach access", "Air conditioning", "WiFi", "Private terrace"]',
    '["https://images.unsplash.com/photo-1602002418082-a4443e081dd1?ixlib=rb-4.0.3", "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3"]'
)
ON CONFLICT DO NOTHING;

-- Insert default admin staff record
INSERT INTO staff (email, name, role) VALUES
('admin@enauwi.com', 'Admin', 'super_admin'),
('gm@enauwibeachresort.com', 'General Manager', 'manager')
ON CONFLICT (email) DO NOTHING;
-- RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Rooms: public read
CREATE POLICY "rooms_read" ON rooms FOR SELECT USING (true);

-- Knowledge base: public read
CREATE POLICY "kb_read" ON knowledge_base FOR SELECT USING (true);

-- Conversations: public insert/read/update
CREATE POLICY "conv_insert" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "conv_read" ON conversations FOR SELECT USING (true);
CREATE POLICY "conv_update" ON conversations FOR UPDATE USING (true);

-- Messages: public insert/read
CREATE POLICY "msg_insert" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "msg_read" ON messages FOR SELECT USING (true);

-- Guests: public insert/read
CREATE POLICY "guest_insert" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "guest_read" ON guests FOR SELECT USING (true);

-- Bookings: public insert/read, service role update
CREATE POLICY "booking_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "booking_read" ON bookings FOR SELECT USING (true);
CREATE POLICY "booking_update" ON bookings FOR UPDATE USING (true);

-- Staff: public read (needed for login check)
CREATE POLICY "staff_read" ON staff FOR SELECT USING (true);

-- Room availability: public read
CREATE POLICY "avail_read" ON room_availability FOR SELECT USING (true);

-- Contact requests: public insert
CREATE POLICY "contact_insert" ON contact_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_read" ON contact_requests FOR SELECT USING (true);

-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to room-images bucket
CREATE POLICY "room_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');
CREATE POLICY "room_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'room-images');
CREATE POLICY "room_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'room-images');
