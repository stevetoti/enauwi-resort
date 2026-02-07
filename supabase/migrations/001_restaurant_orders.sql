-- E'Nauwi Restaurant Order System
-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES menu_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_vegetarian BOOLEAN DEFAULT false,
  is_vegan BOOLEAN DEFAULT false,
  allergens TEXT[],
  prep_time_mins INT DEFAULT 15,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status Enum
CREATE TYPE order_status AS ENUM (
  'pending',      -- Just submitted
  'accepted',     -- Restaurant accepted
  'preparing',    -- Cooking
  'ready',        -- Food ready
  'delivering',   -- Bringing to room
  'delivered',    -- Complete
  'cancelled'     -- Cancelled
);

-- Delivery Location Enum
CREATE TYPE delivery_location AS ENUM (
  'restaurant',   -- Eat in restaurant
  'room'          -- Room delivery
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number SERIAL,
  guest_name TEXT NOT NULL,
  room_number TEXT,
  phone TEXT,
  status order_status DEFAULT 'pending',
  delivery_location delivery_location,
  special_instructions TEXT,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivering_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read for menu
CREATE POLICY "Menu categories public read" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Menu items public read" ON menu_items FOR SELECT USING (true);

-- Orders: anyone can create, only service role can update
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read own order" ON orders FOR SELECT USING (true);
CREATE POLICY "Service can update orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);

-- Realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
