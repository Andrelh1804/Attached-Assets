import { Router } from "express";
import { db, contractsTable, insertContractSchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function daysUntilDate(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

router.get("/contracts", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const rows = status
      ? await db.select().from(contractsTable).where(eq(contractsTable.status, status))
      : await db.select().from(contractsTable);

    const enriched = rows.map(c => ({
      ...c,
      daysUntilRenewal: daysUntilDate(c.endDate),
    }));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Failed to get contracts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contracts/summary", async (_req, res) => {
  try {
    const rows = await db.select().from(contractsTable);
    const active = rows.filter(c => c.status === "active");
    const expiringSoon = rows.filter(c => {
      const days = daysUntilDate(c.endDate);
      return days <= 30 && days >= 0;
    });
    const mrrTotal = active.reduce((sum, c) => sum + (c.mrr ?? 0), 0);
    const arrTotal = mrrTotal * 12;

    res.json({
      total: rows.length,
      active: active.length,
      expiringSoon: expiringSoon.length,
      mrrTotal,
      arrTotal,
      renewalRate: rows.length > 0 ? Math.round((active.length / rows.length) * 100) : 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get contracts summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/contracts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(contractsTable).where(eq(contractsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, daysUntilRenewal: daysUntilDate(row.endDate) });
  } catch (err) {
    req.log.error({ err }, "Failed to get contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/contracts", async (req, res) => {
  try {
    const parsed = insertContractSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data", details: parsed.error });
    const [created] = await db.insert(contractsTable).values(parsed.data).returning();
    res.status(201).json({ ...created, daysUntilRenewal: daysUntilDate(created.endDate) });
  } catch (err) {
    req.log.error({ err }, "Failed to create contract");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.patch("/contracts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = insertContractSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });
    const [updated] = await db.update(contractsTable).set(parsed.data).where(eq(contractsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ...updated, daysUntilRenewal: daysUntilDate(updated.endDate) });
  } catch (err) {
    req.log.error({ err }, "Failed to update contract");
    res.status(400).json({ error: "Invalid data" });
  }
});

router.delete("/contracts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(contractsTable).where(eq(contractsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete contract");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
