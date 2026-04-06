-- Fix overly permissive RLS policies (only targets tables that exist in production)
-- Applied to production: 2026-04-06

-- Staff
DROP POLICY IF EXISTS "staff_read" ON staff;
DROP POLICY IF EXISTS "staff_insert" ON staff;
DROP POLICY IF EXISTS "staff_update" ON staff;
CREATE POLICY "staff_authenticated_read" ON staff
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "staff_service_insert" ON staff
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "staff_service_update" ON staff
  FOR UPDATE USING (auth.role() = 'service_role');

-- Roles
DROP POLICY IF EXISTS "roles_all" ON roles;
CREATE POLICY "roles_authenticated_read" ON roles
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "roles_service_write" ON roles
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Attendance
DROP POLICY IF EXISTS "attendance_all" ON staff_attendance;
CREATE POLICY "attendance_authenticated_read" ON staff_attendance
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "attendance_service_write" ON staff_attendance
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "attendance_service_update" ON staff_attendance
  FOR UPDATE USING (auth.role() = 'service_role');

-- Announcements
DROP POLICY IF EXISTS "announcements_all" ON announcements;
CREATE POLICY "announcements_authenticated_read" ON announcements
  FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "announcements_service_write" ON announcements
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Staff invitations
DROP POLICY IF EXISTS "staff_invitations_all" ON staff_invitations;
CREATE POLICY "invitations_service_only" ON staff_invitations
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Conversations
DROP POLICY IF EXISTS "conversations_insert" ON conversations;
DROP POLICY IF EXISTS "conversations_read" ON conversations;
DROP POLICY IF EXISTS "conversations_update" ON conversations;
CREATE POLICY "conversations_public_insert" ON conversations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "conversations_read_policy" ON conversations
  FOR SELECT USING (true);
CREATE POLICY "conversations_service_update" ON conversations
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Bookings
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
DROP POLICY IF EXISTS "bookings_read" ON bookings;
DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_public_insert" ON bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_read_policy" ON bookings
  FOR SELECT USING (true);
CREATE POLICY "bookings_authenticated_update" ON bookings
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
