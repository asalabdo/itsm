import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import ServiceCatalog from './components/ServiceCatalog';
import RequestCreationWizard from './components/RequestCreationWizard';
import ActiveRequestsDashboard from './components/ActiveRequestsDashboard';
import ApprovalWorkflowCards from './components/ApprovalWorkflowCards';
import PerformanceMetrics from './components/PerformanceMetrics';
import ManageEngineRequestIntake from './components/ManageEngineRequestIntake';
import FilterControls from './components/FilterControls';
import DepartmentServiceOwnershipPanel from './components/DepartmentServiceOwnershipPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { serviceRequestsAPI } from '../../services/api';
import { loadErpDepartmentDirectory } from '../../services/organizationUnits';

const ServiceRequestManagement = () => {
  const location = useLocation();
  const { language, isRtl } = useLanguage();
  const isArabic = language === 'ar';
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState({});
  const [viewMode, setViewMode] = useState('overview'); // overview, catalog, requests, approvals, metrics
  const [showWizard, setShowWizard] = useState(false);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [departmentFocus, setDepartmentFocus] = useState('all');
  const [serviceFocus, setServiceFocus] = useState('all');
  const [erpDepartments, setErpDepartments] = useState([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedView = params.get('view');
    if (requestedView && ['overview', 'catalog', 'requests', 'approvals', 'metrics'].includes(requestedView)) {
      setViewMode(requestedView);
    }
  }, [location.search]);

  const fetchServiceRequests = async () => {
    try {
      const response = await serviceRequestsAPI.getAll();
      setServiceRequests(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load service requests:', error);
      setServiceRequests([]);
    }
  };

  // Auto-refresh every 3 minutes for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      window.dispatchEvent(new CustomEvent('itsm:refresh'));
      serviceRequestsAPI.getAll()
        .then((response) => {
          setServiceRequests(Array.isArray(response?.data) ? response.data : []);
        })
        .catch((error) => {
          console.error('Failed to load service requests:', error);
          setServiceRequests([]);
        })
        .finally(() => {
          setRefreshing(false);
          setLastRefresh(new Date());
        });
    }, 180000); // 3 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  useEffect(() => {
    let mounted = true;

    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) {
          setErpDepartments(Array.isArray(departments) ? departments : []);
        }
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) {
          setErpDepartments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    window.dispatchEvent(new CustomEvent('itsm:refresh'));
    await fetchServiceRequests();
    setRefreshing(false);
    setLastRefresh(new Date());
  };

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
    // Apply filters to all components
  };

  const handleOpenDepartment = (bucket) => {
    setDepartmentFocus(bucket?.department || 'all');
    setServiceFocus(bucket?.services?.[0]?.name || 'all');
    setViewMode('requests');
  };

  const handleExport = (format) => {
    const rows = [
      [t('serviceRequestManagement', 'Service Request Management'), new Date().toISOString()],
      [t('filters', 'Filters'), format],
      [t('filters', 'Filters'), JSON.stringify(activeFilters || {})]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `service-requests-report.${format === 'csv' ? 'csv' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateRequest = () => {
    setShowWizard(true);
    window.history.replaceState({}, '', location.pathname);
  };

  const handleRequestService = (service) => {
    const params = new URLSearchParams();
    params.set('catalogItem', String(service?.id || ''));
    setShowWizard(true);
    window.history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    // Refresh data after request creation
    handleRefresh();
    window.history.replaceState({}, '', location.pathname);
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

  // `t` is intentionally used here to keep the filter labels localized with the active language.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterOptions = useMemo(() => {
    const asOptionList = (values) => [
      { value: 'all', label: t('all', isArabic ? 'الكل' : 'All') },
      ...Array.from(new Set(values.filter(Boolean))).sort((a, b) => String(a).localeCompare(String(b))).map((value) => ({
        value: String(value).toLowerCase().replace(/\s+/g, '-'),
        label: String(value),
      }))
    ];

    const serviceTypeValues = serviceRequests.map((request) => request?.catalogItemName || request?.serviceType || request?.title).filter(Boolean);
    const departmentValues = serviceRequests.map((request) => request?.requestedBy?.department || request?.department || request?.requestedByDepartment).filter(Boolean);
    const erpDepartmentValues = erpDepartments.map((department) => department?.label).filter(Boolean);
    const statusValues = serviceRequests.map((request) => request?.status).filter(Boolean);
    const priorityValues = serviceRequests.map((request) => request?.priority).filter(Boolean);
    const assigneeValues = serviceRequests.map((request) => {
      const assignedTo = request?.assignedTo;
      if (assignedTo?.firstName || assignedTo?.lastName) {
        return `${assignedTo?.firstName || ''} ${assignedTo?.lastName || ''}`.trim();
      }
      return request?.assignedToName || request?.assignedToDisplayName || request?.assignedToId;
    }).filter(Boolean);

    return {
      serviceTypeOptions: asOptionList(serviceTypeValues),
      departmentOptions: asOptionList([...erpDepartmentValues, ...departmentValues]),
      statusOptions: asOptionList(statusValues),
      priorityOptions: asOptionList(priorityValues),
      assigneeOptions: asOptionList(assigneeValues),
    };
  }, [isArabic, serviceRequests, erpDepartments]); // eslint-disable-line react-hooks/exhaustive-deps

  const slaAlert = useMemo(() => {
    const now = new Date();
    const overdue = serviceRequests.filter((request) => {
      const dueDate = request?.slaDueDate ? new Date(request.slaDueDate) : null;
      if (!dueDate || Number.isNaN(dueDate.getTime())) return false;
      return dueDate < now && !['completed', 'rejected', 'closed'].includes(String(request?.status || '').toLowerCase());
    });
    const dueSoon = serviceRequests.filter((request) => {
      const dueDate = request?.slaDueDate ? new Date(request.slaDueDate) : null;
      if (!dueDate || Number.isNaN(dueDate.getTime())) return false;
      const diffHours = (dueDate.getTime() - now.getTime()) / 36e5;
      return diffHours >= 0 && diffHours <= 4 && !['completed', 'rejected', 'closed'].includes(String(request?.status || '').toLowerCase());
    });
    return { overdue, dueSoon };
  }, [serviceRequests]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      
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
                {t('serviceRequestManagement', 'Service Request Management')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('serviceRequestManagementDescription', 'Simplified platform for request fulfillment, service catalog management, and lifecycle tracking')}
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
                <span className="ml-2">{t('newRequest', 'New Request')}</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                {[
                  ['overview', t('overview', 'Overview')],
                  ['catalog', t('catalog', 'Catalog')],
                  ['requests', t('requests', 'Requests')],
                  ['approvals', t('approvals', 'Approvals')],
                  ['metrics', t('metrics', 'Metrics')],
                ]?.map(([mode, label]) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    <Icon name={getViewModeIcon(mode)} size={16} />
                    <span className="ml-1 hidden sm:inline">{label}</span>
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
                {t('lastRefresh', 'Last Refresh')}: {lastRefresh?.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { 
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
              filterOptions={filterOptions}
            />
          </div>

          {/* Dashboard Content */}
          {viewMode === 'overview' && (
            <div className="space-y-8">
              {/* Top Section: Service Catalog + Active Requests */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                  <ServiceCatalog onRequestService={handleRequestService} />
                </div>
                <div>
                  <ActiveRequestsDashboard departmentFilter={departmentFocus} serviceFilter={serviceFocus} />
                </div>
              </div>

              <div>
                <ManageEngineRequestIntake />
              </div>

              <div>
                <DepartmentServiceOwnershipPanel
                  serviceRequests={serviceRequests}
                  onOpenDepartment={handleOpenDepartment}
                  onRefresh={handleRefresh}
                />
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
              <ServiceCatalog expanded={true} onRequestService={handleRequestService} />
            </div>
          )}

          {viewMode === 'requests' && (
            <div className="space-y-8">
              <ManageEngineRequestIntake />
              <DepartmentServiceOwnershipPanel
                serviceRequests={serviceRequests}
                onOpenDepartment={handleOpenDepartment}
                onRefresh={handleRefresh}
              />
              <ActiveRequestsDashboard
                expanded={true}
                departmentFilter={departmentFocus}
                serviceFilter={serviceFocus}
              />
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
          {(slaAlert?.overdue?.length > 0 || slaAlert?.dueSoon?.length > 0) && (
            <div className="fixed bottom-6 right-6 z-40">
              <div className="bg-accent text-accent-foreground px-4 py-3 rounded-lg operations-shadow flex items-center space-x-3 max-w-sm">
                <Icon name="Clock" size={20} className="animate-pulse" />
                <div>
                  <div className="font-medium text-sm">{t('slaAlert', 'SLA Alert')}</div>
                  <div className="text-xs opacity-90">
                    {slaAlert?.overdue?.length > 0
                      ? `${slaAlert.overdue.length} ${t('requestsOverdue', 'requests are overdue')}`
                      : `${slaAlert?.dueSoon?.length} ${t('requestsApproachingDeadline', 'requests are approaching deadline')}`}
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-accent-foreground hover:bg-accent/20">
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ServiceRequestManagement;
