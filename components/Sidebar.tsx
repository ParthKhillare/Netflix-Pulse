import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Database, 
  ShieldCheck, 
  MessageSquare,
  FileCode2,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Executive KPIs', icon: LayoutDashboard },
    { id: 'lineage', label: 'Data Lineage', icon: GitBranch },
    { id: 'dbt', label: 'dbt Project', icon: FileCode2 },
    { id: 'quality', label: 'Data Quality', icon: ShieldCheck },
    { id: 'bi', label: 'Product Analytics', icon: BarChart3 },
    { id: 'consultant', label: 'Architect Q&A', icon: MessageSquare },
  ];

  return (
    <div className="w-64 h-full bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-lg">S</div>
          <h1 className="font-bold text-xl tracking-tight">StreamPulse</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Analytics Engineering</p>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-red-600/10 text-red-500 font-medium border border-red-600/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-red-500' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <p className="text-xs text-slate-400 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-200">52.4M Rows Processed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;