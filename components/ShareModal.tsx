import React, { useState } from 'react';
import {
    Share2,
    X,
    Copy,
    Check,
    Twitter,
    Linkedin,
    MessageCircle,
    Download,
    FileText,
    FileJson,
    File
} from 'lucide-react';
import { exportService } from '../services/exportService';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    topic: string;
    data?: {
        summary: string;
        analogy: string;
        keyConcepts: { title: string; description: string }[];
        quiz?: { question: string; options: string[]; correctAnswerIndex: number }[];
    };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, topic, data }) => {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'share' | 'export'>('share');

    if (!isOpen) return null;

    const shareUrl = window.location.href;
    const shareText = `📚 Just learned about "${topic}" on Pictorial - AI-Powered Visual Learning!`;

    const handleShare = async (platform: 'twitter' | 'linkedin' | 'whatsapp' | 'copy') => {
        const success = await exportService.share({
            platform,
            title: topic,
            text: shareText,
            url: shareUrl,
        });

        if (platform === 'copy' && success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleExport = async (format: 'markdown' | 'json' | 'text' | 'pdf') => {
        if (!data) return;

        const exportData = { topic, ...data };

        if (format === 'pdf') {
            exportService.exportLessonPlan(exportData, { format });
        } else {
            const content = await exportService.exportLessonPlan(exportData, { format });
            const extension = format === 'markdown' ? 'md' : format;
            const mimeType = format === 'json' ? 'application/json' : 'text/plain';
            exportService.download(content as string, `${topic.replace(/\s+/g, '_')}.${extension}`, mimeType);
        }
    };

    const shareOptions = [
        { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'bg-sky-500 hover:bg-sky-600' },
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600 hover:bg-blue-700' },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500 hover:bg-green-600' },
    ];

    const exportOptions = [
        { id: 'pdf', label: 'PDF Document', icon: FileText, description: 'Print-ready format' },
        { id: 'markdown', label: 'Markdown', icon: FileText, description: 'For notes apps' },
        { id: 'json', label: 'JSON', icon: FileJson, description: 'Structured data' },
        { id: 'text', label: 'Plain Text', icon: File, description: 'Simple format' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[420px] max-w-[90vw] animate-in zoom-in-95 fade-in duration-200">
                <div className="glass-panel rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Share & Export</h2>
                                <p className="text-xs text-slate-500 truncate max-w-[200px]">{topic}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        {['share', 'export'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'share' | 'export')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab
                                        ? 'text-brand-600 border-b-2 border-brand-600'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'share' ? (
                            <div className="space-y-4">
                                {/* Social Share Buttons */}
                                <div className="grid grid-cols-3 gap-3">
                                    {shareOptions.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleShare(option.id as any)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl text-white transition-all ${option.color}`}
                                        >
                                            <option.icon size={24} />
                                            <span className="text-xs font-medium">{option.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Copy Link */}
                                <div className="mt-4">
                                    <label className="text-xs font-medium text-slate-500 mb-2 block">
                                        Or copy link
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={shareUrl}
                                            readOnly
                                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 truncate"
                                        />
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${copied
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                            {copied ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data ? (
                                    exportOptions.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleExport(option.id as any)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-all group"
                                        >
                                            <div className="w-12 h-12 bg-slate-100 group-hover:bg-brand-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-brand-600 transition-colors">
                                                <option.icon size={24} />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-medium text-slate-800">{option.label}</div>
                                                <div className="text-xs text-slate-500">{option.description}</div>
                                            </div>
                                            <Download size={18} className="text-slate-300 group-hover:text-brand-500" />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                                        <p>Generate a lesson first to export</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
