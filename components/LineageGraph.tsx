import React, { useState } from 'react';
import { ArrowRight, Database, Table, Zap, DollarSign, X, Code2, Terminal, Info } from 'lucide-react';
import { DBT_MODELS } from '../constants';
import { DbtModel } from '../types';

const LineageGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<DbtModel | null>(null);

  const renderNode = (modelId: string, icon: React.ReactNode, title: string, desc: string, colorClass: string) => {
    const model = DBT_MODELS.find(m => m.id === modelId);
    return (
      <div 
        onClick={() => model && setSelectedNode(model)}
        className={`p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-${colorClass}-400 hover:shadow-md transition-all cursor-pointer group relative`}
      >
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <span className="text-sm font-semibold truncate">{title}</span>
        </div>
        <p className="text-xs text-slate-500">{desc}</p>
        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[8px] rounded font-bold">SQL</span>
          <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[8px] rounded font-bold">DOCS</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">dbt Lineage Explorer</h2>
          <p className="text-sm text-slate-500">Interactive Medallion Architecture DAG. Click nodes to inspect compiled artifacts.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span> Staging
            <span className="w-2 h-2 rounded-full bg-purple-400 ml-2"></span> Intermediate
            <span className="w-2 h-2 rounded-full bg-green-400 ml-2"></span> Marts
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto relative">
        <div className="flex items-start justify-between gap-8 min-w-[1200px] relative p-4">
          {/* Staging Layer */}
          <div className="space-y-4 w-64 z-10">
            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase w-fit mb-4">Staging (Bronze)</div>
            {renderNode('stg_events', <Database size={16} className="text-blue-500" />, 'stg_netflix__events', 'Raw event deduplication.', 'blue')}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer opacity-60">
              <div className="flex items-center gap-3 mb-2">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm font-semibold truncate">stg_netflix__subs</span>
              </div>
              <p className="text-xs text-slate-500">Subscription & Billing Data.</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-400 transition-colors cursor-pointer opacity-60">
              <div className="flex items-center gap-3 mb-2">
                <Database size={16} className="text-slate-400" />
                <span className="text-sm font-semibold truncate">stg_catalog__costs</span>
              </div>
              <p className="text-xs text-slate-500">Finance Catalog Ingestion.</p>
            </div>
          </div>

          <ArrowRight className="mt-24 text-slate-300" />

          {/* Intermediate Layer */}
          <div className="space-y-4 w-72 z-10">
            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase w-fit mb-4">Intermediate (Silver)</div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl border-l-4 border-l-purple-500 hover:shadow-md transition-all cursor-pointer opacity-60">
              <div className="flex items-center gap-3 mb-2">
                <Zap size={16} className="text-purple-500" />
                <span className="text-sm font-semibold truncate">int_daily_engagement</span>
              </div>
              <p className="text-xs text-slate-500">Aggregated watch-time metrics.</p>
            </div>
            {renderNode('int_subs_scd2', <Zap size={16} className="text-purple-500" />, 'int_subscription_scd2', 'SCD Type 2 Lifecycle Tracking.', 'purple')}
          </div>

          <ArrowRight className="mt-24 text-slate-300" />

          {/* Marts Layer */}
          <div className="space-y-4 w-72 z-10">
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase w-fit mb-4">Marts (Gold)</div>
            {renderNode('fct_mrr', <Table size={16} className="text-green-600" />, 'fct_mrr', 'Financial truth. Normalized Revenue.', 'green')}
            <div className="p-4 bg-slate-50 border-2 border-red-500 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign size={16} className="text-red-600" />
                <span className="text-sm font-bold text-slate-900 truncate">fct_content_profit</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Profitability Attribution Model.</p>
            </div>
          </div>
        </div>

        {/* Model Inspector Panel */}
        {selectedNode && (
          <div className="absolute top-0 right-0 w-[500px] h-full bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Terminal size={20} className="text-red-500" />
                <div>
                  <h3 className="font-bold text-sm">{selectedNode.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedNode.layer} Layer Artifact</p>
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Info size={12} /> Model Context
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 italic">
                  "{selectedNode.description}"
                </p>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Code2 size={12} /> Compiled BigQuery SQL
                </h4>
                <div className="bg-slate-900 rounded-xl p-6 overflow-hidden">
                  <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                    {selectedNode.compiledSql}
                  </pre>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Model Statistics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">EXECUTION TIME</p>
                    <p className="text-sm font-bold text-slate-800">4.2s (Avg)</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">PARTITIONING</p>
                    <p className="text-sm font-bold text-slate-800">event_date (DAY)</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-8 pb-4">
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Architectural Partitioning</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">Transformation logic leverages temporal partitioning strategies to optimize query performance at billion-row scale in BigQuery.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Attribution Strategy</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">Revenue is dynamically allocated to content titles based on weighted engagement shares within specific billing windows using window functions.</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Governance Framework</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">Comprehensive CI/CD integration ensures referential integrity and prevents regression in calculated financial margins via dbt-cloud.</p>
        </div>
      </div>
    </div>
  );
};

export default LineageGraph;