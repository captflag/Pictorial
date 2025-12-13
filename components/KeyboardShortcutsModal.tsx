import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[500px] max-w-[90vw] max-h-[80vh] overflow-auto animate-in zoom-in-95 fade-in duration-200">
                <div className="glass-panel rounded-3xl bg-white border border-slate-200 shadow-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                                <Keyboard size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Keyboard Shortcuts</h2>
                                <p className="text-xs text-slate-500">Navigate faster with your keyboard</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Shortcuts List */}
                    <div className="space-y-6">
                        {KEYBOARD_SHORTCUTS.map((category, i) => (
                            <div key={i}>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    {category.category}
                                </h3>
                                <div className="space-y-2">
                                    {category.shortcuts.map((shortcut, j) => (
                                        <div
                                            key={j}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                                        >
                                            <span className="text-sm text-slate-600">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, k) => (
                                                    <React.Fragment key={k}>
                                                        <kbd className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 shadow-sm">
                                                            {key === 'Ctrl' ? (
                                                                <span className="flex items-center gap-1">
                                                                    <Command size={12} /> {key}
                                                                </span>
                                                            ) : key}
                                                        </kbd>
                                                        {k < shortcut.keys.length - 1 && (
                                                            <span className="text-slate-400 text-xs">+</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">?</kbd> anytime to toggle this menu
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
