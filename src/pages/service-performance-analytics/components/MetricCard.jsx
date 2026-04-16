import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const MetricCard = ({ title, value, unit, change, trend, sparklineData, icon, color = 'primary' }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const getChangeColor = () => {
    if (change > 0) return trend === 'up' ? 'text-success' : 'text-error';
    if (change < 0) return trend === 'down' ? 'text-success' : 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (change > 0) return 'TrendingUp';
    if (change < 0) return 'TrendingDown';
    return 'Minus';
  };

  const generateSparkline = () => {
    if (!sparklineData || sparklineData?.length === 0) return null;
    
    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    
    const points = sparklineData?.map((value, index) => {
      const x = (index / (sparklineData?.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })?.join(' ');

    return (
      <svg className="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className={`text-${color}`}
        />
      </svg>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-${color} rounded-lg flex items-center justify-center`}>
            <Icon name={icon} size={20} color="white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
        </div>
        <div className="text-right">
          {generateSparkline()}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name={getChangeIcon()} size={16} className={getChangeColor()} />
          <span className={`text-sm font-medium ${getChangeColor()}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-muted-foreground">{t('vsLastPeriod', 'vs last period')}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
