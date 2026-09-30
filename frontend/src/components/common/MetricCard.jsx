import React from 'react';
import { HelpCircle } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
  isClickable = false
}) => {
  // Border colors & glows based on metric role
  const variantStyles = {
    default: 'border-military-green-border text-military-text-primary hover:border-military-khaki/50',
    primary: 'border-military-khaki/40 text-military-khaki bg-military-green-surface',
    success: 'border-military-accent-green/40 text-green-400 bg-military-green-surface',
    amber: 'border-military-accent-amber/40 text-military-accent-amber bg-military-green-surface',
    danger: 'border-military-accent-red/40 text-red-400 bg-military-green-surface',
    highlight: 'border-military-khaki bg-gradient-to-br from-military-green-surface to-military-olive-deep/40 text-military-khaki'
  };

  return (
    <div
      onClick={onClick}
      className={`tactical-panel p-4 rounded-sm transition-all duration-150 relative ${
        isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-military-glow ring-1 ring-transparent hover:ring-military-khaki/50' : ''
      } ${variantStyles[variant] || variantStyles.default}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-widest text-military-text-muted font-medium flex items-center gap-1.5">
          {title}
          {isClickable && (
            <span className="text-[10px] text-military-khaki/70 underline underline-offset-2 flex items-center gap-0.5">
              [VIEW FORMULA]
            </span>
          )}
        </span>
        {Icon && <Icon className="w-5 h-5 text-military-khaki/70" />}
      </div>

      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-mono font-bold tracking-tight text-military-text-primary">
          {value !== undefined && value !== null ? Number(value).toLocaleString() : '0'}
        </span>
        <span className="ml-2 text-xs font-mono text-military-text-muted">UNITS</span>
      </div>

      {subtext && (
        <div className="mt-2 text-[11px] font-mono text-military-text-muted flex items-center justify-between border-t border-military-green-border/50 pt-1.5">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
