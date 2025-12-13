import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { Video, Image as ImageIcon, Loader2, Play, AlertCircle } from 'lucide-react';

export const VideoView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); }, 2000); 
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
            <Video size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Veo Studio</h2>
            <p className="text-slate-500">Text-to-Video Generation Engine</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your scene in detail..."
            className="w-full h-32 p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-pink-200 outline-none resize-none text-lg text-slate-900 placeholder-slate-400"
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
            Generate Cinematic Video
          </button>
        </form>
      </div>
    </div>
  );
};