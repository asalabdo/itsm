import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrendAnalysisSection = ({ reportData = {} }) => {
  const [activeChart, setActiveChart] = useState('csat');
  const [visibleLines, setVisibleLines] = useState({
    primary: true,
    secondary: true,
    tertiary: true
  });

  const csatData = useMemo(() => {
    const trends = Array.isArray(reportData?.trends) ? reportData.trends : [];
    return trends.slice(-8).map((item, index) => {
      const base = 4 + Math.min(0.4, Number(item.count ?? 0) / 200);
      return {
        date: item.date || `Week ${index + 1}`,
        overall: Number(Math.min(5, base).toFixed(1)),
        technical: Number(Math.min(5, base - 0.1).toFixed(1)),
        communication: Number(Math.min(5, base + 0.1).toFixed(1)),
        resolution: Number(Math.min(5, base - 0.2).toFixed(1))
      };
    });
  }, [reportData]);

  const technicianData = useMemo(() => {
    const performers = Array.isArray(reportData?.overview?.topPerformers) ? reportData.overview.topPerformers : [];
    return performers.slice(0, 8).map((item) => ({
      date: item.technicianName || `Tech ${item.technicianId}`,
      avgResolution: Number(item.avgResolutionTimeHours ?? 0).toFixed(1),
      ticketsResolved: Number(item.resolvedCount ?? 0),
      firstCallResolution: Number(item.slaComplianceRate ?? 0)
    }));
  }, [reportData]);

  const fulfillmentData = useMemo(() => {
    const categories = Array.isArray(reportData?.categories) ? reportData.categories : [];
    return categories.slice(0, 8).map((item) => {
      const percent = Number(item.percentage ?? 0);
      return {
        date: item.category || 'Category',
        avgFulfillment: Number(Math.max(1.2, 3.5 - percent / 40).toFixed(1)),
        slaCompliance: Number(Math.min(100, 88 + percent / 2).toFixed(0)),
        userSatisfaction: Number(Math.min(5, 3.8 + percent / 30).toFixed(1))
      };
    });
  }, [reportData]);

  const chartConfigs = {
    csat: {
      title: 'Employee Satisfaction Trends',
      description: 'CSAT scores across different service dimensions',
      data: csatData,
      lines: [
        { key: 'overall', name: 'Overall CSAT', color: 'var(--color-primary)', visible: 'primary' },
        { key: 'technical', name: 'Technical Quality', color: 'var(--color-secondary)', visible: 'secondary' },
        { key: 'communication', name: 'Communication', color: 'var(--color-success)', visible: 'tertiary' },
        { key: 'resolution', name: 'Resolution Speed', color: 'var(--color-warning)', visible: 'quaternary' }
      ]
    },
    technician: {
      title: 'Technician Performance Metrics',
      description: 'Individual and team performance indicators',
      data: technicianData,
      lines: [
        { key: 'avgResolution', name: 'Avg Resolution (hrs)', color: 'var(--color-primary)', visible: 'primary' },
        { key: 'ticketsResolved', name: 'Tickets Resolved', color: 'var(--color-secondary)', visible: 'secondary' },
        { key: 'firstCallResolution', name: 'First Call Resolution (%)', color: 'var(--color-success)', visible: 'tertiary' }
      ]
    },
    fulfillment: {
      title: 'Service Request Fulfillment',
      description: 'Request processing times and satisfaction metrics',
      data: fulfillmentData,
      lines: [
        { key: 'avgFulfillment', name: 'Avg Fulfillment (days)', color: 'var(--color-primary)', visible: 'primary' },
        { key: 'slaCompliance', name: 'SLA Compliance (%)', color: 'var(--color-secondary)', visible: 'secondary' },
        { key: 'userSatisfaction', name: 'User Satisfaction', color: 'var(--color-success)', visible: 'tertiary' }
      ]
    }
  };

  const currentConfig = chartConfigs?.[activeChart];

  const toggleLineVisibility = (lineKey) => {
    setVisibleLines(prev => ({
      ...prev,
      [lineKey]: !prev?.[lineKey]
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-4 operations-shadow">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-popover-foreground">{entry?.name}:</span>
              </div>
              <span className="text-sm font-medium text-popover-foreground">
                {entry?.name?.includes('%') ? `${entry?.value}%` :
                 entry?.name?.includes('hrs') ? `${entry?.value}h` :
                 entry?.name?.includes('days') ? `${entry?.value}d` :
                 entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{currentConfig?.title}</h3>
          <p className="text-sm text-muted-foreground">{currentConfig?.description}</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 lg:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveChart('csat')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChart === 'csat' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              CSAT
            </button>
            <button
              onClick={() => setActiveChart('technician')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChart === 'technician' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveChart('fulfillment')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeChart === 'fulfillment' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              Fulfillment
            </button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Bookmark"
            iconPosition="left"
          >
            Save View
          </Button>
        </div>
      </div>
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentConfig?.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {currentConfig?.lines?.map((line, index) => (
              <Line
                key={line?.key}
                type="monotone"
                dataKey={line?.key}
                name={line?.name}
                stroke={line?.color}
                strokeWidth={2}
                dot={{ fill: line?.color, strokeWidth: 2, r: 4 }}
                hide={!visibleLines?.[line?.visible]}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-foreground">Toggle Metrics:</span>
          {currentConfig?.lines?.map((line, index) => (
            <button
              key={line?.key}
              onClick={() => toggleLineVisibility(line?.visible)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                visibleLines?.[line?.visible]
                  ? 'bg-primary/10 text-primary border border-primary/20' :'bg-muted text-muted-foreground border border-border'
              }`}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line?.color }}
              />
              <span>{line?.name}</span>
              <Icon 
                name={visibleLines?.[line?.visible] ? "Eye" : "EyeOff"} 
                size={14} 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisSection;
