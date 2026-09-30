import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  let styles = 'bg-military-steel/30 text-military-text-secondary border-military-steel';

  if (normalized === 'COMPLETED' || normalized === 'ACTIVE' || normalized === 'APPROVED' || normalized === 'TRUE') {
    styles = 'bg-military-accent-greenBg text-green-400 border-military-accent-green/60';
  } else if (normalized === 'PENDING' || normalized === 'IN_PROGRESS' || normalized === 'STANDBY') {
    styles = 'bg-military-accent-amberBg text-military-accent-amber border-military-accent-amber/60';
  } else if (normalized === 'CANCELLED' || normalized === 'INACTIVE' || normalized === 'REJECTED' || normalized === 'FALSE') {
    styles = 'bg-military-accent-redBg text-red-400 border-military-accent-red/60';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase tracking-wider font-semibold border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {normalized === 'TRUE' ? 'ACTIVE' : normalized === 'FALSE' ? 'INACTIVE' : normalized}
    </span>
  );
};

export default StatusBadge;
