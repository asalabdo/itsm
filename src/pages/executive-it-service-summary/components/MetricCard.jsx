import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue, 
  benchmark, 
  status, 
  icon,
  description 
}) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';

  const titleMap = {
    'it service availability': { en: 'IT Service Availability', ar: 'توافر خدمات تقنية المعلومات' },
    'employee satisfaction': { en: 'Employee Satisfaction', ar: 'رضا الموظفين' },
    'cost per ticket': { en: 'Cost per Ticket', ar: 'تكلفة كل تذكرة' },
    'business impact score': { en: 'Business Impact Score', ar: 'مؤشر تأثير الأعمال' },
  };

  const metricName = String(title || '').trim().toLowerCase();
  const displayTitle = isArabic ? (titleMap[metricName]?.ar || title) : (titleMap[metricName]?.en || title);
  const displayDescription = isArabic
    ? `أداء ${displayTitle} الحالي`
    : description || `Current ${displayTitle} performance`;

  const getStatusColor = () => {
    switch (status) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-error';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor()} bg-opacity-10`}>
            <Icon name={icon} size={20} className={getStatusColor()} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">{displayTitle}</h3>
            <p className="text-xs text-muted-foreground mt-1">{displayDescription}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Icon name={getTrendIcon()} size={16} className={getTrendColor()} />
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trendValue}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>

        {benchmark && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t('benchmark', 'Benchmark')}</span>
            <span className="font-medium text-foreground">{benchmark}</span>
          </div>
        )}

        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              status === 'excellent' ? 'bg-success' :
              status === 'good' ? 'bg-primary' :
              status === 'warning'? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${Math.min(100, (parseFloat(value) / parseFloat(benchmark)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
