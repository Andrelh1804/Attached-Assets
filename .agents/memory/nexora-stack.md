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
- **AI routes**: Return smart static responses. Production would swap in actual LLM calls.
- **Gamification rankings**: Static fixture data in the route handler (no DB table).
- **Seed script**: `pnpm --filter @workspace/scripts run seed` — uses `onConflictDoNothing()`, safe to re-run.

**Why:** Enterprise dark SaaS aesthetic; contract-first prevents drift between client and server; Orval codegen saves massive amounts of boilerplate.
