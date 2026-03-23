import React from 'react';
import Icon from '../../../components/AppIcon';

const RoutingPreview = ({ category, priority, subject }) => {
  const getRoutingInfo = () => {
    if (!category || !priority) return null;

    const routingRules = {
      incident: {
        urgent: {
          team: 'Critical Response Team',
          assignee: 'Senior Engineer - On Call',
          sla: '1 hour',
          escalation: 'Immediate manager notification',
          icon: 'Zap',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Priority Support Team',
          assignee: 'Available Senior Agent',
          sla: '4 hours',
          escalation: 'Manager notification after 2 hours',
          icon: 'AlertCircle',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'General Support Team',
          assignee: 'Next Available Agent',
          sla: '8 hours',
          escalation: 'Standard escalation path',
          icon: 'Info',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'General Support Team',
          assignee: 'Queue Assignment',
          sla: '24 hours',
          escalation: 'Standard escalation path',
          icon: 'MinusCircle',
          color: 'var(--color-muted-foreground)',
        },
      },
      problem: {
        urgent: {
          team: 'Problem Management Team',
          assignee: 'Senior Problem Manager',
          sla: '2 hours',
          escalation: 'Director notification',
          icon: 'Bug',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Problem Management Team',
          assignee: 'Problem Manager',
          sla: '8 hours',
          escalation: 'Manager notification after 4 hours',
          icon: 'Bug',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'Problem Analysis Team',
          assignee: 'Problem Analyst',
          sla: '24 hours',
          escalation: 'Standard escalation path',
          icon: 'Bug',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'Problem Analysis Team',
          assignee: 'Queue Assignment',
          sla: '48 hours',
          escalation: 'Standard escalation path',
          icon: 'Bug',
          color: 'var(--color-muted-foreground)',
        },
      },
      change: {
        urgent: {
          team: 'Emergency Change Team',
          assignee: 'Change Manager - Emergency',
          sla: '4 hours',
          escalation: 'CAB emergency approval',
          icon: 'GitBranch',
          color: 'var(--color-error)',
        },
        high: {
          team: 'Change Management Team',
          assignee: 'Senior Change Manager',
          sla: '12 hours',
          escalation: 'CAB approval required',
          icon: 'GitBranch',
          color: 'var(--color-warning)',
        },
        medium: {
          team: 'Change Management Team',
          assignee: 'Change Coordinator',
          sla: '48 hours',
          escalation: 'Standard CAB review',
          icon: 'GitBranch',
          color: 'var(--color-primary)',
        },
        low: {
          team: 'Change Management Team',
          assignee: 'Change Coordinator',
          sla: '5 days',
          escalation: 'Standard CAB review',
          icon: 'GitBranch',
          color: 'var(--color-muted-foreground)',
        },
      },
    };

    return routingRules?.[category]?.[priority];
  };

  const routingInfo = getRoutingInfo();

  if (!routingInfo) return null;

  return (
    <div className="p-4 md:p-5 bg-primary/5 border border-primary/30 rounded-lg">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Route" size={20} color="var(--color-primary)" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">
            Automated Routing Preview
          </h3>
          <p className="text-sm text-muted-foreground caption">
            Based on category and priority selection
          </p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Icon name="Users" size={18} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground caption mb-0.5">Assigned Team</p>
            <p className="text-sm font-medium text-foreground">{routingInfo?.team}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="UserCheck" size={18} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground caption mb-0.5">Assignee</p>
            <p className="text-sm font-medium text-foreground">{routingInfo?.assignee}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="Clock" size={18} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground caption mb-0.5">Response SLA</p>
            <p className="text-sm font-medium text-foreground">{routingInfo?.sla}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Icon name="TrendingUp" size={18} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground caption mb-0.5">Escalation Path</p>
            <p className="text-sm font-medium text-foreground">{routingInfo?.escalation}</p>
          </div>
        </div>
      </div>
      {subject && subject?.length > 10 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-success">
            <Icon name="CheckCircle2" size={16} />
            <span className="font-medium">Routing rules validated</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutingPreview;