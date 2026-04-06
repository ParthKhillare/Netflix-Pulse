import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  Film,
  Zap,
  ShieldCheck,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Market Dashboard', icon: LayoutDashboard },
    { id: 'shows', label: 'Trending Shows', icon: Tv },
    { id: 'movies', label: 'Trending Movies', icon: Film },
    { id: 'anime', label: 'Trending Anime', icon: Sparkles },
  ];

  return (
    <div className="w-72 bg-black border-r border-white/5 flex flex-col h-full">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Zap className="text-white" size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            Pulse<span className="text-red-600">.</span>
          </h1>
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
          Live Netflix Ledger
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="px-4 mb-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Intelligence</p>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={20} className={activeTab === item.id ? 'text-white' : 'group-hover:text-red-500 transition-colors'} />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Status */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Engine Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer mb-3">
             <ShieldCheck size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Verified Data</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
             <HelpCircle size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
