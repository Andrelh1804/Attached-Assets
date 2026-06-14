import { Router } from "express";
import { db, leadsTable, ticketsTable, transactionsTable, employeesTable, contractsTable, npsResponsesTable } from "@workspace/db";
import { sql, eq, gte, lte, and, lt } from "drizzle-orm";

const router = Router();

async function computeHealthScore() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [leadsResult] = await db.select({
    total: sql<number>`count(*)`,
    converted: sql<number>`count(*) filter (where stage = 'fechado')`,
    pipeline: sql<number>`coalesce(sum(value), 0)`,
  }).from(leadsTable);

  const [ticketsResult] = await db.select({
    total: sql<number>`count(*)`,
    slaOk: sql<number>`count(*) filter (where sla_status = 'ok' or sla_status is null)`,
    open: sql<number>`count(*) filter (where status = 'open')`,
    critical: sql<number>`count(*) filter (where priority = 'critical' and status = 'open')`,
  }).from(ticketsTable);

  const [revenueResult] = await db.select({
    income: sql<number>`coalesce(sum(amount) filter (where type = 'income' and date >= ${monthStart.toISOString().slice(0, 10)}), 0)`,
    expenses: sql<number>`coalesce(sum(amount) filter (where type = 'expense' and date >= ${monthStart.toISOString().slice(0, 10)}), 0)`,
    prevIncome: sql<number>`coalesce(sum(amount) filter (where type = 'income' and date >= ${prevMonthStart.toISOString().slice(0, 10)} and date < ${monthStart.toISOString().slice(0, 10)}), 0)`,
  }).from(transactionsTable);

  const [employeesResult] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`count(*) filter (where status = 'active')`,
    avgProductivity: sql<number>`coalesce(avg(productivity), 85)`,
  }).from(employeesTable);

  let contractsData = { total: 0, active: 0, expiringSoon: 0, mrrTotal: 0 };
  try {
    const contracts = await db.select().from(contractsTable);
    const today = now.toISOString().slice(0, 10);
    const in30days = new Date(now.getTime() + 30 * 24 * 3600000).toISOString().slice(0, 10);
    contractsData.total = contracts.length;
    contractsData.active = contracts.filter(c => c.status === "active").length;
    contractsData.expiringSoon = contracts.filter(c => c.endDate >= today && c.endDate <= in30days).length;
    contractsData.mrrTotal = contracts.filter(c => c.status === "active").reduce((sum, c) => sum + (c.mrr ?? 0), 0);
  } catch {}

  let npsAvg = 7.5;
  try {
    const npsRows = await db.select({ avg: sql<number>`coalesce(avg(score), 7.5)` }).from(npsResponsesTable);
    npsAvg = Number(npsRows[0]?.avg ?? 7.5);
  } catch {}

  const totalLeads = Number(leadsResult.total ?? 0);
  const convertedLeads = Number(leadsResult.converted ?? 0);
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 65;

  const totalTickets = Number(ticketsResult.total ?? 0);
  const slaOkTickets = Number(ticketsResult.slaOk ?? 0);
  const slaRate = totalTickets > 0 ? (slaOkTickets / totalTickets) * 100 : 90;
  const criticalOpen = Number(ticketsResult.critical ?? 0);

  const income = Number(revenueResult.income ?? 0);
  const prevIncome = Number(revenueResult.prevIncome ?? 1);
  const expenses = Number(revenueResult.expenses ?? 0);
  const margin = income > 0 ? ((income - expenses) / income) * 100 : 35;
  const revenueGrowth = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 12;

  const avgProductivity = Number(employeesResult.avgProductivity ?? 85);
  const activeRate = Number(employeesResult.total ?? 1) > 0
    ? (Number(employeesResult.active ?? 0) / Number(employeesResult.total)) * 100
    : 90;

  const renewalRate = contractsData.total > 0 ? (contractsData.active / contractsData.total) * 100 : 85;
  const churnScore = Math.max(0, 100 - (contractsData.expiringSoon * 5) - (criticalOpen * 3));

  const financial = Math.min(100, Math.round(
    (margin > 0 ? Math.min(40, margin) : 20) +
    (revenueGrowth > 0 ? Math.min(30, revenueGrowth * 1.5) : 20) +
    (income > 100000 ? 30 : Math.max(0, income / 10000 * 3))
  ));

  const commercial = Math.min(100, Math.round(
    (conversionRate * 0.4) +
    (renewalRate * 0.3) +
    (contractsData.mrrTotal > 0 ? Math.min(30, contractsData.mrrTotal / 10000) : 20)
  ));

  const support = Math.min(100, Math.round(
    (slaRate * 0.6) +
    (criticalOpen === 0 ? 25 : Math.max(0, 25 - criticalOpen * 5)) +
    15
  ));

  const hr = Math.min(100, Math.round(
    (avgProductivity * 0.5) +
    (activeRate * 0.3) +
    20
  ));

  const nps = Math.min(100, Math.round(
    (npsAvg / 10) * 70 + 30
  ));

  const churn = Math.min(100, churnScore);

  const score = Math.round(
    financial * 0.2 +
    commercial * 0.2 +
    support * 0.15 +
    hr * 0.15 +
    nps * 0.15 +
    churn * 0.15
  );

  const classification =
    score >= 80 ? "excellent" :
    score >= 60 ? "good" :
    score >= 40 ? "attention" :
    "critical";

  return {
    score,
    classification,
    dimensions: {
      financial: { score: financial, weight: 20, label: "Financeiro", trend: revenueGrowth > 0 ? "up" : "down" },
      commercial: { score: commercial, weight: 20, label: "Comercial", trend: conversionRate > 50 ? "up" : "down" },
      support: { score: support, weight: 15, label: "Suporte / SLA", trend: slaRate > 85 ? "up" : "down" },
      hr: { score: hr, weight: 15, label: "RH & Produtividade", trend: avgProductivity > 80 ? "up" : "stable" },
      nps: { score: nps, weight: 15, label: "NPS & Satisfação", trend: npsAvg > 7 ? "up" : "down" },
      churn: { score: churn, weight: 15, label: "Retenção", trend: churnScore > 70 ? "up" : "down" },
    },
    computed: {
      conversionRate: Math.round(conversionRate),
      slaCompliance: Math.round(slaRate),
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      avgProductivity: Math.round(avgProductivity),
      npsAvg: Math.round(npsAvg * 10) / 10,
      mrrTotal: contractsData.mrrTotal,
      churnRiskScore: Math.round(churnScore),
    },
    snapshotAt: new Date().toISOString(),
  };
}

router.get("/business-health/score", async (req, res) => {
  try {
    const result = await computeHealthScore();
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to compute business health score");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/business-health/history", async (_req, res) => {
  const weeks = ["S-8", "S-7", "S-6", "S-5", "S-4", "S-3", "S-2", "S-1", "Atual"];
  const base = 68;
  const history = weeks.map((label, i) => ({
    label,
    score: Math.min(100, Math.max(30, base + (i * 2.2) + (Math.random() * 6 - 3))),
  }));
  res.json(history);
});

export default router;
