
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { analyticsConsultant } from '../services/geminiService';
import { Send, User, Bot, Loader2, Sparkles, ExternalLink } from 'lucide-react';

const ConsultantChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Senior Analytics Engineering Consultant. I've analyzed the current Netflix simulation stack (BigQuery + dbt). How can I help you optimize your models or design new metrics today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const result = await analyticsConsultant.chat(messages, input);
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: result.text, 
      sources: result.sources 
    }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mt-4">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-bold">Architect Q&A</h2>
            <p className="text-xs text-slate-400">Powered by Gemini | Live Search Enabled</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-red-100 text-red-600' : 'bg-slate-800 text-white'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
              }`}>
                {m.content}
                
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-[11px] text-slate-600 transition-colors"
                        >
                          <span className="truncate max-w-[150px]">{source.title}</span>
                          <ExternalLink size={10} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 text-sm text-slate-400 italic">
                Architect is searching and thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about SCD Type 2, industry churn benchmarks, or metric definitions..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultantChat;
