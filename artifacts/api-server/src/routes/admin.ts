import { Router } from "express";
import { db, companiesTable, tenantSettingsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.isSuperAdmin) {
    return res.status(403).json({ error: "Acesso negado: requer role super_admin" });
  }
  next();
}

router.get("/admin/tenants", requireSuperAdmin, async (_req, res) => {
  try {
    const tenants = await db.select().from(companiesTable).orderBy(sql`created_at desc`);
    res.json(tenants.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/tenants/:id", requireSuperAdmin, async (req, res) => {
  try {
    const [tenant] = await db.select().from(companiesTable).where(eq(companiesTable.id, req.params.id));
    if (!tenant) return res.status(404).json({ error: "Tenant não encontrado" });
    const [settings] = await db.select().from(tenantSettingsTable).where(eq(tenantSettingsTable.tenantId, req.params.id));
    res.json({
      ...tenant,
      createdAt: tenant.createdAt.toISOString(),
      settings: settings ?? null,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/tenants", requireSuperAdmin, async (req, res) => {
  try {
    const { id, name, plan } = req.body as { id: string; name: string; plan?: string };
    if (!id || !name) return res.status(400).json({ error: "id e name são obrigatórios" });
    const [tenant] = await db.insert(companiesTable).values({ id, name, plan: plan ?? "starter", status: "active" }).returning();
    await db.insert(tenantSettingsTable).values({ tenantId: tenant.id, featureFlags: {}, branding: {}, limits: {} });
    res.status(201).json({ ...tenant, createdAt: tenant.createdAt.toISOString() });
  } catch (err: any) {
    if (err?.code === "23505") return res.status(409).json({ error: "Tenant já existe" });
    res.status(400).json({ error: "Dados inválidos" });
  }
});

router.patch("/admin/tenants/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { name, plan, status } = req.body as { name?: string; plan?: string; status?: string };
    const [tenant] = await db.update(companiesTable).set({ name, plan, status } as any).where(eq(companiesTable.id, req.params.id)).returning();
    if (!tenant) return res.status(404).json({ error: "Tenant não encontrado" });
    res.json({ ...tenant, createdAt: tenant.createdAt.toISOString() });
  } catch (err) {
    res.status(400).json({ error: "Dados inválidos" });
  }
});

export default router;
