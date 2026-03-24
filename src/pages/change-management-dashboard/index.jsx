import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ChangeCalendar from './components/ChangeCalendar';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import ChangeSuccessMetrics from './components/ChangeSuccessMetrics';
import PipelineVisualization from './components/PipelineVisualization';
import FilterControls from './components/FilterControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { changeRequestsAPI, dashboardAPI } from '../../services/api';

const ChangeManagementDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('overview'); // overview, calendar, metrics, pipeline
  const [loading, setLoading] = useState(false);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch latest change data from API
      await Promise.all([
        changeRequestsAPI.getAll().catch(() => null),
        dashboardAPI.getPerformanceMetrics('changes').catch(() => null)
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    // Apply filters to all components
  };

  const handleExport = (format) => {
    // Export functionality
    console.log(`Exporting change management report as ${format}`);
  };

  const getViewModeIcon = (mode) => {
    switch (mode) {
      case 'overview': return 'LayoutDashboard';
      case 'calendar': return 'Calendar';
      case 'metrics': return 'BarChart3';
      case 'pipeline': return 'GitBranch';
      default: return 'LayoutDashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground font-heading">
                Change Management Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor change success rates, approval workflows, and deployment pipeline performance
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                {['overview', 'calendar', 'metrics', 'pipeline']?.map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    <Icon name={getViewModeIcon(mode)} size={16} />
                    <span className="ml-1 hidden sm:inline">{mode}</span>
                  </Button>
                ))}
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <Icon 
                  name="RefreshCw" 
                  size={16} 
                  className={refreshing ? 'animate-spin' : ''} 
                />
                <span className="ml-2 hidden sm:inline">
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </Button>

              {/* Last Refresh Indicator */}
              <div className="text-sm text-muted-foreground hidden md:block">
                Last updated: {lastRefresh?.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mb-8">
            <FilterControls 
              onFiltersChange={handleFiltersChange}
              onExport={handleExport}
            />
          </div>

          {/* Dashboard Content */}
          {viewMode === 'overview' && (
            <div className="space-y-8">
              {/* Top Section: Calendar + Approval Workflow */}
              <div className="grid grid-cols-1 xl:grid-cols-16 gap-8">
                <div className="xl:col-span-10">
                  <ChangeCalendar />
                </div>
                <div className="xl:col-span-6">
                  <ApprovalWorkflow />
                </div>
              </div>

              {/* Bottom Section: Metrics + Pipeline */}
              <div className="space-y-8">
                <ChangeSuccessMetrics />
                <PipelineVisualization />
              </div>
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <ChangeCalendar />
              </div>
              <div>
                <ApprovalWorkflow />
              </div>
            </div>
          )}

          {viewMode === 'metrics' && (
            <div className="space-y-8">
              <ChangeSuccessMetrics />
            </div>
          )}

          {viewMode === 'pipeline' && (
            <div className="space-y-8">
              <PipelineVisualization />
            </div>
          )}

          {/* Emergency Alert Banner */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-error text-error-foreground px-4 py-3 rounded-lg operations-shadow flex items-center space-x-3 max-w-sm">
              <Icon name="AlertTriangle" size={20} className="animate-pulse" />
              <div>
                <div className="font-medium text-sm">Emergency Change Alert</div>
                <div className="text-xs opacity-90">Security patch deployment in progress</div>
              </div>
              <Button variant="ghost" size="sm" className="text-error-foreground hover:bg-error/20">
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangeManagementDashboard;