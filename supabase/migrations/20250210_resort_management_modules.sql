-- =====================================================
-- E'Nauwi Resort - Resort Management Modules
-- Finance, POS, Events, Inventory, Housekeeping
-- =====================================================

-- =====================================================
-- 1. FINANCE TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS finance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Rooms', 'Restaurant', 'Conference', 'Activities', 'Bar', 'Other')),
    subcategory VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    order_id UUID,
    event_id UUID,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. MENU ITEMS TABLE (Restaurant POS)
-- =====================================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. POS ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pos_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number SERIAL,
    items JSONB NOT NULL DEFAULT '[]',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'room_charge', 'mobile')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    guest_name VARCHAR(255),
    table_number VARCHAR(20),
    notes TEXT,
    served_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. VENUES TABLE (Conference Rooms)
-- =====================================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capacity INTEGER NOT NULL DEFAULT 0,
    amenities JSONB DEFAULT '[]',
    hourly_rate DECIMAL(10,2),
    half_day_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    package VARCHAR(50) CHECK (package IN ('hourly', 'half_day', 'full_day', 'custom')),
    attendees INTEGER,
    catering_included BOOLEAN DEFAULT false,
    catering_notes TEXT,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. INVENTORY ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100) NOT NULL CHECK (category IN ('F&B', 'Supplies', 'Amenities', 'Equipment', 'Cleaning', 'Other')),
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10,2) DEFAULT 0,
    min_stock DECIMAL(10,2) DEFAULT 0,
    max_stock DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    supplier VARCHAR(255),
    supplier_contact VARCHAR(100),
    location VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. INVENTORY LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out', 'adjust')),
    reason VARCHAR(100),
    reference_id UUID,
    notes TEXT,
    logged_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    address TEXT,
    category VARCHAR(100),
    payment_terms VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. HOUSEKEEPING TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    task_type VARCHAR(50) DEFAULT 'cleaning' CHECK (task_type IN ('cleaning', 'turndown', 'deep_clean', 'maintenance', 'inspection')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'inspected', 'issue_reported')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES staff(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_time TIME,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    inspected_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    inspected_at TIMESTAMPTZ,
    notes TEXT,
    issues TEXT,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. ROOM STATUS TABLE (for housekeeping board)
-- =====================================================
CREATE TABLE IF NOT EXISTS room_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
    status VARCHAR(30) DEFAULT 'clean' CHECK (status IN ('clean', 'dirty', 'in_progress', 'inspected', 'out_of_order', 'do_not_disturb')),
    last_cleaned_at TIMESTAMPTZ,
    last_cleaned_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    last_inspected_at TIMESTAMPTZ,
    last_inspected_by UUID REFERENCES staff(id) ON DELETE SET NULL,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_finance_category ON finance_transactions(category);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_booking ON finance_transactions(booking_id);

CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);

CREATE INDEX IF NOT EXISTS idx_orders_date ON pos_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON pos_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_booking ON pos_orders(booking_id);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory_items(current_stock);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_item ON inventory_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_date ON inventory_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_housekeeping_room ON housekeeping_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_date ON housekeeping_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_housekeeping_status ON housekeeping_tasks(status);
CREATE INDEX IF NOT EXISTS idx_housekeeping_assigned ON housekeeping_tasks(assigned_to);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Allow all for now, restrict via app)
-- =====================================================
CREATE POLICY "finance_all" ON finance_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "menu_all" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "orders_all" ON pos_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "venues_all" ON venues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "events_all" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "inventory_all" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "inventory_logs_all" ON inventory_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "suppliers_all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "housekeeping_all" ON housekeeping_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "room_status_all" ON room_status FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_finance_updated_at ON finance_transactions;
CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_updated_at ON menu_items;
CREATE TRIGGER update_menu_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON pos_orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON pos_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_venues_updated_at ON venues;
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_housekeeping_updated_at ON housekeeping_tasks;
CREATE TRIGGER update_housekeeping_updated_at BEFORE UPDATE ON housekeeping_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_room_status_updated_at ON room_status;
CREATE TRIGGER update_room_status_updated_at BEFORE UPDATE ON room_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA
-- =====================================================

-- Sample Menu Categories and Items
INSERT INTO menu_items (name, description, category, price, available) VALUES
('Grilled Fish', 'Fresh catch of the day, grilled with local herbs', 'Main Course', 2500, true),
('Coconut Curry Chicken', 'Traditional coconut curry with tender chicken', 'Main Course', 2200, true),
('Island Salad', 'Fresh tropical fruits and vegetables', 'Starters', 1200, true),
('Seafood Platter', 'Selection of prawns, fish, and crab', 'Main Course', 4500, true),
('Tropical Fruit Bowl', 'Seasonal island fruits', 'Desserts', 800, true),
('Fresh Coconut', 'Young coconut with straw', 'Beverages', 400, true),
('Local Beer', 'Tusker or Vanuatu Bitter', 'Beverages', 600, true),
('House Wine', 'Glass of red or white wine', 'Beverages', 900, true),
('Coffee', 'Freshly brewed Vanuatu coffee', 'Beverages', 350, true),
('Breakfast Set', 'Eggs, toast, fruits, and coffee', 'Breakfast', 1500, true)
ON CONFLICT DO NOTHING;

-- Sample Venues
INSERT INTO venues (name, description, capacity, hourly_rate, half_day_rate, daily_rate, amenities) VALUES
('Nakamal Conference Room', 'Traditional style meeting room with modern amenities', 30, 5000, 15000, 25000, '["Projector", "Whiteboard", "WiFi", "Air Conditioning", "Sound System"]'),
('Beach Pavilion', 'Open-air pavilion with ocean views', 50, 7500, 22500, 40000, '["Natural Ventilation", "WiFi", "Sound System", "Catering Area"]'),
('Garden Gazebo', 'Intimate setting surrounded by tropical gardens', 15, 3000, 9000, 15000, '["Natural Setting", "Power Outlets", "Portable Equipment Available"]')
ON CONFLICT DO NOTHING;

-- Sample Inventory Items
INSERT INTO inventory_items (name, category, unit, current_stock, min_stock, supplier) VALUES
('Toilet Paper', 'Supplies', 'rolls', 200, 50, 'Vanuatu Supplies Ltd'),
('Bed Sheets (Queen)', 'Amenities', 'sets', 40, 15, 'Pacific Linens'),
('Dish Soap', 'Cleaning', 'liters', 25, 10, 'CleanCo Vanuatu'),
('Fresh Fish', 'F&B', 'kg', 15, 5, 'Local Fishermen'),
('Rice', 'F&B', 'kg', 100, 25, 'Island Foods'),
('Cooking Oil', 'F&B', 'liters', 30, 10, 'Island Foods'),
('Cleaning Cloths', 'Cleaning', 'pieces', 50, 20, 'CleanCo Vanuatu'),
('Light Bulbs', 'Equipment', 'pieces', 30, 10, 'Hardware Plus'),
('Shampoo', 'Amenities', 'bottles', 100, 30, 'Pacific Linens'),
('Coffee Beans', 'F&B', 'kg', 20, 5, 'Vanuatu Coffee Co')
ON CONFLICT DO NOTHING;

-- Initialize room status for all rooms
INSERT INTO room_status (room_id, status)
SELECT id, 'clean' FROM rooms
ON CONFLICT (room_id) DO NOTHING;

-- Sample Finance Transactions (last 7 days)
INSERT INTO finance_transactions (date, category, subcategory, amount, type, description, payment_method) VALUES
(CURRENT_DATE - INTERVAL '6 days', 'Rooms', 'Bungalow', 12000, 'income', 'Room booking - Oceanfront Bungalow', 'card'),
(CURRENT_DATE - INTERVAL '5 days', 'Restaurant', 'Dinner', 4500, 'income', 'Dinner service - Table 3', 'cash'),
(CURRENT_DATE - INTERVAL '5 days', 'Rooms', 'Suite', 18000, 'income', 'Room booking - Tropical Garden Suite', 'card'),
(CURRENT_DATE - INTERVAL '4 days', 'Bar', 'Beverages', 3200, 'income', 'Bar sales', 'cash'),
(CURRENT_DATE - INTERVAL '4 days', 'Restaurant', 'Lunch', 2800, 'income', 'Lunch service', 'room_charge'),
(CURRENT_DATE - INTERVAL '3 days', 'Activities', 'Snorkeling', 5000, 'income', 'Snorkeling tour - 2 guests', 'card'),
(CURRENT_DATE - INTERVAL '3 days', 'Other', 'Supplies', 15000, 'expense', 'Monthly supplies order', 'card'),
(CURRENT_DATE - INTERVAL '2 days', 'Rooms', 'Villa', 25000, 'income', 'Room booking - Premium Villa', 'card'),
(CURRENT_DATE - INTERVAL '2 days', 'Restaurant', 'Breakfast', 3000, 'income', 'Breakfast service', 'room_charge'),
(CURRENT_DATE - INTERVAL '1 day', 'Conference', 'Room Hire', 25000, 'income', 'Conference room - Full day', 'card'),
(CURRENT_DATE - INTERVAL '1 day', 'Bar', 'Beverages', 4100, 'income', 'Bar sales', 'cash'),
(CURRENT_DATE, 'Restaurant', 'Dinner', 5500, 'income', 'Dinner service - 2 tables', 'cash'),
(CURRENT_DATE, 'Activities', 'Kayak', 2000, 'income', 'Kayak rental - 2 hours', 'card')
ON CONFLICT DO NOTHING;
