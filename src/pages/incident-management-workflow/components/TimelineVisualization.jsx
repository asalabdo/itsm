import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { ticketsAPI } from '../../../services/api';

const TimelineVisualization = ({ incident }) => {
  const [newUpdate, setNewUpdate] = useState('');
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  // Merge activities and comments into a single timeline
  const getTimelineEvents = () => {
    const events = [];

    // Add activities
    if (incident?.activities) {
      incident.activities.forEach(activity => {
        let title = activity.action;
        let description = `${activity.action}`;
        let icon = 'Info';
        let color = 'text-blue-500 bg-blue-500/10 border-blue-500';

        if (activity.action === 'Created') {
          title = 'Incident Created';
          description = `Incident ${incident.ticketNumber} created`;
          icon = 'Plus';
        } else if (activity.action === 'StatusChanged') {
          title = 'Status Updated';
          description = `Status changed from ${activity.oldValue} to ${activity.newValue}`;
          icon = 'Settings';
          color = 'text-primary bg-primary/10 border-primary';
        }

        events.push({
          id: `act-${activity.id}`,
          type: activity.action,
          title,
          description,
          timestamp: new Date(activity.timestamp),
          user: `${activity.user.firstName} ${activity.user.lastName}`,
          icon,
          color
        });
      });
    }

    // Add comments
    if (incident?.comments) {
      incident.comments.forEach(comment => {
        events.push({
          id: `com-${comment.id}`,
          type: 'comment',
          title: 'New Comment',
          description: comment.comment,
          timestamp: new Date(comment.createdAt),
          user: `${comment.user.firstName} ${comment.user.lastName}`,
          icon: 'MessageSquare',
          color: 'text-success bg-success/10 border-success'
        });
      });
    }

    // Sort by timestamp newest first
    return events.sort((a, b) => b.timestamp - a.timestamp);
  };

  const events = getTimelineEvents();

  const handleAddUpdate = async () => {
    if (newUpdate?.trim()) {
      try {
        await ticketsAPI.addComment(incident.id, newUpdate);
        setNewUpdate('');
        setShowAddUpdate(false);
        // Parent component (IncidentManagementWorkflow) should refresh the incident data
        // via onUpdate or shared trigger if implemented there.
      } catch (err) {
        console.error('Failed to add comment:', err);
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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
            <span>Add Update (Comment)</span>
          </button>
        </div>
      </div>
      <div className="p-6">
        {showAddUpdate && (
          <div className="mb-6 bg-muted/30 rounded-lg p-4">
            <div className="space-y-3">
              <textarea
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground"
                rows={3}
                placeholder="Add a comment or status update..."
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
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
          
          <div className="space-y-6">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No events recorded for this incident yet.</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="relative flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-background ${event.color}`}>
                    <Icon name={event.icon} size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-foreground">{event.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-muted-foreground">by {event.user}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-foreground">
                            {formatTimestamp(event.timestamp)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">{events.length}</div>
              <div className="text-xs text-muted-foreground">Total Events</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {incident.createdAt ? Math.floor((Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60 * 60)) : 0}h
              </div>
              <div className="text-xs text-muted-foreground">Time Active</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {incident.comments?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-lg font-semibold text-foreground">
                {incident.activities?.filter(a => a.action === 'StatusChanged')?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Status Changes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineVisualization;