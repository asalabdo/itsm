import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const PRIORITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

const VolumeTrackingDashboard = ({ incidents = [] }) => {
  const [timeRange, setTimeRange] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const normalize = (value) => String(value || '').trim();

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (selectedCategory === 'all') return true;
      return normalize(incident?.category).toLowerCase() === selectedCategory;
    });
  }, [incidents, selectedCategory]);

  const currentData = useMemo(() => {
    const source = filteredIncidents;
    const now = new Date();

    if (timeRange === 'today') {
      const buckets = Array.from({ length: 6 }, (_, index) => {
        const startHour = index * 4;
        return {
          label: `${String(startHour).padStart(2, '0')}:00`,
          start: startHour,
          incidents: 0,
          resolved: 0,
        };
      });

      source.forEach((incident) => {
        const createdAt = incident?.createdAt ? new Date(incident.createdAt) : null;
        const resolvedAt = incident?.resolvedAt ? new Date(incident.resolvedAt) : null;

        if (createdAt && createdAt.toDateString() === now.toDateString()) {
          const bucketIndex = Math.min(5, Math.floor(createdAt.getHours() / 4));
          buckets[bucketIndex].incidents += 1;
        }

        if (resolvedAt && resolvedAt.toDateString() === now.toDateString()) {
          const bucketIndex = Math.min(5, Math.floor(resolvedAt.getHours() / 4));
          buckets[bucketIndex].resolved += 1;
        }
      });

      return buckets.map(({ label, incidents, resolved }) => ({ time: label, incidents, resolved }));
    }

    if (timeRange === 'week') {
      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(now.getDate() - (6 - index));
        return {
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          key: date.toDateString(),
          incidents: 0,
          resolved: 0,
        };
      });

      source.forEach((incident) => {
        const createdAt = incident?.createdAt ? new Date(incident.createdAt) : null;
        const resolvedAt = incident?.resolvedAt ? new Date(incident.resolvedAt) : null;
        const createdBucket = createdAt ? days.find((day) => day.key === createdAt.toDateString()) : null;
        const resolvedBucket = resolvedAt ? days.find((day) => day.key === resolvedAt.toDateString()) : null;
        if (createdBucket) createdBucket.incidents += 1;
        if (resolvedBucket) resolvedBucket.resolved += 1;
      });

      return days.map(({ label, incidents, resolved }) => ({ time: label, incidents, resolved }));
    }

    const weeks = Array.from({ length: 4 }, (_, index) => ({
      label: `Week ${index + 1}`,
      start: index,
      incidents: 0,
      resolved: 0,
    }));

    source.forEach((incident) => {
      const createdAt = incident?.createdAt ? new Date(incident.createdAt) : null;
      const resolvedAt = incident?.resolvedAt ? new Date(incident.resolvedAt) : null;
      const bucketIndex = createdAt ? Math.min(3, Math.floor((createdAt.getDate() - 1) / 7)) : null;
      const resolvedIndex = resolvedAt ? Math.min(3, Math.floor((resolvedAt.getDate() - 1) / 7)) : null;
      if (bucketIndex !== null) weeks[bucketIndex].incidents += 1;
      if (resolvedIndex !== null) weeks[resolvedIndex].resolved += 1;
    });

    return weeks.map(({ label, incidents, resolved }) => ({ time: label, incidents, resolved }));
  }, [filteredIncidents, timeRange]);

  const categoryData = useMemo(() => {
    const counts = filteredIncidents.reduce((acc, incident) => {
      const key = normalize(incident?.category) || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#14b8a6'];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }));
  }, [filteredIncidents]);

  const priorityTrends = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        P1: 0,
        P2: 0,
        P3: 0,
        P4: 0,
      };
    });

    filteredIncidents.forEach((incident) => {
      const createdAt = incident?.createdAt ? new Date(incident.createdAt) : null;
      if (!createdAt) return;
      const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const monthBucket = months.find((item) => item.key === key);
      if (!monthBucket) return;

      const priority = normalize(incident?.priority).toLowerCase();
      if (priority === 'critical') monthBucket.P1 += 1;
      else if (priority === 'high') monthBucket.P2 += 1;
      else if (priority === 'medium') monthBucket.P3 += 1;
      else monthBucket.P4 += 1;
    });

    return months.map(({ key, ...rest }) => rest);
  }, [filteredIncidents]);

  const agingData = useMemo(() => {
    const openIncidents = filteredIncidents.filter((incident) => !['resolved', 'closed'].includes(normalize(incident?.status).toLowerCase()));
    const buckets = [
      { range: '0-4h', count: 0, percentage: 0 },
      { range: '4-8h', count: 0, percentage: 0 },
      { range: '8-24h', count: 0, percentage: 0 },
      { range: '1-3d', count: 0, percentage: 0 },
      { range: '>3d', count: 0, percentage: 0 },
    ];

    const now = Date.now();
    openIncidents.forEach((incident) => {
      const createdAt = incident?.createdAt ? new Date(incident.createdAt).getTime() : null;
      if (!createdAt) return;
      const hours = Math.max(0, (now - createdAt) / 36e5);
      if (hours < 4) buckets[0].count += 1;
      else if (hours < 8) buckets[1].count += 1;
      else if (hours < 24) buckets[2].count += 1;
      else if (hours < 72) buckets[3].count += 1;
      else buckets[4].count += 1;
    });

    const total = openIncidents.length || 1;
    return buckets.map((bucket) => ({
      ...bucket,
      percentage: Math.round((bucket.count / total) * 100),
    }));
  }, [filteredIncidents]);

  const performanceMetrics = useMemo(() => {
    const total = filteredIncidents.length;
    const resolved = filteredIncidents.filter((incident) => ['resolved', 'closed'].includes(normalize(incident?.status).toLowerCase())).length;
    const open = total - resolved;
    const breached = filteredIncidents.filter((incident) => normalize(incident?.slaStatus).toLowerCase() === 'breached').length;
    const critical = filteredIncidents.filter((incident) => normalize(incident?.priority).toLowerCase() === 'critical').length;
    const high = filteredIncidents.filter((incident) => normalize(incident?.priority).toLowerCase() === 'high').length;
    const avgAgeHours = filteredIncidents.length
      ? (filteredIncidents.reduce((sum, incident) => {
          const createdAt = incident?.createdAt ? new Date(incident.createdAt).getTime() : null;
          if (!createdAt) return sum;
          return sum + Math.max(0, (Date.now() - createdAt) / 36e5);
        }, 0) / filteredIncidents.length).toFixed(1)
      : '0.0';

    return [
      { metric: 'Open Incidents', value: open, target: 'Live', status: open > 10 ? 'warning' : 'good' },
      { metric: 'Resolved Incidents', value: resolved, target: 'Live', status: resolved > 0 ? 'good' : 'warning' },
      { metric: 'SLA Breaches', value: breached, target: 'Live', status: breached > 0 ? 'critical' : 'good' },
      { metric: 'Critical Priority', value: critical, target: 'Live', status: critical > 0 ? 'warning' : 'good' },
      { metric: 'High Priority', value: high, target: 'Live', status: high > 0 ? 'warning' : 'good' },
      { metric: 'Avg. Age (h)', value: avgAgeHours, target: 'Live', status: 'good' },
    ];
  }, [filteredIncidents]);

  const getMetricColor = (status) => {
    switch (status) {
      case 'good': return 'text-success bg-success/10 border-success';
      case 'warning': return 'text-warning bg-warning/10 border-warning';
      case 'critical': return 'text-error bg-error/10 border-error';
      default: return 'text-foreground bg-muted/10 border-muted';
    }
  };

  const exportReport = () => {
    const rows = [
      ['Incident Analytics Export', new Date().toISOString()],
      ['Time Range', timeRange],
      ['Category Filter', selectedCategory],
      ['Total Incidents', String(filteredIncidents.length)],
      ['Open Incidents', String(performanceMetrics[0]?.value ?? 0)],
      ['Resolved Incidents', String(performanceMetrics[1]?.value ?? 0)],
      ['SLA Breaches', String(performanceMetrics[2]?.value ?? 0)],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-analytics-${timeRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">Volume Tracking Dashboard</h2>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e?.target?.value)}
                className="px-3 py-1.5 bg-background border border-border rounded text-sm text-foreground"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value)}
                className="px-3 py-1.5 bg-background border border-border rounded text-sm text-foreground"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(incidents.map((incident) => normalize(incident?.category)).filter(Boolean))).map((category) => (
                  <option key={category.toLowerCase()} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={exportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="Download" size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {performanceMetrics?.map((metric, index) => (
          <div key={index} className={`bg-card border rounded-lg p-4 ${getMetricColor(metric?.status)}`}>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">{metric?.metric}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{metric?.value}</p>
                <p className="text-xs text-muted-foreground">Target: {metric?.target}</p>
              </div>
              <Icon
                name={metric?.status === 'good' ? 'TrendingUp' : metric?.status === 'warning' ? 'Minus' : 'TrendingDown'}
                size={16}
                className={`${
                  metric?.status === 'good' ? 'text-success' :
                  metric?.status === 'warning' ? 'text-warning' : 'text-error'
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="TrendingUp" size={20} />
              <span>Incident Volume Trend</span>
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="incidents" fill="hsl(var(--error))" name="New Incidents" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(var(--success))" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="PieChart" size={20} />
              <span>Incident Categories</span>
            </h3>
          </div>
          <div className="p-6">
            {categoryData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {categoryData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-center text-muted-foreground">
                No live incident categories available.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="BarChart3" size={20} />
              <span>Priority Trends</span>
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priorityTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="period" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="P1" stroke="#ef4444" strokeWidth={3} name="P1 (Critical)" />
                <Line type="monotone" dataKey="P2" stroke="#f97316" strokeWidth={3} name="P2 (High)" />
                <Line type="monotone" dataKey="P3" stroke="#eab308" strokeWidth={3} name="P3 (Medium)" />
                <Line type="monotone" dataKey="P4" stroke="#22c55e" strokeWidth={3} name="P4 (Low)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="Clock" size={20} />
              <span>Incident Aging Analysis</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {agingData?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-foreground w-12">{item?.range}</span>
                    <div className="flex-1 bg-muted rounded-full h-3 min-w-[120px]">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          item?.percentage > 40 ? 'bg-success' :
                          item?.percentage > 20 ? 'bg-warning' : 'bg-error'
                        }`}
                        style={{ width: `${Math.min(item?.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground">{item?.count}</span>
                    <span className="text-xs text-muted-foreground ml-1">({item?.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Active Incidents:</span>
                <span className="font-semibold text-foreground">
                  {agingData?.reduce((sum, item) => sum + item?.count, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground">
              All charts and export actions are now driven by the live incident dataset.
            </p>
          </div>

          <div className="flex space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
              <Icon name="Filter" size={16} />
              <span>Advanced Filters</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
              <Icon name="FileText" size={16} />
              <span>Generate Report</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors">
              <Icon name="Settings" size={16} />
              <span>Configure Alerts</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeTrackingDashboard;
