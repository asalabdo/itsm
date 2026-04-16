import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
const ChangeSuccessMetrics = ({ changes = [], overviewMetrics = null, onExport }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const metricsData = useMemo(() => {
    const relevant = (changes || []).filter((change) => {
      const created = new Date(change?.createdAt || Date.now());
      if (timeRange === '7d') return created >= new Date(Date.now() - 7 * 86400000);
      if (timeRange === '90d') return created >= new Date(Date.now() - 90 * 86400000);
      return true;
    });

    const series = relevant.reduce((acc, change) => {
      const dateKey = new Date(change?.createdAt || Date.now()).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, production: 0, test: 0, development: 0, total: 0 };
      }
      const bucket = String(change?.category || 'normal').toLowerCase().includes('emergency')
        ? 'production'
        : String(change?.category || 'normal').toLowerCase().includes('minor')
          ? 'development'
          : 'test';
      acc[dateKey][bucket] += 1;
      acc[dateKey].total += 1;
      return acc;
    }, {});

    const successTrends = Object.values(series).sort((a, b) => a.date.localeCompare(b.date)).map((row) => ({
      ...row,
      production: row.production || 0,
      test: row.test || 0,
      development: row.development || 0,
      total: row.total || 0
    }));

    const changeTypesMap = {};
    relevant.forEach(c => {
      const type = c?.category || 'Standard';
      changeTypesMap[type] = (changeTypesMap[type] || 0) + 1;
    });

    const changeTypes = [
      { name: 'Standard', value: changeTypesMap.Standard || 0, color: '#005051' },
      { name: 'Emergency', value: changeTypesMap.Emergency || 0, color: '#DC2626' },
      { name: 'Normal', value: changeTypesMap.Normal || changeTypesMap.Major || 0, color: '#D97706' },
      { name: 'Minor', value: changeTypesMap.Minor || 0, color: '#059669' }
    ];

    const rollbacks = relevant.filter(c => String(c?.status || '').toLowerCase() === 'rolled back').length;
    const total = Math.max(1, relevant.length || 1);
    const rollbackData = [
      { environment: 'Production', rollbacks, total, percentage: ((rollbacks / total) * 100).toFixed(1) },
      { environment: 'Test', rollbacks: 0, total: Math.max(1, Math.round(total / 2)), percentage: 0 },
      { environment: 'Development', rollbacks: 0, total: Math.max(1, total), percentage: 0 }
    ];

    const lowImpact = relevant.filter(c => c?.riskLevel === 'Low' || !c?.riskLevel).length;
    const mediumImpact = relevant.filter(c => c?.riskLevel === 'Medium').length;
    const highImpact = relevant.filter(c => c?.riskLevel === 'High').length;
    const impactAnalysis = [
      { category: 'No Impact', count: lowImpact, percentage: ((lowImpact / total) * 100).toFixed(1) },
      { category: 'Medium Impact', count: mediumImpact, percentage: ((mediumImpact / total) * 100).toFixed(1) },
      { category: 'High Impact', count: highImpact, percentage: ((highImpact / total) * 100).toFixed(1) }
    ];

    return {
      successTrends,
      rollbackData,
      changeTypes,
      impactAnalysis,
      overview: overviewMetrics
    };
  }, [changes, timeRange, overviewMetrics]);

  const calculateOverallSuccessRate = () => {
    if (!changes?.length) return 0;
    const completed = changes.filter((change) => ['completed', 'approved', 'resolved'].includes(String(change?.status || '').toLowerCase()));
    return Math.round((completed.length / changes.length) * 100);
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
        <h3 className="text-lg font-semibold text-foreground">مؤشرات نجاح التغيير</h3>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedEnvironment} 
            onChange={(e) => setSelectedEnvironment(e?.target?.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="all">كل البيئات</option>
            <option value="production">الإنتاج</option>
            <option value="test">الاختبار</option>
            <option value="development">التطوير</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يومًا</option>
            <option value="90d">آخر 90 يومًا</option>
          </select>
          <Button variant="ghost" size="sm" title="تصدير التقرير" onClick={() => onExport?.('csv')}>
            <Icon name="Download" size={16} />
          </Button>
        </div>
      </div>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">معدل النجاح</div>
              <div className="text-2xl font-semibold text-success">
                {calculateOverallSuccessRate()}%
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingUp" size={12} className="text-success" />
                <span>+2.3% مقارنة بالفترة السابقة</span>
              </div>
            </div>
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">معدل التراجع</div>
              <div className="text-2xl font-semibold text-warning">
                {calculateRollbackRate()}%
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingDown" size={12} className="text-success" />
                <span>-1.2% مقارنة بالفترة السابقة</span>
              </div>
            </div>
            <Icon name="RotateCcw" size={24} className="text-warning" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">التغييرات الطارئة</div>
              <div className="text-2xl font-semibold text-error">
                {metricsData?.changeTypes?.find(t => t?.name === 'Emergency')?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="AlertTriangle" size={12} className="text-error" />
                <span>3 هذا الأسبوع</span>
              </div>
            </div>
            <Icon name="Zap" size={24} className="text-error" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">متوسط وقت التنفيذ</div>
              <div className="text-2xl font-semibold text-accent">
                2.4h
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="Clock" size={12} className="text-accent" />
                <span>ضمن SLA</span>
              </div>
            </div>
            <Icon name="Timer" size={24} className="text-accent" />
          </div>
        </div>
      </div>
      {/* Success Rate Trends */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">اتجاهات النجاح حسب البيئة</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('production') }}></div>
              <span className="text-muted-foreground">الإنتاج</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('test') }}></div>
              <span className="text-muted-foreground">الاختبار</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('development') }}></div>
              <span className="text-muted-foreground">التطوير</span>
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
          <h4 className="font-medium text-foreground mb-4">تحليل التراجع حسب البيئة</h4>
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
          <h4 className="font-medium text-foreground mb-4">توزيع أنواع التغييرات</h4>
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
          <h4 className="font-medium text-foreground mb-4">تحليل الأثر على الأعمال</h4>
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
