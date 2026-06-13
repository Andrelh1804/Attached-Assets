import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users, TrendingUp, DollarSign, X } from "lucide-react";
import { useGetPipeline, useCreateLead, useUpdateLead, useDeleteLead, getGetPipelineQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

const STAGES = [
  { key: "prospeccao", label: "Prospecção", color: "#64748b" },
  { key: "qualificacao", label: "Qualificação", color: "#2563EB" },
  { key: "proposta", label: "Proposta", color: "#8B5CF6" },
  { key: "negociacao", label: "Negociação", color: "#F59E0B" },
  { key: "fechado", label: "Fechado", color: "#10B981" },
];

const SCORE_COLOR = (score: number) => score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

interface Lead {
  id: number;
  name: string;
  email: string;
  company?: string | null;
  stage: string;
  value: number;
  probability: number;
  aiScore?: number | null;
}

function NewLeadModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createLead = useCreateLead();
  const [form, setForm] = useState({ name: "", email: "", company: "", stage: "prospeccao", value: "", probability: "50" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate({ data: { ...form, value: Number(form.value), probability: Number(form.probability) } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPipelineQueryKey() });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md rounded-2xl p-6" style={{ background: "hsl(217 33% 16%)", border: "1px solid hsl(217 33% 24%)" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">Novo Lead</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: "name", label: "Nome *", type: "text", required: true },
            { key: "email", label: "E-mail *", type: "email", required: true },
            { key: "company", label: "Empresa", type: "text" },
            { key: "value", label: "Valor (R$) *", type: "number", required: true },
          ].map(f => (
            <div key={f.key}>
              <label className="text-slate-400 text-xs mb-1 block">{f.label}</label>
              <input
                type={f.type}
                required={f.required}
                value={(form as Record<string, string>)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}
              />
            </div>
          ))}
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Etapa</label>
            <select value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
              {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm text-slate-300" style={{ border: "1px solid hsl(217 33% 26%)" }}>Cancelar</button>
            <button type="submit" disabled={createLead.isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
              {createLead.isPending ? "Salvando..." : "Criar Lead"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function LeadCard({ lead, stage, isDragging = false }: { lead: Lead; stage: typeof STAGES[0]; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: String(lead.id) });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: 10,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: "hsl(217 33% 17%)",
        border: `1px solid ${isDragging ? stage.color + "50" : "hsl(217 33% 22%)"}`,
        borderRadius: 12,
        padding: "10px 12px",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-white text-xs font-semibold leading-tight">{lead.name}</p>
        {lead.aiScore != null && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${SCORE_COLOR(lead.aiScore)}20`, color: SCORE_COLOR(lead.aiScore) }}>
            {lead.aiScore}
          </span>
        )}
      </div>
      {lead.company && <p className="text-slate-500 text-xs mb-2">{lead.company}</p>}
      <div className="flex items-center justify-between">
        <p className="text-emerald-400 text-xs font-semibold">R$ {lead.value.toLocaleString("pt-BR")}</p>
        <p className="text-slate-600 text-xs">{lead.probability}%</p>
      </div>
    </div>
  );
}

function DroppableColumn({ stageKey, color, children, isOver }: { stageKey: string; color: string; children: React.ReactNode; isOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: stageKey });

  return (
    <div
      ref={setNodeRef}
      className="space-y-2 min-h-24 rounded-xl transition-all duration-150"
      style={{
        padding: "6px",
        background: isOver ? `${color}08` : "transparent",
        border: isOver ? `1px dashed ${color}60` : "1px dashed transparent",
      }}
    >
      {children}
    </div>
  );
}

export default function CrmPage() {
  const { data: pipeline, isLoading } = useGetPipeline();
  const updateLead = useUpdateLead();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const totalValue = pipeline?.reduce((s, stage) => s + stage.totalValue, 0) ?? 0;
  const totalLeads = pipeline?.reduce((s, stage) => s + stage.count, 0) ?? 0;

  const allLeads = pipeline?.flatMap(s => s.leads) ?? [];
  const activeLead = activeId ? allLeads.find(l => String(l.id) === activeId) : null;
  const activeLeadStage = activeLead ? STAGES.find(s => s.key === activeLead.stage) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;
    const leadId = parseInt(String(active.id));
    const newStage = String(over.id);

    const lead = allLeads.find(l => l.id === leadId);
    if (!lead || lead.stage === newStage) return;

    if (!STAGES.find(s => s.key === newStage)) return;

    updateLead.mutate({ id: leadId, data: { stage: newStage } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetPipelineQueryKey() })
    });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Carregando pipeline...</div>;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">CRM & Pipeline</h1>
            <p className="text-slate-500 text-sm">{totalLeads} oportunidades — R$ {(totalValue / 1000).toFixed(0)}k em pipeline</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}>
            <Plus size={14} /> Novo Lead
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total em Pipeline", value: `R$ ${(totalValue / 1000).toFixed(0)}k`, icon: DollarSign, color: "#10B981" },
            { label: "Leads Ativos", value: String(totalLeads), icon: Users, color: "#2563EB" },
            { label: "Taxa de Conversão", value: `${pipeline ? Math.round(((pipeline.find(s => s.stage === "fechado")?.count ?? 0) / Math.max(totalLeads, 1)) * 100) : 0}%`, icon: TrendingUp, color: "#06B6D4" },
          ].map(card => (
            <div key={card.label} className="nexora-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{card.value}</p>
                <p className="text-slate-500 text-xs">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar leads..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white placeholder-slate-600 outline-none"
              style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }} />
          </div>
          <p className="text-slate-600 text-xs">Arraste os cards entre colunas para mover etapas</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageData = pipeline?.find(s => s.stage === stage.key);
            const leads = (stageData?.leads ?? []).filter(l =>
              !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.company ?? "").toLowerCase().includes(search.toLowerCase())
            );
            const isColumnOver = overId === stage.key;

            return (
              <div key={stage.key} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: stage.color }} />
                    <span className="text-slate-300 text-sm font-medium">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">{leads.length}</span>
                    <span className="text-slate-600 text-xs">R$ {((stageData?.totalValue ?? 0) / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                <DroppableColumn stageKey={stage.key} color={stage.color} isOver={isColumnOver}>
                  {leads.map(lead => (
                    <LeadCard key={lead.id} lead={lead} stage={stage} isDragging={activeId === String(lead.id)} />
                  ))}
                  {leads.length === 0 && (
                    <div className="h-20 rounded-xl border border-dashed flex items-center justify-center" style={{ borderColor: "hsl(217 33% 24%)" }}>
                      <p className="text-slate-700 text-xs">Sem leads</p>
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        {showModal && <NewLeadModal onClose={() => setShowModal(false)} />}
      </div>

      <DragOverlay>
        {activeLead && activeLeadStage ? (
          <div style={{
            background: "hsl(217 33% 17%)",
            border: `1px solid ${activeLeadStage.color}80`,
            borderRadius: 12,
            padding: "10px 12px",
            width: 240,
            boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            cursor: "grabbing",
          }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-white text-xs font-semibold leading-tight">{activeLead.name}</p>
              {activeLead.aiScore != null && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${SCORE_COLOR(activeLead.aiScore)}20`, color: SCORE_COLOR(activeLead.aiScore) }}>
                  {activeLead.aiScore}
                </span>
              )}
            </div>
            {activeLead.company && <p className="text-slate-500 text-xs mb-2">{activeLead.company}</p>}
            <div className="flex items-center justify-between">
              <p className="text-emerald-400 text-xs font-semibold">R$ {activeLead.value.toLocaleString("pt-BR")}</p>
              <p className="text-slate-600 text-xs">{activeLead.probability}%</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
