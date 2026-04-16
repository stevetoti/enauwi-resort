# Decisions — Enauwi Beach Resort

## 2026-04-11 — Group Bookings via group_id (no junction table)
- **Context:** Team needed multi-room reservations (group/family bookings)
- **Decision:** Store one booking row per room, link with shared `group_id` UUID + `group_name`. Mark first as `is_group_lead`.
- **Reason:** Avoids a junction table or schema overhaul. Each booking still has its own status/dates/room — preserves all existing booking logic (availability checks, edits, deletions, status transitions). Group simply means "these were booked together by the same contact."

## 2026-04-11 — Recurring Events: Pattern-Only (no expansion)
- **Context:** Events needed to support recurring (weekly birthdays, daily tours, etc.)
- **Decision:** Store recurring pattern fields (`recurring_type`, `recurring_end_date`) on parent event. Don't auto-generate child event rows.
- **Reason:** Simpler — calendar UI can interpret the pattern when displaying. Avoids cascade complications when a recurring event is edited or cancelled. Future enhancement: add child event generation if needed for individual instance overrides.

## 2026-04-11 — Removed CSRF from Public Forms
- **Context:** CSRF tokens have 4-hour TTL; intermittent booking failures occurred when guests had pages open longer
- **Decision:** Removed `requireCsrf()` from public POST endpoints (bookings, contact). Kept on authenticated forms (login, forgot-password).
- **Reason:** CSRF protects against attacks on authenticated sessions. Public guest forms don't have authenticated sessions to protect. SameSite:lax cookies already prevent cross-origin POSTs from succeeding without explicit user navigation.

## 2026-04-11 — Date Overlap Query: AND not OR
- **Context:** Room availability checks were marking nearly every room as booked
- **Decision:** Replaced `.or('check_in.lte.${checkOut},check_out.gte.${checkIn}')` with chained `.lt('check_in', checkOut).gt('check_out', checkIn)`
- **Reason:** Date overlap detection requires both conditions true (AND), not either (OR). The OR version matched any booking that started before OR ended after — almost everything. Chained Supabase filters create AND.

## 2026-04-08 — Resilient Inserts for Optional Columns
- **Context:** Production schema lacked some optional columns (`bed_config`, `tagline`) that newer code referenced
- **Decision:** API inserts skip optional columns by default; auto-retry without them on column-missing errors
- **Reason:** Avoids forcing migrations to deploy code changes. New optional fields gracefully degrade in environments where the column doesn't exist yet.

## 2026-04-07 — POS Tabs: Reuse pos_orders Table
- **Context:** Team needed running tabs (open bills that stay open until guest pays)
- **Decision:** Added `tab_status` ('open'/'closed') and related fields to existing `pos_orders` table instead of new `pos_tabs` table
- **Reason:** Tabs ARE pos_orders — just orders that haven't been paid yet. JSONB items column already supports multi-item orders. Avoids duplicate code paths for tab vs. immediate-sale flows.

## 2026-04-06 — JWT Session with jose Library
- **Context:** App used localStorage for staff sessions (XSS-vulnerable, no server validation, no expiry)
- **Decision:** Implemented JWT tokens stored in httpOnly cookies using the `jose` library
- **Reason:** `jose` is edge-compatible (works in Next.js middleware), lightweight, and doesn't require Node.js crypto. httpOnly cookies can't be read by JavaScript, preventing XSS session theft. JWT carries permissions so API routes can validate auth without DB calls.

## 2026-04-06 — Reset Token Hashing with SHA-256
- **Context:** Password reset tokens were stored as plaintext in the database
- **Decision:** Hash tokens with SHA-256 before storing. Send raw token in email URL, compare hashes on validation.
- **Reason:** If database is compromised, attacker cannot use stored hashes to reset passwords. SHA-256 is sufficient here (tokens are random 32-byte hex, not passwords).

## 2026-04-06 — RLS Policy Strategy
- **Context:** All RLS policies used `USING (true)`, making database accessible to anyone with the anon key
- **Decision:** Restrict most tables to `authenticated` or `service_role` access. Keep public insert on bookings/conversations (guests need these). API routes use service role key which bypasses RLS.
- **Reason:** Defense in depth — even if API auth is bypassed, RLS provides a second layer of protection at the database level.

## 2026-04-06 — Paginated API Responses
- **Context:** Staff and attendance endpoints returned full result sets with no limits
- **Decision:** Changed to `{ data, total, page, limit }` response format with default limit of 50, max 200. Added `|| response` fallback in consumers for backward compat.
- **Reason:** Prevents memory issues with growing datasets. The fallback `const data = json.data || json` ensures existing consumers work during transition.

## 2026-04-06 — Supabase Client Initialization Strategy
- **Context:** Multiple files created Supabase clients at module scope with `!` assertions, causing build failures when env vars aren't present
- **Decision:** Migrate all to use shared `@/lib/supabase` exports which use placeholder fallbacks for build safety
- **Reason:** `src/lib/supabase.ts` already has fallback values (`|| 'placeholder-key'`) allowing builds without env vars.

## 2026-04-06 — OpenAI/Resend Lazy Initialization
- **Context:** OpenAI and Resend SDKs throw errors if instantiated without API keys at module scope during build
- **Decision:** Changed to lazy factory functions (`getOpenAI()`, `getResend()`) called inside handlers
- **Reason:** These SDKs don't accept empty/placeholder keys — they validate immediately. Lazy init defers validation to runtime.
