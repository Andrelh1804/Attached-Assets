import { Router } from "express";
import { db, transactionsTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { GetTransactionsQueryParams, CreateTransactionBody } from "@workspace/api-zod";

const router = Router();

router.get("/finance/overview", async (_req, res) => {
  try {
    const all = await db.select().from(transactionsTable);
    const revenue = all.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expenses = all.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const profit = revenue - expenses;
    res.json({
      balance: 1240500,
      revenue,
      expenses,
      profit,
      pendingReceivables: 187000,
      pendingPayables: 45000,
      revenueChange: 14.2,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/finance/transactions", async (req, res) => {
  try {
    const { type, search } = GetTransactionsQueryParams.parse(req.query);
    let q = db.select().from(transactionsTable).$dynamic();
    if (type) q = q.where(eq(transactionsTable.type, type));
    else if (search) q = q.where(ilike(transactionsTable.description, `%${search}%`));
    const txns = await q.orderBy(sql`date desc`);
    res.json(txns.map(t => ({ ...t, createdAt: t.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/finance/transactions", async (req, res) => {
  try {
    const data = CreateTransactionBody.parse(req.body);
    const [txn] = await db.insert(transactionsTable).values(data).returning();
    res.status(201).json({ ...txn, createdAt: txn.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/finance/cashflow", async (_req, res) => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const now = new Date();
  const data = Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
    return {
      label: months[monthIdx],
      value: 150000 + Math.floor(Math.random() * 100000),
      secondary: 80000 + Math.floor(Math.random() * 60000),
    };
  });
  res.json(data);
});

export default router;
