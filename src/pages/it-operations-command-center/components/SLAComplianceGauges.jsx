import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { dashboardAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const SLAComplianceGauges = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [slaMetrics, setSlaMetrics] = useState([]);
  const [breachPredictions, setBreachPredictions] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSLAData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getPerformanceMetrics('sla');
      const data = Array.isArray(res.data) ? res.data : [];
      const mapped = data.map((m, idx) => ({
        id: `sla_${idx}_${m.metricName?.replace(/\s+/g, '_') || 'metric'}`,
        name: m.metricName || 'SLA Metric',
        current: Number(m.value) || 0,
        target: 100,
        trend: (m.trend || 'Stable').toLowerCase() === 'down' ? 'down' : 'up',
        trendValue: Number(m.percentageChange || 0),
        breachRisk: (m.metricName || '').toLowerCase().includes('breach') ? 'high' : 'low',
        details: {
          p1: { current: Number(m.value) || 0, target: 100, breaches: 0 }
        }
      }));

      setSlaMetrics(mapped);
      setBreachPredictions([]);
    } catch (error) {
      console.error('Failed to fetch SLA metrics:', error);
      setSlaMetrics([]);
      setBreachPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSLAData();

    const handleRefresh = () => {
      fetchSLAData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, []);

  const getGaugeColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#059669'; // success
    if (percentage >= 90) return '#D97706'; // warning
    return '#DC2626'; // error
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'high': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? 'TrendingUp' : 'TrendingDown';
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-success' : 'text-error';
  };

  const createGaugePath = (percentage) => {
    const angle = (percentage / 100) * 180;
    const radians = (angle * Math.PI) / 180;
    const x = 50 + 40 * Math.cos(radians - Math.PI);
    const y = 50 + 40 * Math.sin(radians - Math.PI);
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M 10 50 A 40 40 0 ${largeArcFlag} 1 ${x} ${y}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Gauge" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">{t('slaCompliance', 'SLA Compliance')}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="AlertTriangle"
            onClick={() => navigate('/escalations')}
          >
            {t('predictions', 'Predictions')} ({breachPredictions?.length})
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Settings"
            onClick={() => navigate('/sla-policies')}
          >
            {t('configure', 'Configure')}
          </Button>
        </div>
      </div>
      {/* SLA Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {slaMetrics?.map((metric) => {
          const percentage = Math.min((metric?.current / metric?.target) * 100, 100);
          const gaugeColor = getGaugeColor(metric?.current, metric?.target);
          
          return (
            <div 
              key={metric?.id}
              className={`border border-border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                selectedMetric === metric?.id ? 'ring-2 ring-primary bg-muted/30' : ''
              }`}
              onClick={() => setSelectedMetric(selectedMetric === metric?.id ? null : metric?.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground">{metric?.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(metric?.breachRisk)}`}>
                  {metric?.breachRisk?.toUpperCase()} RISK
                </span>
              </div>
              {/* Gauge SVG */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <svg width="120" height="80" viewBox="0 0 100 60">
                    {/* Background Arc */}
                    <path
                      d="M 10 50 A 40 40 0 0 1 90 50"
                      fill="none"
                      stroke="var(--color-muted)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    
                    {/* Progress Arc */}
                    <path
                      d={createGaugePath(percentage)}
                      fill="none"
                      stroke={gaugeColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    
                    {/* Center Text */}
                    <text
                      x="50"
                      y="45"
                      textAnchor="middle"
                      className="text-lg font-bold fill-current text-foreground"
                    >
                      {metric?.current}%
                    </text>
                  </svg>
                  
                  {/* Target Line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                    <div className="text-xs text-muted-foreground">
                      {t('target', 'Target')}: {metric?.target}%
                    </div>
                  </div>
                </div>
              </div>
              {/* Trend Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Icon 
                  name={getTrendIcon(metric?.trend)} 
                  size={16} 
                  className={getTrendColor(metric?.trend)} 
                />
                <span className={`text-sm font-medium ${getTrendColor(metric?.trend)}`}>
                  {metric?.trend === 'up' ? '+' : ''}{metric?.trendValue}%
                </span>
                <span className="text-xs text-muted-foreground">{t('vsLastWeek', 'vs last week')}</span>
              </div>
              {/* Expanded Details */}
              {selectedMetric === metric?.id && (
                <div className="border-t border-border pt-4">
                  <h5 className="text-sm font-medium text-foreground mb-3">{t('priorityBreakdown', 'Priority Breakdown')}:</h5>
                  <div className="space-y-2">
                    {Object.entries(metric?.details)?.map(([priority, data]) => (
                      <div key={priority} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {priority}:
                          </span>
                          <span className="font-medium text-foreground">
                            {data?.current}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({t('target', 'target')}: {data?.target}%)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-error">
                            {data?.breaches} {t('breaches', 'breaches')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Breach Predictions */}
      {breachPredictions?.length > 0 && (
        <div className="border-t border-border pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="AlertTriangle" size={20} className="text-warning" />
            <h4 className="font-medium text-foreground">{t('breachPredictions', 'Breach Predictions')}</h4>
          </div>

          <div className="space-y-3">
            {breachPredictions?.map((prediction) => (
              <div key={prediction?.id} className="border border-warning/30 bg-warning/5 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {prediction?.metric} - {prediction?.priority}
                    </span>
                    <span className="px-2 py-1 bg-warning text-warning-foreground text-xs rounded">
                      {prediction?.impact} {t('impact', 'Impact')}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-warning">
                      {prediction?.predictedBreach}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {prediction?.confidence}% {t('confidence', 'confidence')}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3">
                  <strong>{t('recommendation', 'Recommendation')}:</strong> {prediction?.recommendation}
                </p>

                <div className="flex space-x-2">
                  <Button variant="warning" size="sm" onClick={() => navigate('/escalations')}>
                    {t('takeAction', 'Take Action')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setBreachPredictions(prev => prev.slice(1))}>
                    {t('dismiss', 'Dismiss')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAComplianceGauges;
