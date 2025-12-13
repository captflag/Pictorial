import React, { useState, useEffect } from 'react';
import { Trophy, Flame, BookOpen, Brain, Beaker, Star, Target, Zap, Award, Crown, Medal, Rocket } from 'lucide-react';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    requirement: number;
    type: 'xp' | 'streak' | 'lessons' | 'quizzes' | 'labs' | 'notes';
    unlocked: boolean;
    progress: number;
}

export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
    // XP Based
    { id: 'xp_100', title: 'Getting Started', description: 'Earn your first 100 XP', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50', requirement: 100, type: 'xp' },
    { id: 'xp_500', title: 'Rising Star', description: 'Earn 500 XP', icon: Zap, color: 'text-orange-500', bgColor: 'bg-orange-50', requirement: 500, type: 'xp' },
    { id: 'xp_1000', title: 'Knowledge Seeker', description: 'Earn 1000 XP', icon: Trophy, color: 'text-amber-500', bgColor: 'bg-amber-50', requirement: 1000, type: 'xp' },
    { id: 'xp_5000', title: 'Scholar', description: 'Earn 5000 XP', icon: Crown, color: 'text-purple-500', bgColor: 'bg-purple-50', requirement: 5000, type: 'xp' },
    { id: 'xp_10000', title: 'Master Mind', description: 'Earn 10000 XP', icon: Award, color: 'text-indigo-500', bgColor: 'bg-indigo-50', requirement: 10000, type: 'xp' },

    // Streak Based
    { id: 'streak_3', title: 'Consistent Learner', description: 'Maintain a 3-day streak', icon: Flame, color: 'text-red-500', bgColor: 'bg-red-50', requirement: 3, type: 'streak' },
    { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50', requirement: 7, type: 'streak' },
    { id: 'streak_30', title: 'Dedicated Student', description: 'Maintain a 30-day streak', icon: Flame, color: 'text-amber-600', bgColor: 'bg-amber-50', requirement: 30, type: 'streak' },

    // Activity Based
    { id: 'lessons_5', title: 'Curious Mind', description: 'Complete 5 lessons', icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-50', requirement: 5, type: 'lessons' },
    { id: 'lessons_25', title: 'Bookworm', description: 'Complete 25 lessons', icon: BookOpen, color: 'text-indigo-500', bgColor: 'bg-indigo-50', requirement: 25, type: 'lessons' },
    { id: 'quizzes_10', title: 'Quiz Champion', description: 'Complete 10 quizzes', icon: Brain, color: 'text-emerald-500', bgColor: 'bg-emerald-50', requirement: 10, type: 'quizzes' },
    { id: 'labs_5', title: 'Lab Explorer', description: 'Complete 5 virtual experiments', icon: Beaker, color: 'text-violet-500', bgColor: 'bg-violet-50', requirement: 5, type: 'labs' },
];

interface AchievementBadgeProps {
    achievement: Achievement;
    size?: 'sm' | 'md' | 'lg';
    showProgress?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    size = 'md',
    showProgress = true
}) => {
    const Icon = achievement.icon;
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-20 h-20'
    };
    const iconSizes = { sm: 20, md: 28, lg: 36 };

    const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);

    return (
        <div className={`relative group ${achievement.unlocked ? '' : 'opacity-50 grayscale'}`}>
            <div className={`${sizeClasses[size]} ${achievement.bgColor} ${achievement.color} rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 transition-transform group-hover:scale-110`}>
                <Icon size={iconSizes[size]} />
            </div>

            {!achievement.unlocked && showProgress && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${achievement.bgColor.replace('50', '400')} transition-all`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {achievement.unlocked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                    ✓
                </div>
            )}
        </div>
    );
};

interface AchievementToastProps {
    achievement: Achievement;
    onClose: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    const Icon = achievement.icon;

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-6 fade-in duration-500">
            <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200 shadow-2xl flex items-center gap-4 min-w-[300px]">
                <div className={`w-14 h-14 ${achievement.bgColor} ${achievement.color} rounded-xl flex items-center justify-center`}>
                    <Icon size={28} />
                </div>
                <div className="flex-1">
                    <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                        🎉 Achievement Unlocked!
                    </div>
                    <div className="font-bold text-slate-900">{achievement.title}</div>
                    <div className="text-xs text-slate-500">{achievement.description}</div>
                </div>
            </div>
        </div>
    );
};

interface AchievementsGridProps {
    achievements: Achievement[];
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({ achievements }) => {
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);

    return (
        <div className="space-y-6">
            {unlocked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" /> Unlocked ({unlocked.length})
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        {unlocked.map(a => (
                            <div key={a.id} className="text-center group cursor-pointer">
                                <AchievementBadge achievement={a} showProgress={false} />
                                <div className="mt-2 text-xs font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {a.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {locked.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Target size={16} /> In Progress ({locked.length})
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                        {locked.map(a => (
                            <div key={a.id} className="text-center group cursor-pointer">
                                <AchievementBadge achievement={a} />
                                <div className="mt-2 text-xs font-medium text-slate-400">
                                    {a.progress}/{a.requirement}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper to calculate user achievements
export const calculateAchievements = (
    xp: number,
    streak: number,
    history: { type: string }[]
): Achievement[] => {
    const lessons = history.filter(h => h.type === 'LESSON').length;
    const quizzes = history.filter(h => h.type === 'QUIZ').length;
    const labs = history.filter(h => h.type === 'LAB').length;

    return ACHIEVEMENTS.map(a => {
        let progress = 0;
        switch (a.type) {
            case 'xp': progress = xp; break;
            case 'streak': progress = streak; break;
            case 'lessons': progress = lessons; break;
            case 'quizzes': progress = quizzes; break;
            case 'labs': progress = labs; break;
            default: progress = 0;
        }

        return {
            ...a,
            progress,
            unlocked: progress >= a.requirement
        };
    });
};
