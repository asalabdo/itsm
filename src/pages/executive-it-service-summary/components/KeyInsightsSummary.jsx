import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const KeyInsightsSummary = () => {
  const insights = [
    {
      id: 1,
      type: 'positive',
      title: 'Service Availability Improvement',
      description: `IT service availability has increased by 0.8% this quarter, reaching 99.8% uptime. This improvement is primarily driven by proactive monitoring and faster incident response times.`,
      impact: 'High',
      action: 'Continue current monitoring practices',
      timestamp: '2 hours ago',
      icon: 'TrendingUp'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Database Performance Concerns',
      description: `Database services showing increased response times during peak hours. Average query time has increased by 15% over the past two weeks, affecting user experience.`,
      impact: 'Medium',
      action: 'Schedule performance optimization',
      timestamp: '4 hours ago',
      icon: 'AlertTriangle'
    },
    {
      id: 3,
      type: 'neutral',
      title: 'Cost Optimization Opportunity',
      description: `Analysis shows potential 12% cost reduction through cloud resource optimization. Current utilization rates suggest over-provisioning in development environments.`,
      impact: 'Medium',
      action: 'Review resource allocation',
      timestamp: '6 hours ago',
      icon: 'DollarSign'
    },
    {
      id: 4,
      type: 'positive',
      title: 'Employee Satisfaction Growth',
      description: `Employee satisfaction scores have improved to 4.5/5.0, with particularly strong feedback on incident communication and resolution speed improvements.`,
      impact: 'High',
      action: 'Maintain current service levels',
      timestamp: '8 hours ago',
      icon: 'Heart'
    }
  ];

  const recommendations = [
    {
      id: 1,
      priority: 'high',
      title: 'Implement Predictive Analytics',
      description: 'Deploy AI-driven predictive analytics to prevent incidents before they occur',
      timeline: '30 days',
      impact: 'Reduce incidents by 25%'
    },
    {
      id: 2,
      priority: 'medium',
      title: 'Expand Self-Service Portal',
      description: 'Enhance user portal with additional self-service capabilities',
      timeline: '45 days',
      impact: 'Reduce ticket volume by 15%'
    },
    {
      id: 3,
      priority: 'medium',
      title: 'Cloud Migration Phase 2',
      description: 'Continue migration of legacy systems to cloud infrastructure',
      timeline: '90 days',
      impact: 'Improve scalability and reduce costs'
    }
  ];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'critical': return 'XCircle';
      default: return 'Info';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-error';
      default: return 'text-primary';
    }
  };

  const getInsightBg = (type) => {
    switch (type) {
      case 'positive': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'critical': return 'bg-error/10';
      default: return 'bg-primary/10';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Key Insights</h3>
            <p className="text-sm text-muted-foreground">AI-generated analysis and trends</p>
          </div>
          <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left" iconSize={16}>
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {insights?.map((insight) => (
            <div key={insight?.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getInsightBg(insight?.type)} flex-shrink-0 mt-1`}>
                  <Icon 
                    name={insight?.icon} 
                    size={16} 
                    className={getInsightColor(insight?.type)} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{insight?.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        insight?.impact === 'High' ? 'bg-error/10 text-error' :
                        insight?.impact === 'Medium'? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                      }`}>
                        {insight?.impact} Impact
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {insight?.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon name="Target" size={14} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{insight?.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{insight?.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recommendations */}
      <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Strategic Recommendations</h3>
            <p className="text-sm text-muted-foreground">Action items for continuous improvement</p>
          </div>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left" iconSize={16}>
            Add Custom
          </Button>
        </div>

        <div className="space-y-4">
          {recommendations?.map((rec) => (
            <div key={rec?.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 micro-interaction">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    rec?.priority === 'high' ? 'bg-error' :
                    rec?.priority === 'medium'? 'bg-warning' : 'bg-success'
                  }`} />
                  <h4 className="font-medium text-foreground">{rec?.title}</h4>
                </div>
                <span className={`text-xs font-medium uppercase tracking-wide ${getPriorityColor(rec?.priority)}`}>
                  {rec?.priority} Priority
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3 ml-5">
                {rec?.description}
              </p>
              
              <div className="flex items-center justify-between ml-5">
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={12} />
                    <span>{rec?.timeline}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={12} />
                    <span>{rec?.impact}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              3 recommendations • Estimated ROI: 18% improvement
            </div>
            <Button variant="outline" size="sm">
              Export Action Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyInsightsSummary;