import React, { useState, useEffect, createContext, useContext } from 'react';
import { Bookmark, BookmarkCheck, Star, Trash2, Clock, ArrowRight, Filter } from 'lucide-react';

// Bookmark types
export interface BookmarkedTopic {
    id: string;
    topic: string;
    subject?: string;
    class?: string;
    timestamp: number;
    notes?: string;
    priority: 'low' | 'medium' | 'high';
}

const STORAGE_KEY = 'pictorial_bookmarks';

// Bookmark Service
export const bookmarkService = {
    getAll: (): BookmarkedTopic[] => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    },

    add: (topic: string, subject?: string, classId?: string): BookmarkedTopic => {
        const bookmarks = bookmarkService.getAll();
        const newBookmark: BookmarkedTopic = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            topic,
            subject,
            class: classId,
            timestamp: Date.now(),
            priority: 'medium',
        };

        // Check if already exists
        const existing = bookmarks.find(b => b.topic.toLowerCase() === topic.toLowerCase());
        if (existing) return existing;

        const updated = [newBookmark, ...bookmarks];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newBookmark;
    },

    remove: (id: string): void => {
        const bookmarks = bookmarkService.getAll().filter(b => b.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    },

    isBookmarked: (topic: string): boolean => {
        return bookmarkService.getAll().some(b => b.topic.toLowerCase() === topic.toLowerCase());
    },

    updateNotes: (id: string, notes: string): void => {
        const bookmarks = bookmarkService.getAll().map(b =>
            b.id === id ? { ...b, notes } : b
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    },

    updatePriority: (id: string, priority: 'low' | 'medium' | 'high'): void => {
        const bookmarks = bookmarkService.getAll().map(b =>
            b.id === id ? { ...b, priority } : b
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    },

    clear: (): void => {
        localStorage.removeItem(STORAGE_KEY);
    },
};

// Hook for bookmark state
export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<BookmarkedTopic[]>([]);

    useEffect(() => {
        setBookmarks(bookmarkService.getAll());
    }, []);

    const addBookmark = (topic: string, subject?: string, classId?: string) => {
        const newBookmark = bookmarkService.add(topic, subject, classId);
        setBookmarks(bookmarkService.getAll());
        return newBookmark;
    };

    const removeBookmark = (id: string) => {
        bookmarkService.remove(id);
        setBookmarks(bookmarkService.getAll());
    };

    const isBookmarked = (topic: string) => {
        return bookmarks.some(b => b.topic.toLowerCase() === topic.toLowerCase());
    };

    const toggleBookmark = (topic: string, subject?: string, classId?: string) => {
        if (isBookmarked(topic)) {
            const bookmark = bookmarks.find(b => b.topic.toLowerCase() === topic.toLowerCase());
            if (bookmark) removeBookmark(bookmark.id);
        } else {
            addBookmark(topic, subject, classId);
        }
    };

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark,
    };
};

// Bookmark Button Component
interface BookmarkButtonProps {
    topic: string;
    subject?: string;
    classId?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
    topic,
    subject,
    classId,
    size = 'md',
    showLabel = false,
}) => {
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const bookmarked = isBookmarked(topic);

    const sizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(topic, subject, classId);
            }}
            className={`flex items-center gap-2 transition-all ${bookmarked
                    ? 'text-amber-500 hover:text-amber-600'
                    : 'text-slate-400 hover:text-amber-500'
                }`}
            title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
            {bookmarked ? (
                <BookmarkCheck size={sizes[size]} fill="currentColor" />
            ) : (
                <Bookmark size={sizes[size]} />
            )}
            {showLabel && (
                <span className="text-sm font-medium">
                    {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </span>
            )}
        </button>
    );
};

// Bookmarks List Component
interface BookmarksListProps {
    onTopicClick: (topic: string) => void;
}

export const BookmarksList: React.FC<BookmarksListProps> = ({ onTopicClick }) => {
    const { bookmarks, removeBookmark } = useBookmarks();
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'priority'>('recent');

    const filteredBookmarks = bookmarks
        .filter(b => filter === 'all' || b.priority === filter)
        .sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.timestamp - a.timestamp;
        });

    const priorityColors = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-amber-100 text-amber-700',
        low: 'bg-slate-100 text-slate-600',
    };

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bookmark size={32} className="text-amber-300" />
                </div>
                <h3 className="font-bold text-slate-700 mb-2">No Bookmarks Yet</h3>
                <p className="text-slate-500 text-sm">
                    Bookmark topics you want to revisit later
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                    >
                        <option value="all">All</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                    <option value="recent">Most Recent</option>
                    <option value="priority">Priority</option>
                </select>
            </div>

            {/* List */}
            <div className="space-y-2">
                {filteredBookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="glass-panel p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all group cursor-pointer"
                        onClick={() => onTopicClick(bookmark.topic)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                <BookmarkCheck size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                                    {bookmark.topic}
                                </h4>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    {bookmark.subject && (
                                        <span className="px-2 py-0.5 bg-slate-100 rounded-full">{bookmark.subject}</span>
                                    )}
                                    {bookmark.class && (
                                        <span>Class {bookmark.class}</span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(bookmark.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[bookmark.priority]}`}>
                                    {bookmark.priority}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeBookmark(bookmark.id);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <ArrowRight size={16} className="text-slate-300 group-hover:text-amber-500" />
                            </div>
                        </div>

                        {bookmark.notes && (
                            <p className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                                {bookmark.notes}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
                {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} saved
            </div>
        </div>
    );
};
