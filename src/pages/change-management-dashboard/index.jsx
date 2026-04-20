import { useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ChangeCalendar from './components/ChangeCalendar';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import ChangeSuccessMetrics from './components/ChangeSuccessMetrics';
import PipelineVisualization from './components/PipelineVisualization';
import ManageEngineChangeImpactPanel from './components/ManageEngineChangeImpactPanel';
import FilterControls from './components/FilterControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { changeRequestsAPI, dashboardAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';

const ChangeManagementDashboard = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';
  const locale = isArabic ? 'ar-SA' : 'en-US';
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('overview'); // overview, calendar, metrics, pipeline
  const [changes, setChanges] = useState([]);
  const [overviewMetrics, setOverviewMetrics] = useState(null);

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
      const [changesRes, metricsRes] = await Promise.all([
        changeRequestsAPI.getAll().catch(() => ({ data: [] })),
        dashboardAPI.getPerformanceMetrics('changes').catch(() => ({ data: [] }))
      ]);
      setChanges(Array.isArray(changesRes.data) ? changesRes.data : []);
      setOverviewMetrics(metricsRes.data || null);
      window.dispatchEvent(new CustomEvent('itsm:refresh'));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  const handleExport = (format) => {
    if (format === 'csv') {
      downloadCsv(
        filteredChanges.map((change) => ([
          change?.changeNumber || change?.id || '',
          change?.title || '',
          change?.status || '',
          change?.priority || '',
          change?.riskLevel || '',
          change?.category || '',
          change?.assignedTo?.fullName || change?.requestedBy?.fullName || '',
          change?.createdAt || ''
        ])),
        `change-management-report-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Change ID', 'Title', 'Status', 'Priority', 'Risk Level', 'Category', 'Assignee', 'Created At']
      );
      return;
    }

    const blob = new Blob([
      `Change Management Report\nGenerated: ${new Date().toISOString()}\nFilters: ${JSON.stringify(activeFilters)}`
    ], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'change-management-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredChanges = useMemo(() => {
    const rangeToDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    const days = rangeToDays[activeFilters?.dateRange] || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const query = String(activeFilters?.searchTerm || '').trim().toLowerCase();

    return (changes || []).filter((change) => {
      const createdAt = change?.createdAt ? new Date(change.createdAt) : null;
      const matchesDate = createdAt ? createdAt >= cutoff : true;
      const matchesType = !activeFilters?.changeType || activeFilters.changeType === 'all'
        || String(change?.category || '').toLowerCase().includes(activeFilters.changeType);
      const matchesEnvironment = !activeFilters?.environment || activeFilters.environment === 'all'
        || String(change?.environment || '').toLowerCase().includes(activeFilters.environment);
      const matchesRisk = !activeFilters?.riskLevel || activeFilters.riskLevel === 'all'
        || String(change?.riskLevel || '').toLowerCase() === activeFilters.riskLevel;
      const matchesStatus = !activeFilters?.status || activeFilters.status === 'all'
        || String(change?.status || '').toLowerCase() === activeFilters.status;
      const matchesPriority = !activeFilters?.priority || activeFilters.priority === 'all'
        || String(change?.priority || '').toLowerCase() === activeFilters.priority;
      const matchesAssignee = !activeFilters?.assignee || activeFilters.assignee === 'all'
        || [change?.assignedTo?.fullName, change?.requestedBy?.fullName, change?.assignedTo?.username]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(activeFilters.assignee));
      const matchesSearch = !query || [
        change?.changeNumber,
        change?.title,
        change?.description,
        change?.category,
        change?.status,
        change?.priority
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));

      return matchesDate && matchesType && matchesEnvironment && matchesRisk && matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
    });
  }, [changes, activeFilters]);

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
      <BreadcrumbTrail />
      {/* Main Content */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Page Header */}
          <div className={`flex items-center justify-between mb-8`}>
            <div>
              <h1 className="text-3xl font-semibold text-foreground font-heading">
                {t('changeManagementDashboard', 'Change Management Dashboard')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('changeManagementDashboardDescription', 'Monitor change success rates, approval workflows, and deployment pipeline performance')}
              </p>
            </div>
            
            <div className={`flex items-center ${isArabic ? 'space-x-reverse' : ''} space-x-4`}>
              {/* View Mode Toggle */}
              <div className={`flex items-center ${isArabic ? 'space-x-reverse' : ''} space-x-1 bg-muted rounded-lg p-1`}>
                {['overview', 'calendar', 'metrics', 'pipeline']?.map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                    >
                      <Icon name={getViewModeIcon(mode)} size={16} />
                  <span className="ml-1 hidden sm:inline">
                    {mode === 'overview' ? t('overview', 'Overview') : 
                     mode === 'calendar' ? t('calendar', 'Calendar') : 
                     mode === 'metrics' ? t('metrics', 'Metrics') : 
                     t('pipeline', 'Pipeline')}
                  </span>
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
                  {refreshing ? t('refreshing', 'Refreshing...') : t('refresh', 'Refresh')}
                </span>
              </Button>

              {/* Last Refresh Indicator */}
              <div className="text-sm text-muted-foreground hidden md:block">
                {t('lastRefresh', 'Last refresh')}: {lastRefresh?.toLocaleTimeString(locale, { 
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
              changeCount={filteredChanges.length}
            />
          </div>

          {/* Dashboard Content */}
          {viewMode === 'overview' && (
            <div className="space-y-8">
              <ManageEngineChangeImpactPanel changes={filteredChanges} />

              {/* Top Section: Calendar + Approval Workflow */}
              <div className="grid grid-cols-1 xl:grid-cols-16 gap-8">
                <div className="xl:col-span-10">
                  <ChangeCalendar changes={filteredChanges} />
                </div>
                <div className="xl:col-span-6">
                  <ApprovalWorkflow changes={filteredChanges} />
                </div>
              </div>

              {/* Bottom Section: Metrics + Pipeline */}
              <div className="space-y-8">
                <ChangeSuccessMetrics changes={filteredChanges} overviewMetrics={overviewMetrics} onExport={handleExport} />
                <PipelineVisualization changes={filteredChanges} />
              </div>
            </div>
          )}

          {viewMode === 'calendar' && (
            <div className="space-y-8">
              <ManageEngineChangeImpactPanel changes={filteredChanges} />
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                <ChangeCalendar changes={filteredChanges} />
                </div>
                <div>
                  <ApprovalWorkflow changes={filteredChanges} />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'metrics' && (
            <div className="space-y-8">
              <ManageEngineChangeImpactPanel changes={filteredChanges} />
              <ChangeSuccessMetrics changes={filteredChanges} overviewMetrics={overviewMetrics} onExport={handleExport} />
            </div>
          )}

          {viewMode === 'pipeline' && (
            <div className="space-y-8">
              <ManageEngineChangeImpactPanel changes={filteredChanges} />
              <PipelineVisualization changes={filteredChanges} />
            </div>
          )}

          {/* Emergency Alert Banner */}
          <div className={`fixed bottom-6 z-50 ${isArabic ? 'left-6 right-auto' : 'right-6'}`}>
          <div className="bg-error text-error-foreground px-4 py-3 rounded-lg operations-shadow flex items-center space-x-3 max-w-sm">
            <Icon name="AlertTriangle" size={20} className="animate-pulse" />
            <div>
              <div className="font-medium text-sm">{t('emergencyChangeAlert', 'Emergency Change Alert')}</div>
              <div className="text-xs opacity-90">{t('securityPatchDeployment', 'Security patch deployment in progress')}</div>
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
