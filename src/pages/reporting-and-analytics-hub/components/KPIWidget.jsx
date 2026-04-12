import React from 'react';
import Icon from '../../../components/AppIcon';

const KPIWidget = ({ title, value, change, changeType, icon, trend, subtitle }) => {
  const getTrendColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold">{value}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name={icon} size={24} color="var(--color-primary)" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 ${getTrendColor()}`}>
          <Icon name={getTrendIcon()} size={16} />
          <span className="text-sm font-medium">{change}</span>
        </div>
        <span className="text-xs text-muted-foreground">{trend}</span>
      </div>
    </div>
  );
};

export default KPIWidget;