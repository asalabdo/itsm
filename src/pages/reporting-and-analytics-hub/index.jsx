import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ReportLibrarySidebar from './components/ReportLibrarySidebar';
import FilterPanel from './components/FilterPanel';
import KPIWidget from './components/KPIWidget';
import ChartWidget from './components/ChartWidget';
import DataTable from './components/DataTable';
import QuickActionsBar from './components/QuickActionsBar';
import Icon from '../../components/AppIcon';
import reportingService from '../../services/reportingService';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ReportingAndAnalyticsHub = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSidebarOpen] = useState(true);
  const [isFilterPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [analytics, setAnalytics] = useState(null);

  const fetchData = async (days = 30) => {
    try {
      setLoading(true);
      const data = await reportingService.getOverview(days);
      setAnalytics(data);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Failed to fetch reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full shadow-lg"></div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Aggregating IT insights...</p>
      </div>
    );
  }

  const kpiData = [
    {
      title: t('totalTickets', 'Total Tickets'),
      value: analytics?.slaCompliance?.totalTickets?.toLocaleString() || '0',
      change: '',
      changeType: 'positive',
      icon: 'Ticket',
      trend: 'last 30 days',
      subtitle: `${analytics?.slaCompliance?.resolvedWithinSla || 0} resolved within SLA`
    },
    {
      title: t('slaCompliance', 'SLA Compliance'),
      value: `${analytics?.slaCompliance?.compliancePercentage?.toFixed(1) || '0'}%`,
      change: analytics?.slaCompliance?.compliancePercentage > 95 ? 'Above target' : 'Below target',
      changeType: analytics?.slaCompliance?.compliancePercentage > 95 ? 'positive' : 'negative',
      icon: 'Clock',
      trend: 'target: 95%',
      subtitle: `${analytics?.slaCompliance?.breachedSla || 0} breaches`
    },
    {
      title: t('avgResolution', 'Avg Resolution'),
      value: analytics?.topPerformers?.[0]?.avgResolutionTimeHours != null
        ? `${Number(analytics.topPerformers[0].avgResolutionTimeHours).toFixed(1)} hrs`
        : '--',
      change: '',
      changeType: 'positive',
      icon: 'Activity',
      trend: 'top performer',
      subtitle: 'Best resolution time'
    },
    {
      title: t('activeTechnicians', 'Active Technicians'),
      value: analytics?.topPerformers?.length?.toString() || '0',
      change: '',
      changeType: 'positive',
      icon: 'Users',
      trend: 'this period',
      subtitle: 'Assigned technicians'
    }
  ];

  const ticketVolumeData = analytics?.volumeTrends?.map(t => ({
    name: new Date(t.date).toLocaleDateString(undefined, { weekday: 'short' }),
    value: t.count
  })) || [];

  const categoryData = analytics?.categoryBreakdown?.map(c => ({
    name: c.category,
    value: c.count
  })) || [];

  const tableColumns = [
    { key: 'technicianName', label: t('technician', 'Technician') },
    { key: 'resolvedCount', label: t('resolved', 'Resolved') },
    { key: 'avgResolutionTimeHours', label: t('avgTime', 'Avg Time (hrs)'), render: (val) => val != null ? Number(val).toFixed(1) : '--' },
    { key: 'slaComplianceRate', label: t('slaPercent', 'SLA %'), render: (val) => val != null ? `${Number(val).toFixed(1)}%` : '--' }
  ];

  const handleApplyFilters = (filters) => fetchData(filters.days || 30);
  const handleResetFilters = () => fetchData(30);
  const handleRefresh = () => fetchData();

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
                <h1 className={`text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>Reporting & Analytics Hub</h1>
                <p className={`text-sm text-slate-500 dark:text-slate-400 mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>Real-time visibility into service pipeline and performance</p>
              </div>
              <QuickActionsBar onRefresh={handleRefresh} lastUpdated={lastUpdated} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {kpiData.map((kpi, index) => <KPIWidget key={index} {...kpi} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartWidget title="Ticket Volume Trend" type="line" data={ticketVolumeData} />
              <ChartWidget title="Category Distribution" type="pie" data={categoryData} />
            </div>

            <div className="mb-8">
              <DataTable title="Technician Performance Leaderboard" columns={tableColumns} data={analytics?.topPerformers || []} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Ticket" size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>Ticket Summary</h3>
                    <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Last 30 days</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('totalTickets', 'Total Tickets')}</span><span className="font-semibold">{analytics?.slaCompliance?.totalTickets ?? '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('resolved', 'Resolved within SLA')}</span><span className="font-semibold text-success">{analytics?.slaCompliance?.resolvedWithinSla ?? '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('slaPercent', 'SLA Breaches')}</span><span className="font-semibold text-error">{analytics?.slaCompliance?.breachedSla ?? '--'}</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>SLA Performance</h3>
                    <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Compliance rate</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('slaPercent', 'Compliance %')}</span><span className="font-semibold">{analytics?.slaCompliance?.compliancePercentage != null ? `${Number(analytics.slaCompliance.compliancePercentage).toFixed(1)}%` : '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('activeTechnicians', 'Top Technicians')}</span><span className="font-semibold">{analytics?.topPerformers?.length ?? '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('category', 'Categories')}</span><span className="font-semibold">{analytics?.categoryBreakdown?.length ?? '--'}</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className={`flex items-center gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="Users" size={20} color="var(--color-warning)" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isRtl ? 'text-right' : 'text-left'}`}>Top Performer</h3>
                    <p className={`text-xs text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>Best resolution time</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('technician', 'Name')}</span><span className="font-semibold">{analytics?.topPerformers?.[0]?.technicianName ?? '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('avgResolution', 'Avg Resolution')}</span><span className="font-semibold">{analytics?.topPerformers?.[0]?.avgResolutionTimeHours != null ? `${Number(analytics.topPerformers[0].avgResolutionTimeHours).toFixed(1)}h` : '--'}</span></div>
                  <div className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-sm text-muted-foreground">{t('resolved', 'Resolved')}</span><span className="font-semibold text-success">{analytics?.topPerformers?.[0]?.resolvedCount ?? '--'}</span></div>
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
