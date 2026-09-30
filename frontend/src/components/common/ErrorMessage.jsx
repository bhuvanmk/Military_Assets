import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message = 'An error occurred while communicating with Command HQ', onRetry }) => {
  return (
    <div className="bg-military-accent-redBg border border-military-accent-red/50 p-4 rounded-sm flex items-start space-x-3 my-4">
      <AlertTriangle className="w-5 h-5 text-military-accent-red flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-xs font-mono uppercase tracking-wider text-military-accent-red font-bold">
          [ALERT] OPERATION FAILED
        </h4>
        <p className="text-sm text-military-text-secondary mt-1">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-military-accent-red/20 hover:bg-military-accent-red/30 border border-military-accent-red text-military-text-primary text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>RETRY REQUEST</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
