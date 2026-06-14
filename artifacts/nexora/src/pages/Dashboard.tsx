import { useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import {
  TrendingUp, TrendingDown, Ticket, FileText, Users, BarChart3,
  Brain, AlertTriangle, CheckCircle, Activity, ArrowRight, ChevronRight
} from "lucide-react";
import {
  useGetDashboardMetrics, useGetRevenueChart, useGetBusinessHealth, useGetRecentActivity
} from "@workspace/api-client-react";

function MetricCard({ label, value, sub, trend, icon: Icon, color, href }: {
  label: string; value: string; sub: string; trend?: number; icon: React.ElementType; color: string; href?: string;
}) {
  const card = (
    <motion.div
      whileHover={{ y: -2, borderColor: `${color}40` }}
      className="metric-card flex flex-col gap-3 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-xs mt-0.5">{label}</p>
      </div>
      <p className="text-xs text-slate-500 border-t pt-2" style={{ borderColor: "hsl(217 33% 22%)" }}>{sub}</p>
    </motion.div>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function HealthGauge({ value }: { value: number }) {
  const color = value >= 80 ? "#10B981" : value >= 60 ? "#F59E0B" : "#EF4444";
  const data = [{ value, fill: color }];
  return (
    <div className="flex flex-col items-center">
      <RadialBarChart width={160} height={90} cx={80} cy={80} innerRadius={50} outerRadius={75} barSize={12} data={data} startAngle={180} endAngle={0}>
        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "hsl(217 33% 20%)" }} />
      </RadialBarChart>
      <div className="-mt-10 text-center">
        <p className="text-3xl font-black" style={{ color }}>{value}</p>
        <p className="text-slate-500 text-xs">/ 100</p>
      </div>
    </div>
  );
}

const activityIcons: Record<string, React.ElementType> = {
  lead: Users, ticket: Ticket, finance: BarChart3, hr: Users, ai: Brain, field: CheckCircle,
};

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useGetDashboardMetrics();
  const { data: revenueChart } = useGetRevenueChart();
  const { data: health } = useGetBusinessHealth();
  const { data: activity } = useGetRecentActivity();

  const fmtR = (n: number) => `R$ ${(n / 1000).toFixed(0)}k`;

  if (metricsLoading) {
    return <div className="p-8 flex items-center gap-2 text-slate-400"><Activity size={16} className="animate-pulse" /> Carregando painel executivo...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Executivo</h1>
          <p className="text-slate-500 text-sm mt-0.5">Visão em tempo real da sua empresa — {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-emerald-400" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Ao vivo
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Receita do Mês"
          value={`R$ ${((metrics?.revenue ?? 342800) / 1000).toFixed(0)}k`}
          sub={`+${metrics?.revenueChange ?? 12.5}% vs. mês anterior`}
          trend={metrics?.revenueChange ?? 12.5}
          icon={TrendingUp}
          color="#10B981"
          href="/app/finance"
        />
        <MetricCard
          label="Contratos Protegidos"
          value={`R$ ${((metrics?.contractsProtected ?? 142000) / 1000).toFixed(0)}k`}
          sub={`${metrics?.openTickets ?? 0} chamados ativos gerando proteção`}
          icon={FileText}
          color="#2563EB"
          href="/app/contracts"
        />
        <MetricCard
          label="Produtividade da Equipe"
          value={`${metrics?.teamProductivity ?? 92}%`}
          sub="Equipe operando com máxima eficiência"
          trend={3.2}
          icon={Users}
          color="#06B6D4"
          href="/app/hr"
        />
        <MetricCard
          label="Conformidade de SLA"
          value={`${metrics?.slaCompliance ?? 94.3}%`}
          sub={`${metrics?.aiInsightsCount ?? 7} alertas da IA hoje`}
          trend={1.8}
          icon={BarChart3}
          color="#8B5CF6"
          href="/app/tickets"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 nexora-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-semibold">Receita Anual</p>
              <p className="text-slate-500 text-xs">Últimos 12 meses</p>
            </div>
            <Link href="/app/finance">
              <button className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">Ver detalhes <ChevronRight size={12} /></button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueChart ?? []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="secGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 24%)", borderRadius: "8px", color: "white" }}
                formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" name="Receita" />
              <Area type="monotone" dataKey="secondary" stroke="#06B6D4" strokeWidth={2} fill="url(#secGrad)" name="Meta" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Score */}
        <div className="nexora-card p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold">Saúde Empresarial</p>
            <Link href="/app/health-score">
              <button className="text-blue-400 text-xs hover:text-blue-300 flex items-center gap-1">Detalhes <ChevronRight size={12} /></button>
            </Link>
          </div>
          <p className="text-slate-500 text-xs mb-4">Pontuacao 0-100</p>
          <HealthGauge value={health?.score ?? 82} />
          <div className="mt-4 space-y-2.5">
            {health && [
              { label: "Financeiro", value: health.financial, color: "#10B981" },
              { label: "Comercial", value: health.commercial, color: "#2563EB" },
              { label: "Suporte", value: health.support, color: "#06B6D4" },
              { label: "RH", value: health.hr, color: "#8B5CF6" },
              { label: "Operações", value: health.operations, color: "#F59E0B" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-slate-500 text-xs w-20 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(217 33% 22%)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, background: item.color }} />
                </div>
                <span className="text-slate-400 text-xs w-7 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Activity Feed */}
        <div className="nexora-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">Atividade Recente</p>
            <Activity size={14} className="text-slate-500" />
          </div>
          <div className="space-y-3">
            {(activity ?? []).slice(0, 6).map(item => {
              const Icon = activityIcons[item.type] ?? Activity;
              const colorMap: Record<string, string> = { cyan: "#06B6D4", green: "#10B981", blue: "#2563EB", purple: "#8B5CF6", amber: "#F59E0B" };
              const color = colorMap[item.color ?? "cyan"] ?? "#06B6D4";
              return (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs leading-relaxed">{item.description}</p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      {Math.round((Date.now() - new Date(item.timestamp).getTime()) / 60000)}min atrás
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="nexora-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={16} style={{ color: "#06B6D4" }} />
              <p className="text-white font-semibold">Nexora Brain — Alertas</p>
            </div>
            <Link href="/app/ai">
              <button className="text-cyan-400 text-xs hover:text-cyan-300 flex items-center gap-1">Ver todos <ArrowRight size={12} /></button>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { type: "risk", title: "3 contratos em risco de cancelamento", desc: "Receita em risco: R$ 87.400. Ação imediata recomendada.", color: "#EF4444", icon: AlertTriangle },
              { type: "opportunity", title: "12 clientes com potencial de upsell", desc: "Padrão de crescimento identificado no segmento Solar.", color: "#10B981", icon: TrendingUp },
              { type: "bottleneck", title: "Gargalo detectado: Categoria Redes", desc: "68% dos chamados. Tempo de resolução 2x acima da meta.", color: "#F59E0B", icon: AlertTriangle },
            ].map((insight, i) => (
              <div key={i} className="p-3 rounded-lg flex items-start gap-3" style={{ background: `${insight.color}0A`, border: `1px solid ${insight.color}20` }}>
                <insight.icon size={14} style={{ color: insight.color, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p className="text-slate-200 text-xs font-medium">{insight.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{insight.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/app/ai">
            <button className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium text-cyan-400 hover:text-cyan-300 border transition-colors" style={{ borderColor: "rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.05)" }}>
              Abrir Nexora Brain
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
