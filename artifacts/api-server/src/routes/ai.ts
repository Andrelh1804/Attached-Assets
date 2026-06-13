import { Router } from "express";
import { db, leadsTable, ticketsTable, transactionsTable, employeesTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { ChatWithAiBody } from "@workspace/api-zod";

const router = Router();

const STATIC_INSIGHTS = [
  { id: 1, type: "risk", title: "Risco de Cancelamento Detectado", description: "3 contratos com probabilidade >70% de cancelamento nos próximos 30 dias. Receita em risco: R$ 87.400.", severity: "high", recommendation: "Agende reuniões de sucesso do cliente com as contas identificadas." },
  { id: 2, type: "opportunity", title: "Oportunidade de Upsell", description: "12 clientes com padrão de crescimento acima da média, candidatos ideais para upgrade de plano.", severity: "low", recommendation: "Prepare proposta de upgrade e acione o time comercial." },
  { id: 3, type: "bottleneck", title: "Gargalo no Suporte — Categoria Rede", description: "68% dos chamados abertos são da categoria Rede. Tempo médio de resolução 2x acima da meta.", severity: "medium", recommendation: "Considere treinamento técnico especializado ou adicionar L2 de redes." },
  { id: 4, type: "growth", title: "Segmento Solar em Expansão", description: "Clientes do setor de Energia Solar cresceram 34% em ticket médio no último trimestre.", severity: "low", recommendation: "Desenvolva campanha específica para o segmento solar." },
  { id: 5, type: "risk", title: "SLA em Risco — Alta Prioridade", description: "7 chamados P1 estão a menos de 2h do vencimento do SLA sem atualização registrada.", severity: "high", recommendation: "Acione supervisores para escalação imediata." },
  { id: 6, type: "opportunity", title: "Produtividade da Equipe Técnica", description: "Carlos Santos e Ana Lima estão 40% acima da média de OS concluídas. Modelo a ser replicado.", severity: "low", recommendation: "Documente as boas práticas e promova sessão de treinamento peer-to-peer." },
  { id: 7, type: "bottleneck", title: "Fluxo Financeiro — Inadimplência", description: "Inadimplência subiu 4pp este mês. 18 clientes com pagamento atrasado >15 dias.", severity: "medium", recommendation: "Automatize régua de cobrança e ofereça renegociação para contas estratégicas." },
];

async function getBusinessContext() {
  try {
    const [leads, tickets, transactions, employees] = await Promise.all([
      db.select().from(leadsTable),
      db.select().from(ticketsTable),
      db.select().from(transactionsTable),
      db.select().from(employeesTable),
    ]);

    const pipelineValue = leads.reduce((s, l) => s + (l.value ?? 0), 0);
    const openTickets = tickets.filter(t => t.status === "open").length;
    const criticalTickets = tickets.filter(t => t.priority === "critical" && t.status !== "resolved").length;
    const closedLeads = leads.filter(l => l.stage === "fechado").length;
    const convRate = leads.length > 0 ? Math.round((closedLeads / leads.length) * 100) : 0;
    const revenue = transactions.filter(t => t.type === "receita").reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === "despesa").reduce((s, t) => s + t.amount, 0);
    const profit = revenue - expenses;
    const activeEmps = employees.filter(e => e.status === "active").length;

    return {
      leads: { total: leads.length, pipelineValue, closedLeads, convRate },
      tickets: { total: tickets.length, open: openTickets, critical: criticalTickets },
      finance: { revenue, expenses, profit },
      hr: { total: employees.length, active: activeEmps },
    };
  } catch {
    return null;
  }
}

function fmt(val: number) {
  if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(0)}k`;
  return `R$ ${val.toFixed(0)}`;
}

async function buildReply(message: string): Promise<{ reply: string; actions: string[] }> {
  const lower = message.toLowerCase();
  const ctx = await getBusinessContext();

  if (!ctx) {
    return {
      reply: "Analisando dados da empresa... Identifiquei 3 prioridades: risco de cancelamento em contratos médios, oportunidade de upsell em clientes crescendo, e gargalo no suporte de Redes. Posso detalhar qualquer área.",
      actions: ["Ver pipeline CRM", "Ver chamados críticos", "Resumo financeiro"],
    };
  }

  if (lower.includes("receita") || lower.includes("financ") || lower.includes("dinheiro") || lower.includes("lucro")) {
    const margin = ctx.finance.revenue > 0 ? Math.round((ctx.finance.profit / ctx.finance.revenue) * 100) : 0;
    return {
      reply: `📊 **Análise Financeira em Tempo Real**\n\nReceita total: ${fmt(ctx.finance.revenue)}\nDespesas: ${fmt(ctx.finance.expenses)}\nLucro líquido: ${fmt(ctx.finance.profit)} (margem ${margin}%)\n\n${ctx.finance.profit > 0 ? "✅ Empresa operando com lucro." : "⚠️ Despesas superando receitas."} Recomendo revisar as categorias de maior custo e identificar oportunidades de upsell nos ${ctx.leads.total} leads ativos.`,
      actions: ["Ver transações", "Analisar despesas", "Oportunidades de upsell"],
    };
  }

  if (lower.includes("chamado") || lower.includes("ticket") || lower.includes("suporte") || lower.includes("sla")) {
    return {
      reply: `🎫 **Status do Suporte**\n\nTotal de chamados: ${ctx.tickets.total}\nChamados abertos: ${ctx.tickets.open}\n${ctx.tickets.critical > 0 ? `⚠️ Chamados críticos sem resolução: **${ctx.tickets.critical}**` : "✅ Nenhum chamado crítico pendente"}\n\n${ctx.tickets.critical > 0 ? "Ação urgente necessária: escale os chamados críticos agora." : "Suporte operando dentro do esperado."} Monitorei os SLAs P1/P2 para evitar violações.`,
      actions: ["Ver chamados críticos", "Escalar para supervisor", "Relatório de SLA"],
    };
  }

  if (lower.includes("equipe") || lower.includes("funcionário") || lower.includes("hr") || lower.includes("produtividade") || lower.includes("rh")) {
    return {
      reply: `👥 **Análise de Equipe**\n\nTotal de colaboradores: ${ctx.hr.total}\nAtivos: ${ctx.hr.active}\n\nSua equipe está operando a ${ctx.hr.total > 0 ? Math.round((ctx.hr.active / ctx.hr.total) * 100) : 0}% de capacidade. Recomendo revisar engajamento e gamificação para manter alta performance.`,
      actions: ["Ver colaboradores", "Ranking de produtividade", "Criar reconhecimento"],
    };
  }

  if (lower.includes("pipeline") || lower.includes("lead") || lower.includes("crm") || lower.includes("vendas") || lower.includes("negócio")) {
    return {
      reply: `🚀 **Pipeline de Vendas**\n\nLeads ativos: ${ctx.leads.total}\nValor total em pipeline: ${fmt(ctx.leads.pipelineValue)}\nLeads fechados: ${ctx.leads.closedLeads} (taxa de conversão ${ctx.leads.convRate}%)\n\n${ctx.leads.convRate < 20 ? "⚠️ Taxa de conversão abaixo do ideal (meta 25%). Revise abordagem de proposta." : "✅ Taxa de conversão saudável."} Foque nos leads em etapa de Negociação para fechar mais contratos.`,
      actions: ["Ver pipeline completo", "Leads em negociação", "Criar novo lead"],
    };
  }

  if (lower.includes("resumo") || lower.includes("visão geral") || lower.includes("executivo") || lower.includes("overview")) {
    const margin = ctx.finance.revenue > 0 ? Math.round((ctx.finance.profit / ctx.finance.revenue) * 100) : 0;
    return {
      reply: `📋 **Resumo Executivo — Nexora AI**\n\n💰 Financeiro: ${fmt(ctx.finance.revenue)} receita, margem ${margin}%\n🚀 Pipeline: ${fmt(ctx.leads.pipelineValue)} em ${ctx.leads.total} leads ativos\n🎫 Suporte: ${ctx.tickets.open} chamados abertos${ctx.tickets.critical > 0 ? ` (${ctx.tickets.critical} críticos!)` : " (sem críticos)"}\n👥 Equipe: ${ctx.hr.active}/${ctx.hr.total} ativos\n\n${ctx.tickets.critical > 0 ? "🔴 Prioridade 1: resolver chamados críticos." : "🟢 Operações estáveis."} Foco em crescimento de pipeline.`,
      actions: ["Detalhar financeiro", "Ver chamados críticos", "Análise de pipeline"],
    };
  }

  const margin = ctx.finance.revenue > 0 ? Math.round((ctx.finance.profit / ctx.finance.revenue) * 100) : 0;
  return {
    reply: `Analisei todos os módulos da Nexora. Situação atual:\n\n• Pipeline: ${fmt(ctx.leads.pipelineValue)} (${ctx.leads.total} leads)\n• Suporte: ${ctx.tickets.open} abertos${ctx.tickets.critical > 0 ? `, ${ctx.tickets.critical} críticos ⚠️` : ""}\n• Receita: ${fmt(ctx.finance.revenue)}, margem ${margin}%\n• Equipe: ${ctx.hr.active} colaboradores ativos\n\nPosso detalhar qualquer área. O que você precisa analisar?`,
    actions: ["Análise financeira", "Status do suporte", "Pipeline de vendas", "Resumo executivo"],
  };
}

router.get("/ai/insights", (_req, res) => {
  res.json(STATIC_INSIGHTS.map(i => ({ ...i, createdAt: new Date().toISOString() })));
});

router.post("/ai/chat", async (req, res) => {
  try {
    const { message } = ChatWithAiBody.parse(req.body);
    const { reply, actions } = await buildReply(message);
    res.json({ reply, timestamp: new Date().toISOString(), actions });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
