import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      tenantId: string;
      isSuperAdmin: boolean;
    }
  }
}

export function tenantResolver(req: Request, _res: Response, next: NextFunction): void {
  const userTenantId = (req.user as any)?.tenantId as string | undefined;
  const userRole = (req.user as any)?.role as string | undefined;

  const headerTenantId = req.headers["x-tenant-id"] as string | undefined;

  req.tenantId = userTenantId ?? headerTenantId ?? "default";
  req.isSuperAdmin = userRole === "super_admin";

  next();
}

export function tenantGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.tenantId) {
    res.status(401).json({ error: "Tenant não resolvido" });
    return;
  }
  next();
}
