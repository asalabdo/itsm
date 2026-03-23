import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const KPICorrelationMatrix = () => {
  const [selectedMetric, setSelectedMetric] = useState('availability');

  const correlationData = {
    availability: {
      name: 'Service Availability',
      correlations: [
        { metric: 'Employee Satisfaction', correlation: 0.89, trend: 'positive', impact: 'Strong positive correlation - Higher availability drives satisfaction' },
        { metric: 'Incident Volume', correlation: -0.76, trend: 'negative', impact: 'Strong negative correlation - More incidents reduce availability' },
        { metric: 'Resolution Time', correlation: -0.65, trend: 'negative', impact: 'Moderate negative correlation - Faster resolution improves availability' },
        { metric: 'Cost per Ticket', correlation: -0.43, trend: 'negative', impact: 'Moderate negative correlation - Higher availability reduces costs' },
        { metric: 'Business Revenue', correlation: 0.72, trend: 'positive', impact: 'Strong positive correlation - Availability directly impacts revenue' }
      ]
    },
    satisfaction: {
      name: 'Employee Satisfaction',
      correlations: [
        { metric: 'Service Availability', correlation: 0.89, trend: 'positive', impact: 'Strong positive correlation - Availability drives satisfaction' },
        { metric: 'Response Time', correlation: -0.82, trend: 'negative', impact: 'Strong negative correlation - Faster response improves satisfaction' },
        { metric: 'First Call Resolution', correlation: 0.78, trend: 'positive', impact: 'Strong positive correlation - Resolving issues quickly increases satisfaction' },
        { metric: 'Communication Quality', correlation: 0.71, trend: 'positive', impact: 'Strong positive correlation - Better communication improves satisfaction' },
        { metric: 'Self-Service Usage', correlation: 0.58, trend: 'positive', impact: 'Moderate positive correlation - Self-service options increase satisfaction' }
      ]
    },
    cost: {
      name: 'Cost per Ticket',
      correlations: [
        { metric: 'Automation Level', correlation: -0.84, trend: 'negative', impact: 'Strong negative correlation - More automation reduces costs' },
        { metric: 'First Call Resolution', correlation: -0.79, trend: 'negative', impact: 'Strong negative correlation - Resolving issues quickly reduces costs' },
        { metric: 'Technician Experience', correlation: -0.67, trend: 'negative', impact: 'Moderate negative correlation - Experienced staff work more efficiently' },
        { metric: 'Incident Complexity', correlation: 0.73, trend: 'positive', impact: 'Strong positive correlation - Complex issues cost more to resolve' },
        { metric: 'Escalation Rate', correlation: 0.61, trend: 'positive', impact: 'Moderate positive correlation - Escalations increase handling costs' }
      ]
    },
    business: {
      name: 'Business Impact Score',
      correlations: [
        { metric: 'Service Availability', correlation: 0.91, trend: 'positive', impact: 'Very strong positive correlation - Availability directly affects business' },
        { metric: 'Critical Incident Count', correlation: -0.85, trend: 'negative', impact: 'Strong negative correlation - Critical incidents harm business operations' },
        { metric: 'User Productivity', correlation: 0.78, trend: 'positive', impact: 'Strong positive correlation - IT performance affects user productivity' },
        { metric: 'System Performance', correlation: 0.74, trend: 'positive', impact: 'Strong positive correlation - System performance impacts business processes' },
        { metric: 'Security Incidents', correlation: -0.69, trend: 'negative', impact: 'Moderate negative correlation - Security issues affect business confidence' }
      ]
    }
  };

  const metrics = [
    { key: 'availability', label: 'Service Availability', icon: 'Activity', color: 'text-success' },
    { key: 'satisfaction', label: 'Employee Satisfaction', icon: 'Heart', color: 'text-primary' },
    { key: 'cost', label: 'Cost per Ticket', icon: 'DollarSign', color: 'text-warning' },
    { key: 'business', label: 'Business Impact', icon: 'TrendingUp', color: 'text-accent' }
  ];

  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
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
          <h3 className="text-lg font-semibold text-foreground">KPI Correlation Matrix</h3>
          <p className="text-sm text-muted-foreground">Relationships between IT performance and business outcomes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Predictive Analytics</span>
        </div>
      </div>
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {metrics?.map((metric) => (
          <Button
            key={metric?.key}
            variant={selectedMetric === metric?.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMetric(metric?.key)}
            iconName={metric?.icon}
            iconPosition="left"
            iconSize={16}
            className="flex-shrink-0"
          >
            {metric?.label}
          </Button>
        ))}
      </div>
      {/* Selected Metric Analysis */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Target" size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{currentData?.name}</h4>
            <p className="text-sm text-muted-foreground">Impact analysis and correlations</p>
          </div>
        </div>
      </div>
      {/* Correlation List */}
      <div className="space-y-4">
        {currentData?.correlations?.map((item, index) => (
          <div key={index} className={`p-4 rounded-lg border border-border ${getCorrelationBg(item?.correlation)} hover:bg-opacity-20 micro-interaction`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getCorrelationBg(item?.correlation)}`}>
                  <Icon 
                    name={item?.trend === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className={getCorrelationColor(item?.correlation)} 
                  />
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
                <div className="text-xs text-muted-foreground">Correlation</div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item?.impact}
            </p>
          </div>
        ))}
      </div>
      {/* Predictive Insights */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Predictive Insights</h4>
          <Button variant="ghost" size="sm" iconName="Brain" iconPosition="left" iconSize={16}>
            AI Analysis
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Optimization Opportunity</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Improving first call resolution by 10% could increase satisfaction by 7.8% and reduce costs by $12,000/month
            </p>
          </div>
          
          <div className="p-3 bg-warning/10 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <span className="text-sm font-medium text-warning">Risk Alert</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Current incident trend suggests 15% increase in business impact if not addressed within 2 weeks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICorrelationMatrix;