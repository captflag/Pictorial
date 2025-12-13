import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, Trophy, RefreshCcw, AlertCircle, ChevronRight, Timer, Clock, Zap, Award, Share2 } from 'lucide-react';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, totalTime: number) => void;
}

type QuizMode = 'standard' | 'timed' | 'speed';

const QUIZ_MODES = [
  { id: 'standard' as QuizMode, label: 'Standard', icon: CheckCircle2, description: 'No time limit', color: 'brand' },
  { id: 'timed' as QuizMode, label: 'Timed', icon: Timer, description: '60s per question', color: 'orange' },
  { id: 'speed' as QuizMode, label: 'Speed Run', icon: Zap, description: 'Race the clock', color: 'red' },
];

export const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete }) => {
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalTime, setTotalTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  // Timer effect for timed mode
  useEffect(() => {
    if (mode !== 'timed' || !isTimerRunning || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this question
          handleTimeUp();
          return 60; // Reset for next question
        }
        return prev - 1;
      });
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isTimerRunning, currentQuestion, showResults]);

  // Speed run timer
  useEffect(() => {
    if (mode !== 'speed' || !isTimerRunning || showResults) return;

    const timer = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isTimerRunning, showResults]);

  const handleTimeUp = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeLeft(60);
    } else {
      setShowResults(true);
      setIsTimerRunning(false);
    }
  }, [currentQuestion, questions.length]);

  const startQuiz = (selectedMode: QuizMode) => {
    setMode(selectedMode);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestion(0);
    setShowResults(false);
    setTimeLeft(60);
    setTotalTime(0);
    setTimedOut(false);
    setIsTimerRunning(selectedMode !== 'standard');
  };

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[qIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    // Auto-advance in timed/speed mode
    if (mode === 'timed' || mode === 'speed') {
      if (qIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(qIndex + 1);
          if (mode === 'timed') setTimeLeft(60);
        }, 300);
      }
    }
  };

  const calculateScore = () => selectedAnswers.reduce((s, a, i) => a === questions[i].correctAnswerIndex ? s + 1 : s, 0);

  const resetQuiz = () => {
    setMode(null);
    setSelectedAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
    setCurrentQuestion(0);
    setTimeLeft(60);
    setTotalTime(0);
    setIsTimerRunning(false);
  };

  const allAnswered = selectedAnswers.every(a => a !== -1);

  const submitQuiz = () => {
    setShowResults(true);
    setIsTimerRunning(false);
    const score = calculateScore();
    onComplete?.(score, totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareResults = async () => {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const text = `🎓 I scored ${score}/${questions.length} (${percentage}%) on Pictorial Quiz! ${mode === 'speed' ? `⚡ Time: ${formatTime(totalTime)}` : ''}\n\nTry it yourself: https://github.com/captflag/Pictorial`;

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  // Mode Selection Screen
  if (!mode) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Choose Quiz Mode</h2>
          <p className="text-slate-500">Select how you want to take this quiz</p>
        </div>

        <div className="grid gap-4">
          {QUIZ_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => startQuiz(m.id)}
              className={`glass-panel p-6 rounded-2xl text-left hover:shadow-lg transition-all group bg-white border border-slate-200 flex items-center gap-5`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-${m.color}-50 text-${m.color}-600 group-hover:scale-110 transition-transform`}>
                <m.icon size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">{m.label}</h3>
                <p className="text-slate-500 text-sm">{m.description}</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Results Screen
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
          <p className="text-slate-500 mb-4 text-lg">
            You scored <span className="text-slate-900 font-bold">{score}</span> out of {questions.length}
          </p>

          {(mode === 'timed' || mode === 'speed') && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-slate-600 font-medium mb-6">
              <Clock size={16} />
              Total Time: {formatTime(totalTime)}
            </div>
          )}

          <div className="w-full bg-slate-100 rounded-full h-6 mb-8 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-brand-500 to-accent-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Answer Review */}
          <div className="text-left mb-8 space-y-4">
            <h3 className="font-bold text-slate-700 mb-4">Review Answers:</h3>
            {questions.map((q, i) => {
              const isCorrect = selectedAnswers[i] === q.correctAnswerIndex;
              return (
                <div key={i} className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                    ) : (
                      <XCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm mb-1">{q.question}</p>
                      {!isCorrect && (
                        <p className="text-xs text-slate-600">
                          <span className="text-red-600">Your answer: {q.options[selectedAnswers[i]] || 'Not answered'}</span>
                          <br />
                          <span className="text-green-600">Correct: {q.options[q.correctAnswerIndex]}</span>
                        </p>
                      )}
                      {q.optionExplanations && (
                        <p className="text-xs text-slate-500 mt-1">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={resetQuiz}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Try Again
            </button>
            <button
              onClick={shareResults}
              className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center gap-2"
            >
              <Share2 size={18} /> Share Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Timed/Speed Mode - One Question at a Time
  if (mode === 'timed' || mode === 'speed') {
    const q = questions[currentQuestion];

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in">
        {/* Progress & Timer Header */}
        <div className="glass-panel p-4 rounded-2xl mb-6 bg-white border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">Question {currentQuestion + 1}/{questions.length}</span>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {mode === 'timed' && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-orange-100 text-orange-600'
              }`}>
              <Timer size={18} />
              {timeLeft}s
            </div>
          )}

          {mode === 'speed' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold">
              <Zap size={18} />
              {formatTime(totalTime)}
            </div>
          )}
        </div>

        {/* Question Card */}
        <div className="glass-panel p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <h3 className="font-bold text-2xl text-slate-900 mb-8">{q.question}</h3>

          <div className="space-y-3">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                onClick={() => handleSelect(currentQuestion, oIndex)}
                className={`w-full p-5 rounded-2xl text-left font-medium transition-all duration-200 border ${selectedAnswers[currentQuestion] === oIndex
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-md'
                    : 'border-slate-100 bg-slate-50 hover:border-brand-200 hover:bg-white text-slate-600'
                  }`}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-500">
                    {String.fromCharCode(65 + oIndex)}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation for manual advancement */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 text-slate-500 disabled:opacity-30"
            >
              ← Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="px-8 py-3 bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-xl font-bold shadow-lg"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="px-6 py-2 text-brand-600 font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Mode - All Questions Visible
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
                className={`p-5 rounded-2xl text-left font-medium transition-all duration-200 border relative overflow-hidden group ${selectedAnswers[qIndex] === oIndex
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
          onClick={submitQuiz}
          disabled={!allAnswered}
          className={`px-10 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all transform ${allAnswered
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