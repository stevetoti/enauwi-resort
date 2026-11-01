# E'Nauwi SEO fix plan - 1 November 2026

Status: Phase A approved by Stephen in chat on 2026-11-01; implemented and verified on production. User also authorized actual DataForSEO rankings and configured project-local API credentials. Original below describes the reviewed scope; progress and evidence are tracked in implementation.md.

## Phase A - recommended implementation scope

1. **Render booking and services content in the first response (highest impact).** /book and /services have no H1 in fetched HTML; only 9 and 8 visible words. Keep the interactive booking form working, but render a server-owned heading, introduction and useful accommodation/service content outside client loading boundaries. /menu needs a useful restaurant introduction while dishes load. Files: src/app/book/page.tsx and layout.tsx; src/app/services/page.tsx and layout.tsx; src/app/menu/page.tsx. Risk: duplicate headings, booking search regression, stale rates. Verify HTML with JavaScript disabled, one H1 per state, and real availability, enquiry and menu flows in a browser without placing an order.
2. **Apply reviewed search titles and descriptions.** Exact drafts for all 37 URLs are in page-copy.json and page-copy.csv. Prioritize home, /book, /services, /menu and /activities. Preserve existing slugs and canonical URLs. Keep article headlines natural; use an optional database SEO-title field if the shorter search title differs. Additive migration only if this field is needed. Risk: title duplication or factual drift. Verify rendered HTML and preview tags, not just source files. Character limits are editorial targets, not Google ranking rules.
3. **Correct geographic signals.** Replace the Hero image's Malekula Island alt text with Efate Island, Vanuatu. Add Eratap to visible location information and business schema only after the owner confirms the precise locality and map pin. Preserve current phone/email pending NAP confirmation. Verify page HTML, schema and visible contact details agree.
4. **Make the keyword clusters visible in helpful content.** Use page-copy.json introductions and faq-drafts.json as drafts. Add descriptive links between accommodation, activities, dining, travel guides, and contact. Four FAQs per proposed money page; only publish reviewed answers. No keyword stuffing, added pages for spelling variants, or invented wildlife/transfer promises.
5. **Add relevant structured data.** Retain existing Resort + WebSite graph. Add BreadcrumbList on relevant inner pages and meaningful WebPage/CollectionPage/Service markup only where supported by visible content. Do not add fake hotel prices, ratings, reviews, availability, coordinates, or FAQ promises. Schema on legal pages is low priority. Validate syntax plus relevant rich-result eligibility; schema presence does not guarantee rich results.
6. **Improve activity thumbnail accessibility.** Gallery buttons currently contain images with empty alt and no explicit accessible name. Add a descriptive button label identifying the activity image/position; keep decorative image alt empty when the button label supplies its purpose. Verify with the accessibility tree and keyboard.

## Phase B - access or facts required

7. Restore the existing keyword service authentication, then measure candidate demand in Australia, New Zealand and Vanuatu, verify supported locations, inspect SERPs and record mobile rank baselines. Current attempts returned HTTP 401; no search volumes, difficulty or exact positions are claimed. Stop and report budget before a run exceeding US$5.
8. Inspect Search Console coverage and performance for the last 90 days. The public verification file works, but account-side indexing and sitemap acceptance were not rechecked. Check all high-value URLs and any excluded pages; retain indexed slugs.
9. Confirm GA4 receives page views and measure completed bookings, submitted enquiries, telephone clicks and WhatsApp clicks. Tag presence is confirmed; leads and revenue are not measured. Do not send guest names, phone numbers or email addresses to analytics. Import into Bing after account access is confirmed.
10. Obtain Business Profile manager access and exact map pin. Confirm name/address/phone, approved public contact, category, booking link, business hours, and genuine photos. No profile absence or verification status is asserted from this audit.
11. Confirm conference opening status/capacity; tour operators and meeting points; whether an Efate volcano-viewpoint excursion is accurate; spa availability; transfer notice/prices; breakfast terms; and wildlife wording. Tourism listing describes conference facilities under construction while the website promotes them. No further promotional claims until confirmed.
12. Obtain a successful mobile speed report and browser check on the main booking path. Current speed endpoint returned HTTP 429. No performance or Core Web Vitals score is available.

## Phase C - growth after the foundation

- Refresh overlapping articles once query evidence identifies which pages should own each intent. Do not delete or redirect on title similarity alone.
- A dedicated weddings page is proposed only after venue capacity, packages and operational facts are approved.
- Use the content queue as draft briefs; reconcile it against the existing blog before generation. Existing weekly auto-publishing behavior was observed in source and left unchanged.
- Start recurring rank checks and monthly reports only when Stephen approves the ongoing schedule and account access is restored. No automation created during this audit.

## Acceptance and release

After approval: implement Phase A; typecheck, lint, production build and browser verification; commit and push; deploy through the project's approved process; repeat the public crawl and check canonical/verification files, booking/menu/enquiry behavior and mobile layouts. Record exact before/after evidence in changes.csv and memory/changelog.md. No claimed improved scores until that re-audit exists.

Approval requested: Phase A (items 1-6), then a verified deployment. Phase B remains access/fact-gated. New weddings pages, article publishing, redirects and recurring jobs are excluded until separately approved.

## Completion - Codex, 2026-11-01

Phase A is live and verified. Exact source commit and deployment are in release.json. DataForSEO authentication and 90 country/query checks completed; five search-engine errors remain explicitly labelled. AU/NZ keyword demand is recorded; VU Labs is unsupported. Stephen explicitly instructed that inventory remain unchanged. Phase B private-account/fact checks, new articles, profile posts and recurring jobs remain outside this completed release.
