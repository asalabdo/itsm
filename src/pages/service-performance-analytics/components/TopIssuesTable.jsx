import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TopIssuesTable = () => {
  const [sortBy, setSortBy] = useState('frequency');
  const [sortOrder, setSortOrder] = useState('desc');

  const issuesData = [
    {
      id: 1,
      issue: "Email Server Connectivity",
      category: "Infrastructure",
      frequency: 45,
      avgResolution: "2.3h",
      impact: "High",
      trend: "up",
      rootCause: "Network Configuration"
    },
    {
      id: 2,
      issue: "Password Reset Requests",
      category: "User Access",
      frequency: 38,
      avgResolution: "0.5h",
      impact: "Low",
      trend: "down",
      rootCause: "User Training"
    },
    {
      id: 3,
      issue: "Software License Expiry",
      category: "Asset Management",
      frequency: 32,
      avgResolution: "4.1h",
      impact: "Medium",
      trend: "up",
      rootCause: "Process Gap"
    },
    {
      id: 4,
      issue: "VPN Connection Issues",
      category: "Network",
      frequency: 28,
      avgResolution: "1.8h",
      impact: "Medium",
      trend: "stable",
      rootCause: "Infrastructure"
    },
    {
      id: 5,
      issue: "Printer Connectivity",
      category: "Hardware",
      frequency: 24,
      avgResolution: "1.2h",
      impact: "Low",
      trend: "down",
      rootCause: "Hardware Failure"
    },
    {
      id: 6,
      issue: "Database Performance",
      category: "Application",
      frequency: 21,
      avgResolution: "3.5h",
      impact: "High",
      trend: "up",
      rootCause: "Capacity Planning"
    },
    {
      id: 7,
      issue: "Mobile Device Setup",
      category: "User Support",
      frequency: 19,
      avgResolution: "1.5h",
      impact: "Low",
      trend: "stable",
      rootCause: "User Training"
    },
    {
      id: 8,
      issue: "Security Alert Response",
      category: "Security",
      frequency: 16,
      avgResolution: "6.2h",
      impact: "Critical",
      trend: "up",
      rootCause: "Process Gap"
    }
  ];

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Critical': return 'text-error bg-error/10';
      case 'High': return 'text-warning bg-warning/10';
      case 'Medium': return 'text-secondary bg-secondary/10';
      case 'Low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      case 'stable': return 'Minus';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-error';
      case 'down': return 'text-success';
      case 'stable': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedData = [...issuesData]?.sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];
    
    if (sortBy === 'frequency') {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-card border border-border rounded-lg operations-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Top Issues</h3>
            <p className="text-sm text-muted-foreground">Most frequent issues by category</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName="Filter"
            iconPosition="left"
          >
            Filter
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button 
                  onClick={() => handleSort('issue')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Issue</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button 
                  onClick={() => handleSort('frequency')}
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <span>Frequency</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Avg Resolution
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Impact
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Trend
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Root Cause
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData?.map((issue, index) => (
              <tr key={issue?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{issue?.issue}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{issue?.category}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{issue?.frequency}</span>
                    <span className="text-xs text-muted-foreground">incidents</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{issue?.avgResolution}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(issue?.impact)}`}>
                    {issue?.impact}
                  </span>
                </td>
                <td className="p-4">
                  <Icon 
                    name={getTrendIcon(issue?.trend)} 
                    size={16} 
                    className={getTrendColor(issue?.trend)}
                  />
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{issue?.rootCause}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing top 8 issues from last 30 days</span>
          <Button variant="ghost" size="sm">
            View All Issues
            <Icon name="ArrowRight" size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopIssuesTable;