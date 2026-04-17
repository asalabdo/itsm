import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';

const AssetMetricsCard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const { isRtl } = useLanguage();
  
  const getColorClasses = () => {
    switch (color) {
      case 'success': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-error text-error-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses()}`}>
          <Icon name={icon} size={24} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${getChangeColor()} ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Icon 
              name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
              size={16} 
            />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      <div>
        <h3 className={`text-2xl font-bold text-foreground mb-1 ${isRtl ? 'text-right' : 'text-left'}`}>{value}</h3>
        <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{title}</p>
      </div>
    </div>
  );
};

export default AssetMetricsCard;