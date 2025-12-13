import React, { useState, useEffect } from 'react';
import {
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Shuffle,
    Check,
    X,
    Sparkles,
    BookOpen,
    Loader2,
    Plus
} from 'lucide-react';

export interface Flashcard {
    id: string;
    front: string;
    back: string;
    mastered: boolean;
}

interface FlashcardViewProps {
    cards: Flashcard[];
    topic: string;
    onUpdateCard?: (id: string, mastered: boolean) => void;
    onGenerateMore?: () => void;
    isGenerating?: boolean;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
    cards,
    topic,
    onUpdateCard,
    onGenerateMore,
    isGenerating = false
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(cards);
    const [showMastered, setShowMastered] = useState(true);

    useEffect(() => {
        const filtered = showMastered ? cards : cards.filter(c => !c.mastered);
        setShuffledCards(filtered);
        setCurrentIndex(0);
        setIsFlipped(false);
    }, [cards, showMastered]);

    const currentCard = shuffledCards[currentIndex];
    const masteredCount = cards.filter(c => c.mastered).length;
    const progress = cards.length > 0 ? (masteredCount / cards.length) * 100 : 0;

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % shuffledCards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + shuffledCards.length) % shuffledCards.length);
        }, 150);
    };

    const handleShuffle = () => {
        const shuffled = [...shuffledCards].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
    };

    const handleMastery = (mastered: boolean) => {
        if (currentCard) {
            onUpdateCard?.(currentCard.id, mastered);
            handleNext();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case ' ':
            case 'Enter':
                e.preventDefault();
                setIsFlipped(!isFlipped);
                break;
            case 'ArrowLeft':
                handlePrev();
                break;
            case 'ArrowRight':
                handleNext();
                break;
            case 'ArrowUp':
                handleMastery(true);
                break;
            case 'ArrowDown':
                handleMastery(false);
                break;
        }
    };

    if (cards.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="glass-panel p-12 rounded-3xl bg-white border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={40} className="text-brand-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Flashcards Yet</h3>
                    <p className="text-slate-500 mb-6">Generate flashcards from your study notes or quiz questions.</p>
                    {onGenerateMore && (
                        <button
                            onClick={onGenerateMore}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-brand-700 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                            Generate Flashcards
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (shuffledCards.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="glass-panel p-12 rounded-3xl bg-white border border-slate-200 text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">All Cards Mastered! 🎉</h3>
                    <p className="text-slate-500 mb-6">You've mastered all {cards.length} flashcards.</p>
                    <button
                        onClick={() => setShowMastered(true)}
                        className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                    >
                        Review All Cards
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="max-w-2xl mx-auto space-y-6"
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{topic} Flashcards</h2>
                    <p className="text-sm text-slate-500">
                        {currentIndex + 1} of {shuffledCards.length} • {masteredCount}/{cards.length} mastered
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMastered(!showMastered)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${showMastered ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                            }`}
                    >
                        {showMastered ? 'Hide Mastered' : 'Show All'}
                    </button>
                    <button
                        onClick={handleShuffle}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Shuffle cards"
                    >
                        <Shuffle size={20} />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Flashcard */}
            <div
                className="perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div
                    className={`relative w-full h-80 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                        }`}
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                >
                    {/* Front */}
                    <div
                        className="absolute inset-0 glass-panel p-8 rounded-3xl bg-white border-2 border-slate-200 flex flex-col items-center justify-center backface-hidden"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4">Question</div>
                        <p className="text-xl font-medium text-slate-800 text-center leading-relaxed">
                            {currentCard?.front}
                        </p>
                        <div className="absolute bottom-4 text-xs text-slate-400">
                            Click or press Space to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 glass-panel p-8 rounded-3xl bg-gradient-to-br from-brand-50 to-accent-50 border-2 border-brand-200 flex flex-col items-center justify-center"
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                        }}
                    >
                        <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4">Answer</div>
                        <p className="text-xl font-medium text-slate-800 text-center leading-relaxed">
                            {currentCard?.back}
                        </p>
                        {currentCard?.mastered && (
                            <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                ✓ Mastered
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePrev}
                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleMastery(false)}
                        className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                        <X size={18} /> Still Learning
                    </button>
                    <button
                        onClick={() => handleMastery(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition-colors"
                    >
                        <Check size={18} /> Mastered
                    </button>
                </div>

                <button
                    onClick={handleNext}
                    className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Keyboard Hints */}
            <div className="text-center text-xs text-slate-400 space-x-4">
                <span>← / → Navigate</span>
                <span>Space Flip</span>
                <span>↑ Mastered</span>
                <span>↓ Learning</span>
            </div>

            {/* Generate More */}
            {onGenerateMore && (
                <div className="text-center">
                    <button
                        onClick={onGenerateMore}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-2 px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        Generate More Cards
                    </button>
                </div>
            )}
        </div>
    );
};
