import React, { useState, useEffect } from 'react';
import { simulateExperiment, generateEducationalImage, getExperimentSuggestions } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { Chemical, Reactant, ExperimentResult } from '../types';
import { FlaskConical, Atom, RefreshCw, Zap, ShieldAlert, BookOpen, AlertTriangle, Sparkles, Play, Thermometer, Gauge, Plus, Trash2, Beaker, Pipette, Droplets, Box, Activity } from 'lucide-react';

export const LabView: React.FC<{topic: string}> = ({ topic }) => {
  const [labType, setLabType] = useState<'Chemistry' | 'Physics'>('Chemistry');

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in zoom-in-95">
      
      <div className="glass-panel p-2 rounded-2xl flex gap-2 bg-white shadow-sm border-slate-200">
         {['Chemistry', 'Physics'].map(t => (
           <button 
             key={t} 
             onClick={() => setLabType(t as any)}
             className={`flex-1 py-3 rounded-xl font-bold transition-all ${
               labType === t 
                 ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                 : 'text-slate-500 hover:bg-slate-50'
             }`}
           >
             {t === 'Chemistry' ? <FlaskConical className="inline mr-2" size={18}/> : <Atom className="inline mr-2" size={18}/>}
             {t} Lab
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Inventory Panel */}
        <div className="lg:col-span-4 glass-card rounded-3xl p-6 flex flex-col h-full bg-white border-slate-200 shadow-sm">
           <div className="flex items-center gap-2 mb-6 text-slate-400 text-xs font-bold uppercase tracking-wider">
             <Box size={14} /> Inventory
           </div>
           {/* Placeholder for list logic - reusing same structure but styled */}
           <div className="flex-1 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
             <span>Select Chemicals</span>
           </div>
        </div>

        {/* Workbench Panel */}
        <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border border-slate-200 relative overflow-hidden bg-white shadow-lg">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-accent-500"></div>
           
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <Activity className="text-brand-600" /> Workbench
             </h3>
             <div className="flex gap-4">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Temp</span>
                   <span className="font-mono text-brand-600 font-bold">25°C</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Press</span>
                   <span className="font-mono text-accent-600 font-bold">1.0 atm</span>
                </div>
             </div>
           </div>

           <div className="flex-1 flex items-center justify-center min-h-[300px]">
              <div className="relative w-64 h-64 border-4 border-slate-100 rounded-full flex items-center justify-center bg-slate-50 shadow-inner">
                 <FlaskConical size={64} className="text-slate-300" />
                 <div className="absolute inset-0 border-4 border-t-brand-400 rounded-full animate-spin opacity-40"></div>
              </div>
           </div>

           <button className="w-full py-4 mt-6 bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-200 hover:shadow-brand-300 transition-all flex justify-center items-center gap-2">
             <Play fill="currentColor" /> Run Simulation
           </button>
        </div>
      </div>
    </div>
  );
};