# Changelog — Enauwi Beach Resort

## 2026-06-05 — [Claude Code] Change room type when editing a booking + auto revised guest message

Team request (GM/ops): allow changing room type during booking edit, and auto-send a revised message to the guest when changes are made.

### Booking edit — room type selector
- `BookingEditModal` (`src/app/admin/bookings/page.tsx`) now has a **Room Type dropdown** (loads all rooms), a **Total Price** field, and a live **nights** count
- Changing room or dates auto-suggests a new total (rate × nights); staff can override
- Info banner notes the guest will be emailed/SMSed a revised confirmation

### Auto revised-confirmation notification
- New `sendBookingUpdateNotifications()` in `src/lib/notifications.ts` (email + WhatsApp + SMS), with `buildUpdateSMSMessage()`
- New `booking_updated` email template + case in `src/app/api/email/send/route.ts` ("Booking Updated", revised details, "what changed" line)
- `PATCH /api/bookings/[id]` now detects guest-facing changes (room, check-in, check-out, guests, total) and fires the revised notification (fire-and-forget; never blocks the save)
- Sends only when something guest-facing actually changed and the booking isn't cancelled

### Bug fix
- Availability/conflict check on booking edit now also runs when **room changes** (previously only on date change), preventing edits into an already-booked room

Verified: `tsc --noEmit` clean, `npm run build` compiles successfully. Live domain confirmed = https://www.enauwibeachresort.org.

## 2026-04-11 — Group Bookings, Calendar Click-to-Book, Event Recurring & Per-Person Pricing

### Group Bookings (multi-room reservations)
- New `POST /api/bookings/group` creates linked bookings sharing a `group_id`
- Admin "+ New Group Booking" button on `/admin/bookings`
- Multi-room checkbox picker with live total calculation
- Bookings table shows "Group" badge for grouped reservations
- One contact, multiple rooms, all booked atomically with conflict checking

### Reservation Board: Click-to-Book
- Empty cells on `/admin/reservation-board` are now clickable
- Click opens Quick Book modal pre-filled with room and date
- Drag across cells to select date range (multi-day bookings)
- Hover shows + icon on empty cells
- Existing booking bars still show detail popovers (no regression)

### Events Page Updates
- **Date range:** Replaced single Date with Start Date + End Date fields
- **Recurring events:** Dropdown for None/Daily/Weekly/Monthly with end date
- **Per-person pricing:** Toggle between Flat Rate and Per Person
  - Per Person mode: package name (e.g. "Bronze Birthday Package") + price per person
  - Total auto-calculated from attendees × price_per_person
- Display: date ranges shown as "Apr 12 - Apr 14", "Repeats Weekly" badges, per-person breakdown

### Database (migration 20260411_group_bookings_event_recurring.sql)
- bookings: added group_id, group_name, is_group_lead
- events: added event_end_date, recurring_type, recurring_end_date, recurring_occurrences, recurring_parent_id, pricing_type, price_per_person, package_name

---

## 2026-04-11 — Booking Edit + Email & Booking Reliability Fixes

### Booking Edit
- New "+ Edit" button (pencil icon) on every booking row
- Edit modal: change guest name, email, phone, dates, guests, notes
- Date changes validated for room conflicts before saving
- `PATCH /api/bookings/[id]` now supports all field updates (was status-only)
- New `GET /api/bookings/[id]` for fetching single booking

### Critical Reliability Fixes
- **Booking failures (intermittent):** Removed CSRF requirement from public POST endpoints (bookings, contact)
  - Root cause: CSRF tokens have 4-hour TTL; expired tokens caused silent 403 errors
  - Public guest forms don't need CSRF (SameSite:lax cookies already prevent cross-origin POSTs)
- **Email notifications not sending:** Same root cause — bookings were failing before notifications could fire
- **Room availability overlap bug:** Date overlap query used `.or()` (matched almost every booking)
  - Fixed: changed to `.lt()` + `.gt()` for proper AND-based date range overlap
  - Added `pending` to conflict status checks to prevent double-booking during processing

---

## 2026-04-08 — Room Creation & Booking Deletion Fixes

### Room Creation Fix
- Bug: Insert silently failed because `bed_config`/`tagline` columns don't exist in production
- Fix: API now skips optional columns and auto-retries without them on column-missing errors
- Add Room modal got full feature parity with Edit modal (image upload, tagline, bed config)

### Booking Deletion Fix
- Bug: Deletion appeared to succeed but row remained
- Root cause: Used client-side Supabase (anon key) which is blocked by RLS
- Fix: Routed through `DELETE /api/bookings?id=xxx` (service role)
- Also deletes linked invoices first to prevent FK errors
- Removes from UI immediately on success

### Booking Page UX
- Booked rooms now shown greyed out with red "BOOKED" badge instead of being hidden
- "Sold Out" disabled button on booked rooms
- Available rooms sort to top, booked to bottom
- Same room can now be booked for non-overlapping dates

---

## 2026-04-07 — Restaurant POS Rewrite: Guest Tab System

### POS Tab System
- Complete rewrite of `/admin/pos/page.tsx` with 3-column layout (Open Tabs | Menu | Cart)
- **Open Tabs panel** (left): list of active tabs, create new tab with name/table/booking link, today's sales summary
- **Menu panel** (center): category filtering, search bar, item grid (preserved from original)
- **Cart panel** (right): shows active tab's existing items (read-only) + new items being staged, per-item notes
- **Tab workflow**: Open tab -> browse menu -> add items over time -> close & pay when done
- **Quick Sale mode**: no tab needed, add items and pay in one step
- **Payment modal**: Cash/Card/Room Charge with booking lookup (preserved from original)
- **Receipt modal**: preserved from original with tab name/guest info additions
- **Menu Management**: preserved existing add/edit/delete/toggle availability panel
- All tab operations via API routes: `GET/POST /api/pos/tabs`, `PATCH/DELETE /api/pos/tabs/[id]`
- Responsive: tabs panel collapses to horizontal scrollable row on mobile
- Uses teal (#0F766E) primary with amber accents, formatVatu for price formatting

## 2026-04-06 — New Features: Discounts, Reservation Board, Invoices

### Room Availability Display
- Booking page now shows "X of Y rooms available" summary
- Per-room type badges: "Only 2 left!" (orange) or "3 of 5 available" (green)
- Availability data returned from updated `/api/rooms` endpoint

### Discount System
- New `room_discounts` table: name, percentage, date range, per-room or resort-wide, min nights
- Admin `/admin/rates` page: create, edit, toggle, delete discounts with room rate overview
- Discounts auto-applied on booking page: shows original price crossed out with discount badge
- Booking API calculates and stores discount info (base_price, discount_percent, discount_amount, discount_name)

### Reservation Board
- New `/admin/reservation-board` page replacing physical whiteboard
- Monthly calendar grid: rooms as rows, dates as columns
- Colour-coded booking bars (pending=yellow, confirmed=teal, checked_in=green, etc.)
- Click bookings for detail popover, today highlighted, month navigation
- New `/api/bookings/calendar` endpoint for date-range booking queries

### Invoice & Receipt System
- New `invoices` table with sequential numbering (ENW-00001, ENW-00002...)
- New `invoice_items` table for line items
- Admin `/admin/invoices` page: generate from booking, search, view, print
- Professional printable invoice layout with resort branding
- Payment status tracking (unpaid/paid) with "Mark as Paid" action
- Receipt mode toggle for paid invoices

### Database Migration
- `20260406_discounts_rates_invoices.sql`: room_discounts, rate_seasons, invoices, invoice_items, invoice_counter tables
- Added discount/payment fields to bookings table

### Admin Sidebar
- Added: Reservation Board, Rates & Discounts, Invoices links

---

## 2026-04-06 — Security Hardening & Production Fixes

### CRITICAL Security Fixes
- **Password hashing:** All password reset endpoints now use bcrypt (`auth/reset-password`, `admin/reset-staff-password`, `auth/set-password`)
- **Reset token hashing:** Forgot-password stores SHA-256 hash of token in DB, raw token sent in email. Validate and reset endpoints compare hashes.
- **API authentication:** Added `requireAuth()` JWT check to all admin API routes (`admin/*`, `staff/*`, `attendance`, `roles`, `announcements`)
- **Session management:** Replaced localStorage with httpOnly JWT cookies
  - Created `src/lib/auth.ts` — JWT sign/verify with `jose` library
  - Created `src/middleware.ts` — protects `/admin/*` and `/staff/*` routes at edge
  - Created `/api/auth/me` — returns current user from JWT cookie
  - Created `/api/auth/logout` — clears session cookie
  - Updated login to set httpOnly cookie instead of returning data for localStorage
  - Updated admin layout, staff portal, staff chat, admin dashboard, announcements to use `/api/auth/me`
- **RLS policies:** Created migration `20260406_fix_rls_policies.sql` replacing all `USING (true)` with proper role-based policies

### HIGH Priority Fixes
- **Pagination:** Staff and attendance API routes now support `page` and `limit` params, return `{ data, total, page, limit }`
- **Input validation:** Added email format, date format, length, and logical checks to bookings and contact API routes

### MEDIUM Priority Fixes
- **Playwright:** Moved from dependencies to devDependencies
- **metadataBase:** Added to root layout for proper social sharing image resolution
- **`<img>` → `<Image>`:** Replaced raw `<img>` tags with `next/image` in admin rooms, staff, branding, my-bookings, staff portal, onboard, ChatWidget, Hero
- **Console cleanup:** Removed all `console.error`/`console.log` from API routes
- **Module-scope clients:** Fixed Supabase/OpenAI/Resend clients that were initialized at module scope (crashed builds without env vars)

### Build Fixes
- Fixed unused `adminEmail` variable in `auth/set-password`
- Migrated 8 social API routes to shared `@/lib/supabase` imports
- Lazy-initialized OpenAI and Resend clients
- Migrated `/kitchen` and `/menu` pages to shared Supabase import

### New Files Created
- `src/lib/auth.ts` — JWT session utilities
- `src/middleware.ts` — Next.js edge middleware for route protection
- `src/app/api/auth/me/route.ts` — Get current session
- `src/app/api/auth/logout/route.ts` — Clear session
- `supabase/migrations/20260406_fix_rls_policies.sql` — Proper RLS policies
- `CLAUDE.md` — Project instructions
- `AGENTS.md` — Agent guidelines
- `.env.example` — Environment variable documentation
- `memory/` — Changelog, decisions, todo
