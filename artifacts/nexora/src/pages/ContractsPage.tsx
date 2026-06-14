import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, X, AlertTriangle, CheckCircle, Clock, XCircle,
  RefreshCw, TrendingUp, DollarSign, Calendar, Pencil
} from "lucide-react";
import {
  useGetContracts, useGetContractsSummary, useCreateContract, useUpdateContract, useDeleteContract
} from "@workspace/api-client-react";

const statusConfig = {
  active: { label: "Ativo", color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  renewal: { label: "Renovação", color: "#06B6D4", bg: "rgba(6,182,212,0.1)", icon: RefreshCw },
  expired: { label: "Vencido", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  cancelled: { label: "Cancelado", color: "#64748B", bg: "rgba(100,116,139,0.1)", icon: X },
};

type ContractFormData = {
  clientName: string;
  clientEmail: string;
  description: string;
  mrr: string;
  totalValue: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  notes: string;
};

const defaultForm: ContractFormData = {
  clientName: "", clientEmail: "", description: "",
  mrr: "", totalValue: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString().slice(0, 10),
  status: "active", autoRenew: true, notes: "",
};

function RenewalBadge({ days }: { days: number }) {
  if (days > 90) return null;
  const color = days <= 0 ? "#EF4444" : days <= 30 ? "#F97316" : days <= 60 ? "#F59E0B" : "#06B6D4";
  const label = days <= 0 ? "Vencido" : days <= 30 ? `${days}d` : days <= 60 ? `${days}d` : `${days}d`;
  return (
    <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: `${color}15`, color }}>
      {label}
    </span>
  );
}

function ContractModal({
  mode,
  initial,
  onClose,
}: {
  mode: "create" | "edit";
  initial?: ContractFormData & { id?: number };
  onClose: () => void;
}) {
  const [form, setForm] = useState<ContractFormData>(initial ?? defaultForm);
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();

  const submit = () => {
    const payload = {
      ...form,
      mrr: form.mrr ? parseFloat(form.mrr) : undefined,
      totalValue: form.totalValue ? parseFloat(form.totalValue) : undefined,
    } as any;

    if (mode === "create") {
      createMutation.mutate({ data: payload }, { onSuccess: () => onClose() });
    } else if (initial?.id !== undefined) {
      updateMutation.mutate({ id: initial.id, data: payload }, { onSuccess: () => onClose() });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const field = (label: string, key: keyof ContractFormData, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs text-slate-500 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 outline-none"
        style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 26%)" }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "hsl(217 33% 14%)", border: "1px solid hsl(217 33% 24%)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">{mode === "create" ? "Novo Contrato" : "Editar Contrato"}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">{field("Cliente *", "clientName", "text", "Nome do cliente")}</div>
          {field("Email", "clientEmail", "email", "cliente@email.com")}
          <div>
            <label className="block text-xs text-slate-500 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 outline-none"
              style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 26%)" }}>
              <option value="active">Ativo</option>
              <option value="renewal">Renovação</option>
              <option value="expired">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          {field("MRR (R$)", "mrr", "number", "2500")}
          {field("Valor Total (R$)", "totalValue", "number", "30000")}
          {field("Início", "startDate", "date")}
          {field("Vencimento", "endDate", "date")}
          <div className="col-span-2">{field("Descrição", "description", "text", "Objeto do contrato")}</div>
          <div className="col-span-2">{field("Observações", "notes", "text", "Notas internas")}</div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="autoRenew" checked={form.autoRenew} onChange={e => setForm(f => ({ ...f, autoRenew: e.target.checked }))} className="accent-blue-500" />
            <label htmlFor="autoRenew" className="text-slate-400 text-sm">Renovação automática</label>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm text-slate-400" style={{ background: "hsl(217 33% 19%)" }}>Cancelar</button>
          <button onClick={submit} disabled={isPending || !form.clientName}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {isPending ? "Salvando..." : mode === "create" ? "Criar Contrato" : "Salvar Alterações"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ContractsPage() {
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);

  const { data: contracts, isLoading } = useGetContracts({ status: filter === "all" ? undefined : filter });
  const { data: summary } = useGetContractsSummary();
  const deleteMutation = useDeleteContract();

  const filtered = (contracts ?? []).filter(c => filter === "all" || c.status === filter);

  const handleEdit = (contract: any) => {
    setEditingContract({
      id: contract.id,
      clientName: contract.clientName ?? "",
      clientEmail: contract.clientEmail ?? "",
      description: contract.description ?? "",
      mrr: contract.mrr != null ? String(contract.mrr) : "",
      totalValue: contract.totalValue != null ? String(contract.totalValue) : "",
      startDate: contract.startDate ?? new Date().toISOString().slice(0, 10),
      endDate: contract.endDate ?? new Date(Date.now() + 365 * 24 * 3600000).toISOString().slice(0, 10),
      status: contract.status ?? "active",
      autoRenew: contract.autoRenew ?? true,
      notes: contract.notes ?? "",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <AnimatePresence>
        {showCreate && (
          <ContractModal mode="create" onClose={() => setShowCreate(false)} />
        )}
        {editingContract && (
          <ContractModal mode="edit" initial={editingContract} onClose={() => setEditingContract(null)} />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText size={22} className="text-blue-400" /> Contratos
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Ciclo de vida completo dos seus contratos comerciais</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">
          <Plus size={14} /> Novo Contrato
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MRR Total", value: `R$ ${((summary?.mrrTotal ?? 0) / 1000).toFixed(1)}k`, sub: "Receita recorrente mensal", color: "#10B981", icon: DollarSign },
          { label: "ARR Total", value: `R$ ${((summary?.arrTotal ?? 0) / 1000).toFixed(0)}k`, sub: "Receita anual recorrente", color: "#2563EB", icon: TrendingUp },
          { label: "Vencendo em 30d", value: `${summary?.expiringSoon ?? 0}`, sub: "Contratos precisando atenção", color: "#F59E0B", icon: AlertTriangle },
          { label: "Taxa de Renovação", value: `${summary?.renewalRate ?? 0}%`, sub: `${summary?.active ?? 0} contratos ativos`, color: "#06B6D4", icon: RefreshCw },
        ].map(card => (
          <motion.div key={card.label} whileHover={{ y: -2 }} className="nexora-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{card.label}</p>
            <p className="text-xs text-slate-600 mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "all", label: "Todos" },
          { key: "active", label: "Ativos" },
          { key: "renewal", label: "Renovação" },
          { key: "expired", label: "Vencidos" },
          { key: "cancelled", label: "Cancelados" },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            style={filter !== f.key ? { background: "hsl(217 33% 14%)" } : {}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="nexora-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(217 33% 22%)" }}>
                {["Cliente", "Status", "MRR", "Período", "Vencimento", "Auto", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "hsl(217 33% 18%)" }}>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-sm">Carregando contratos...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                  Nenhum contrato encontrado. Clique em "+ Novo Contrato" para criar.
                </td></tr>
              ) : filtered.map(contract => {
                const cfg = statusConfig[contract.status as keyof typeof statusConfig] ?? statusConfig.active;
                const StatusIcon = cfg.icon;
                return (
                  <motion.tr key={contract.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{contract.clientName}</p>
                        {contract.clientEmail && <p className="text-slate-600 text-xs">{contract.clientEmail}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
                        <StatusIcon size={11} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-emerald-400 font-semibold text-sm">R$ {(contract.mrr ?? 0).toLocaleString("pt-BR")}</p>
                      <p className="text-slate-600 text-xs">MRR</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      <p>{new Date(contract.startDate).toLocaleDateString("pt-BR")}</p>
                      <p className="text-slate-600">até {new Date(contract.endDate).toLocaleDateString("pt-BR")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-slate-600" />
                        <span className="text-slate-400 text-xs">{new Date(contract.endDate).toLocaleDateString("pt-BR")}</span>
                        <RenewalBadge days={contract.daysUntilRenewal ?? 999} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${contract.autoRenew ? "text-emerald-400" : "text-slate-600"}`}>
                        {contract.autoRenew ? "✓ Sim" : "✗ Não"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir contrato de ${contract.clientName}?`)) {
                              deleteMutation.mutate({ id: contract.id! });
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Excluir"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
