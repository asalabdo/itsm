import React from 'react';
import Icon from '../../../components/AppIcon';

const TicketHeader = ({ ticket }) => {
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'in progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'incident':
        return 'AlertCircle';
      case 'problem':
        return 'AlertTriangle';
      case 'change':
        return 'RefreshCw';
      default:
        return 'Ticket';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground truncate">
              {ticket?.title}
            </h1>
            <span className="text-lg md:text-xl text-muted-foreground whitespace-nowrap">
              #{ticket?.id}
            </span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
            {ticket?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border ${getPriorityColor(ticket?.priority)}`}>
            {ticket?.priority}
          </span>
          <span className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border ${getStatusColor(ticket?.status)}`}>
            {ticket?.status}
          </span>
          <span className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border bg-muted text-foreground border-border flex items-center gap-2">
            <Icon name={getCategoryIcon(ticket?.category)} size={16} />
            {ticket?.category}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={20} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Customer</p>
            <p className="text-sm md:text-base font-medium text-foreground truncate">{ticket?.customer?.name}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{ticket?.customer?.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Icon name="UserCheck" size={20} color="var(--color-success)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Assigned To</p>
            <p className="text-sm md:text-base font-medium text-foreground truncate">{ticket?.assignedTo?.name}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{ticket?.assignedTo?.role}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
            <Icon name="Clock" size={20} color="var(--color-warning)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">SLA Deadline</p>
            <p className="text-sm md:text-base font-medium text-foreground">{ticket?.slaDeadline}</p>
            <p className="text-xs md:text-sm text-warning">{ticket?.slaRemaining}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Icon name="Calendar" size={20} color="var(--color-muted-foreground)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Created</p>
            <p className="text-sm md:text-base font-medium text-foreground">{ticket?.createdDate}</p>
            <p className="text-xs md:text-sm text-muted-foreground">{ticket?.createdTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketHeader;