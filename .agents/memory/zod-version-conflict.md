---
name: Zod version conflict in lib/db schemas
description: drizzle-zod requires zod v3; some schema files import zod/v4 causing tsc typecheck failure but esbuild build works
---

# Zod Version Conflict

**Why:** `drizzle-zod` peer-depends on zod v3. When schema files import `from "zod/v4"`, TypeScript sees `ZodObject` types that don't satisfy `ZodType<any, any, any>` from zod v3 (missing `_type`, `_parse`, `_getType`, etc.).

## Affected files (import `from "zod/v4"`)
- `lib/db/src/schema/leads.ts`
- `lib/db/src/schema/contacts.ts`
- `lib/db/src/schema/tickets.ts`
- `lib/db/src/schema/employees.ts`
- `lib/db/src/schema/transactions.ts`
- `lib/db/src/schema/work_orders.ts`
- `lib/db/src/schema/technicians.ts`
- `lib/db/src/schema/automations.ts`

## Files that work correctly (import `from "zod"`)
- `lib/db/src/schema/business_health.ts`
- `lib/db/src/schema/contracts.ts`
- `lib/db/src/schema/customer_success.ts`
- `lib/db/src/schema/companies.ts`
- `lib/db/src/schema/tenant_settings.ts`

## Impact
- `tsc --build` (typecheck:libs) fails — blocks the codegen's typecheck step
- `esbuild` (api-server build) SUCCEEDS — runtime is not affected
- Orval codegen generates files correctly before typecheck step fails

## Fix
Change all `import { z } from "zod/v4"` → `import { z } from "zod"` in lib/db schema files, OR upgrade drizzle-zod to a version that supports zod v4.
