import { Router } from "express";
import { db, automationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreateAutomationBody, UpdateAutomationBody } from "@workspace/api-zod";

const router = Router();

router.get("/automations", async (_req, res) => {
  try {
    const autos = await db.select().from(automationsTable).orderBy(sql`created_at desc`);
    res.json(autos.map(a => ({ ...a, lastExecutedAt: a.lastExecutedAt?.toISOString() ?? null, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/automations", async (req, res) => {
  try {
    const data = CreateAutomationBody.parse(req.body);
    const [auto] = await db.insert(automationsTable).values(data).returning();
    res.status(201).json({ ...auto, lastExecutedAt: null, createdAt: auto.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.patch("/automations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateAutomationBody.parse(req.body);
    const [auto] = await db.update(automationsTable).set(data).where(eq(automationsTable.id, id)).returning();
    if (!auto) return res.status(404).json({ error: "Not found" });
    res.json({ ...auto, lastExecutedAt: auto.lastExecutedAt?.toISOString() ?? null, createdAt: auto.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/automations/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(automationsTable).where(eq(automationsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
