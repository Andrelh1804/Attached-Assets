import { Router } from "express";
import { db, ticketsTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { GetTicketsQueryParams, CreateTicketBody, UpdateTicketBody } from "@workspace/api-zod";

const router = Router();

const AI_RESPONSES = [
  "Olá! Vejo que você está tendo problemas com sua conexão. Já reiniciou o modem? Se sim, podemos verificar o sinal remotamente.",
  "Obrigado por entrar em contato. Seu contrato está ativo e dentro do SLA. Um técnico pode ir até você amanhã entre 9h-12h.",
  "Analisando o histórico, identifiquei que este problema ocorreu 2x nos últimos 30 dias. Recomendo trocar o equipamento.",
];

router.get("/tickets", async (req, res) => {
  try {
    const { status, priority, search } = GetTicketsQueryParams.parse(req.query);
    let q = db.select().from(ticketsTable).$dynamic();
    if (status && priority) q = q.where(and(eq(ticketsTable.status, status), eq(ticketsTable.priority, priority)));
    else if (status) q = q.where(eq(ticketsTable.status, status));
    else if (priority) q = q.where(eq(ticketsTable.priority, priority));
    else if (search) q = q.where(ilike(ticketsTable.title, `%${search}%`));
    const tickets = await q.orderBy(sql`created_at desc`);
    res.json(tickets.map(t => ({
      ...t,
      slaDeadline: t.slaDeadline?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const data = CreateTicketBody.parse(req.body);
    const slaDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const aiSuggestedResponse = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    const [ticket] = await db.insert(ticketsTable).values({ ...data, slaDeadline, aiSuggestedResponse, slaStatus: "ok" }).returning();
    res.status(201).json({ ...ticket, slaDeadline: ticket.slaDeadline?.toISOString() ?? null, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

router.get("/tickets/stats", async (_req, res) => {
  try {
    const all = await db.select().from(ticketsTable);
    const open = all.filter(t => t.status === "open").length;
    const resolved = all.filter(t => t.status === "resolved").length;
    const inProgress = all.filter(t => t.status === "in_progress").length;
    const breached = all.filter(t => t.slaStatus === "breached").length;
    res.json({
      total: all.length,
      open,
      resolved,
      inProgress,
      slaBreached: breached,
      avgResolutionTime: 4.2,
      contractsProtectedValue: open * 8500 + inProgress * 12000,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [ticket] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, id));
    if (!ticket) return res.status(404).json({ error: "Not found" });
    res.json({ ...ticket, slaDeadline: ticket.slaDeadline?.toISOString() ?? null, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = UpdateTicketBody.parse(req.body);
    const [ticket] = await db.update(ticketsTable).set(data).where(eq(ticketsTable.id, id)).returning();
    if (!ticket) return res.status(404).json({ error: "Not found" });
    res.json({ ...ticket, slaDeadline: ticket.slaDeadline?.toISOString() ?? null, createdAt: ticket.createdAt.toISOString(), updatedAt: ticket.updatedAt?.toISOString() ?? null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
