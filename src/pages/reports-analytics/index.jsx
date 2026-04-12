import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import MetricCard from './components/MetricCard';
import ChartContainer from './components/ChartContainer';
import FilterPanel from './components/FilterPanel';
import ReportTemplates from './components/ReportTemplates';
import TicketVolumeChart from './components/TicketVolumeChart';
import ResolutionTimeChart from './components/ResolutionTimeChart';
import CategoryDistributionChart from './components/CategoryDistributionChart';
import SLAPerformanceChart from './components/SLAPerformanceChart';
import AgentPerformanceTable from './components/AgentPerformanceTable';
import { dashboardAPI } from '../../services/api';
import apiClient from '../../services/apiClient';

const ReportsAnalytics = () => {
  const navigate = useNavigate();
  const [chartType, setChartType] = useState('line');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState(null);
  const [topAgents, setTopAgents] = useState([]);

  useEffect(() => {
    dashboardAPI.getSummary().then(r => setSummary(r.data)).catch(console.error);
    apiClient.get('/reports/technicians').then(r => setTopAgents((r.data || []).slice(0, 3))).catch(console.error);
  }, []);

  const metrics = summary ? [
    { title: 'Total Tickets', value: String(summary.totalTickets ?? '--'), change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: '' },
    { title: 'Avg Resolution Time', value: summary.averageResolutionTime != null ? `${Number(summary.averageResolutionTime).toFixed(1)}h` : '--', change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-success)', trend: '' },
    { title: 'SLA Compliance', value: '--', change: '', changeType: 'positive', icon: 'Target', iconColor: 'var(--color-warning)', trend: '' },
    { title: 'Open Tickets', value: String(summary.openTickets ?? '--'), change: '', changeType: 'positive', icon: 'Star', iconColor: 'var(--color-accent)', trend: '' },
  ] : [
    { title: 'Total Tickets', value: '--', change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: '' },
    { title: 'Avg Resolution Time', value: '--', change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-success)', trend: '' },
    { title: 'SLA Compliance', value: '--', change: '', changeType: 'positive', icon: 'Target', iconColor: 'var(--color-warning)', trend: '' },
    { title: 'Open Tickets', value: '--', change: '', changeType: 'positive', icon: 'Star', iconColor: 'var(--color-accent)', trend: '' },
  ];


  const chartTypeOptions = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' }];


  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
  { id: 'templates', label: 'Templates', icon: 'FileStack' }];


  const handleApplyFilters = (filters) => {
    window.dispatchEvent(new CustomEvent('itsm:refresh', { detail: { filters } }));
  };

  const handleResetFilters = () => {
    window.dispatchEvent(new CustomEvent('itsm:refresh', { detail: { reset: true } }));
  };

  const handleExportChart = (chartName) => {
    const blob = new Blob([`${chartName},${new Date().toISOString()}\nExported successfully`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chartName.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefreshChart = (chartName) => {
    window.dispatchEvent(new CustomEvent('itsm:refresh', { detail: { chartName } }));
  };

  const handleGenerateReport = (template) => {
    navigate('/reporting-and-analytics-hub');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">
                Reports & Analytics
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Comprehensive performance analysis and data-driven insights
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="default"
                iconName="Filter"
                onClick={() => setShowFilters(!showFilters)}>

                Filters
              </Button>
              <Button
                variant="outline"
                size="default"
                iconName="Download"
                onClick={() => handleExportChart('All Reports')}
              >
                Export All
              </Button>
              <Button
                variant="default"
                size="default"
                iconName="Calendar"
                onClick={() => navigate('/workflow-builder-studio')}
              >
                Schedule Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {metrics?.map((metric, index) =>
            <MetricCard key={index} {...metric} />
            )}
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {tabs?.map((tab) =>
            <button
              key={tab?.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth flex-shrink-0 ${
              activeTab === tab?.id ?
              'bg-primary text-primary-foreground' :
              'bg-muted text-muted-foreground hover:bg-muted/80'}`
              }
              onClick={() => setActiveTab(tab?.id)}>

                <Icon name={tab?.icon} size={18} />
                <span>{tab?.label}</span>
              </button>
            )}
          </div>

          {activeTab === 'overview' &&
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <ChartContainer
                title="Ticket Volume Trends"
                description="Daily ticket creation, resolution, and pending status over time"
                onExport={() => handleExportChart('Ticket Volume')}
                onRefresh={() => handleRefreshChart('Ticket Volume')}
                actions={
                <Select
                  options={chartTypeOptions}
                  value={chartType}
                  onChange={setChartType}
                  className="w-32" />

                }>

                  <TicketVolumeChart chartType={chartType} />
                </ChartContainer>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ChartContainer
                  title="Resolution Time by Category"
                  description="Average resolution time compared to target SLA"
                  onExport={() => handleExportChart('Resolution Time')}
                  onRefresh={() => handleRefreshChart('Resolution Time')}>

                    <ResolutionTimeChart />
                  </ChartContainer>

                  <ChartContainer
                  title="Ticket Category Distribution"
                  description="Breakdown of tickets by support category"
                  onExport={() => handleExportChart('Category Distribution')}
                  onRefresh={() => handleRefreshChart('Category Distribution')}>

                    <CategoryDistributionChart />
                  </ChartContainer>
                </div>

                <ChartContainer
                title="SLA Performance"
                description="Monthly SLA compliance and breach tracking"
                onExport={() => handleExportChart('SLA Performance')}
                onRefresh={() => handleRefreshChart('SLA Performance')}>

                  <SLAPerformanceChart />
                </ChartContainer>
              </div>

              <div className="lg:col-span-1">
                {showFilters &&
              <div className="mb-6">
                    <FilterPanel
                  onApplyFilters={handleApplyFilters}
                  onResetFilters={handleResetFilters} />

                  </div>
              }

                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Info" size={20} color="var(--color-primary)" />
                    <h3 className="text-lg font-semibold text-foreground">Quick Stats</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Open Tickets</span>
                      <span className="text-sm font-medium text-foreground data-text">{summary?.openTickets ?? '--'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Resolved Today</span>
                      <span className="text-sm font-medium text-success data-text">{summary?.resolvedTickets ?? '--'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Total Assets</span>
                      <span className="text-sm font-medium text-error data-text">{summary?.totalAssets ?? '--'}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Active Assets</span>
                      <span className="text-sm font-medium text-foreground data-text">{summary?.activeAssets ?? '--'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground caption">Avg Resolution Time</span>
                      <span className="text-sm font-medium text-foreground data-text">{summary?.averageResolutionTime != null ? `${Number(summary.averageResolutionTime).toFixed(1)}h` : '--'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                    <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
                  </div>
                  <div className="space-y-3">
                    {topAgents.map((agent, index) =>
                  <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground">{agent?.technicianName}</span>
                        </div>
                        <span className="text-sm font-medium text-success data-text">{agent?.resolvedTickets}</span>
                      </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          }

          {activeTab === 'performance' &&
          <div className="space-y-6">
              <AgentPerformanceTable />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer
                title="Team Workload Distribution"
                description="Current ticket assignment across team members"
                onExport={() => handleExportChart('Workload')}
                onRefresh={() => handleRefreshChart('Workload')}>

                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Icon name="Users" size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Workload visualization chart</p>
                    </div>
                  </div>
                </ChartContainer>

                <ChartContainer
                title="Response Time Trends"
                description="First response time analysis over the past 30 days"
                onExport={() => handleExportChart('Response Time')}
                onRefresh={() => handleRefreshChart('Response Time')}>

                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Icon name="Clock" size={48} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Response time chart</p>
                    </div>
                  </div>
                </ChartContainer>
              </div>
            </div>
          }

          {activeTab === 'templates' &&
          <div className="space-y-6">
              <ReportTemplates onGenerateReport={handleGenerateReport} />

              <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Calendar" size={20} color="var(--color-primary)" />
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">Scheduled Reports</h3>
                </div>
                <div className="space-y-3">
                  {[
                { name: 'Weekly Performance Summary', schedule: 'Every Monday at 9:00 AM', status: 'Active' },
                { name: 'Monthly SLA Report', schedule: 'First day of month at 8:00 AM', status: 'Active' },
                { name: 'Daily Ticket Summary', schedule: 'Every day at 6:00 PM', status: 'Paused' }]?.
                map((report, index) =>
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-border rounded-lg hover:shadow-elevation-2 transition-smooth">

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground mb-1">{report?.name}</h4>
                        <p className="text-sm text-muted-foreground caption">{report?.schedule}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                      className={`px-3 py-1 text-xs rounded-full caption ${
                      report?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`
                      }>

                          {report?.status}
                        </span>
                        <Button variant="ghost" size="sm" iconName="MoreVertical" />
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>
          }
        </div>
      </main>
    </div>);

};

export default ReportsAnalytics;
