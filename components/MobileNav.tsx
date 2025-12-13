import React from 'react';
import { ViewMode } from '../types';
import {
    BookOpen,
    Bot,
    FileText,
    FlaskConical,
    GraduationCap,
    Home,
    LayoutDashboard,
    Search
} from 'lucide-react';

interface MobileNavProps {
    viewMode: ViewMode;
    hasData: boolean;
    isLoggedIn: boolean;
    onViewChange: (mode: ViewMode) => void;
    onHomeClick: () => void;
}

const NAV_ITEMS = [
    { mode: null, icon: Home, label: 'Home', alwaysShow: true },
    { mode: ViewMode.THEORY, icon: BookOpen, label: 'Theory', requiresData: true },
    { mode: ViewMode.QUIZ, icon: GraduationCap, label: 'Quiz', requiresData: true },
    { mode: ViewMode.CHAT, icon: Bot, label: 'AI Tutor', alwaysShow: true },
    { mode: ViewMode.DASHBOARD, icon: LayoutDashboard, label: 'Profile', requiresLogin: true },
];

export const MobileNav: React.FC<MobileNavProps> = ({
    viewMode,
    hasData,
    isLoggedIn,
    onViewChange,
    onHomeClick
}) => {
    const visibleItems = NAV_ITEMS.filter(item => {
        if (item.requiresData && !hasData) return false;
        if (item.requiresLogin && !isLoggedIn) return false;
        return true;
    }).slice(0, 5); // Max 5 items

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200 safe-area-pb"
            role="navigation"
            aria-label="Mobile navigation"
        >
            <div className="flex justify-around items-center py-2 px-2">
                {visibleItems.map((item, index) => {
                    const isActive = item.mode === null
                        ? !hasData && viewMode === ViewMode.THEORY
                        : viewMode === item.mode;

                    const handleClick = () => {
                        if (item.mode === null) {
                            onHomeClick();
                        } else {
                            onViewChange(item.mode);
                        }
                    };

                    return (
                        <button
                            key={index}
                            onClick={handleClick}
                            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px] ${isActive
                                    ? 'bg-brand-50 text-brand-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-brand-600' : 'text-slate-500'}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// CSS to add to index.html for safe area (notch) support:
// .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0px); }
