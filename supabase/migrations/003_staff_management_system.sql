-- ============================================================
-- E'Nauwi Resort Staff Management System
-- Migration: 003_staff_management_system.sql
-- ============================================================

-- 1. ROLES TABLE - Custom role definitions with permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system roles
INSERT INTO roles (name, description, permissions, is_system_role) VALUES
('Super Admin', 'Full system access - can manage everything', '{
    "staff": {"view": true, "create": true, "edit": true, "delete": true, "invite": true},
    "bookings": {"view": true, "create": true, "edit": true, "delete": true},
    "guests": {"view": true, "create": true, "edit": true, "delete": true},
    "rooms": {"view": true, "create": true, "edit": true, "delete": true},
    "services": {"view": true, "create": true, "edit": true, "delete": true},
    "conferences": {"view": true, "approve": true, "reject": true, "reschedule": true},
    "messages": {"view": true, "send_sms": true, "send_email": true, "broadcast": true},
    "announcements": {"view": true, "create": true, "edit": true, "delete": true, "pin": true},
    "attendance": {"view": true, "view_all": true, "export": true},
    "roles": {"view": true, "create": true, "edit": true, "delete": true},
    "reports": {"view": true, "export": true},
    "settings": {"view": true, "edit": true}
}', true),
('Manager', 'Manages bookings, guests, staff schedules', '{
    "staff": {"view": true, "create": false, "edit": false, "delete": false, "invite": false},
    "bookings": {"view": true, "create": true, "edit": true, "delete": false},
    "guests": {"view": true, "create": true, "edit": true, "delete": false},
    "rooms": {"view": true, "create": false, "edit": true, "delete": false},
    "services": {"view": true, "create": true, "edit": true, "delete": false},
    "conferences": {"view": true, "approve": true, "reject": true, "reschedule": true},
    "messages": {"view": true, "send_sms": true, "send_email": true, "broadcast": false},
    "announcements": {"view": true, "create": true, "edit": true, "delete": false, "pin": true},
    "attendance": {"view": true, "view_all": true, "export": true},
    "roles": {"view": true, "create": false, "edit": false, "delete": false},
    "reports": {"view": true, "export": true},
    "settings": {"view": true, "edit": false}
}', true),
('Front Desk', 'Handles check-ins, guest inquiries, bookings', '{
    "staff": {"view": false, "create": false, "edit": false, "delete": false, "invite": false},
    "bookings": {"view": true, "create": true, "edit": true, "delete": false},
    "guests": {"view": true, "create": true, "edit": true, "delete": false},
    "rooms": {"view": true, "create": false, "edit": false, "delete": false},
    "services": {"view": true, "create": false, "edit": false, "delete": false},
    "conferences": {"view": true, "approve": false, "reject": false, "reschedule": false},
    "messages": {"view": true, "send_sms": true, "send_email": true, "broadcast": false},
    "announcements": {"view": true, "create": false, "edit": false, "delete": false, "pin": false},
    "attendance": {"view": true, "view_all": false, "export": false},
    "roles": {"view": false, "create": false, "edit": false, "delete": false},
    "reports": {"view": false, "export": false},
    "settings": {"view": false, "edit": false}
}', true),
('Kitchen', 'Manages food orders and kitchen operations', '{
    "staff": {"view": false, "create": false, "edit": false, "delete": false, "invite": false},
    "bookings": {"view": false, "create": false, "edit": false, "delete": false},
    "guests": {"view": false, "create": false, "edit": false, "delete": false},
    "rooms": {"view": false, "create": false, "edit": false, "delete": false},
    "services": {"view": true, "create": false, "edit": false, "delete": false},
    "conferences": {"view": false, "approve": false, "reject": false, "reschedule": false},
    "messages": {"view": false, "send_sms": false, "send_email": false, "broadcast": false},
    "announcements": {"view": true, "create": false, "edit": false, "delete": false, "pin": false},
    "attendance": {"view": true, "view_all": false, "export": false},
    "roles": {"view": false, "create": false, "edit": false, "delete": false},
    "reports": {"view": false, "export": false},
    "settings": {"view": false, "edit": false},
    "kitchen": {"view_orders": true, "update_orders": true}
}', true),
('Housekeeping', 'Manages room cleaning and maintenance', '{
    "staff": {"view": false, "create": false, "edit": false, "delete": false, "invite": false},
    "bookings": {"view": false, "create": false, "edit": false, "delete": false},
    "guests": {"view": false, "create": false, "edit": false, "delete": false},
    "rooms": {"view": true, "create": false, "edit": false, "delete": false},
    "services": {"view": false, "create": false, "edit": false, "delete": false},
    "conferences": {"view": false, "approve": false, "reject": false, "reschedule": false},
    "messages": {"view": false, "send_sms": false, "send_email": false, "broadcast": false},
    "announcements": {"view": true, "create": false, "edit": false, "delete": false, "pin": false},
    "attendance": {"view": true, "view_all": false, "export": false},
    "roles": {"view": false, "create": false, "edit": false, "delete": false},
    "reports": {"view": false, "export": false},
    "settings": {"view": false, "edit": false},
    "housekeeping": {"view_rooms": true, "update_cleaning": true}
}', true)
ON CONFLICT (name) DO NOTHING;

-- 2. ALTER STAFF TABLE - Add new columns
ALTER TABLE staff ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
ALTER TABLE staff ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES staff(id);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing staff with role_id based on role column
UPDATE staff s SET role_id = r.id 
FROM roles r 
WHERE s.role = 'super_admin' AND r.name = 'Super Admin' AND s.role_id IS NULL;

UPDATE staff s SET role_id = r.id 
FROM roles r 
WHERE s.role = 'manager' AND r.name = 'Manager' AND s.role_id IS NULL;

UPDATE staff s SET role_id = r.id 
FROM roles r 
WHERE s.role = 'staff' AND r.name = 'Front Desk' AND s.role_id IS NULL;

-- 3. STAFF ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    hours_worked DECIMAL(5, 2),
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'leave')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- 4. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID REFERENCES staff(id),
    pinned BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_roles UUID[] DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANNOUNCEMENT READS TABLE
CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(announcement_id, staff_id)
);

-- 6. MESSAGE LOGS TABLE
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES guests(id),
    recipient_name VARCHAR(255),
    recipient_contact VARCHAR(255) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
    message_type VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    template_id UUID,
    sent_by UUID REFERENCES staff(id),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- 7. MESSAGE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'email', 'whatsapp')),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default message templates
INSERT INTO message_templates (name, channel, subject, content, variables, category) VALUES
('Booking Confirmation SMS', 'sms', NULL, 'Hello {{guest_name}}, your booking at E''Nauwi Resort is confirmed! Ref: {{booking_ref}}. Check-in: {{check_in}}. Call +678 22170 for questions.', '["guest_name", "booking_ref", "check_in"]', 'booking'),
('Check-in Reminder', 'sms', NULL, 'Dear {{guest_name}}, reminder: your check-in at E''Nauwi Resort is tomorrow ({{check_in}}). We look forward to welcoming you!', '["guest_name", "check_in"]', 'reminder'),
('Welcome Message', 'sms', NULL, 'Welkam long E''Nauwi Beach Resort, {{guest_name}}! We hope you enjoy your stay. Need anything? Text us or call +678 22170.', '["guest_name"]', 'welcome'),
('Thank You', 'sms', NULL, 'Tankiu tumas {{guest_name}} for staying at E''Nauwi Resort! We hope to see you again soon. Safe travels!', '["guest_name"]', 'checkout'),
('Booking Confirmation Email', 'email', 'Your E''Nauwi Resort Booking Confirmation', 'Dear {{guest_name}},\n\nYour booking has been confirmed!\n\nBooking Reference: {{booking_ref}}\nRoom: {{room_name}}\nCheck-in: {{check_in}}\nCheck-out: {{check_out}}\n\nWe look forward to welcoming you to paradise!\n\nBest regards,\nE''Nauwi Beach Resort Team', '["guest_name", "booking_ref", "room_name", "check_in", "check_out"]', 'booking')
ON CONFLICT DO NOTHING;

-- 8. STAFF INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id),
    department VARCHAR(100),
    invitation_token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID REFERENCES staff(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. ROOM CLEANING STATUS (for housekeeping)
CREATE TABLE IF NOT EXISTS room_cleaning_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'cleaned', 'inspected', 'needs_maintenance')),
    assigned_to UUID REFERENCES staff(id),
    cleaned_by UUID REFERENCES staff(id),
    cleaned_at TIMESTAMP WITH TIME ZONE,
    inspected_by UUID REFERENCES staff(id),
    inspected_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, date)
);

-- 10. STAFF TASKS TABLE
CREATE TABLE IF NOT EXISTS staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES staff(id),
    assigned_by UUID REFERENCES staff(id),
    due_date DATE,
    due_time TIME,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    category VARCHAR(50),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. STAFF SHIFTS TABLE
CREATE TABLE IF NOT EXISTS staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(20) DEFAULT 'regular' CHECK (shift_type IN ('regular', 'overtime', 'on_call')),
    notes TEXT,
    created_by UUID REFERENCES staff(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_cleaning_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all for now, will restrict based on role in app)
CREATE POLICY "roles_all" ON roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "attendance_all" ON staff_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "announcements_all" ON announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "announcement_reads_all" ON announcement_reads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "message_logs_all" ON message_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "message_templates_all" ON message_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "staff_invitations_all" ON staff_invitations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "room_cleaning_all" ON room_cleaning_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "staff_tasks_all" ON staff_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "staff_shifts_all" ON staff_shifts FOR ALL USING (true) WITH CHECK (true);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_staff_role_id ON staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON staff_attendance(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON staff_attendance(date);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_sent_at ON message_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_logs_sent_by ON message_logs(sent_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON staff_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_shifts_staff_date ON staff_shifts(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_cleaning_room_date ON room_cleaning_status(room_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_attendance_updated_at ON staff_attendance;
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON staff_attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON message_templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cleaning_updated_at ON room_cleaning_status;
CREATE TRIGGER update_cleaning_updated_at BEFORE UPDATE ON room_cleaning_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON staff_tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON staff_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shifts_updated_at ON staff_shifts;
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON staff_shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
