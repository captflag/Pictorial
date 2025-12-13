import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Upload, Video, Brain, Zap, Search, Bot, User, Loader2, Sparkles, X, Mic, MicOff } from 'lucide-react';

interface ChatViewProps { topic: string; }

export const ChatView: React.FC<ChatViewProps> = ({ topic }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'smart' | 'reasoning' | 'search'>('smart');
  
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setMessages([{id: 'init', role: 'model', content: topic ? `Hi! I'm ready to discuss ${topic}.` : "Hi! How can I help?"}]); }, [topic]);

  const handleSend = async (e?: React.FormEvent) => {
      if(!input) return;
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
      setMessages(p => [...p, userMsg]);
      setInput('');
      setLoading(true);
      try {
          const res = await generateChatResponse(userMsg.content, [], { mode });
          setMessages(p => [...p, { id: Date.now().toString(), role: 'model', content: res.text || '' }]);
      } catch(e) { console.error(e) } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-[600px] glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 bg-white border-slate-200">
      
      {/* Header */}
      <div className="p-4 bg-white/50 backdrop-blur-md border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-accent-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
             <Bot size={24} />
           </div>
           <div>
             <h3 className="font-bold text-slate-900">AI Tutor</h3>
             <span className="text-xs text-brand-600 font-medium">Online • {mode} mode</span>
           </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
           {['fast', 'smart', 'reasoning', 'search'].map((m) => (
             <button 
               key={m}
               onClick={() => setMode(m as any)}
               className={`p-2 rounded-lg transition-all ${mode === m ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {m === 'fast' && <Zap size={16} />}
               {m === 'smart' && <Sparkles size={16} />}
               {m === 'reasoning' && <Brain size={16} />}
               {m === 'search' && <Search size={16} />}
             </button>
           ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-brand-50 text-brand-600 border border-brand-100'}`}>
               {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
             </div>
             <div className={`max-w-[80%] p-4 rounded-3xl shadow-sm text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white rounded-tr-sm shadow-brand-200' 
                  : 'bg-white text-slate-700 rounded-tl-sm border border-slate-200'
             }`}>
               {msg.content}
             </div>
          </div>
        ))}
        {loading && <div className="text-xs text-slate-400 text-center animate-pulse">AI is typing...</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-200 outline-none text-slate-900 shadow-inner placeholder-slate-400"
          />
          <button type="submit" className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};