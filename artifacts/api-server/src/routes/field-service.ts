import { Router } from "express";
import { db, workOrdersTable, techniciansTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { GetWorkOrdersQueryParams, CreateWorkOrderBody, UpdateWorkOrderBody } from "@workspace/api-zod";
import { tenantWhere, withTenantId } from "../lib/tenant";

const router = Router();

router.get("/field-service/orders", async (req, res) => {
  try {
    const { status, technicianId } = GetWorkOrdersQueryParams.parse(req.query);
    const tc = tenantWhere(workOrdersTable.tenantId, req);
    let q = db.select().from(workOrdersTable).$dynamic();
    if (status) q = q.where(and(tc, eq(workOrdersTable.status, status)));
    else if (technicianId) q = q.where(and(tc, eq(workOrdersTable.technicianId, technicianId)));
    else q = q.where(tc);
    const orders = await q.orderBy(sql`scheduled_at desc`);
    res.json(orders.map(o => ({
      ...o,
      scheduledAt: o.scheduledAt.toISOString(),
      completedAt: o.completedAt?.toISOString() ?? null,
      createdAt: o.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/field-service/orders", async (req, res) => {
  try {
    const data = CreateWorkOrderBody.parse(req.body);
    const tech = await db.select().from(techniciansTable)
      .where(and(tenantWhere(techniciansTable.tenantId, req), eq(techniciansTable.id, data.technicianId)))
      .limit(1);
    const [order] = await db.insert(workOrdersTable).values(withTenantId({
      ...data,
      scheduledAt: new Date(data.scheduledAt),
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      technicianName: tech[0]?.name ?? null,
    }, req)).returning();
    res.status(201).json({ ...order, scheduledAt: order.scheduledAt.toISOString(), completedAt: null, createdAt: order.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.patch("/field-service/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateWorkOrderBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);
    if (data.completedAt) updateData.completedAt = new Date(data.completedAt);
    const [order] = await db.update(workOrdersTable).set(updateData).where(and(tenantWhere(workOrdersTable.tenantId, req), eq(workOrdersTable.id, id))).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json({ ...order, scheduledAt: order.scheduledAt.toISOString(), completedAt: order.completedAt?.toISOString() ?? null, createdAt: order.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/field-service/technicians", async (req, res) => {
  try {
    const techs = await db.select().from(techniciansTable).where(tenantWhere(techniciansTable.tenantId, req)).orderBy(sql`name asc`);
    res.json(techs.map(t => ({ ...t, createdAt: undefined })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
