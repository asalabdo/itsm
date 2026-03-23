import React, { useState } from 'react';
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

const ReportsAnalytics = () => {
  const [chartType, setChartType] = useState('line');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const metrics = [
  {
    title: "Total Tickets",
    value: "1,847",
    change: "+12.5%",
    changeType: "positive",
    icon: "Ticket",
    iconColor: "var(--color-primary)",
    trend: "Increasing"
  },
  {
    title: "Avg Resolution Time",
    value: "3.2h",
    change: "-8.3%",
    changeType: "positive",
    icon: "Clock",
    iconColor: "var(--color-success)",
    trend: "Improving"
  },
  {
    title: "SLA Compliance",
    value: "94.8%",
    change: "+2.1%",
    changeType: "positive",
    icon: "Target",
    iconColor: "var(--color-warning)",
    trend: "On Track"
  },
  {
    title: "Employee Satisfaction",
    value: "4.7/5",
    change: "+0.3",
    changeType: "positive",
    icon: "Star",
    iconColor: "var(--color-accent)",
    trend: "Excellent"
  }];


  const chartTypeOptions = [
  { value: 'line', label: 'Line Chart' },
  { value: 'bar', label: 'Bar Chart' }];


  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
  { id: 'performance', label: 'Performance', icon: 'TrendingUp' },
  { id: 'templates', label: 'Templates', icon: 'FileStack' }];


  const handleApplyFilters = (filters) => {
    console.log('Applying filters:', filters);
  };

  const handleResetFilters = () => {
    console.log('Resetting filters');
  };

  const handleExportChart = (chartName) => {
    console.log(`Exporting ${chartName} chart`);
  };

  const handleRefreshChart = (chartName) => {
    console.log(`Refreshing ${chartName} chart`);
  };

  const handleGenerateReport = (template) => {
    console.log('Generating report:', template?.name);
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
                iconName="Download">

                Export All
              </Button>
              <Button
                variant="default"
                size="default"
                iconName="Calendar">

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
                      <span className="text-sm font-medium text-foreground data-text">342</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Resolved Today</span>
                      <span className="text-sm font-medium text-success data-text">58</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Overdue</span>
                      <span className="text-sm font-medium text-error data-text">12</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-sm text-muted-foreground caption">Active Agents</span>
                      <span className="text-sm font-medium text-foreground data-text">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground caption">Avg Response Time</span>
                      <span className="text-sm font-medium text-foreground data-text">1.8h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="TrendingUp" size={20} color="var(--color-success)" />
                    <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                  { name: 'Abdelrahman Salem', tickets: 48, avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#1a1d535ba-1763301900823.png", avatarAlt: 'Professional headshot of Asian man with black hair in navy suit' },
                  { name: 'Abdullah Aldosri', tickets: 47, avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#110d6e0d8-1763301538824.png", avatarAlt: 'Professional headshot of Indian woman with black hair in professional attire' },
                  { name: 'Sarah Alrashedea', tickets: 45, avatar: "https://www.gfsa.gov.sa/web/image/10824-729e91b9/gfsa%20logo.svg#141e51895-1763296519617.png", avatarAlt: 'Professional headshot of woman with brown hair in business attire' }]?.
                  map((agent, index) =>
                  <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm text-foreground">{agent?.name}</span>
                        </div>
                        <span className="text-sm font-medium text-success data-text">{agent?.tickets}</span>
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