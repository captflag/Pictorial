import React, { useState, useEffect, useCallback } from 'react';
import { Focus, X, Clock, Volume2, VolumeX, Maximize2, Moon } from 'lucide-react';

interface FocusModeProps {
    children: React.ReactNode;
    topic?: string;
    onExit?: () => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ children, topic, onExit }) => {
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'cafe' | 'forest'>('none');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Timer effect
    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    // Keyboard shortcut to exit
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isActive) {
                handleExit();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);

    const handleExit = () => {
        setIsActive(false);
        setTimer(0);
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        onExit?.();
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            await document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isActive) {
        return (
            <>
                {children}
                <button
                    onClick={() => setIsActive(true)}
                    className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 p-4 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 transition-all z-40 flex items-center gap-2"
                    title="Enter Focus Mode"
                >
                    <Focus size={20} />
                    <span className="hidden lg:inline font-medium">Focus Mode</span>
                </button>
            </>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] bg-slate-950 text-white overflow-auto">
            {/* Top Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 z-10">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Focus size={20} className="text-brand-400" />
                        <span className="font-bold text-white">Focus Mode</span>
                    </div>
                    {topic && (
                        <span className="text-slate-500">|</span>
                    )}
                    {topic && (
                        <span className="text-slate-400 truncate max-w-[200px]">{topic}</span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl">
                        <Clock size={16} className="text-brand-400" />
                        <span className="font-mono font-bold">{formatTime(timer)}</span>
                    </div>

                    {/* Ambient Sound */}
                    <div className="relative group">
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                            {ambientSound === 'none' ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <div className="absolute top-full right-0 mt-2 bg-slate-800 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[140px]">
                            {['none', 'rain', 'cafe', 'forest'].map(sound => (
                                <button
                                    key={sound}
                                    onClick={() => setAmbientSound(sound as any)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${ambientSound === sound ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {sound === 'none' ? 'No Sound' : sound}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        <Maximize2 size={20} />
                    </button>

                    {/* Exit */}
                    <button
                        onClick={handleExit}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                    >
                        <X size={18} />
                        Exit
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
                <div className="focus-content text-slate-100">
                    {children}
                </div>
            </div>

            {/* Bottom hint */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-600">
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Esc</kbd> to exit focus mode
            </div>

            <style>{`
        .focus-content {
          filter: none;
        }
        .focus-content .glass-panel,
        .focus-content .glass-card {
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(71, 85, 105, 0.5) !important;
        }
        .focus-content h1, .focus-content h2, .focus-content h3 {
          color: #f1f5f9 !important;
        }
        .focus-content p, .focus-content li {
          color: #cbd5e1 !important;
        }
      `}</style>
        </div>
    );
};

// Simple Focus Mode Toggle Button
export const FocusModeToggle: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
    >
        <Focus size={18} />
        Focus Mode
    </button>
);
