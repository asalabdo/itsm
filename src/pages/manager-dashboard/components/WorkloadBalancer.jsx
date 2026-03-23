import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const WorkloadBalancer = ({ agents }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [draggedTicket, setDraggedTicket] = useState(null);

  const unassignedTickets = [
    { id: 'T4530', title: 'Payment gateway timeout', priority: 'high', category: 'Technical' },
    { id: 'T4531', title: 'Account access issue', priority: 'medium', category: 'Account' },
    { id: 'T4532', title: 'Feature request - Export', priority: 'low', category: 'Feature' },
    { id: 'T4533', title: 'Login error on mobile', priority: 'critical', category: 'Technical' },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-error/10 text-error';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-primary/10 text-primary';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkloadStatus = (workload) => {
    if (workload >= 80) return { label: 'Overloaded', color: 'text-error' };
    if (workload >= 60) return { label: 'Busy', color: 'text-warning' };
    return { label: 'Available', color: 'text-success' };
  };

  const handleDragStart = (ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
  };

  const handleDrop = (agentId) => {
    if (draggedTicket) {
      console.log(`Assigning ticket ${draggedTicket?.id} to agent ${agentId}`);
      setDraggedTicket(null);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Workload Balancer</h2>
        <p className="text-sm text-muted-foreground mt-1 caption">Drag tickets to assign or reassign to agents</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Inbox" size={18} />
            Unassigned Tickets ({unassignedTickets?.length})
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {unassignedTickets?.map((ticket) => (
              <div
                key={ticket?.id}
                draggable
                onDragStart={() => handleDragStart(ticket)}
                className="p-3 bg-background border border-border rounded-lg cursor-move hover:shadow-elevation-2 transition-smooth"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="GripVertical" size={16} color="var(--color-muted-foreground)" />
                    <span className="text-sm font-medium text-foreground data-text">{ticket?.id}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium caption ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priority}
                  </span>
                </div>
                <p className="text-sm text-foreground mb-2">{ticket?.title}</p>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground caption">
                  <Icon name="Tag" size={12} />
                  {ticket?.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Icon name="Users" size={18} />
            Team Members
          </h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {agents?.map((agent) => {
              const status = getWorkloadStatus(agent?.workload);
              return (
                <div
                  key={agent?.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(agent?.id)}
                  className={`p-3 bg-background border-2 border-dashed rounded-lg transition-smooth ${
                    selectedAgent === agent?.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAgent(agent?.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image 
                      src={agent?.avatar} 
                      alt={agent?.avatarAlt}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{agent?.name}</p>
                      <p className={`text-xs font-medium caption ${status?.color}`}>{status?.label}</p>
                    </div>
                    <span className="text-sm font-medium text-foreground data-text">{agent?.tickets}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-smooth ${
                          agent?.workload >= 80 ? 'bg-error' : agent?.workload >= 60 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${agent?.workload}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground data-text whitespace-nowrap">{agent?.workload}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground caption">
            <Icon name="Info" size={14} className="inline mr-1" />
            Drag tickets from left panel to assign to team members
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-smooth">
            Auto-Balance Workload
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkloadBalancer;