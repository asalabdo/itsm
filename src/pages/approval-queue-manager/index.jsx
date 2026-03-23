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

  const approvalRequests = [
    {
      id: 'APR-2850',
      type: 'Software License Purchase',
      requester: 'Sarah Johnson',
      department: 'Information Technology',
      submissionDate: '01/07/2026',
      slaHoursRemaining: 2,
      urgency: 'critical',
      status: 'pending',
      value: '$2,500',
      description: 'Request for Adobe Creative Cloud licenses for the design team. Current licenses expire on 01/15/2026 and renewal is critical for ongoing projects.',
      justification: 'Essential for maintaining design team productivity. Current projects require uninterrupted access to Adobe tools. Budget approved in Q1 allocation.',
      documents: [
        { id: 1, name: 'License_Quote.pdf', size: '245 KB', uploadDate: '01/06/2026' },
        { id: 2, name: 'Budget_Approval.pdf', size: '180 KB', uploadDate: '01/06/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'Sarah Johnson', timestamp: '01/07/2026 08:30 AM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/07/2026 08:31 AM', icon: 'UserPlus' },
        { action: 'Documents uploaded', user: 'Sarah Johnson', timestamp: '01/07/2026 09:15 AM', icon: 'Paperclip' }
      ]
    },
    {
      id: 'APR-2849',
      type: 'Equipment Procurement',
      requester: 'Michael Chen',
      department: 'Operations',
      submissionDate: '01/06/2026',
      slaHoursRemaining: 8,
      urgency: 'high',
      status: 'pending',
      value: '$15,000',
      description: 'Procurement of 10 new workstations for the operations team expansion. Specifications include Intel i7 processors, 32GB RAM, and dual monitors.',
      justification: 'Supporting team expansion approved in annual planning. New hires starting 01/20/2026 require fully equipped workstations. Vendor quote attached with competitive pricing.',
      documents: [
        { id: 1, name: 'Equipment_Specifications.pdf', size: '320 KB', uploadDate: '01/06/2026' },
        { id: 2, name: 'Vendor_Quote.pdf', size: '280 KB', uploadDate: '01/06/2026' },
        { id: 3, name: 'Comparison_Analysis.xlsx', size: '156 KB', uploadDate: '01/06/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'Michael Chen', timestamp: '01/06/2026 02:45 PM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/06/2026 02:46 PM', icon: 'UserPlus' }
      ]
    },
    {
      id: 'APR-2848',
      type: 'Travel Authorization',
      requester: 'Emily Rodriguez',
      department: 'Marketing',
      submissionDate: '01/06/2026',
      slaHoursRemaining: 16,
      urgency: 'medium',
      status: 'pending',
      value: '$3,200',
      description: 'Travel authorization for attending Marketing Summit 2026 in San Francisco. Conference dates: 02/15/2026 to 02/18/2026. Includes airfare, hotel, and conference registration.',
      justification: 'Industry-leading conference with key sessions on digital marketing trends. Networking opportunities with potential partners. Knowledge transfer to team upon return.',
      documents: [
        { id: 1, name: 'Conference_Agenda.pdf', size: '420 KB', uploadDate: '01/06/2026' },
        { id: 2, name: 'Travel_Estimate.pdf', size: '195 KB', uploadDate: '01/06/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'Emily Rodriguez', timestamp: '01/06/2026 10:20 AM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/06/2026 10:21 AM', icon: 'UserPlus' }
      ]
    },
    {
      id: 'APR-2847',
      type: 'Budget Reallocation',
      requester: 'David Kim',
      department: 'Finance',
      submissionDate: '01/05/2026',
      slaHoursRemaining: 24,
      urgency: 'medium',
      status: 'pending',
      value: '$8,500',
      description: 'Request to reallocate budget from Q1 training to Q1 software tools. Training postponed to Q2 due to scheduling conflicts. Funds needed for critical software upgrades.',
      justification: 'Training sessions rescheduled to Q2 per department heads agreement. Software upgrades cannot be delayed without impacting operations. Budget neutral reallocation.',
      documents: [
        { id: 1, name: 'Budget_Analysis.xlsx', size: '245 KB', uploadDate: '01/05/2026' },
        { id: 2, name: 'Department_Approval.pdf', size: '180 KB', uploadDate: '01/05/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'David Kim', timestamp: '01/05/2026 03:30 PM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/05/2026 03:31 PM', icon: 'UserPlus' },
        { action: 'Comment added', user: 'David Kim', timestamp: '01/06/2026 09:00 AM', icon: 'MessageSquare', comment: 'Added department head approval documentation' }
      ]
    },
    {
      id: 'APR-2846',
      type: 'Contractor Hiring',
      requester: 'Lisa Anderson',
      department: 'Human Resources',
      submissionDate: '01/05/2026',
      slaHoursRemaining: -4,
      urgency: 'high',
      status: 'pending',
      value: '$12,000',
      description: 'Hiring approval for 3-month contract developer to support Q1 project deliverables. Specialized skills in React and Node.js required. Start date: 01/15/2026.',
      justification: 'Critical project milestone at risk without additional development resources. Internal team at capacity. Contractor with proven track record identified. Fixed-term engagement.',
      documents: [
        { id: 1, name: 'Contractor_Resume.pdf', size: '380 KB', uploadDate: '01/05/2026' },
        { id: 2, name: 'Project_Timeline.pdf', size: '290 KB', uploadDate: '01/05/2026' },
        { id: 3, name: 'Rate_Comparison.xlsx', size: '145 KB', uploadDate: '01/05/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'Lisa Anderson', timestamp: '01/05/2026 11:15 AM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/05/2026 11:16 AM', icon: 'UserPlus' },
        { action: 'SLA breach notification', user: 'System', timestamp: '01/07/2026 03:16 AM', icon: 'AlertTriangle' }
      ]
    },
    {
      id: 'APR-2845',
      type: 'Asset Transfer',
      requester: 'Robert Martinez',
      department: 'Operations',
      submissionDate: '01/04/2026',
      slaHoursRemaining: 32,
      urgency: 'low',
      status: 'pending',
      value: '$5,200',
      description: 'Transfer of 5 laptops from Operations to Marketing department. Assets in good condition, meeting Marketing team requirements. Transfer includes warranty and licenses.',
      justification: 'Operations team upgraded to new equipment. Marketing team expansion requires additional laptops. Cost-effective internal transfer versus new purchase.',
      documents: [
        { id: 1, name: 'Asset_Inventory.xlsx', size: '210 KB', uploadDate: '01/04/2026' },
        { id: 2, name: 'Condition_Report.pdf', size: '340 KB', uploadDate: '01/04/2026' }
      ],
      history: [
        { action: 'Request submitted', user: 'Robert Martinez', timestamp: '01/04/2026 02:00 PM', icon: 'FileText' },
        { action: 'Assigned to approver', user: 'System', timestamp: '01/04/2026 02:01 PM', icon: 'UserPlus' }
      ]
    }
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

  const stats = [
    { label: 'Pending Approvals', value: '6', icon: 'Clock', color: 'text-warning' },
    { label: 'Overdue', value: '1', icon: 'AlertTriangle', color: 'text-error' },
    { label: 'Approved Today', value: '4', icon: 'CheckCircle', color: 'text-success' },
    { label: 'Total Value', value: '$46.4K', icon: 'DollarSign', color: 'text-primary' }
  ];

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