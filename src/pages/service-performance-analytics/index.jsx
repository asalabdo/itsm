import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import FilterPanel from './components/FilterPanel';
import PerformanceChart from './components/PerformanceChart';
import TopIssuesTable from './components/TopIssuesTable';
import TrendAnalysisSection from './components/TrendAnalysisSection';
import { dashboardAPI } from '../../services/api';

const ServicePerformanceAnalytics = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [filters, setFilters] = useState({
    timeRange: '30d',
    department: 'all',
    service: 'all',
    comparison: false
  });
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check for saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Fetch KPI data from API
  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getAllMetrics();
        const data = res.data || {};
        
        if (data.kpis && Array.isArray(data.kpis)) {
          setKpiData(data.kpis);
        } else {
          // Use fallback mock data
          setKpiData(getDefaultKPIData());
        }
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
        // Use fallback mock data
        setKpiData(getDefaultKPIData());
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, [filters]);

  const getDefaultKPIData = () => [
    {
      title: "SLA Compliance",
      value: "94.8",
      unit: "%",
      change: 2.3,
      trend: "up",
      icon: "Target",
      color: "success",
      sparklineData: [92.1, 93.5, 91.8, 94.2, 95.1, 93.7, 94.8]
    },
    {
      title: "Avg Resolution Time",
      value: "4.1",
      unit: "hours",
      change: -8.5,
      trend: "down",
      icon: "Clock",
      color: "primary",
      sparklineData: [4.8, 4.5, 4.9, 4.3, 4.0, 4.2, 4.1]
    },
    {
      title: "Employee Satisfaction",
      value: "4.4",
      unit: "/5",
      change: 5.2,
      trend: "up",
      icon: "Star",
      color: "warning",
      sparklineData: [4.1, 4.2, 4.0, 4.3, 4.5, 4.3, 4.4]
    },
    {
      title: "Ticket Volume",
      value: "1,147",
      unit: "tickets",
      change: -3.1,
      trend: "down",
      icon: "BarChart3",
      color: "secondary",
      sparklineData: [1250, 1180, 1320, 1190, 1160, 1200, 1147]
    }
  ];

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In a real application, this would trigger data refetch
    console.log('Filters updated:', newFilters);
  };

  const handleExport = (format) => {
    // Mock export functionality
    console.log(`Exporting data in ${format} format`);
    // In a real application, this would trigger actual export
  };

  return (
    <>
      <Helmet>
        <title>Service Performance Analytics - ITSM Hub</title>
        <meta name="description" content="Comprehensive analytical dashboard for tracking IT service KPI trends, performance patterns, and data-driven optimization decisions." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Service Performance Analytics
                  </h1>
                  <p className="text-muted-foreground">
                    Track KPI trends, identify performance patterns, and make data-driven optimization decisions
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Dashboard refreshed:</span>
                  <span className="font-medium">Sep 21, 2024 8:48 AM</span>
                </div>
              </div>
            </div>

            {/* Filter Panel */}
            <FilterPanel 
              onFiltersChange={handleFiltersChange}
              onExport={handleExport}
            />

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {kpiData?.map((kpi, index) => (
                <MetricCard
                  key={index}
                  title={kpi?.title}
                  value={kpi?.value}
                  unit={kpi?.unit}
                  change={kpi?.change}
                  trend={kpi?.trend}
                  sparklineData={kpi?.sparklineData}
                  icon={kpi?.icon}
                  color={kpi?.color}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
              {/* Performance Chart - 8 columns */}
              <div className="xl:col-span-8">
                <PerformanceChart />
              </div>

              {/* Top Issues Table - 4 columns */}
              <div className="xl:col-span-4">
                <TopIssuesTable />
              </div>
            </div>

            {/* Trend Analysis Section - Full Width */}
            <TrendAnalysisSection />

            {/* Additional Insights */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
                <h4 className="text-lg font-semibold text-foreground mb-4">Key Insights</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground font-medium">SLA Performance Improving</p>
                      <p className="text-xs text-muted-foreground">2.3% increase in compliance rate this period</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Email Issues Trending Up</p>
                      <p className="text-xs text-muted-foreground">45 incidents reported, requires attention</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-foreground font-medium">Employee Satisfaction High</p>
                      <p className="text-xs text-muted-foreground">4.4/5 average rating across all services</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
                <h4 className="text-lg font-semibold text-foreground mb-4">Recommendations</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground font-medium mb-1">Focus on Email Infrastructure</p>
                    <p className="text-xs text-muted-foreground">Address recurring connectivity issues to reduce ticket volume</p>
                  </div>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                    <p className="text-sm text-foreground font-medium mb-1">Expand User Training</p>
                    <p className="text-xs text-muted-foreground">Reduce password reset requests through better education</p>
                  </div>
                  <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <p className="text-sm text-foreground font-medium mb-1">Optimize Workflows</p>
                    <p className="text-xs text-muted-foreground">Streamline approval processes for faster resolution</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
                <h4 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm text-foreground font-medium">Generate Monthly Report</p>
                    <p className="text-xs text-muted-foreground">Create comprehensive performance summary</p>
                  </button>
                  <button className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm text-foreground font-medium">Schedule Review Meeting</p>
                    <p className="text-xs text-muted-foreground">Discuss findings with stakeholders</p>
                  </button>
                  <button className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <p className="text-sm text-foreground font-medium">Configure Alerts</p>
                    <p className="text-xs text-muted-foreground">Set up proactive monitoring thresholds</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServicePerformanceAnalytics;