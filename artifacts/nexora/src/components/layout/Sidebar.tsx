import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Ticket, Wrench, Wallet, MessageSquare, BrainCircuit, Trophy, Zap, Settings, LogOut } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "CRM", href: "/app/crm", icon: Users },
  { name: "Tickets", href: "/app/tickets", icon: Ticket },
  { name: "Field Service", href: "/app/field-service", icon: Wrench },
  { name: "RH", href: "/app/hr", icon: Users },
  { name: "Financeiro", href: "/app/finance", icon: Wallet },
  { name: "Omnichannel", href: "/app/omnichannel", icon: MessageSquare },
  { name: "Cérebro Nexora", href: "/app/ai", icon: BrainCircuit },
  { name: "Gamificação", href: "/app/gamification", icon: Trophy },
  { name: "Automações", href: "/app/automations", icon: Zap },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Nexora</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-600/10 text-cyan-400 font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
          <Settings className="h-5 w-5" />
          <span>Configurações</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md cursor-pointer transition-colors mt-1">
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </div>
      </div>
    </div>
  );
}
