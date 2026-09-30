# Changelog — Enauwi Beach Resort

## 2026-09-30 — [Claude Code] SEO completion pass

Audit found tracking never switched on and several core-page gaps. Fixed:

- Homepage: Resort + WebSite JSON-LD (src/lib/site.ts — shared site facts), canonical; H1 space ("E'Nauwi Beach Resort")
- Per-route metadata layouts for /book, /menu, /services, /terms (own titles, descriptions, canonicals, OG); /my-bookings + /order noindex
- New /activities index page (was 404 but in sitemap) with ItemList JSON-LD; activity detail pages get canonicals
- Sitemap: + /activities, 8 activity pages, /terms (now 25 URLs)
- Blog: OG/Twitter cover images + Article schema image; /blog OG
- middleware: enauwi-resort.vercel.app page GETs 308 → www.enauwibeachresort.org (API excluded so webhooks/cron unaffected)
- Blog generator: skips backlog topics whose keyword already has an article; when backlog is empty the AI proposes a new non-overlapping topic (old behaviour recycled topics → duplicate articles)
- DB (data only): +20 fresh blog_topics; site_settings key='seo' cleared (held "Scale Rankings Pro" junk from another project)
- Left as-is: 4 seed articles the team unpublished on Sep 4/15

Still needs Stephen: GA4 ID, Meta Pixel ID, Google + Facebook verification codes → Admin → SEO; then Search Console sitemap submit + Google Business Profile.

## 2026-07-03 — [Claude Code] Auto-publishing SEO blog

New blog to grow organic search traffic. Fully automatic per the team.

- DB: blog_posts + blog_topics (migration 20260703_blog.sql — RUN IN SUPABASE)
- Public /blog listing + /blog/[slug] articles: server-rendered, per-article
  meta + OpenGraph + JSON-LD Article schema, markdown via marked, CTA to /book
- Dynamic app/sitemap.ts (replaces stale public/sitemap.xml which had the wrong
  .com domain) incl. all blog posts; robots.txt domain fixed to .org
- Admin → Blog & Articles: list, publish 10 curated starter articles, "Generate
  one now (AI)", unpublish/delete
- Auto-generation: src/lib/blog-generate.ts (OpenAI gpt-4o, grounded in resort
  facts, draws from blog_topics backlog). Vercel cron weekly (Mon 01:00 UTC) ->
  /api/blog/generate, auth via CRON_SECRET (set in Vercel prod)
- 10 curated articles embedded in src/data/blog-seed.ts (from the SEO drafts)

Go-live after deploy: (1) run the migration, (2) Admin → Blog → "Publish 10
starter articles", (3) submit sitemap in Search Console.

## 2026-06-08 — [Claude Code] Fix: login "Invalid or missing CSRF token" (stale-cookie blocker)

Root cause: middleware only issued the `enauwi_csrf` cookie when ABSENT, so a
stale cookie (signed with a rotated key, failing jwtVerify) was never refreshed
and permanently blocked login/mutations.

- Added `isCsrfCookieValid()` in `src/lib/csrf.ts` (verifies the cookie JWT)
- `middleware.ts` now reissues the CSRF cookie when missing OR invalid (via a
  `withFreshCsrf()` helper), so a bad cookie self-heals on the next page load
- Immediate workaround for affected users: incognito / clear site cookies

## 2026-06-08 — [Claude Code] Analytics, Pixel & site verification wiring (admin-managed)

Technical/Meta requests — site side. (Accounts/IDs created by Stephen in Google/Meta.)

- `src/lib/seo-settings.ts` — cached (5-min) server reader of the existing `site_settings` (key='seo'); defensive (read failure never breaks layout)
- `src/components/Analytics.tsx` — injects GA4 (gtag) + Meta Pixel via next/script when IDs are set
- `layout.tsx` — `generateMetadata()` now emits google-site-verification + facebook-domain-verification meta tags from settings; RootLayout renders <Analytics>; metadataBase + OG alt corrected to enauwibeachresort.org/Efate
- Admin → SEO: added "Google Search Console verification" + "Facebook Domain Verification" fields (GA ID + Pixel ID fields already existed — now actually wired live)
- Everything driven from Admin → SEO (what the marketer asked: "paste it in the admin portal"). No deploy needed when IDs change.

Still needs Stephen: create GA4 property, verify in Search Console, verify domain in Meta Business Manager, get Pixel ID — then paste the 4 values in Admin → SEO.

## 2026-06-08 — [Claude Code] Menu categories + Combined Customer Invoice + Quotation module

Remaining back-office requests from the team's original email.

### Menu Categories (POS)
- Expanded POS category taxonomy (no migration): added Lunch Meals, Pikinini Meals, Taste of China, Pizza, Vegetarian Meals; Main Course now has sub-categories (Beef/Steaks/Chicken/Lamb/Pork/Seafood) via an optgroup in the add-item dropdown; the 'Main Course' filter chip also surfaces its sub-categories
- Note: POS uses menu_items.category (string). Public /menu uses a separate menu_categories table — left untouched (pre-existing dual model)

### Combined Customer Invoice
- New `GET /api/invoices/aggregate?name=` gathers a guest's accommodation (bookings) + restaurant (orders) + services (service_orders) into draft line items (defensive per-source try/catch)
- Manual invoice modal has a "Combine a guest's services" control → fetches & appends all their items into one invoice; staff review before creating. No migration.

### Quotation Module (reuses invoices table)
- Migration `20260608_quotations.sql` (RUN IN SUPABASE before quotes work): adds doc_type/valid_until/quote_status/converted_invoice_number to invoices + quote_counter
- Invoices page now has Invoices | Quotations tabs; quotes are created via the same modal (doc_type='quote', QUO-XXXXX numbers), get the same branding/Word export
- Quote detail shows "QUOTATION" + a "Convert to Invoice" action (assigns a fresh ENW number, flips doc_type)
- Defensive: GET filters doc_type in JS and invoice creation never references quote columns, so deploying before the migration causes NO regression (quote creation just errors until migration runs)

Verified: tsc + build clean; runtime screenshots 9–12 (client-reports/screenshots/).

## 2026-06-08 — [Claude Code] Invoice & receipt branding + payment details footer

Team request (back-office email): brand all invoices/receipts and add payment info.

- Invoice & receipt detail (screen + print/PDF) and the Word export now show:
  - E'Nauwi logo top-left, resort name in brand **blue #439de5**, **orange #f19500** accent lines (header + footer), doc-type badge in brand colours
  - **Payment Details** footer: Bank BRED Bank · Account 013134710100015; plus LPO line (Vendor ID ENB002 · Vendor Name E'Nauwi Beach Resort)
  - Footer URL corrected to www.enauwibeachresort.org
- Applies to both booking-based and manual invoices, and Receipt mode
- Verified: tsc + build clean, screenshot client-reports/screenshots/8-branded-invoice.png

Note: Quotation Module (create/track/convert quotes) and Combined Customer Invoice (consolidate accommodation+event+restaurant) from the same email are NOT yet built — pending sequencing. Menu category additions also pending.

## 2026-06-05 — [Claude Code] Manual invoices + Word (.doc) export

Team request: generate invoices manually (without a booking) and download invoices/receipts as Word documents.

### Manual / standalone invoices
- `POST /api/invoices` now accepts a manual payload (`items[]` present, no `booking_id`) → `createManualInvoice()`: guest details + custom line items, auto-numbered (ENW-XXXXX), `booking_id` null, optional discount
- New **"New Manual Invoice"** button + `ManualInvoiceModal` on `/admin/invoices`: bill-to, dynamic line items (description/qty/unit price) with live row + total calc, discount %, payment method/status, notes
- Refactored invoice-number generation into shared `nextInvoiceNumber()`

### Word (.doc) export
- New **"Word"** button in the invoice detail toolbar (alongside Print/PDF) → downloads a Word-openable `.doc` via `buildInvoiceWordHtml()` (respects Receipt mode)
- Works for both booking-based and manual invoices

### Robustness
- Added `safeDate()` guard so manual invoices with no dates render "—" instead of crashing (formatDate throws on null); applied in list + detail views

Verified: `tsc --noEmit` clean, `npm run build` clean, runtime E2E screenshots captured (client-reports/screenshots/ 5–7).

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

Verified: `tsc --noEmit` clean, `npm run build` compiles successfully. E2E screenshots captured (client-reports/screenshots/, gitignored). **Deployed to production 2026-06-05** (dpl_ANadWyNfkcJtMYez8q4EP5jN5Hqv) — live on https://www.enauwibeachresort.org. Live domain confirmed = www.enauwibeachresort.org (linked to Vercel project).

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
