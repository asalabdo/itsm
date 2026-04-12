import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const TicketDataGrid = ({ tickets, selectedTickets, onSelectTicket, onSelectAll, onTicketClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ChevronsUpDown';
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-error bg-error/10',
      high: 'text-warning bg-warning/10',
      medium: 'text-primary bg-primary/10',
      low: 'text-muted-foreground bg-muted'
    };
    return colors?.[priority] || colors?.low;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'text-primary bg-primary/10',
      'in-progress': 'text-warning bg-warning/10',
      pending: 'text-muted-foreground bg-muted',
      resolved: 'text-success bg-success/10',
      closed: 'text-muted-foreground bg-muted'
    };
    return colors?.[status] || colors?.open;
  };

  const getSLAColor = (hours) => {
    if (hours < 0) return 'text-error';
    if (hours < 4) return 'text-warning';
    return 'text-success';
  };

  const formatSLA = (hours) => {
    if (hours < 0) return `${Math.abs(hours)}h overdue`;
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  };

  const allSelected = tickets?.length > 0 && selectedTickets?.length === tickets?.length;
  const someSelected = selectedTickets?.length > 0 && selectedTickets?.length < tickets?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  size="sm"
                />
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  ID
                  <Icon name={getSortIcon('id')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Title
                  <Icon name={getSortIcon('title')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('requester')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Requester
                  <Icon name={getSortIcon('requester')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Assignee
                  <Icon name={getSortIcon('assignee')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Status
                  <Icon name={getSortIcon('status')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Priority
                  <Icon name={getSortIcon('priority')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('sla')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  SLA
                  <Icon name={getSortIcon('sla')} size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('lastActivity')}
                  className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-smooth"
                >
                  Last Activity
                  <Icon name={getSortIcon('lastActivity')} size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets?.map((ticket) => (
              <tr
                key={ticket?.id}
                className="hover:bg-muted/30 transition-smooth cursor-pointer"
                onClick={() => onTicketClick(ticket)}
              >
                <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                  <Checkbox
                    checked={selectedTickets?.includes(ticket?.id)}
                    onChange={() => onSelectTicket(ticket?.id)}
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-primary">#{ticket?.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium line-clamp-2 max-w-xs">
                      {ticket?.title}
                    </span>
                    {ticket?.hasAttachment && (
                      <Icon name="Paperclip" size={14} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {ticket?.requesterInitials}
                    </div>
                    <span className="text-sm truncate max-w-[120px]">{ticket?.requester}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {ticket?.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-success/10 text-success rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {ticket?.assigneeInitials}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-medium truncate max-w-[140px]">{ticket?.assignee}</span>
                        <span className="block text-xs text-muted-foreground truncate max-w-[140px]">
                          {ticket?.assigneeDepartment || ticket?.department || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket?.status)}`}>
                    {ticket?.statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket?.priority)}`}>
                    {ticket?.priorityLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={14} className={getSLAColor(ticket?.slaHours)} />
                    <span className={`text-sm font-medium ${getSLAColor(ticket?.slaHours)}`}>
                      {formatSLA(ticket?.slaHours)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">{ticket?.lastActivity}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketDataGrid;
