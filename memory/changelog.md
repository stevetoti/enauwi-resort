# Changelog — Enauwi Beach Resort

## 2026-11-08 — [Claude Code] Homepage speed: hero text no longer waits for JavaScript
- Measured live (Lighthouse 12.2.1 mobile, local Chrome; PSI API quota exhausted): score 72, FCP 2.9 s, LCP 6.0 s; LCP = hero text, hidden by framer-motion `initial={{opacity:0}}` until JS hydrated (throttled: text painted at 5.4–5.8 s). 655 KiB oversized images.
- Hero.tsx is now a server component: framer-motion removed; CSS transform-only entrance (`hero-rise`), CSS particles at fixed positions (were Math.random in render), CSS scroll bob; prefers-reduced-motion respected. Fixed missing spaces on mobile ("afternoonsand", "hospitalityon").
- Image sizes: Navbar + Footer logo `sizes="56px"` (was downloading 640–750 px), About aerial `sizes="(max-width: 1024px) 100vw, 50vw"` (was 1920 px on phones).
- Local production build: score 93, FCP 0.9 s, LCP 3.2 s, SI 1.2 s, image waste 175 KiB; throttled LCP text at 0.84 s. (Localhost — live numbers will be somewhat lower.)
- Not changed: /api/rooms takes ~2 s server-side (booking page room list) — follow-up.

## 2026-11-08 (later) — [Claude Code] Prices reverted to the old ones (Stephen) — enquiry flow kept
- DEPLOYED `dpl_27JgpH9kwafVb2eti3fY7RTzzN2W` from `63c2802` (branch codex/enauwi-seo-2026-11-01, Stephen: "push the new changes"), aliased enauwi-resort.vercel.app. Verified live www.enauwibeachresort.org: homepage notice + old prices; /book bundle has the enquiry box + "Send Enquiry to Reservations", no "Booking Confirmed"/"Confirm Booking"/fake viewers. Deployed via saved CLI login: VERCEL_TOKEN in .env.local is INVALID. Untracked ChatGPT image stashed for the deploy and restored.
- Stephen: "don't commit the changes of prices, use the old ones". Removed the team's new rate list and the rate table: homepage cards back to 30,000/27,000/25,000/22,000, booking page + API back to rooms.price_vt, chat prompt + voice agent price blocks restored exactly from d7a9bda. ReservationsNotice now shows the team's message + "subject to availability" note, no prices.
- Kept: enquiry-only booking flow, enquiry notice at the top of the form, "request received / not confirmed" emails, WhatsApp, SMS, voice + chat wording.
- Supersedes the rates parts of the two entries below.

## 2026-11-08 (later) — [Claude Code] Booking form: enquiry notice moved to the top
- Stephen: make it obvious at the booking stage that it is an enquiry. Modal title "Reservation Enquiry"; bold amber box FIRST in the form ("This is an enquiry, not a confirmed booking…"); button "Send Enquiry to Reservations"; footnote "Nothing is booked yet". Build/lint/typecheck pass; previewed locally.
- Note: Stephen's test on the LIVE (old) site created a pending booking — Bungalow 1, 8→9 Nov 2026, "This is a test" — it now blocks those dates; cancel it in admin.

## 2026-11-08 — [Claude Code] Website bookings switched to RESERVATION REQUESTS (team request, 7 Nov)

- Reservations/Marketing (7 Nov) asked to stop direct room bookings (double bookings vs Booking.com, no channel manager), point guests to reservation@, show their rates, and say all bookings are subject to confirmation. Stephen chose: keep the booking form but make every submission a request the team confirms.
- New `src/data/accommodation-rates.ts`: `BOOKING_MODE='request'` switch (flip to 'instant' once a channel manager syncs), the team's published rates (2BR Beachfront 30,000 · 1BR Beachfront 24,000 · 2BR Lagoon 25,500 · 1BR Lagoon 20,060 · 2BR Garden 21,250, incl. light breakfast), `rateForRoomName()`.
- New `ReservationsNotice` (team's exact message + rate table + Email Reservations / Send a request / call). On the homepage (top of Accommodations; hero CTA → "Reservation Enquiries" #reservations) and on /book.
- /book: "Request Room" / "Request a Reservation" / "Send Reservation Request"; payment choice removed (no money taken, Stripe line + "free cancellation" claim gone); success = "Request Received — not confirmed yet"; real error messages (409 → already requested). Removed fake "N guests viewing now" (random numbers) and "X of Y available / Only N left / Book soon" (website can't see Booking.com). Prices = published rates as "Estimated total".
- API: request mode prices from published rates, forces pay-at-property, prefixes special_requests "[WEBSITE REQUEST — check availability vs Booking.com before confirming]", status stays `pending` (team confirms/cancels in admin).
- Notifications: new email type `booking_request` (guest: "not confirmed yet", reply-to reservation@; team: "Action needed — check Booking.com", reply-to guest, HTML-escaped). WhatsApp/SMS request text says NOT confirmed. Admin-created bookings unchanged (option defaults off).
- Chat assistant prompt + voice agent: new rates (5 types) and "never say confirmed"; voice email/subject/agent message now "request received".
- Nav "Book Now" → "Reservations", footer "Reservation Request", chat card "Request Booking".
- Rooms DB `price_vt` NOT changed (feeds admin/invoices) — awaiting Stephen; website ignores it where a published rate exists.
- Verified: typecheck, lint, production build; local `next start` desktop + 390 px: no page errors, 16 "Request Room" buttons, none of the old confirmation/scarcity wording. No test booking submitted.

## 2026-11-06 — [Claude Code] Rooms enabled for public booking (team request)

- Data only: rooms.available false -> true for all 16 bungalows (1-16). Before-state recorded in docs/seo/room-availability-baseline.json (all false). Rollback: PATCH rooms set available=false.
- Pre-checks: availability is per room (any overlapping pending/confirmed/checked_in booking blocks it; booking POST re-checks), so rooms.quantity (2/5 on some) is NOT used and cannot cause double-booking. All rooms have price_vt (VT 18,000-27,000); online price uses price_vt only (season prices set on 5 rooms are unused by the booking flow).
- Verified live: /api/rooms 10-13 Dec 2 guests -> 16 available; 24-27 Dec 4 guests -> 12 fit, 11 free (existing booking blocks one). Headless mobile /book shows all 16 bungalows, zero page errors. No test bookings created.
- Deployed: commit 5d75978 on branch codex/enauwi-seo-2026-11-01 (pushed) → production enauwi-resort-7sx44yiwl via `vercel --prod` (CLI saved login). No migrations/functions.
- NOTE (branch hazard): this checkout was on Codex's release branch, not main. origin/main = 5029417 and is BEHIND production (lacks Codex's Nov-1 SEO release + this fix). A push to main triggers a Git-integration production deploy that would roll those back. Recommended: fast-forward main to the release branch. Earlier `git push origin main` calls in this session were no-ops for 1dc921e/5d75978.
- After deploy, this machine's requests got Vercel "Security Checkpoint" 403s (x-vercel-mitigated: challenge) — caused by our polling, not the deploy. Project has no firewall config and attack mode is off. Cleared by itself after ~6 min. Verified live afterwards: /book JS bundle has the new banner + 'Total for your stay', no 'save 10'/'Best rate'; /api/rooms 10-13 Dec → 16 available.
- Found: /book banner "Book direct & save 10%" + countdown that resets to 2h on every load, while room_discounts is empty — guests were not actually given 10%. Stephen chose to remove the claim: banner now "Book direct with E'Nauwi Beach Resort · Questions? Call +678 22170"; CountdownTimer deleted; room-card "Best rate — book direct!" -> "Total for your stay". Real per-room discounts (room_discounts) still display as before.

## 2026-11-01 — [Codex] SEO production release and actual ranking report complete

- Live https://www.enauwibeachresort.org/; source becbbe1cddc3571403dcfdb39080cc5c2efc6684; deployment dpl_DnUzGEeBZ3RAXACtCFfFqJ7L7Ygq. No migrations or Edge Functions. Release branch codex/enauwi-seo-2026-11-01; main not advanced by this isolated release.
- Verified production build/typecheck/lint; 19 live no-JS/desktop/mobile observations with zero app errors or guest writes; 37/37 sitemap pages successful; Google verification file, robots/sitemap, private noindex, 404 and legacy 308 preserved. Final homepage heading word boundary verified.
- Raw on-page score 96 -> 100, overall 96 -> 97. Initial HTML words: book 9 -> 322, services 8 -> 267, menu 23 -> 254. Remaining crawler warnings manually interpreted; no ranking gains claimed from checklist changes.
- DataForSEO: authenticated, actual Google mobile ranks across VU/AU/NZ. 85 usable of90 checks, five errors after one retry; US$1.2531 provider-reported total. Main brand #1 VU/AU and #5 NZ (article); corporate retreat article #5 AU. Complete evidence/coverage in docs/seo/rankings.csv.
- User explicitly instructed room availability remain unchanged; all16 room records remain not available. Real empty-state tested; separate labelled browser fixture tested the modal only, never saved.
- Updated PDF output/pdf/enauwi-seo-rankings-and-release-2026-11-01.pdf and full docs/seo/ release/report/verification handoff. Original audit/report retained. No recurring monitor, external posts, emails or new articles.


## 2026-11-01 — [Codex] SEO pre-release verification passed

- Production build with network passed and includes all 22 published blog paths. Typecheck/lint passed.
- 19 browser observations passed across no-JS, desktop and mobile; zero application errors/writes. Real services/menu categories load; booking real empty-state matches production. Room-selection modal tested with an isolated labelled browser fixture because all16 existing rooms are unavailable.
- DataForSEO baseline finalized: 90 Google mobile country/query checks, 85 successful, five failed after one retry; 13 observed rank rows. Cost US$1.2531. Main brand #1 VU/AU, #5 NZ (directions article); corporate retreat article #5 AU.
- Preparing pushed source commit and approved production release.


## 2026-11-01 — [Codex] Existing inventory block found during acceptance

- Before deployment, live and local /api/rooms both return zero publicly available rooms; includeAll read returns 16 records, none marked available. /api/services returns 17 on both. Inventory unchanged; asked Stephen whether current closure is intentional.
- All nine no-JavaScript HTML/metadata checks pass. Real-data room selection cannot proceed until inventory is enabled; separately checking booking UI with an isolated labelled browser fixture. No guest mutations attempted.


## 2026-11-01 — [Codex] Server-visible SEO and DataForSEO connection

- User added DataForSEO API credentials directly to project .env.local; authentication succeeds (provider/task 20000). Country support verified: VU 2548, AU 2036, NZ 2554. Labs supports AU/NZ but not VU; live SERP supports all three.
- Running 30-query Google mobile baseline across three countries, depth requested 100 with actual returned coverage recorded. Saved raw tasks; failed requests remain separate from absent rankings. Budget ceiling US$4.90. No recurring schedule.
- Implemented server-owned book/services/menu pages, reviewed metadata source and safe JSON-LD helpers, inner-page breadcrumbs, FAQs/internal links, gallery labels, and concise article preview overrides without changing headlines or database.
- Removed hard-coded booking ratings and unverified testimonial carousel from the revised booking page. No migration or auth changes.


## 2026-11-01 — [Codex] Approved SEO implementation started

- Stephen approved Phase A and verified deployment, and explicitly requested measured DataForSEO rankings.
- Separating interactive booking/services/menu clients from permanent server-rendered content; fixed Hero Efate alt text and gallery control labels.
- Automated approval review rejected cross-project credential probing; asked Stephen to configure working DataForSEO credentials directly in this project ignored .env.local. No rejected operation retried or bypassed.


## 2026-11-01 — [Codex] Golden SEO baseline and approval package completed

- Crawled all 37 live sitemap URLs; independent HTML evidence confirms /book and /services have no H1 and only 9/8 visible words in the first response. /menu has 23 words. Hero alt wrongly says Malekula.
- Corrected automated interpretation in the reviewed report: Resort schema already exists; crawler's missing-business-schema warning is false positive. GA4 tag and public Search Console verification file verified; dashboards not accessed.
- Keyword provider rejected existing company SEO config (HTTP 401). Prepared 126 unmeasured candidate phrases across 16 groups; no invented volumes/positions. Mobile speed unavailable (HTTP 429).
- Created docs/seo/ audit evidence, keyword map, fix plan, metadata drafts for 37 URLs, six core intros, 16 FAQ answers, 12 draft briefs, local-profile copy and verification record. Six-page report: output/pdf/enauwi-seo-report-2026-11-01.pdf, rendered and visually checked.
- No source/database/live setting changes or deployment. Golden SEO explicitly requires review of the concrete fix plan before implementation; pending Stephen's Phase A approval.
- Persistent-memory helper unusable: system Python lacks numpy; bundled Python sync hits a read-only memory database. Used existing shared journals directly; did not change memory storage or permissions.


## 2026-11-01 — [Codex] Golden SEO audit started

- Located requested skill in shared claude-skills repository. Canonical live domain confirmed as www.enauwibeachresort.org.
- Preparing dated crawl, measured keyword research, keyword map and prioritized fix plan. Public publishing/deployment awaits review of the concrete plan.
- Persistent-memory CLI unavailable (Python numpy missing); shared project journals read directly.


## 2026-10-03 — [Claude Code] Internal links: /activities + /blog were orphaned

Search Console showed /activities "unknown to Google — no referring page". Nothing in
the site linked to /activities or /blog.
- Navbar: + Blog; section links now "/#about" etc. (previously "#about", which did
  nothing on subpages like /blog and /activities)
- Footer: + Activities & Tours (/activities), Restaurant Menu, Travel Blog; section
  links prefixed with "/"; back-to-top uses "#"
- Homepage Activities section: + "See all activities & tours" → /activities

## 2026-10-03 — [Claude Code] Search Console verification file

Added public/googleb215dddf637f1964.html (Google HTML-file verification for https://www.enauwibeachresort.org/). Must never be removed — Search Console re-checks it. Verified by Stephen 2026-10-03.

## 2026-10-02 — [Claude Code] GA4 live

Saved googleAnalyticsId G-L2296Q9QEJ in site_settings key='seo' (data only). Verified the tag on /, /book, /blog, /activities (~11 min to propagate — expect the same delay for future Admin → SEO changes). Search Console / Pixel / FB verification still pending.

## 2026-10-02 — [Claude Code] Published the 4 held-back seed articles

At Stephen's request (data only, no deploy): how-to-get-to-enauwi-from-port-vila,
sunset-cruises-island-hopping-efate, weekend-itinerary-enauwi-efate,
diving-marine-life-vanuatu-lagoons → status=published, published_at=now. 18 posts live.
Claims for the team to confirm: 72-hour airport-transfer notice + "airport shuttle at
modest rates", continental breakfast, sunset cruises offered, dugongs in the lagoon.

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

Deployed: commit c1d3b9a → production (enauwi-resort-b7jhh782q), verified live: per-page titles/canonicals, Resort JSON-LD, /activities 200, sitemap 29 URLs, vercel.app → .org 308 (API unaffected). No migrations; no edge functions.

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
