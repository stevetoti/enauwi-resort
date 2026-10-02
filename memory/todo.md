# Todo — Enauwi Beach Resort

## Pending Migrations to Apply in Production
Run these in Supabase SQL editor in order:

0. **Quotations module (2026-06-08)** — REQUIRED before the Quotes tab can create/list quotes.
   Run `supabase/migrations/20260608_quotations.sql`. Invoices, branding, combined-invoice
   and menu categories all work WITHOUT this — only the Quotes feature needs it.

1. **Group Bookings + Event Recurring/Pricing** (most recent):
   ```sql
   ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_id UUID;
   ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_name TEXT;
   ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_group_lead BOOLEAN DEFAULT false;
   CREATE INDEX IF NOT EXISTS idx_bookings_group_id ON bookings(group_id) WHERE group_id IS NOT NULL;

   ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_date DATE;
   ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_type TEXT DEFAULT 'none';
   ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_end_date DATE;
   ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_occurrences INTEGER;
   ALTER TABLE events ADD COLUMN IF NOT EXISTS recurring_parent_id UUID REFERENCES events(id) ON DELETE CASCADE;
   ALTER TABLE events ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'flat';
   ALTER TABLE events ADD COLUMN IF NOT EXISTS price_per_person DECIMAL(10,2);
   ALTER TABLE events ADD COLUMN IF NOT EXISTS package_name TEXT;
   ```

2. Optional: Add bed_config and tagline columns to rooms (already gracefully handled by API):
   ```sql
   ALTER TABLE rooms ADD COLUMN IF NOT EXISTS bed_config TEXT;
   ALTER TABLE rooms ADD COLUMN IF NOT EXISTS tagline TEXT;
   ```

## SEO Gaps (audit 2026-09-30 — [Claude Code])
- [x] **site_settings key='seo' holds junk from another project** ("Scale Rankings Pro") — clear it; GA4 / Pixel / Google + FB verification IDs never entered, so none are live
- [ ] Stephen (GA4 live 2026-10-02): paste Pixel / Google + FB verification IDs into Admin → SEO (junk cleared 2026-09-30)
- [ ] Search Console: verify property + submit sitemap — [Claude Code] 2026-10-03: property https://www.enauwibeachresort.org/ VERIFIED (HTML file); sitemap submit pending
- [ ] Google Business Profile for the resort (biggest local-ranking lever; add exact map pin, then add geo to src/lib/site.ts)
- [x] /activities is in sitemap but 404s — add an index page or remove from sitemap; add the 10 /activities/[slug] pages to sitemap
- [x] No Hotel/LocalBusiness JSON-LD on homepage (address, geo, phone, priceRange, rating)
- [x] /book, /menu, /services, /terms (client components) all share the homepage title/description — add per-route layout.tsx metadata
- [x] No canonical on homepage/core pages; enauwi-resort.vercel.app serves 200 (duplicate) — add canonicals and/or redirect vercel.app → www.enauwibeachresort.org
- [x] Blog AI generator is producing near-duplicate topics (snorkelling x2, when-to-visit x2, family x2, honeymoon/romantic) — dedupe against existing titles
- [x] 4 seed articles still in draft — [Claude Code] 2026-10-02: published at Stephen's request
- [ ] Team to confirm claims in those articles (72h transfer notice, airport shuttle, continental breakfast, sunset cruises)

## Recently Completed
- Group bookings (multi-room reservations with shared group_id)
- Calendar click-to-book on reservation board (single click + drag-range)
- Event date range, recurring (daily/weekly/monthly), per-person pricing
- Booking edit (change dates, names, all fields)
- POS tab system (running bills, send to kitchen, close & pay)
- Discount management, invoice generation, reservation board
- Security hardening (JWT cookies, RLS, password hashing, rate limiting)

## Future Enhancements
- [ ] Generate child event records for recurring events (currently pattern-only)
- [ ] Recurring booking patterns (weekly housekeeping, scheduled maintenance)
- [ ] Group booking checkout flow on the public guest site
- [ ] Bulk operations on bookings (mass cancel, mass status change)
- [ ] Inventory integration for menu items (auto-deduct stock)
- [ ] Multi-currency support
- [ ] Mobile-optimised admin layouts (some pages still desktop-first)
- [ ] Stripe/payment processor integration for online card payments
