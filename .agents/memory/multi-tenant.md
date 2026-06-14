---
name: Multi-tenant architecture
description: How tenant isolation is implemented in Nexora — columns, middleware, helpers, admin routes, default tenant
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
- `tenantResolver`: reads `req.user?.tenantId` → `X-Tenant-ID` header → `"default"`
- Sets `req.tenantId` and `req.isSuperAdmin` on every request
- `tenantGuard`: standalone middleware (not globally applied) — returns 401 if no tenantId

## Route helpers (`artifacts/api-server/src/lib/tenant.ts`)
- `tenantWhere(col, req)` — returns `eq(col, req.tenantId)`
- `andTenant(col, req, extra)` — returns `and(tenantWhere(...), extra)`
- `withTenantId(data, req)` — spreads tenantId into INSERT values
- Always use these instead of bare `eq(table.tenantId, ...)` for consistency

## Admin API
- `GET/POST/PATCH /api/admin/tenants` — super_admin only (checked via `req.isSuperAdmin`)
- `requireSuperAdmin` local guard in `admin.ts`

## Default tenant
- Inserted once: `INSERT INTO companies (id='default', ...) ON CONFLICT DO NOTHING`
- Same for tenant_settings row
- Existing rows get `tenant_id='default'` automatically from the column default

## How to apply
- Any new data table that is tenant-scoped: add `tenantId: text("tenant_id").notNull().default("default")`
- Omit `tenantId` from the insert schema (injected server-side)
- In route handlers: use `tenantWhere` for SELECT, `withTenantId` for INSERT
