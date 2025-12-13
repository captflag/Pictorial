import React, { useState } from 'react';
import { researchTopic } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Globe, Search, Link as LinkIcon, ExternalLink, BookOpen, Layers } from 'lucide-react';

export const ResearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try { setResult(await researchTopic(query)); } catch(e){} finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      <div className="glass-card p-10 rounded-3xl text-center relative overflow-hidden bg-white border border-slate-200 shadow-xl shadow-blue-100">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 -z-10"></div>
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-6">
          <Globe size={32} />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Global Intelligence Agent</h2>
        
        <form onSubmit={handleResearch} className="max-w-2xl mx-auto relative mt-8">
           <input 
             value={query}
             onChange={e => setQuery(e.target.value)}
             placeholder="Initiate research scan..."
             className="w-full pl-6 pr-16 py-5 rounded-2xl bg-white border border-slate-200 shadow-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg text-slate-900 placeholder-slate-400"
           />
           <button type="submit" className="absolute right-3 top-3 bottom-3 aspect-square bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
             <Search size={20} />
           </button>
        </form>
      </div>

      {loading && <LoadingSpinner message="Scanning global database..." />}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 glass-panel p-8 rounded-3xl bg-white border-slate-200">
              <h3 className="font-bold text-2xl text-slate-900 mb-6 flex items-center gap-3">
                <BookOpen className="text-blue-600" /> Synthesis
              </h3>
              <div className="prose max-w-none text-slate-600">
                {result.content.split('\n').map((l:string, i:number) => <p key={i}>{l}</p>)}
              </div>
           </div>
           <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Citations</div>
              {result.sources.map((s:any, i:number) => (
                <a key={i} href={s.url} target="_blank" className="block glass-card p-4 rounded-xl hover:border-blue-400 transition-all group bg-white border-slate-200 shadow-sm">
                   <h4 className="font-bold text-sm text-slate-800 line-clamp-2 mb-2 group-hover:text-blue-600">{s.title}</h4>
                   <div className="flex items-center gap-2 text-xs text-slate-500">
                     <LinkIcon size={10} /> {new URL(s.url).hostname}
                   </div>
                </a>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};