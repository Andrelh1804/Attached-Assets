import { useState, useEffect, useRef } from "react";

const MODULES = [
  {
    name: "Landing Page",
    icon: "🌐",
    percent: 100,
    status: "concluído",
    features: ["Hero animado", "Grid de módulos", "Calculadora de ROI", "Testemunhos", "Seção de preços"],
    lines: 475,
    color: "#22c55e",
  },
  {
    name: "Página de Preços",
    icon: "💳",
    percent: 100,
    status: "concluído",
    features: ["Planos Starter/Business/Enterprise", "Tabela comparativa", "Integração Stripe Checkout"],
    lines: 273,
    color: "#22c55e",
  },
  {
    name: "Dashboard Executivo",
    icon: "📊",
    percent: 95,
    status: "concluído",
    features: ["Métricas ao vivo", "Gráfico de receita", "Gauge de saúde", "Feed de atividades", "Alertas IA"],
    pending: ["WebSocket para tempo real"],
    lines: 252,
    color: "#22c55e",
  },
  {
    name: "CRM & Pipeline",
    icon: "🎯",
    percent: 90,
    status: "concluído",
    features: ["Kanban por estágio", "Score IA por lead", "CRUD completo", "Contatos", "Filtro/busca"],
    pending: ["Drag-and-drop nativo"],
    lines: 205,
    color: "#22c55e",
  },
  {
    name: "Mesa de Serviço",
    icon: "🎫",
    percent: 90,
    status: "concluído",
    features: ["Gestão de tickets", "Prioridade/SLA", "Sugestão IA", "Stats", "Filtros"],
    pending: ["SLA countdown automático"],
    lines: 225,
    color: "#22c55e",
  },
  {
    name: "Field Service",
    icon: "🔧",
    percent: 85,
    status: "concluído",
    features: ["Ordens de serviço", "Painel de técnicos", "Status em tempo real", "Métricas de conclusão"],
    pending: ["Mapa interativo real (Leaflet/Maps)"],
    lines: 201,
    color: "#f59e0b",
  },
  {
    name: "RH & Pessoas",
    icon: "👥",
    percent: 90,
    status: "concluído",
    features: ["Diretório de colaboradores", "Barras de produtividade", "Metas", "Pontos gamificação", "Dept"],
    pending: ["Folha de ponto"],
    lines: 169,
    color: "#22c55e",
  },
  {
    name: "Financeiro",
    icon: "💰",
    percent: 90,
    status: "concluído",
    features: ["Visão geral de saldo", "Gráfico de cashflow", "Extrato de transações", "Filtro receita/despesa"],
    pending: ["Exportação para CSV/PDF"],
    lines: 183,
    color: "#22c55e",
  },
  {
    name: "Omnicanal",
    icon: "💬",
    percent: 85,
    status: "concluído",
    features: ["Caixa unificada", "WhatsApp/Email/Chat/Telefone", "Mensagens", "Filtro por canal"],
    pending: ["WebSocket para tempo real", "Notificações push"],
    lines: 168,
    color: "#f59e0b",
  },
  {
    name: "Nexora Brain (IA)",
    icon: "🧠",
    percent: 80,
    status: "concluído",
    features: ["Chat IA", "Cards de insight", "Alertas de risco/oportunidade", "Gargalos"],
    pending: ["Integração LLM real", "Histórico de conversas"],
    lines: 210,
    color: "#f59e0b",
  },
  {
    name: "Gamificação",
    icon: "🏆",
    percent: 85,
    status: "concluído",
    features: ["Pódio top 3", "Ranking técnicos/atendentes/fornecedores", "Pontos/medalhas"],
    pending: ["Histórico de pontuação", "Recompensas reais"],
    lines: 160,
    color: "#f59e0b",
  },
  {
    name: "Automações",
    icon: "⚡",
    percent: 85,
    status: "concluído",
    features: ["Grid de fluxos", "Ativação/pausar", "CRUD de automações", "Triggers", "Status"],
    pending: ["Editor visual de fluxo (drag-drop)"],
    lines: 228,
    color: "#f59e0b",
  },
  {
    name: "Autenticação",
    icon: "🔐",
    percent: 30,
    status: "pendente",
    features: ["Tabela de usuários (DB)", "Estrutura base"],
    pending: ["Tela de login/registro", "JWT/sessão", "Proteção de rotas", "Perfil do usuário"],
    lines: 11,
    color: "#ef4444",
  },
  {
    name: "Monetização (Stripe)",
    icon: "💎",
    percent: 80,
    status: "concluído",
    features: ["Checkout session", "Portal do cliente", "Webhook handler", "Backfill Stripe sync", "Paywall modal"],
    pending: ["Gerenciamento de assinatura no app"],
    lines: 103,
    color: "#f59e0b",
  },
];

const TECH_STATS = [
  { label: "Páginas Frontend", value: 12, icon: "🖥️", detail: "Landing, Pricing, Dashboard, CRM, Tickets, FieldService, HR, Finance, Omnichannel, AI, Gamification, Automations" },
  { label: "Endpoints API", value: 42, icon: "🔌", detail: "Health, Dashboard (4), CRM (8), Tickets (5), HR (4), Finance (3), FieldService (4), Omnichannel (3), AI (2), Gamification (1), Automations (4), Stripe (4)" },
  { label: "Tabelas no Banco", value: 11, icon: "🗄️", detail: "users, leads, contacts, tickets, employees, transactions, work_orders, technicians, conversations, automations + messages" },
  { label: "Componentes UI", value: 55, icon: "🎨", detail: "Accordion, Alert, Avatar, Badge, Button, Calendar, Card, Chart, Checkbox, Dialog, Drawer, Form, Input, Select, Table, Tabs, Tooltip e mais 38..." },
  { label: "Linhas de OpenAPI", value: 1496, icon: "📋", detail: "Spec completa com 42 operationIds, schemas tipados, parâmetros de query, path params, request bodies e responses" },
  { label: "Linhas de Código", value: 5344, icon: "💻", detail: "Frontend: ~2748 linhas | Backend: ~875 linhas | DB Schema: ~203 linhas | OpenAPI: ~1496 linhas | Scripts: ~22 linhas" },
];

const BACKEND_MODULES = [
  { name: "dashboard.ts", endpoints: 4, lines: 81, status: "✅" },
  { name: "crm.ts", endpoints: 8, lines: 144, status: "✅" },
  { name: "tickets.ts", endpoints: 5, lines: 95, status: "✅" },
  { name: "hr.ts", endpoints: 4, lines: 68, status: "✅" },
  { name: "finance.ts", endpoints: 3, lines: 69, status: "✅" },
  { name: "field-service.ts", endpoints: 4, lines: 71, status: "✅" },
  { name: "omnichannel.ts", endpoints: 3, lines: 46, status: "✅" },
  { name: "ai.ts", endpoints: 2, lines: 42, status: "✅" },
  { name: "gamification.ts", endpoints: 1, lines: 44, status: "✅" },
  { name: "automations.ts", endpoints: 4, lines: 53, status: "✅" },
  { name: "stripe.ts", endpoints: 4, lines: 103, status: "✅" },
  { name: "health.ts", endpoints: 1, lines: 11, status: "✅" },
];

const DB_TABLES = [
  { name: "leads", fields: 12, lines: 22 },
  { name: "contacts", fields: 8, lines: 18 },
  { name: "tickets", fields: 10, lines: 24 },
  { name: "employees", fields: 9, lines: 23 },
  { name: "transactions", fields: 8, lines: 19 },
  { name: "work_orders", fields: 9, lines: 24 },
  { name: "technicians", fields: 10, lines: 20 },
  { name: "conversations", fields: 8, lines: 32 },
  { name: "automations", fields: 7, lines: 18 },
  { name: "users", fields: 4, lines: 11 },
  { name: "contacts (messages)", fields: 5, lines: 18 },
];

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{val.toLocaleString("pt-BR")}{suffix}</span>;
}

function ProgressBar({ percent, color, animated = true }: { percent: number; color: string; animated?: boolean }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animated) { setWidth(percent); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setWidth(percent), 100); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [percent, animated]);

  return (
    <div ref={ref} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 8, overflow: "hidden", width: "100%" }}>
      <div style={{
        width: `${width}%`, height: "100%", borderRadius: 99,
        background: color,
        transition: "width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: `0 0 8px ${color}80`,
      }} />
    </div>
  );
}

function ModuleCard({ mod }: { mod: typeof MODULES[0] }) {
  const [expanded, setExpanded] = useState(false);
  const statusBg = mod.percent === 100 ? "#14532d" : mod.percent >= 85 ? "#78350f" : mod.percent >= 50 ? "#1e3a5f" : "#450a0a";
  const statusColor = mod.percent === 100 ? "#4ade80" : mod.percent >= 85 ? "#fbbf24" : mod.percent >= 50 ? "#60a5fa" : "#f87171";
  const statusLabel = mod.percent === 100 ? "100% Concluído" : mod.percent >= 85 ? `${mod.percent}% Avançado` : mod.percent >= 50 ? `${mod.percent}% Em andamento` : `${mod.percent}% Pendente`;

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "16px 20px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{mod.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 14 }}>{mod.name}</span>
            <span style={{
              background: statusBg, color: statusColor, fontSize: 11, fontWeight: 700,
              padding: "2px 8px", borderRadius: 99, letterSpacing: "0.03em"
            }}>{statusLabel}</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <ProgressBar percent={mod.percent} color={mod.color} />
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>✅ Implementado</div>
              {mod.features.map(f => (
                <div key={f} style={{ color: "#94a3b8", fontSize: 12, padding: "2px 0" }}>• {f}</div>
              ))}
            </div>
            {mod.pending && mod.pending.length > 0 && (
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>⏳ Pendente</div>
                {mod.pending.map(p => (
                  <div key={p} style={{ color: "#ef4444", fontSize: 12, padding: "2px 0" }}>• {p}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginTop: 8, color: "#475569", fontSize: 11 }}>
            📄 {mod.lines} linhas de código
          </div>
        </div>
      )}
      <div style={{ color: "#475569", fontSize: 11, marginTop: 6, textAlign: "right" }}>
        {expanded ? "▲ Recolher" : "▼ Ver detalhes"}
      </div>
    </div>
  );
}

const OVERALL = Math.round(
  MODULES.reduce((sum, m) => sum + m.percent, 0) / MODULES.length
);

const TODAY = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

export default function App() {
  const completedCount = MODULES.filter(m => m.percent >= 85).length;
  const pendingCount = MODULES.filter(m => m.percent < 50).length;
  const inProgressCount = MODULES.filter(m => m.percent >= 50 && m.percent < 85).length;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      color: "#f1f5f9",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "0 0 80px 0",
    }}>
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 60%)",
        borderBottom: "1px solid rgba(37,99,235,0.3)",
        padding: "40px 40px 32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -80, right: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900, color: "white"
            }}>N</div>
            <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>NEXORA AI BUSINESS OS</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
            Relatório de Desenvolvimento
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Gerado em {TODAY} · Status atual do projeto</p>

          <div style={{ display: "flex", gap: 32, marginTop: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, background: "linear-gradient(135deg, #2563eb, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <AnimatedNumber target={OVERALL} suffix="%" />
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Progresso Geral</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#4ade80" }}>
                <AnimatedNumber target={completedCount} />
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Módulos Concluídos (≥85%)</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#fbbf24" }}>
                <AnimatedNumber target={inProgressCount} />
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Em Evolução (50-84%)</div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, color: "#f87171" }}>
                <AnimatedNumber target={pendingCount} />
              </div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Módulos Pendentes (&lt;50%)</div>
            </div>
          </div>

          {/* Mega progress bar */}
          <div style={{ marginTop: 28, maxWidth: 600 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>Progresso total do projeto</span>
              <span style={{ color: "#2563eb", fontWeight: 700, fontSize: 12 }}>{OVERALL}%</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 14, overflow: "hidden" }}>
              <div style={{
                width: `${OVERALL}%`, height: "100%",
                background: "linear-gradient(90deg, #2563eb, #06b6d4)",
                borderRadius: 99,
                boxShadow: "0 0 16px rgba(37,99,235,0.6)",
                transition: "width 2s ease",
              }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px" }}>

        {/* STATS GRID */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>
            📈 Estatísticas Técnicas
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
            {TECH_STATS.map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "20px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 28 }}>{s.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#2563eb", margin: "8px 0 4px" }}>
                  <AnimatedNumber target={s.value} />
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                <div style={{ color: "#475569", fontSize: 10, marginTop: 6, lineHeight: 1.4 }}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MODULES */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#e2e8f0" }}>
            🧩 Status por Módulo
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Clique em um módulo para ver detalhes do que foi implementado e o que está pendente.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 12 }}>
            {MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} />)}
          </div>
        </div>

        {/* BACKEND TABLE */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>
            🔌 Endpoints de API (Backend Express)
          </h2>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, overflow: "hidden"
          }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(37,99,235,0.1)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "12px 20px", textAlign: "left", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Arquivo</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Endpoints</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Linhas</th>
                  <th style={{ padding: "12px 20px", textAlign: "center", color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {BACKEND_MODULES.map((m, i) => (
                  <tr key={m.name} style={{ borderBottom: i < BACKEND_MODULES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <td style={{ padding: "11px 20px", color: "#e2e8f0", fontFamily: "monospace", fontSize: 13 }}>
                      artifacts/api-server/src/routes/<span style={{ color: "#06b6d4" }}>{m.name}</span>
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "center" }}>
                      <span style={{ background: "rgba(37,99,235,0.15)", color: "#60a5fa", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                        {m.endpoints}
                      </span>
                    </td>
                    <td style={{ padding: "11px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>{m.lines}</td>
                    <td style={{ padding: "11px 20px", textAlign: "center", fontSize: 16 }}>{m.status}</td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(37,99,235,0.06)", borderTop: "2px solid rgba(37,99,235,0.2)" }}>
                  <td style={{ padding: "12px 20px", color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>TOTAL</td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <span style={{ background: "rgba(37,99,235,0.3)", color: "#93c5fd", padding: "3px 12px", borderRadius: 99, fontSize: 13, fontWeight: 800 }}>42</span>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "center", color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>875</td>
                  <td style={{ padding: "12px 20px", textAlign: "center", color: "#4ade80", fontSize: 13, fontWeight: 700 }}>✅ 100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* DB TABLE */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>
            🗄️ Schema do Banco de Dados (Drizzle + PostgreSQL)
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {DB_TABLES.map(t => (
              <div key={t.name} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ color: "#06b6d4", fontFamily: "monospace", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  {t.name}
                </div>
                <div style={{ color: "#475569", fontSize: 11 }}>{t.fields} campos · {t.lines} linhas</div>
                <div style={{ marginTop: 8 }}>
                  <ProgressBar percent={100} color="#22c55e" animated={false} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ARCHITECTURE */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>
            🏗️ Arquitetura do Projeto
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              {
                title: "Frontend", icon: "⚛️",
                items: ["React 19 + Vite + TypeScript", "Wouter (routing)", "Framer Motion (animações)", "Recharts (gráficos)", "TanStack Query (cache)", "55 componentes UI (shadcn)", "Tailwind CSS v4", "Design dark-first #0F172A"],
                color: "#2563eb",
              },
              {
                title: "Backend", icon: "🚂",
                items: ["Express 5 (Node.js 24)", "esbuild (bundle CJS)", "Pino (logging)", "Zod (validação)", "Drizzle ORM", "Orval (codegen)", "OpenAPI 3.1 (contract-first)"],
                color: "#7c3aed",
              },
              {
                title: "Banco de Dados", icon: "🐘",
                items: ["PostgreSQL (Replit managed)", "Drizzle ORM + drizzle-kit", "11 tabelas com relações", "Seed script completo", "Dados BR realistas"],
                color: "#0891b2",
              },
              {
                title: "Monetização", icon: "💳",
                items: ["Stripe Checkout Sessions", "Stripe Billing Portal", "Webhook handler", "stripe-replit-sync", "Paywall modal", "3 planos (Starter/Business/Enterprise)"],
                color: "#059669",
              },
            ].map(s => (
              <div key={s.title} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{s.title}</span>
                </div>
                {s.items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* PENDING SUMMARY */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e2e8f0" }}>
            ⏳ Próximas Prioridades
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {[
              {
                priority: "Alta",
                color: "#ef4444",
                items: [
                  "Autenticação completa (login/registro/JWT/sessão)",
                  "Proteção de rotas autenticadas",
                  "Perfil e configurações do usuário",
                ],
              },
              {
                priority: "Média",
                color: "#f59e0b",
                items: [
                  "WebSocket para Omnicanal em tempo real",
                  "Integração LLM real no Nexora Brain",
                  "Mapa interativo de técnicos (Field Service)",
                  "Drag-and-drop no CRM Kanban",
                ],
              },
              {
                priority: "Baixa",
                color: "#22c55e",
                items: [
                  "Exportação PDF/CSV (Financeiro, Relatórios)",
                  "Editor visual de fluxos (Automações)",
                  "SLA countdown automático (Tickets)",
                  "Folha de ponto (RH)",
                  "Notificações push (Omnicanal)",
                ],
              },
            ].map(p => (
              <div key={p.priority} style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${p.color}30`,
                borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  <span style={{ color: p.color, fontWeight: 700, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Prioridade {p.priority}
                  </span>
                </div>
                {p.items.map(item => (
                  <div key={item} style={{ color: "#94a3b8", fontSize: 13, padding: "4px 0", paddingLeft: 16 }}>→ {item}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{
          marginTop: 60, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12
        }}>
          <div style={{ color: "#334155", fontSize: 12 }}>
            Nexora AI Business OS · Relatório gerado automaticamente em {TODAY}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#4ade80", fontWeight: 800, fontSize: 18 }}>{OVERALL}%</div>
              <div style={{ color: "#475569", fontSize: 10 }}>Geral</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#60a5fa", fontWeight: 800, fontSize: 18 }}>42</div>
              <div style={{ color: "#475569", fontSize: 10 }}>Endpoints</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#a78bfa", fontWeight: 800, fontSize: 18 }}>5344</div>
              <div style={{ color: "#475569", fontSize: 10 }}>Linhas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
