import { useEffect, useCallback } from 'react';
import { ViewMode } from '../types';

interface KeyboardShortcut {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    description: string;
    action: () => void;
}

interface UseKeyboardShortcutsProps {
    onViewChange: (mode: ViewMode) => void;
    onSearch: () => void;
    onToggleDarkMode: () => void;
    onHome: () => void;
    enabled?: boolean;
}

export const useKeyboardShortcuts = ({
    onViewChange,
    onSearch,
    onToggleDarkMode,
    onHome,
    enabled = true
}: UseKeyboardShortcutsProps) => {

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }

        // Ctrl/Cmd shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key.toLowerCase()) {
                case 'k':
                    event.preventDefault();
                    onSearch();
                    break;
                case 'd':
                    event.preventDefault();
                    onToggleDarkMode();
                    break;
            }
            return;
        }

        // Alt shortcuts for navigation
        if (event.altKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    onViewChange(ViewMode.THEORY);
                    break;
                case '2':
                    event.preventDefault();
                    onViewChange(ViewMode.VISUAL);
                    break;
                case '3':
                    event.preventDefault();
                    onViewChange(ViewMode.LAB);
                    break;
                case '4':
                    event.preventDefault();
                    onViewChange(ViewMode.QUIZ);
                    break;
                case '5':
                    event.preventDefault();
                    onViewChange(ViewMode.CHAT);
                    break;
            }
            return;
        }

        // Single key shortcuts (when not typing)
        switch (event.key.toLowerCase()) {
            case 'h':
                onHome();
                break;
            case 't':
                onViewChange(ViewMode.THEORY);
                break;
            case 'v':
                onViewChange(ViewMode.VISUAL);
                break;
            case 'l':
                onViewChange(ViewMode.LAB);
                break;
            case 'q':
                onViewChange(ViewMode.QUIZ);
                break;
            case 'c':
                onViewChange(ViewMode.CHAT);
                break;
            case 'n':
                onViewChange(ViewMode.NOTES);
                break;
            case 'p':
                onViewChange(ViewMode.PRACTICE);
                break;
            case 'r':
                onViewChange(ViewMode.RESEARCH);
                break;
            case '?':
                // Show shortcuts help
                document.getElementById('shortcuts-modal')?.classList.toggle('hidden');
                break;
        }
    }, [enabled, onViewChange, onSearch, onToggleDarkMode, onHome]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
};

// Keyboard shortcuts reference data
export const KEYBOARD_SHORTCUTS = [
    {
        category: 'Navigation', shortcuts: [
            { keys: ['H'], description: 'Go Home' },
            { keys: ['T'], description: 'Theory View' },
            { keys: ['V'], description: 'Visual View' },
            { keys: ['L'], description: 'Lab View' },
            { keys: ['Q'], description: 'Quiz View' },
            { keys: ['C'], description: 'AI Chat' },
            { keys: ['N'], description: 'Notes' },
            { keys: ['P'], description: 'Practice' },
            { keys: ['R'], description: 'Research' },
        ]
    },
    {
        category: 'Actions', shortcuts: [
            { keys: ['Ctrl', 'K'], description: 'Focus Search' },
            { keys: ['Ctrl', 'D'], description: 'Toggle Dark Mode' },
            { keys: ['?'], description: 'Show Shortcuts' },
        ]
    },
    {
        category: 'Quick Navigation', shortcuts: [
            { keys: ['Alt', '1-5'], description: 'Quick view switch' },
        ]
    },
];
