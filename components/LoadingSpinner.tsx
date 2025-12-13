import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 bg-brand-200 rounded-full animate-ping opacity-50"></div>
        <div className="absolute inset-2 bg-gradient-to-tr from-brand-500 to-accent-500 rounded-full animate-spin"></div>
        <div className="absolute inset-3 bg-white rounded-full"></div>
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-8 h-8 bg-brand-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.3)]"></div>
        </div>
      </div>
      <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-accent-600 animate-pulse">
        {message}
      </p>
    </div>
  );
};