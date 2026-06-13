import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface PaywallModalProps {
  isOpen: boolean;
  moduleName: string;
  requiredPlan?: "business" | "enterprise";
  onClose: () => void;
}

export function PaywallModal({ isOpen, moduleName, requiredPlan = "business", onClose }: PaywallModalProps) {
  const [, navigate] = useLocation();

  const planLabel = requiredPlan === "enterprise" ? "Enterprise" : "Business";
  const planColor = requiredPlan === "enterprise" ? "#A855F7" : "#06B6D4";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="rounded-2xl p-8 max-w-md w-full text-center"
            style={{
              background: "linear-gradient(135deg, #0F1E38, #111827)",
              border: `1px solid ${planColor}40`,
              boxShadow: `0 0 60px ${planColor}20`,
            }}
          >
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {moduleName} está bloqueado
            </h2>
            <p className="text-slate-400 mb-2">
              Este módulo requer o plano{" "}
              <span className="font-semibold" style={{ color: planColor }}>Nexora {planLabel}</span>.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Faça upgrade para desbloquear {moduleName}, automações avançadas e muito mais.
            </p>

            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onClose(); navigate("/pricing"); }}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{
                  background: `linear-gradient(135deg, ${planColor}, ${planColor}99)`,
                  boxShadow: `0 4px 20px ${planColor}30`,
                }}
              >
                Ver Planos e Preços
              </motion.button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-medium text-slate-400 hover:text-slate-300 transition-colors"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                Continuar com Starter
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
