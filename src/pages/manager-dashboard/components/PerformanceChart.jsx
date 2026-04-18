import { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const PerformanceChart = ({ data = [] }) => {
  const { language } = useLanguage();
  const t = useMemo(() => (key, fallback) => getTranslation(language, key, fallback), [language]);
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');

  const chartData = useMemo(() => {
    if (!data.length) return [];
    return data.slice(-7).map((item) => ({
      name: item.name,
      tickets: item.tickets,
      resolved: item.resolved,
      sla: item.sla > 0 ? Math.round((item.sla / Math.max(1, item.tickets)) * 100) : 0,
    }));
  }, [data]);

  const monthData = useMemo(() => {
    if (!chartData.length) return [];
    const total = chartData.reduce((sum, item) => sum + item.tickets, 0);
    const resolved = chartData.reduce((sum, item) => sum + item.resolved, 0);
    const sla = chartData.reduce((sum, item) => sum + item.sla, 0);
    return [{ name: t('currentPeriod', 'Current Period'), tickets: total, resolved, sla: Math.round(sla / Math.max(1, chartData.length)) }];
  }, [chartData, t]);

  const currentData = timeRange === 'week' ? chartData : monthData;

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
            <h2 className="text-lg md:text-xl font-semibold text-foreground">{t('performanceTrends', 'Performance Trends')}</h2>
            <p className="text-sm text-muted-foreground mt-1 caption">{t('performanceTrendsDescription', 'Ticket volume and resolution metrics')}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${chartType === 'line' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartType('line')}
              >
                <Icon name="TrendingUp" size={16} />
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${chartType === 'bar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setChartType('bar')}
              >
                <Icon name="BarChart3" size={16} />
              </button>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${timeRange === 'week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setTimeRange('week')}
              >
                {t('week', 'Week')}
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${timeRange === 'month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setTimeRange('month')}
              >
                {t('month', 'Month')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' ? (
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="tickets" stroke="var(--color-primary)" strokeWidth={2} name={t('totalTickets', 'Total Tickets')} />
              <Line type="monotone" dataKey="resolved" stroke="var(--color-success)" strokeWidth={2} name={t('resolved', 'Resolved')} />
              <Line type="monotone" dataKey="sla" stroke="var(--color-warning)" strokeWidth={2} name={t('slaPercent', 'SLA %')} />
            </LineChart>
          ) : (
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="tickets" fill="var(--color-primary)" name={t('totalTickets', 'Total Tickets')} />
              <Bar dataKey="resolved" fill="var(--color-success)" name={t('resolved', 'Resolved')} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">{t('avgDailyTickets', 'Avg Daily Tickets')}</p>
            <p className="text-lg font-semibold text-foreground data-text">{currentData.reduce((sum, item) => sum + (item.tickets || 0), 0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">{t('resolutionRate', 'Resolution Rate')}</p>
            <p className="text-lg font-semibold text-success data-text">{currentData.length ? Math.round(currentData.reduce((sum, item) => sum + (item.resolved || 0), 0) / Math.max(1, currentData.reduce((sum, item) => sum + (item.tickets || 0), 0)) * 100) : 0}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">{t('avgResponseTime', 'Avg Response Time')}</p>
            <p className="text-lg font-semibold text-foreground data-text">{currentData.length ? `${(currentData.reduce((sum, item) => sum + (item.tickets || 0), 0) / Math.max(1, currentData.length * 20)).toFixed(1)}h` : '0h'}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1 caption">{t('slaCompliance', 'SLA Compliance')}</p>
            <p className="text-lg font-semibold text-primary data-text">{currentData.length ? Math.round(currentData.reduce((sum, item) => sum + (item.sla || 0), 0) / Math.max(1, currentData.reduce((sum, item) => sum + (item.tickets || 0), 0)) * 100) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
