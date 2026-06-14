import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Ticket, Wrench, UserSquare2, DollarSign,
  MessageSquare, Brain, Trophy, Zap, Settings, ChevronRight, Bell,
  Search, X, Send, Sparkles, LogOut, Menu, Activity, Heart, FileText
} from "lucide-react";
import { useChatWithAi } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";

const navSections = [
  { section: "Principal", items: [{ path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "Inteligencia", items: [
    { path: "/app/health-score", label: "Business Health Score", icon: Activity },
    { path: "/app/customer-success", label: "Customer Success", icon: Heart },
    { path: "/app/contracts", label: "Contratos", icon: FileText },
  ]},
  { section: "Comercial", items: [{ path: "/app/crm", label: "CRM & Pipeline", icon: Users }] },
  { section: "Suporte", items: [
    { path: "/app/tickets", label: "Mesa de Servico", icon: Ticket },
    { path: "/app/field-service", label: "Field Service", icon: Wrench },
    { path: "/app/omnichannel", label: "Omnicanal", icon: MessageSquare },
  ]},
  { section: "Equipe", items: [
    { path: "/app/hr", label: "RH & Pessoas", icon: UserSquare2 },
    { path: "/app/gamification", label: "Gamificacao", icon: Trophy },
  ]},
  { section: "Financeiro", items: [{ path: "/app/finance", label: "Financeiro", icon: DollarSign }] },
  { section: "IA & Automacao", items: [
    { path: "/app/ai", label: "Nexora Brain", icon: Brain },
    { path: "/app/automations", label: "Automacoes", icon: Zap },
  ]},
];

function AiAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ola! Sou o Nexora Brain. Como posso ajudar sua empresa hoje?" }
  ]);
  const [input, setInput] = useState("");
  const chatMutation = useChatWithAi();

  const sendMsg = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    chatMutation.mutate({ data: { message: userMsg } }, {
      onSuccess: (data) => setMessages(prev => [...prev, { role: "assistant", content: data.reply }]),
      onError: () => setMessages(prev => [...prev, { role: "assistant", content: "Erro ao processar. Tente novamente." }])
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      className="fixed bottom-24 right-6 w-96 rounded-2xl overflow-hidden z-50"
      style={{ background: "hsl(217 33% 14%)", border: "1px solid hsl(217 33% 24%)", boxShadow: "0 24px 60px rgba(0,0,0,0.8)" }}
    >
      <div className="flex items-center gap-3 p-4" style={{ background: "linear-gradient(135deg, hsl(213 93% 45%), hsl(192 91% 38%))" }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Brain size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Nexora Brain</p>
          <p className="text-white/70 text-xs">IA Empresarial</p>
        </div>
        <button onClick={onClose} className="ml-auto text-white/70 hover:text-white"><X size={16} /></button>
      </div>
      <div className="h-72 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "text-slate-200 rounded-bl-sm"}`}
              style={m.role === "assistant" ? { background: "hsl(217 33% 20%)" } : {}}>
              {m.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl rounded-bl-sm text-sm" style={{ background: "hsl(217 33% 20%)" }}>
              <span className="text-cyan-400">Analisando</span><span className="animate-pulse text-slate-400">...</span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t" style={{ borderColor: "hsl(217 33% 22%)" }}>
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder="Pergunte sobre sua empresa..."
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-transparent text-slate-200 placeholder-slate-500 outline-none"
            style={{ background: "hsl(217 33% 19%)", border: "1px solid hsl(217 33% 25%)" }} />
          <button onClick={sendMsg} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [aiOpen, setAiOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "hsl(222 47% 11%)" }}>
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 flex flex-col h-full overflow-hidden"
        style={{ background: "hsl(222 47% 9%)", borderRight: "1px solid hsl(217 33% 18%)" }}
      >
        <div className="flex items-center gap-3 p-4 h-16 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)", boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}>
            <span className="text-white font-black text-sm">N</span>
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
              <p className="text-white font-bold text-sm leading-tight">Nexora AI</p>
              <p className="text-slate-500 text-xs">Business OS</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
          {navSections.map(section => (
            <div key={section.section}>
              {sidebarOpen && (
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-2 mb-1">{section.section}</p>
              )}
              {section.items.map(item => {
                const active = location === item.path;
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <div className={`nexora-sidebar-item ${active ? "active" : ""}`}>
                      <Icon size={16} className="flex-shrink-0" />
                      {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                      {sidebarOpen && active && <ChevronRight size={13} className="ml-auto text-blue-400 flex-shrink-0" />}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-2 border-t flex-shrink-0" style={{ borderColor: "hsl(217 33% 18%)" }}>
          <div className="nexora-sidebar-item">
            <Settings size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>Configuracoes</span>}
          </div>
          <button onClick={isAuthenticated ? logout : login} className="nexora-sidebar-item w-full text-left">
            <LogOut size={16} className="flex-shrink-0" />
            {sidebarOpen && <span>{isAuthenticated ? "Sair" : "Entrar"}</span>}
          </button>
          {sidebarOpen && (
            <div className="mt-2 p-3 rounded-lg" style={{ background: "hsl(217 33% 15%)", border: "1px solid hsl(217 33% 22%)" }}>
              <div className="flex items-center gap-2">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "A"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-slate-200 text-xs font-medium truncate">
                    {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email || "Usuário" : "Visitante"}
                  </p>
                  <p className="text-slate-500 text-xs">{isAuthenticated ? "Autenticado" : "Não autenticado"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center gap-4 px-6 flex-shrink-0" style={{ borderBottom: "1px solid hsl(217 33% 18%)", background: "hsl(222 47% 11%)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-slate-300 transition-colors">
            <Menu size={18} />
          </button>
          <div className="flex-1 flex items-center gap-2 max-w-md">
            <Search size={14} className="text-slate-600" />
            <input placeholder="Pesquisar..." className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none flex-1" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative text-slate-500 hover:text-slate-300 transition-colors">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">3</span>
            </button>
            <button onClick={() => setAiOpen(!aiOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
              <Sparkles size={14} /> IA
            </button>
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <motion.div key={location} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="h-full">
            {children}
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {aiOpen && <AiAssistant onClose={() => setAiOpen(false)} />}
      </AnimatePresence>

      <motion.button
        onClick={() => setAiOpen(!aiOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40"
        style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)", boxShadow: "0 0 20px rgba(6,182,212,0.4)" }}
      >
        <Brain size={22} className="text-white" />
      </motion.button>
    </div>
  );
}
