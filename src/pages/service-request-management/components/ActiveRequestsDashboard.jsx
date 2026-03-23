import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { serviceRequestsAPI } from '../../../services/api';

const ActiveRequestsDashboard = ({ expanded = false }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await serviceRequestsAPI.getAll();
        const mapped = (res.data || []).map(r => ({
          id: r.requestNumber || `SR-${r.id}`,
          service: r.serviceType || r.title,
          serviceIcon: 'ClipboardList',
          requester: r.requestedByName || 'Unknown',
          department: r.department || 'IT Support',
          status: (r.status || 'Open').toLowerCase().replace(/\s+/g, '_'),
          priority: (r.priority || 'Medium').toLowerCase(),
          createdAt: r.createdAt,
          dueDate: r.dueDate || r.estimatedCompletionDate || new Date(new Date().getTime() + 48 * 3600000).toISOString(),
          progress: r.status === 'Fulfilled' ? 100 : r.status === 'In Progress' ? 50 : r.status === 'Pending Approval' ? 25 : 10,
          currentStage: r.status || 'Submitted',
          assignee: r.assignedToName || 'Unassigned',
          milestones: [
            { name: 'Request Submitted', completed: true, date: r.createdAt?.split('T')[0] },
            { name: 'Under Review', completed: r.status !== 'Open', date: null },
            { name: 'Fulfilled', completed: r.status === 'Fulfilled', date: r.completionDate?.split('T')[0] || null }
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
    { value: 'all', label: 'All Requests', count: requests?.length },
    { value: 'pending_approval', label: 'Pending Approval', count: requests?.filter(r => r?.status === 'pending_approval')?.length },
    { value: 'in_progress', label: 'In Progress', count: requests?.filter(r => r?.status === 'in_progress')?.length },
    { value: 'urgent', label: 'Urgent', count: requests?.filter(r => r?.status === 'urgent')?.length },
    { value: 'completed', label: 'Completed', count: requests?.filter(r => r?.status === 'completed')?.length },
    { value: 'rejected', label: 'Rejected', count: requests?.filter(r => r?.status === 'rejected')?.length }
  ];

  const filteredRequests = requests?.filter(request => 
    selectedStatus === 'all' || request?.status === selectedStatus
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'pending_approval': return 'Pending Approval';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'rejected': return 'Rejected';
      case 'urgent': return 'Urgent';
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
    
    if (diffHours < 0) return 'Overdue';
    if (diffHours < 24) return `${diffHours}h remaining`;
    
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays}d remaining`;
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
          <h2 className="text-xl font-semibold text-foreground">Active Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredRequests?.length} requests with real-time tracking
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Icon name="Filter" size={16} />
          <span className="ml-2">Filter</span>
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
            className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
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
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(request?.status)}`}>
                  {getStatusLabel(request?.status)}
                </span>
                <Button variant="ghost" size="sm">
                  <Icon name="ExternalLink" size={14} />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Progress: {request?.progress}%</span>
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
                <span className="text-muted-foreground">Current Stage:</span>
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
                <h4 className="text-sm font-medium text-foreground mb-3">Milestones</h4>
                <div className="space-y-2">
                  {request?.milestones?.map((milestone, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        milestone?.completed 
                          ? 'bg-green-500 text-white' :'bg-muted text-muted-foreground'
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
          <h3 className="text-lg font-medium text-foreground mb-2">No active requests</h3>
          <p className="text-muted-foreground">
            All requests in this category have been processed
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveRequestsDashboard;