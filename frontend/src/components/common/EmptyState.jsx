import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'NO LOGS RECORDED', message = 'No operational records found matching the specified parameters.', actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-military-green-border rounded-sm my-6 bg-military-green-dark/40">
      <PackageOpen className="w-12 h-12 text-military-khaki/40 mb-3" />
      <h3 className="text-sm font-mono uppercase tracking-widest text-military-khaki font-semibold">
        // {title}
      </h3>
      <p className="text-xs text-military-text-muted mt-1 max-w-sm">
        {message}
      </p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
