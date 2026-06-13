---
name: Nexora stack overview
description: Architecture decisions and file layout for the Nexora AI Business OS project
---

## Key decisions

- **Contract-first**: OpenAPI spec in `lib/api-spec/openapi.yaml` → `pnpm --filter @workspace/api-spec run codegen` → Zod schemas in `lib/api-zod` + React Query hooks in `lib/api-client-react`. Never hand-write hooks.
- **Routing**: Wouter (not React Router). Base path set from `import.meta.env.BASE_URL`.
- **Animations**: Framer Motion for all page transitions, hover states, and modals.
- **Charts**: Recharts (AreaChart, RadialBarChart, BarChart).
- **Dark-first**: `:root` contains dark design tokens. No `dark:` class toggling needed.
- **AI routes**: `artifacts/api-server/src/routes/ai.ts` queries real DB (leads, tickets, transactions, employees) for contextual responses. Keyword matching + live aggregates — no external LLM.
- **Vite alias required for workspace packages**: Workspace libs (e.g. `@workspace/replit-auth-web`) need an explicit alias in `artifacts/nexora/vite.config.ts` under `resolve.alias` pointing to the src entry file, or Vite can't resolve them in dev mode.
- **Mobile auth routes omitted**: Spec doesn't include mobile auth types so Zod schemas weren't generated; mobile routes removed from `auth.ts` to unblock web auth.
- **Omnichannel tables renamed**: Old `conversations` table had incompatible schema. New tables use `omni_conversations` / `omni_messages` prefix in `lib/db/src/schema/omnichannel.ts`.
- **Auth setup**: `sessionsTable` in `lib/db/src/schema/auth.ts`, `usersTable` updated with `firstName/lastName/profileImageUrl`. `cookieParser` + `authMiddleware` added to `app.ts` (in that order). Auth router mounted first in routes index. `useAuth()` from `@workspace/replit-auth-web` used in `AppLayout.tsx`.
- **Gamification rankings**: Static fixture data in the route handler (no DB table).
- **Seed script**: `pnpm --filter @workspace/scripts run seed` — uses `onConflictDoNothing()`, safe to re-run.

**Why:** Enterprise dark SaaS aesthetic; contract-first prevents drift between client and server; Orval codegen saves massive amounts of boilerplate.
