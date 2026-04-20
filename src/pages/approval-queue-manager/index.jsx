import { useCallback, useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import ApprovalRequestCard from './components/ApprovalRequestCard';
import RequestDetailsPanel from './components/RequestDetailsPanel';
import ApprovalHistoryPanel from './components/ApprovalHistoryPanel';
import ActionSidebar from './components/ActionSidebar';
import FilterPanel from './components/FilterPanel';
import ApprovalModal from './components/ApprovalModal';
import ManageEngineApprovalInsights from './components/ManageEngineApprovalInsights';
import { approvalsAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';
import WorkflowStatusStrip from '../../components/ui/WorkflowStatusStrip';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ApprovalQueueManager = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState('queue');
  const [showMobileDetails, setShowMobileDetails] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, request: null });

  const [filters, setFilters] = useState({
    department: 'all',
    requestType: 'all',
    urgency: 'all',
    status: 'all',
    aging: 'all',
    minValue: '',
    maxValue: '',
    requester: '',
    requestId: ''
  });

  const [approvalRequests, setApprovalRequests] = useState([]);
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  const parseCurrencyValue = (value) => {
    if (value == null) return 0;
    const parsed = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const mapApprovalRequest = useCallback((request) => {
    const createdAt = request?.createdAt ? new Date(request.createdAt) : null;
    const priorityRank = Number(request?.priority ?? 0);
    const urgency = priorityRank >= 4 ? 'critical' : priorityRank >= 3 ? 'high' : priorityRank >= 2 ? 'medium' : 'low';
    const requesterName = request?.requestedBy?.fullName || request?.requestedBy?.username || (isArabic ? 'مستخدم غير معروف' : 'Unknown requester');
    const department = request?.requestedBy?.department || (isArabic ? 'غير مخصص' : 'Unassigned');

    return {
      ...request,
      type: request?.itemType || request?.title || (isArabic ? 'طلب اعتماد' : 'Approval Request'),
      requester: requesterName,
      department,
      description: request?.description || request?.title || '',
      justification: request?.description || request?.title || '',
      submissionDate: createdAt ? createdAt.toLocaleDateString() : (isArabic ? 'غير معروف' : 'Unknown'),
      urgency,
      status: String(request?.status || 'Pending').toLowerCase(),
      value: request?.value || '--',
      slaHoursRemaining: 'N/A',
      isOverdue: false,
      history: request?.history || [],
      documents: request?.documents || [],
    };
  }, [isArabic]);

  useEffect(() => {
    approvalsAPI.getPending().then(res => {
      const mapped = (res.data || []).map(mapApprovalRequest);
      setApprovalRequests(mapped);
    }).catch(console.error).finally(() => setLoadingApprovals(false));
  }, [mapApprovalRequest]);

  useEffect(() => {
    if (!selectedRequest && approvalRequests.length > 0) {
      setSelectedRequest(approvalRequests[0]);
    }
  }, [approvalRequests, selectedRequest]);

  const stats = [
    { label: t('pendingApprovals', 'Pending Approvals'), value: approvalRequests.length.toString(), icon: 'Clock', color: 'text-warning' },
    { label: t('overdue', 'Overdue'), value: approvalRequests.filter(r => r.isOverdue).length.toString(), icon: 'AlertTriangle', color: 'text-error' },
    { label: t('totalValue', 'Total Value'), value: `${approvalRequests.reduce((sum, request) => sum + parseCurrencyValue(request?.value), 0).toLocaleString()} ${isArabic ? 'ريال' : 'SAR'}`, icon: 'Banknote', color: 'text-primary' }
  ];

  const sortOptions = [
    { value: 'urgency', label: t('sortByUrgency', 'Sort by Urgency') },
    { value: 'sla', label: t('sortBySLA', 'Sort by SLA') },
    { value: 'date', label: t('sortByDate', 'Sort by Date') },
    { value: 'value', label: t('sortByValue', 'Sort by Value') }
  ];

  const handleRequestSelect = (request) => {
    const isSelected = selectedRequests?.some(r => r?.id === request?.id);
    if (isSelected) {
      setSelectedRequests(selectedRequests?.filter(r => r?.id !== request?.id));
    } else {
      setSelectedRequests([...selectedRequests, request]);
    }
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setShowMobileDetails(true);
  };

  const handleSelectAll = () => {
    if (selectedRequests?.length === approvalRequests?.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests([...approvalRequests]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: 'all',
      requestType: 'all',
      urgency: 'all',
      status: 'all',
      aging: 'all',
      minValue: '',
      maxValue: '',
      requester: '',
      requestId: ''
    });
  };

  const openApprovalModal = (request, type) => {
    setModalState({ isOpen: true, type, request });
  };

  const closeApprovalModal = () => {
    setModalState({ isOpen: false, type: null, request: null });
  };

  const handleApprovalConfirm = async (request, comment) => {
    try {
      await approvalsAPI.update(request.id, {
        status: modalState?.type === 'approve' ? 'Approved' : 'Denied',
        approvalNotes: comment,
      });
      setApprovalRequests((prev) => prev.filter((item) => item.id !== request.id));
      setSelectedRequest(null);
      setShowMobileDetails(false);
      closeApprovalModal();
    } catch (error) {
      console.error('Failed to update approval:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests?.length === 0) return;
    try {
      await Promise.all(selectedRequests.map((request) => approvalsAPI.update(request.id, { status: 'Approved' })));
      setApprovalRequests((prev) => prev.filter((item) => !selectedRequests.some((request) => request.id === item.id)));
      setSelectedRequests([]);
    } catch (error) {
      console.error('Failed to bulk approve requests:', error);
    }
  };

  const handleBulkDeny = async () => {
    if (selectedRequests?.length === 0) return;
    try {
      await Promise.all(selectedRequests.map((request) => approvalsAPI.update(request.id, { status: 'Denied' })));
      setApprovalRequests((prev) => prev.filter((item) => !selectedRequests.some((request) => request.id === item.id)));
      setSelectedRequests([]);
    } catch (error) {
      console.error('Failed to bulk deny requests:', error);
    }
  };

  const handleExport = () => {
    const rows = filteredRequests.map((request) => ([
      request?.id || '',
      request?.type || '',
      request?.requester || '',
      request?.department || '',
      request?.status || '',
      request?.urgency || '',
      request?.value || '',
      request?.submissionDate || ''
    ]));
    downloadCsv(
      rows,
      `approval-queue-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Request ID', 'Type', 'Requester', 'Department', 'Status', 'Urgency', 'Value', 'Submitted']
    );
  };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return approvalRequests
      .filter((request) => {
        const matchesQuery = !query || [
          request?.id,
          request?.type,
          request?.requester,
          request?.department,
          request?.description,
        ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));

        const matchesDepartment = filters.department === 'all' || String(request?.department || '').toLowerCase().includes(filters.department);
        const matchesType = filters.requestType === 'all' || String(request?.type || '').toLowerCase().includes(filters.requestType);
        const matchesUrgency = filters.urgency === 'all' || String(request?.urgency || '').toLowerCase() === filters.urgency;
        const matchesStatus = filters.status === 'all' || String(request?.status || '').toLowerCase() === filters.status;
        const matchesRequester = !filters.requester || String(request?.requester || '').toLowerCase().includes(filters.requester.toLowerCase());
        const matchesRequestId = !filters.requestId || String(request?.id || '').toLowerCase().includes(filters.requestId.toLowerCase());
        const value = parseCurrencyValue(request?.value);
        const matchesMin = !filters.minValue || value >= Number(filters.minValue);
        const matchesMax = !filters.maxValue || value <= Number(filters.maxValue);

        const hoursRemaining = Number(request?.slaHoursRemaining);
        const createdAt = request?.createdAt ? new Date(request.createdAt) : null;
        const now = new Date();
        let matchesAging = true;
        switch (filters.aging) {
          case 'today':
            matchesAging = createdAt ? createdAt.toDateString() === now.toDateString() : true;
            break;
          case 'week':
            matchesAging = createdAt ? (now - createdAt) <= 7 * 24 * 60 * 60 * 1000 : true;
            break;
          case 'month':
            matchesAging = createdAt ? (now - createdAt) <= 30 * 24 * 60 * 60 * 1000 : true;
            break;
          case 'overdue':
            matchesAging = Number.isFinite(hoursRemaining) ? hoursRemaining < 0 : false;
            break;
          default:
            break;
        }

        return matchesQuery &&
          matchesDepartment &&
          matchesType &&
          matchesUrgency &&
          matchesStatus &&
          matchesRequester &&
          matchesRequestId &&
          matchesMin &&
          matchesMax &&
          matchesAging;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        }
        if (sortBy === 'value') {
          return parseCurrencyValue(b?.value) - parseCurrencyValue(a?.value);
        }
        if (sortBy === 'sla') {
          return Number(a?.slaHoursRemaining ?? 0) - Number(b?.slaHoursRemaining ?? 0);
        }

        const urgencyRank = { critical: 0, high: 1, medium: 2, low: 3 };
        return (urgencyRank[String(a?.urgency || '').toLowerCase()] ?? 99) - (urgencyRank[String(b?.urgency || '').toLowerCase()] ?? 99);
      });
  }, [approvalRequests, filters, searchQuery, sortBy]);

  const approvalCountLabel = filteredRequests.length.toString();
  const workflowSteps = [
    'Submitted',
    'Manager review',
    'Approval decision',
    'ERP fan-out',
    'Last action logged',
    'Closed'
  ];
  const activeWorkflowStep = selectedRequest
    ? Math.min(workflowSteps.length - 1, selectedRequest?.status === 'approved' ? 4 : selectedRequest?.status === 'denied' ? 2 : 1)
    : 0;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') return;
      
      if (e?.key === 'j' && selectedRequest) {
        const currentIndex = approvalRequests?.findIndex(r => r?.id === selectedRequest?.id);
        if (currentIndex < approvalRequests?.length - 1) {
          setSelectedRequest(approvalRequests?.[currentIndex + 1]);
        }
      } else if (e?.key === 'k' && selectedRequest) {
        const currentIndex = approvalRequests?.findIndex(r => r?.id === selectedRequest?.id);
        if (currentIndex > 0) {
          setSelectedRequest(approvalRequests?.[currentIndex - 1]);
        }
      } else if (e?.key === 'a' && selectedRequest) {
        openApprovalModal(selectedRequest, 'approve');
      } else if (e?.key === 'd' && selectedRequest) {
        openApprovalModal(selectedRequest, 'deny');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedRequest, approvalRequests]);

  return (
    <>
      <Helmet>
        <title>{isArabic ? 'إدارة قائمة الموافقات - WorkflowHub' : 'Approval Queue Manager - WorkflowHub'}</title>
        <meta name="description" content={isArabic ? 'تبسيط اتخاذ القرار من خلال إدارة فعّالة لقائمة الموافقات والمعالجة الجماعية ومسارات العمل حسب الدور' : 'Streamline decision-making with efficient approval queue management, bulk processing, and role-based workflows'} />
      </Helmet>
    <div className="min-h-screen bg-background">
        <Header />
        <BreadcrumbTrail />

        <main className="pt-16">
          <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    {isArabic ? 'إدارة قائمة الموافقات' : 'Approval Queue Manager'}
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {isArabic ? 'راجع طلبات الموافقة وعالجها بكفاءة' : 'Review and process approval requests efficiently'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    iconName="Filter"
                    iconPosition="left"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {t('filters', 'Filters')}
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                    onClick={handleExport}
                  >
                    {t('export', 'Export')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {stats?.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-elevation-2 transition-smooth"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon name={stat?.icon} size={20} className={stat?.color} />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                      {stat?.value}
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {stat?.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <WorkflowStatusStrip
                  title={isArabic ? 'مسار الموافقات' : 'Approval Workflow'}
                  subtitle={isArabic ? 'تتبع مسار الموافقة الحالي ومالك المراجعة والإجراء الأخير في القائمة' : 'Track the active approval route, the assigned review owner, and the latest queued action.'}
                  service={selectedRequest?.type || (isArabic ? 'قائمة الموافقات' : 'Approval queue')}
                  organization={selectedRequest?.department || (isArabic ? 'كل الأقسام' : 'All departments')}
                  mode={isArabic ? 'التوجيه أولًا للمدير' : 'Manager-first routing'}
                  lastAction={selectedRequest ? `${selectedRequest?.status || (isArabic ? 'قيد الانتظار' : 'Pending')} • ${selectedRequest?.requester || (isArabic ? 'مستخدم غير معروف' : 'Unknown requester')}` : (isArabic ? 'بانتظار طلب للمراجعة' : 'Waiting for a request to review')}
                activeStep={activeWorkflowStep}
                steps={workflowSteps}
              />
            </div>

            <div className="mb-6">
              <ManageEngineApprovalInsights />
            </div>

            {showFilters && (
              <div className="mb-6">
                <FilterPanel
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveView('queue')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  activeView === 'queue' ?'bg-primary text-primary-foreground' :'bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="List" size={16} className="inline mr-2" />
                {isArabic ? 'عرض القائمة' : 'Queue View'}
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  activeView === 'history' ?'bg-primary text-primary-foreground' :'bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="History" size={16} className="inline mr-2" />
                {isArabic ? 'السجل' : 'History'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
              {activeView === 'queue' ? (
                <>
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base md:text-lg font-semibold text-foreground">
                            {isArabic ? `قائمة الموافقات (${approvalCountLabel})` : `Approval Queue (${approvalCountLabel})`}
                          </h2>
                          <button
                            onClick={handleSelectAll}
                            className="text-xs md:text-sm text-primary hover:underline"
                          >
                            {selectedRequests?.length === approvalRequests?.length ? (isArabic ? 'إلغاء تحديد الكل' : 'Deselect All') : (isArabic ? 'تحديد الكل' : 'Select All')}
                          </button>
                        </div>
                        <Input
                          type="search"
                          placeholder={isArabic ? 'ابحث في الطلبات...' : 'Search requests...'}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e?.target?.value)}
                        />
                        <Select
                          options={sortOptions}
                          value={sortBy}
                          onChange={setSortBy}
                        />
                      </div>
                      <div className="overflow-y-auto scrollbar-custom" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                        <div className="p-4 space-y-3">
                        {loadingApprovals ? (
                          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
                            {isArabic ? 'جارٍ تحميل طلبات الموافقة...' : 'Loading approval requests...'}
                          </div>
                        ) : filteredRequests.length === 0 ? (
                          <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
                            {isArabic ? 'لا توجد طلبات موافقة تطابق الفلاتر الحالية.' : 'No approval requests match the current filters.'}
                          </div>
                        ) : filteredRequests?.map((request) => (
                          <ApprovalRequestCard
                            key={request?.id}
                            request={request}
                            onSelect={handleRequestSelect}
                            onOpen={handleRequestClick}
                            isSelected={selectedRequests?.some(r => r?.id === request?.id)}
                            onApprove={(req) => openApprovalModal(req, 'approve')}
                            onDeny={(req) => openApprovalModal(req, 'deny')}
                          />
                        ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
                    <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                      <RequestDetailsPanel
                        request={selectedRequest}
                        onApprove={(req) => openApprovalModal(req, 'approve')}
                        onDeny={(req) => openApprovalModal(req, 'deny')}
                        onClose={() => setSelectedRequest(null)}
                      />
                    </div>
                  </div>

                  <div className="hidden xl:block xl:col-span-3">
                    <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                      <ActionSidebar
                        selectedCount={selectedRequests?.length}
                        onBulkApprove={handleBulkApprove}
                        onBulkDeny={handleBulkDeny}
                        onExportSelected={handleExport}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="lg:col-span-12">
                  <div className="bg-card border border-border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                    <ApprovalHistoryPanel />
                  </div>
                </div>
              )}
            </div>

            {showMobileDetails && selectedRequest && (
              <div className="fixed inset-0 bg-background z-1200 lg:hidden">
                <div className="h-full overflow-y-auto">
                  <RequestDetailsPanel
                    request={selectedRequest}
                    onApprove={(req) => openApprovalModal(req, 'approve')}
                    onDeny={(req) => openApprovalModal(req, 'deny')}
                    onClose={() => {
                      setShowMobileDetails(false);
                      setSelectedRequest(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        <ApprovalModal
          isOpen={modalState?.isOpen}
          onClose={closeApprovalModal}
          request={modalState?.request}
          type={modalState?.type}
          onConfirm={handleApprovalConfirm}
        />
      </div>
    </>
  );
};

export default ApprovalQueueManager;
