import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'LOADING DATA...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3 text-military-khaki">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin`} />
      {message && (
        <p className="text-xs font-mono uppercase tracking-widest text-military-text-muted">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
