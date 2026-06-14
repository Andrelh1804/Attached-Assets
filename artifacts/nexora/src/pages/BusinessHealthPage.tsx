import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Activity, TrendingUp, TrendingDown, Minus, Award, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useGetBusinessHealthScore, useGetBusinessHealthHistory } from "@workspace/api-client-react";

const classificationConfig = {
  excellent: { label: "Excelente", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", icon: Award },
  good: { label: "Bom", color: "#2563EB", bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.3)", icon: CheckCircle },
  attention: { label: "Atenção", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: Clock },
  critical: { label: "Crítico", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", icon: AlertTriangle },
};

function ScoreGauge({ score, classification }: { score: number; classification: string }) {
  const cfg = classificationConfig[classification as keyof typeof classificationConfig] ?? classificationConfig.good;
  const data = [{ value: score, fill: cfg.color }];

  return (
    <div className="flex flex-col items-center gap-2">
      <RadialBarChart width={220} height={120} cx={110} cy={110} innerRadius={70} outerRadius={100} barSize={16} data={data} startAngle={180} endAngle={0}>
        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "hsl(217 33% 18%)" }} />
      </RadialBarChart>
      <div className="-mt-14 text-center">
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-5xl font-black"
          style={{ color: cfg.color }}
        >
          {score}
        </motion.p>
        <p className="text-slate-500 text-sm">/ 100</p>
      </div>
      <div className="mt-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
        <cfg.icon size={13} className="inline mr-1.5 mb-0.5" />
        {cfg.label}
      </div>
    </div>
  );
}

function DimensionCard({ label, score, weight, trend }: { label: string; score: number; weight: number; trend: string }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#2563EB" : score >= 40 ? "#F59E0B" : "#EF4444";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="p-4 rounded-xl"
      style={{ background: "hsl(217 33% 14%)", border: "1px solid hsl(217 33% 22%)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <TrendIcon size={11} style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#64748B" }} />
          <span className="text-slate-600 text-xs">peso {weight}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold mb-2" style={{ color }}>{score}</p>
      <div className="h-1.5 rounded-full" style={{ background: "hsl(217 33% 22%)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

export default function BusinessHealthPage() {
  const { data: bhs, isLoading } = useGetBusinessHealthScore();
  const { data: history } = useGetBusinessHealthHistory();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3 text-slate-400">
        <Activity size={18} className="animate-pulse text-cyan-400" />
        Calculando Business Health Score™...
      </div>
    );
  }

  const classification = (bhs?.classification ?? "good") as keyof typeof classificationConfig;
  const cfg = classificationConfig[classification] ?? classificationConfig.good;
  const dimensions = bhs?.dimensions ?? {};
  const computed = bhs?.computed ?? {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🧠</span> Business Health Score™
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Motor proprietário de inteligência empresarial · atualizado agora</p>
        </div>
        <div className="text-xs text-slate-600">
          Snapshot: {bhs?.snapshotAt ? new Date(bhs.snapshotAt).toLocaleTimeString("pt-BR") : "—"}
        </div>
      </div>

      {/* Main Score Card */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="nexora-card p-6 flex flex-col items-center justify-center gap-4">
          <ScoreGauge score={bhs?.score ?? 0} classification={classification} />
          <div className="text-center">
            <p className="text-slate-400 text-sm">Pontuação Global</p>
            <p className="text-slate-600 text-xs mt-0.5">Baseada em 6 dimensões ponderadas</p>
          </div>
        </div>

        {/* KPIs Computed */}
        <div className="lg:col-span-2 nexora-card p-5 grid grid-cols-3 gap-4">
          {[
            { label: "Conversão", value: `${computed.conversionRate ?? 0}%`, color: "#10B981" },
            { label: "SLA Compliance", value: `${computed.slaCompliance ?? 0}%`, color: "#2563EB" },
            { label: "Crescimento Receita", value: `${computed.revenueGrowth ?? 0}%`, color: computed.revenueGrowth > 0 ? "#10B981" : "#EF4444" },
            { label: "Produtividade", value: `${computed.avgProductivity ?? 0}%`, color: "#8B5CF6" },
            { label: "NPS Médio", value: `${computed.npsAvg ?? 0}/10`, color: "#06B6D4" },
            { label: "MRR Total", value: `R$ ${((computed.mrrTotal ?? 0) / 1000).toFixed(0)}k`, color: "#F59E0B" },
          ].map(kpi => (
            <div key={kpi.label} className="p-3 rounded-lg text-center" style={{ background: "hsl(217 33% 17%)" }}>
              <p className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div>
        <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider text-slate-400">Dimensões</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(dimensions).map(([key, dim]: [string, any]) => (
            <DimensionCard
              key={key}
              label={dim.label}
              score={dim.score}
              weight={dim.weight}
              trend={dim.trend}
            />
          ))}
        </div>
      </div>

      {/* Historical Chart */}
      <div className="nexora-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold">Evolução do Score</p>
            <p className="text-slate-500 text-xs">Últimas 8 semanas</p>
          </div>
          <div className="px-2 py-1 rounded text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={history ?? []}>
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 24%)", borderRadius: "8px", color: "white" }}
              formatter={(v: number) => [Math.round(v), "Score"]}
            />
            <Line type="monotone" dataKey="score" stroke="#06B6D4" strokeWidth={2.5} dot={{ fill: "#06B6D4", r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Classification Legend */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(classificationConfig).map(([key, cfg]) => (
          <div key={key} className="p-3 rounded-xl text-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <cfg.icon size={16} className="mx-auto mb-1" style={{ color: cfg.color }} />
            <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-slate-600 text-xs mt-0.5">
              {key === "excellent" ? "≥ 80" : key === "good" ? "60–79" : key === "attention" ? "40–59" : "< 40"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
