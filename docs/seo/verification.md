# Verification - 2026-11-01 - Codex

- Complete sitemap crawl: 37 URLs; independent fetches for home, booking, services, menu and three activity pages.
- Public verification file: 200; GA4 ID visible in home HTML; my-bookings/order robots metadata recorded in manual-verification.json.
- Homepage Resort structured data verified; crawler warning explicitly marked false positive in reviewed report.
- 126 unique keyword candidates; all volume/difficulty/CPC values null. No fabricated rank rows.
- 37 distinct metadata titles and paths; all drafted titles <=60 characters and descriptions <=155 characters. This is an editorial check, not a Google rule.
- CSV/JSON parity checked; 16 draft FAQs, 12 draft briefs.
- PDF: 6 A4 pages rendered to PNG with Poppler and visually reviewed together; no clipping, overflow or broken glyphs observed.
- No source, database, tracking settings or external profile changes; no deployment or automation. App build/browser acceptance deferred until approved implementation. Dependencies are not installed in this checkout.
- Mobile speed unavailable (HTTP 429), keyword provider unavailable (HTTP 401), private account conversion/indexing/profile state unverified.
- No measured before/after improvement or country-specific search position claimed.


## Approved implementation acceptance - Codex, 2026-11-01

- Final production build passed with network access; all 22 published blog paths included (145 total static-generation targets including application/API routes).
- Final build includes type validation and lint. Standalone lint and TypeScript checks also passed.
- Browser checks passed: nine JavaScript-disabled public/query-string pages have the reviewed titles, canonical URLs, exactly one H1 and parseable structured data. Core FAQs and intros remain present without JavaScript.
- Desktop/mobile real APIs: room response is 200 with zero public rooms; services response is 200 with 17 records; restaurant categories load. Forms/gallery interactions and one-H1 checks pass without submitting bookings, orders or enquiries. No browser runtime errors or guest writes were recorded.
- Inventory limitation: pre-release live and local sites both have 16 room records and none marked available. Actual room-selection behavior is therefore checked separately with a clearly labelled browser-only fixture, not with fabricated real availability. No fixture persisted. Asked Stephen for an inventory decision.
- Screenshots visually reviewed for booking/menu desktop and mobile; no content overlap or layout overflow observed in the reviewed views. Local evidence: verification/local-browser.json; screenshots retained in /private/tmp/enauwi-seo-browser-local/.
- Credential scan passed: generated evidence/scripts/SEO data contain neither the project DataForSEO password nor Supabase service-role key. .env.local is ignored by git.
- Measured baseline: 90 Google mobile/country checks, 85 successful, five search-engine errors after one retry. 13 country/query rows contain observed domain positions. Provider-reported research cost US$1.2531. Not-found and failed checks remain distinct; actual returned coverage is exported.
- Public post-deployment verification remains pending.

## Initial public release verification - Codex, 2026-11-01

- Production deployment dpl_SJYNrudiKsKqqvZFgX9LUujrR7QE (source c5db05547d83cac583b169f532de1ea638899bd9) is READY and assigned to all expected custom domains.
- All 37 sitemap pages passed the public crawl. Raw on-page score 96 -> 100, overall 96 -> 97; scores are diagnostic, not Google scores. Server-visible words: /book 9 -> 322, /services 8 -> 267, /menu 23 -> 254. Reviewed caveats are in audit/after-2026-11-01/reviewed-findings.md.
- Live browser acceptance: 19 observations passed, zero app errors and writes. Gallery test was adjusted to wait for hydration and state updates; no site-code/gallery defect found.
- Public Search Console file, sitemap (37 URLs), robots, my-bookings/order noindex and genuine 404 verified. Legacy host returns correct 308 Location; Python 3.9 does not automatically follow it, so header was checked directly.
- Runtime log scan returned no error/fatal groups for this deployment. This does not assert complete monitoring or analytics event delivery.
- Stephen explicitly requested inventory stay unchanged.
- Final small follow-up: add an explicit space between the homepage brand and location spans so extracted heading text preserves word boundaries. Build in progress before release.
