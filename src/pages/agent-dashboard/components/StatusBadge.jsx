import React from 'react';
import Icon from '../../../components/AppIcon';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case 'open':
        return {
          icon: 'Circle',
          color: 'var(--color-primary)',
          bgClass: 'bg-primary/10',
          textClass: 'text-primary',
          borderClass: 'border-primary/20'
        };
      case 'in progress':
        return {
          icon: 'Clock',
          color: 'var(--color-warning)',
          bgClass: 'bg-warning/10',
          textClass: 'text-warning',
          borderClass: 'border-warning/20'
        };
      case 'pending':
        return {
          icon: 'AlertCircle',
          color: 'var(--color-accent)',
          bgClass: 'bg-accent/10',
          textClass: 'text-accent',
          borderClass: 'border-accent/20'
        };
      case 'resolved':
        return {
          icon: 'CheckCircle',
          color: 'var(--color-success)',
          bgClass: 'bg-success/10',
          textClass: 'text-success',
          borderClass: 'border-success/20'
        };
      case 'closed':
        return {
          icon: 'XCircle',
          color: 'var(--color-muted-foreground)',
          bgClass: 'bg-muted',
          textClass: 'text-muted-foreground',
          borderClass: 'border-border'
        };
      default:
        return {
          icon: 'Circle',
          color: 'var(--color-muted-foreground)',
          bgClass: 'bg-muted',
          textClass: 'text-muted-foreground',
          borderClass: 'border-border'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md text-xs md:text-sm font-medium border caption ${config?.bgClass} ${config?.textClass} ${config?.borderClass}`}>
      <Icon name={config?.icon} size={14} color={config?.color} />
      {status}
    </span>
  );
};

export default StatusBadge;