import React, { useState, useMemo } from 'react';
import { User, UserHistory } from '../types';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Clock,
    Target,
    BookOpen,
    Brain,
    Trophy,
    Flame,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface ProgressAnalyticsProps {
    user: User;
}

type TimeRange = '7d' | '30d' | 'all';

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ user }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');

    const analytics = useMemo(() => {
        const now = new Date();
        const history = user.history;

        // Filter by time range
        const filteredHistory = history.filter(h => {
            const date = new Date(h.date);
            const diff = now.getTime() - date.getTime();
            const days = diff / (1000 * 60 * 60 * 24);

            if (timeRange === '7d') return days <= 7;
            if (timeRange === '30d') return days <= 30;
            return true;
        });

        // Calculate daily activity for the last 7 days
        const dailyActivity: { date: string; count: number; xp: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });

            const dayActivities = history.filter(h =>
                new Date(h.date).toISOString().split('T')[0] === dateStr
            );

            dailyActivity.push({
                date: dayName,
                count: dayActivities.length,
                xp: dayActivities.reduce((sum, a) => sum + (a.score || 0), 0)
            });
        }

        // Activity breakdown by type
        const byType = {
            LESSON: filteredHistory.filter(h => h.type === 'LESSON').length,
            QUIZ: filteredHistory.filter(h => h.type === 'QUIZ').length,
            PRACTICE: filteredHistory.filter(h => h.type === 'PRACTICE').length,
        };

        // Subject breakdown
        const subjectCounts: Record<string, number> = {};
        filteredHistory.forEach(h => {
            const match = h.topic.match(/(Mathematics|Physics|Chemistry|Biology|Science|English|Hindi|Computer)/i);
            if (match) {
                subjectCounts[match[1]] = (subjectCounts[match[1]] || 0) + 1;
            }
        });

        const topSubjects = Object.entries(subjectCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Calculate totals
        const totalXP = filteredHistory.reduce((sum, h) => sum + (h.score || 0), 0);
        const avgDaily = Math.round(totalXP / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : Math.max(1, history.length)));

        return {
            dailyActivity,
            byType,
            topSubjects,
            totalXP,
            avgDaily,
            totalActivities: filteredHistory.length,
        };
    }, [user.history, timeRange]);

    const maxDailyCount = Math.max(...analytics.dailyActivity.map(d => d.count), 1);

    return (
        <div className="space-y-6">
            {/* Header with Time Range Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Progress Analytics</h2>
                        <p className="text-xs text-slate-500">Track your learning journey</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 rounded-lg p-1">
                    {(['7d', '30d', 'all'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-violet-600 mb-2">
                        <Trophy size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">XP Earned</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{analytics.totalXP.toLocaleString()}</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-emerald-600 mb-2">
                        <TrendingUp size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg/Day</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{analytics.avgDaily}</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Target size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Activities</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{analytics.totalActivities}</div>
                </div>

                <div className="glass-panel p-4 rounded-2xl bg-white border border-slate-200">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                        <Flame size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{user.streak} days</div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Calendar size={16} className="text-brand-600" /> Weekly Activity
                </h3>

                <div className="flex items-end justify-between gap-2 h-32">
                    {analytics.dailyActivity.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col items-center">
                                <span className="text-xs font-bold text-brand-600 mb-1">{day.count}</span>
                                <div
                                    className="w-full bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-lg transition-all hover:from-brand-600 hover:to-brand-500"
                                    style={{
                                        height: `${Math.max((day.count / maxDailyCount) * 80, 4)}px`,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">{day.date}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Breakdown & Top Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Activity Type Breakdown */}
                <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Brain size={16} className="text-purple-600" /> Activity Breakdown
                    </h3>

                    <div className="space-y-3">
                        {[
                            { type: 'LESSON', label: 'Lessons', count: analytics.byType.LESSON, color: 'bg-blue-500', icon: BookOpen },
                            { type: 'QUIZ', label: 'Quizzes', count: analytics.byType.QUIZ, color: 'bg-orange-500', icon: Trophy },
                            { type: 'PRACTICE', label: 'Practice', count: analytics.byType.PRACTICE, color: 'bg-emerald-500', icon: Target },
                        ].map(item => {
                            const total = analytics.byType.LESSON + analytics.byType.QUIZ + analytics.byType.PRACTICE;
                            const percent = total > 0 ? (item.count / total) * 100 : 0;

                            return (
                                <div key={item.type} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-slate-600">
                                            <item.icon size={14} />
                                            {item.label}
                                        </span>
                                        <span className="font-bold text-slate-900">{item.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} transition-all duration-500`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Subjects */}
                <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-600" /> Top Subjects
                    </h3>

                    {analytics.topSubjects.length > 0 ? (
                        <div className="space-y-3">
                            {analytics.topSubjects.map(([subject, count], i) => {
                                const maxCount = analytics.topSubjects[0][1];
                                const percent = (count / maxCount) * 100;
                                const colors = ['bg-brand-500', 'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500'];

                                return (
                                    <div key={subject} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">{subject}</span>
                                            <span className="font-bold text-slate-900">{count}</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${colors[i] || 'bg-slate-400'} transition-all duration-500`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-4">No subject data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};
