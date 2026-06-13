import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, User, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import { useGetWorkOrders, useGetTechnicians, useCreateWorkOrder, useUpdateWorkOrder, getGetWorkOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "#64748b", icon: Clock },
  in_progress: { label: "Em andamento", color: "#F59E0B", icon: AlertCircle },
  completed: { label: "Concluido", color: "#10B981", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "#EF4444", icon: X },
};
const PRIO_COLOR: Record<string, string> = { critical: "#EF4444", high: "#F97316", medium: "#F59E0B", low: "#10B981" };
const TECH_STATUS: Record<string, { color: string; label: string }> = {
  available: { color: "#10B981", label: "Disponivel" },
  busy: { color: "#F59E0B", label: "Ocupado" },
  "en-route": { color: "#2563EB", label: "Em rota" },
  offline: { color: "#64748b", label: "Offline" },
};

function NewOrderModal({ techs, onClose }: { techs: { id: number; name: string }[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createOrder = useCreateWorkOrder();
  const [form, setForm] = useState({ title: "", priority: "medium", technicianId: String(techs[0]?.id ?? 1), address: "", customerName: "", scheduledAt: new Date().toISOString().slice(0, 16) });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrder.mutate({ data: { ...form, technicianId: Number(form.technicianId), scheduledAt: new Date(form.scheduledAt).toISOString() } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetWorkOrdersQueryKey() }); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Nova Ordem de Servico</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[{ k: "title", l: "Titulo *", t: "text", r: true }, { k: "customerName", l: "Cliente", t: "text" }, { k: "address", l: "Endereco *", t: "text", r: true }].map(f => (
            <div key={f.k}>
              <label className="text-slate-400 text-xs mb-1 block">{f.l}</label>
              <input required={f.r} type={f.t} value={(form as Record<string, string>)[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Prioridade</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                {Object.entries(PRIO_COLOR).map(([k]) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Tecnico</label>
              <select value={form.technicianId} onChange={e => setForm(p => ({ ...p, technicianId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                {techs.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Data/Hora Agendada</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={createOrder.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {createOrder.isPending ? "Criando..." : "Criar OS"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function FieldServicePage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: orders, isLoading } = useGetWorkOrders({ status: statusFilter || undefined });
  const { data: technicians } = useGetTechnicians();
  const updateOrder = useUpdateWorkOrder();
  const queryClient = useQueryClient();

  const completeOrder = (id: number) => {
    updateOrder.mutate({ id, data: { status: "completed", completedAt: new Date().toISOString() } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetWorkOrdersQueryKey() })
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Field Service</h1>
          <p className="text-slate-500 text-sm">{technicians?.filter(t => t.status === "available").length ?? 0} tecnicos disponiveis • {orders?.length ?? 0} ordens de servico</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
          <Plus size={14} /> Nova OS
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Technicians */}
        <div className="space-y-3">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tecnicos em Campo</p>
          {(technicians ?? []).map(tech => {
            const st = TECH_STATUS[tech.status] ?? TECH_STATUS.offline;
            const initials = tech.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <motion.div key={tech.id} whileHover={{ x: 2 }}
                className="p-4 rounded-xl flex items-center gap-3"
                style={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)" }}>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-blue-600">{initials}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900" style={{ background: st.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{tech.name}</p>
                  <p className="text-xs" style={{ color: st.color }}>{st.label}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-bold">{tech.completedToday}/{tech.ordersToday}</p>
                  <p className="text-slate-600 text-xs">OS hoje</p>
                </div>
              </motion.div>
            );
          })}
          {(technicians ?? []).length === 0 && <p className="text-slate-600 text-sm">Sem tecnicos cadastrados</p>}
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-2">Ordens:</p>
            {[{ k: "", l: "Todas" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ k, l: v.label }))].map(f => (
              <button key={f.k} onClick={() => setStatusFilter(f.k)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{ background: statusFilter === f.k ? "rgba(37,99,235,0.2)" : "hsl(217 33% 20%)", color: statusFilter === f.k ? "#60a5fa" : "#94a3b8", border: `1px solid ${statusFilter === f.k ? "rgba(37,99,235,0.4)" : "hsl(217 33% 26%)"}` }}>
                {f.l}
              </button>
            ))}
          </div>

          {isLoading ? <p className="text-slate-500">Carregando...</p> :
            <div className="space-y-3">
              {(orders ?? []).map(order => {
                const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const prioColor = PRIO_COLOR[order.priority] ?? "#F59E0B";
                return (
                  <motion.div key={order.id} layout className="p-4 rounded-xl"
                    style={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)" }}
                    whileHover={{ borderColor: "hsl(217 33% 28%)" }}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-500 text-xs">OS #{order.id}</span>
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{ background: `${prioColor}18`, color: prioColor }}>{order.priority}</span>
                        </div>
                        <p className="text-white font-medium text-sm">{order.title}</p>
                        {order.customerName && <p className="text-slate-500 text-xs mt-0.5">{order.customerName}</p>}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <st.icon size={13} style={{ color: st.color }} />
                        <span className="text-xs" style={{ color: st.color }}>{st.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1"><MapPin size={11} />{order.address.slice(0, 30)}...</div>
                      <div className="flex items-center gap-1"><User size={11} />{order.technicianName ?? `Tecnico #${order.technicianId}`}</div>
                      <div className="flex items-center gap-1"><Clock size={11} />{new Date(order.scheduledAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                    {order.status !== "completed" && order.status !== "cancelled" && (
                      <button onClick={() => completeOrder(order.id)}
                        className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <CheckCircle size={11} /> Marcar como Concluido
                      </button>
                    )}
                  </motion.div>
                );
              })}
              {(orders ?? []).length === 0 && <p className="text-slate-600 text-sm text-center py-12">Nenhuma ordem encontrada</p>}
            </div>
          }
        </div>
      </div>

      {showModal && <NewOrderModal techs={technicians ?? []} onClose={() => setShowModal(false)} />}
    </div>
  );
}
