-- =====================================================
-- E'Nauwi Resort - Departments & Enhanced Roles System
-- =====================================================

-- Drop existing tables if needed for clean migration
DROP TABLE IF EXISTS department_documents CASCADE;
DROP TABLE IF EXISTS department_announcements CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  color VARCHAR(20) DEFAULT '#0D4F8B', -- Brand color for department
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEPARTMENT ANNOUNCEMENTS
-- Only visible to department members
-- =====================================================
CREATE TABLE department_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DEPARTMENT DOCUMENTS/SOPs
-- =====================================================
CREATE TABLE department_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  file_type VARCHAR(50), -- pdf, doc, link, video, etc.
  file_size INTEGER, -- Size in bytes
  category VARCHAR(100), -- SOP, Policy, Training, etc.
  uploaded_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- UPDATE STAFF TABLE
-- Add department_id foreign key
-- =====================================================
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_department_announcements_dept ON department_announcements(department_id);
CREATE INDEX IF NOT EXISTS idx_department_documents_dept ON department_documents(department_id);

-- =====================================================
-- UPDATE ROLES TABLE (if permissions column needs update)
-- =====================================================
-- The existing roles table should already have a permissions JSONB column
-- We'll ensure it exists with proper structure

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_department_announcements_updated_at ON department_announcements;
CREATE TRIGGER update_department_announcements_updated_at
  BEFORE UPDATE ON department_announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_department_documents_updated_at ON department_documents;
CREATE TRIGGER update_department_documents_updated_at
  BEFORE UPDATE ON department_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT DEPARTMENTS
-- =====================================================
INSERT INTO departments (name, description, image_url, color) VALUES
('Front Desk', 'Reception, check-in/out, and guest services', '/images/resort/beach-resort-overview.jpg', '#0D4F8B'),
('Housekeeping', 'Room cleaning, laundry, and property maintenance', '/images/resort/resort-buildings-aerial.jpg', '#40916C'),
('Kitchen', 'Food preparation and kitchen operations', '/images/resort/enauwi-photos/kitchen-1.jpg', '#E8941C'),
('Restaurant', 'Dining service and guest food service', '/images/resort/enauwi-photos/restaurant-1.jpg', '#C77B0A'),
('Maintenance', 'Property maintenance and repairs', '/images/resort/resort-lagoon-aerial.jpg', '#854B06'),
('Security', 'Resort security and guest safety', '/images/resort/private-island-sandbar.jpg', '#093763'),
('Management', 'Resort management and administration', '/images/resort/lagoon-island-view.jpg', '#0D4F8B'),
('Activities', 'Guest activities and tours coordination', '/images/resort/beach-kayaks-cove.jpg', '#17A2B8')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  color = EXCLUDED.color;

-- =====================================================
-- ENABLE RLS (Row Level Security)
-- =====================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_documents ENABLE ROW LEVEL SECURITY;

-- Policies for departments (allow all authenticated users to read)
CREATE POLICY "Allow read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage departments" ON departments FOR ALL USING (true);

-- Policies for department_announcements
CREATE POLICY "Allow read department_announcements" ON department_announcements FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage department_announcements" ON department_announcements FOR ALL USING (true);

-- Policies for department_documents
CREATE POLICY "Allow read department_documents" ON department_documents FOR SELECT USING (true);
CREATE POLICY "Allow admins to manage department_documents" ON department_documents FOR ALL USING (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON departments TO authenticated;
GRANT ALL ON department_announcements TO authenticated;
GRANT ALL ON department_documents TO authenticated;
GRANT ALL ON departments TO anon;
GRANT ALL ON department_announcements TO anon;
GRANT ALL ON department_documents TO anon;
