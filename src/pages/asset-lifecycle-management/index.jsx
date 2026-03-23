import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import AssetMetricsCard from './components/AssetMetricsCard';
import AssetLifecycleFunnel from './components/AssetLifecycleFunnel';
import PriorityAlertsPanel from './components/PriorityAlertsPanel';
import DepartmentAssetDistribution from './components/DepartmentAssetDistribution';
import AssetFiltersHeader from './components/AssetFiltersHeader';

const AssetLifecycleManagement = () => {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    location: 'all',
    stage: 'all'
  });
  const [selectedStage, setSelectedStage] = useState(null);
  const [alertCount] = useState(5);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate data refresh for real-time updates
      console.log('Refreshing asset data...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    console.log('Filters updated:', newFilters);
  };

  const handleStageClick = (stageData) => {
    setSelectedStage(stageData);
    console.log('Stage selected:', stageData);
  };

  const metricsData = [
    {
      title: 'Total Assets',
      value: '8,196',
      change: '+2.3%',
      changeType: 'positive',
      icon: 'Package',
      color: 'primary'
    },
    {
      title: 'Nearing End-of-Life',
      value: '203',
      change: '+12.5%',
      changeType: 'negative',
      icon: 'AlertTriangle',
      color: 'warning'
    },
    {
      title: 'Compliance Rate',
      value: '94.2%',
      change: '+1.8%',
      changeType: 'positive',
      icon: 'Shield',
      color: 'success'
    },
    {
      title: 'Cost Optimization',
      value: '$2.4M',
      change: '-8.7%',
      changeType: 'positive',
      icon: 'TrendingDown',
      color: 'success'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Asset Lifecycle Management
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive asset tracking with lifecycle visibility and compliance monitoring
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="text-sm font-medium text-foreground">
                    {new Date()?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Header */}
          <AssetFiltersHeader 
            onFiltersChange={handleFiltersChange}
            alertCount={alertCount}
          />

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricsData?.map((metric, index) => (
              <AssetMetricsCard
                key={index}
                title={metric?.title}
                value={metric?.value}
                change={metric?.change}
                changeType={metric?.changeType}
                icon={metric?.icon}
                color={metric?.color}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Asset Lifecycle Funnel - 8 columns */}
            <div className="lg:col-span-8">
              <AssetLifecycleFunnel onStageClick={handleStageClick} />
            </div>

            {/* Priority Alerts Panel - 4 columns */}
            <div className="lg:col-span-4">
              <PriorityAlertsPanel />
            </div>
          </div>

          {/* Department Asset Distribution */}
          <div className="mb-8">
            <DepartmentAssetDistribution />
          </div>

          {/* Additional Information Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">Bulk Asset Assignment</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">Generate Compliance Report</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">Schedule Maintenance</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <span className="text-sm font-medium">Asset Retirement Planning</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">New server deployed</p>
                    <p className="text-xs text-muted-foreground">Dell PowerEdge R750 - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Warranty expiring soon</p>
                    <p className="text-xs text-muted-foreground">HP ProLiant DL380 - 15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-error rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">License renewal required</p>
                    <p className="text-xs text-muted-foreground">VMware vSphere - 1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-foreground">Asset transferred</p>
                    <p className="text-xs text-muted-foreground">Laptop moved to Engineering - 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Asset Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">CMDB Sync</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Synced</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">License Server</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-xs text-warning">Degraded</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Backup Status</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-xs text-success">Complete</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Next scheduled backup: Today at 11:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetLifecycleManagement;