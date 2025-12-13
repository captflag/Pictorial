import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Circle, Clock, TrendingUp, RotateCcw } from 'lucide-react';

interface ReadingSection {
    id: string;
    title: string;
    completed: boolean;
    timeSpent?: number; // seconds
}

interface ReadingProgressProps {
    topicId: string;
    sections: { title: string; id: string }[];
    onSectionComplete?: (sectionId: string) => void;
}

const STORAGE_KEY = 'pictorial_reading_progress';

// Reading Progress Service
export const readingProgressService = {
    getProgress: (topicId: string): ReadingSection[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const data = saved ? JSON.parse(saved) : {};
            return data[topicId] || [];
        } catch {
            return [];
        }
    },

    saveProgress: (topicId: string, sections: ReadingSection[]): void => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const data = saved ? JSON.parse(saved) : {};
            data[topicId] = sections;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save reading progress:', e);
        }
    },

    markComplete: (topicId: string, sectionId: string, timeSpent: number = 0): void => {
        const sections = readingProgressService.getProgress(topicId);
        const updated = sections.map(s =>
            s.id === sectionId ? { ...s, completed: true, timeSpent } : s
        );
        readingProgressService.saveProgress(topicId, updated);
    },

    resetProgress: (topicId: string): void => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const data = saved ? JSON.parse(saved) : {};
            delete data[topicId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to reset progress:', e);
        }
    },

    getOverallStats: (): { topicsStarted: number; sectionsCompleted: number; totalTime: number } => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            const data = saved ? JSON.parse(saved) : {};

            let topicsStarted = 0;
            let sectionsCompleted = 0;
            let totalTime = 0;

            Object.values(data).forEach((sections: any) => {
                if (sections.length > 0) topicsStarted++;
                sections.forEach((s: ReadingSection) => {
                    if (s.completed) sectionsCompleted++;
                    totalTime += s.timeSpent || 0;
                });
            });

            return { topicsStarted, sectionsCompleted, totalTime };
        } catch {
            return { topicsStarted: 0, sectionsCompleted: 0, totalTime: 0 };
        }
    },
};

// Reading Progress Component
export const ReadingProgress: React.FC<ReadingProgressProps> = ({
    topicId,
    sections,
    onSectionComplete,
}) => {
    const [progress, setProgress] = useState<ReadingSection[]>([]);
    const [startTime, setStartTime] = useState<number>(Date.now());

    useEffect(() => {
        // Initialize or restore progress
        const saved = readingProgressService.getProgress(topicId);
        if (saved.length === 0) {
            // Initialize new progress
            const initial = sections.map(s => ({
                id: s.id,
                title: s.title,
                completed: false,
                timeSpent: 0,
            }));
            setProgress(initial);
            readingProgressService.saveProgress(topicId, initial);
        } else {
            setProgress(saved);
        }
        setStartTime(Date.now());
    }, [topicId, sections]);

    const handleToggleComplete = (sectionId: string) => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        const updated = progress.map(s =>
            s.id === sectionId
                ? { ...s, completed: !s.completed, timeSpent: s.completed ? 0 : timeSpent }
                : s
        );
        setProgress(updated);
        readingProgressService.saveProgress(topicId, updated);

        const section = updated.find(s => s.id === sectionId);
        if (section?.completed) {
            onSectionComplete?.(sectionId);
        }
    };

    const handleReset = () => {
        const reset = progress.map(s => ({ ...s, completed: false, timeSpent: 0 }));
        setProgress(reset);
        readingProgressService.saveProgress(topicId, reset);
        setStartTime(Date.now());
    };

    const completedCount = progress.filter(s => s.completed).length;
    const percentage = sections.length > 0
        ? Math.round((completedCount / sections.length) * 100)
        : 0;

    return (
        <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-600" />
                    <span className="font-bold text-slate-800 text-sm">Reading Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-600">{percentage}%</span>
                    {completedCount > 0 && (
                        <button
                            onClick={handleReset}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title="Reset progress"
                        >
                            <RotateCcw size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Sections List */}
            <div className="space-y-2">
                {progress.map((section, index) => (
                    <button
                        key={section.id}
                        onClick={() => handleToggleComplete(section.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${section.completed
                                ? 'bg-emerald-50 hover:bg-emerald-100'
                                : 'hover:bg-slate-50'
                            }`}
                    >
                        {section.completed ? (
                            <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                            <Circle size={18} className="text-slate-300 shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${section.completed ? 'text-emerald-700 line-through' : 'text-slate-700'
                            }`}>
                            {index + 1}. {section.title}
                        </span>
                        {section.completed && section.timeSpent && section.timeSpent > 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={10} />
                                {Math.floor(section.timeSpent / 60)}m
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Completion Message */}
            {percentage === 100 && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-center">
                    <span className="text-emerald-700 font-bold text-sm">
                        🎉 Section Complete!
                    </span>
                </div>
            )}
        </div>
    );
};

// Mini Progress Indicator
interface MiniProgressProps {
    topicId: string;
    totalSections: number;
}

export const MiniProgressIndicator: React.FC<MiniProgressProps> = ({
    topicId,
    totalSections,
}) => {
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        const progress = readingProgressService.getProgress(topicId);
        setCompletedCount(progress.filter(s => s.completed).length);
    }, [topicId]);

    if (completedCount === 0) return null;

    const percentage = totalSections > 0
        ? Math.round((completedCount / totalSections) * 100)
        : 0;

    return (
        <div className="flex items-center gap-2" title={`${completedCount}/${totalSections} sections completed`}>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-xs font-medium text-slate-500">{percentage}%</span>
        </div>
    );
};
