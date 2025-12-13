import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X } from 'lucide-react';

interface OfflineIndicatorProps {
    onRetry?: () => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ onRetry }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                // Show "back online" message briefly
                setShowBanner(true);
                setTimeout(() => setShowBanner(false), 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        if (!navigator.onLine) {
            setShowBanner(true);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (!showBanner) return null;

    return (
        <div
            className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 ${isOnline ? 'bg-emerald-500' : 'bg-slate-800'
                } text-white p-4 rounded-2xl shadow-lg flex items-center gap-3`}
            role="alert"
            aria-live="polite"
        >
            {isOnline ? (
                <>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Wifi size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">Back Online!</p>
                        <p className="text-xs text-white/80">Your connection has been restored.</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <WifiOff size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm">You're Offline</p>
                        <p className="text-xs text-white/70">Some features may be limited.</p>
                    </div>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            aria-label="Retry connection"
                        >
                            <RefreshCw size={18} />
                        </button>
                    )}
                </>
            )}

            <button
                onClick={() => setShowBanner(false)}
                className="p-1 text-white/60 hover:text-white transition-colors"
                aria-label="Dismiss"
            >
                <X size={16} />
            </button>
        </div>
    );
};

// Hook to check online status
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
