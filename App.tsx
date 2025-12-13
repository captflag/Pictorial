import React, { useState, useEffect, useRef } from 'react';
import { generateLessonPlan, getCourseChapters } from './services/geminiService';
import { userService } from './services/userService';
import { LessonPlan, ViewMode, User } from './types';
import { VisualView } from './components/VisualView';
import { TheoryView } from './components/TheoryView';
import { QuizView } from './components/QuizView';
import { LabView } from './components/LabView';
import { ChatView } from './components/ChatView';
import { VideoView } from './components/VideoView';
import { PracticeView } from './components/PracticeView';
import { NotesView } from './components/NotesView';
import { ResearchView } from './components/ResearchView';
import { DashboardView } from './components/DashboardView';
import { AuthModal } from './components/AuthModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { 
  Search, 
  BookOpen, 
  Image as ImageIcon, 
  GraduationCap, 
  Layout, 
  ChevronDown,
  ChevronRight,
  School,
  FlaskConical,
  Brain,
  Rocket,
  Layers,
  CheckCircle2,
  XCircle,
  Zap,
  MessageCircle,
  Video,
  Bot,
  Cpu,
  FileQuestion,
  Sparkles,
  FileText,
  Trophy,
  Loader2,
  List,
  Globe,
  Star,
  Aperture,
  Box,
  Component,
  User as UserIcon,
  LogOut
} from 'lucide-react';

const CBSE_CLASSES = [
  { id: '5', label: 'Class 5' },
  { id: '6', label: 'Class 6' },
  { id: '7', label: 'Class 7' },
  { id: '8', label: 'Class 8' },
  { id: '9', label: 'Class 9' },
  { id: '10', label: 'Class 10' },
  { id: '11', label: 'Class 11' },
  { id: '12', label: 'Class 12' },
];

const GET_SUBJECTS = (classId: string) => {
  const basic = ['Mathematics', 'English', 'Hindi', 'Computer Science'];
  const numClass = parseInt(classId);

  if (numClass <= 5) return ['Mathematics', 'EVS', 'English', 'Hindi', 'Computer Science'];
  if (numClass <= 10) return ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer Science', 'Sanskrit'];
  
  const allSenior = Array.from(new Set([
    'Mathematics', 'English', 'Computer Science',
    'Physics', 'Chemistry', 'Biology',
    'Accountancy', 'Business Studies', 'Economics',
    'History', 'Geography', 'Political Science', 'Sociology', 'Psychology'
  ]));
  return allSenior.sort();
};

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App State
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LessonPlan | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.THEORY);
  const [error, setError] = useState<string | null>(null);
  
  // Legacy XP for guest users (sync with user.xp if logged in)
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem('pictorial_xp') || '0'));
  const [showXpAnim, setShowXpAnim] = useState(false);

  const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
  const [activeClass, setActiveClass] = useState<string>('10'); 
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [chapterCache, setChapterCache] = useState<Record<string, string[]>>({});
  const [loadingChapters, setLoadingChapters] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Load User Session
  useEffect(() => {
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setXp(currentUser.xp); // Sync XP
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsSubjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem('pictorial_xp', xp.toString());
  }, [xp]);

  const addXP = (amount: number) => {
    setXp(prev => prev + amount);
    setShowXpAnim(true);
    setTimeout(() => setShowXpAnim(false), 1000);

    // Update User Record if logged in
    if (user) {
      const updatedUser = { ...user, xp: user.xp + amount };
      setUser(updatedUser);
      userService.updateUser(updatedUser);
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setXp(loggedInUser.xp);
  };

  const handleLogout = () => {
    userService.logout();
    setUser(null);
    setXp(0);
    setData(null);
    setViewMode(ViewMode.THEORY);
  };

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    if (overrideQuery) setQuery(overrideQuery);

    setLoading(true);
    setError(null);
    setData(null);
    setIsSubjectMenuOpen(false); 

    try {
      const result = await generateLessonPlan(searchQuery);
      setData(result);
      setViewMode(ViewMode.THEORY);
      
      // Record Activity if logged in
      if (user) {
        const updatedUser = userService.addHistory(user.id, {
          topic: result.topic,
          type: 'LESSON',
          score: 10
        });
        if (updatedUser) setUser(updatedUser);
      }
      
      addXP(10);
    } catch (err) {
      setError("Failed to generate content. Please try a different topic or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = async (subject: string) => {
    setActiveSubject(subject);
    const cacheKey = `${activeClass}-${subject}`;
    if (chapterCache[cacheKey]) return;

    setLoadingChapters(true);
    try {
      const chapters = await getCourseChapters(activeClass, subject);
      setChapterCache(prev => ({...prev, [cacheKey]: chapters}));
    } catch (e) {
      console.error("Failed to load chapters", e);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleChapterSelect = (chapter: string) => {
    const searchQuery = `CBSE Class ${activeClass} ${activeSubject} - ${chapter}`;
    handleSearch(undefined, searchQuery);
  };

  const isStandaloneMode = 
    viewMode === ViewMode.CHAT || 
    viewMode === ViewMode.VIDEO || 
    viewMode === ViewMode.PRACTICE || 
    viewMode === ViewMode.NOTES ||
    viewMode === ViewMode.RESEARCH ||
    viewMode === ViewMode.DASHBOARD;

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-300 ${
        viewMode === mode 
          ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-200 shadow-sm' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-brand-600'
      }`}
    >
      <Icon size={18} className={viewMode === mode ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500'} />
      <span>{label}</span>
      {viewMode === mode && <ChevronRight size={14} className="ml-auto opacity-70" />}
    </button>
  );

  return (
    <div className="min-h-screen font-sans selection:bg-brand-100 selection:text-brand-800">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />

      {/* Floating Dock Navbar */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 no-print pointer-events-none">
        <header className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-6 shadow-xl shadow-slate-200/50 pointer-events-auto max-w-7xl w-full">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => {setData(null); setQuery(''); setViewMode(ViewMode.THEORY);}}
          >
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-200 to-accent-200 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-300">
                 <Aperture size={24} className="text-brand-600 relative z-10 animate-spin-slow group-hover:text-brand-700 transition-colors" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none group-hover:text-brand-600 transition-colors duration-300">
                Pictorial
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-brand-400 transition-colors">
                Visual Intelligence
              </span>
            </div>
          </div>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
             {[
               { m: ViewMode.CHAT, i: Bot, l: "AI Tutor" },
               { m: ViewMode.RESEARCH, i: Globe, l: "Research" },
               { m: ViewMode.VIDEO, i: Video, l: "Studio" },
               { m: ViewMode.PRACTICE, i: FileQuestion, l: "Practice" },
               { m: ViewMode.NOTES, i: FileText, l: "Notes" },
             ].map(item => (
               <button 
                 key={item.m}
                 onClick={() => setViewMode(item.m)}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                   viewMode === item.m 
                    ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                 }`}
               >
                 <item.i size={16} />
                 {item.l}
               </button>
             ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
             {/* Subject Menu Trigger */}
             <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsSubjectMenuOpen(!isSubjectMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isSubjectMenuOpen ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' : 'glass-button text-slate-600'
                  }`}
                >
                  <School size={16} />
                  <span className="hidden md:inline">Subjects</span>
                  <ChevronDown size={14} />
                </button>

                {/* Mega Menu (Light Glass Style) */}
                {isSubjectMenuOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[800px] max-w-[90vw] glass-panel rounded-3xl shadow-2xl p-2 flex overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200 z-50 bg-white/90">
                    <div className="w-1/4 p-2 space-y-1 bg-slate-50/50 rounded-l-2xl">
                      <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Class</div>
                      {CBSE_CLASSES.map((cls) => (
                        <button
                          key={cls.id}
                          onClick={() => { setActiveClass(cls.id); setActiveSubject(null); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition-all ${
                            activeClass === cls.id ? 'bg-white shadow-sm text-brand-600 ring-1 ring-slate-100' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {cls.label}
                          {activeClass === cls.id && <ChevronRight size={14} />}
                        </button>
                      ))}
                    </div>
                    <div className="w-1/4 p-2 border-l border-slate-100 bg-white/30">
                       <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</div>
                       <div className="space-y-1 h-[300px] overflow-y-auto custom-scrollbar">
                         {GET_SUBJECTS(activeClass).map((subject) => (
                           <button
                             key={subject}
                             onClick={() => handleSubjectClick(subject)}
                             className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeSubject === subject ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                             }`}
                           >
                             {subject}
                           </button>
                         ))}
                       </div>
                    </div>
                    <div className="w-1/2 p-4 bg-slate-50/80 rounded-r-2xl border-l border-slate-100">
                      <div className="flex items-center gap-2 mb-3 px-2">
                        <List size={14} className="text-brand-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curriculum Index</span>
                      </div>
                      <div className="h-[280px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                         {!activeSubject ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-70">
                              <BookOpen size={32} className="mb-2" />
                              <span className="text-sm">Select Subject</span>
                           </div>
                         ) : loadingChapters ? (
                           <div className="h-full flex items-center justify-center">
                              <Loader2 className="animate-spin text-brand-500" />
                           </div>
                         ) : (
                            chapterCache[`${activeClass}-${activeSubject}`]?.map((ch, i) => (
                              <button
                                key={i}
                                onClick={() => handleChapterSelect(ch)}
                                className="w-full text-left px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all group flex gap-3"
                              >
                                <span className="text-xs font-bold text-slate-400 group-hover:text-brand-500 mt-0.5">{i+1}</span>
                                <span className="text-sm font-medium text-slate-700 group-hover:text-brand-700">{ch}</span>
                              </button>
                            ))
                         )}
                      </div>
                    </div>
                  </div>
                )}
             </div>

             {/* Auth & XP */}
             <div className="flex items-center gap-3 pl-3 border-l border-slate-200/50">
               {user ? (
                 <div className="flex items-center gap-3">
                   {/* User Profile Trigger */}
                   <button 
                     onClick={() => setViewMode(ViewMode.DASHBOARD)}
                     className={`flex items-center gap-2 px-1 pr-3 py-1 rounded-full transition-all border ${
                        viewMode === ViewMode.DASHBOARD 
                          ? 'bg-brand-50 border-brand-200' 
                          : 'bg-white border-transparent hover:bg-slate-50'
                     }`}
                   >
                     <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                       {user.name.charAt(0)}
                     </div>
                     <div className="flex flex-col text-left">
                       <span className="text-xs font-bold text-slate-700 leading-none">{user.name.split(' ')[0]}</span>
                       <span className="text-[10px] font-bold text-brand-600 leading-none mt-0.5">Lv. {Math.floor(user.xp/1000)+1}</span>
                     </div>
                   </button>
                   
                   <button 
                     onClick={handleLogout}
                     className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                     title="Logout"
                   >
                     <LogOut size={16} />
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={() => setIsAuthModalOpen(true)}
                   className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
                 >
                   <UserIcon size={16} /> Login
                 </button>
               )}
             </div>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen" role="main">
        
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingSpinner message="Orchestrating Lesson Plan..." />
          </div>
        )}

        {error && (
          <div className="glass-card p-8 rounded-3xl text-center max-w-md mx-auto mt-20 bg-white">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Connection Interrupted</h3>
            <p className="text-slate-500 mb-6">{error}</p>
            <button 
              onClick={() => handleSearch(undefined, query)}
              className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* --- LANDING HERO --- */}
        {!loading && !data && !error && !isStandaloneMode && (
          <div className="flex flex-col items-center justify-center py-10 relative">
            
            {/* 3D Scene Background */}
            <div className="scene-3d opacity-60">
               <div className="cube-wrapper">
                 <div className="cube-face face-front"><Box size={40} strokeWidth={1}/></div>
                 <div className="cube-face face-back"><Component size={40} strokeWidth={1}/></div>
                 <div className="cube-face face-right"><Brain size={40} strokeWidth={1}/></div>
                 <div className="cube-face face-left"><Globe size={40} strokeWidth={1}/></div>
                 <div className="cube-face face-top"><Sparkles size={40} strokeWidth={1}/></div>
                 <div className="cube-face face-bottom"><Zap size={40} strokeWidth={1}/></div>
               </div>
               <div className="orbit orbit-1"></div>
               <div className="orbit orbit-2"></div>
            </div>

            <div className="text-center max-w-4xl mx-auto mb-16 relative z-10 mt-10">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-brand-600 text-sm font-bold mb-8 animate-in slide-in-from-bottom-4 border-brand-200 bg-white/80">
                 <Sparkles size={16} /> <span>AI-Powered Visual Learning</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                 Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-violet-600 to-accent-600">Visually.</span><br/>
                 Understand <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-brand-600">Instantly.</span>
               </h1>
               <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
                 Stop memorizing dry text. Pictorial turns any topic into interactive diagrams, virtual labs, and personalized simulations.
               </p>

               <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-brand-300 to-accent-300 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                 <div className="relative glass-card rounded-2xl p-2 flex items-center bg-white shadow-xl">
                   <div className="pl-4 text-slate-400"><Search size={24} /></div>
                   <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What do you want to master today?"
                    className="w-full p-4 bg-transparent border-none text-lg text-slate-900 placeholder-slate-400 focus:ring-0 outline-none font-medium"
                    autoFocus
                   />
                   <button 
                    type="submit"
                    className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                   >
                     Generate
                   </button>
                 </div>
               </form>

               <div className="mt-8 flex flex-wrap justify-center gap-3">
                 {["Quantum Physics", "Human Heart", "French Revolution", "Organic Chemistry"].map(topic => (
                   <button
                     key={topic}
                     onClick={() => handleSearch(undefined, topic)}
                     className="px-5 py-2 glass-button rounded-full text-slate-500 text-sm font-semibold hover:text-brand-600 bg-white border-slate-200"
                   >
                     {topic}
                   </button>
                 ))}
               </div>
            </div>

            {/* Bento Grid Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full relative z-10">
               {[
                 { t: "AI Visuals", d: "Text to Diagram", i: ImageIcon, c: "text-blue-600", b: "bg-blue-50" },
                 { t: "Virtual Labs", d: "Simulate Safely", i: FlaskConical, c: "text-purple-600", b: "bg-purple-50" },
                 { t: "Smart Notes", d: "Auto-Summarized", i: BookOpen, c: "text-emerald-600", b: "bg-emerald-50" },
                 { t: "Adaptive Quiz", d: "Test Knowledge", i: Brain, c: "text-orange-600", b: "bg-orange-50" }
               ].map((f, i) => (
                 <div key={i} className="glass-panel p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 bg-white border-slate-100 shadow-sm">
                    <div className={`w-14 h-14 ${f.b} ${f.c} rounded-2xl flex items-center justify-center mb-4`}>
                      <f.i size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{f.t}</h3>
                    <p className="text-slate-500 text-sm">{f.d}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- CONTENT MODE --- */}
        {!loading && (data || isStandaloneMode) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            
            {/* Dashboard View (Full Width) */}
            {viewMode === ViewMode.DASHBOARD && user && (
              <div className="col-span-12">
                <DashboardView user={user} onHistoryClick={(t) => handleSearch(undefined, t)} />
              </div>
            )}

            {/* Sticky Sidebar Navigation */}
            {viewMode !== ViewMode.DASHBOARD && data && (
              <div className="lg:col-span-3">
                <div className="sticky top-28 space-y-6">
                  <div className="glass-panel p-6 rounded-3xl bg-white border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{data.topic}</h2>
                    <div className="flex gap-2 mb-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-600`}>
                        {data.difficulty}
                      </span>
                    </div>

                    <nav className="space-y-1">
                      <NavItem mode={ViewMode.THEORY} icon={BookOpen} label="Theory" />
                      <NavItem mode={ViewMode.VISUAL} icon={ImageIcon} label="Visuals" />
                      <NavItem mode={ViewMode.LAB} icon={FlaskConical} label="Virtual Lab" />
                      <NavItem mode={ViewMode.QUIZ} icon={GraduationCap} label="Quiz" />
                      <div className="h-px bg-slate-100 my-2 mx-4" />
                      <NavItem mode={ViewMode.CHAT} icon={Bot} label="AI Tutor" />
                    </nav>
                  </div>
                  
                  {/* Mini Progress Card */}
                  <div className="glass-panel p-5 rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 text-white border-none shadow-xl shadow-brand-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg"><Trophy size={20} /></div>
                      <div>
                        <div className="text-xs font-medium opacity-90 uppercase">Current XP</div>
                        <div className="text-xl font-bold">{xp}</div>
                      </div>
                    </div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-white/90 h-full w-[45%]" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main View Area */}
            {viewMode !== ViewMode.DASHBOARD && (
              <div className={data ? "lg:col-span-9" : "col-span-12 max-w-5xl mx-auto w-full"}>
                {viewMode === ViewMode.THEORY && data && <TheoryView summary={data.summary} analogy={data.analogy} concepts={data.keyConcepts} />}
                {viewMode === ViewMode.VISUAL && data && <VisualView 
                  prompt={data.visualPrompt} 
                  topic={data.topic} 
                  activeClass={activeClass}
                  activeSubject={activeSubject}
                  chapters={activeSubject ? chapterCache[`${activeClass}-${activeSubject}`] || [] : []}
                  onTopicClick={(t) => handleChapterSelect(t)}
                />}
                {viewMode === ViewMode.LAB && data && <LabView topic={data.topic} />}
                {viewMode === ViewMode.QUIZ && data && <QuizView questions={data.quiz} />}
                {viewMode === ViewMode.CHAT && <ChatView topic={data?.topic || ''} />}
                {viewMode === ViewMode.VIDEO && <VideoView />}
                {viewMode === ViewMode.PRACTICE && <PracticeView onAddXP={addXP} />}
                {viewMode === ViewMode.NOTES && <NotesView />}
                {viewMode === ViewMode.RESEARCH && <ResearchView />}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default App;