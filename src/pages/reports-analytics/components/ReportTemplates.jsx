import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportTemplates = ({ onGenerateReport }) => {
  const templates = [
    {
      id: 1,
      name: "Monthly Performance Summary",
      description: "Comprehensive overview of ticket metrics, resolution times, and team performance for the month",
      icon: "FileText",
      iconColor: "var(--color-primary)",
      frequency: "Monthly",
    },
    {
      id: 2,
      name: "SLA Compliance Report",
      description: "Detailed analysis of SLA adherence, breach incidents, and response time metrics",
      icon: "Clock",
      iconColor: "var(--color-warning)",
      frequency: "Weekly",
    },
    {
      id: 3,
      name: "Workload Distribution Analysis",
      description: "Agent workload comparison, ticket assignment patterns, and capacity utilization",
      icon: "Users",
      iconColor: "var(--color-success)",
      frequency: "Bi-weekly",
    },
    {
      id: 4,
      name: "Employee Satisfaction Report",
      description: "CSAT scores, feedback analysis, and customer sentiment trends over time",
      icon: "Star",
      iconColor: "var(--color-accent)",
      frequency: "Monthly",
    },
    {
      id: 5,
      name: "Ticket Category Breakdown",
      description: "Distribution of tickets by category, department, and priority levels",
      icon: "PieChart",
      iconColor: "var(--color-secondary)",
      frequency: "Weekly",
    },
    {
      id: 6,
      name: "Resolution Time Analytics",
      description: "Average resolution times, first response metrics, and efficiency trends",
      icon: "Timer",
      iconColor: "var(--color-error)",
      frequency: "Daily",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="FileStack" size={20} color="var(--color-primary)" />
          <h3 className="text-lg md:text-xl font-semibold text-foreground">Report Templates</h3>
        </div>
        <p className="text-sm text-muted-foreground caption">Pre-built reports for common analytics needs</p>
      </div>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates?.map((template) => (
            <div
              key={template?.id}
              className="border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-smooth"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${template?.iconColor}15` }}
                >
                  <Icon name={template?.icon} size={20} color={template?.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{template?.name}</h4>
                  <p className="text-sm text-muted-foreground caption line-clamp-2">
                    {template?.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground caption flex items-center gap-1">
                  <Icon name="Calendar" size={14} />
                  {template?.frequency}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  onClick={() => onGenerateReport(template)}
                >
                  Generate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportTemplates;