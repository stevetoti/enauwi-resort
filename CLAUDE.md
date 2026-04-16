# Enauwi Beach Resort — Project Instructions

## Overview

Full-stack hospitality management platform for **E'Nauwi Beach Resort**, a family-friendly island resort on Efate, Vanuatu. Combines guest-facing booking/experiences with comprehensive backend operations (staff, finance, inventory, communications, analytics).

**Live URL:** https://enauwi-resort.vercel.app
**Client:** Enauwi Beach Resort
**Supabase Project:** jfiqbifwueoyqtajbhed

## Tech Stack

- **Framework:** Next.js 14.2.35 (App Router), React 18, TypeScript 5 (strict)
- **Styling:** Tailwind CSS 3.4.1 with custom resort theme (ocean/gold/cyan palette)
- **Database:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Auth + custom RBAC (staff/manager/super_admin tiers)
- **AI:** OpenAI (multilingual chat widget), ElevenLabs (voice booking agent)
- **Email:** Resend
- **SMS:** Vanuconnect API
- **WhatsApp:** WhatsApp Business API
- **Hosting:** Vercel
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Data Fetching:** SWR
- **PDF:** pdfkit

## Deployment

```bash
git config user.email "totinarh24@gmail.com"
npx vercel --prod --yes --token "$VERCEL_TOKEN"
```

## Project Structure

```
src/
  app/                  # Next.js App Router
    (public pages)      # /, /activities, /book, /menu, /order, /services, /my-bookings
    admin/              # Admin portal (dashboard, bookings, rooms, guests, staff, etc.)
    staff/              # Staff portal (dashboard, chat, onboarding)
    kitchen/            # Kitchen display system
    api/                # 68 REST API routes
  components/           # React components (Navbar, Hero, ChatWidget, etc.)
  data/                 # Static data (activities, etc.)
  lib/                  # Utilities (supabase clients, permissions, helpers)
  types/                # TypeScript interfaces
supabase/
  migrations/           # 9 migration files (~1,400 lines SQL, 40+ tables)
  functions/            # Edge functions
public/                 # Static assets, robots.txt, sitemap.xml
memory/                 # Changelog, decisions, todo
```

## Key Features

### Guest-Facing
- Homepage with hero, accommodations, activities, gallery, location, contact
- Room booking with availability calendar and dynamic pricing
- Activity booking (snorkeling, island hopping, kayaking, sunset cruises, etc.)
- Restaurant menu and food ordering with order tracking
- AI chat widget (English, Bislama, French, Mandarin)
- Voice call booking agent (ElevenLabs)

### Admin Portal (/admin/*)
- Dashboard, bookings (with edit/delete + group bookings), rooms, guests, staff
- **Reservation Board** — visual calendar, click cells to quick-book
- **Rates & Discounts** — % discounts with date ranges
- **Invoices** — generate, print, mark paid (sequential ENW-XXXXX numbering)
- **Restaurant POS** — guest tabs, send to kitchen, close & pay flow
- **Events** — date ranges, recurring (daily/weekly/monthly), per-person pricing packages
- Department management, roles & permissions (RBAC)
- Housekeeping task assignments
- Financial management
- Inventory tracking
- Internal announcements & communications (SMS, WhatsApp, Email)
- Content management & SEO settings
- Social media management with AI content generation
- Video management, Knowledge base
- Conference bookings, Reports & analytics

### Staff Portal (/staff/*)
- Staff dashboard, internal chat, onboarding flow

## Database Tables (Key)

guests, rooms, bookings, staff, roles, departments, conversations, messages,
menu_categories, menu_items, orders, order_items, conference_bookings,
announcements, staff_attendance, staff_invitations, staff_tasks, staff_shifts,
room_cleaning_status, room_status, finance_transactions, pos_orders,
inventory_items, inventory_logs, housekeeping_tasks, website_content,
seo_settings, message_templates, events, venues, suppliers

## Environment Variables

See `.env.example` for the full list. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY` / `NEXT_PUBLIC_ELEVENLABS_AGENT_ID`
- `RESEND_API_KEY`
- `VANUCONNECT_API_KEY` / `ENAUWI_VANUCONNECT_API_KEY`
- `WHATSAPP_API_TOKEN` / `WHATSAPP_PHONE_ID`

## Known Issues (Production Review — 2026-04-06)

### CRITICAL
1. **Plaintext passwords** in reset endpoints (`auth/reset-password`, `admin/reset-staff-password`) — must hash with bcrypt
2. **No API authentication** on admin endpoints — anyone can call `/api/admin/*`, `/api/staff`, `/api/attendance`
3. **RLS policies all-permissive** — `USING (true)` on staff, attendance, roles, tasks, shifts tables
4. **No middleware.ts** — admin routes not protected at middleware level

### HIGH
5. **localStorage session storage** — vulnerable to XSS, no expiration, no CSRF
6. **No pagination** on staff/attendance list endpoints
7. **Reset tokens stored in plaintext** in database

### MEDIUM
8. **Weak input validation** — no email format, date, or length validation on API routes
9. **Playwright in production deps** — should be devDependencies (~60MB bloat)
10. **Console logging in production** — should use structured logging

## Conventions

- Follow parent `CLAUDE.md` coding conventions (TypeScript strict, Tailwind only, shadcn/ui, mobile-first)
- Standard English (not Australian) for this project
- Custom Tailwind theme: ocean (blues), gold (ambers), cyan, green, sand colours
- Custom fonts: Playfair Display (serif headings), Inter (sans body)
