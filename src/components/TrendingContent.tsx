import React, { useState } from 'react';
import { DetailedContent } from '../types';
import { 
  Star, 
  TrendingUp, 
  Globe, 
  Info, 
  ChevronRight, 
  BarChart3,
  MapPin,
  Play
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { motion } from 'motion/react';

interface TrendingContentProps {
  type: 'show' | 'movie' | 'anime';
  data: DetailedContent[];
}

const TrendingContent: React.FC<TrendingContentProps> = ({ type, data }) => {
  const [selectedItem, setSelectedItem] = useState<DetailedContent | null>(data[0] || null);

  if (data.length === 0) {
    return (
      <div className="p-8 h-[600px] flex flex-col items-center justify-center text-slate-500">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
          <TrendingUp size={32} className="text-slate-700" />
        </div>
        <p className="font-bold uppercase tracking-widest text-xs">No {type} data available</p>
        <p className="text-[10px] mt-2 text-slate-600">The engine is currently fetching live trends...</p>
      </div>
    );
  }

  // Ensure selectedItem is updated if data changes and current selection is null
  const currentItem = selectedItem || data[0];

  const getTitle = () => {
    if (type === 'show') return 'Trending Shows';
    if (type === 'movie') return 'Trending Movies';
    return 'Trending Anime';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="p-8 space-y-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            {getTitle()}
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Live global performance metrics and regional popularity.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar List */}
        <div className="lg:col-span-4 space-y-4">
          {data.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group ${
                currentItem.id === item.id 
                  ? 'bg-red-600 border-red-500 shadow-lg shadow-red-600/20' 
                  : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`font-bold transition-colors ${currentItem.id === item.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                      <Star size={10} fill="currentColor" />
                      {item.rating}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {item.genres[0]} • {item.type}
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className={currentItem.id === item.id ? 'text-white/50' : 'text-slate-700'} />
              </div>
            </button>
          ))}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-8 space-y-8">
          {/* Hero Section */}
          <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60"></div>
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Trending #{data.findIndex(d => d.id === currentItem.id) + 1}
                </span>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {currentItem.rating} / 10
                </div>
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                {currentItem.title}
              </h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {currentItem.genres.map((genre, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-400 border border-white/10 px-2 py-0.5 rounded uppercase tracking-widest">
                    {genre}
                  </span>
                ))}
              </div>
              <p className="text-slate-400 text-sm max-w-xl leading-relaxed mb-8">
                {currentItem.description}
              </p>
              <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors">
                <Play size={16} fill="currentColor" />
                Watch Trailer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Trend Graph */}
            <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                <TrendingUp size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Popularity Trend</h3>
              </div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentItem.trendData}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      itemStyle={{ color: '#ef4444' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTrend)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Regional Popularity */}
            <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                <MapPin size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Regional Popularity</h3>
              </div>
              <div className="space-y-4">
                {currentItem.popularityByRegion.map((reg, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                      <span>{reg.region}</span>
                      <span className="text-slate-300">{reg.popularity}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600 rounded-full"
                        style={{ width: `${reg.popularity}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Episode Ratings (for shows) */}
          {type === 'show' && currentItem.episodes && (
            <div className="bg-slate-900/50 rounded-3xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6 text-slate-400">
                <BarChart3 size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Episode Ratings (Latest Season)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentItem.episodes}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="episode" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} domain={[0, 10]} />
                    <Tooltip 
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
                      {currentItem.episodes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.rating > 8.5 ? '#ef4444' : '#475569'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TrendingContent;
