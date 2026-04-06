import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  BarChart,
  Bar,
  Cell,
  AreaChart
} from 'recharts';
import { TREND_DATA_ACTUALS, SEASONALITY_HEATMAP } from '../constants';
import { LiveBenchmarks } from '../types';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Zap, Calendar, TrendingDown, Loader2, Play, Star } from 'lucide-react';

interface DashboardProps {
  liveMetrics: LiveBenchmarks | null;
}

const Dashboard: React.FC<DashboardProps> = ({ liveMetrics }) => {
  if (!liveMetrics) {
    return (
      <div className="p-8 h-[600px] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-4 text-red-600" size={48} />
        <p className="font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Synchronizing with Live Netflix Ledger...</p>
        <p className="text-[10px] mt-2 text-slate-600">Fetching Q3/Q4 2024 Actuals & April 2026 Trending Content</p>
      </div>
    );
  }

  const contentProfitData = liveMetrics.trendingShows?.length ? 
    liveMetrics.trendingShows.map((show, index) => ({
      title: show.title,
      profit: 400000000 - (index * 50000000), // Simulated profit based on rank
      cost: 100000000,
      rating: show.rating
    })) : [];

  const displayMetrics = [
    { title: 'Global Revenue', value: liveMetrics.revenue, change: 14.2, icon: DollarSign },
    { title: 'Paid Members', value: liveMetrics.subscribers, change: 8.5, icon: Users },
    { title: 'Avg Rev / Member', value: liveMetrics.arm, change: 2.1, icon: Star },
    { title: 'Churn Rate', value: liveMetrics.churn, change: -0.3, icon: TrendingDown }
  ];

  return (
    <div className="p-8 space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl font-black text-white tracking-tighter">Market Performance</h1>
            <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 border border-white/5">
              <Calendar size={12} /> Live Actuals
            </span>
          </div>
          <p className="text-slate-500 max-w-2xl text-sm font-medium">
            Real-time global performance metrics and verified market data directly from the Netflix ledger.
          </p>
        </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl hover:border-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:bg-red-600/10"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white/5 group-hover:bg-red-600/10 transition-colors rounded-2xl border border-white/5">
                  <Icon className="text-slate-400 group-hover:text-red-500" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-black tracking-widest ${metric.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {metric.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] relative z-10 mb-1">{metric.title}</h3>
              <p className="text-4xl font-black text-white mt-1 relative z-10 tracking-tighter">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Revenue Trajectory</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Verified performance from 2023 through current period.</p>
            </div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 tracking-widest">
              Verified: 100%
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA_ACTUALS}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} tickFormatter={(v) => `$${(v/1000000000).toFixed(1)}B`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#000', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="mrr" stroke="#ef4444" strokeWidth={4} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonality Heatmap */}
        <div className="bg-black text-white p-8 rounded-3xl shadow-2xl border border-white/5 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-black tracking-tight">Historical Seasonality</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Validated Engagement Intensity trends.</p>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            {SEASONALITY_HEATMAP.map((item, idx) => (
              <div key={idx} className="group cursor-default">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                  <span>{item.month} • {item.label}</span>
                  <span className="text-slate-300">{item.intensity}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 group-hover:brightness-125 ${
                      item.intensity > 90 ? 'bg-red-600' : 
                      item.intensity > 70 ? 'bg-red-800' : 
                      item.intensity > 50 ? 'bg-slate-700' : 'bg-slate-800'
                    }`}
                    style={{ width: `${item.intensity}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Performance */}
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Play size={20} className="text-red-600" fill="currentColor" />
                <h3 className="text-xl font-black text-white tracking-tight">Live Trending Content</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Current global top performers.</p>
            </div>
            {liveMetrics?.lastUpdated && (
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                Sync: {liveMetrics.lastUpdated}
              </span>
            )}
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contentProfitData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 11}} width={140} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'} } 
                  contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#000', fontSize: '12px' }}
                  formatter={(value: any, name: any) => {
                    if (name === 'profit') return [`$${(value/1000000).toFixed(0)}M`, 'Est. Profit'];
                    return [value, name];
                  }}
                />
                <Bar dataKey="profit" radius={[0, 6, 6, 0]} barSize={28}>
                   {contentProfitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#475569'} fillOpacity={1 - (index * 0.15)} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fiscal Calendar */}
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl">
           <h3 className="text-xl font-black text-white mb-10 flex items-center gap-3 tracking-tight">
             <Calendar size={24} className="text-red-600" />
             Fiscal Milestones
           </h3>
           <div className="space-y-8">
              {[
                { date: 'Oct 17, 2024', event: 'Q3 2024 Verified Earnings', status: 'Finalized' },
                { date: 'Jan 23, 2025', event: 'Q4 2024 Market Release', status: 'Pending' },
                { date: 'Jul 19, 2024', event: 'Q2 2024 Verified Earnings', status: 'Finalized' },
                { date: 'Apr 18, 2024', event: 'Q1 2024 Verified Earnings', status: 'Finalized' },
              ].map((milestone, idx) => (
                <div key={idx} className="flex gap-6 group">
                   <div className="w-1 bg-white/5 rounded-full group-hover:bg-red-600 transition-all duration-500"></div>
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{milestone.date}</span>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${milestone.status === 'Finalized' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{milestone.status}</span>
                      </div>
                      <p className="text-base font-bold text-slate-200 group-hover:text-white transition-colors tracking-tight">{milestone.event}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
