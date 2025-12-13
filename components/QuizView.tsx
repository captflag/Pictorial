import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, Trophy, RefreshCcw, AlertCircle, ChevronRight } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[qIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => selectedAnswers.reduce((s, a, i) => a === questions[i].correctAnswerIndex ? s + 1 : s, 0);
  const resetQuiz = () => { setSelectedAnswers(new Array(questions.length).fill(-1)); setShowResults(false); };
  const allAnswered = selectedAnswers.every(a => a !== -1);

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="animate-in zoom-in-95 duration-500">
        <div className="glass-card p-10 rounded-3xl text-center mb-8 bg-white shadow-xl shadow-slate-200">
          <div className="inline-flex p-6 bg-yellow-100 text-yellow-600 rounded-full mb-6 shadow-sm">
            <Trophy size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Quiz Complete!</h2>
          <p className="text-slate-500 mb-8 text-lg">You scored <span className="text-slate-900 font-bold">{score}</span> out of {questions.length}</p>
          
          <div className="w-full bg-slate-100 rounded-full h-6 mb-8 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
               <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <button 
            onClick={resetQuiz}
            className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCcw size={18} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="glass-panel p-8 rounded-3xl relative bg-white border border-slate-200 shadow-sm">
          <div className="absolute top-8 left-8 w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-100">
            {qIndex + 1}
          </div>
          <h3 className="ml-12 font-bold text-xl text-slate-900 mb-8">{q.question}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                onClick={() => handleSelect(qIndex, oIndex)}
                className={`p-5 rounded-2xl text-left font-medium transition-all duration-200 border relative overflow-hidden group ${
                  selectedAnswers[qIndex] === oIndex
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md'
                    : 'border-slate-100 bg-slate-50 shadow-sm hover:border-brand-200 hover:bg-white text-slate-600'
                }`}
              >
                <span className="relative z-10">{option}</span>
                {selectedAnswers[qIndex] === oIndex && (
                   <div className="absolute top-1/2 right-4 -translate-y-1/2 text-brand-600"><CheckCircle2 size={20} /></div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-6 flex justify-end">
        <button
          onClick={() => setShowResults(true)}
          disabled={!allAnswered}
          className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform ${
            allAnswered 
              ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:scale-105 shadow-brand-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
          }`}
        >
          Check Results
        </button>
      </div>
    </div>
  );
};