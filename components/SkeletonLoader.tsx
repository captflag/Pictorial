import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'image' | 'quiz';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ variant = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4 rounded"></div>
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-5/6 rounded"></div>
          </div>
        );

      case 'image':
        return (
          <div className="skeleton aspect-video w-full rounded-2xl"></div>
        );

      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="skeleton h-6 w-full rounded"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-12 w-full rounded-xl"></div>
              ))}
            </div>
          </div>
        );

      case 'card':
      default:
        return (
          <div className="glass-panel p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-full rounded"></div>
              <div className="skeleton h-3 w-4/5 rounded"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-pulse space-y-4">
      {items.map((i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};
