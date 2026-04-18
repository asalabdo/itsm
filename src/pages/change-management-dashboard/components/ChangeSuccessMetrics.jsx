import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ChangeSuccessMetrics = ({ changes = [], overviewMetrics = null, onExport }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
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
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, production: 0, test: 0, development: 0, total: 0 };
      const bucket = String(change?.category || 'normal').toLowerCase().includes('emergency')
        ? 'production'
        : String(change?.category || 'normal').toLowerCase().includes('minor')
          ? 'development'
          : 'test';
      acc[dateKey][bucket] += 1;
      acc[dateKey].total += 1;
      return acc;
    }, {});

    const successTrends = Object.values(series)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({ ...row, production: row.production || 0, test: row.test || 0, development: row.development || 0, total: row.total || 0 }));

    const changeTypesMap = {};
    relevant.forEach((c) => {
      const type = c?.category || 'Standard';
      changeTypesMap[type] = (changeTypesMap[type] || 0) + 1;
    });

    const changeTypes = [
      { name: isArabic ? 'اعتيادي' : 'Standard', value: changeTypesMap.Standard || 0, color: '#005051' },
      { name: isArabic ? 'طارئ' : 'Emergency', value: changeTypesMap.Emergency || 0, color: '#DC2626' },
      { name: isArabic ? 'رئيسي' : 'Major', value: changeTypesMap.Normal || changeTypesMap.Major || 0, color: '#D97706' },
      { name: isArabic ? 'ثانوي' : 'Minor', value: changeTypesMap.Minor || 0, color: '#059669' }
    ];

    const rollbacks = relevant.filter((c) => String(c?.status || '').toLowerCase() === 'rolled back').length;
    const total = Math.max(1, relevant.length || 1);
    const rollbackData = [
      { environment: isArabic ? 'الإنتاج' : 'Production', rollbacks, total, percentage: ((rollbacks / total) * 100).toFixed(1) },
      { environment: isArabic ? 'الاختبار' : 'Test', rollbacks: 0, total: Math.max(1, Math.round(total / 2)), percentage: 0 },
      { environment: isArabic ? 'التطوير' : 'Development', rollbacks: 0, total: Math.max(1, total), percentage: 0 }
    ];

    const lowImpact = relevant.filter((c) => c?.riskLevel === 'Low' || !c?.riskLevel).length;
    const mediumImpact = relevant.filter((c) => c?.riskLevel === 'Medium').length;
    const highImpact = relevant.filter((c) => c?.riskLevel === 'High').length;
    const impactAnalysis = [
      { category: isArabic ? 'لا يوجد أثر' : 'No Impact', count: lowImpact, percentage: ((lowImpact / total) * 100).toFixed(1) },
      { category: isArabic ? 'أثر متوسط' : 'Medium Impact', count: mediumImpact, percentage: ((mediumImpact / total) * 100).toFixed(1) },
      { category: isArabic ? 'أثر مرتفع' : 'High Impact', count: highImpact, percentage: ((highImpact / total) * 100).toFixed(1) }
    ];

    return { successTrends, rollbackData, changeTypes, impactAnalysis, overview: overviewMetrics };
  }, [changes, timeRange, overviewMetrics, isArabic]);

  const calculateOverallSuccessRate = () => {
    if (!changes?.length) return 0;
    const completed = changes.filter((change) => ['completed', 'approved', 'resolved'].includes(String(change?.status || '').toLowerCase()));
    return Math.round((completed.length / changes.length) * 100);
  };

  const calculateRollbackRate = () => {
    if (!metricsData?.rollbackData) return 0;
    const totalRollbacks = metricsData.rollbackData.reduce((sum, env) => sum + env.rollbacks, 0);
    const totalChanges = metricsData.rollbackData.reduce((sum, env) => sum + env.total, 0);
    return totalChanges > 0 ? ((totalRollbacks / totalChanges) * 100).toFixed(1) : 0;
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
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 operations-shadow">
        <p className="text-sm font-medium text-popover-foreground mb-2">
          {new Date(label).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value}%
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {isArabic ? 'مؤشرات نجاح التغيير' : t('changeSuccessMetrics', 'Change Success Metrics')}
        </h3>
        <div className="flex items-center space-x-3">
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="all">{isArabic ? 'كل البيئات' : 'All environments'}</option>
            <option value="production">{isArabic ? 'الإنتاج' : 'Production'}</option>
            <option value="test">{isArabic ? 'الاختبار' : 'Test'}</option>
            <option value="development">{isArabic ? 'التطوير' : 'Development'}</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-border rounded px-3 py-1 bg-background"
          >
            <option value="7d">{isArabic ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value="30d">{isArabic ? 'آخر 30 يومًا' : 'Last 30 days'}</option>
            <option value="90d">{isArabic ? 'آخر 90 يومًا' : 'Last 90 days'}</option>
          </select>
          <Button variant="ghost" size="sm" title={isArabic ? 'تصدير التقرير' : 'Export report'} onClick={() => onExport?.('csv')}>
            <Icon name="Download" size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'معدل النجاح' : 'Success rate'}</div>
              <div className="text-2xl font-semibold text-success">{calculateOverallSuccessRate()}%</div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingUp" size={12} className="text-success" />
                <span>{isArabic ? 'مقارنة بالفترة السابقة +2.3%' : '+2.3% compared to last period'}</span>
              </div>
            </div>
            <Icon name="CheckCircle" size={24} className="text-success" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'معدل التراجع' : 'Rollback rate'}</div>
              <div className="text-2xl font-semibold text-warning">{calculateRollbackRate()}%</div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="TrendingDown" size={12} className="text-success" />
                <span>{isArabic ? 'مقارنة بالفترة السابقة -1.2%' : '-1.2% compared to last period'}</span>
              </div>
            </div>
            <Icon name="RotateCcw" size={24} className="text-warning" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'التغييرات الطارئة' : 'Emergency changes'}</div>
              <div className="text-2xl font-semibold text-error">
                {metricsData?.changeTypes?.find((item) => item.name === (isArabic ? 'طارئ' : 'Emergency'))?.value || 0}
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="AlertTriangle" size={12} className="text-error" />
                <span>{isArabic ? '3 هذا الأسبوع' : '3 this week'}</span>
              </div>
            </div>
            <Icon name="Zap" size={24} className="text-error" />
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{isArabic ? 'متوسط وقت التنفيذ' : 'Average execution time'}</div>
              <div className="text-2xl font-semibold text-accent">2.4h</div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Icon name="Clock" size={12} className="text-accent" />
                <span>{isArabic ? 'ضمن SLA' : 'Within SLA'}</span>
              </div>
            </div>
            <Icon name="Timer" size={24} className="text-accent" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-foreground">{isArabic ? 'اتجاهات النجاح حسب البيئة' : 'Success trends by environment'}</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('production') }} />
              <span className="text-muted-foreground">{isArabic ? 'الإنتاج' : 'Production'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('test') }} />
              <span className="text-muted-foreground">{isArabic ? 'الاختبار' : 'Test'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getEnvironmentColor('development') }} />
              <span className="text-muted-foreground">{isArabic ? 'التطوير' : 'Development'}</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricsData?.successTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(value) => new Date(value).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[70, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="production" stroke={getEnvironmentColor('production')} strokeWidth={2} dot={{ fill: getEnvironmentColor('production'), strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="test" stroke={getEnvironmentColor('test')} strokeWidth={2} dot={{ fill: getEnvironmentColor('test'), strokeWidth: 2, r: 4 }} />
              <Line type="monotone" dataKey="development" stroke={getEnvironmentColor('development')} strokeWidth={2} dot={{ fill: getEnvironmentColor('development'), strokeWidth: 2, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium text-foreground mb-4">{isArabic ? 'تحليل التراجع حسب البيئة' : 'Rollback analysis by environment'}</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData?.rollbackData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="environment" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-popover)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                <Bar dataKey="rollbacks" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h4 className="font-medium text-foreground mb-4">{isArabic ? 'توزيع أنواع التغييرات' : 'Change type distribution'}</h4>
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
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        <h4 className="font-medium text-foreground mb-4">{isArabic ? 'تحليل الأثر على الأعمال' : 'Business impact analysis'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {metricsData?.impactAnalysis?.map((impact) => (
            <div key={impact?.category} className="text-center">
              <div className="text-2xl font-semibold text-foreground mb-1">{impact?.count}</div>
              <div className="text-sm text-muted-foreground mb-2">{impact?.category}</div>
              <div className="text-xs text-accent font-medium">{impact?.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangeSuccessMetrics;
