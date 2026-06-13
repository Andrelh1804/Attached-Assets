import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, useMotionValue, useSpring, useAnimationFrame } from "framer-motion";
import {
  Brain, Zap, Shield, TrendingUp, Users, Ticket, DollarSign, Wrench,
  MessageSquare, Trophy, ChevronRight, Check, Star, ArrowRight, BarChart3,
  Globe, Lock, Sparkles
} from "lucide-react";

function AnimatedNumber({ target, prefix = "", suffix = "", duration = 2 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = (Date.now() - start) / (duration * 1000);
      if (elapsed < 1) {
        setDisplayed(Math.floor(target * Math.pow(elapsed, 0.5)));
        requestAnimationFrame(tick);
      } else {
        setDisplayed(target);
      }
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return <span ref={ref}>{prefix}{displayed.toLocaleString("pt-BR")}{suffix}</span>;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const modules = [
  { icon: Users, label: "CRM & Pipeline", desc: "Funil inteligente com IA pontuando cada oportunidade automaticamente.", color: "#2563EB" },
  { icon: Ticket, label: "Mesa de Serviço", desc: "SLA inteligente, IA classificando e sugerindo respostas em tempo real.", color: "#06B6D4" },
  { icon: Wrench, label: "Field Service", desc: "Mapa ao vivo com técnicos, rotas otimizadas e ordens de serviço.", color: "#10B981" },
  { icon: Users, label: "RH Digital", desc: "Dashboard do colaborador com gamificação, metas e evolução.", color: "#8B5CF6" },
  { icon: DollarSign, label: "Financeiro", desc: "Fluxo de caixa, PIX, recebimentos e IA financeira integrada.", color: "#F59E0B" },
  { icon: MessageSquare, label: "Omnicanal", desc: "WhatsApp, e-mail, chat e telefone em uma central unificada.", color: "#EC4899" },
  { icon: Brain, label: "Nexora Brain", desc: "IA que consulta dados, gera relatórios e prevê cancelamentos.", color: "#06B6D4" },
  { icon: Zap, label: "Automações", desc: "Construtor visual de fluxos no-code, igual ao n8n, sem complicação.", color: "#F59E0B" },
];

const benefits = [
  { icon: TrendingUp, label: "Aumento de 34%", desc: "na produtividade da equipe nos primeiros 90 dias", color: "#10B981" },
  { icon: DollarSign, label: "Redução de 28%", desc: "nos custos operacionais com automações inteligentes", color: "#2563EB" },
  { icon: Ticket, label: "Resolução 2x mais rápida", desc: "nos chamados com IA sugerindo respostas automaticamente", color: "#06B6D4" },
  { icon: Shield, label: "100% em conformidade", desc: "com LGPD, auditoria completa e criptografia AES-256", color: "#8B5CF6" },
];

const useCases = [
  "Provedores de Internet", "Empresas de TI", "Energia Solar", "Instalações Técnicas",
  "Segurança Eletrônica", "Telecomunicações", "Field Service", "Gestão de Contratos"
];

const plans = [
  { name: "Starter", price: "R$ 297", period: "/mês", features: ["Até 5 usuários", "CRM básico", "Mesa de serviço", "App mobile", "Suporte por e-mail"], highlight: false },
  { name: "Business", price: "R$ 897", period: "/mês", features: ["Até 25 usuários", "Todos os módulos", "Nexora Brain IA", "Automações ilimitadas", "Suporte prioritário", "Integrações API"], highlight: true, badge: "Mais popular" },
  { name: "Enterprise", price: "Sob consulta", period: "", features: ["Usuários ilimitados", "White Label disponível", "Onboarding dedicado", "SLA contratual", "Infraestrutura dedicada", "Gestor de conta exclusivo"], highlight: false },
];

const testimonials = [
  { name: "Ricardo Almeida", role: "CEO, TechSolution ISP", text: "A Nexora transformou completamente nossa operação. Reduzimos o tempo de atendimento em 60% e aumentamos a retenção de clientes em 40%.", stars: 5 },
  { name: "Carla Mendes", role: "Diretora de Operações, SolarBrasil", text: "O Field Service da Nexora nos deu visibilidade total das equipes técnicas. Nunca mais perdemos um SLA de instalação.", stars: 5 },
  { name: "Paulo Ferreira", role: "Gerente TI, SecureNet", text: "O Nexora Brain é impressionante. Ele detectou padrões de cancelamento antes que a gente percebesse e nos salvou R$ 200k em contratos.", stars: 5 },
];

export default function LandingPage() {
  const [roiUsers, setRoiUsers] = useState(20);
  const [roiSalary, setRoiSalary] = useState(4000);
  const savings = Math.round(roiUsers * roiSalary * 0.3);

  return (
    <div className="min-h-screen" style={{ background: "#0F172A", fontFamily: "Inter, sans-serif" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderColor: "rgba(51,65,85,0.5)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
              <span className="text-white font-black text-sm">N</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Nexora AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Módulos", "Benefícios", "Casos de Uso", "Preços"].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(" ","-")}`} className="text-slate-400 hover:text-white text-sm transition-colors">{item}</a>
            ))}
          </div>
          <Link href="/app/dashboard">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}
            >
              Acessar Plataforma
            </motion.button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* BG gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "#2563EB", filter: "blur(80px)" }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-8" style={{ background: "#06B6D4", filter: "blur(80px)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)", color: "#06B6D4" }}>
              <Sparkles size={12} />
              Sistema Operacional Empresarial Inteligente
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6" style={{ letterSpacing: "-0.02em" }}>
              Controle toda sua<br />
              <span style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                empresa em uma
              </span><br />
              única plataforma.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              CRM, Atendimento, RH, Contratos, Financeiro e Inteligência Artificial trabalhando juntos para aumentar seus resultados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/app/dashboard">
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(37,99,235,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 rounded-xl text-base font-bold text-white flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg,#2563EB,#1d4ed8)" }}
                >
                  Solicitar Demonstração <ArrowRight size={18} />
                </motion.button>
              </Link>
              <Link href="/app/dashboard">
                <button className="px-8 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-colors" style={{ border: "1px solid rgba(51,65,85,0.8)" }}>
                  Ver plataforma ao vivo <ChevronRight size={18} />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { label: "Empresas ativas", value: 1240, suffix: "+" },
              { label: "Uptime garantido", value: 99, suffix: ".9%" },
              { label: "Chamados resolvidos/mês", value: 340, suffix: "k+" },
              { label: "NPS médio", value: 91, suffix: "" },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(51,65,85,0.5)" }}>
                <p className="text-3xl font-black text-white">
                  <AnimatedNumber target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefícios" className="py-24" style={{ background: "rgba(15,23,42,0.95)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Resultados que você vai sentir</h2>
            <p className="text-slate-400 text-lg">Não prometemos software. Prometemos transformação.</p>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <FadeIn key={b.label} delay={i * 0.1}>
                <div className="p-6 rounded-2xl h-full" style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.5)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${b.color}18`, border: `1px solid ${b.color}30` }}>
                    <b.icon size={22} style={{ color: b.color }} />
                  </div>
                  <p className="text-white font-bold text-lg mb-1">{b.label}</p>
                  <p className="text-slate-400 text-sm">{b.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="módulos" className="py-24" style={{ background: "#0F172A" }}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Uma plataforma. Todos os módulos.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Do primeiro contato ao pós-venda, do técnico de campo ao CEO — tudo conectado, tudo inteligente.</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {modules.map((mod, i) => (
              <FadeIn key={mod.label} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4, borderColor: `${mod.color}50` }}
                  className="p-6 rounded-2xl cursor-pointer h-full transition-colors"
                  style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(51,65,85,0.4)" }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${mod.color}18` }}>
                    <mod.icon size={20} style={{ color: mod.color }} />
                  </div>
                  <p className="text-white font-semibold mb-2">{mod.label}</p>
                  <p className="text-slate-500 text-sm">{mod.desc}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-24" style={{ background: "rgba(15,23,42,0.97)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-6" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06B6D4" }}>
                <Brain size={12} /> Nexora Brain
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Sua empresa tem agora um cérebro digital</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">O Nexora Brain analisa todos os dados da sua empresa em tempo real — vendas, atendimento, financeiro, equipe — e age como um consultor empresarial disponível 24/7.</p>
              <div className="space-y-4">
                {["Detecta riscos de cancelamento antes que aconteçam", "Gera relatórios executivos em segundos", "Sugere automações para eliminar gargalos", "Prevê demanda e otimiza equipes proativamente"].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.2)" }}>
                      <Check size={11} style={{ color: "#10B981" }} />
                    </div>
                    <span className="text-slate-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.5)" }}>
                <div className="p-4 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(6,182,212,0.2))", borderBottom: "1px solid rgba(51,65,85,0.5)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(6,182,212,0.2)" }}>
                    <Brain size={16} style={{ color: "#06B6D4" }} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Nexora Brain</p>
                    <p className="text-slate-500 text-xs">Consultando dados em tempo real</p>
                  </div>
                  <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { q: "Qual o risco financeiro desta semana?", a: "Identifiquei 3 contratos em risco de cancelamento (R$ 87.400). Recomendo contato imediato com Empresa A, B e C. Taxa de inadimplência subiu 4pp — acione a régua de cobrança." },
                    { q: "Como está a equipe de suporte?", a: "Equipe operando a 92% de produtividade. 7 chamados P1 próximos do SLA. Carlos Santos destaque do mês com 48 OS concluídas. Gargalo detectado: categoria Redes (68% dos chamados)." },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-end">
                        <div className="px-3 py-2 rounded-xl rounded-br-sm text-sm text-white max-w-xs" style={{ background: "rgba(37,99,235,0.6)" }}>{item.q}</div>
                      </div>
                      <div className="flex justify-start">
                        <div className="px-3 py-2 rounded-xl rounded-bl-sm text-slate-300 text-sm max-w-xs" style={{ background: "rgba(51,65,85,0.6)" }}>{item.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-24" style={{ background: "#0F172A" }}>
        <div className="max-w-4xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Calcule sua economia</h2>
            <p className="text-slate-400">Veja quanto a Nexora pode economizar para sua empresa</p>
          </FadeIn>
          <FadeIn>
            <div className="p-8 rounded-2xl" style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.5)" }}>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Funcionários na empresa</label>
                  <input type="range" min={5} max={200} value={roiUsers} onChange={e => setRoiUsers(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: "#2563EB" }} />
                  <p className="text-white font-bold text-lg mt-2">{roiUsers} funcionários</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Salário médio (R$)</label>
                  <input type="range" min={2000} max={15000} step={500} value={roiSalary} onChange={e => setRoiSalary(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: "#06B6D4" }} />
                  <p className="text-white font-bold text-lg mt-2">R$ {roiSalary.toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <div className="p-6 rounded-xl text-center" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(6,182,212,0.1))", border: "1px solid rgba(37,99,235,0.3)" }}>
                <p className="text-slate-400 text-sm mb-1">Economia mensal estimada com automação</p>
                <p className="text-5xl font-black" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  R$ {savings.toLocaleString("pt-BR")}
                </p>
                <p className="text-slate-500 text-sm mt-2">baseado em 30% de ganho de produtividade</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Use Cases */}
      <section id="casos-de-uso" className="py-24" style={{ background: "rgba(15,23,42,0.95)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Para quem a Nexora foi feita</h2>
            <p className="text-slate-400">Especializada para empresas de serviços técnicos e tecnologia</p>
          </FadeIn>
          <FadeIn>
            <div className="flex flex-wrap gap-3 justify-center">
              {useCases.map(uc => (
                <div key={uc} className="px-5 py-3 rounded-xl font-medium text-sm text-slate-300 transition-colors hover:text-white cursor-default" style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.5)" }}>
                  {uc}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24" style={{ background: "#0F172A" }}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">O que nossos clientes dizem</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="p-6 rounded-2xl h-full" style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(51,65,85,0.4)" }}>
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={14} fill="#F59E0B" style={{ color: "#F59E0B" }} />)}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="preços" className="py-24" style={{ background: "rgba(15,23,42,0.97)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Planos para cada momento</h2>
            <p className="text-slate-400">Comece pequeno, cresça sem limites</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 0.1}>
                <div className={`p-8 rounded-2xl h-full flex flex-col relative ${plan.highlight ? "ring-2" : ""}`}
                  style={{ background: plan.highlight ? "rgba(37,99,235,0.1)" : "rgba(30,41,59,0.6)", border: plan.highlight ? "1px solid rgba(37,99,235,0.5)" : "1px solid rgba(51,65,85,0.4)", ringColor: "#2563EB" }}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-slate-400 text-sm font-medium mb-2">{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-slate-500 text-sm">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check size={14} style={{ color: plan.highlight ? "#06B6D4" : "#10B981" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/app/dashboard">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-8 py-3 rounded-xl font-semibold text-sm transition-all"
                      style={plan.highlight ? { background: "linear-gradient(135deg,#2563EB,#1d4ed8)", color: "white" } : { background: "rgba(51,65,85,0.5)", color: "white", border: "1px solid rgba(71,85,105,0.7)" }}
                    >
                      {plan.name === "Enterprise" ? "Falar com vendas" : "Começar agora"}
                    </motion.button>
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16" style={{ background: "#0F172A", borderTop: "1px solid rgba(51,65,85,0.4)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Shield, label: "LGPD Compliant", desc: "100% em conformidade" },
              { icon: Lock, label: "AES-256", desc: "Criptografia de ponta" },
              { icon: Globe, label: "99.9% Uptime", desc: "SLA garantido" },
              { icon: BarChart3, label: "SOC 2 Type II", desc: "Certificação em andamento" },
            ].map(item => (
              <FadeIn key={item.label}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}>
                    <item.icon size={20} style={{ color: "#2563EB" }} />
                  </div>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ background: "rgba(15,23,42,0.97)", borderTop: "1px solid rgba(51,65,85,0.3)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Pronto para transformar sua empresa?</h2>
            <p className="text-slate-400 text-lg mb-10">Junte-se a mais de 1.200 empresas que escolheram a Nexora como seu Sistema Operacional Empresarial.</p>
            <Link href="/app/dashboard">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 24px 60px rgba(37,99,235,0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-5 rounded-2xl text-xl font-black text-white inline-flex items-center gap-3"
                style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}
              >
                Acessar a Plataforma <ArrowRight size={22} />
              </motion.button>
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t" style={{ borderColor: "rgba(51,65,85,0.4)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2563EB,#06B6D4)" }}>
              <span className="text-white font-black text-xs">N</span>
            </div>
            <span className="text-slate-400 text-sm">Nexora AI Business OS — Transformando operações em resultados.</span>
          </div>
          <p className="text-slate-600 text-xs">© 2025 Nexora AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
