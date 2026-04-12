import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import approvalService from '../../../services/approvalService';

const ApprovalWorkflowCards = ({ expanded = false }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const data = await approvalService.getPending();
        const normalizePriority = (priority) => {
          const rawValue = typeof priority === 'object' && priority !== null
            ? (priority?.value ?? priority?.level ?? priority?.name ?? '')
            : priority;
          const value = String(rawValue ?? '').trim();
          if (!value) return 'medium';
          if (value === '1') return 'critical';
          if (value === '2') return 'high';
          if (value === '3') return 'medium';
          return value.toLowerCase();
        };
        const mappedApprovals = data?.map(app => ({
          id: app?.id || `APP-${Math.random()}`,
          requestId: app?.referenceId || `REQ-${app?.id || '000'}`,
          service: app?.title || app?.itemType || 'Service Request',
          serviceIcon: 'Package',
          requester: app?.requestedBy?.fullName || app?.requestedBy?.username || 'Unknown',
          requesterDepartment: app?.requestedBy?.department || 'IT',
          requestedDate: app?.createdAt || new Date().toISOString(),
          priority: normalizePriority(app?.priority),
          cost: app?.cost || '-',
          approvalType: String(app?.itemType || 'general').trim().toLowerCase(),
          approver: app?.assignedTo?.fullName || app?.assignedTo?.username || 'Approver',
          approverRole: app?.assignedTo?.role || 'Manager',
          description: app?.description || 'Approval requested',
          justification: app?.justification || 'Required for business',
          currentStage: Number(app?.currentStep || 1),
          totalStages: Number(app?.totalSteps || 1),
          stages: app?.steps || [
            { name: 'Approval Step', approver: app?.assignedTo?.fullName || app?.assignedTo?.username || 'Approver', status: 'pending' }
          ]
        }));
        setApprovals(mappedApprovals || []);
      } catch (error) {
        console.error('Failed to fetch approvals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovals();
  }, []);

  const handleApprovalAction = async (approvalId, action) => {
    setActionLoading(prev => ({ ...prev, [`${approvalId}-${action}`]: true }));
    
    try {
      await approvalService.update(approvalId, { status: action === 'approve' ? 'Approved' : 'Rejected' });
      setApprovals(prev => prev?.filter(approval => approval?.id !== approvalId));
    } catch (error) {
      console.error(`Failed to ${action} approval:`, error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${approvalId}-${action}`]: false }));
    }
  };

  const getPriorityColor = (priority) => {
    const normalized = String(priority || '').trim().toLowerCase();
    switch (normalized) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getApprovalTypeIcon = (type) => {
    switch (type) {
      case 'budget': return 'Banknote';
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
