import type { Request } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export const DEFAULT_TENANT = "default";

export function getTenantId(req: Request): string {
  const tid = req.tenantId;
  if (!tid) {
    throw new Error("tenantId not resolved — ensure tenantGuard runs before this handler");
  }
  return tid;
}

export function checkSuperAdmin(req: Request): boolean {
  return req.isSuperAdmin === true;
}

export function tenantWhere(col: PgColumn, req: Request): SQL {
  return eq(col, getTenantId(req));
}

export function andTenant(col: PgColumn, req: Request, extra: SQL): SQL {
  return and(tenantWhere(col, req), extra)!;
}

export function withTenantId<T extends object>(data: T, req: Request): T & { tenantId: string } {
  return { ...data, tenantId: getTenantId(req) };
}
