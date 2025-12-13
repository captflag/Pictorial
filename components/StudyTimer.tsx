import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, Volume2, VolumeX } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
    focusMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    soundEnabled: boolean;
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    soundEnabled: true,
};

interface StudyTimerProps {
    topic?: string;
    onSessionComplete?: (mode: TimerMode, minutes: number) => void;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ topic, onSessionComplete }) => {
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const saved = localStorage.getItem('pictorial_timer_settings');
        return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    });

    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(settings.focusMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRkAQJ2/x6d0QhQAWLrb2K1yNwBPq9XXrnlRAxZ/zOfWsGkfAEN+tMi+jFEfADl2qsa7h1AdAER7rsaxfE0XADtzqMa3gU0aAENxpMG1fksbAD1vosK3gE4dAENupcS5g1EdAEFsosG2f00cAD9qoMC0fEkaADxnnr2yeUYYADlkm7qvdkMWADZhmbetc0EVADRel7Wqbz8SADJblbOnbDsQAC9YkrCkaTgPAC1VkKyjZjUNACpSjamfYzILACdPh6abYC8JAyVNhaWYXS0HAiNKgqKVWioGAiBHf5+SViYEAB5EfJuPUyMCABtAeZiMUCABABg9do+IOx0AABc4co2HNRoAABY0bYqENBgAABQwaYF/MhYAABEsZX97LxIAAA8oYnx4LBAAAw0mX3p1KQ0AAQsiXHhzJwsAAQoeWXVwJQkAAQgbVnJtIwcAAAgZU29qIQYAAAYWUGxnHwQAAAQTTWlkHQIAAAIQSmZgGwEAAAEMS2NdGQAAAAAISWBaFgAAAAAFRl1XFAAAAAADRFpUEgAAAAABQVdRDwAAAAA/VFAMAAAAAD1STA0AAAAAS09JCwAAAABMTUgJAAAAAE1MRgcYAAAAS0pEBhQAAABKSUIFEgAAAElIQQQQAAAAR0Y/AwwAAABGRT4DDAAAAEVEPQIIAAAAREM8AggAAABDQjsBBgAAAEJBOgEEAAAAQUA5AQIAAAA/PzgBAgAAAD4+NwECAAAAPT42AQIAAAA8PTQBAgAAADs8MwECAAAAOjsyAQIAAAA5OjEBAAAAADg5MAEAAAAANzkvAQAAAAA2OC4BAAAAAAc3LQEAAAAA');
    }, []);

    // Save settings to localStorage
    useEffect(() => {
        localStorage.setItem('pictorial_timer_settings', JSON.stringify(settings));
    }, [settings]);

    // Timer logic
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleTimerComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);

        // Play sound
        if (settings.soundEnabled && audioRef.current) {
            audioRef.current.play().catch(() => { });
        }

        // Calculate minutes
        const minutes = mode === 'focus'
            ? settings.focusMinutes
            : mode === 'shortBreak'
                ? settings.shortBreakMinutes
                : settings.longBreakMinutes;

        onSessionComplete?.(mode, minutes);

        if (mode === 'focus') {
            const newSessions = sessionsCompleted + 1;
            setSessionsCompleted(newSessions);

            // Determine next break type
            const nextMode = newSessions % settings.sessionsBeforeLongBreak === 0
                ? 'longBreak'
                : 'shortBreak';

            setMode(nextMode);
            setTimeLeft(
                nextMode === 'longBreak'
                    ? settings.longBreakMinutes * 60
                    : settings.shortBreakMinutes * 60
            );

            if (settings.autoStartBreaks) {
                setIsRunning(true);
            }
        } else {
            setMode('focus');
            setTimeLeft(settings.focusMinutes * 60);
        }
    }, [mode, sessionsCompleted, settings, onSessionComplete]);

    const toggleTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(
            mode === 'focus'
                ? settings.focusMinutes * 60
                : mode === 'shortBreak'
                    ? settings.shortBreakMinutes * 60
                    : settings.longBreakMinutes * 60
        );
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setIsRunning(false);
        setTimeLeft(
            newMode === 'focus'
                ? settings.focusMinutes * 60
                : newMode === 'shortBreak'
                    ? settings.shortBreakMinutes * 60
                    : settings.longBreakMinutes * 60
        );
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = mode === 'focus'
        ? ((settings.focusMinutes * 60 - timeLeft) / (settings.focusMinutes * 60)) * 100
        : mode === 'shortBreak'
            ? ((settings.shortBreakMinutes * 60 - timeLeft) / (settings.shortBreakMinutes * 60)) * 100
            : ((settings.longBreakMinutes * 60 - timeLeft) / (settings.longBreakMinutes * 60)) * 100;

    const modeColors = {
        focus: { bg: 'from-brand-500 to-violet-500', ring: 'ring-brand-200', text: 'text-brand-600' },
        shortBreak: { bg: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-200', text: 'text-emerald-600' },
        longBreak: { bg: 'from-blue-500 to-cyan-500', ring: 'ring-blue-200', text: 'text-blue-600' },
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="glass-panel p-8 rounded-3xl bg-white border border-slate-200 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Study Timer</h2>
                        {topic && <p className="text-sm text-slate-500">{topic}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title={settings.soundEnabled ? 'Mute' : 'Unmute'}
                        >
                            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
                    {[
                        { id: 'focus' as TimerMode, label: 'Focus', icon: Brain },
                        { id: 'shortBreak' as TimerMode, label: 'Short Break', icon: Coffee },
                        { id: 'longBreak' as TimerMode, label: 'Long Break', icon: Coffee },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => switchMode(m.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${mode === m.id
                                    ? `bg-white shadow-sm ${modeColors[m.id].text}`
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <m.icon size={16} />
                            <span className="hidden sm:inline">{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="relative flex items-center justify-center mb-8">
                    <div className={`absolute inset-0 rounded-full ${modeColors[mode].ring} ring-8 opacity-20`} />
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="8"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={mode === 'focus' ? '#8b5cf6' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'} />
                                <stop offset="100%" stopColor={mode === 'focus' ? '#7c3aed' : mode === 'shortBreak' ? '#14b8a6' : '#06b6d4'} />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-5xl font-black text-slate-900 font-mono">
                            {formatTime(timeLeft)}
                        </div>
                        <div className={`text-sm font-medium ${modeColors[mode].text} capitalize mt-1`}>
                            {mode.replace('Break', ' Break')}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={resetTimer}
                        className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                    <button
                        onClick={toggleTimer}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-105 bg-gradient-to-r ${modeColors[mode].bg}`}
                    >
                        {isRunning ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    <div className="w-12" /> {/* Spacer */}
                </div>

                {/* Sessions Counter */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Sessions completed: <span className="font-bold text-slate-700">{sessionsCompleted}</span>
                    </p>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                        <h3 className="font-bold text-sm text-slate-700">Timer Settings</h3>

                        {[
                            { key: 'focusMinutes', label: 'Focus Duration', min: 1, max: 60 },
                            { key: 'shortBreakMinutes', label: 'Short Break', min: 1, max: 30 },
                            { key: 'longBreakMinutes', label: 'Long Break', min: 1, max: 60 },
                        ].map(setting => (
                            <div key={setting.key} className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">{setting.label}</span>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="range"
                                        min={setting.min}
                                        max={setting.max}
                                        value={settings[setting.key as keyof TimerSettings] as number}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setSettings(s => ({ ...s, [setting.key]: value }));
                                            if (mode === 'focus' && setting.key === 'focusMinutes') setTimeLeft(value * 60);
                                            if (mode === 'shortBreak' && setting.key === 'shortBreakMinutes') setTimeLeft(value * 60);
                                            if (mode === 'longBreak' && setting.key === 'longBreakMinutes') setTimeLeft(value * 60);
                                        }}
                                        className="w-24 accent-brand-600"
                                    />
                                    <span className="text-sm font-mono text-slate-700 w-12 text-right">
                                        {settings[setting.key as keyof TimerSettings]}m
                                    </span>
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Auto-start breaks</span>
                            <button
                                onClick={() => setSettings(s => ({ ...s, autoStartBreaks: !s.autoStartBreaks }))}
                                className={`w-12 h-6 rounded-full transition-colors ${settings.autoStartBreaks ? 'bg-brand-600' : 'bg-slate-200'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${settings.autoStartBreaks ? 'translate-x-6' : 'translate-x-0.5'
                                    }`} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
