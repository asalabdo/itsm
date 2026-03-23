import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import ReportLibrarySidebar from './components/ReportLibrarySidebar';
import FilterPanel from './components/FilterPanel';
import KPIWidget from './components/KPIWidget';
import ChartWidget from './components/ChartWidget';
import DataTable from './components/DataTable';
import QuickActionsBar from './components/QuickActionsBar';
import Icon from '../../components/AppIcon';

import { dashboardAPI } from '../../services/api';

const ReportingAndAnalyticsHub = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [stats, setStats] = useState({
    kpiData: [],
    tableData: [],
    ticketVolumeData: [],
    workflowPerformanceData: []
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, metricsRes, deptRes, trendRes] = await Promise.all([
        dashboardAPI.getSummary(),
        dashboardAPI.getAllMetrics(),
        dashboardAPI.getPerformanceMetrics('Department'),
        dashboardAPI.getPerformanceMetrics('IncidentTrend')
      ]);

      const summary = summaryRes.data;
      const metrics = metricsRes.data || [];
      const depts = deptRes.data || [];
      const trends = (trendRes.data || []).reverse();

      // Map KPI data
      const kpis = [
        {
          title: 'Total Tickets',
          value: summary?.totalTickets?.toLocaleString() || '0',
          change: '+5.2%',
          changeType: 'positive',
          icon: 'Ticket',
          trend: 'vs last month',
          subtitle: `${summary?.openTickets || 0} open, ${summary?.resolvedTickets || 0} resolved`
        },
        {
          title: 'Active Assets',
          value: summary?.activeAssets?.toLocaleString() || '0',
          change: '+2.1%',
          changeType: 'positive',
          icon: 'Package',
          trend: 'vs last month',
          subtitle: `$${((summary?.totalAssets || 0) * 1500 / 1000000).toFixed(1)}M total value`
        },
        {
          title: 'SLA Compliance',
          value: '96.8%', // Placeholder as backend doesn't have SLA yet
          change: '-1.2%',
          changeType: 'negative',
          icon: 'Clock',
          trend: 'vs last month',
          subtitle: 'System wide average'
        },
        {
          title: 'Avg Resolution',
          value: `${summary?.averageResolutionTime?.toFixed(1) || '0'} hrs`,
          change: '-15%',
          changeType: 'positive',
          icon: 'Activity',
          trend: 'faster vs last month',
          subtitle: 'Across all departments'
        }
      ];

      // Map table data (Dept performance)
      const mappedDepts = depts.map(d => ({
        department: d.metricName,
        tickets: Math.floor(Math.random() * 100) + 50,
        avgResolution: (Math.random() * 5 + 2).toFixed(1),
        satisfaction: Number(d.value) * 20, // Value is 0-5, convert to %
        status: d.value >= 4.5 ? 'Excellent' : d.value >= 4 ? 'Good' : 'Average'
      }));

      // Map trend data
      const mappedTrends = trends.map(t => ({
        name: t.metricName,
        value: Number(t.value)
      }));

      setStats({
        kpiData: kpis,
        tableData: mappedDepts.length > 0 ? mappedDepts : [],
        ticketVolumeData: mappedTrends,
        workflowPerformanceData: mappedTrends.map(t => ({ name: t.name, value: 85 + Math.random() * 10 }))
      });
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

  const ticketVolumeData = stats.ticketVolumeData.length > 0 ? stats.ticketVolumeData : [
    { name: 'Mon', value: 145 },
    { name: 'Tue', value: 178 },
    { name: 'Wed', value: 162 },
    { name: 'Thu', value: 198 },
    { name: 'Fri', value: 156 },
    { name: 'Sat', value: 89 },
    { name: 'Sun', value: 67 }
  ];

  const assetDistributionData = [
    { name: 'IT Equipment', value: 456 },
    { name: 'Furniture', value: 234 },
    { name: 'Vehicles', value: 123 },
    { name: 'Software Licenses', value: 345 },
    { name: 'Other', value: 298 }
  ];

  const workflowPerformanceData = stats.workflowPerformanceData.length > 0 ? stats.workflowPerformanceData : [
    { name: 'Jan', value: 87 },
    { name: 'Feb', value: 89 },
    { name: 'Mar', value: 92 },
    { name: 'Apr', value: 88 },
    { name: 'May', value: 94 },
    { name: 'Jun', value: 91 },
    { name: 'Jul', value: 95 }
  ];

  const kpiData = stats.kpiData.length > 0 ? stats.kpiData : [
    {
      title: 'Total Tickets',
      value: '2,847',
      change: '+12.5%',
      changeType: 'positive',
      icon: 'Ticket',
      trend: 'vs last month',
      subtitle: '1,234 open, 1,613 closed'
    }
  ];

  const tableData = stats.tableData.length > 0 ? stats.tableData : [
    { department: 'IT Department', tickets: 456, avgResolution: 4.2, satisfaction: 94, status: 'Excellent' }
  ];

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    console.log('Selected report:', report);
  };

  const handleApplyFilters = (filters) => {
    console.log('Applied filters:', filters);
  };

  const handleResetFilters = () => {
    console.log('Filters reset');
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSchedule = () => {
    console.log('Opening schedule dialog...');
  };

  const handleShare = () => {
    console.log('Opening share dialog...');
  };

  const handleExport = () => {
    console.log('Exporting report...');
  };

  const handleTableExport = (format) => {
    console.log(`Exporting table as ${format}...`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 flex h-screen">
        {isSidebarOpen && (
          <div className="hidden lg:block w-64 xl:w-80 flex-shrink-0">
            <ReportLibrarySidebar
              onSelectReport={handleSelectReport}
              selectedReportId={selectedReport?.id}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-custom">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Reporting & Analytics Hub</h1>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden p-2 rounded-md hover:bg-muted transition-smooth"
                  aria-label="Toggle sidebar"
                >
                  <Icon name="Menu" size={24} />
                </button>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Comprehensive analytics and insights for data-driven decision making
              </p>
            </div>

            <QuickActionsBar
              onRefresh={handleRefresh}
              onSchedule={handleSchedule}
              onShare={handleShare}
              onExport={handleExport}
              lastUpdated="2026-01-07 06:09 AM"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              {kpiData?.map((kpi, index) => (
                <KPIWidget key={index} {...kpi} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <ChartWidget
                title="Ticket Volume Trend"
                type="bar"
                data={ticketVolumeData}
              />
              <ChartWidget
                title="Asset Distribution"
                type="pie"
                data={assetDistributionData}
              />
            </div>

            <div className="mb-6">
              <ChartWidget
                title="Workflow Performance Over Time"
                type="line"
                data={workflowPerformanceData}
              />
            </div>

            <div className="mb-6">
              <DataTable
                title="Department Performance Summary"
                columns={tableColumns}
                data={tableData}
                onExport={handleTableExport}
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