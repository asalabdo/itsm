import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const TrendAnalysisChart = ({ data = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const monthlyData = useMemo(() => {
    return (data || []).map((d, index) => ({
      month: d.date || (isArabic ? `النقطة ${index + 1}` : `Point ${index + 1}`),
      incidents: Number(d.count ?? 0),
      availability: Number((99 - Math.min(1.5, Number(d.count ?? 0) / 100)).toFixed(1)),
      satisfaction: Number((4.1 + Math.min(0.6, Number(d.count ?? 0) / 200)).toFixed(1)),
      resolution: Number((2.8 - Math.min(1.4, Number(d.count ?? 0) / 120)).toFixed(1))
    }));
  }, [data]);

  const quarterlyData = useMemo(() => {
    const groups = [];
    for (let i = 0; i < monthlyData.length; i += 3) {
      const slice = monthlyData.slice(i, i + 3);
      const total = slice.reduce((sum, item) => sum + Number(item.incidents || 0), 0);
      groups.push({
        quarter: isArabic ? `الربع ${Math.floor(i / 3) + 1}` : `Q${Math.floor(i / 3) + 1}`,
        availability: Number((99 - Math.min(1.2, total / 300)).toFixed(1)),
        satisfaction: Number((4.1 + Math.min(0.5, total / 500)).toFixed(1)),
        incidents: total,
        resolution: Number((2.6 - Math.min(1.0, total / 400)).toFixed(1))
      });
    }
    return groups;
  }, [monthlyData]);

  const yearlyData = useMemo(() => {
    const total = monthlyData.reduce((sum, item) => sum + Number(item.incidents || 0), 0);
    return [
      {
        year: new Date().getFullYear().toString(),
        availability: Number((99 - Math.min(1, total / 1000)).toFixed(1)),
        satisfaction: Number((4.1 + Math.min(0.4, total / 1200)).toFixed(1)),
        incidents: total,
        resolution: Number((2.4 - Math.min(0.8, total / 1500)).toFixed(1))
      }
    ];
  }, [monthlyData]);

  const getData = () => {
    switch (selectedPeriod) {
      case 'quarterly': return quarterlyData;
      case 'yearly': return yearlyData;
      default: return monthlyData;
    }
  };

  const getXAxisKey = () => {
    switch (selectedPeriod) {
      case 'quarterly': return 'quarter';
      case 'yearly': return 'year';
      default: return 'month';
    }
  };

  const periods = [
    { key: 'monthly', label: isArabic ? 'شهري' : t('monthly', 'Monthly'), icon: 'Calendar' },
    { key: 'quarterly', label: isArabic ? 'ربع سنوي' : t('quarterly', 'Quarterly'), icon: 'BarChart3' },
    { key: 'yearly', label: isArabic ? 'سنوي' : t('yearly', 'Yearly'), icon: 'TrendingUp' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('performanceTrendAnalysis', 'Performance Trend Analysis')}</h3>
          <p className="text-sm text-muted-foreground">{isArabic ? 'تتبع اتجاهات المؤشرات الرئيسية عبر الزمن' : t('keyMetricsTrendingOverTime', 'Key metrics trending over time')}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {periods?.map((period) => (
            <Button
              key={period?.key}
              variant={selectedPeriod === period?.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period?.key)}
              iconName={period?.icon}
              iconPosition="left"
              iconSize={16}
            >
              {period?.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={getData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={getXAxisKey()} 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--color-popover)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-popover-foreground)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="availability" 
              stroke="var(--color-success)" 
              strokeWidth={3}
              name={isArabic ? 'التوفر %' : t('availabilityPercent', 'Availability %')}
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="satisfaction" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              name={isArabic ? 'مؤشر الرضا' : t('satisfactionScore', 'Satisfaction Score')}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="resolution" 
              stroke="var(--color-accent)" 
              strokeWidth={3}
              name={isArabic ? 'متوسط الحل (ساعة)' : t('avgResolutionHours', 'Avg Resolution (hrs)')}
              dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-sm font-medium text-success">{isArabic ? 'التوفر' : t('availability', 'Availability')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{isArabic ? 'اتجاه صاعد +0.8%' : t('trendingUpwardXpercent', 'Trending upward +0.8%')}</p>
        </div>
        
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">{isArabic ? 'الرضا' : t('satisfaction', 'Satisfaction')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{isArabic ? 'تحسن مستمر +0.4' : t('steadyImprovementX', 'Steady improvement +0.4')}</p>
        </div>
        
        <div className="text-center p-3 bg-accent/10 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="TrendingDown" size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">{isArabic ? 'وقت الحل' : t('resolutionTime', 'Resolution Time')}</span>
          </div>
          <p className="text-xs text-muted-foreground">{isArabic ? 'أسرع بمقدار 1.1 ساعة' : t('fasterByXhours', 'Faster by 1.1 hours')}</p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisChart;
