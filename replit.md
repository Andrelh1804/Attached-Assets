# Nexora AI Business OS

Uma única plataforma para controlar toda sua empresa — CRM, Atendimento, RH, Financeiro, Field Service, IA e mais.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/scripts run seed` — seed database with sample data
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — session secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter (routing) + Framer Motion + Recharts
- API: Express 5 (port 8080, path `/api`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)
- Design: Dark-first, #0F172A bg, #2563EB primary, #06B6D4 cyan, Inter font

## Where things live

- `lib/db/src/schema/` — all DB table schemas (leads, contacts, tickets, employees, transactions, work_orders, technicians, conversations, automations)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (do not edit manually)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks (do not edit manually)
- `artifacts/api-server/src/routes/` — all Express route handlers (dashboard, crm, tickets, hr, finance, field-service, omnichannel, ai, gamification, automations)
- `artifacts/nexora/src/pages/` — all React page components (LandingPage, Dashboard, CrmPage, TicketsPage, FieldServicePage, HrPage, FinancePage, OmnichannelPage, AiPage, GamificationPage, AutomationsPage)
- `artifacts/nexora/src/components/layout/AppLayout.tsx` — main app shell with sidebar + topbar + AI assistant overlay
- `artifacts/nexora/src/index.css` — all design tokens and Nexora CSS utilities
- `scripts/src/seed.ts` — database seed with realistic sample data

## Architecture decisions

- Contract-first API: all routes defined in OpenAPI spec first, then codegen produces hooks + schemas. Never hand-write hooks.
- Dark-first design: CSS vars set dark mode at `:root`. No `dark:` class toggling needed for primary UI.
- Framer Motion for all page transitions and hover interactions — creates premium enterprise feel.
- AI routes return static smart responses (no LLM key required); production would swap in actual LLM calls.
- Gamification rankings are static fixture data in the route handler — no DB table needed.

## Product

**Nexora AI Business OS** is a full-scale enterprise SaaS platform with:
- **Landing Page** — marketing page with hero, modules grid, ROI calculator, testimonials, pricing
- **Dashboard** — executive panel with live metrics, revenue chart, health score gauge, activity feed, AI alerts
- **CRM & Pipeline** — Kanban board with AI scoring per lead, drag-to-move stages, value tracking
- **Mesa de Serviço** — ticket management with SLA monitoring, priority triage, AI response suggestions
- **Field Service** — technician map panel, work order management, completion tracking
- **RH & Pessoas** — employee directory with productivity bars, goals, gamification points, dept breakdown
- **Financeiro** — balance overview, cashflow chart, transaction ledger with income/expense filter
- **Omnicanal** — unified inbox (WhatsApp, email, chat, phone) with real-time messaging
- **Nexora Brain** — AI chat interface with insight cards (risk alerts, opportunities, bottlenecks)
- **Gamificação** — podium + ranking tables for technicians, attendants, suppliers
- **Automações** — visual flow card grid with trigger/status management

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before touching frontend hooks.
- Run `pnpm --filter @workspace/db run push` after any schema change in `lib/db/src/schema/`.
- The Google Fonts `@import` must be the FIRST line in `index.css` (before Tailwind imports) to avoid PostCSS warnings.
- API server path prefix is `/api` — all routes must be relative to that (e.g., `/api/dashboard/metrics`).
- Seed script uses `onConflictDoNothing()` — safe to run multiple times.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
