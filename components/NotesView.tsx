import React from 'react';
import { FileText, Printer } from 'lucide-react';

export const NotesView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
       <div className="glass-panel p-8 rounded-3xl flex justify-between items-center bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
             <FileText size={24} />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-900">Smart Notes</h2>
             <p className="text-slate-500">AI-Synthesized Study Material</p>
           </div>
         </div>
         <button className="glass-button px-4 py-2 rounded-xl flex items-center gap-2 text-slate-600 hover:text-emerald-600 border border-slate-200">
           <Printer size={18} /> Print PDF
         </button>
       </div>
       <div className="bg-white min-h-[500px] rounded-xl shadow-lg border border-slate-200 p-12 relative">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-t-xl"></div>
         <div className="text-center text-slate-400 mt-20">Select a topic to generate notes...</div>
       </div>
    </div>
  );
};