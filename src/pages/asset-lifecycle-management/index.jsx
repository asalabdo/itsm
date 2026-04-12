import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import AssetMetricsCard from './components/AssetMetricsCard';
import AssetLifecycleFunnel from './components/AssetLifecycleFunnel';
import PriorityAlertsPanel from './components/PriorityAlertsPanel';
import DepartmentAssetDistribution from './components/DepartmentAssetDistribution';
import AssetFiltersHeader from './components/AssetFiltersHeader';
import { assetsAPI, dashboardAPI, ticketsAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';

const AssetLifecycleManagement = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    location: 'all',
    stage: 'all'
  });
  const [selectedStage, setSelectedStage] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const [metricsData, setMetricsData] = useState([]);
  const [lifecycleData, setLifecycleData] = useState([]);
  const [alertsData, setAlertsData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch metrics data from API
  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        setLoading(true);
        const [metricsRes, assetsRes, ticketsRes] = await Promise.all([
          dashboardAPI.getPerformanceMetrics('assets').catch(() => ({ data: [] })),
          assetsAPI.getAll().catch(() => ({ data: [] })),
          ticketsAPI.getAll().catch(() => ({ data: [] }))
        ]);
        const data = metricsRes.data || {};
        const assets = Array.isArray(assetsRes.data) ? assetsRes.data : [];
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
        
        if (data.metrics && Array.isArray(data.metrics)) {
          setMetricsData(data.metrics);
        } else {
          setMetricsData([]);
        }
        
        if (data.alertCount) {
          setAlertCount(data.alertCount);
        }

        const normalizedAssets = assets.map((asset) => ({
          ...asset,
          ownerDepartment: asset?.owner?.department || 'Unassigned'
        }));

        const procurement = normalizedAssets.filter(a => {
          const purchased = a?.purchaseDate ? new Date(a.purchaseDate) : null;
          return purchased && (Date.now() - purchased.getTime()) < 1000 * 60 * 60 * 24 * 60;
        });
        const active = normalizedAssets.filter(a => String(a.status || '').toLowerCase() === 'active');
        const maintenance = normalizedAssets.filter(a => String(a.status || '').toLowerCase().includes('maintenance'));
        const retirement = normalizedAssets.filter(a => String(a.status || '').toLowerCase().includes('retir') || a?.decommissionDate);

        setLifecycleData([
          { stage: 'Procurement', count: procurement.length, percentage: normalizedAssets.length ? Number(((procurement.length / normalizedAssets.length) * 100).toFixed(1)) : 0, color: '#005051', description: 'Assets in procurement or recent acquisition', details: { recent: procurement.length, activeOrders: procurement.length, planned: Math.max(0, normalizedAssets.length - procurement.length) } },
          { stage: 'Deployment', count: Math.max(0, normalizedAssets.length - procurement.length - active.length), percentage: normalizedAssets.length ? Number((((normalizedAssets.length - procurement.length - active.length) / normalizedAssets.length) * 100).toFixed(1)) : 0, color: '#2563EB', description: 'Assets being staged or deployed', details: { staging: Math.max(0, normalizedAssets.length - procurement.length - active.length), testing: tickets.filter(t => String(t.category || '').toLowerCase().includes('deployment')).length, production: active.length } },
          { stage: 'Active', count: active.length, percentage: normalizedAssets.length ? Number(((active.length / normalizedAssets.length) * 100).toFixed(1)) : 0, color: '#059669', description: 'Assets in active use', details: { optimal: active.length, maintenance: maintenance.length, issues: tickets.filter(t => String(t.category || '').toLowerCase().includes('asset')).length } },
          { stage: 'Maintenance', count: maintenance.length, percentage: normalizedAssets.length ? Number(((maintenance.length / normalizedAssets.length) * 100).toFixed(1)) : 0, color: '#D97706', description: 'Assets under maintenance', details: { scheduled: maintenance.length, emergency: tickets.filter(t => String(t.priority || '').toLowerCase() === 'critical').length, warranty: tickets.filter(t => String(t.category || '').toLowerCase().includes('warranty')).length } },
          { stage: 'Retirement', count: retirement.length, percentage: normalizedAssets.length ? Number(((retirement.length / normalizedAssets.length) * 100).toFixed(1)) : 0, color: '#DC2626', description: 'Assets scheduled for retirement', details: { planned: retirement.length, immediate: tickets.filter(t => String(t.category || '').toLowerCase().includes('retire')).length, disposed: 0 } }
        ]);

        setAlertsData(normalizedAssets
          .filter(a => String(a.status || '').toLowerCase() !== 'active' || a?.decommissionDate || a?.purchaseDate)
          .slice(0, 5)
          .map((asset, index) => ({
            id: index + 1,
            type: String(asset.status || '').toLowerCase().includes('maint') ? 'maintenance' : asset?.decommissionDate ? 'eol' : 'warranty',
            severity: asset?.decommissionDate ? 'critical' : String(asset.status || '').toLowerCase().includes('maint') ? 'high' : 'medium',
            title: asset?.decommissionDate ? 'End of life notice' : asset?.status || 'Asset review required',
            description: `${asset.name} (${asset.assetTag}) requires attention`,
            assetId: asset.assetTag,
            location: asset.location || 'Unassigned',
            daysRemaining: asset?.decommissionDate ? Math.ceil((new Date(asset.decommissionDate) - new Date()) / 86400000) : 30,
            cost: asset.costAmount ? `$${Number(asset.costAmount).toLocaleString()}` : '$0',
            action: asset?.decommissionDate ? 'Plan Migration' : 'Review Asset'
          })));
        setAlertCount(normalizedAssets.filter(a => String(a.status || '').toLowerCase() !== 'active').length);

        const departmentMap = {};
        normalizedAssets.forEach((asset) => {
          const key = asset.ownerDepartment || 'Unassigned';
          if (!departmentMap[key]) {
            departmentMap[key] = {
              department: key,
              assetCount: 0,
              totalCost: 0,
              utilization: 0,
              categories: {},
              costBreakdown: {}
            };
          }
          departmentMap[key].assetCount += 1;
          departmentMap[key].totalCost += Number(asset.costAmount || 0);
          const category = String(asset.assetType || 'Other').toLowerCase();
          departmentMap[key].categories[category] = (departmentMap[key].categories[category] || 0) + 1;
          departmentMap[key].costBreakdown[category] = (departmentMap[key].costBreakdown[category] || 0) + Number(asset.costAmount || 0);
          departmentMap[key].utilization = Math.min(100, Math.round((departmentMap[key].assetCount / Math.max(1, normalizedAssets.length)) * 100));
        });
        setDepartmentData(Object.values(departmentMap));
      } catch (error) {
        console.error('Failed to fetch asset metrics:', error);
        setMetricsData([]);
        setLifecycleData([]);
        setAlertsData([]);
        setDepartmentData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetricsData();
  }, [filters]);

  useEffect(() => {
    const interval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('itsm:refresh'));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStageClick = (stage) => {
    setSelectedStage(stage);
  };

  const handleExport = () => {
    downloadCsv(
      lifecycleData.map((stage) => ([
        stage.stage,
        stage.count,
        stage.percentage,
        stage.description
      ])),
      `asset-lifecycle-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Stage', 'Count', 'Percentage', 'Description']
    );
  };

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
              <AssetLifecycleFunnel data={lifecycleData} onStageClick={handleStageClick} onExport={handleExport} />
            </div>

            {/* Priority Alerts Panel - 4 columns */}
            <div className="lg:col-span-4">
              <PriorityAlertsPanel alerts={alertsData} />
            </div>
          </div>

          {/* Department Asset Distribution */}
          <div className="mb-8">
            <DepartmentAssetDistribution data={departmentData} />
          </div>

          {/* Additional Information Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('/asset-registry-and-tracking')}
                  className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Bulk Asset Assignment</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/reports-analytics')}
                  className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Generate Compliance Report</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/asset-registry-and-tracking')}
                  className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <span className="text-sm font-medium">Schedule Maintenance</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/asset-registry-and-tracking')}
                  className="w-full flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
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
