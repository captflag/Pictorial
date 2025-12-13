import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Clock, TrendingUp, X, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'pictorial_search_history';
const MAX_HISTORY = 20;

interface SearchHistory {
    query: string;
    timestamp: number;
    resultCount?: number;
}

interface SearchWithHistoryProps {
    value: string;
    onChange: (value: string) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

// Popular/trending searches
const TRENDING_SEARCHES = [
    'Photosynthesis',
    'Newton\'s Laws of Motion',
    'Periodic Table',
    'Cell Division',
    'Quadratic Equations',
    'Chemical Bonding',
    'Human Digestive System',
    'Electricity and Circuits',
];

export const SearchWithHistory: React.FC<SearchWithHistoryProps> = ({
    value,
    onChange,
    onSearch,
    placeholder = 'Search any topic...',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<SearchHistory[]>([]);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load history from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch {
                setHistory([]);
            }
        }
    }, []);

    // Filter suggestions based on input
    const suggestions = useMemo(() => {
        const query = value.toLowerCase().trim();

        if (!query) {
            // Show recent history when empty
            return {
                recent: history.slice(0, 5),
                trending: TRENDING_SEARCHES.slice(0, 4),
            };
        }

        // Filter history and trending by query
        const matchedHistory = history
            .filter(h => h.query.toLowerCase().includes(query))
            .slice(0, 3);

        const matchedTrending = TRENDING_SEARCHES
            .filter(t => t.toLowerCase().includes(query) && !matchedHistory.some(h => h.query === t))
            .slice(0, 3);

        return {
            recent: matchedHistory,
            trending: matchedTrending,
        };
    }, [value, history]);

    const allSuggestions = [...suggestions.recent.map(h => h.query), ...suggestions.trending];

    const handleSearch = (query: string) => {
        if (!query.trim()) return;

        // Add to history
        const newHistory = [
            { query: query.trim(), timestamp: Date.now() },
            ...history.filter(h => h.query.toLowerCase() !== query.toLowerCase().trim()),
        ].slice(0, MAX_HISTORY);

        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

        onSearch(query);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex >= 0 && allSuggestions[focusedIndex]) {
                handleSearch(allSuggestions[focusedIndex]);
            } else {
                handleSearch(value);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => Math.min(prev + 1, allSuggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setFocusedIndex(-1);
        }
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const removeFromHistory = (query: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newHistory = history.filter(h => h.query !== query);
        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-all"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                />
                {value && (
                    <button
                        onClick={() => onChange('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (suggestions.recent.length > 0 || suggestions.trending.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Recent Searches */}
                    {suggestions.recent.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center justify-between px-3 py-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Clock size={12} /> Recent
                                </span>
                                {!value && history.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                            {suggestions.recent.map((item, i) => (
                                <button
                                    key={item.query}
                                    onClick={() => handleSearch(item.query)}
                                    className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between group transition-colors ${focusedIndex === i ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-sm text-slate-700 group-hover:text-brand-600">{item.query}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => removeFromHistory(item.query, e)}
                                            className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Divider */}
                    {suggestions.recent.length > 0 && suggestions.trending.length > 0 && (
                        <div className="border-t border-slate-100" />
                    )}

                    {/* Trending Searches */}
                    {suggestions.trending.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp size={12} /> Trending
                                </span>
                            </div>
                            {suggestions.trending.map((query, i) => {
                                const index = suggestions.recent.length + i;
                                return (
                                    <button
                                        key={query}
                                        onClick={() => handleSearch(query)}
                                        className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between group transition-colors ${focusedIndex === index ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="text-sm text-slate-700 group-hover:text-brand-600">{query}</span>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-brand-500" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Hook to get search history
export const useSearchHistory = () => {
    const [history, setHistory] = useState<SearchHistory[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch {
                setHistory([]);
            }
        }
    }, []);

    const addToHistory = (query: string) => {
        const newHistory = [
            { query: query.trim(), timestamp: Date.now() },
            ...history.filter(h => h.query.toLowerCase() !== query.toLowerCase().trim()),
        ].slice(0, MAX_HISTORY);

        setHistory(newHistory);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { history, addToHistory, clearHistory };
};
