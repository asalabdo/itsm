import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CompletedTodayCard = ({ tickets = [], loading }) => {
  const completedTickets = tickets
    .filter((ticket) => String(ticket?.status).toLowerCase() === 'resolved')
    .map((t) => ({
      id: t.ticketNumber,
      title: t.title,
      priority: t.priority === 'Critical' ? 'P1' : t.priority === 'High' ? 'P2' : 'P3',
      customer: t.requestedByName || 'External User',
      department: t.department || 'General',
      completedAt: new Date(t.updatedAt || t.createdAt || Date.now()),
      resolutionTime: t.resolutionMinutes || Math.max(5, Math.floor(((new Date(t.updatedAt || Date.now())) - new Date(t.createdAt || Date.now())) / 60000)),
      satisfactionScore: t.satisfactionScore || 5,
      feedback: t.resolutionNotes || 'Ticket resolved successfully.',
      category: t.category || 'General'
    }));

  const [selectedTicket, setSelectedTicket] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'P1': return 'text-error border-error bg-error/10';
      case 'P2': return 'text-warning border-warning bg-warning/10';
      case 'P3': return 'text-blue-500 border-blue-500 bg-blue-500/10';
      default: return 'text-muted-foreground border-muted bg-muted/10';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={14}
        className={`${index < rating ? 'text-warning fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const calculateMetrics = () => {
    if (completedTickets.length === 0) {
      return { avgResolution: 0, avgSatisfaction: 0 };
    }

    const avgResolution = Math.round(
      completedTickets?.reduce((sum, ticket) => sum + ticket?.resolutionTime, 0) / completedTickets?.length
    );
    const avgSatisfaction = (completedTickets?.reduce((sum, ticket) => sum + ticket?.satisfactionScore, 0) / completedTickets?.length)?.toFixed(1);
    
    return { avgResolution, avgSatisfaction };
  };

  const { avgResolution, avgSatisfaction } = calculateMetrics();

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="CheckCircle2" size={20} />
            <span>Completed Today ({completedTickets?.length})</span>
          </h3>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Icon name="BarChart3" size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-success/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
                <p className="font-semibold text-success">{avgResolution}m</p>
              </div>
            </div>
          </div>
          <div className="bg-warning/10 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Star" size={16} className="text-warning" />
              <div>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
                <p className="font-semibold text-warning">{avgSatisfaction}/5</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading completed tickets...</div>
        ) : completedTickets.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No tickets have been completed today yet.
          </div>
        ) : completedTickets?.map((ticket) => (
          <div
            key={ticket?.id}
            className="p-4 border-b border-border last:border-b-0 hover:bg-success/5 transition-colors cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded border font-medium ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priority}
                  </span>
                  <span className="px-2 py-1 text-xs bg-success/10 text-success rounded font-medium">
                    Resolved
                  </span>
                </div>
                
                <h4 className="font-medium text-foreground text-sm mb-1">{ticket?.id}</h4>
                <p className="text-sm text-foreground mb-2">{ticket?.title}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                  <span>{ticket?.customer}</span>
                  <span>•</span>
                  <span>{ticket?.department}</span>
                  <span>•</span>
                  <span>{ticket?.category}</span>
                </div>

                {/* Employee Feedback */}
                <div className="bg-muted/30 rounded-lg p-2 mb-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex space-x-1">
                      {renderStars(ticket?.satisfactionScore)}
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      ({ticket?.satisfactionScore}/5)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    "{ticket?.feedback}"
                  </p>
                </div>
              </div>
              
              <div className="text-right text-xs text-muted-foreground ml-4">
                <p>Completed</p>
                <p className="font-medium text-foreground">{formatTime(ticket?.completedAt)}</p>
                <p className="mt-1">Resolved in {ticket?.resolutionTime}m</p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Icon name="Zap" size={14} className="text-success" />
                  <span className="text-xs text-success font-medium">
                    {ticket?.resolutionTime < 30 ? 'Quick Resolution' : 'Standard Time'}
                  </span>
                </div>
                {ticket?.satisfactionScore >= 5 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Heart" size={14} className="text-error" />
                    <span className="text-xs text-error font-medium">Perfect Score</span>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-1">
                <button className="p-1 hover:bg-muted rounded">
                  <Icon name="Copy" size={14} className="text-muted-foreground" />
                </button>
                <button className="p-1 hover:bg-muted rounded">
                  <Icon name="Share2" size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Icon name="CheckCircle2" size={24} className="text-success" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedTicket?.id}</h3>
                    <p className="text-sm text-muted-foreground">Completed {formatTime(selectedTicket?.completedAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Icon name="X" size={20} className="text-muted-foreground" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{selectedTicket?.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <p className="text-foreground font-medium">{selectedTicket?.customer}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Department:</span>
                      <p className="text-foreground font-medium">{selectedTicket?.department}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h5 className="font-semibold text-foreground mb-3">Performance Summary</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground text-sm">Resolution Time:</span>
                      <p className="text-foreground font-semibold">{selectedTicket?.resolutionTime} minutes</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Employee Rating:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex space-x-1">
                          {renderStars(selectedTicket?.satisfactionScore)}
                        </div>
                        <span className="font-semibold text-foreground">
                          {selectedTicket?.satisfactionScore}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-foreground mb-2">Employee Feedback</h5>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-foreground italic">"{selectedTicket?.feedback}"</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
                    View Full History
                  </button>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    Create Similar Solution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedTodayCard;
