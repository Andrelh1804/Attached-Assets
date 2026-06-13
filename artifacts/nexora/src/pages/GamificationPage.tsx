import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useGetGamificationRanking } from "@workspace/api-client-react";

const CATEGORIES = [
  { key: "technicians", label: "Tecnicos" },
  { key: "attendants", label: "Atendentes" },
  { key: "suppliers", label: "Fornecedores" },
];

const BADGE_CONFIG: Record<string, { color: string; bg: string }> = {
  "Ouro": { color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  "Prata": { color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  "Bronze": { color: "#b45309", bg: "rgba(180,83,9,0.15)" },
};

const MEDAL_COLORS: Record<number, string> = { 1: "#F59E0B", 2: "#94a3b8", 3: "#b45309" };

function Podium({ entries }: { entries: { position: number; name: string; points: number; badge: string }[] }) {
  const top3 = entries.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [80, 110, 60];
  const positions = [2, 1, 3];

  return (
    <div className="flex items-end justify-center gap-4 mb-8 mt-4">
      {order.map((entry, i) => {
        if (!entry) return null;
        const color = MEDAL_COLORS[entry.position];
        const h = heights[i];
        const pos = positions[i];
        const initials = entry.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
        return (
          <motion.div key={entry.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-2"
              style={{ background: `${color}30`, borderColor: color }}>
              {initials}
            </div>
            <p className="text-white text-xs font-semibold text-center max-w-20 leading-tight">{entry.name.split(" ")[0]}</p>
            <p className="text-xs font-bold" style={{ color }}>{entry.points.toLocaleString("pt-BR")} pts</p>
            <div className="flex items-end justify-center rounded-t-lg relative" style={{ height: h, width: 80, background: `${color}15`, border: `1px solid ${color}30` }}>
              <span className="absolute top-3 text-2xl font-black" style={{ color }}>{pos}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function GamificationPage() {
  const [category, setCategory] = useState("technicians");
  const { data: ranking, isLoading } = useGetGamificationRanking({ category });

  const top3 = (ranking ?? []).slice(0, 3);
  const rest = (ranking ?? []).slice(3);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gamificacao & Rankings</h1>
        <p className="text-slate-500 text-sm">Reconheca os melhores e incentive a excelencia</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Lider da Semana", value: ranking?.[0]?.name?.split(" ")[0] ?? "—", icon: Trophy, color: "#F59E0B" },
          { label: "Pontuacao Maxima", value: (ranking?.[0]?.points ?? 0).toLocaleString("pt-BR"), icon: Star, color: "#2563EB" },
          { label: "Participantes", value: String(ranking?.length ?? 0), icon: Medal, color: "#8B5CF6" },
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

      {/* Tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat.key} onClick={() => setCategory(cat.key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: category === cat.key ? "rgba(37,99,235,0.2)" : "hsl(217 33% 20%)", color: category === cat.key ? "#60a5fa" : "#94a3b8", border: `1px solid ${category === cat.key ? "rgba(37,99,235,0.4)" : "hsl(217 33% 26%)"}` }}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="nexora-card overflow-hidden">
        {/* Podium */}
        {top3.length >= 2 && <div className="p-6 pb-0"><Podium entries={top3} /></div>}

        {/* Full Ranking Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(217 33% 22%)", borderTop: "1px solid hsl(217 33% 22%)" }}>
                {["Pos.", "Nome", "Pontos", "Medalha", "Variacao"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Carregando ranking...</td></tr>
              ) : (ranking ?? []).map((entry, i) => {
                const badge = BADGE_CONFIG[entry.badge] ?? BADGE_CONFIG["Bronze"];
                const medalColor = MEDAL_COLORS[entry.position];
                const initials = entry.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <motion.tr key={entry.position} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid hsl(217 33% 19%)" }}>
                    <td className="px-5 py-3">
                      <span className="text-lg font-black" style={{ color: medalColor ?? "#64748b" }}>
                        {entry.position <= 3 ? ["🥇", "🥈", "🥉"][entry.position - 1] : entry.position}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: medalColor ? `${medalColor}40` : "rgba(100,116,139,0.4)" }}>
                          {initials}
                        </div>
                        <span className="text-slate-200 text-sm font-medium">{entry.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-white font-bold">{entry.points.toLocaleString("pt-BR")}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: badge.bg, color: badge.color }}>
                        {entry.badge}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {entry.change > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-400 text-xs"><TrendingUp size={12} />+{entry.change}</div>
                      ) : entry.change < 0 ? (
                        <div className="flex items-center gap-1 text-red-400 text-xs"><TrendingDown size={12} />{entry.change}</div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-600 text-xs"><Minus size={12} />—</div>
                      )}
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
