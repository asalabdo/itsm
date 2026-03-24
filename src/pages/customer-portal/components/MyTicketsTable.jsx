import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { ticketsAPI } from '../../../services/api';

const MyTicketsTable = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsAPI.getAll().then(res => {
      const mapped = (res.data || []).map(t => ({
        id: t.ticketNumber || String(t.id),
        subject: t.title,
        status: t.status?.toLowerCase().replace(' ', '-') || 'pending',
        statusLabel: t.status || 'Pending',
        category: t.category || 'Incident',
        lastUpdate: t.updatedAt,
        estimatedResolution: t.dueDate || t.updatedAt,
        assignedAgent: t.assignedToName || 'Unassigned',
      }));
      setTickets(mapped);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority' },
    { value: 'status', label: 'Status' },
  ];

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
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTicketClick = (ticketId) => {
    navigate('/ticket-details', { state: { ticketId } });
  };

  const filteredTickets = tickets?.filter((ticket) => {
    const matchesSearch = ticket?.subject?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         ticket?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-1 md:mb-2">My Tickets</h2>
          <p className="text-sm md:text-base text-muted-foreground">Track and manage your support requests</p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium data-text">
          {filteredTickets?.length} Active
        </span>
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1">
          <Input type="search" placeholder="Search by ticket number or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e?.target?.value)} className="w-full" />
        </div>
        <div className="flex gap-3">
          <div className="w-full md:w-48">
            <Select options={statusOptions} value={statusFilter} onChange={setStatusFilter} placeholder="Filter by status" />
          </div>
          <div className="w-full md:w-48">
            <Select options={sortOptions} value={sortBy} onChange={setSortBy} placeholder="Sort by" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading tickets...</div>
      ) : (
        <>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ticket ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subject</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Update</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Est. Resolution</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets?.map((ticket) => (
                  <tr key={ticket?.id} className="border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer" onClick={() => handleTicketClick(ticket?.id)}>
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
                    <td className="py-4 px-4"><span className="text-sm text-muted-foreground caption">{ticket?.estimatedResolution ? new Date(ticket.estimatedResolution)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span></td>
                    <td className="py-4 px-4"><Button variant="ghost" size="sm" iconName="ExternalLink" iconPosition="right">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden space-y-3">
            {filteredTickets?.map((ticket) => (
              <div key={ticket?.id} onClick={() => handleTicketClick(ticket?.id)} className="bg-background border border-border rounded-lg p-4 hover:border-primary hover:shadow-elevation-2 transition-smooth cursor-pointer">
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
                  <span className="text-xs text-muted-foreground caption">Est. {ticket?.estimatedResolution ? new Date(ticket.estimatedResolution)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                  <Icon name="ChevronRight" size={16} color="var(--color-muted-foreground)" />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && filteredTickets?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-30" color="var(--color-muted-foreground)" />
          <h3 className="text-lg font-medium text-foreground mb-2">No tickets found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters or search query' : "You haven't created any tickets yet"}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => navigate('/ticket-creation')}>Create Your First Ticket</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTicketsTable;
