import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { serviceRequestsAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ActiveRequestsDashboard = ({ expanded = false }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await serviceRequestsAPI.getAll();
        const normalize = (value) => String(value || '').trim().toLowerCase();
        const mapStatus = (status) => {
          const normalized = normalize(status);
          if (['fulfilled', 'resolved', 'closed', 'completed'].includes(normalized)) return 'completed';
          if (normalized === 'in progress') return 'in_progress';
          if (normalized === 'pending approval') return 'pending_approval';
          if (normalized === 'rejected') return 'rejected';
          return normalized || 'open';
        };

        const mapped = (res.data || []).map(r => ({
          id: r.requestNumber || `SR-${r.id}`,
          service: r.catalogItemName || r.serviceType || r.title,
          serviceIcon: 'ClipboardList',
          requester: r.requestedBy?.fullName || r.requestedBy?.username || (r.requestedById ? `User #${r.requestedById}` : 'Unassigned'),
          department: r.requestedBy?.department || r.requestedByDepartment || 'Unknown',
          status: mapStatus(r.status || 'Open'),
          priority: normalize(r.priority || 'Medium'),
          createdAt: r.createdAt,
          dueDate: r.slaDueDate || r.dueDate || r.estimatedCompletionDate || new Date(new Date().getTime() + 48 * 3600000).toISOString(),
          progress: mapStatus(r.status) === 'completed' ? 100 : mapStatus(r.status) === 'in_progress' ? 50 : mapStatus(r.status) === 'pending_approval' ? 25 : 10,
          currentStage: r.workflowStage || r.status || 'Submission',
          assignee: r.assignedTo?.fullName || r.assignedTo?.username || (r.assignedToId ? `User #${r.assignedToId}` : 'Unassigned'),
          milestones: [
            { name: 'Request Submitted', completed: true, date: r.createdAt?.split('T')[0] },
            { name: 'Under Review', completed: mapStatus(r.status) !== 'open', date: null },
            { name: 'Fulfilled', completed: mapStatus(r.status) === 'completed', date: r.completionDate?.split('T')[0] || null }
          ]
        }));
        setRequests(mapped);
      } catch (err) {
        console.error('Failed to fetch service requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);



  const statusOptions = [
    { value: 'all', label: t('allRequests', 'All Requests'), count: requests?.length },
    { value: 'pending_approval', label: t('pendingApproval', 'Pending Approval'), count: requests?.filter(r => r?.status === 'pending_approval')?.length },
    { value: 'in_progress', label: t('inProgress', 'In Progress'), count: requests?.filter(r => r?.status === 'in_progress')?.length },
    { value: 'urgent', label: t('urgent', 'Urgent'), count: requests?.filter(r => r?.priority === 'critical' || r?.status === 'urgent')?.length },
    { value: 'completed', label: t('completed', 'Completed'), count: requests?.filter(r => r?.status === 'completed')?.length },
    { value: 'rejected', label: t('rejected', 'Rejected'), count: requests?.filter(r => r?.status === 'rejected')?.length }
  ];

  const filteredRequests = requests?.filter(request => 
    selectedStatus === 'all' || request?.status === selectedStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/20 dark:text-success';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'pending_approval': return 'bg-warning/10 text-warning border-warning/20';
      case 'urgent': return 'bg-error/10 text-error border-error/20';
      case 'rejected': return 'bg-muted text-foreground border-border';
      default: return 'bg-muted text-foreground border-border';
    }
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_approval': return t('pendingApproval', 'Pending Approval');
      case 'in_progress': return t('inProgress', 'In Progress');
      case 'completed': return t('completed', 'Completed');
      case 'rejected': return t('rejected', 'Rejected');
      case 'urgent': return t('urgent', 'Urgent');
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 0) return t('overdue', 'Overdue');
    if (diffHours < 24) return `${diffHours}h ${t('remaining', 'remaining')}`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d ${t('remaining', 'remaining')}`;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border operations-shadow p-6">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-8 bg-muted rounded w-24"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)]?.map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
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
          <h2 className="text-xl font-semibold text-foreground">{t('activeRequests', 'Active Requests')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredRequests?.length} {t('requestsWithTracking', 'requests with real-time tracking')}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Filter" size={16} />
          <span className="ml-2">{t('filter', 'Filter')}</span>
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions?.map(option => (
          <Button
            key={option?.value}
            variant={selectedStatus === option?.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(option?.value)}
            className="text-xs"
          >
            {option?.label}
            <span className="ml-1 opacity-70">({option?.count})</span>
          </Button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests?.map(request => (
          <div
            key={request?.id}
            className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Icon name={request?.serviceIcon} size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-foreground">{request?.id}</h3>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(request?.priority)}`}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">{request?.service} • {request?.requester}</p>
                  <p className="text-xs text-muted-foreground">{request?.department}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request?.status)}`}>
                  {getStatusLabel(request?.status)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/fulfillment-center?request=${encodeURIComponent(request?.id || request?.requestNumber || '')}`)}
                >
                  <Icon name="ExternalLink" size={14} />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t('progress', 'Progress')}: {request?.progress}%</span>
                <span className="text-xs text-muted-foreground">{getTimeRemaining(request?.dueDate)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${request?.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Current Stage and Assignee */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">{t('currentStage', 'Current Stage')}:</span>
                <span className="font-medium text-foreground">{request?.currentStage}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="User" size={14} className="text-muted-foreground" />
                <span className="text-muted-foreground">{request?.assignee}</span>
              </div>
            </div>

            {/* Expandable Milestones */}
            {expanded && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">{t('milestones', 'Milestones')}</h4>
                <div className="space-y-2">
                  {request?.milestones?.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        milestone?.completed 
                        ? 'bg-success text-success-foreground' :'bg-muted text-muted-foreground'
                      }`}>
                        {milestone?.completed && <Icon name="Check" size={10} />}
                      </div>
                      <span className={`text-sm ${
                        milestone?.completed 
                          ? 'text-foreground line-through' 
                          : 'text-muted-foreground'
                      }`}>
                        {milestone?.name}
                      </span>
                      {milestone?.date && (
                        <span className="text-xs text-muted-foreground">
                          ({formatDate(milestone?.date)})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRequests?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="ClipboardList" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('noActiveRequests', 'No active requests')}</h3>
          <p className="text-muted-foreground">
            {t('allRequestsProcessed', 'All requests in this category have been processed')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveRequestsDashboard;
