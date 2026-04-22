import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { dashboardAPI } from '../../../services/api';

const PerformanceMetrics = ({ expanded = false }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getPerformanceMetrics('servicerequests');
        if (res?.data) {
          setMetrics(res.data);
        } else {
          throw new Error('No metrics data returned');
        }
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        setMetrics({
          summary: { totalRequests: 0, completionRate: 0, avgFulfillmentTime: 0, customerSatisfaction: 0 },
          fulfillmentTrends: [],
          servicePopularity: [],
          satisfactionTrends: [],
          departmentMetrics: [],
          technicianPerformance: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRange]);

  const timeRangeOptions = [
    { value: '7d', label: t('last7Days', 'Last 7 days') },
    { value: '30d', label: t('last30Days', 'Last 30 days') },
    { value: '90d', label: t('last90Days', 'Last 90 days') },
    { value: '12m', label: t('last12Months', 'Last 12 months') }
  ];

  const formatTooltip = (value, name) => {
    if (name === 'avgTime') return [`${value} ${t('days', 'days')}`, t('serviceRequestAvgTime', 'Avg. Time')];
    if (name === 'completion') return [`${value}%`, t('serviceRequestCompletionRate', 'Completion Rate')];
    if (name === 'score') return [`${value}/5`, t('serviceRequestSatisfaction', 'Satisfaction')];
    return [value, name];
  };

  const translateLabel = (value) => t(String(value || ''), String(value || ''));

  const handleExport = () => {
    const rows = [
      [t('serviceRequestPerformanceMetricsTitle', 'Service Request Performance Metrics'), new Date().toISOString()],
      [t('serviceRequestTotalRequests', 'Total Requests'), metrics?.summary?.totalRequests ?? 0],
      [t('serviceRequestCompletionRate', 'Completion Rate'), metrics?.summary?.completionRate ?? 0],
      [t('serviceRequestAvgFulfillment', 'Avg. Fulfillment Days'), metrics?.summary?.avgFulfillmentTime ?? 0],
      [t('serviceRequestEmployeeSatisfaction', 'Employee Satisfaction'), metrics?.summary?.customerSatisfaction ?? 0]
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `service-request-performance-${timeRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t('serviceRequestPerformanceMetricsTitle', 'Performance Metrics')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('serviceRequestPerformanceSubtitle', 'Service delivery analytics and KPI tracking')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e?.target?.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          >
            {timeRangeOptions?.map((option) => (
              <option key={option?.value} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon name="Download" size={16} />
            <span className="ml-2">{t('export', 'Export')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('serviceRequestTotalRequests', 'Total Requests')}</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.totalRequests?.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon name="ClipboardList" size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">{t('fromLastMonth', '+12.5% from last month')}</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('serviceRequestCompletionRate', 'Completion Rate')}</p>
              <p className="text-2xl font-semibold text-foreground">{metrics?.summary?.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Icon name="CheckCircle" size={24} className="text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">{t('fromLastMonth', '+2.1% from last month')}</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('serviceRequestAvgFulfillment', 'Avg. Fulfillment')}</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.avgFulfillmentTime} {t('days', 'days')}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={24} className="text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingDown" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">{t('daysImproved', '-0.3 days improved')}</span>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t('serviceRequestEmployeeSatisfaction', 'Employee Satisfaction')}</p>
              <p className="text-2xl font-semibold text-foreground">
                {metrics?.summary?.customerSatisfaction}/5
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={24} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2">
            <Icon name="TrendingUp" size={12} className="text-green-600" />
            <span className="text-xs text-green-600 ml-1">{t('fromLastMonth', '+0.1 from last month')}</span>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${expanded ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">{t('serviceRequestFulfillmentTrends', 'Fulfillment Trends')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metrics?.fulfillmentTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={formatTooltip} />
              <Area
                type="monotone"
                dataKey="requests"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
                name={t('serviceRequestTotalRequests', 'Total Requests')}
              />
              <Area
                type="monotone"
                dataKey="fulfilled"
                stackId="1"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.8}
                name={t('serviceRequestFulfilled', 'Fulfilled')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">{t('serviceRequestServicePopularity', 'Service Popularity')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics?.servicePopularity}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {metrics?.servicePopularity?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, t('serviceRequestShare', 'Share')]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {metrics?.servicePopularity?.slice(0, 4)?.map((service, index) => (
              <div key={index} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: service?.color }}
                />
                <span className="text-xs text-muted-foreground">{translateLabel(service?.name)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">{t('serviceRequestDepartmentPerformance', 'Department Performance')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics?.departmentMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="department"
                stroke="#666"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
                tickFormatter={translateLabel}
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip formatter={formatTooltip} />
              <Bar dataKey="requests" fill="#8884d8" name={t('serviceRequestRequests', 'Requests')} />
              <Bar dataKey="completion" fill="#82ca9d" name={t('serviceRequestCompletionPct', 'Completion %')} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">{t('serviceRequestEmployeeSatisfaction', 'Employee Satisfaction')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics?.satisfactionTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" fontSize={12} />
              <YAxis
                domain={[4.0, 5.0]}
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => value?.toFixed(1)}
              />
              <Tooltip formatter={formatTooltip} />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8884d8"
                strokeWidth={3}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                name={t('serviceRequestSatisfactionScore', 'Satisfaction Score')}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {expanded && (
        <div className="mt-6 bg-background border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-4">{t('serviceRequestTopTechnicians', 'Top Performing Technicians')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">{t('serviceRequestTechnician', 'Technician')}</th>
                  <th className="text-right py-2 text-muted-foreground">{t('serviceRequestResolved', 'Resolved')}</th>
                  <th className="text-right py-2 text-muted-foreground">{t('serviceRequestAvgTime', 'Avg. Time')}</th>
                  <th className="text-right py-2 text-muted-foreground">{t('serviceRequestSatisfaction', 'Satisfaction')}</th>
                  <th className="text-right py-2 text-muted-foreground">{t('serviceRequestPerformance', 'Performance')}</th>
                </tr>
              </thead>
              <tbody>
                {metrics?.technicianPerformance?.map((tech, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 font-medium text-foreground">{formatLocalizedValue(tech?.name) || tech?.name}</td>
                    <td className="py-3 text-right text-foreground">{tech?.resolved}</td>
                    <td className="py-3 text-right text-foreground">{tech?.avgTime} {t('days', 'days')}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        <Icon name="Star" size={14} className="text-yellow-500 mr-1" />
                        <span className="text-foreground">{tech?.satisfaction}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end">
                        {tech?.satisfaction >= 4.7 && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {t('serviceRequestExcellent', 'Excellent')}
                          </span>
                        )}
                        {tech?.satisfaction >= 4.5 && tech?.satisfaction < 4.7 && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {t('serviceRequestGood', 'Good')}
                          </span>
                        )}
                        {tech?.satisfaction < 4.5 && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            {t('serviceRequestAverage', 'Average')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMetrics;
