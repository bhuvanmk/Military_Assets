import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const Toast = ({ toasts = [], removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-military-khaki';
        let bgClass = 'bg-military-green-surface';
        let Icon = Info;
        let iconColor = 'text-military-khaki';

        if (toast.type === 'success') {
          borderClass = 'border-military-accent-green';
          bgClass = 'bg-[#152317]';
          Icon = CheckCircle;
          iconColor = 'text-green-400';
        } else if (toast.type === 'error') {
          borderClass = 'border-military-accent-red';
          bgClass = 'bg-[#291414]';
          Icon = AlertCircle;
          iconColor = 'text-red-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-military-accent-amber';
          bgClass = 'bg-[#2B2310]';
          Icon = AlertTriangle;
          iconColor = 'text-military-accent-amber';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-3.5 border shadow-military-panel rounded-sm text-military-text-primary ${bgClass} ${borderClass} transition-all duration-200 animate-slide-in`}
          >
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5 mr-3`} />
            <div className="flex-1 text-xs">
              {toast.title && (
                <div className="font-mono uppercase tracking-wider font-bold text-military-khaki">
                  {toast.title}
                </div>
              )}
              <div className="mt-0.5 text-military-text-secondary leading-relaxed">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-military-text-muted hover:text-military-text-primary transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
