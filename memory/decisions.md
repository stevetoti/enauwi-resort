# Decisions — Enauwi Beach Resort

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
