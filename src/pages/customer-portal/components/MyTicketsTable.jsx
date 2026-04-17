import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const MyTicketsTable = ({ tickets = [], loading = false }) => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const statusOptions = [
    { value: 'all', label: t('allStatuses', 'All Statuses') },
    { value: 'open', label: t('open', 'Open') },
    { value: 'in-progress', label: t('inProgress', 'In Progress') },
    { value: 'pending', label: t('pending', 'Pending') },
    { value: 'resolved', label: t('resolved', 'Resolved') },
    { value: 'closed', label: t('closed', 'Closed') },
  ];

  const sortOptions = [
    { value: 'newest', label: t('newestFirst', 'Newest First') },
    { value: 'oldest', label: t('oldestFirst', 'Oldest First') },
    { value: 'priority', label: t('priority', 'Priority') },
    { value: 'status', label: t('status', 'Status') },
  ];

  const mappedTickets = tickets.map((ticket) => ({
    id: ticket?.ticketNumber || String(ticket?.id),
    backendId: ticket?.id,
    subject: ticket?.title || ticket?.subject || 'Untitled ticket',
    status: ticket?.status?.toLowerCase?.().replace(' ', '-') || 'pending',
    statusLabel: ticket?.status || 'Pending',
    category: ticket?.category || 'Incident',
    lastUpdate: ticket?.updatedAt || ticket?.createdAt,
    estimatedResolution: ticket?.dueDate || ticket?.updatedAt,
    assignedAgent: ticket?.assignedToName || 'Unassigned',
    priority: ticket?.priority || 'Medium',
  }));

  const getStatusColor = (status) => {
    const colors = {
      urgent: 'bg-error/10 text-error border-error/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      'in-progress': 'bg-primary/10 text-primary border-primary/20',
      open: 'bg-primary/10 text-primary border-primary/20',
      pending: 'bg-secondary/10 text-secondary border-secondary/20',
      resolved: 'bg-success/10 text-success border-success/20',
      closed: 'bg-muted text-muted-foreground border-border',
    };
    return colors?.[status] || colors?.pending;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTicketClick = (ticket) => {
    navigate(`/ticket-details/${ticket?.backendId || ticket?.id}`);
  };

  const filteredTickets = mappedTickets.filter((ticket) => {
    const matchesSearch = ticket?.subject?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      ticket?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (sortBy === 'priority') {
      const order = { urgent: 0, high: 1, medium: 2, low: 3 };
      return (order[a?.priority?.toLowerCase?.() || 'medium'] ?? 2) - (order[b?.priority?.toLowerCase?.() || 'medium'] ?? 2);
    }

    if (sortBy === 'status') {
      return String(a?.statusLabel || '').localeCompare(String(b?.statusLabel || ''));
    }

    const aTime = new Date(a?.lastUpdate || 0).getTime();
    const bTime = new Date(b?.lastUpdate || 0).getTime();
    return sortBy === 'oldest' ? aTime - bTime : bTime - aTime;
  });

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-1 md:mb-2">{t('myTickets', 'My Tickets')}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{t('trackManageSupportRequests', 'Track and manage your support requests')}</p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium data-text">
          {sortedTickets.length} {t('active', 'Active')}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="search"
            placeholder={t('searchByTicketNumberOrSubject', 'Search by ticket number or subject...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-3">
          <div className="w-full md:w-48">
            <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder={t('filterByStatus', 'Filter by status')} />
          </div>
          <div className="w-full md:w-48">
            <Select options={sortOptions} value={sortBy} onChange={setSortBy} placeholder={t('sortBy', 'Sort by')} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">{t('loadingTickets', 'Loading tickets...')}</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('ticketID', 'Ticket ID')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('subject', 'Subject')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('status', 'Status')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('category', 'Category')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('lastUpdate', 'Last Update')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('estResolution', 'Est. Resolution')}</th>
                  <th className={`${isRtl ? 'text-right' : 'text-left'} py-3 px-4 text-sm font-medium text-muted-foreground`}>{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map((ticket) => (
                  <tr
                    key={ticket?.id}
                    className="border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <td className="py-4 px-4"><span className="font-medium text-foreground data-text">{ticket?.id}</span></td>
                    <td className="py-4 px-4"><span className="text-foreground line-clamp-2">{ticket?.subject}</span></td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket?.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {ticket?.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground">{ticket?.category}</span></td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground caption">{formatDateTime(ticket?.lastUpdate)}</span></td>
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground caption">{ticket?.estimatedResolution ? new Date(ticket.estimatedResolution).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span></td>
                    <td className="py-4 px-4">
                      <Button variant="ghost" size="sm" iconName="ExternalLink" iconPosition="right" onClick={() => handleTicketClick(ticket)}>
                        {t('view', 'View')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {sortedTickets.map((ticket) => (
              <div
                key={ticket?.id}
                onClick={() => handleTicketClick(ticket)}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary hover:shadow-elevation-2 transition-smooth cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-medium text-foreground data-text">{ticket?.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket?.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {ticket?.statusLabel}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-foreground mb-2 line-clamp-2">{ticket?.subject}</h4>
                <div className="flex items-center gap-4 text-xs text-muted-foreground caption mb-3">
                  <span className="flex items-center gap-1"><Icon name="Tag" size={14} />{ticket?.category}</span>
                  <span className="flex items-center gap-1"><Icon name="Clock" size={14} />{formatDateTime(ticket?.lastUpdate)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground caption">Est. {ticket?.estimatedResolution ? new Date(ticket.estimatedResolution).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                  <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && sortedTickets.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-30" color="var(--color-muted-foreground)" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('noTicketsFound', 'No tickets found')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' ? t('tryAdjustingFilters', 'Try adjusting your filters or search query') : t('haventCreatedTickets', "You haven't created any tickets yet")}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => navigate('/ticket-creation')}>
              {t('createFirstTicket', 'Create Your First Ticket')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTicketsTable;
