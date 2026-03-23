import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApprovalWorkflowCards = ({ expanded = false }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    // Mock approval workflow data
    const mockApprovals = [
      {
        id: 'APP-001',
        requestId: 'REQ-001235',
        service: 'Software License - Adobe Creative Suite',
        serviceIcon: 'Package',
        requester: 'Mike Chen',
        requesterDepartment: 'Marketing',
        requestedDate: '2025-01-19T14:15:00Z',
        priority: 'medium',
        cost: '$299/month',
        approvalType: 'budget',
        approver: 'David Wilson',
        approverRole: 'Marketing Manager',
        description: 'Request for Adobe Creative Suite license for design team expansion',
        justification: 'New marketing campaign requires advanced design capabilities',
        currentStage: 1,
        totalStages: 3,
        stages: [
          { name: 'Manager Approval', approver: 'David Wilson', status: 'pending' },
          { name: 'Budget Approval', approver: 'Finance Team', status: 'waiting' },
          { name: 'IT Security Review', approver: 'Security Team', status: 'waiting' }
        ]
      },
      {
        id: 'APP-002',
        requestId: 'REQ-001240',
        service: 'New Employee Setup - Senior Developer',
        serviceIcon: 'UserPlus',
        requester: 'Sarah Johnson',
        requesterDepartment: 'Engineering',
        requestedDate: '2025-01-20T09:00:00Z',
        priority: 'high',
        cost: '$1,200',
        approvalType: 'hiring',
        approver: 'Sarah Johnson',
        approverRole: 'Engineering Manager',
        description: 'Complete setup for new senior developer starting next week',
        justification: 'Critical hire for upcoming project deadline',
        currentStage: 2,
        totalStages: 2,
        stages: [
          { name: 'Manager Approval', approver: 'Sarah Johnson', status: 'approved' },
          { name: 'HR Verification', approver: 'Lisa Wang', status: 'pending' }
        ]
      },
      {
        id: 'APP-003',
        requestId: 'REQ-001241',
        service: 'Hardware Request - MacBook Pro',
        serviceIcon: 'Monitor',
        requester: 'Tom Anderson',
        requesterDepartment: 'Design',
        requestedDate: '2025-01-20T11:30:00Z',
        priority: 'medium',
        cost: '$2,499',
        approvalType: 'procurement',
        approver: 'Michael Brown',
        approverRole: 'Design Director',
        description: 'MacBook Pro 16" for video editing and design work',
        justification: 'Current laptop cannot handle 4K video editing requirements',
        currentStage: 1,
        totalStages: 3,
        stages: [
          { name: 'Manager Approval', approver: 'Michael Brown', status: 'pending' },
          { name: 'Budget Approval', approver: 'Finance Team', status: 'waiting' },
          { name: 'Procurement Review', approver: 'IT Operations', status: 'waiting' }
        ]
      },
      {
        id: 'APP-004',
        requestId: 'REQ-001242',
        service: 'System Access - Production Database',
        serviceIcon: 'Key',
        requester: 'Alex Rodriguez',
        requesterDepartment: 'Engineering',
        requestedDate: '2025-01-21T08:00:00Z',
        priority: 'critical',
        cost: 'Free',
        approvalType: 'security',
        approver: 'Security Team',
        approverRole: 'Security Manager',
        description: 'Production database read access for debugging critical issue',
        justification: 'Urgent production issue requires database investigation',
        currentStage: 1,
        totalStages: 2,
        stages: [
          { name: 'Security Review', approver: 'Security Team', status: 'pending' },
          { name: 'DBA Approval', approver: 'Database Team', status: 'waiting' }
        ]
      }
    ];

    setTimeout(() => {
      setApprovals(mockApprovals);
      setLoading(false);
    }, 700);
  }, []);

  const handleApprovalAction = async (approvalId, action) => {
    setActionLoading(prev => ({ ...prev, [`${approvalId}-${action}`]: true }));
    
    // Simulate API call
    setTimeout(() => {
      console.log(`${action} approval ${approvalId}`);
      setActionLoading(prev => ({ ...prev, [`${approvalId}-${action}`]: false }));
      
      // Update approval status
      setApprovals(prev => prev?.filter(approval => approval?.id !== approvalId));
      
      // In a real app, this would update the backend and refresh data
    }, 1500);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getApprovalTypeIcon = (type) => {
    switch (type) {
      case 'budget': return 'DollarSign';
      case 'hiring': return 'UserPlus';
      case 'procurement': return 'Package';
      case 'security': return 'Shield';
      default: return 'CheckSquare';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)]?.map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Approval Workflow</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {approvals?.length} requests pending approval
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="Filter" size={16} />
            <span className="ml-2">Filter</span>
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>

      {/* Approval Cards */}
      <div className={`grid grid-cols-1 ${expanded ? 'md:grid-cols-1 lg:grid-cols-2' : 'md:grid-cols-2'} gap-4`}>
        {approvals?.map(approval => (
          <div
            key={approval?.id}
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={approval?.serviceIcon} size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{approval?.requestId}</span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(approval?.priority)}`}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(approval?.requestedDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 text-primary p-1 rounded">
                  <Icon name={getApprovalTypeIcon(approval?.approvalType)} size={14} />
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {approval?.approvalType}
                </span>
              </div>
            </div>

            {/* Service Info */}
            <div className="mb-4">
              <h3 className="font-medium text-foreground mb-1">{approval?.service}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {approval?.description}
              </p>
            </div>

            {/* Request Details */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requester:</span>
                <span className="font-medium text-foreground">
                  {approval?.requester} ({approval?.requesterDepartment})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cost:</span>
                <span className="font-medium text-foreground">{approval?.cost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Justification:</span>
                <span className="text-sm text-foreground line-clamp-1">{approval?.justification}</span>
              </div>
            </div>

            {/* Approval Stages */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  Stage {approval?.currentStage} of {approval?.totalStages}
                </span>
                <span className="text-xs text-muted-foreground">
                  Progress: {Math.round((approval?.currentStage / approval?.totalStages) * 100)}%
                </span>
              </div>
              
              <div className="space-y-2">
                {approval?.stages?.map((stage, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      stage?.status === 'approved' ?'bg-green-500 text-white'
                        : stage?.status === 'pending' ?'bg-yellow-500 text-white' :'bg-muted text-muted-foreground'
                    }`}>
                      {stage?.status === 'approved' && <Icon name="Check" size={10} />}
                      {stage?.status === 'pending' && <Icon name="Clock" size={10} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-xs font-medium text-foreground">{stage?.name}</span>
                        <span className="text-xs text-muted-foreground">{stage?.approver}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => handleApprovalAction(approval?.id, 'approve')}
                disabled={actionLoading?.[`${approval?.id}-approve`]}
              >
                {actionLoading?.[`${approval?.id}-approve`] ? (
                  <>
                    <div className="animate-spin w-3 h-3 border border-green-600 border-t-transparent rounded-full"></div>
                    <span className="ml-2">Approving...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={14} />
                    <span className="ml-2">Approve</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => handleApprovalAction(approval?.id, 'reject')}
                disabled={actionLoading?.[`${approval?.id}-reject`]}
              >
                {actionLoading?.[`${approval?.id}-reject`] ? (
                  <>
                    <div className="animate-spin w-3 h-3 border border-red-600 border-t-transparent rounded-full"></div>
                    <span className="ml-2">Rejecting...</span>
                  </>
                ) : (
                  <>
                    <Icon name="X" size={14} />
                    <span className="ml-2">Reject</span>
                  </>
                )}
              </Button>
              
              <Button variant="ghost" size="sm">
                <Icon name="MessageSquare" size={14} />
                <span className="ml-2">Comment</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {approvals?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="CheckSquare" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No pending approvals</h3>
          <p className="text-muted-foreground">
            All requests have been processed or are waiting for other approvers
          </p>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowCards;