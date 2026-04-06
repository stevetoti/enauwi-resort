# Agents — Enauwi Beach Resort

## Project Context

Full-stack Next.js 14 hospitality platform for E'Nauwi Beach Resort (Vanuatu).
Supabase backend, Vercel hosting, OpenAI chat, ElevenLabs voice, Resend email, Vanuconnect SMS, WhatsApp.

## Agent Guidelines

### Before Starting
1. Read `CLAUDE.md` in this directory for project details and known issues
2. Check `memory/todo.md` for pending tasks
3. Check `memory/decisions.md` for architectural context

### Code Standards
- TypeScript strict mode — no `any` types
- Tailwind CSS only — use the custom resort theme (ocean/gold/cyan/sand)
- Server Components by default — only `"use client"` when needed
- Supabase for all backend (no n8n)
- Mobile-first responsive design
- All API routes need proper auth checks (see known issues in CLAUDE.md)

### Key Directories
- `src/app/` — Pages and API routes (App Router)
- `src/components/` — React components
- `src/lib/` — Utilities (supabase.ts, permissions.ts)
- `src/types/` — TypeScript interfaces
- `supabase/migrations/` — Database schema (9 migration files)

### Deployment
```bash
git config user.email "totinarh24@gmail.com"
npx vercel --prod --yes --token "$VERCEL_TOKEN"
```

### Memory Protocol
Update `memory/changelog.md` after each change. Update `memory/decisions.md` for architectural decisions. Keep `memory/todo.md` current.

### Current Priority Areas
1. Security hardening (auth, RLS, input validation)
2. API authentication middleware
3. Session management upgrade (localStorage → secure cookies)
4. Performance (pagination, query optimization)
