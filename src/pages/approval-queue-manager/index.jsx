import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import ApprovalRequestCard from './components/ApprovalRequestCard';
import RequestDetailsPanel from './components/RequestDetailsPanel';
import ApprovalHistoryPanel from './components/ApprovalHistoryPanel';
import ActionSidebar from './components/ActionSidebar';
import FilterPanel from './components/FilterPanel';
import ApprovalModal from './components/ApprovalModal';
import { approvalsAPI } from '../../services/api';

const ApprovalQueueManager = () => {
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

  useEffect(() => {
    approvalsAPI.getPending().then(res => {
      setApprovalRequests(res.data || []);
    }).catch(console.error).finally(() => setLoadingApprovals(false));
  }, []);

  const stats = [
    { label: 'Pending Approvals', value: approvalRequests.length.toString(), icon: 'Clock', color: 'text-warning' },
    { label: 'Overdue', value: approvalRequests.filter(r => r.isOverdue).length.toString(), icon: 'AlertTriangle', color: 'text-error' },
    { label: 'Approved Today', value: '0', icon: 'CheckCircle', color: 'text-success' },
    { label: 'Total Value', value: '--', icon: 'DollarSign', color: 'text-primary' }
  ];

  const sortOptions = [
    { value: 'urgency', label: 'Sort by Urgency' },
    { value: 'sla', label: 'Sort by SLA' },
    { value: 'date', label: 'Sort by Date' },
    { value: 'value', label: 'Sort by Value' }
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

  const handleApprovalConfirm = (request, comment) => {
    console.log(`${modalState?.type === 'approve' ? 'Approved' : 'Denied'} request:`, request?.id, 'Comment:', comment);
    closeApprovalModal();
    setSelectedRequest(null);
    setShowMobileDetails(false);
  };

  const handleBulkApprove = () => {
    if (selectedRequests?.length === 0) return;
    console.log('Bulk approve:', selectedRequests?.map(r => r?.id));
    setSelectedRequests([]);
  };

  const handleBulkDeny = () => {
    if (selectedRequests?.length === 0) return;
    console.log('Bulk deny:', selectedRequests?.map(r => r?.id));
    setSelectedRequests([]);
  };

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
        <title>Approval Queue Manager - WorkflowHub</title>
        <meta name="description" content="Streamline decision-making with efficient approval queue management, bulk processing, and role-based workflows" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-16">
          <div className="max-w-[1920px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    Approval Queue Manager
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Review and process approval requests efficiently
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    iconName="Filter"
                    iconPosition="left"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filters
                  </Button>
                  <Button
                    variant="outline"
                    iconName="Download"
                    iconPosition="left"
                  >
                    Export
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
                Queue View
              </button>
              <button
                onClick={() => setActiveView('history')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  activeView === 'history' ?'bg-primary text-primary-foreground' :'bg-card text-foreground hover:bg-muted'
                }`}
              >
                <Icon name="History" size={16} className="inline mr-2" />
                History
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
                            Approval Queue ({approvalRequests?.length})
                          </h2>
                          <button
                            onClick={handleSelectAll}
                            className="text-xs md:text-sm text-primary hover:underline"
                          >
                            {selectedRequests?.length === approvalRequests?.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <Input
                          type="search"
                          placeholder="Search requests..."
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
                          {approvalRequests?.map((request) => (
                            <ApprovalRequestCard
                              key={request?.id}
                              request={request}
                              onSelect={handleRequestSelect}
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