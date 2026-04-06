import React from 'react';
import { BookOpen, X, Code2, Database, Zap } from 'lucide-react';

interface PortfolioOverlayProps {
  activeTab: string;
  onClose: () => void;
}

const PortfolioOverlay: React.FC<PortfolioOverlayProps> = ({ activeTab, onClose }) => {
  const getNotes = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: "Executive KPIs Architecture",
          concepts: ["Metric Layering", "Real-time Grounding", "Seasonality Heatmaps"],
          description: "This dashboard demonstrates the 'Gold' layer of a data warehouse. The 'Actuals' are fetched via Gemini's Google Search tool to ensure the portfolio reflects real market conditions, showcasing how to merge internal data with external benchmarks."
        };
      case 'lineage':
        return {
          title: "dbt Modeling Strategy",
          concepts: ["Medallion Architecture", "Directed Acyclic Graphs (DAG)", "Modular SQL"],
          description: "The lineage graph visualizes a 'Dry' (Don't Repeat Yourself) transformation logic. Note the Staging models which isolate raw data from BigQuery, and the Intermediate layer where SCD Type 2 logic is implemented to track subscription states."
        };
      case 'consultant':
        return {
          title: "LLM-Powered Data Discovery",
          concepts: ["Retrieval Augmented Generation", "System Prompt Engineering", "Prompt Context Injection"],
          description: "This isn't just a chatbot; it's a simulated 'AI Data Steward'. It is fed the project's dbt schema and BigQuery metadata, allowing it to act as a technical advisor for the specific implementation details of this stack."
        };
      default:
        return {
          title: "Technical Engineering Note",
          concepts: ["Data Quality", "SQL Optimization", "CI/CD"],
          description: "This section demonstrates the rigor required for production-grade data pipelines, focusing on schema validation and integrity checks."
        };
    }
  };

  const notes = getNotes();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="text-red-500" />
            <h2 className="text-xl font-bold">Engineering Deep-Dive</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Focus Area</h3>
            <p className="text-2xl font-bold text-slate-800">{notes.title}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {notes.concepts.map((c, i) => (
              <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
                <Zap size={10} /> {c}
              </span>
            ))}
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed">
            "{notes.description}"
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl text-white">
              <Code2 className="text-red-500" size={24} />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Coding Pattern</p>
                <p className="text-xs font-medium">Modular Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl text-white">
              <Database className="text-red-500" size={24} />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Warehouse Target</p>
                <p className="text-xs font-medium">BigQuery Multi-Region</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverlay;