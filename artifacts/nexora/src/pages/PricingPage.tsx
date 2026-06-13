import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    label: "Grátis",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Para explorar a plataforma",
    color: "#64748B",
    gradient: "from-slate-600/20 to-slate-800/10",
    border: "border-slate-700",
    features: [
      "Dashboard executivo",
      "CRM & Pipeline (até 50 leads)",
      "Mesa de Serviço (até 20 tickets)",
      "RH (até 10 funcionários)",
      "Financeiro básico",
    ],
    locked: [],
    cta: "Plano Atual",
    current: true,
  },
  {
    id: "growth",
    name: "Growth",
    label: "R$ 297",
    monthlyPrice: 29700,
    yearlyPrice: 297000,
    description: "Para empresas em crescimento",
    color: "#2563EB",
    gradient: "from-blue-600/20 to-blue-900/10",
    border: "border-blue-600/60",
    features: [
      "Tudo do Starter",
      "CRM ilimitado + AI Scoring",
      "Field Service & Ordens de Trabalho",
      "Omnicanal (WhatsApp, E-mail, Chat)",
      "Gamificação de equipes",
      "Relatórios avançados",
    ],
    locked: ["Nexora Brain (IA)", "Automações avançadas"],
    cta: "Assinar Growth",
    current: false,
    popular: false,
  },
  {
    id: "business",
    name: "Business",
    label: "R$ 597",
    monthlyPrice: 59700,
    yearlyPrice: 597000,
    description: "O sistema operacional completo",
    color: "#06B6D4",
    gradient: "from-cyan-600/20 to-cyan-900/10",
    border: "border-cyan-500/60",
    features: [
      "Tudo do Growth",
      "Nexora Brain — IA preditiva",
      "Automações visuais ilimitadas",
      "API & webhooks",
      "Múltiplos workspaces",
      "Suporte prioritário",
    ],
    locked: [],
    cta: "Assinar Business",
    current: false,
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    label: "R$ 1.297",
    monthlyPrice: 129700,
    yearlyPrice: 1297000,
    description: "Para grandes operações",
    color: "#A855F7",
    gradient: "from-purple-600/20 to-purple-900/10",
    border: "border-purple-500/60",
    features: [
      "Tudo do Business",
      "SLA garantido 99.9%",
      "Gerente de conta dedicado",
      "Integrações customizadas",
      "Treinamento presencial",
      "Contrato personalizado",
    ],
    locked: [],
    cta: "Falar com Vendas",
    current: false,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [, navigate] = useLocation();

  async function handleSubscribe(plan: typeof PLANS[0]) {
    if (plan.id === "starter" || plan.current) return;
    if (plan.id === "enterprise") {
      alert("Entre em contato com nossa equipe comercial: vendas@nexora.ai");
      return;
    }

    setLoading(plan.id);
    try {
      const priceAmount = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
      const res = await fetch("/api/stripe/products");
      const { data: products } = await res.json();

      const product = (products ?? []).find((p: any) =>
        p.name.toLowerCase().includes(plan.name.toLowerCase())
      );

      if (!product || !product.prices?.length) {
        alert("Produto não encontrado no Stripe. Execute o script seed-products primeiro.");
        setLoading(null);
        return;
      }

      const interval = billing === "yearly" ? "year" : "month";
      const price = product.prices.find((p: any) => p.recurring?.interval === interval) ?? product.prices[0];

      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: price.id }),
      });
      const { url, error } = await checkoutRes.json();
      if (error) { alert(`Erro: ${error}`); setLoading(null); return; }
      window.location.href = url;
    } catch (err: any) {
      alert(`Erro ao iniciar checkout: ${err.message}`);
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F172A" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4", border: "1px solid rgba(6,182,212,0.2)" }}>
            💎 Planos & Preços
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Escolha o plano certo<br />
            <span style={{ color: "#06B6D4" }}>para sua empresa</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            De startups a grandes corporações — Nexora escala com você.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm font-medium ${billing === "monthly" ? "text-white" : "text-slate-500"}`}>
              Mensal
            </span>
            <button
              onClick={() => setBilling(b => b === "monthly" ? "yearly" : "monthly")}
              className="relative w-14 h-7 rounded-full transition-colors"
              style={{ background: billing === "yearly" ? "#2563EB" : "#334155" }}
            >
              <motion.div
                animate={{ x: billing === "yearly" ? 28 : 4 }}
                className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
              />
            </button>
            <span className={`text-sm font-medium ${billing === "yearly" ? "text-white" : "text-slate-500"}`}>
              Anual <span className="text-green-400 text-xs font-bold ml-1">−17%</span>
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 flex flex-col border ${plan.border} bg-gradient-to-b ${plan.gradient}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: "linear-gradient(90deg,#2563EB,#06B6D4)" }}>
                  Mais popular
                </div>
              )}

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: plan.color }}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.id === "starter" ? "Grátis" : plan.label}
                  </span>
                  {plan.id !== "starter" && (
                    <span className="text-slate-400 text-sm">
                      /{billing === "yearly" ? "ano" : "mês"}
                    </span>
                  )}
                </div>
                {plan.id !== "starter" && billing === "yearly" && (
                  <div className="text-xs text-green-400 font-medium">
                    Equivale a R$ {Math.round(plan.yearlyPrice / 12 / 100)}/mês
                  </div>
                )}
                <p className="text-slate-400 text-sm mt-2">{plan.description}</p>
              </div>

              <div className="space-y-2.5 flex-1 mb-6">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <span style={{ color: plan.color }} className="mt-0.5 shrink-0">✓</span>
                    {f}
                  </div>
                ))}
                {plan.locked?.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 shrink-0">🔒</span>
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={!!loading || plan.current}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: plan.current
                    ? "rgba(100,116,139,0.2)"
                    : `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                  color: plan.current ? "#64748B" : "#fff",
                  cursor: plan.current ? "default" : "pointer",
                  opacity: loading && loading !== plan.id ? 0.5 : 1,
                }}
              >
                {loading === plan.id ? "Carregando..." : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm mb-4">
            Todos os planos incluem SSL, backups diários, conformidade LGPD e suporte via e-mail.
          </p>
          <button
            onClick={() => navigate("/app/dashboard")}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            ← Voltar ao Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}
