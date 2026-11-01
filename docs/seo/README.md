# E'Nauwi SEO implementation and actual rankings - 2026-11-01

The approved changes are live at https://www.enauwibeachresort.org/. Current report: ../../output/pdf/enauwi-seo-rankings-and-release-2026-11-01.pdf. Original baseline report is retained separately.

- release.json: exact production source/deployment and scope.
- reports/rankings-2026-11-01.md and rankings.csv: 30 Google mobile queries x three countries, with actual positions, ranking URLs, timestamps, returned coverage and failed checks.
- research/measured-2026-11-01/: raw authenticated provider responses and first failed attempts. 85 successful checks, five failed after one retry; total provider-reported cost US$1.2531. No recurring job.
- keywords.json / keyword-demand.md: 126 candidates with available AU/NZ metrics and checked live ranks. Unavailable data stays null; VU Labs is unsupported, VU live SERP is supported.
- keyword-map.md: page owners and measured priorities. No speculative merges/redirects.
- page-copy.json / page-copy.csv: implemented metadata for all 37 existing public URLs. Article headlines/body remain unchanged.
- faq-drafts.json: origin of the approved 16 live Q&As; current runtime copy is in src/data/seo-faqs.json.
- audit/baseline-2026-11-01/ and audit/after-2026-11-01/: before/after crawl evidence and reviewed interpretation.
- verification.md and verification/: production build, no-JavaScript, desktop/mobile, public-file and redirect evidence.
- changes.csv / implementation.md: implementation/release record.
- brand-keyword-pack.md / content-queue.csv: still drafts; no external profile changes or new article publication.

Inventory: 16 room records are not marked available. This pre-existing setting was verified against live/local APIs; Stephen explicitly instructed it remain unchanged. Real empty-state checked; booking modal tested separately using a labelled browser-only fixture, never persisted. No guest transactions submitted.

Handoff branch: codex/enauwi-seo-2026-11-01. Read release.json before future production changes; the production source is on this branch. No source changes were pushed to main as part of the isolated release.
