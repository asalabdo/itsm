import React from 'react';
import Icon from '../../../components/AppIcon';

const SLAIndicator = ({ timeRemaining, breached }) => {
  const getIndicatorConfig = () => {
    if (breached) {
      return {
        icon: 'AlertTriangle',
        color: 'var(--color-error)',
        bgClass: 'bg-error/10',
        textClass: 'text-error',
        borderClass: 'border-error/20'
      };
    }

    const hours = parseInt(timeRemaining);
    if (hours <= 1) {
      return {
        icon: 'Clock',
        color: 'var(--color-warning)',
        bgClass: 'bg-warning/10',
        textClass: 'text-warning',
        borderClass: 'border-warning/20'
      };
    }

    return {
      icon: 'Clock',
      color: 'var(--color-success)',
      bgClass: 'bg-success/10',
      textClass: 'text-success',
      borderClass: 'border-success/20'
    };
  };

  const config = getIndicatorConfig();

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-medium border caption ${config?.bgClass} ${config?.textClass} ${config?.borderClass}`}>
      <Icon name={config?.icon} size={14} color={config?.color} />
      <span className="whitespace-nowrap">{breached ? 'Breached' : timeRemaining}</span>
    </div>
  );
};

export default SLAIndicator;