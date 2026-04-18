import React, { useMemo, useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const PerformanceChart = ({ reportData = {} }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [chartView, setChartView] = useState('combined');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const chartData = useMemo(() => {
    const trends = Array.isArray(reportData?.trends) ? reportData.trends : [];
    const sla = Number(reportData?.overview?.slaCompliance?.compliancePercentage ?? 0);
    const avgSat = 4 + Math.min(0.8, trends.length / 50);

    return trends.slice(-8).map((item, index) => ({
      date: item.date || `Point ${index + 1}`,
      ticketVolume: Number(item.count ?? 0),
      avgResolutionTime: Number((6 - Math.min(4.5, Number(item.count ?? 0) / 80)).toFixed(1)),
      slaCompliance: Number((sla || 90) + Math.min(4, index * 0.35)),
      customerSat: Number(Math.min(5, avgSat + index * 0.03).toFixed(1)),
    }));
  }, [reportData]);

  const drillDownOptions = [
    { value: 'all', label: t('allServices', 'All Services'), icon: 'BarChart3' },
    { value: 'service-type', label: t('byServiceType', 'By Service Type'), icon: 'Layers' },
    { value: 'priority', label: t('byPriority', 'By Priority'), icon: 'AlertTriangle' },
    { value: 'technician', label: t('byTechnician', 'By Technician'), icon: 'Users' },
    { value: 'department', label: t('byDepartment', 'By Department'), icon: 'Building' },
  ];

  const getSeriesValueLabel = (entry) => {
    switch (entry?.dataKey) {
      case 'ticketVolume':
        return `${entry?.value}`;
      case 'avgResolutionTime':
        return `${entry?.value}h`;
      case 'slaCompliance':
        return `${entry?.value}%`;
      default:
        return `${entry?.value}/5`;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!(active && payload && payload.length)) return null;

    return (
      <div className="bg-popover border border-border rounded-lg p-4 operations-shadow">
        <p className="font-medium text-popover-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry?.color }} />
              <span className="text-sm text-popover-foreground">{entry?.name}:</span>
            </div>
            <span className="text-sm font-medium text-popover-foreground">{getSeriesValueLabel(entry)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{t('performanceTrends', 'Performance Trends')}</h3>
          <p className="text-sm text-muted-foreground">{t('performanceTrendsDescription', 'Ticket volume and resolution time correlation')}</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {drillDownOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setChartView(chartView === 'combined' ? 'separate' : 'combined')}
            iconName="Layers"
            iconPosition="left"
          >
            {chartView === 'combined' ? t('separate', 'Separate') : t('combined', 'Combined')}
          </Button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Bar yAxisId="left" dataKey="ticketVolume" name={t('ticketVolume', 'Ticket Volume')} fill="var(--color-primary)" opacity={0.8} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="avgResolutionTime" name={t('avgResolutionTime', 'Avg Resolution Time')} stroke="var(--color-secondary)" strokeWidth={3} dot={{ fill: 'var(--color-secondary)', strokeWidth: 2, r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="slaCompliance" name={t('slaCompliance', 'SLA Compliance')} stroke="var(--color-success)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">147</div>
            <div className="text-xs text-muted-foreground">{t('avgDailyVolume', 'Avg Daily Volume')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">4.1h</div>
            <div className="text-xs text-muted-foreground">{t('avgResolution', 'Avg Resolution')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">94.8%</div>
            <div className="text-xs text-muted-foreground">{t('slaCompliance', 'SLA Compliance')}</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">4.4/5</div>
            <div className="text-xs text-muted-foreground">{t('employeeSatisfaction', 'Employee Satisfaction')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
