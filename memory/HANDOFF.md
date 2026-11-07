# HANDOFF — E'Nauwi Beach Resort (written 2026-11-08 by [Claude Code])

Read this first, then `memory/changelog.md` (newest at top) and `memory/todo.md`.
Live site: https://www.enauwibeachresort.org (Vercel project `enauwi-resort`).

## 1. Where things stand

**Live (deployed and verified 2026-11-08):**
- **Website bookings are ENQUIRIES only.** Guests pick a bungalow and dates and send a
  request; nothing is confirmed online. The guest is told "not confirmed yet" (page,
  email, WhatsApp, SMS). The team gets "📩 Reservation request … check availability"
  (reply-to = guest). The booking is saved as `pending`; the team confirms or cancels it
  in /admin/bookings. Switch: `BOOKING_MODE` in `src/data/accommodation-rates.ts`
  (`'request'` now; `'instant'` only once a channel manager syncs with Booking.com).
- **Prices are the OLD ones (Stephen's decision, 8 Nov).** Booking page/API =
  `rooms.price_vt` (VT 18,000–27,000); homepage cards + chat + voice = their original
  figures. The team's 7 Nov rate list (30,000 / 24,000 / 25,500 / 20,060 / 21,250) is
  deliberately NOT used. Do not change prices without Stephen.
- **Speed:** hero text renders without JavaScript (Lighthouse mobile 72 → 97, LCP
  6.0 s → 2.2 s); `/api/rooms` batched (64 sequential queries → 4 parallel; 15–30 s →
  0.65 s); all functions run in `bom1` (Mumbai) next to the Supabase DB (ap-south-1) via
  `vercel.json` `regions`.

**Also live (8 Nov):** `/api/email/send` accepts internal callers only (header
`x-internal-email-key`, see `src/lib/internal-email.ts`) — verified live: no key → 403.
**Branches:** `main` was fast-forwarded to the release branch and now equals production
(`8929439`). Work on `main` from now on.

**Data cleanup done:** Stephen's test booking ENW4859161IC cancelled (8→9 Nov freed).

## 2. Next steps for the agent (in order)

1. **One end-to-end test enquiry** via /book — tell the resort team first (it emails
   reservation@/gm@/marketing@). Check the guest and team emails arrive, then cancel the
   booking in /admin/bookings.
2. **Re-audit the known critical issues** listed in `CLAUDE.md` ("Known Issues
   2026-04-06": plaintext passwords in reset endpoints, unauthenticated `/api/admin/*`
   and `/api/staff` routes, permissive RLS, localStorage sessions). A `src/middleware.ts`
   now exists but it EXCLUDES `/api/*` — check each API route for `requireAuth`. Report
   what is still open before changing anything; RLS changes go through Supabase migrations.

## 3. Waiting on people (do not guess)

- **Tours not in operation** — GM (Linda, 2 Nov) asked to disable tours that are not
  running; Shaniella (marketing@) was to send the list of real tours. Not received.
  When it arrives: update the activities data + chat prompt (`src/app/api/chat/route.ts`).
- **Vercel token** in this repo's `.env.local` is INVALID. Deploys currently use the
  saved CLI login on Stephen's Mac (`unset VERCEL_TOKEN; npx vercel --prod --yes`).
  Stephen to replace the token. Never pass a token with `--token`.
- Season prices on 5 rooms (unused), article claims (transfer notice, shuttle,
  breakfast), Google Business Profile access, GA/Pixel IDs — see `memory/todo.md`.

## 4. Rules that bit us (keep following them)

- **Deploy only from a clean tree.** An untracked `ChatGPT Image 2 Nov 2026, 19_49_08.jpg`
  belongs to Stephen; it was `git stash push -u`'d for each deploy and restored after.
  Ask Stephen before moving/committing it.
- Polling the live site hard triggers Vercel's "Security Checkpoint" (403) for ~6 min.
- Never make a booking or send email to the resort team as a "test" without telling them.
- Tag journal entries `[Claude Code]` / `[Codex]` with the date.
