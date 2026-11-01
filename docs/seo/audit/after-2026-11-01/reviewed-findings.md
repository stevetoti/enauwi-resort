# Manual interpretation of post-release crawl - Codex, 2026-11-01

- 37/37 public sitemap URLs return successfully, with reviewed titles, descriptions and canonical destinations. All are indexable in the crawl. No missing/duplicate H1 or over-length title/description warnings remain.
- Booking initial HTML increased from 9 words to 322 words. Services: 8 to 267. Menu: 23 to 254. Server-owned headings and useful planning copy are available without JavaScript.
- The crawler still marks services/menu as below its arbitrary 300-word threshold. The new material answers real planning questions; additional facility/menu detail depends on confirmed facts and data. Do not pad functional pages or invent claims merely to satisfy a word-count score.
- The homepage business-schema warning remains a false positive: the existing Resort type is a valid business/lodging subtype and is present in the graph.
- Activity thumbnails deliberately use empty image alt because the enclosing gallery controls now have meaningful accessible names and pressed state. The image-only detector does not assess those names.
- /terms still has no page-specific structured data. Legal-page schema was explicitly low priority; useful schema now exists on all main commercial and activity pages.
- GA4 tag detected, not account-side event delivery. Mobile speed still unmeasured. The unchanged inventory setting leaves 16 rooms not marked available; no real booking was submitted.
- Raw scores are diagnostic and were not adjusted to erase false positives. They are not Google rankings or proof of bookings/conversions.
