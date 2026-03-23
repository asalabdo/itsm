import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const TimelineVisualization = ({ incident }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  const timelineEvents = [
    {
      id: 1,
      type: 'created',
      title: 'Incident Created',
      description: `Incident ${incident?.id} created by system auto-detection`,
      timestamp: new Date(incident.createdAt),
      user: 'System',
      icon: 'Plus',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500'
    },
    {
      id: 2,
      type: 'assigned',
      title: 'Incident Assigned',
      description: `Assigned to ${incident?.assignedTo} in ${incident?.category} team`,
      timestamp: new Date(incident.createdAt.getTime() + 15 * 60 * 1000),
      user: 'Auto-Assignment',
      icon: 'UserPlus',
      color: 'text-warning bg-warning/10 border-warning'
    },
    {
      id: 3,
      type: 'acknowledged',
      title: 'Incident Acknowledged',
      description: 'Initial assessment completed. Investigating root cause.',
      timestamp: new Date(incident.createdAt.getTime() + 45 * 60 * 1000),
      user: incident?.assignedTo,
      icon: 'Eye',
      color: 'text-primary bg-primary/10 border-primary'
    },
    {
      id: 4,
      type: 'investigation',
      title: 'Investigation Update',
      description: 'Identified potential database connection pool exhaustion. Checking server logs.',
      timestamp: new Date(incident.createdAt.getTime() + 90 * 60 * 1000),
      user: incident?.assignedTo,
      icon: 'Search',
      color: 'text-accent bg-accent/10 border-accent'
    },
    {
      id: 5,
      type: 'escalation',
      title: 'Escalated to Level 2',
      description: 'Escalated to database team for advanced troubleshooting.',
      timestamp: new Date(incident.createdAt.getTime() + 120 * 60 * 1000),
      user: incident?.assignedTo,
      icon: 'ArrowUp',
      color: 'text-error bg-error/10 border-error'
    },
    {
      id: 6,
      type: 'progress',
      title: 'Work in Progress',
      description: 'Database team investigating connection pool configuration. Temporary workaround implemented.',
      timestamp: new Date(incident.createdAt.getTime() + 150 * 60 * 1000),
      user: 'Sarah Johnson',
      icon: 'Settings',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500'
    }
  ];

  const [events, setEvents] = useState(timelineEvents);

  const handleAddUpdate = () => {
    if (newUpdate?.trim()) {
      const newEvent = {
        id: events?.length + 1,
        type: 'update',
        title: 'Status Update',
        description: newUpdate,
        timestamp: new Date(),
        user: incident?.assignedTo,
        icon: 'MessageSquare',
        color: 'text-success bg-success/10 border-success'
      };
      
      setEvents([...events, newEvent]);
      setNewUpdate('');
      setShowAddUpdate(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now?.getTime() - timestamp?.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      created: 'Created',
      assigned: 'Assigned',
      acknowledged: 'Acknowledged',
      investigation: 'Investigating',
      escalation: 'Escalated',
      progress: 'In Progress',
      update: 'Updated',
      resolved: 'Resolved',
      closed: 'Closed'
    };
    return labels?.[type] || type;
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Clock" size={20} />
            <span>Incident Timeline</span>
          </h3>
          <button
            onClick={() => setShowAddUpdate(!showAddUpdate)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={14} />
            <span>Add Update</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        {/* Add Update Form */}
        {showAddUpdate && (
          <div className="mb-6 bg-muted/30 rounded-lg p-4">
            <div className="space-y-3">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e?.target?.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                rows={3}
                placeholder="Add a status update, findings, or next steps..."
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddUpdate(false)}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUpdate}
                  className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Events */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            {events?.map((event, index) => (
              <div key={event?.id} className="relative flex items-start space-x-4">
                {/* Timeline Node */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${event?.color}`}>
                  <Icon name={event?.icon} size={20} />
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{event?.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${event?.color?.replace('bg-', 'bg-')?.replace('/10', '/20')}`}>
                            {getEventTypeLabel(event?.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">by {event?.user}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-foreground">
                          {formatTimestamp(event?.timestamp)}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {event?.timestamp?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed">
                      {event?.description}
                    </p>

                    {/* Action Buttons for certain events */}
                    {(event?.type === 'investigation' || event?.type === 'progress') && (
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-border">
                        <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-background hover:bg-muted rounded transition-colors">
                          <Icon name="MessageSquare" size={12} />
                          <span>Comment</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-background hover:bg-muted rounded transition-colors">
                          <Icon name="ThumbsUp" size={12} />
                          <span>Helpful</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 text-xs bg-background hover:bg-muted rounded transition-colors">
                          <Icon name="Share2" size={12} />
                          <span>Share</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Summary */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">{events?.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {Math.floor((Date.now() - incident?.createdAt?.getTime()) / (1000 * 60 * 60))}h
              </div>
              <div className="text-xs text-muted-foreground">Time Active</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {events?.filter(e => e?.user !== 'System' && e?.user !== 'Auto-Assignment')?.length}
              </div>
              <div className="text-xs text-muted-foreground">Manual Updates</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {events?.filter(e => e?.type === 'escalation')?.length}
              </div>
              <div className="text-xs text-muted-foreground">Escalations</div>
            </div>
          </div>
        </div>

        {/* Communication Timeline */}
        <div className="mt-6 bg-accent/10 border border-accent/20 rounded-lg p-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center space-x-2">
            <Icon name="MessageSquare" size={16} />
            <span>Communication Log</span>
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User notified via email</span>
              <span className="text-xs text-muted-foreground">45m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Manager escalation sent</span>
              <span className="text-xs text-muted-foreground">30m ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status page updated</span>
              <span className="text-xs text-muted-foreground">15m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineVisualization;