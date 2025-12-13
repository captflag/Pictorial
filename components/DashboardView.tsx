import React, { useMemo } from 'react';
import { User, UserHistory } from '../types';
import { Trophy, Flame, BookOpen, Clock, TrendingUp, Calendar, ArrowRight, Brain, Target, Star, Sparkles, RotateCcw } from 'lucide-react';
import { AchievementsGrid, calculateAchievements } from './AchievementSystem';

interface DashboardViewProps {
   user: User;
   onHistoryClick: (topic: string) => void;
}

// Helper to generate personalized recommendations
const generateRecommendations = (history: UserHistory[], userClass: string): { topic: string; reason: string }[] => {
   const recommendations: { topic: string; reason: string }[] = [];

   // 1. Continue where you left off
   if (history.length > 0) {
      const lastTopic = history[0].topic;
      // Extract subject from topic if it contains class info
      const subjectMatch = lastTopic.match(/Class \d+ (\w+)/);
      if (subjectMatch) {
         recommendations.push({
            topic: lastTopic,
            reason: 'Continue learning'
         });
      }
   }

   // 2. Subject-based suggestions based on history
   const subjectCounts: Record<string, number> = {};
   history.forEach(h => {
      const match = h.topic.match(/(Mathematics|Physics|Chemistry|Biology|English|Hindi|Science|Social Science|Computer)/i);
      if (match) {
         subjectCounts[match[1]] = (subjectCounts[match[1]] || 0) + 1;
      }
   });

   // Find most studied subject and suggest next topic
   const mostStudiedSubject = Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
   if (mostStudiedSubject) {
      const advancedTopics: Record<string, string[]> = {
         'Mathematics': ['Quadratic Equations', 'Trigonometry', 'Statistics', 'Probability'],
         'Physics': ['Laws of Motion', 'Thermodynamics', 'Wave Optics', 'Electromagnetism'],
         'Chemistry': ['Chemical Bonding', 'Organic Chemistry', 'Electrochemistry', 'Coordination Compounds'],
         'Biology': ['Cell Division', 'Human Physiology', 'Genetics', 'Ecology'],
         'Science': ['Acids and Bases', 'Light Reflection', 'Electricity', 'Magnetic Effects'],
      };

      const topics = advancedTopics[mostStudiedSubject] || [];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      if (randomTopic && !history.some(h => h.topic.includes(randomTopic))) {
         recommendations.push({
            topic: `CBSE Class ${userClass} ${mostStudiedSubject} - ${randomTopic}`,
            reason: `Based on your ${mostStudiedSubject} progress`
         });
      }
   }

   // 3. General recommendations based on class
   const generalTopics: Record<string, string[]> = {
      '10': ['CBSE Class 10 Science - Chemical Reactions', 'CBSE Class 10 Mathematics - Real Numbers', 'CBSE Class 10 Science - Life Processes'],
      '11': ['CBSE Class 11 Physics - Kinematics', 'CBSE Class 11 Chemistry - Atomic Structure', 'CBSE Class 11 Mathematics - Sets'],
      '12': ['CBSE Class 12 Physics - Electrostatics', 'CBSE Class 12 Chemistry - Solutions', 'CBSE Class 12 Mathematics - Relations and Functions'],
   };

   const classTopics = generalTopics[userClass] || generalTopics['10'];
   classTopics.forEach(topic => {
      if (!history.some(h => h.topic === topic) && recommendations.length < 4) {
         recommendations.push({
            topic,
            reason: 'Recommended for you'
         });
      }
   });

   // Ensure we have at least 3 recommendations
   const fallbackTopics = ['Photosynthesis', 'Periodic Table', 'Algebraic Expressions'];
   while (recommendations.length < 3) {
      const topic = fallbackTopics[recommendations.length] || 'Quantum Physics';
      recommendations.push({
         topic: `CBSE Class ${userClass} - ${topic}`,
         reason: 'Popular topic'
      });
   }

   return recommendations.slice(0, 4);
};

// Calculate streak multiplier
const getStreakMultiplier = (streak: number): number => {
   if (streak >= 30) return 3;
   if (streak >= 14) return 2.5;
   if (streak >= 7) return 2;
   if (streak >= 3) return 1.5;
   return 1;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ user, onHistoryClick }) => {

   const achievements = useMemo(() =>
      calculateAchievements(user.xp, user.streak, user.history),
      [user.xp, user.streak, user.history]
   );

   const recommendations = useMemo(() =>
      generateRecommendations(user.history, user.class),
      [user.history, user.class]
   );

   const streakMultiplier = getStreakMultiplier(user.streak);
   const unlockedCount = achievements.filter(a => a.unlocked).length;

   const stats = [
      { label: 'Total XP', value: user.xp.toLocaleString(), icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
      { label: 'Day Streak', value: `${user.streak}${streakMultiplier > 1 ? ` (${streakMultiplier}x)` : ''}`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
      { label: 'Activities', value: user.history.length, icon: Brain, color: 'text-brand-600', bg: 'bg-brand-50' },
      { label: 'Badges', value: `${unlockedCount}/${achievements.length}`, icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-50' },
   ];

   // Calculate next level progress
   const currentLevel = Math.floor(user.xp / 1000) + 1;
   const nextLevelXP = currentLevel * 1000;
   const prevLevelXP = (currentLevel - 1) * 1000;
   const progressPercent = ((user.xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

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

               {/* Level Progress Bar */}
               <div className="mt-4 max-w-md">
                  <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-brand-600">Level {currentLevel}</span>
                     <span className="text-slate-400">{user.xp - prevLevelXP} / {nextLevelXP - prevLevelXP} XP to Level {currentLevel + 1}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                     <div
                        className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                     />
                  </div>
               </div>
            </div>

            <div className="flex gap-4 relative z-10">
               {streakMultiplier > 1 && (
                  <div className="text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
                     <div className="text-xs font-bold uppercase tracking-wider opacity-90">Streak Bonus</div>
                     <div className="font-black text-xl">{streakMultiplier}x XP</div>
                  </div>
               )}
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

         {/* Achievements Section */}
         <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Trophy className="text-yellow-500" /> Achievements
            </h2>
            <AchievementsGrid achievements={achievements} />
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
                     {user.history.slice(0, 10).map((item) => (
                        <div
                           key={item.id}
                           onClick={() => onHistoryClick(item.topic)}
                           className="glass-panel p-4 rounded-2xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
                           role="button"
                           tabIndex={0}
                           aria-label={`View ${item.topic}`}
                           onKeyDown={(e) => e.key === 'Enter' && onHistoryClick(item.topic)}
                        >
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'QUIZ' ? 'bg-orange-50 text-orange-600' :
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
                              <RotateCcw size={16} />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {/* Streak Card */}
               <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl shadow-orange-200 border-none relative overflow-hidden">
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-2 opacity-90">
                        <Flame size={20} /> <span className="text-sm font-bold uppercase tracking-wider">Current Streak</span>
                     </div>
                     <div className="text-4xl font-black mb-2">{user.streak} Days</div>
                     {streakMultiplier > 1 && (
                        <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-bold mb-3">
                           🔥 {streakMultiplier}x XP Multiplier Active!
                        </div>
                     )}
                     <p className="text-white/80 text-sm leading-relaxed">
                        {user.streak < 3
                           ? "Keep learning daily to unlock streak bonuses!"
                           : user.streak < 7
                              ? "Maintain your streak to reach 2x XP at 7 days!"
                              : "Amazing dedication! Keep it up!"}
                     </p>
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-4 translate-y-4">
                     <Flame size={120} />
                  </div>
               </div>

               {/* Personalized Recommendations */}
               <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Sparkles className="text-brand-600" size={18} /> Recommended For You
                  </h3>
                  <ul className="space-y-3">
                     {recommendations.map((rec, i) => (
                        <li key={i}>
                           <button
                              onClick={() => onHistoryClick(rec.topic)}
                              className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700 flex flex-col group"
                           >
                              <span className="flex justify-between items-center">
                                 <span className="truncate">{rec.topic.split(' - ').pop() || rec.topic}</span>
                                 <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0 ml-2" />
                              </span>
                              <span className="text-xs text-slate-400 mt-1">{rec.reason}</span>
                           </button>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Daily Goal */}
               <div className="glass-panel p-6 rounded-3xl bg-white border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <Target className="text-emerald-500" size={18} /> Daily Goal
                  </h3>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold">
                           {Math.min(user.history.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length, 3)}/3
                        </div>
                        <div className="flex-1">
                           <div className="text-sm font-medium text-slate-700">Learn 3 topics today</div>
                           <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                 className="h-full bg-emerald-500 transition-all"
                                 style={{
                                    width: `${Math.min(user.history.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).length / 3 * 100, 100)}%`
                                 }}
                              />
                           </div>
                        </div>
                     </div>
                     <p className="text-xs text-slate-500">Complete your daily goal for bonus XP!</p>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
};