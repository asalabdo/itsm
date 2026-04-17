import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';

const MetricCard = ({ title, value, change, changeType, icon, iconColor, trend }) => {
  const { isRtl } = useLanguage();
  
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between mb-3 md:mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="flex-1 min-w-0">
          <p className={`text-sm md:text-base text-muted-foreground mb-1 md:mb-2 caption ${isRtl ? 'text-right' : 'text-left'}`}>{title}</p>
          <h3 className={`text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground data-text ${isRtl ? 'text-right' : 'text-left'}`}>{value}</h3>
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: `${iconColor}15` }}>
          <Icon name={icon} size={20} color={iconColor} className="md:w-6 md:h-6" />
        </div>
      </div>
      <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-1 ${getChangeColor()} ${isRtl ? 'flex-row-reverse' : ''}`}>
          <Icon name={getChangeIcon()} size={16} />
          <span className="text-sm font-medium data-text">{change}</span>
        </div>
        <span className="text-sm text-muted-foreground caption">vs last month</span>
      </div>
      {trend && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
          <div className="h-12 md:h-16 flex items-end gap-1">
            {trend?.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-primary/20 rounded-t transition-smooth hover:bg-primary/30"
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;