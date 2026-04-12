import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportLibrarySidebar = ({ onSelectReport, selectedReportId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(['pre-built', 'custom']);

  const reportCategories = [
    {
      id: 'pre-built',
      name: 'Pre-built Templates',
      icon: 'FileText',
      reports: [
        { id: 'r1', name: 'Ticket Volume Analysis', icon: 'TrendingUp', lastRun: '2026-01-07 05:30:00', frequency: 'Daily' },
        { id: 'r2', name: 'Asset Utilization Report', icon: 'Package', lastRun: '2026-01-06 23:45:00', frequency: 'Weekly' },
        { id: 'r3', name: 'Workflow Performance Metrics', icon: 'Activity', lastRun: '2026-01-07 04:15:00', frequency: 'Daily' },
        { id: 'r4', name: 'Department Efficiency Dashboard', icon: 'Users', lastRun: '2026-01-07 00:00:00', frequency: 'Daily' },
        { id: 'r5', name: 'SLA Compliance Summary', icon: 'Clock', lastRun: '2026-01-07 06:00:00', frequency: 'Hourly' },
        { id: 'r6', name: 'Asset Depreciation Analysis', icon: 'Banknote', lastRun: '2026-01-06 18:00:00', frequency: 'Monthly' }
      ]
    },
    {
      id: 'custom',
      name: 'Custom Reports',
      icon: 'Settings',
      reports: [
        { id: 'c1', name: 'Q4 Executive Summary', icon: 'PieChart', lastRun: '2026-01-05 16:30:00', frequency: 'On-demand' },
        { id: 'c2', name: 'IT Asset Inventory', icon: 'HardDrive', lastRun: '2026-01-07 03:00:00', frequency: 'Weekly' },
        { id: 'c3', name: 'Approval Bottleneck Analysis', icon: 'AlertTriangle', lastRun: '2026-01-06 14:20:00', frequency: 'On-demand' }
      ]
    },
    {
      id: 'scheduled',
      name: 'Scheduled Reports',
      icon: 'Calendar',
      reports: [
        { id: 's1', name: 'Monthly Operations Review', icon: 'FileBarChart', lastRun: '2026-01-01 08:00:00', frequency: 'Monthly' },
        { id: 's2', name: 'Weekly Team Performance', icon: 'Target', lastRun: '2026-01-06 09:00:00', frequency: 'Weekly' }
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev?.includes(categoryId)
        ? prev?.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = reportCategories?.map(category => ({
    ...category,
    reports: category?.reports?.filter(report =>
      report?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
    )
  }))?.filter(category => category?.reports?.length > 0);

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Report Library</h2>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-2">
        {filteredCategories?.map(category => (
          <div key={category?.id} className="mb-2">
            <button
              onClick={() => toggleCategory(category?.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-smooth text-left"
            >
              <div className="flex items-center gap-2">
                <Icon name={category?.icon} size={18} />
                <span className="text-sm font-medium">{category?.name}</span>
              </div>
              <Icon
                name="ChevronDown"
                size={16}
                className={`transition-transform ${expandedCategories?.includes(category?.id) ? 'rotate-180' : ''}`}
              />
            </button>

            {expandedCategories?.includes(category?.id) && (
              <div className="mt-1 ml-2 space-y-1">
                {category?.reports?.map(report => (
                  <button
                    key={report?.id}
                    onClick={() => onSelectReport(report)}
                    className={`w-full flex items-start gap-2 px-3 py-2 rounded-md transition-smooth text-left ${
                      selectedReportId === report?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon name={report?.icon} size={16} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{report?.name}</p>
                      <p className={`text-xs mt-0.5 ${
                        selectedReportId === report?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {report?.frequency}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="default"
          fullWidth
          iconName="Plus"
          iconPosition="left"
          size="sm"
        >
          Create Custom Report
        </Button>
      </div>
    </div>
  );
};

export default ReportLibrarySidebar;