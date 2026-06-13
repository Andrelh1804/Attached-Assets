import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between px-6 bg-slate-900 border-b border-slate-800">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar em toda empresa..." 
            className="w-full bg-slate-800 border-slate-700 text-slate-200 pl-9 focus-visible:ring-cyan-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500"></span>
        </button>
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
          <User className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
