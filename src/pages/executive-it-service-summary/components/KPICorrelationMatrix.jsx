import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const KPICorrelationMatrix = ({ correlations: correlationsProp }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedMetric, setSelectedMetric] = useState('availability');

  const correlationData = correlationsProp || useMemo(() => ({
    availability: { name: t('serviceAvailability', 'Service Availability'), correlations: [] },
    satisfaction: { name: t('employeeSatisfaction', 'Employee Satisfaction'), correlations: [] },
    cost: { name: t('costPerTicket', 'Cost per Ticket'), correlations: [] },
    business: { name: t('businessImpactScore', 'Business Impact Score'), correlations: [] },
  }), [correlationsProp, language]);

  const metrics = [
    { key: 'availability', label: t('serviceAvailability', 'Service Availability'), icon: 'Activity' },
    { key: 'satisfaction', label: t('employeeSatisfaction', 'Employee Satisfaction'), icon: 'Heart' },
    { key: 'cost', label: t('costPerTicket', 'Cost per Ticket'), icon: 'Banknote' },
    { key: 'business', label: t('businessImpact', 'Business Impact'), icon: 'TrendingUp' },
  ];

  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return t('veryStrong', 'Very Strong');
    if (abs >= 0.6) return t('strong', 'Strong');
    if (abs >= 0.4) return t('moderate', 'Moderate');
    if (abs >= 0.2) return t('weak', 'Weak');
    return t('veryWeak', 'Very Weak');
  };

  const getCorrelationColor = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return correlation > 0 ? 'text-success' : 'text-error';
    if (abs >= 0.6) return correlation > 0 ? 'text-primary' : 'text-warning';
    if (abs >= 0.4) return 'text-accent';
    return 'text-muted-foreground';
  };

  const getCorrelationBg = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return correlation > 0 ? 'bg-success/10' : 'bg-error/10';
    if (abs >= 0.6) return correlation > 0 ? 'bg-primary/10' : 'bg-warning/10';
    if (abs >= 0.4) return 'bg-accent/10';
    return 'bg-muted/50';
  };

  const currentData = correlationData?.[selectedMetric];

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('kpiCorrelationMatrix', 'KPI Correlation Matrix')}</h3>
          <p className="text-sm text-muted-foreground">{t('relationshipsBetweenItPerformanceAndBusinessOutcomes', 'Relationships between IT performance and business outcomes')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t('predictiveAnalytics', 'Predictive Analytics')}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {metrics.map((metric) => (
          <Button
            key={metric.key}
            variant={selectedMetric === metric.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric(metric.key)}
            iconName={metric.icon}
            iconPosition="left"
            iconSize={16}
            className="flex-shrink-0"
          >
            {metric.label}
          </Button>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Target" size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{currentData?.name}</h4>
            <p className="text-sm text-muted-foreground">{t('impactAnalysisAndCorrelations', 'Impact analysis and correlations')}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {currentData?.correlations?.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg border border-border ${getCorrelationBg(item?.correlation)} hover:bg-opacity-20 micro-interaction`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCorrelationBg(item?.correlation)}`}>
                  <Icon name={item?.trend === 'positive' ? 'TrendingUp' : 'TrendingDown'} size={16} className={getCorrelationColor(item?.correlation)} />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">{item?.metric}</h5>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`font-medium ${getCorrelationColor(item?.correlation)}`}>
                      {item?.correlation > 0 ? '+' : ''}{item?.correlation?.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className={`text-xs ${getCorrelationColor(item?.correlation)}`}>
                      {getCorrelationStrength(item?.correlation)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getCorrelationColor(item?.correlation)}`}>
                  {Math.abs(item?.correlation * 100)?.toFixed(0)}%
                </div>
                <div className="text-xs text-muted-foreground">{t('correlation', 'Correlation')}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{item?.impact}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">{t('predictiveInsights', 'Predictive Insights')}</h4>
          <Button variant="ghost" size="sm" iconName="Brain" iconPosition="left" iconSize={16}>
            {t('aiAnalysis', 'AI Analysis')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">{t('optimizationOpportunity', 'Optimization Opportunity')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('firstCallResolutionImpact', 'Improving first call resolution by 10% could increase satisfaction by 7.8% and reduce costs by $12,000/month')}
            </p>
          </div>

          <div className="p-3 bg-warning/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">{t('riskAlert', 'Risk Alert')}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('businessImpactRisk', 'Current incident trend suggests 15% increase in business impact if not addressed within 2 weeks')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICorrelationMatrix;
