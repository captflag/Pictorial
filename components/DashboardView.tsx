import React from 'react';
import { User, UserHistory } from '../types';
import { Trophy, Flame, BookOpen, Clock, TrendingUp, Calendar, ArrowRight, Brain, Target, Star } from 'lucide-react';

interface DashboardViewProps {
  user: User;
  onHistoryClick: (topic: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onHistoryClick }) => {
  
  const stats = [
    { label: 'Total XP', value: user.xp, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Day Streak', value: user.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Activities', value: user.history.length, icon: Brain, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Level', value: Math.floor(user.xp / 1000) + 1, icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Profile */}
      <div className="glass-panel p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
         
         <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0 relative z-10">
            {user.name.charAt(0)}
         </div>
         
         <div className="text-center md:text-left flex-1 relative z-10">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back, {user.name}!</h1>
            <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2">
              <BookOpen size={16} /> Class {user.class} Student • Joined {new Date(user.joinedDate).toLocaleDateString()}
            </p>
         </div>

         <div className="flex gap-4 relative z-10">
            <div className="text-center px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
               <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Goal</div>
               <div className="text-brand-600 font-bold">{(Math.floor(user.xp/1000) + 1) * 1000} XP</div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {stats.map((stat, i) => (
           <div key={i} className="glass-panel p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                 <stat.icon size={24} />
              </div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* History Column */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Clock className="text-brand-600" /> Recent Activity
               </h2>
            </div>

            {user.history.length === 0 ? (
               <div className="glass-panel p-12 rounded-3xl bg-white border-dashed border-2 border-slate-200 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="font-bold text-slate-700">No activity yet</h3>
                  <p className="text-slate-500 text-sm mt-1">Start by searching for a topic or taking a quiz!</p>
               </div>
            ) : (
               <div className="space-y-3">
                  {user.history.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => onHistoryClick(item.topic)}
                      className="glass-panel p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
                    >
                       <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                         item.type === 'QUIZ' ? 'bg-orange-50 text-orange-600' :
                         item.type === 'PRACTICE' ? 'bg-blue-50 text-blue-600' :
                         'bg-brand-50 text-brand-600'
                       }`}>
                          {item.type === 'QUIZ' ? <Trophy size={20} /> : item.type === 'PRACTICE' ? <Target size={20} /> : <BookOpen size={20} />}
                       </div>
                       
                       <div className="flex-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{item.topic}</h4>
                          <div className="text-xs text-slate-500 flex gap-2 mt-1">
                             <span>{new Date(item.date).toLocaleDateString()}</span>
                             <span>•</span>
                             <span className="uppercase font-bold text-xs tracking-wider">{item.type}</span>
                             {item.score && <span className="text-brand-600 font-bold">• {item.score} XP</span>}
                          </div>
                       </div>
                       
                       <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                          <ArrowRight size={16} />
                       </div>
                    </div>
                  ))}
               </div>
            )}
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            {/* Streak Card */}
            <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl shadow-orange-200 border-none relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2 opacity-90">
                    <Flame size={20} /> <span className="text-sm font-bold uppercase tracking-wider">Current Streak</span>
                 </div>
                 <div className="text-4xl font-black mb-4">{user.streak} Days</div>
                 <p className="text-white/80 text-sm leading-relaxed">
                   Keep learning daily to increase your multiplier and unlock badges!
                 </p>
               </div>
               <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                  <Flame size={120} />
               </div>
            </div>

            {/* Recommendations Mockup */}
            <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Target className="text-blue-600" size={18} /> Recommended
               </h3>
               <ul className="space-y-3">
                 {['Advanced Calculus', 'Organic Reactions', 'Newton Laws'].map((t, i) => (
                   <li key={i}>
                     <button 
                       onClick={() => onHistoryClick(t)}
                       className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700 flex justify-between group"
                     >
                       {t}
                       <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                     </button>
                   </li>
                 ))}
               </ul>
            </div>
         </div>

      </div>
    </div>
  );
};