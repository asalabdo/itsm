import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const PerformanceChart = () => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const weekData = [
    { name: 'Mon', tickets: 45, resolved: 38, sla: 92 },
    { name: 'Tue', tickets: 52, resolved: 47, sla: 90 },
    { name: 'Wed', tickets: 48, resolved: 44, sla: 91 },
    { name: 'Thu', tickets: 61, resolved: 55, sla: 89 },
    { name: 'Fri', tickets: 55, resolved: 51, sla: 93 },
    { name: 'Sat', tickets: 38, resolved: 35, sla: 92 },
    { name: 'Sun', tickets: 32, resolved: 30, sla: 94 },
  ];

  const monthData = [
    { name: 'Week 1', tickets: 245, resolved: 220, sla: 90 },
    { name: 'Week 2', tickets: 268, resolved: 245, sla: 91 },
    { name: 'Week 3', tickets: 252, resolved: 235, sla: 93 },
    { name: 'Week 4', tickets: 280, resolved: 260, sla: 93 },
  ];

  const data = timeRange === 'week' ? weekData : monthData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground caption" style={{ color: entry?.color }}>
              {entry?.name}: {entry?.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Performance Trends</h2>
            <p className="text-sm text-muted-foreground mt-1 caption">Ticket volume and resolution metrics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                  chartType === 'line' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
                onClick={() => setChartType('line')}
              >
                <Icon name="TrendingUp" size={16} />
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                  chartType === 'bar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
                onClick={() => setChartType('bar')}
              >
                <Icon name="BarChart3" size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  timeRange === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  timeRange === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="tickets" stroke="var(--color-primary)" strokeWidth={2} name="Total Tickets" />
              <Line type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2} name="Resolved" />
              <Line type="monotone" dataKey="sla" stroke="var(--color-warning)" strokeWidth={2} name="SLA %" />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="tickets" fill="var(--color-primary)" name="Total Tickets" />
              <Bar dataKey="resolved" fill="var(--color-success)" name="Resolved" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">Avg Daily Tickets</p>
            <p className="text-lg font-semibold text-foreground data-text">48</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">Resolution Rate</p>
            <p className="text-lg font-semibold text-success data-text">91%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">Avg Response Time</p>
            <p className="text-lg font-semibold text-foreground data-text">2.3h</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">SLA Compliance</p>
            <p className="text-lg font-semibold text-primary data-text">92%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;