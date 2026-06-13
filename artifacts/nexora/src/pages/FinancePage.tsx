import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetFinanceOverview, useGetTransactions, useGetCashflowChart, useCreateTransaction, getGetTransactionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

function NewTransactionModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createTx = useCreateTransaction();
  const [form, setForm] = useState({ type: "income", amount: "", description: "", category: "sales", date: new Date().toISOString().slice(0, 10) });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createTx.mutate({ data: { ...form, amount: Number(form.amount) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey() }); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Nova Transacao</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setForm(p => ({ ...p, type: "income" }))}
              className="py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: form.type === "income" ? "rgba(16,185,129,0.2)" : "hsl(217 33% 20%)", border: `1px solid ${form.type === "income" ? "#10B981" : "hsl(217 33% 26%)"}`, color: form.type === "income" ? "#10B981" : "#94a3b8" }}>
              Entrada
            </button>
            <button type="button" onClick={() => setForm(p => ({ ...p, type: "expense" }))}
              className="py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: form.type === "expense" ? "rgba(239,68,68,0.2)" : "hsl(217 33% 20%)", border: `1px solid ${form.type === "expense" ? "#EF4444" : "hsl(217 33% 26%)"}`, color: form.type === "expense" ? "#EF4444" : "#94a3b8" }}>
              Saida
            </button>
          </div>
          {[{ k: "description", l: "Descricao *", t: "text", r: true }, { k: "amount", l: "Valor (R$) *", t: "number", r: true }, { k: "date", l: "Data *", t: "date", r: true }].map(f => (
            <div key={f.k}>
              <label className="text-slate-400 text-xs mb-1 block">{f.l}</label>
              <input required={f.r} type={f.t} value={(form as Record<string, string>)[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
            </div>
          ))}
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
              {["sales", "subscription", "service", "payroll", "infrastructure", "marketing", "other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={createTx.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {createTx.isPending ? "Salvando..." : "Registrar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function FinancePage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: overview } = useGetFinanceOverview();
  const { data: transactions, isLoading } = useGetTransactions({ type: typeFilter || undefined });
  const { data: cashflow } = useGetCashflowChart();

  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="text-slate-500 text-sm">Visao completa do fluxo financeiro</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
          <Plus size={14} /> Nova Transacao
        </button>
      </div>

      {/* Balance Hero */}
      <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.1))", border: "1px solid rgba(37,99,235,0.3)" }}>
        <p className="text-slate-400 text-sm mb-1">Saldo em Conta</p>
        <p className="text-4xl font-black text-white mb-1">{fmtBRL(overview?.balance ?? 1240500)}</p>
        <div className="flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp size={14} /> +{overview?.revenueChange ?? 14.2}% este mes
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receita do Mes", value: fmtBRL(overview?.revenue ?? 0), color: "#10B981", icon: ArrowUpRight, trend: "+" },
          { label: "Despesas do Mes", value: fmtBRL(overview?.expenses ?? 0), color: "#EF4444", icon: ArrowDownRight, trend: "-" },
          { label: "Lucro Liq.", value: fmtBRL(overview?.profit ?? 0), color: "#2563EB", icon: DollarSign },
          { label: "A Receber", value: fmtBRL(overview?.pendingReceivables ?? 0), color: "#F59E0B", icon: DollarSign },
        ].map(card => (
          <div key={card.label} className="nexora-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-xs">{card.label}</p>
              <card.icon size={14} style={{ color: card.color }} />
            </div>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Cashflow Chart */}
      <div className="nexora-card p-5">
        <p className="text-white font-semibold mb-4">Fluxo de Caixa — 12 meses</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cashflow ?? []}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "none", borderRadius: "8px", color: "white" }}
              formatter={(v: number) => [fmtBRL(v), ""]} />
            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#incGrad)" name="Entradas" />
            <Area type="monotone" dataKey="secondary" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" name="Saidas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions */}
      <div className="nexora-card overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b" style={{ borderColor: "hsl(217 33% 22%)" }}>
          <p className="text-white font-semibold">Lancamentos Recentes</p>
          <div className="flex gap-2">
            {[{ k: "", l: "Todos" }, { k: "income", l: "Entradas" }, { k: "expense", l: "Saidas" }].map(f => (
              <button key={f.k} onClick={() => setTypeFilter(f.k)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: typeFilter === f.k ? "rgba(37,99,235,0.2)" : "transparent", color: typeFilter === f.k ? "#60a5fa" : "#64748b", border: `1px solid ${typeFilter === f.k ? "rgba(37,99,235,0.4)" : "transparent"}` }}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y" style={{ borderColor: "hsl(217 33% 19%)" }}>
          {isLoading ? <p className="p-6 text-slate-500 text-sm">Carregando...</p> :
            (transactions ?? []).slice(0, 10).map(tx => (
              <div key={tx.id} className="px-4 py-3 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0`}
                  style={{ background: tx.type === "income" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
                  {tx.type === "income"
                    ? <ArrowUpRight size={14} style={{ color: "#10B981" }} />
                    : <ArrowDownRight size={14} style={{ color: "#EF4444" }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-slate-600 text-xs">{tx.category} • {tx.date}</p>
                </div>
                <p className="font-semibold text-sm flex-shrink-0" style={{ color: tx.type === "income" ? "#10B981" : "#EF4444" }}>
                  {tx.type === "income" ? "+" : "-"}{fmtBRL(tx.amount)}
                </p>
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: tx.status === "completed" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: tx.status === "completed" ? "#10B981" : "#F59E0B" }}>{tx.status}</span>
              </div>
            ))}
          {!isLoading && (transactions ?? []).length === 0 && <p className="p-8 text-center text-slate-600">Nenhuma transacao encontrada</p>}
        </div>
      </div>

      {showModal && <NewTransactionModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
