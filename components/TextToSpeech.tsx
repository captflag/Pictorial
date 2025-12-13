import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Settings, Loader2 } from 'lucide-react';

interface TextToSpeechProps {
    text: string;
    autoPlay?: boolean;
    onComplete?: () => void;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({
    text,
    autoPlay = false,
    onComplete
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [rate, setRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // Check if speech synthesis is available
        if (!('speechSynthesis' in window)) {
            console.warn('Text-to-speech not supported');
            return;
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (autoPlay && text) {
            handlePlay();
        }
    }, [autoPlay, text]);

    const handlePlay = () => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech is not supported in your browser');
            return;
        }

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsPlaying(true);
            return;
        }

        window.speechSynthesis.cancel();
        setIsLoading(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Get available voices and prefer a natural-sounding one
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Premium')
        ) || voices.find(v => v.lang.startsWith('en'));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setIsLoading(false);
            setIsPlaying(true);
            setProgress(0);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
            setProgress(100);
            onComplete?.();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsLoading(false);
            setIsPlaying(false);
        };

        // Estimate progress based on character position (rough estimate)
        utterance.onboundary = (event) => {
            if (event.charIndex !== undefined) {
                const progressPercent = (event.charIndex / text.length) * 100;
                setProgress(progressPercent);
            }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsPlaying(false);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
    };

    const rateOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

    return (
        <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={isLoading || !text}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlaying
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                    } disabled:opacity-50`}
                title={isPlaying ? 'Pause' : 'Listen'}
            >
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : isPlaying ? (
                    <Pause size={20} />
                ) : (
                    <Play size={20} className="ml-0.5" />
                )}
            </button>

            {/* Progress Bar (when playing) */}
            {(isPlaying || progress > 0) && (
                <div className="flex-1 max-w-[120px]">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Stop Button */}
            {(isPlaying || isPaused) && (
                <button
                    onClick={handleStop}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Stop"
                >
                    <RotateCcw size={16} />
                </button>
            )}

            {/* Settings */}
            <div className="relative">
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Speed settings"
                >
                    <Settings size={16} />
                </button>

                {showSettings && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-10 min-w-[120px]">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Speed</div>
                        <div className="space-y-1">
                            {rateOptions.map(r => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setRate(r);
                                        setShowSettings(false);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${rate === r
                                            ? 'bg-brand-50 text-brand-700 font-medium'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {r}x
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple inline listen button
interface ListenButtonProps {
    text: string;
    size?: 'sm' | 'md';
}

export const ListenButton: React.FC<ListenButtonProps> = ({ text, size = 'md' }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handleToggle = () => {
        if (!('speechSynthesis' in window)) {
            alert('Text-to-speech not supported');
            return;
        }

        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    const iconSize = size === 'sm' ? 14 : 18;

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center gap-1.5 transition-colors ${isPlaying
                    ? 'text-brand-600'
                    : 'text-slate-400 hover:text-brand-600'
                } ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
            title={isPlaying ? 'Stop' : 'Listen'}
        >
            {isPlaying ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
            <span className="font-medium">{isPlaying ? 'Stop' : 'Listen'}</span>
        </button>
    );
};
