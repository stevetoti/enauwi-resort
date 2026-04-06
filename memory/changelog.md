# Changelog — Enauwi Beach Resort

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
