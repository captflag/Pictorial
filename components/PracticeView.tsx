import React, { useState } from 'react';
import { generatePracticeQuestions, gradeStudentAnswer } from '../services/geminiService';
import { PracticeQuestion, GradingResult } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { 
  FileQuestion, 
  Star, 
  Filter, 
  BookOpen, 
  Play, 
  CheckCircle2, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Award,
  AlertCircle,
  PenTool,
  Eye,
  Send
} from 'lucide-react';

interface PracticeViewProps {
  onAddXP: (amount: number) => void;
}

const CBSE_CLASSES = [
  { id: '6', label: 'Class 6' },
  { id: '7', label: 'Class 7' },
  { id: '8', label: 'Class 8' },
  { id: '9', label: 'Class 9' },
  { id: '10', label: 'Class 10' },
  { id: '11', label: 'Class 11' },
  { id: '12', label: 'Class 12' },
];

const GET_SUBJECTS = (classId: string) => {
  const num = parseInt(classId);
  if (num <= 10) return ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Computer'];
  return ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Economics', 'Accountancy', 'Business Studies', 'History', 'Geography', 'Pol. Science'];
};

const QuestionCard: React.FC<{ 
  question: PracticeQuestion; 
  onAddXP: (n: number) => void;
}> = ({ question, onAddXP }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const handleGrade = async () => {
    if (!userAnswer.trim()) return;
    setIsGrading(true);
    try {
      const result = await gradeStudentAnswer(question.question, userAnswer, question.answer, question.marks);
      setGrading(result);
      if (result.score >= question.marks * 0.6) {
        onAddXP(result.score * 10);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl animate-in slide-in-from-bottom-4 duration-500 border border-slate-200 relative overflow-hidden group bg-white shadow-sm">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <FileQuestion size={120} className="text-slate-900"/>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${question.type === 'PYQ' || question.year ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-brand-50 text-brand-700 border-brand-200'}`}>
            {question.type === 'MCQ' ? '1 Mark' : `${question.marks} Marks`}
          </span>
          {question.year && (
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <Star size={10} fill="currentColor" /> {question.year}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-6 relative z-10 leading-relaxed">
        {question.question}
      </h3>

      {/* Answer Area */}
      <div className="space-y-4 relative z-10">
        {!grading ? (
          <div className="space-y-3">
             <textarea 
               value={userAnswer}
               onChange={(e) => setUserAnswer(e.target.value)}
               placeholder="Type your answer here..."
               className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-brand-200 outline-none resize-none placeholder-slate-400 transition-all"
             />
             <div className="flex gap-3">
               <button 
                 onClick={handleGrade}
                 disabled={isGrading || !userAnswer}
                 className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-200 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isGrading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
                 {isGrading ? 'Evaluating...' : 'Submit & Grade'}
               </button>
               <button 
                 onClick={() => setShowSolution(!showSolution)}
                 className="px-4 py-3 glass-button rounded-xl text-slate-500 hover:text-brand-600 flex items-center gap-2 border border-slate-200"
               >
                 <Eye size={18} /> {showSolution ? 'Hide' : 'Peek'} Solution
               </button>
             </div>
          </div>
        ) : (
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Score Obtained</div>
                  <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
                    {grading.score} <span className="text-lg text-slate-400 font-medium">/ {grading.maxMarks}</span>
                  </div>
                </div>
                <button onClick={() => setGrading(null)} className="text-xs text-slate-500 hover:text-brand-600 underline">Re-attempt</button>
             </div>
             
             <div className="space-y-3 mb-4">
               <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
                 <strong className="text-green-700 block mb-1 text-xs uppercase">Feedback</strong>
                 {grading.feedback}
               </div>
               {grading.improvements.length > 0 && (
                 <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
                   <strong className="text-orange-700 block mb-1 text-xs uppercase">Improvement Areas</strong>
                   <ul className="list-disc list-inside space-y-1 opacity-90">
                     {grading.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                   </ul>
                 </div>
               )}
             </div>
             
             <button 
                onClick={() => setShowSolution(!showSolution)}
                className="w-full py-2 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors border border-slate-200"
             >
               {showSolution ? 'Hide Official Answer' : 'Compare with Official Answer'}
             </button>
          </div>
        )}

        {/* Official Solution Reveal */}
        {showSolution && (
          <div className="mt-4 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
               <CheckCircle2 size={14} /> Official Marking Scheme
            </div>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{question.answer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const PracticeView: React.FC<PracticeViewProps> = ({ onAddXP }) => {
  const [cls, setCls] = useState('10');
  const [subject, setSubject] = useState('Science');
  const [topic, setTopic] = useState('');
  const [isPYQ, setIsPYQ] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setQuestions([]);
    try {
      const qs = await generatePracticeQuestions(cls, subject, topic, isPYQ);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
       
       {/* Configuration Header */}
       <div className="glass-panel p-6 rounded-3xl border-b border-slate-200 sticky top-28 z-30 shadow-xl shadow-slate-200/50 bg-white">
          <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 w-full">
                {/* Class */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Class</label>
                  <div className="relative">
                    <select 
                      value={cls} 
                      onChange={(e) => { setCls(e.target.value); setSubject(GET_SUBJECTS(e.target.value)[0]); }}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {CBSE_CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Subject</label>
                  <div className="relative">
                    <select 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {GET_SUBJECTS(cls).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-1 col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Topic / Chapter</label>
                   <input 
                     value={topic}
                     onChange={(e) => setTopic(e.target.value)}
                     placeholder="e.g. Electricity, Algebra..."
                     className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400"
                   />
                </div>
             </div>

             {/* Actions */}
             <div className="flex items-center gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setIsPYQ(!isPYQ)}
                  className={`h-[46px] px-4 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${isPYQ ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  <Star size={14} fill={isPYQ ? "currentColor" : "none"} /> PYQ Mode
                </button>
                <button 
                  onClick={handleGenerate}
                  disabled={loading || !topic}
                  className="h-[46px] px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap"
                >
                   {loading ? <RefreshCw className="animate-spin" size={16} /> : <Play fill="currentColor" size={16} />}
                   {loading ? 'Generating...' : 'Start Test'}
                </button>
             </div>
          </div>
       </div>

       {/* Content Area */}
       <div className="min-h-[400px]">
          {loading ? (
             <LoadingSpinner message="Curating high-yield questions..." />
          ) : questions.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q) => (
                   <QuestionCard key={q.id} question={q} onAddXP={onAddXP} />
                ))}
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                   <PenTool size={40} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-400">Ready for Practice?</h3>
                <p className="text-slate-500 max-w-md text-center mt-2">
                   Select your class, subject, and topic above to generate a customized test with instant AI evaluation.
                </p>
             </div>
          )}
       </div>
    </div>
  );
};