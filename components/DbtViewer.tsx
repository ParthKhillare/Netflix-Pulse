import React, { useState } from 'react';
import { DBT_MODELS } from '../constants';
import { CheckCircle2, ShieldCheck, Info, ListTree, Database, Tag } from 'lucide-react';

const DbtViewer: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(DBT_MODELS[0]);

  return (
    <div className="p-8 h-full">
      <div className="flex gap-8 h-[calc(100vh-160px)]">
        {/* Model List */}
        <div className="w-80 space-y-2 overflow-y-auto pr-2">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Model Registry</h2>
          {DBT_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => setSelectedModel(model)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                selectedModel.id === model.id 
                  ? 'bg-white border-red-200 shadow-sm ring-1 ring-red-100' 
                  : 'bg-slate-50 border-transparent hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${
                  model.layer === 'Staging' ? 'bg-blue-500' : 
                  model.layer === 'Intermediate' ? 'bg-purple-500' : 'bg-green-500'
                }`}></span>
                <span className={`text-[10px] font-black uppercase ${
                  model.layer === 'Staging' ? 'text-blue-600' : 
                  model.layer === 'Intermediate' ? 'text-purple-600' : 'text-green-600'
                }`}>{model.layer}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate">{model.name}</h3>
            </button>
          ))}
        </div>

        {/* Model Documentation View (Abstracted) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                <Database className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedModel.name}</h2>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Tag size={12} /> Managed by dbt-core
                  </span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <ListTree size={12} /> Part of Medallion Flow
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
              <ShieldCheck size={14} />
              Quality Verified
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-8 space-y-10">
            {/* Business Purpose Section */}
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Info size={14} /> Purpose & Context
              </h3>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed italic">
                {selectedModel.description}
              </div>
            </section>

            {/* Schema Table Section */}
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Column Definitions</h3>
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Column Name</th>
                      <th className="px-6 py-3">Data Type</th>
                      <th className="px-6 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedModel.schema.map((col, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">{col.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                            {col.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{col.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Verification & Tests */}
            <section>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Governance & Validation</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedModel.tests.map(test => (
                  <div key={test} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{test} check</span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">PASSED</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbtViewer;