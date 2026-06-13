import { Router } from "express";
import { ChatWithAiBody } from "@workspace/api-zod";

const router = Router();

const INSIGHTS = [
  { id: 1, type: "risk", title: "Risco de Cancelamento Detectado", description: "3 contratos com probabilidade >70% de cancelamento nos próximos 30 dias. Receita em risco: R$ 87.400.", severity: "high", recommendation: "Agende reuniões de sucesso do cliente com as contas identificadas." },
  { id: 2, type: "opportunity", title: "Oportunidade de Upsell", description: "12 clientes com padrão de crescimento acima da média, candidatos ideais para upgrade de plano.", severity: "low", recommendation: "Prepare proposta de upgrade e acione o time comercial." },
  { id: 3, type: "bottleneck", title: "Gargalo no Suporte — Categoria Rede", description: "68% dos chamados abertos são da categoria Rede. Tempo médio de resolução 2x acima da meta.", severity: "medium", recommendation: "Considere treinamento técnico especializado ou adicionar L2 de redes." },
  { id: 4, type: "growth", title: "Segmento Solar em Expansão", description: "Clientes do setor de Energia Solar cresceram 34% em ticket médio no último trimestre.", severity: "low", recommendation: "Desenvolva campanha específica para o segmento solar." },
  { id: 5, type: "risk", title: "SLA em Risco — Alta Prioridade", description: "7 chamados P1 estão a menos de 2h do vencimento do SLA sem atualização registrada.", severity: "high", recommendation: "Acione supervisores para escalação imediata." },
  { id: 6, type: "opportunity", title: "Produtividade da Equipe Técnica", description: "Carlos Santos e Ana Lima estão 40% acima da média de OS concluídas. Modelo a ser replicado.", severity: "low", recommendation: "Documente as boas práticas e promova sessão de treinamento peer-to-peer." },
  { id: 7, type: "bottleneck", title: "Fluxo Financeiro — Inadimplência", description: "Inadimplência subiu 4pp este mês. 18 clientes com pagamento atrasado >15 dias.", severity: "medium", recommendation: "Automatize régua de cobrança e ofereça renegociação para contas estratégicas." },
];

const AI_REPLIES: Record<string, string> = {
  default: "Analisando os dados da sua empresa... Identifiquei 3 áreas prioritárias: (1) Risco de cancelamento em contratos de médio porte, (2) Oportunidade de upsell em clientes do segmento solar, e (3) Gargalo de atendimento na categoria Redes. Posso detalhar qualquer uma dessas análises.",
  receita: "Sua receita mensal está em R$ 342.800, representando um crescimento de 14,2% vs. o mês anterior. Os principais drivers são novos contratos no segmento de TI (+R$ 28.000) e retenção de clientes enterprise. Projeção para o próximo trimestre: R$ 1.1M se mantiver o ritmo atual.",
  chamado: "Analisando sua base de chamados: 23 abertos, 7 em SLA crítico. O volume maior é na categoria Rede (68%). Recomendo escalar os P1 hoje mesmo. Posso criar um resumo executivo dos chamados críticos para você?",
  equipe: "Sua equipe está operando a 92% de produtividade — acima da média do setor (78%). Destaques: Carlos Santos (FS) e Ana Lima (Suporte) são top performers. 4 posições abertas podem estar limitando o crescimento.",
};

router.get("/ai/insights", (_req, res) => {
  res.json(INSIGHTS.map(i => ({ ...i, createdAt: new Date().toISOString() })));
});

router.post("/ai/chat", (req, res) => {
  try {
    const { message } = ChatWithAiBody.parse(req.body);
    const lower = message.toLowerCase();
    let reply = AI_REPLIES.default;
    if (lower.includes("receita") || lower.includes("financ")) reply = AI_REPLIES.receita;
    else if (lower.includes("chamado") || lower.includes("ticket") || lower.includes("suporte")) reply = AI_REPLIES.chamado;
    else if (lower.includes("equipe") || lower.includes("funcionário") || lower.includes("produtividade")) reply = AI_REPLIES.equipe;
    res.json({ reply, timestamp: new Date().toISOString(), actions: ["Ver relatório completo", "Criar tarefa", "Agendar reunião"] });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid data" });
  }
});

export default router;
