-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create guests table
CREATE TABLE guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    language TEXT DEFAULT 'english',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE rooms (
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
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id),
    channel TEXT DEFAULT 'website',
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    language TEXT DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create knowledge_base table (for future RAG implementation)
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- For OpenAI embeddings
    category TEXT,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
);

-- Add RLS (Row Level Security) policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Allow read access to rooms and knowledge_base for everyone
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON rooms FOR SELECT USING (true);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON knowledge_base FOR SELECT USING (true);

-- Allow insert and read for conversations and messages (for chat functionality)
CREATE POLICY "Enable insert for all users" ON conversations FOR INSERT USING (true);
CREATE POLICY "Enable read for all users" ON conversations FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON conversations FOR UPDATE USING (true);

CREATE POLICY "Enable insert for all users" ON messages FOR INSERT USING (true);
CREATE POLICY "Enable read for all users" ON messages FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON guests FOR INSERT USING (true);
CREATE POLICY "Enable read for all users" ON guests FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON bookings FOR INSERT USING (true);
CREATE POLICY "Enable read for all users" ON bookings FOR SELECT USING (true);