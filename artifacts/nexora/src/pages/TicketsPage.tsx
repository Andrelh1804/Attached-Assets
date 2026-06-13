import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Ticket, AlertTriangle, Clock, CheckCircle, Brain, X } from "lucide-react";
import { useGetTickets, useGetTicketStats, useCreateTicket, useUpdateTicket, getGetTicketsQueryKey, getGetTicketStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "Critico", color: "#EF4444" },
  high: { label: "Alto", color: "#F97316" },
  medium: { label: "Medio", color: "#F59E0B" },
  low: { label: "Baixo", color: "#10B981" },
};
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: "Aberto", color: "#2563EB", icon: Ticket },
  in_progress: { label: "Em andamento", color: "#F59E0B", icon: Clock },
  resolved: { label: "Resolvido", color: "#10B981", icon: CheckCircle },
};
const SLA_CONFIG: Record<string, { color: string; label: string }> = {
  ok: { color: "#10B981", label: "OK" },
  warning: { color: "#F59E0B", label: "Atencao" },
  breached: { color: "#EF4444", label: "Violado" },
};

function NewTicketModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createTicket = useCreateTicket();
  const [form, setForm] = useState({ title: "", priority: "medium", category: "general", customerName: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket.mutate({ data: form }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTicketsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTicketStatsQueryKey() });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Chamado</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Titulo *</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoria</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                {["general", "network", "hardware", "software", "billing"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Cliente</label>
            <input value={form.customerName} onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Descricao</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={createTicket.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {createTicket.isPending ? "Criando..." : "Criar Chamado"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function TicketsPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: tickets, isLoading } = useGetTickets({ status: status || undefined, search: search || undefined });
  const { data: stats } = useGetTicketStats();
  const updateTicket = useUpdateTicket();
  const queryClient = useQueryClient();

  const resolveTicket = (id: number) => {
    updateTicket.mutate({ id, data: { status: "resolved" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTicketsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTicketStatsQueryKey() });
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mesa de Servico</h1>
          <p className="text-slate-500 text-sm">
            R$ {((stats?.contractsProtectedValue ?? 0) / 1000).toFixed(0)}k em contratos protegidos pelos atendimentos
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
          <Plus size={14} /> Novo Chamado
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats?.total ?? 0, color: "#64748b", filter: "" },
          { label: "Abertos", value: stats?.open ?? 0, color: "#2563EB", filter: "open" },
          { label: "Em andamento", value: stats?.inProgress ?? 0, color: "#F59E0B", filter: "in_progress" },
          { label: "Resolvidos", value: stats?.resolved ?? 0, color: "#10B981", filter: "resolved" },
          { label: "SLA Violado", value: stats?.slaBreached ?? 0, color: "#EF4444", filter: "" },
        ].map(s => (
          <button key={s.label} onClick={() => setStatus(s.filter)}
            className="nexora-card p-3 text-left transition-all"
            style={{ borderColor: status === s.filter ? `${s.color}60` : undefined }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar chamados..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
            style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
        </div>
        {status && <button onClick={() => setStatus("")} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition-colors" style={{ border: "1px solid hsl(217 33% 26%)" }}>
          <X size={12} /> Limpar filtro
        </button>}
      </div>

      {/* Table */}
      <div className="nexora-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid hsl(217 33% 22%)" }}>
              {["ID", "Titulo", "Prioridade", "SLA", "Status", "Cliente", "Agente", "IA", "Acao"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">Carregando chamados...</td></tr>
            ) : (tickets ?? []).length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-600">Nenhum chamado encontrado</td></tr>
            ) : (tickets ?? []).map(ticket => {
              const prio = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium;
              const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
              const sla = SLA_CONFIG[ticket.slaStatus ?? "ok"] ?? SLA_CONFIG.ok;
              return (
                <motion.tr key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid hsl(217 33% 19%)" }}>
                  <td className="px-4 py-3 text-slate-500 text-xs">#{ticket.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-200 text-sm font-medium truncate max-w-48">{ticket.title}</p>
                    <p className="text-slate-600 text-xs">{ticket.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${prio.color}18`, color: prio.color }}>{prio.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${sla.color}18`, color: sla.color }}>{sla.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <st.icon size={12} style={{ color: st.color }} />
                      <span className="text-xs" style={{ color: st.color }}>{st.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{ticket.customerName ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{ticket.assignedTo ?? "—"}</td>
                  <td className="px-4 py-3">
                    {ticket.aiSuggestedResponse ? (
                      <div className="flex items-center gap-1 text-xs text-cyan-400">
                        <Brain size={11} /> Sugestao
                      </div>
                    ) : <span className="text-slate-700 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {ticket.status !== "resolved" && (
                      <button onClick={() => resolveTicket(ticket.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        style={{ background: "rgba(16,185,129,0.1)" }}>
                        <CheckCircle size={11} /> Resolver
                      </button>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && <NewTicketModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
