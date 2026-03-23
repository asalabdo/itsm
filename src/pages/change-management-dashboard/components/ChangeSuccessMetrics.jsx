import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ChangeSuccessMetrics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [metricsData, setMetricsData] = useState({});

  useEffect(() => {
    const mockMetricsData = {
      successTrends: [
        { date: '2024-08-15', production: 85, test: 92, development: 95, total: 87 },
        { date: '2024-08-16', production: 88, test: 94, development: 96, total: 89 },
        { date: '2024-08-17', production: 82, test: 90, development: 94, total: 85 },
        { date: '2024-08-18', production: 90, test: 95, development: 97, total: 91 },
        { date: '2024-08-19', production: 87, test: 93, development: 95, total: 88 },
        { date: '2024-08-20', production: 92, test: 96, development: 98, total: 93 },
        { date: '2024-08-21', production: 89, test: 94, development: 96, total: 90 }
      ],
      rollbackData: [
        { environment: 'Production', rollbacks: 8, total: 45, percentage: 17.8 },
        { environment: 'Test', rollbacks: 3, total: 52, percentage: 5.8 },
        { environment: 'Development', rollbacks: 2, total: 38, percentage: 5.3 }
      ],
      changeTypes: [
        { name: 'Standard', value: 65, color: '#005051' },
        { name: 'Emergency', value: 15, color: '#DC2626' },
        { name: 'Major', value: 12, color: '#D97706' },
        { name: 'Minor', value: 8, color: '#059669' }
      ],
      impactAnalysis: [
        { category: 'No Impact', count: 42, percentage: 60 },
        { category: 'Low Impact', count: 18, percentage: 25.7 },
        { category: 'Medium Impact', count: 8, percentage: 11.4 },
        { category: 'High Impact', count: 2, percentage: 2.9 }
      ]
    };
    setMetricsData(mockMetricsData);
  }, [timeRange]);

  const calculateOverallSuccessRate = () => {
    if (!metricsData?.successTrends) return 0;
    const latest = metricsData?.successTrends?.[metricsData?.successTrends?.length - 1];
    return latest ? latest?.total : 0;
  };

  const calculateRollbackRate = () => {
    if (!metricsData?.rollbackData) return 0;
    const totalRollbacks = metricsData?.rollbackData?.reduce((sum, env) => sum + env.rollbacks, 0);
    const totalChanges = metricsData?.rollbackData?.reduce((sum, env) => sum + env.total, 0);
    return totalChanges > 0 ? ((totalRollbacks / totalChanges) * 100)?.toFixed(1) : 0;
  };

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return '#005051';
      case 'test': return '#2563EB';
      case 'development': return '#059669';
      default: return '#6B7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 operations-shadow">
          <p className="text-sm font-medium text-popover-foreground mb-2">
            {new Date(label)?.toLocaleDateString()}
          </p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.dataKey}: {entry?.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Change Success Metrics</h3>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedEnvironment} 
            onChange={(e) => setSelectedEnvironment(e?.target?.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="test">Test</option>
            <option value="development">Development</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="ghost" size="sm" title="Export Report">
            <Icon name="Download" size={16} />
          </Button>
        </div>
      </div>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="text-2xl font-semibold text-success">
                {calculateOverallSuccessRate()}%
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingUp" size={12} className="text-success" />
                <span>+2.3% from last period</span>
              </div>
            </div>
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Rollback Rate</div>
              <div className="text-2xl font-semibold text-warning">
                {calculateRollbackRate()}%
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingDown" size={12} className="text-success" />
                <span>-1.2% from last period</span>
              </div>
            </div>
            <Icon name="RotateCcw" size={24} className="text-warning" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Emergency Changes</div>
              <div className="text-2xl font-semibold text-error">
                {metricsData?.changeTypes?.find(t => t?.name === 'Emergency')?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="AlertTriangle" size={12} className="text-error" />
                <span>3 this week</span>
              </div>
            </div>
            <Icon name="Zap" size={24} className="text-error" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Avg Implementation Time</div>
              <div className="text-2xl font-semibold text-accent">
                2.4h
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="Clock" size={12} className="text-accent" />
                <span>Within SLA</span>
              </div>
            </div>
            <Icon name="Timer" size={24} className="text-accent" />
          </div>
        </div>
      </div>
      {/* Success Rate Trends */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">Success Rate Trends by Environment</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('production') }}></div>
              <span className="text-muted-foreground">Production</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('test') }}></div>
              <span className="text-muted-foreground">Test</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('development') }}></div>
              <span className="text-muted-foreground">Development</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricsData?.successTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={(value) => new Date(value)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                domain={[70, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="production" 
                stroke={getEnvironmentColor('production')} 
                strokeWidth={2}
                dot={{ fill: getEnvironmentColor('production'), strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="test" 
                stroke={getEnvironmentColor('test')} 
                strokeWidth={2}
                dot={{ fill: getEnvironmentColor('test'), strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="development" 
                stroke={getEnvironmentColor('development')} 
                strokeWidth={2}
                dot={{ fill: getEnvironmentColor('development'), strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Rollback Analysis and Change Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rollback Analysis */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium text-foreground mb-4">Rollback Analysis by Environment</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData?.rollbackData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="environment" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="rollbacks" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {metricsData?.rollbackData?.map(env => (
              <div key={env.environment} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{env.environment}</span>
                <span className="text-muted-foreground">
                  {env.rollbacks}/{env.total} ({env.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Types Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium text-foreground mb-4">Change Types Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricsData?.changeTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {metricsData?.changeTypes?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {metricsData?.changeTypes?.map(type => (
              <div key={type?.name} className="flex items-center space-x-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type?.color }}></div>
                <span className="text-foreground">{type?.name}</span>
                <span className="text-muted-foreground">({type?.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Business Impact Analysis */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium text-foreground mb-4">Business Impact Analysis</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metricsData?.impactAnalysis?.map(impact => (
            <div key={impact?.category} className="text-center">
              <div className="text-2xl font-semibold text-foreground mb-1">
                {impact?.count}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {impact?.category}
              </div>
              <div className="text-xs text-accent font-medium">
                {impact?.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangeSuccessMetrics;