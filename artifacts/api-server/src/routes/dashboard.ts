import { Router } from "express";
import { db, leadsTable, ticketsTable, employeesTable, transactionsTable, conversationsTable } from "@workspace/db";
import { sql, eq, gte, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/metrics", async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [leadsCount] = await db.select({ count: sql<number>`count(*)` }).from(leadsTable);
    const [openTickets] = await db.select({ count: sql<number>`count(*)` }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
    const [activeContracts] = await db.select({ count: sql<number>`count(*)` }).from(ticketsTable).where(eq(ticketsTable.status, "in_progress"));

    const revenueResult = await db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(transactionsTable)
      .where(and(eq(transactionsTable.type, "income"), gte(transactionsTable.date, monthStart.toISOString().slice(0, 10))));
    const revenue = Number(revenueResult[0]?.total ?? 0);

    const [employees] = await db.select({ count: sql<number>`count(*)` }).from(employeesTable).where(eq(employeesTable.status, "active"));
    const totalEmployees = Number(employees?.count ?? 1);

    res.json({
      revenue,
      revenueChange: 12.5,
      openTickets: Number(openTickets?.count ?? 0),
      contractsProtected: 142000 + Number(openTickets?.count ?? 0) * 8500,
      activeContracts: Number(activeContracts?.count ?? 0),
      teamProductivity: 92,
      salesCount: Number(leadsCount?.count ?? 0),
      slaCompliance: 94.3,
      aiInsightsCount: 7,
      businessHealthScore: 82,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard metrics");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/revenue-chart", async (_req, res) => {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const now = new Date();
  const data = Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
    return {
      label: months[monthIdx],
      value: 180000 + Math.floor(Math.random() * 120000),
      secondary: 120000 + Math.floor(Math.random() * 80000),
    };
  });
  res.json(data);
});

router.get("/dashboard/business-health", async (_req, res) => {
  res.json({
    score: 82,
    financial: 88,
    commercial: 79,
    support: 85,
    hr: 91,
    operations: 76,
  });
});

router.get("/dashboard/recent-activity", async (_req, res) => {
  const activities = [
    { id: 1, type: "lead", description: "Novo lead qualificado: Empresa Tech Solutions", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), color: "cyan" },
    { id: 2, type: "ticket", description: "Chamado #1042 resolvido dentro do SLA", timestamp: new Date(Date.now() - 12 * 60000).toISOString(), color: "green" },
    { id: 3, type: "finance", description: "Pagamento recebido: R$ 15.800", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), color: "blue" },
    { id: 4, type: "hr", description: "João Silva completou 3 objetivos do trimestre", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), color: "purple" },
    { id: 5, type: "ai", description: "IA detectou risco de cancelamento em 2 contratos", timestamp: new Date(Date.now() - 60 * 60000).toISOString(), color: "amber" },
    { id: 6, type: "field", description: "Técnico Carlos concluiu OS #587 no prazo", timestamp: new Date(Date.now() - 90 * 60000).toISOString(), color: "green" },
    { id: 7, type: "lead", description: "Proposta enviada para Grupo Enertech: R$ 48.000", timestamp: new Date(Date.now() - 120 * 60000).toISOString(), color: "cyan" },
  ];
  res.json(activities);
});

export default router;
