import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ServiceCatalog from './components/ServiceCatalog';
import RequestCreationWizard from './components/RequestCreationWizard';
import ActiveRequestsDashboard from './components/ActiveRequestsDashboard';
import ApprovalWorkflowCards from './components/ApprovalWorkflowCards';
import PerformanceMetrics from './components/PerformanceMetrics';
import FilterControls from './components/FilterControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ServiceRequestManagement = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('overview'); // overview, catalog, requests, approvals, metrics
  const [showWizard, setShowWizard] = useState(false);

  // Auto-refresh every 3 minutes for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call delay
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
    }, 1200);
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    // Apply filters to all components
  };

  const handleExport = (format) => {
    // Simulate export functionality
    console.log(`Exporting service requests report as ${format}`);
    // In a real application, this would trigger the export process
  };

  const handleCreateRequest = () => {
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    // Refresh data after request creation
    handleRefresh();
  };

  const getViewModeIcon = (mode) => {
    switch (mode) {
      case 'overview': return 'LayoutDashboard';
      case 'catalog': return 'Package';
      case 'requests': return 'ClipboardList';
      case 'approvals': return 'CheckSquare';
      case 'metrics': return 'BarChart3';
      default: return 'LayoutDashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Request Creation Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card rounded-lg border border-border operations-shadow w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <RequestCreationWizard onClose={handleWizardClose} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground font-heading">
                Service Request Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Streamlined request fulfillment platform for service catalog management and lifecycle tracking
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Create Request Button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateRequest}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Icon name="Plus" size={16} />
                <span className="ml-2">New Request</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                {['overview', 'catalog', 'requests', 'approvals', 'metrics']?.map((mode) => (
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
              {/* Top Section: Service Catalog + Active Requests */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <ServiceCatalog />
                </div>
                <div>
                  <ActiveRequestsDashboard />
                </div>
              </div>

              {/* Middle Section: Approval Workflow Cards */}
              <div>
                <ApprovalWorkflowCards />
              </div>

              {/* Bottom Section: Performance Metrics */}
              <div>
                <PerformanceMetrics />
              </div>
            </div>
          )}

          {viewMode === 'catalog' && (
            <div className="grid grid-cols-1">
              <ServiceCatalog expanded={true} />
            </div>
          )}

          {viewMode === 'requests' && (
            <div className="grid grid-cols-1">
              <ActiveRequestsDashboard expanded={true} />
            </div>
          )}

          {viewMode === 'approvals' && (
            <div className="grid grid-cols-1">
              <ApprovalWorkflowCards expanded={true} />
            </div>
          )}

          {viewMode === 'metrics' && (
            <div className="space-y-8">
              <PerformanceMetrics expanded={true} />
            </div>
          )}

          {/* Quick Action Alert */}
          <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg operations-shadow flex items-center space-x-3 max-w-sm">
              <Icon name="Clock" size={20} className="animate-pulse" />
              <div>
                <div className="font-medium text-sm">SLA Alert</div>
                <div className="text-xs opacity-90">3 requests approaching deadline</div>
              </div>
              <Button variant="ghost" size="sm" className="text-accent-foreground hover:bg-accent/20">
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceRequestManagement;