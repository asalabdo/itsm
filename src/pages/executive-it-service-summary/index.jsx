import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricCard from './components/MetricCard';
import ServiceHealthScorecard from './components/ServiceHealthScorecard';
import TrendAnalysisChart from './components/TrendAnalysisChart';
import DepartmentPerformance from './components/DepartmentPerformance';
import KeyInsightsSummary from './components/KeyInsightsSummary';
import KPICorrelationMatrix from './components/KPICorrelationMatrix';
import { dashboardAPI } from '../../services/api';

const ExecutiveITServiceSummary = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [departmentMetrics, setDepartmentMetrics] = useState([]);
  const [trendMetrics, setTrendMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsRes, summaryRes, deptRes, trendRes] = await Promise.all([
        dashboardAPI.getAllMetrics(),
        dashboardAPI.getSummary(),
        dashboardAPI.getPerformanceMetrics('Department'),
        dashboardAPI.getPerformanceMetrics('IncidentTrend')
      ]);
      setMetrics(metricsRes.data || []);
      setSummary(summaryRes.data || null);
      setDepartmentMetrics(deptRes.data || []);
      setTrendMetrics((trendRes.data || []).reverse()); // Reverse to get chronological order
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch executive summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 300000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const primaryMetrics = metrics.map(m => ({
    title: m.metricName,
    value: String(m.value),
    unit: m.unit || "",
    trend: m.percentageChange >= 0 ? "up" : "down",
    trendValue: m.percentageChange ? `${m.percentageChange}%` : "0%",
    benchmark: String(m.targetValue || 0),
    status: (m.value >= (m.targetValue || 0)) ? "excellent" : "good",
    icon: m.metricName.includes("Availability") ? "Activity" : 
          m.metricName.includes("Satisfaction") ? "Heart" : 
          m.metricName.includes("Cost") ? "DollarSign" : "TrendingUp",
    description: `Current ${m.metricName} performance`
  }));

  // Fallback if no metrics returned
  const displayMetrics = primaryMetrics.length > 0 ? primaryMetrics.slice(0, 4) : [
    {
      title: "IT Service Availability",
      value: summary ? "99.8" : "--",
      unit: "%",
      trend: "up",
      trendValue: "+0.3%",
      benchmark: "99.5",
      status: "excellent",
      icon: "Activity",
      description: "Overall system uptime across all services"
    },
    {
      title: "Employee Satisfaction",
      value: "4.5",
      unit: "/5.0",
      trend: "up",
      trendValue: "+0.2",
      benchmark: "4.0",
      status: "excellent",
      icon: "Heart",
      description: "Average user satisfaction rating"
    },
    {
      title: "Cost per Ticket",
      value: "42",
      unit: "USD",
      trend: "down",
      trendValue: "-8%",
      benchmark: "50",
      status: "good",
      icon: "DollarSign",
      description: "Average cost to resolve each ticket"
    },
    {
      title: "Business Impact Score",
      value: "8.7",
      unit: "/10",
      trend: "up",
      trendValue: "+0.5",
      benchmark: "8.0",
      status: "excellent",
      icon: "TrendingUp",
      description: "IT contribution to business objectives"
    }
  ];

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting executive summary in ${format} format`);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  return (
    <>
      <Helmet>
        <title>Executive IT Service Summary - ITSM Hub</title>
        <meta name="description" content="High-level strategic dashboard for IT directors and business stakeholders with executive-level KPI monitoring and business impact visibility" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Icon name="BarChart3" size={24} color="white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Executive IT Service Summary</h1>
                    <p className="text-muted-foreground">Strategic overview and business impact analysis</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Clock" size={16} />
                  <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    iconName="RefreshCw"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Refresh
                  </Button>
                  
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Download"
                      iconPosition="left"
                      iconSize={16}
                    >
                      Export
                    </Button>
                    
                    {/* Export Dropdown */}
                    <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-md operations-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-50">
                      <div className="py-2">
                        <button 
                          onClick={() => handleExport('pdf')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="FileText" size={16} />
                          <span>PDF Report</span>
                        </button>
                        <button 
                          onClick={() => handleExport('pptx')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="Presentation" size={16} />
                          <span>PowerPoint</span>
                        </button>
                        <button 
                          onClick={() => handleExport('excel')}
                          className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition flex items-center space-x-2"
                        >
                          <Icon name="FileSpreadsheet" size={16} />
                          <span>Excel Data</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="autoRefresh"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e?.target?.checked)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="autoRefresh" className="text-sm text-muted-foreground">
                      Auto-refresh
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Business Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {displayMetrics?.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
              {/* Main Content Area (9 cols equivalent) */}
              <div className="xl:col-span-3 space-y-6">
                {/* Service Health Scorecard */}
                <ServiceHealthScorecard />

                {/* Trend Analysis */}
                <TrendAnalysisChart data={trendMetrics} />

                {/* Department Performance */}
                <DepartmentPerformance data={departmentMetrics} />
              </div>

              {/* Right Sidebar (3 cols equivalent) */}
              <div className="xl:col-span-1">
                <KeyInsightsSummary />
              </div>
            </div>

            {/* KPI Correlation Matrix */}
            <div className="mb-8">
              <KPICorrelationMatrix />
            </div>

            {/* Executive Summary Footer */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 lg:mb-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Executive Summary</h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    IT services are performing exceptionally well with 99.8% availability and 4.5/5.0 customer satisfaction. 
                    Cost optimization initiatives have reduced per-ticket costs by 8%. Key focus areas include database 
                    performance optimization and continued cloud migration to maintain service excellence.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-muted-foreground">
                    Report Period: September 2024
                  </div>
                  <Button variant="outline" size="sm">
                    Schedule Email Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ExecutiveITServiceSummary;