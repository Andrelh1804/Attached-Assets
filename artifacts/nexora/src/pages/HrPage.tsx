import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, TrendingUp, Star, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetEmployees, useGetHrOverview, useCreateEmployee, getGetEmployeesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const DEPT_COLORS: Record<string, string> = {
  "Vendas": "#2563EB", "Suporte": "#06B6D4", "TI": "#8B5CF6",
  "RH": "#10B981", "Financeiro": "#F59E0B", "Operacoes": "#EC4899",
};

function NewEmployeeModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createEmployee = useCreateEmployee();
  const [form, setForm] = useState({ name: "", email: "", department: "Vendas", role: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate({ data: form }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetEmployeesQueryKey() }); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Colaborador</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {[{ k: "name", l: "Nome *", t: "text", r: true }, { k: "email", l: "E-mail *", t: "email", r: true }, { k: "role", l: "Cargo *", t: "text", r: true }].map(f => (
            <div key={f.k}>
              <label className="text-slate-400 text-xs mb-1 block">{f.l}</label>
              <input required={f.r} type={f.t} value={(form as Record<string, string>)[f.k]}
                onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
            </div>
          ))}
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Departamento</label>
            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
              {Object.keys(DEPT_COLORS).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={createEmployee.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {createEmployee.isPending ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function HrPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { data: employees, isLoading } = useGetEmployees({ search: search || undefined });
  const { data: overview } = useGetHrOverview();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">RH & Pessoas</h1>
          <p className="text-slate-500 text-sm">{overview?.activeEmployees ?? 0} colaboradores ativos — {overview?.productivity ?? 92}% de produtividade</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
          <Plus size={14} /> Novo Colaborador
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Colaboradores", value: String(overview?.totalEmployees ?? 0), icon: Users, color: "#2563EB" },
          { label: "Ativos", value: String(overview?.activeEmployees ?? 0), icon: TrendingUp, color: "#10B981" },
          { label: "Produtividade Media", value: `${overview?.productivity ?? 92}%`, icon: Star, color: "#F59E0B" },
          { label: "Vagas em Aberto", value: String(overview?.openPositions ?? 0), icon: Plus, color: "#8B5CF6" },
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Dept Chart */}
        <div className="nexora-card p-5">
          <p className="text-white font-semibold mb-4">Por Departamento</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={overview?.departmentBreakdown ?? []} layout="vertical">
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ background: "hsl(217 33% 17%)", border: "none", borderRadius: "8px", color: "white" }} />
              <Bar dataKey="value" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar colaboradores..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {isLoading ? <p className="text-slate-500 text-sm">Carregando...</p> :
              (employees ?? []).map(emp => {
                const deptColor = DEPT_COLORS[emp.department] ?? "#64748b";
                const initials = emp.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const prod = emp.productivity ?? 0;
                return (
                  <motion.div key={emp.id} layout
                    className="p-4 rounded-xl flex items-center gap-4"
                    style={{ background: "hsl(217 33% 17%)", border: "1px solid hsl(217 33% 22%)" }}
                    whileHover={{ borderColor: `${deptColor}40` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}99)` }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-white font-medium text-sm truncate">{emp.name}</p>
                        <span className="text-xs font-bold" style={{ color: prod >= 90 ? "#10B981" : prod >= 70 ? "#F59E0B" : "#EF4444" }}>{prod}%</span>
                      </div>
                      <p className="text-slate-500 text-xs">{emp.role} • {emp.department}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1 h-1 rounded-full" style={{ background: "hsl(217 33% 24%)" }}>
                          <div className="h-full rounded-full" style={{ width: `${prod}%`, background: prod >= 90 ? "#10B981" : prod >= 70 ? "#F59E0B" : "#EF4444" }} />
                        </div>
                        <span className="text-xs text-slate-600">{emp.goalsCompleted ?? 0}/{emp.goalsTotal ?? 5} metas</span>
                        {(emp.points ?? 0) >= 400 && (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star size={11} fill="currentColor" />
                            <span className="text-xs">{emp.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            {!isLoading && (employees ?? []).length === 0 && (
              <p className="text-slate-600 text-sm text-center py-8">Nenhum colaborador encontrado</p>
            )}
          </div>
        </div>
      </div>

      {showModal && <NewEmployeeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
