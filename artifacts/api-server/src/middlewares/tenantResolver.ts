import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      isSuperAdmin: boolean;
    }
  }
}

const IS_DEV = process.env.NODE_ENV !== "production";

export function tenantResolver(req: Request, _res: Response, next: NextFunction): void {
  req.isSuperAdmin = false;

  const user = req.user as any;

  if (user?.tenantId) {
    req.tenantId = user.tenantId as string;
    req.isSuperAdmin = user.role === "super_admin";
    next();
    return;
  }

  if (IS_DEV) {
    const headerTenant = req.headers["x-tenant-id"] as string | undefined;
    req.tenantId = headerTenant ?? "default";
    if (req.headers["x-super-admin"] === "true") {
      req.isSuperAdmin = true;
    }
    next();
    return;
  }

  next();
}

export function tenantGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.tenantId) {
    res.status(401).json({
      error: "Não autenticado: nenhum contexto de tenant resolvido",
    });
    return;
  }
  next();
}
