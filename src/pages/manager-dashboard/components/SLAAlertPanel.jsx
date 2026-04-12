import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const SLAAlertPanel = ({ alerts }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts?.filter(alert => alert?.severity === filter);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-error/10 text-error border-error/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'AlertCircle';
      case 'high': return 'AlertTriangle';
      case 'medium': return 'Info';
      default: return 'Bell';
    }
  };

  const getTimeColor = (timeRemaining) => {
    if (timeRemaining?.includes('Overdue')) return 'text-error';
    if (timeRemaining?.includes('min')) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">SLA Alerts</h2>
            <p className="text-sm text-muted-foreground mt-1 caption">Real-time breach notifications</p>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'critical', 'high', 'medium']?.map((severity) => (
              <button
                key={severity}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  filter === severity
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setFilter(severity)}
              >
                {severity?.charAt(0)?.toUpperCase() + severity?.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto">
        {filteredAlerts?.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} color="var(--color-success)" className="mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} alerts at this time</p>
          </div>
        ) : (
          filteredAlerts?.map((alert) => (
            <div
              key={alert?.id}
              className={`p-4 border-b border-border hover:bg-muted/30 transition-smooth ${getSeverityColor(alert?.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon name={getSeverityIcon(alert?.severity)} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm text-foreground">
                      Ticket #{alert?.ticketId} - {alert?.title}
                    </h4>
                    <span className={`text-xs font-medium caption whitespace-nowrap ${getTimeColor(alert?.timeRemaining)}`}>
                      {alert?.timeRemaining}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert?.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs caption">
                    <span className="flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {alert?.assignedTo}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} />
                      SLA: {alert?.slaDeadline}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Tag" size={14} />
                      {alert?.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => navigate('/ticket-management-center')} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-smooth">
                      View Ticket
                    </button>
                    <button onClick={() => navigate('/agent-dashboard')} className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-smooth">
                      Reassign
                    </button>
                    <button onClick={() => navigate('/manager-dashboard')} className="px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-smooth">
                      Escalate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {filteredAlerts?.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <button onClick={() => navigate('/reports-analytics')} className="w-full text-sm text-primary hover:underline font-medium">
            View All Alerts ({alerts?.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SLAAlertPanel;