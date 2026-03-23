import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const VolumeTrackingDashboard = ({ incidents }) => {
  const [timeRange, setTimeRange] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data for different time ranges
  const volumeData = {
    today: [
      { time: '00:00', incidents: 2, resolved: 1 },
      { time: '04:00', incidents: 1, resolved: 2 },
      { time: '08:00', incidents: 8, resolved: 5 },
      { time: '12:00', incidents: 12, resolved: 9 },
      { time: '16:00', incidents: 15, resolved: 11 },
      { time: '20:00', incidents: 6, resolved: 8 }
    ],
    week: [
      { time: 'Mon', incidents: 45, resolved: 38 },
      { time: 'Tue', incidents: 52, resolved: 41 },
      { time: 'Wed', incidents: 38, resolved: 42 },
      { time: 'Thu', incidents: 61, resolved: 45 },
      { time: 'Fri', incidents: 55, resolved: 48 },
      { time: 'Sat', incidents: 23, resolved: 28 },
      { time: 'Sun', incidents: 18, resolved: 22 }
    ],
    month: [
      { time: 'Week 1', incidents: 180, resolved: 165 },
      { time: 'Week 2', incidents: 220, resolved: 198 },
      { time: 'Week 3', incidents: 195, resolved: 201 },
      { time: 'Week 4', incidents: 235, resolved: 218 }
    ]
  };

  const categoryData = [
    { name: 'Infrastructure', value: 35, color: '#ef4444' },
    { name: 'Application', value: 28, color: '#f97316' },
    { name: 'Network', value: 20, color: '#eab308' },
    { name: 'Database', value: 12, color: '#22c55e' },
    { name: 'Security', value: 5, color: '#3b82f6' }
  ];

  const priorityTrends = [
    { period: 'Jan', P1: 5, P2: 12, P3: 25, P4: 18 },
    { period: 'Feb', P1: 3, P2: 15, P3: 28, P4: 22 },
    { period: 'Mar', P1: 7, P2: 18, P3: 32, P4: 25 },
    { period: 'Apr', P1: 4, P2: 14, P3: 29, P4: 20 },
    { period: 'May', P1: 6, P2: 16, P3: 31, P4: 24 },
    { period: 'Jun', P1: 2, P2: 11, P3: 26, P4: 19 }
  ];

  const agingData = [
    { range: '0-4h', count: 25, percentage: 42 },
    { range: '4-8h', count: 18, percentage: 30 },
    { range: '8-24h', count: 12, percentage: 20 },
    { range: '1-3d', count: 4, percentage: 7 },
    { range: '>3d', count: 1, percentage: 1 }
  ];

  const performanceMetrics = [
    { metric: 'Average Resolution Time', value: '4.2h', target: '4h', status: 'warning' },
    { metric: 'First Call Resolution', value: '78%', target: '80%', status: 'warning' },
    { metric: 'SLA Compliance', value: '94%', target: '95%', status: 'warning' },
    { metric: 'Employee Satisfaction', value: '4.3/5', target: '4.5/5', status: 'good' },
    { metric: 'Reopened Incidents', value: '8%', target: '<10%', status: 'good' },
    { metric: 'Escalation Rate', value: '15%', target: '<20%', status: 'good' }
  ];

  const getMetricColor = (status) => {
    switch (status) {
      case 'good': return 'text-success bg-success/10 border-success';
      case 'warning': return 'text-warning bg-warning/10 border-warning';
      case 'critical': return 'text-error bg-error/10 border-error';
      default: return 'text-foreground bg-muted/10 border-muted';
    }
  };

  const currentData = volumeData?.[timeRange];

  return (
    <div className="space-y-6">
      {/* Controls */}
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
                <option value="infrastructure">Infrastructure</option>
                <option value="application">Application</option>
                <option value="network">Network</option>
                <option value="database">Database</option>
                <option value="security">Security</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Icon name="Download" size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>
      {/* Key Metrics Cards */}
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
        {/* Volume Trend */}
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="incidents" fill="hsl(var(--error))" name="New Incidents" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(var(--success))" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Icon name="PieChart" size={20} />
              <span>Incident Categories</span>
            </h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({name, value}) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Trends */}
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
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="P1" stroke="#ef4444" strokeWidth={3} name="P1 (Critical)" />
                <Line type="monotone" dataKey="P2" stroke="#f97316" strokeWidth={3} name="P2 (High)" />
                <Line type="monotone" dataKey="P3" stroke="#eab308" strokeWidth={3} name="P3 (Medium)" />
                <Line type="monotone" dataKey="P4" stroke="#22c55e" strokeWidth={3} name="P4 (Low)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Aging */}
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
      {/* Advanced Filters and Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Detailed filtering and analysis options for deeper insights
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