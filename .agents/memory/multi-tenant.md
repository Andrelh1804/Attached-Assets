---
name: Multi-tenant architecture
description: Security model, middleware design, and testing approach for multi-tenant isolation in Nexora API server
---

# Multi-Tenant Architecture

**Why:** Nexora is a SaaS B2B platform that must fully isolate data per customer company.

## Column pattern
- `tenant_id TEXT NOT NULL DEFAULT 'default'` added to all 9 data tables
- No FK constraint on those tables (avoids migration complexity)
- `companies` table is the canonical tenant registry (PK is text slug)
- `tenant_settings` has FK → companies(id)

## Middleware chain (app.ts order)
```
authMiddleware → tenantResolver → routes
```
- `tenantResolver`: in production, reads ONLY `req.user?.tenantId` (from session). In dev (`NODE_ENV !== 'production'`), also allows `X-Tenant-ID` header and falls back to `"default"`. **Never trusts header in production.**
- In production with no auth: `req.tenantId` stays `undefined` and `tenantGuard` returns 401 (fail-closed).
- `tenantGuard`: applied globally to all data routes via a `dataRouter` sub-router in `routes/index.ts`.

## Route structure (`routes/index.ts`)
- **Public router** (no tenantGuard): auth, health, stripe
- **dataRouter** (tenantGuard first): all business data routes (CRM, tickets, HR, finance, etc.)
- **adminRouter** (requireSuperAdmin): /api/admin/tenants

## Express.User extension (`authMiddleware.ts`)
- `Express.User` extends `AuthUser` with `tenantId?: string` and `role?: string`
- These fields are backend session claims — NOT in the orval-generated `AuthUser` (which only reflects OIDC userinfo)
- When Task #5 (OIDC auth) is implemented, session must persist these fields

## Route helpers (`artifacts/api-server/src/lib/tenant.ts`)
- `getTenantId(req)` — throws if tenantId not resolved (safe inside guards)
- `tenantWhere(col, req)` — returns `eq(col, req.tenantId)`
- `andTenant(col, req, extra)` — returns `and(tenantWhere(...), extra)`
- `withTenantId(data, req)` — spreads tenantId into INSERT values
- Always use these instead of bare `eq(table.tenantId, ...)` for consistency

## Admin API
- `GET/POST/PATCH /api/admin/tenants` — super_admin only (checked via `req.isSuperAdmin`)
- `requireSuperAdmin` local guard in `admin.ts`
- In dev: `X-Super-Admin: true` header elevates to super_admin (dev convenience only)

## Default tenant bootstrap (idempotent)
- `initDefaultTenant()` in `index.ts` runs on every server startup
- Uses `onConflictDoNothing()` → safe to run repeatedly
- Inserts `companies(id='default')` and `tenant_settings(tenantId='default')`

## Isolation tests
- 6 SQL-level tests verify zero cross-tenant data leakage (leads + tickets tables)
- Cross-tenant queries (tenantId=A + name=B's data) return 0 rows
- Test script: `artifacts/api-server/src/tests/tenant-isolation.test.ts`

## How to apply to new routes
- New data table: add `tenantId: text("tenant_id").notNull().default("default")`
- Omit `tenantId` from the Zod insert schema (injected server-side)
- In handlers: use `tenantWhere` for SELECT, `withTenantId` for INSERT
- New routers go under `dataRouter` in `routes/index.ts` — guard is automatic
