import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, Play, Pause, Trash2, Clock, CheckCircle, X, Lock } from "lucide-react";
import { useGetAutomations, useCreateAutomation, useUpdateAutomation, useDeleteAutomation, getGetAutomationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PaywallModal } from "@/components/PaywallModal";

const DEMO_PLAN = "starter";

const TRIGGER_ICONS: Record<string, string> = {
  "new_ticket": "Novo Chamado", "lead_stage_change": "Mudanca de Etapa", "payment_received": "Pagamento Recebido",
  "sla_breach": "Violacao SLA", "employee_goal": "Meta Atingida", "schedule": "Agendado",
  "webhook": "Webhook", "custom": "Personalizado",
};

function NewAutomationModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const create = useCreateAutomation();
  const [form, setForm] = useState({ name: "", description: "", trigger: "new_ticket" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ data: form }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() }); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Fluxo Nexora</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Nome do Fluxo *</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Descricao</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none resize-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Gatilho</label>
            <select value={form.trigger} onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
              {Object.entries(TRIGGER_ICONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={create.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {create.isPending ? "Criando..." : "Criar Fluxo"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AutomationsPage() {
  const isLocked = DEMO_PLAN === "starter";
  const [showPaywall, setShowPaywall] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { data: automations, isLoading } = useGetAutomations();
  const updateAuto = useUpdateAutomation();
  const deleteAuto = useDeleteAutomation();
  const queryClient = useQueryClient();

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    updateAuto.mutate({ id, data: { status: newStatus } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() })
    });
  };

  const handleDelete = (id: number) => {
    deleteAuto.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() })
    });
  };

  const activeCount = (automations ?? []).filter(a => a.status === "active").length;
  const totalExecutions = (automations ?? []).reduce((s, a) => s + a.executionsCount, 0);

  return (
    <div className="p-6 space-y-6">
      <PaywallModal isOpen={showPaywall} moduleName="Automações Avançadas" requiredPlan="business" onClose={() => setShowPaywall(false)} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automacoes — Fluxo Nexora</h1>
          <p className="text-slate-500 text-sm">{activeCount} fluxos ativos • {totalExecutions.toLocaleString("pt-BR")} execucoes total</p>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              onClick={() => setShowPaywall(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#06B6D4,#2563EB)", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}
            >
              <Lock size={14} /> Desbloquear Business
            </motion.button>
          )}
          <button onClick={() => isLocked ? setShowPaywall(true) : setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
            <Plus size={14} /> Novo Fluxo
          </button>
        </div>
      </div>

      {isLocked && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 flex items-center gap-3 text-sm"
          style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}
        >
          <Lock size={16} style={{ color: "#06B6D4" }} className="shrink-0" />
          <span className="text-slate-300">
            Automações ilimitadas estão disponíveis no plano Business. <button onClick={() => setShowPaywall(true)} className="font-semibold underline" style={{ color: "#06B6D4" }}>Ver planos</button>
          </span>
        </motion.div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Fluxos Ativos", value: String(activeCount), color: "#10B981", icon: Zap },
          { label: "Execucoes Hoje", value: String(Math.floor(totalExecutions / 30)), color: "#2563EB", icon: Play },
          { label: "Total de Execucoes", value: totalExecutions.toLocaleString("pt-BR"), color: "#8B5CF6", icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="nexora-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-slate-500 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Automations Grid */}
      {isLoading ? <p className="text-slate-500">Carregando automacoes...</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(automations ?? []).map(auto => {
            const isActive = auto.status === "active";
            const triggerLabel = TRIGGER_ICONS[auto.trigger] ?? auto.trigger;
            return (
              <motion.div key={auto.id} layout
                className="nexora-card p-5 flex flex-col gap-4"
                whileHover={{ borderColor: isActive ? "rgba(37,99,235,0.4)" : "hsl(217 33% 28%)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "rgba(37,99,235,0.15)" : "rgba(100,116,139,0.15)" }}>
                    <Zap size={16} style={{ color: isActive ? "#2563EB" : "#64748b" }} />
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <button onClick={() => toggleStatus(auto.id, auto.status)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      title={isActive ? "Pausar" : "Ativar"}>
                      {isActive ? <Pause size={14} className="text-slate-400" /> : <Play size={14} className="text-slate-400" />}
                    </button>
                    <button onClick={() => handleDelete(auto.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10">
                      <Trash2 size={14} className="text-slate-600 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">{auto.name}</p>
                  {auto.description && <p className="text-slate-500 text-xs">{auto.description}</p>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Zap size={11} className="text-slate-600" />
                    <span className="text-slate-500">Gatilho:</span>
                    <span className="text-slate-300">{triggerLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={11} className="text-slate-600" />
                    <span className="text-slate-500">Execucoes:</span>
                    <span className="text-slate-300">{auto.executionsCount.toLocaleString("pt-BR")}</span>
                  </div>
                  {auto.lastExecutedAt && (
                    <div className="flex items-center gap-2 text-xs">
                      <Clock size={11} className="text-slate-600" />
                      <span className="text-slate-500">Ultima:</span>
                      <span className="text-slate-300">{new Date(auto.lastExecutedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "hsl(217 33% 22%)" }}>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: isActive ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)", color: isActive ? "#10B981" : "#64748b" }}>
                    {isActive ? "Ativo" : "Pausado"}
                  </span>
                  <span className="text-slate-600 text-xs">{new Date(auto.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </motion.div>
            );
          })}

          {/* Empty state */}
          {(automations ?? []).length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Zap size={40} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhuma automacao criada ainda</p>
              <p className="text-slate-700 text-xs mt-1">Clique em "Novo Fluxo" para comecar</p>
            </div>
          )}
        </div>
      )}

      {showModal && <NewAutomationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
