import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrendingContent from './components/TrendingContent';
import ChatInterface from './components/ChatInterface';
import { fetchLiveNetflixBenchmarks } from './services/geminiService';
import { LiveBenchmarks } from './types';
import { 
  Zap, 
  Search, 
  Bell, 
  User,
  RefreshCw,
  Loader2,
  MessageSquare
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [liveMetrics, setLiveMetrics] = useState<LiveBenchmarks | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchLiveNetflixBenchmarks();
      setLiveMetrics(data);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
    const interval = setInterval(syncData, 300000); // Sync every 5 mins
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard liveMetrics={liveMetrics} />;
      case 'shows':
        return <TrendingContent type="show" data={liveMetrics?.trendingShows || []} />;
      case 'movies':
        return <TrendingContent type="movie" data={liveMetrics?.trendingMovies || []} />;
      case 'anime':
        return <TrendingContent type="anime" data={liveMetrics?.trendingAnime || []} />;
      default:
        return <Dashboard liveMetrics={liveMetrics} />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-slate-200 font-sans selection:bg-red-500/30 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none"></div>

        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search global ledger..." 
                className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={syncData}
              disabled={isSyncing}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {isSyncing ? 'Syncing...' : 'Live Sync'}
            </button>

            <div className="h-4 w-px bg-white/10"></div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <MessageSquare size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full border-2 border-black"></span>
              </button>
              <div className="flex items-center gap-3 pl-2">
                <div className="text-right">
                  <p className="text-xs font-black text-white leading-none">Market Analyst</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global Tier</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/10 flex items-center justify-center shadow-xl">
                  <User size={20} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {renderContent()}
          
          <footer className="p-8 border-t border-white/5 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-red-600" fill="currentColor" />
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                  Netflix Pulse &copy; 2026 • Live Market Intelligence
                </p>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-red-500 transition-colors">Privacy</a>
                <a href="#" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-red-500 transition-colors">Terms</a>
                <a href="#" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-red-500 transition-colors">API Status</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
      
      {/* Chat Interface */}
      <ChatInterface 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </div>
  );
};

export default App;
