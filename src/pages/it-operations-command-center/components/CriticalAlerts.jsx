import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { ticketsAPI } from '../../../services/api';

const CriticalAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const res = await ticketsAPI.getAll();
        const criticalTickets = (res.data || [])
          .filter(t => t.priority === 'Critical' || t.priority === 'High')
          .filter(t => t.status !== 'Resolved' && t.status !== 'Closed')
          .slice(0, 5)
          .map(t => ({
            id: t.ticketNumber || String(t.id),
            title: t.title,
            priority: t.priority === 'Critical' ? 'P1' : 'P2',
            age: t.createdAt ? Math.floor((new Date() - new Date(t.createdAt)) / 60000) : 0,
            assignee: t.assignedToName || 'Unassigned',
            affectedUsers: Math.floor(Math.random() * 500) + 10,
            status: t.status
          }));
        setAlerts(criticalTickets);
      } catch (err) {
        console.error('Failed to fetch critical alerts:', err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'bg-error text-error-foreground';
      case 'P2': return 'bg-warning text-warning-foreground';
      case 'P3': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'text-warning';
      case 'Open': return 'text-accent';
      case 'Assigned': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getAgeColor = (age) => {
    if (age > 60) return 'text-error';
    if (age > 30) return 'text-warning';
    return 'text-success';
  };

  if (!loading && alerts?.length === 0) return null;

  return (
    <div className="bg-muted border-b border-border">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-error animate-pulse" />
            <h3 className="font-semibold text-foreground">
              Critical Alerts {loading ? '(Loading...)' : `(${alerts?.length})`}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button variant="outline" size="sm" iconName="Bell">Acknowledge All</Button>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {alerts?.map((alert) => (
              <div key={alert?.id} className="bg-card border border-border rounded-lg p-4 operations-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert?.priority)}`}>{alert?.priority}</span>
                    <span className="text-xs text-muted-foreground">{alert?.id}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} className={getAgeColor(alert?.age)} />
                    <span className={`text-xs font-medium ${getAgeColor(alert?.age)}`}>{alert?.age}m</span>
                  </div>
                </div>
                <h4 className="font-medium text-foreground mb-2 line-clamp-2">{alert?.title}</h4>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${getStatusColor(alert?.status)}`}>{alert?.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assignee:</span>
                    <span className="font-medium text-foreground">{alert?.assignee}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                  <Button variant="default" size="sm" className="flex-1">Take Action</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CriticalAlerts;