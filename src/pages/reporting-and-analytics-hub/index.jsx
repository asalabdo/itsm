import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import ReportLibrarySidebar from './components/ReportLibrarySidebar';
import FilterPanel from './components/FilterPanel';
import KPIWidget from './components/KPIWidget';
import ChartWidget from './components/ChartWidget';
import DataTable from './components/DataTable';
import QuickActionsBar from './components/QuickActionsBar';
import Icon from '../../components/AppIcon';

import reportingService from '../../services/reportingService';

const ReportingAndAnalyticsHub = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
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

  useEffect(() => {
    fetchData();
  }, []);

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
      title: 'Total Tickets',
      value: analytics?.slaCompliance?.totalTickets?.toLocaleString() || '0',
      change: '+10.2%',
      changeType: 'positive',
      icon: 'Ticket',
      trend: 'vs last 30 days',
      subtitle: `${analytics?.slaCompliance?.resolvedWithinSla || 0} resolved within SLA`
    },
    {
      title: 'SLA Compliance',
      value: `${analytics?.slaCompliance?.compliancePercentage?.toFixed(1) || '0'}%`,
      change: analytics?.slaCompliance?.compliancePercentage > 95 ? '+1.2%' : '-0.5%',
      changeType: analytics?.slaCompliance?.compliancePercentage > 95 ? 'positive' : 'negative',
      icon: 'Clock',
      trend: 'vs target (95%)',
      subtitle: `${analytics?.slaCompliance?.breachedSla || 0} breaches detected`
    },
    {
      title: 'Avg Resolution',
      value: `${analytics?.topPerformers?.[0]?.avgResolutionTimeHours?.toFixed(1) || '0'} hrs`,
      change: '-12%',
      changeType: 'positive',
      icon: 'Activity',
      trend: 'faster than average',
      subtitle: 'Based on top performance'
    },
    {
      title: 'Active Analysts',
      value: analytics?.topPerformers?.length?.toString() || '0',
      change: '+2',
      changeType: 'positive',
      icon: 'Users',
      trend: 'assigned this period',
      subtitle: 'Authorized technicians'
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
    { key: 'technicianName', label: 'Technician' },
    { key: 'resolvedCount', label: 'Resolved' },
    { key: 'avgResolutionTimeHours', label: 'Avg Time (hrs)', render: (val) => val.toFixed(1) },
    { key: 'slaComplianceRate', label: 'SLA %', render: (val) => `${val.toFixed(1)}%` }
  ];

  const handleApplyFilters = (filters) => {
    fetchData(filters.days || 30);
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {isSidebarOpen && (
          <div className="hidden lg:block w-64 xl:w-80 flex-shrink-0 border-r border-border bg-card">
            <ReportLibrarySidebar
              onSelectReport={setSelectedReport}
              selectedReportId={selectedReport?.id}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-custom bg-slate-50/30 dark:bg-slate-950/30">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Reporting & Analytics Hub</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Real-time visibility into service pipeline and performance
                </p>
              </div>
              <QuickActionsBar
                onRefresh={handleRefresh}
                lastUpdated={lastUpdated}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {kpiData.map((kpi, index) => (
                <KPIWidget key={index} {...kpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartWidget
                title="Ticket Volume Trend"
                type="line"
                data={ticketVolumeData}
              />
              <ChartWidget
                title="Category Distribution"
                type="pie"
                data={categoryData}
              />
            </div>

            <div className="mb-8">
              <DataTable
                title="Technician Performance Leaderboard"
                columns={tableColumns}
                data={analytics?.topPerformers || []}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Database" size={20} color="var(--color-primary)" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Data Sources</h3>
                    <p className="text-xs text-muted-foreground">All systems operational</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: 'Ticket System', status: 'Connected', sync: '2 min ago' },
                    { name: 'Asset Database', status: 'Connected', sync: '5 min ago' },
                    { name: 'Workflow Engine', status: 'Connected', sync: '1 min ago' }
                  ]?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-sm">{source?.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{source?.sync}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Icon name="AlertTriangle" size={20} color="var(--color-warning)" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alerts & Insights</h3>
                    <p className="text-xs text-muted-foreground">3 items need attention</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { text: 'SLA breach rate increased by 15%', severity: 'high' },
                    { text: 'Asset utilization below target', severity: 'medium' },
                    { text: 'Workflow bottleneck detected', severity: 'medium' }
                  ]?.map((alert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Icon
                        name={alert?.severity === 'high' ? 'AlertCircle' : 'Info'}
                        size={16}
                        className={alert?.severity === 'high' ? 'text-error mt-0.5' : 'text-warning mt-0.5'}
                      />
                      <span className="text-sm">{alert?.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Quick Stats</h3>
                    <p className="text-xs text-muted-foreground">Real-time metrics</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Reports Generated', value: '1,234', change: '+18%' },
                    { label: 'Active Users', value: '456', change: '+5%' },
                    { label: 'Data Queries', value: '8,901', change: '+23%' }
                  ]?.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat?.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stat?.value}</span>
                        <span className="text-xs text-success">{stat?.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isFilterPanelOpen && (
          <div className="hidden xl:block w-80 flex-shrink-0">
            <FilterPanel
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportingAndAnalyticsHub;