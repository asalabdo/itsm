import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import FilterSidebar from './components/FilterSidebar';
import TicketDataGrid from './components/TicketDataGrid';
import TicketDetailPanel from './components/TicketDetailPanel';
import BulkActionToolbar from './components/BulkActionToolbar';
import SearchBar from './components/SearchBar';
import StatsCards from './components/StatsCards';
import CreateTicketModal from './components/CreateTicketModal';
import Icon from '../../components/AppIcon';
import { ticketsAPI, dashboardAPI } from '../../services/api';

const TicketManagementCenter = () => {
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: '--', open: '--', inProgress: '--', resolved: '--', overdue: '--', avgResponse: '--'
  });

  const mapTicket = (t) => ({
    id: t.ticketNumber || `TKT-${t.id}`,
    title: t.title,
    requester: t.requestedByName || 'Unknown',
    requesterInitials: (t.requestedByName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    assignee: t.assignedToName || 'Unassigned',
    assigneeInitials: (t.assignedToName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    status: t.status?.toLowerCase().replace(' ', '-') || 'open',
    statusLabel: t.status || 'Open',
    priority: t.priority?.toLowerCase() || 'medium',
    priorityLabel: t.priority || 'Medium',
    slaHours: t.dueDate ? Math.max(0, Math.floor((new Date(t.dueDate) - new Date()) / 3600000)) : 48,
    lastActivity: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : 'N/A',
    hasAttachment: false,
    department: t.category || 'IT Support',
    description: t.description || ''
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const [ticketsRes, summaryRes] = await Promise.all([
        ticketsAPI.getAll(),
        dashboardAPI.getSummary()
      ]);
      const mapped = (ticketsRes.data || []).map(mapTicket);
      setTickets(mapped);

      const s = summaryRes.data;
      if (s) {
        const inProgress = mapped.filter(t => t.status === 'in-progress').length;
        const overdue = mapped.filter(t => t.slaHours <= 0).length;
        setStats({
          total: String(s.totalTickets ?? mapped.length),
          open: String(s.openTickets ?? mapped.filter(t => t.status === 'open').length),
          inProgress: String(inProgress),
          resolved: String(s.resolvedTickets ?? mapped.filter(t => t.status === 'resolved').length),
          overdue: String(overdue),
          avgResponse: s.averageResolutionTime != null ? `${Number(s.averageResolutionTime).toFixed(1)}h` : 'N/A'
        });
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const filteredTickets = tickets.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.title?.toLowerCase().includes(q) || t.id?.toLowerCase().includes(q) || t.requester?.toLowerCase().includes(q);
  });

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => prev?.includes(ticketId) ? prev?.filter(id => id !== ticketId) : [...prev, ticketId]);
  };
  const handleSelectAll = (checked) => setSelectedTickets(checked ? filteredTickets?.map(t => t?.id) : []);
  const handleTicketClick = (ticket) => { setSelectedTicket(ticket); setDetailPanelOpen(true); };
  const handleApplyFilters = (filters) => setActiveFilters(filters);
  const handleBulkAction = (action, value) => { console.log('Bulk action:', action, value); setSelectedTickets([]); };
  const handleSearch = (query) => setSearchQuery(query);
  const handleFilterChange = (filterType, value) => console.log('Filter changed:', filterType, value);

  const handleCreateTicket = async (newTicket) => {
    try {
      const res = await ticketsAPI.create(newTicket);
      if (res.data) setTickets(prev => [mapTicket(res.data), ...prev]);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const currentUser = { name: 'Admin User', initials: 'AU', role: 'Admin' };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        <FilterSidebar isOpen={filterSidebarOpen} onClose={() => setFilterSidebarOpen(false)} onApplyFilters={handleApplyFilters} activeFilters={activeFilters} />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">Ticket Management Center</h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage and track all support tickets across your organization</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" iconName="Filter" onClick={() => setFilterSidebarOpen(!filterSidebarOpen)} className="lg:hidden">Filters</Button>
                <Button variant="ghost" iconName="RefreshCw" onClick={fetchTickets} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setCreateModalOpen(true)}>New Ticket</Button>
              </div>
            </div>

            <StatsCards stats={stats} />
            <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {loading ? (
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="Loader" size={14} className="animate-spin" />Loading tickets...
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Showing {filteredTickets?.length} of {tickets?.length} tickets</span>
                )}
              </div>
            </div>

            <TicketDataGrid
              tickets={filteredTickets}
              selectedTickets={selectedTickets}
              onSelectTicket={handleSelectTicket}
              onSelectAll={handleSelectAll}
              onTicketClick={handleTicketClick}
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Page 1 of {Math.ceil(filteredTickets?.length / 25) || 1}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>Previous</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">Next</Button>
              </div>
            </div>
          </div>
        </main>

        <TicketDetailPanel ticket={selectedTicket} isOpen={detailPanelOpen} onClose={() => setDetailPanelOpen(false)} />
      </div>
      <BulkActionToolbar selectedCount={selectedTickets?.length} onClearSelection={() => setSelectedTickets([])} onBulkAction={handleBulkAction} />
      <CreateTicketModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSubmit={handleCreateTicket} currentUser={currentUser} />
    </div>
  );
};

export default TicketManagementCenter;