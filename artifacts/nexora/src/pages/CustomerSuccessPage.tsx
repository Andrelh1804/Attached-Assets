import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Heart, AlertTriangle, TrendingUp, TrendingDown, Users, Star,
  MessageSquare, Phone, Mail, ChevronRight, Plus, X
} from "lucide-react";
import {
  useGetClientHealthScores, useGetNpsData, useGetChurnRisk,
  useGetCustomerSuccessSummary, useCreateNpsResponse
} from "@workspace/api-client-react";

const riskConfig = {
  critical: { label: "Crítico", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  high: { label: "Alto", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  medium: { label: "Médio", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  low: { label: "Baixo", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

function HealthBar({ score }: { score: number }) {
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#2563EB" : score >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "hsl(217 33% 22%)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-semibold w-7 text-right flex-shrink-0" style={{ color }}>{Math.round(score)}</span>
    </div>
  );
}

function NpsModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ clientName: "", clientEmail: "", score: 7, comment: "" });
  const mutation = useCreateNpsResponse();

  const submit = () => {
    mutation.mutate({ data: form }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "hsl(217 33% 14%)", border: "1px solid hsl(217 33% 24%)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Registrar Resposta NPS</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <input
            placeholder="Nome do cliente"
            value={form.clientName}
            onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-transparent outline-none"
            style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 26%)" }}
          />
          <input
            placeholder="Email"
            value={form.clientEmail}
            onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 bg-transparent outline-none"
            style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 26%)" }}
          />
          <div>
            <p className="text-slate-400 text-xs mb-2">Nota NPS (0-10): <span className="text-white font-bold">{form.score}</span></p>
            <input type="range" min="0" max="10" value={form.score} onChange={e => setForm(f => ({ ...f, score: parseInt(e.target.value) }))}
              className="w-full accent-blue-500" />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0 — Detrator</span><span>10 — Promotor</span>
            </div>
          </div>
          <textarea
            placeholder="Comentário (opcional)"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 resize-none outline-none"
            style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 26%)" }}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors" style={{ background: "hsl(217 33% 19%)" }}>
            Cancelar
          </button>
          <button onClick={submit} disabled={mutation.isPending || !form.clientName || !form.clientEmail}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CustomerSuccessPage() {
  const [tab, setTab] = useState<"overview" | "nps" | "churn">("overview");
  const [npsModal, setNpsModal] = useState(false);

  const { data: clients } = useGetClientHealthScores();
  const { data: npsData } = useGetNpsData();
  const { data: churnRisk } = useGetChurnRisk();
  const { data: summary } = useGetCustomerSuccessSummary();

  const npsBarData = [
    { name: "Promotores", value: npsData?.summary?.promoters ?? 0, color: "#10B981" },
    { name: "Neutros", value: npsData?.summary?.neutrals ?? 0, color: "#F59E0B" },
    { name: "Detratores", value: npsData?.summary?.detractors ?? 0, color: "#EF4444" },
  ];

  return (
    <div className="p-6 space-y-6">
      {npsModal && <NpsModal onClose={() => setNpsModal(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart size={22} className="text-pink-400" /> Customer Success
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Retenção, saúde e satisfação dos seus clientes</p>
        </div>
        <button onClick={() => setNpsModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">
          <Plus size={14} /> Registrar NPS
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Health Score Médio", value: `${summary?.avgHealthScore ?? 64}`, unit: "/100", color: "#10B981", icon: Heart },
          { label: "NPS Score", value: `${summary?.npsScore ?? 42}`, unit: "pts", color: "#2563EB", icon: Star },
          { label: "Clientes em Risco", value: `${summary?.clientsAtRisk ?? 2}`, unit: "crítico", color: "#EF4444", icon: AlertTriangle },
          { label: "Churn Rate Mês", value: `${summary?.churnRateMonth ?? 1.8}`, unit: "%", color: "#F59E0B", icon: TrendingDown },
        ].map(card => (
          <motion.div key={card.label} whileHover={{ y: -2 }} className="nexora-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}<span className="text-slate-500 text-sm ml-1">{card.unit}</span></p>
            <p className="text-slate-500 text-xs mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "hsl(217 33% 14%)" }}>
        {[
          { key: "overview", label: "Saúde dos Clientes" },
          { key: "nps", label: "NPS" },
          { key: "churn", label: "Risco de Churn" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="nexora-card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "hsl(217 33% 22%)" }}>
            <p className="text-white font-semibold">Health Score por Cliente</p>
            <p className="text-slate-500 text-xs">{clients?.length ?? 0} clientes</p>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(217 33% 18%)" }}>
            {(clients ?? []).map((client: any) => {
              const risk = riskConfig[client.churnRisk as keyof typeof riskConfig] ?? riskConfig.low;
              return (
                <div key={client.id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-600/20 text-blue-400">
                    {client.clientName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{client.clientName}</p>
                    <p className="text-slate-600 text-xs truncate">{client.clientEmail}</p>
                  </div>
                  <div className="w-36">
                    <HealthBar score={client.healthScore} />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ background: risk.bg, color: risk.color }}>
                    {risk.label}
                  </span>
                  {client.notes && (
                    <p className="text-slate-600 text-xs max-w-[200px] truncate hidden lg:block">{client.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NPS Tab */}
      {tab === "nps" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="nexora-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold">Distribuição NPS</p>
                <p className="text-slate-500 text-xs">Total de {npsData?.summary?.total ?? 0} respostas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: (npsData?.summary?.npsScore ?? 0) >= 50 ? "#10B981" : (npsData?.summary?.npsScore ?? 0) >= 0 ? "#F59E0B" : "#EF4444" }}>
                  {npsData?.summary?.npsScore ?? 0}
                </p>
                <p className="text-slate-500 text-xs">NPS Score</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={npsBarData} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 24%)", borderRadius: "8px", color: "white" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {npsBarData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              {npsBarData.map(b => (
                <div key={b.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                  <span className="text-slate-500 text-xs">{b.name}: {b.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="nexora-card overflow-hidden">
            <div className="px-4 py-3 border-b" style={{ borderColor: "hsl(217 33% 22%)" }}>
              <p className="text-white font-semibold text-sm">Últimas Respostas</p>
            </div>
            <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: "hsl(217 33% 18%)" }}>
              {(npsData?.responses ?? []).slice(0, 10).map((r: any) => (
                <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: r.score >= 9 ? "rgba(16,185,129,0.15)" : r.score <= 6 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", color: r.score >= 9 ? "#10B981" : r.score <= 6 ? "#EF4444" : "#F59E0B" }}>
                    {r.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs font-medium truncate">{r.clientName}</p>
                    {r.comment && <p className="text-slate-600 text-xs truncate">{r.comment}</p>}
                  </div>
                  <p className="text-slate-600 text-xs flex-shrink-0">{new Date(r.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              ))}
              {(npsData?.responses ?? []).length === 0 && (
                <div className="px-4 py-8 text-center text-slate-600 text-sm">
                  Nenhuma resposta NPS ainda. Use "+ Registrar NPS" para adicionar.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Churn Risk Tab */}
      {tab === "churn" && (
        <div className="space-y-3">
          {(churnRisk ?? []).map((client: any, i: number) => {
            const risk = riskConfig[client.churnRisk as keyof typeof riskConfig] ?? riskConfig.medium;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="nexora-card p-5"
                style={{ borderLeft: `3px solid ${risk.color}` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold text-sm">{client.clientName}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: risk.bg, color: risk.color }}>
                        {risk.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mb-2">{client.clientEmail} · Sem contato há {client.daysWithoutContact} dias · Score: {client.healthScore}</p>
                    <p className="text-slate-400 text-xs mb-2"><span className="text-slate-500">Motivo:</span> {client.reason}</p>
                    <div className="flex items-start gap-1.5 p-2 rounded-lg" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}>
                      <ChevronRight size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-300 text-xs">{client.recommendedAction}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors">
                      <Phone size={11} /> Ligar
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white transition-colors" style={{ background: "hsl(217 33% 20%)" }}>
                      <Mail size={11} /> Email
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {(churnRisk ?? []).length === 0 && (
            <div className="nexora-card p-12 text-center text-slate-500">
              Nenhum cliente em risco de churn identificado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
