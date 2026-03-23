import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({ icon, iconColor, title, value, subtitle, trend, trendDirection }) => {
  const getTrendColor = () => {
    if (!trendDirection) return 'text-muted-foreground';
    return trendDirection === 'up' ? 'text-success' : 'text-error';
  };

  const getTrendIcon = () => {
    if (!trendDirection) return null;
    return trendDirection === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${iconColor}15` }}>
          <Icon name={icon} size={20} color={iconColor} className="md:w-6 md:h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon() && <Icon name={getTrendIcon()} size={16} />}
            <span className="text-xs md:text-sm font-medium caption">{trend}</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs md:text-sm text-muted-foreground caption">{title}</h3>
        <p className="text-2xl md:text-3xl font-semibold text-foreground data-text">{value}</p>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground caption">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;