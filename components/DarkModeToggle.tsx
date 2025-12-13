import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        const saved = localStorage.getItem('pictorial_darkmode');
        if (saved !== null) return saved === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('pictorial_darkmode', String(isDark));
    }, [isDark]);

    return [isDark, setIsDark] as const;
};

interface DarkModeToggleProps {
    isDark: boolean;
    onToggle: () => void;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDark, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-slate-200'
                }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={isDark}
        >
            <div
                className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${isDark
                        ? 'left-7 bg-slate-900 text-yellow-400'
                        : 'left-0.5 bg-white text-amber-500 shadow-sm'
                    }`}
            >
                {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </div>
        </button>
    );
};
