import { useEffect, useRef, useState } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ReportLibrarySidebar from './components/ReportLibrarySidebar';
import FilterPanel from './components/FilterPanel';
import KPIWidget from './components/KPIWidget';
import ChartWidget from './components/ChartWidget';
import DataTable from './components/DataTable';
import QuickActionsBar from './components/QuickActionsBar';
import ManageEngineReportingSnapshot from './components/ManageEngineReportingSnapshot';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import reportingService from '../../services/reportingService';
import { dashboardAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const DEFAULT_FILTERS = {
  dateRange: 'last-30-days',
  startDate: '',
  endDate: '',
  departments: ['all'],
  metrics: ['tickets', 'assets', 'workflows'],
  granularity: 'daily',
};

const resolveDaysFromFilters = (filters = DEFAULT_FILTERS) => {
  const range = filters?.dateRange || 'last-30-days';
  const today = new Date();
  const start = filters?.startDate ? new Date(filters.startDate) : null;
  const end = filters?.endDate ? new Date(filters.endDate) : null;

  if (range === 'today') return 1;
  if (range === 'yesterday') return 2;
  if (range === 'last-7-days') return 7;
  if (range === 'last-30-days') return 30;
  if (range === 'last-90-days') return 90;
  if (range === 'this-month') return Math.max(1, today.getDate());
  if (range === 'last-month') return 30;
  if (range === 'this-quarter') return 90;
  if (range === 'this-year') return 365;

  if (range === 'custom' && start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    const diffMs = Math.max(end.getTime() - start.getTime(), 0);
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
  }

  return 30;
};

const getLocaleDateLabel = (dateValue, language) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue ?? '');
  }

  return parsed.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const ReportingAndAnalyticsHub = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSidebarOpen] = useState(true);
  const [isFilterPanelOpen] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'));
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [analytics, setAnalytics] = useState({
    overview: null,
    volumeTrends: [],
    categoryBreakdown: [],
    topPerformers: [],
    slaCompliance: null,
  });
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = async (nextFilters = filters) => {
    const days = resolveDaysFromFilters(nextFilters);
    setLoading(true);
    setError('');

    try {
      const [summaryRes, overviewRes, volumeRes, categoriesRes, topPerformersRes, slaRes] = await Promise.allSettled([
        dashboardAPI.getSummary(),
        reportingService.getOverview(days),
        reportingService.getTicketVolume(days),
        reportingService.getCategoryBreakdown(),
        reportingService.getTopPerformers(days),
        reportingService.getSlaCompliance(days),
      ]);

      const summary = summaryRes.status === 'fulfilled' ? summaryRes.value?.data || null : null;
      const overview = overviewRes.status === 'fulfilled' ? overviewRes.value || null : null;
      const volumeTrends = volumeRes.status === 'fulfilled' ? volumeRes.value || [] : [];
      const categoryBreakdown = categoriesRes.status === 'fulfilled' ? categoriesRes.value || [] : [];
      const topPerformers = topPerformersRes.status === 'fulfilled' ? topPerformersRes.value || [] : [];
      const slaCompliance = slaRes.status === 'fulfilled' ? slaRes.value || null : null;

      if (!isMountedRef.current) {
        return;
      }

      setDashboardSummary(summary);
      setAnalytics({
        overview,
        volumeTrends: volumeTrends.length > 0 ? volumeTrends : overview?.volumeTrends || [],
        categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : overview?.categoryBreakdown || [],
        topPerformers: topPerformers.length > 0 ? topPerformers : overview?.topPerformers || [],
        slaCompliance: slaCompliance || overview?.slaCompliance || null,
      });
      setLastUpdated(new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US'));
    } catch (err) {
      if (!isMountedRef.current) {
        return;
      }

      console.error('Failed to fetch reporting data:', err);
      setError(t('failedToLoadReports', 'Failed to load report data from the backend.'));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchData(filters);
    // Intentionally re-run only when filters are committed by the filter panel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  if (loading && !analytics?.overview && !dashboardSummary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full shadow-lg"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Aggregating IT insights...</p>
      </div>
    );
  }

  const slaCompliance = analytics?.slaCompliance || {};
  const ticketVolumeData = (analytics?.volumeTrends || []).map((point) => ({
    name: getLocaleDateLabel(point?.date, language),
    value: point?.count ?? 0,
  }));
  const categoryData = (analytics?.categoryBreakdown || []).map((category) => ({
    name: category?.category || t('uncategorized', 'Uncategorized'),
    value: category?.count ?? 0,
  }));
  const topPerformer = analytics?.topPerformers?.[0] || null;

  const kpiData = [
    {
      title: t('totalTickets', 'Total Tickets'),
      value: String(slaCompliance?.totalTickets ?? dashboardSummary?.totalTickets ?? 0),
      change: '',
      changeType: 'positive',
      icon: 'Ticket',
      trend: `${resolveDaysFromFilters(filters)} ${t('days', 'days')}`,
      subtitle: `${slaCompliance?.resolvedWithinSla ?? 0} ${t('resolvedWithinSla', 'resolved within SLA')}`
    },
    {
      title: t('slaCompliance', 'SLA Compliance'),
      value: `${Number(slaCompliance?.compliancePercentage ?? 0).toFixed(1)}%`,
      change: Number(slaCompliance?.compliancePercentage ?? 0) >= 95 ? 'Above target' : 'Below target',
      changeType: Number(slaCompliance?.compliancePercentage ?? 0) >= 95 ? 'positive' : 'negative',
      icon: 'Clock',
      trend: 'target: 95%',
      subtitle: `${slaCompliance?.breachedSla ?? 0} ${t('breaches', 'breaches')}`
    },
    {
      title: t('avgResolution', 'Avg Resolution'),
      value: dashboardSummary?.averageResolutionTime != null
        ? `${Number(dashboardSummary.averageResolutionTime).toFixed(1)}h`
        : topPerformer?.avgResolutionTimeHours != null
          ? `${Number(topPerformer.avgResolutionTimeHours).toFixed(1)}h`
          : '--',
      change: '',
      changeType: 'positive',
      icon: 'Activity',
      trend: 'top performer',
      subtitle: 'Best resolution time'
    },
    {
      title: t('activeTechnicians', 'Active Technicians'),
      value: String(analytics?.topPerformers?.length ?? 0),
      change: '',
      changeType: 'positive',
      icon: 'Users',
      trend: 'this period',
      subtitle: 'Assigned technicians'
    }
  ];

  const tableColumns = [
    { key: 'technicianName', label: t('technician', 'Technician') },
    { key: 'resolvedCount', label: t('resolved', 'Resolved') },
    { key: 'avgResolutionTimeHours', label: t('avgTime', 'Avg Time (hrs)'), render: (val) => val != null ? Number(val).toFixed(1) : '--' },
    { key: 'slaComplianceRate', label: t('slaPercent', 'SLA %'), render: (val) => val != null ? `${Number(val).toFixed(1)}%` : '--' }
  ];

  const handleApplyFilters = (nextFilters) => {
    const normalized = {
      ...DEFAULT_FILTERS,
      ...nextFilters,
      startDate: nextFilters?.startDate || '',
      endDate: nextFilters?.endDate || '',
      days: resolveDaysFromFilters(nextFilters),
    };
    setFilters(normalized);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleRefresh = () => {
    void fetchData(filters);
  };

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Tickets', slaCompliance?.totalTickets ?? dashboardSummary?.totalTickets ?? 0],
      ['Resolved Within SLA', slaCompliance?.resolvedWithinSla ?? 0],
      ['SLA Breaches', slaCompliance?.breachedSla ?? 0],
      ['SLA Compliance %', slaCompliance?.compliancePercentage != null ? Number(slaCompliance.compliancePercentage).toFixed(1) : '0.0'],
      ['Open Tickets', dashboardSummary?.openTickets ?? 0],
      ['Resolved Tickets', dashboardSummary?.resolvedTickets ?? 0],
      ['Average Resolution Time (h)', dashboardSummary?.averageResolutionTime != null ? Number(dashboardSummary.averageResolutionTime).toFixed(1) : ''],
      ['Active Assets', dashboardSummary?.activeAssets ?? 0],
      ['Top Technicians', analytics?.topPerformers?.length ?? 0],
    ];

    downloadCsv(rows, `reporting-dashboard-${new Date().toISOString().slice(0, 10)}.csv`, ['Metric', 'Value']);
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      <div className="flex h-screen overflow-hidden">
        {isSidebarOpen && (
          <div className="hidden lg:block w-64 xl:w-80 flex-shrink-0 border-r border-border bg-card">
            <ReportLibrarySidebar onSelectReport={setSelectedReport} selectedReportId={selectedReport?.id} />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-custom bg-slate-50/30 dark:bg-slate-950/30">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white`}>Reporting & Analytics Hub</h1>
                <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1`}>Real-time visibility into backend reporting, SLA health, and performance trends</p>
              </div>
              <QuickActionsBar onRefresh={handleRefresh} onExport={handleExport} lastUpdated={lastUpdated} />
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            )}

            {selectedReport && (
              <div className="mb-6 rounded-lg border border-border bg-card p-4 sm:p-5 shadow-elevation-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Selected report</p>
                    <h2 className="text-lg font-semibold text-foreground">{selectedReport.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Frequency: {selectedReport.frequency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" iconName="Play" iconPosition="left">
                      Run report
                    </Button>
                    <Button variant="ghost" size="sm" iconName="MoreVertical" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {kpiData.map((kpi, index) => <KPIWidget key={index} {...kpi} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartWidget title="Ticket Volume Trend" type="line" data={ticketVolumeData} />
              <ChartWidget title="Category Distribution" type="pie" data={categoryData} />
            </div>

            <div className="mb-8">
              <DataTable title="Technician Performance Leaderboard" columns={tableColumns} data={analytics?.topPerformers || []} onExport={() => handleExport()} />
            </div>

            <div className="mb-8">
              <ManageEngineReportingSnapshot />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Ticket" size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold`}>Ticket Summary</h3>
                    <p className={`text-xs text-muted-foreground`}>Last 30 days</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('totalTickets', 'Total Tickets')}</span><span className="font-semibold">{analytics?.slaCompliance?.totalTickets ?? '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('resolved', 'Resolved within SLA')}</span><span className="font-semibold text-success">{analytics?.slaCompliance?.resolvedWithinSla ?? '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('slaPercent', 'SLA Breaches')}</span><span className="font-semibold text-error">{analytics?.slaCompliance?.breachedSla ?? '--'}</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4`}>
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold`}>SLA Performance</h3>
                    <p className={`text-xs text-muted-foreground`}>Compliance rate</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('slaPercent', 'Compliance %')}</span><span className="font-semibold">{analytics?.slaCompliance?.compliancePercentage != null ? `${Number(analytics.slaCompliance.compliancePercentage).toFixed(1)}%` : '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('activeTechnicians', 'Top Technicians')}</span><span className="font-semibold">{analytics?.topPerformers?.length ?? '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('category', 'Categories')}</span><span className="font-semibold">{analytics?.categoryBreakdown?.length ?? '--'}</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4`}>
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} color="var(--color-warning)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold`}>Top Performer</h3>
                    <p className={`text-xs text-muted-foreground`}>Best resolution time</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('technician', 'Name')}</span><span className="font-semibold">{topPerformer?.technicianName ?? '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('avgResolution', 'Avg Resolution')}</span><span className="font-semibold">{topPerformer?.avgResolutionTimeHours != null ? `${Number(topPerformer.avgResolutionTimeHours).toFixed(1)}h` : '--'}</span></div>
                  <div className={`flex items-center justify-between`}><span className="text-sm text-muted-foreground">{t('resolved', 'Resolved')}</span><span className="font-semibold text-success">{topPerformer?.resolvedCount ?? '--'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFilterPanelOpen && (
          <div className="hidden xl:block w-80 flex-shrink-0">
            <FilterPanel onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingAndAnalyticsHub;
