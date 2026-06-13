import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, AlertTriangle, TrendingUp, Zap, BarChart3, Sparkles, Lock } from "lucide-react";
import { useGetAiInsights, useChatWithAi } from "@workspace/api-client-react";
import { PaywallModal } from "@/components/PaywallModal";

const DEMO_PLAN = "starter";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  high: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: AlertTriangle },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: AlertTriangle },
  low: { color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: TrendingUp },
};
const TYPE_ICONS: Record<string, React.ElementType> = {
  risk: AlertTriangle, opportunity: TrendingUp, bottleneck: Zap, growth: BarChart3,
};

const QUICK_PROMPTS = [
  "Qual o risco financeiro desta semana?",
  "Como esta a equipe de suporte?",
  "Quais sao as principais oportunidades?",
  "Gere um resumo executivo do mes",
];

interface Message { role: "user" | "assistant"; content: string; actions?: string[]; }

export default function AiPage() {
  const isLocked = DEMO_PLAN === "starter";
  const [showPaywall, setShowPaywall] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ola! Sou o Nexora Brain, sua IA empresarial. Tenho acesso a todos os dados da sua empresa em tempo real. Pergunte-me qualquer coisa sobre receita, chamados, equipe, financeiro ou operacoes." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: insights } = useGetAiInsights();
  const chatMutation = useChatWithAi();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMsg = (text?: string) => {
    const content = text || input;
    if (!content.trim()) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content }]);
    chatMutation.mutate({ data: { message: content } }, {
      onSuccess: data => setMessages(prev => [...prev, { role: "assistant", content: data.reply, actions: data.actions }]),
      onError: () => setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, tive um problema ao processar sua solicitacao. Tente novamente." }])
    });
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <PaywallModal isOpen={showPaywall} moduleName="Nexora Brain" requiredPlan="business" onClose={() => setShowPaywall(false)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Nexora Brain</h1>
            <div className="flex items-center gap-1.5 text-xs text-cyan-400">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              IA Empresarial ativa — conectada a todos os modulos
            </div>
          </div>
        </div>
        {isLocked && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPaywall(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#06B6D4,#2563EB)", boxShadow: "0 4px 20px rgba(6,182,212,0.3)" }}
          >
            <Lock size={14} /> Desbloquear — Plano Business
          </motion.button>
        )}
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
            Você está em visualização limitada do Nexora Brain. <button onClick={() => setShowPaywall(true)} className="font-semibold underline" style={{ color: "#06B6D4" }}>Faça upgrade para Business</button> para usar o chat de IA completo e análises preditivas.
          </span>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Chat */}
        <div className="lg:col-span-2 nexora-card flex flex-col min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
                      <Brain size={13} className="text-white" />
                    </div>
                  )}
                  <div className="max-w-sm">
                    <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={msg.role === "user"
                        ? { background: "rgba(37,99,235,0.5)", color: "white", borderRadius: "16px 16px 4px 16px" }
                        : { background: "hsl(217 33% 20%)", color: "#cbd5e1", borderRadius: "16px 16px 16px 4px", border: "1px solid hsl(217 33% 26%)" }}>
                      {msg.content}
                    </div>
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.actions.map(a => (
                          <button key={a} onClick={() => sendMsg(a)}
                            className="px-2.5 py-1 rounded-lg text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {chatMutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
                  <Brain size={13} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl text-sm" style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                  <span className="text-cyan-400">Analisando dados</span>
                  <span className="animate-pulse text-slate-500">...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          <div className="px-5 py-3 border-t flex gap-2 flex-wrap" style={{ borderColor: "hsl(217 33% 22%)" }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p} onClick={() => sendMsg(p)}
                className="text-xs px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                {p.slice(0, 30)}...
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: "hsl(217 33% 22%)" }}>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: "hsl(217 33% 20%)", border: "1px solid hsl(217 33% 26%)" }}>
                <Sparkles size={14} className="text-cyan-400 flex-shrink-0" />
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Pergunte sobre sua empresa..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none" />
              </div>
              <button onClick={() => sendMsg()} disabled={!input.trim() || chatMutation.isPending}
                className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-all"
                style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="nexora-card overflow-hidden flex flex-col">
          <div className="p-4 border-b" style={{ borderColor: "hsl(217 33% 22%)" }}>
            <p className="text-white font-semibold text-sm">Alertas & Insights</p>
            <p className="text-slate-500 text-xs mt-0.5">Analise em tempo real</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(insights ?? []).map(insight => {
              const cfg = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.low;
              const TypeIcon = TYPE_ICONS[insight.type] ?? BarChart3;
              return (
                <motion.div key={insight.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}
                  onClick={() => sendMsg(`Detalhe o insight: ${insight.title}`)}>
                  <div className="flex items-start gap-2 mb-2">
                    <TypeIcon size={13} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
                    <p className="text-white text-xs font-semibold leading-tight">{insight.title}</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{insight.description}</p>
                  {insight.recommendation && (
                    <p className="text-xs mt-2 pt-2 border-t" style={{ borderColor: `${cfg.color}20`, color: cfg.color }}>
                      {insight.recommendation}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
