import React, { useState } from 'react';
import { KeyConcept } from '../types';
import { Lightbulb, BookOpen, BrainCircuit, Star, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface TheoryViewProps {
  summary: string;
  analogy: string;
  concepts: KeyConcept[];
}

export const TheoryView: React.FC<TheoryViewProps> = ({ summary, analogy, concepts }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const handlePlayAudio = async () => {
     // ... logic
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Summary Card */}
      <section className="glass-card p-8 rounded-3xl relative overflow-hidden bg-white border border-slate-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
              <BookOpen size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Core Theory</h2>
          </div>
          <button className="glass-button px-4 py-2 rounded-full text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-100 border border-slate-200">
            <Volume2 size={16} /> Listen
          </button>
        </div>
        <p className="text-lg text-slate-700 leading-relaxed relative z-10">
          {summary}
        </p>
      </section>

      {/* Analogy Strip */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-3xl flex gap-4 items-start shadow-sm">
        <div className="p-3 bg-white text-amber-500 rounded-2xl shadow-sm shrink-0 border border-amber-100">
          <Lightbulb size={24} />
        </div>
        <div>
           <h3 className="font-bold text-amber-600 mb-1 text-sm uppercase tracking-wide">Analogy</h3>
           <p className="text-amber-900 text-lg font-medium italic leading-relaxed">"{analogy}"</p>
        </div>
      </section>

      {/* Concepts Bento Grid */}
      <section>
        <div className="flex items-center gap-3 mb-6 px-2">
          <BrainCircuit size={20} className="text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Key Concepts</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {concepts.map((concept, index) => (
            <div 
              key={index}
              className="glass-panel p-6 rounded-3xl hover:border-brand-200 transition-all duration-300 group hover:shadow-lg hover:shadow-brand-100 hover:-translate-y-1 bg-white border-slate-200"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {concept.title}
                </h3>
                <Star size={18} className="text-slate-300 group-hover:text-yellow-400 transition-colors" />
              </div>
              <p className="text-slate-600 leading-relaxed">
                {concept.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};