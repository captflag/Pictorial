import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Calendar, TrendingUp, Award, Zap } from 'lucide-react';

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
    weekActivity: boolean[]; // Last 7 days, true if active
    totalDaysActive: number;
}

const STORAGE_KEY = 'pictorial_streak_data';

// Streak Service
export const streakService = {
    getData: (): StreakData => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch { }

        return {
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: '',
            weekActivity: [false, false, false, false, false, false, false],
            totalDaysActive: 0,
        };
    },

    recordActivity: (): StreakData => {
        const data = streakService.getData();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Already recorded today
        if (data.lastActiveDate === today) {
            return data;
        }

        // Update streak
        if (data.lastActiveDate === yesterday) {
            // Continuing streak
            data.currentStreak += 1;
        } else if (data.lastActiveDate !== today) {
            // Streak broken or first day
            data.currentStreak = 1;
        }

        // Update longest streak
        if (data.currentStreak > data.longestStreak) {
            data.longestStreak = data.currentStreak;
        }

        // Update week activity
        data.weekActivity = [...data.weekActivity.slice(1), true];

        // Update totals
        data.totalDaysActive += 1;
        data.lastActiveDate = today;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    },

    checkStreak: (): StreakData => {
        const data = streakService.getData();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Check if streak is broken (not active today or yesterday)
        if (data.lastActiveDate !== today && data.lastActiveDate !== yesterday) {
            data.currentStreak = 0;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }

        return data;
    },

    getMultiplier: (streak: number): number => {
        if (streak >= 30) return 3;
        if (streak >= 14) return 2.5;
        if (streak >= 7) return 2;
        if (streak >= 3) return 1.5;
        return 1;
    },
};

// Streak Widget Component
interface StreakWidgetProps {
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
    size = 'md',
    showDetails = true
}) => {
    const [data, setData] = useState<StreakData>(streakService.getData());

    useEffect(() => {
        setData(streakService.checkStreak());
    }, []);

    const multiplier = streakService.getMultiplier(data.currentStreak);

    if (size === 'sm') {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full">
                <Flame size={16} />
                <span className="font-bold text-sm">{data.currentStreak}</span>
            </div>
        );
    }

    return (
        <div className="glass-panel p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200">
            {/* Main Streak Display */}
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${data.currentStreak > 0
                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                    <Flame size={28} />
                </div>

                <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">{data.currentStreak}</span>
                        <span className="text-slate-500 font-medium">day streak</span>
                    </div>
                    {multiplier > 1 && (
                        <div className="flex items-center gap-1 text-orange-600 text-sm font-bold">
                            <Zap size={14} />
                            {multiplier}x XP Multiplier Active!
                        </div>
                    )}
                </div>
            </div>

            {/* Week Activity */}
            {showDetails && (
                <div className="mt-4 pt-4 border-t border-orange-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Week</span>
                        <span className="text-xs text-slate-400">
                            {data.weekActivity.filter(Boolean).length}/7 days
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${data.weekActivity[i]
                                        ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {data.weekActivity[i] ? '✓' : ''}
                                </div>
                                <span className="text-[10px] text-slate-400">{day}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats */}
            {showDetails && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                            <Award size={14} />
                        </div>
                        <div className="text-lg font-black text-slate-800">{data.longestStreak}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Best Streak</div>
                    </div>
                    <div className="bg-white/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                            <TrendingUp size={14} />
                        </div>
                        <div className="text-lg font-black text-slate-800">{data.totalDaysActive}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Total Days</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Hook to manage streak
export const useStreak = () => {
    const [data, setData] = useState<StreakData>(streakService.getData());

    const recordActivity = useCallback(() => {
        const updated = streakService.recordActivity();
        setData(updated);
        return updated;
    }, []);

    const getMultiplier = useCallback(() => {
        return streakService.getMultiplier(data.currentStreak);
    }, [data.currentStreak]);

    return {
        streak: data.currentStreak,
        longestStreak: data.longestStreak,
        weekActivity: data.weekActivity,
        multiplier: getMultiplier(),
        recordActivity,
    };
};
