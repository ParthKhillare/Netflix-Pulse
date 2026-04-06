import React, { useState } from 'react';
import { Send, Bot, User, Paperclip, Mic } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Netflix market intelligence assistant. I can help you analyze trends, explore content performance, and provide insights from the live data. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Based on the current market data, I can see that global revenue is showing strong growth with a 14.2% increase. The trending content analysis suggests that drama series continue to dominate viewership. Would you like me to dive deeper into any specific metrics?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Market Assistant</h3>
              <p className="text-xs text-slate-400">AI-powered insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="text-red-500" size={14} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-200 border border-white/10'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-red-200' : 'text-slate-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="text-slate-400" size={14} />
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="text-red-500" size={14} />
              </div>
              <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-white/10">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about market trends..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 text-white placeholder-slate-500"
            />
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Mic size={20} />
            </button>
            <button
              onClick={handleSend}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
