import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TrendAnalysisSection = () => {
  const [activeChart, setActiveChart] = useState('csat');
  const [visibleLines, setVisibleLines] = useState({
    primary: true,
    secondary: true,
    tertiary: true
  });

  const csatData = [
    { date: 'Week 1', overall: 4.2, technical: 4.1, communication: 4.3, resolution: 4.0 },
    { date: 'Week 2', overall: 4.3, technical: 4.2, communication: 4.4, resolution: 4.1 },
    { date: 'Week 3', overall: 4.1, technical: 3.9, communication: 4.2, resolution: 3.8 },
    { date: 'Week 4', overall: 4.4, technical: 4.3, communication: 4.5, resolution: 4.2 },
    { date: 'Week 5', overall: 4.5, technical: 4.4, communication: 4.6, resolution: 4.3 },
    { date: 'Week 6', overall: 4.3, technical: 4.2, communication: 4.4, resolution: 4.1 },
    { date: 'Week 7', overall: 4.6, technical: 4.5, communication: 4.7, resolution: 4.4 },
    { date: 'Week 8', overall: 4.4, technical: 4.3, communication: 4.5, resolution: 4.2 }
  ];

  const technicianData = [
    { date: 'Week 1', avgResolution: 4.2, ticketsResolved: 28, firstCallResolution: 78 },
    { date: 'Week 2', avgResolution: 3.8, ticketsResolved: 32, firstCallResolution: 82 },
    { date: 'Week 3', avgResolution: 4.5, ticketsResolved: 26, firstCallResolution: 75 },
    { date: 'Week 4', avgResolution: 4.1, ticketsResolved: 30, firstCallResolution: 80 },
    { date: 'Week 5', avgResolution: 3.9, ticketsResolved: 34, firstCallResolution: 85 },
    { date: 'Week 6', avgResolution: 4.3, ticketsResolved: 29, firstCallResolution: 79 },
    { date: 'Week 7', avgResolution: 3.7, ticketsResolved: 36, firstCallResolution: 87 },
    { date: 'Week 8', avgResolution: 4.0, ticketsResolved: 31, firstCallResolution: 83 }
  ];

  const fulfillmentData = [
    { date: 'Week 1', avgFulfillment: 2.1, slaCompliance: 94, userSatisfaction: 4.2 },
    { date: 'Week 2', avgFulfillment: 1.8, slaCompliance: 96, userSatisfaction: 4.4 },
    { date: 'Week 3', avgFulfillment: 2.3, slaCompliance: 92, userSatisfaction: 4.0 },
    { date: 'Week 4', avgFulfillment: 2.0, slaCompliance: 95, userSatisfaction: 4.3 },
    { date: 'Week 5', avgFulfillment: 1.9, slaCompliance: 97, userSatisfaction: 4.5 },
    { date: 'Week 6', avgFulfillment: 2.2, slaCompliance: 93, userSatisfaction: 4.1 },
    { date: 'Week 7', avgFulfillment: 1.7, slaCompliance: 98, userSatisfaction: 4.6 },
    { date: 'Week 8', avgFulfillment: 2.0, slaCompliance: 95, userSatisfaction: 4.4 }
  ];

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