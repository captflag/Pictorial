import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, BookOpen, FlaskConical, GraduationCap, Bot, Moon, Trophy } from 'lucide-react';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    targetSelector?: string;
    position?: 'center' | 'top' | 'bottom';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'welcome',
        title: 'Welcome to Pictorial! 🎨',
        description: 'Transform any topic into interactive visual experiences. Let\'s take a quick tour!',
        icon: Sparkles,
        position: 'center'
    },
    {
        id: 'search',
        title: 'Search Any Topic',
        description: 'Type any topic like "Photosynthesis" or "Quantum Physics" to generate a complete lesson plan with visuals.',
        icon: BookOpen,
        position: 'top'
    },
    {
        id: 'subjects',
        title: 'Browse Curriculum',
        description: 'Click "Subjects" to explore CBSE/NCERT chapters from Class 5-12 organized by subject.',
        icon: GraduationCap,
        position: 'top'
    },
    {
        id: 'features',
        title: 'Explore Features',
        description: 'Use AI Tutor for personalized help, Virtual Lab for experiments, and Practice for exam prep.',
        icon: FlaskConical,
        position: 'center'
    },
    {
        id: 'ai-tutor',
        title: 'Your AI Companion',
        description: 'The AI Tutor understands text, images, and even videos! Upload homework photos for instant help.',
        icon: Bot,
        position: 'center'
    },
    {
        id: 'dark-mode',
        title: 'Study Comfortably',
        description: 'Use the dark mode toggle in the header for comfortable nighttime studying.',
        icon: Moon,
        position: 'top'
    },
    {
        id: 'gamification',
        title: 'Learn & Earn',
        description: 'Earn XP for every activity, unlock badges, and maintain streaks for bonus multipliers!',
        icon: Trophy,
        position: 'center'
    }
];

const STORAGE_KEY = 'pictorial_onboarding_complete';

interface OnboardingTourProps {
    onComplete?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if user has completed onboarding
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            // Small delay before showing
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsVisible(false);
        onComplete?.();
    };

    if (!isVisible) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const Icon = step.icon;
    const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                onClick={handleSkip}
            />

            {/* Modal */}
            <div className={`fixed z-[101] animate-in zoom-in-95 fade-in duration-300 ${step.position === 'top' ? 'top-24 left-1/2 -translate-x-1/2' :
                    step.position === 'bottom' ? 'bottom-24 left-1/2 -translate-x-1/2' :
                        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                }`}>
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-[90vw] relative">
                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Skip tour"
                    >
                        <X size={20} />
                    </button>

                    {/* Progress bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-3xl overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-2">
                        <Icon size={40} />
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-3">
                        {step.title}
                    </h2>
                    <p className="text-slate-500 text-center leading-relaxed mb-8">
                        {step.description}
                    </p>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all ${currentStep === 0
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <ChevronLeft size={18} /> Back
                        </button>

                        <span className="text-sm text-slate-400">
                            {currentStep + 1} / {ONBOARDING_STEPS.length}
                        </span>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1 px-6 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all"
                        >
                            {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Skip link */}
                    <button
                        onClick={handleSkip}
                        className="block mx-auto mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Skip tour
                    </button>
                </div>
            </div>
        </>
    );
};

// Hook to reset onboarding (for testing)
export const useResetOnboarding = () => {
    return () => localStorage.removeItem(STORAGE_KEY);
};
