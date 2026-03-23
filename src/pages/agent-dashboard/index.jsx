import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';
import FilterPanel from './components/FilterPanel';
import QuickActions from './components/QuickActions';
import TicketTableRow from './components/TicketTableRow';
import TicketCard from './components/TicketCard';
import ChatbotWidget from '../../components/ChatbotWidget';
import { ticketsAPI, dashboardAPI } from '../../services/api';

const AgentDashboard = () => {
  const [filters, setFilters] = useState({ priority: 'all', status: 'all', category: 'all', sla: 'all' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [viewMode, setViewMode] = useState('table');
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metricsData, setMetricsData] = useState([
    { icon: 'Ticket', iconColor: 'var(--color-primary)', title: 'Open Tickets', value: '--', subtitle: 'Loading...', trend: '', trendDirection: null },
    { icon: 'Clock', iconColor: 'var(--color-warning)', title: 'Avg. Resolution Time', value: '--', subtitle: 'Last 7 days', trend: '', trendDirection: null },
    { icon: 'AlertTriangle', iconColor: 'var(--color-error)', title: 'Pending Approvals', value: '--', subtitle: 'Awaiting action', trend: '', trendDirection: null },
    { icon: 'CheckCircle', iconColor: 'var(--color-success)', title: 'Resolved', value: '--', subtitle: 'Total resolved', trend: '', trendDirection: null }
  ]);

  const mapTicket = (t) => ({
    id: t.ticketNumber || String(t.id),
    customer: t.requestedByName || 'Unknown',
    email: t.requestedByEmail || '',
    subject: t.title,
    priority: t.priority,
    status: t.status,
    slaRemaining: t.dueDate ? (() => {
      const diff = new Date(t.dueDate) - new Date();
      if (diff < 0) return 'Breached';
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return h > 0 ? `${h}h ${m}min` : `${m} min`;
    })() : 'N/A',
    slaBreached: t.dueDate ? new Date(t.dueDate) < new Date() : false,
    lastUpdated: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : 'N/A',
    unread: t.status === 'Open',
    category: t.category
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, summaryRes] = await Promise.all([
          ticketsAPI.getAll(),
          dashboardAPI.getSummary()
        ]);
        const mapped = (ticketsRes.data || []).map(mapTicket);
        setAllTickets(mapped);
        setTickets(mapped);
        const summary = summaryRes.data;
        if (summary) {
          setMetricsData([
            { icon: 'Ticket', iconColor: 'var(--color-primary)', title: 'Open Tickets', value: String(summary.openTickets ?? '--'), subtitle: `${summary.totalTickets ?? '--'} total`, trend: '', trendDirection: null },
            { icon: 'Clock', iconColor: 'var(--color-warning)', title: 'Avg. Resolution Time', value: summary.averageResolutionTime != null ? `${Number(summary.averageResolutionTime).toFixed(1)}h` : '--', subtitle: 'Last 7 days', trend: '', trendDirection: null },
            { icon: 'AlertTriangle', iconColor: 'var(--color-error)', title: 'Pending Approvals', value: String(summary.pendingApprovals ?? '--'), subtitle: 'Awaiting action', trend: '', trendDirection: null },
            { icon: 'CheckCircle', iconColor: 'var(--color-success)', title: 'Resolved', value: String(summary.resolvedTickets ?? '--'), subtitle: `${summary.activeAssets ?? '--'} active assets`, trend: '', trendDirection: null }
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleClearFilters = () => setFilters({ priority: 'all', status: 'all', category: 'all', sla: 'all' });
  const handleSort = (key) => setSortConfig(prev => ({ key, direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc' }));
  const getSortIcon = (key) => sortConfig?.key !== key ? 'ChevronsUpDown' : sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';

  useEffect(() => {
    let filtered = [...allTickets];
    if (filters?.priority !== 'all') filtered = filtered.filter(t => t?.priority?.toLowerCase() === filters?.priority);
    if (filters?.status !== 'all') filtered = filtered.filter(t => t?.status?.toLowerCase() === filters?.status);
    if (filters?.sla === 'breached') filtered = filtered.filter(t => t?.slaBreached);
    else if (filters?.sla === 'critical') filtered = filtered.filter(t => !t?.slaBreached && t?.slaRemaining?.includes('min'));
    filtered.sort((a, b) => {
      const aVal = a?.[sortConfig?.key], bVal = b?.[sortConfig?.key];
      return sortConfig?.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setTickets(filtered);
  }, [filters, sortConfig, allTickets]);

  const colHeaders = [
    { key: 'id', label: 'Ticket ID', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'subject', label: 'Subject', sortable: false },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'sla', label: 'SLA', sortable: false },
    { key: 'lastUpdated', label: 'Last Updated', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">My Tickets</h1>
            <p className="text-sm md:text-base text-muted-foreground">Manage and track your assigned support tickets</p>
          </div>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {metricsData?.map((metric, index) => (<MetricsCard key={index} {...metric} />))}
        </div>

        <div className="mb-6 md:mb-8">
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters} />
        </div>

        <div className="bg-card border border-border rounded-lg shadow-elevation-1">
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">Active Tickets</h2>
                <p className="text-sm md:text-base text-muted-foreground caption">
                  {loading ? 'Loading...' : `${tickets?.length} ticket${tickets?.length !== 1 ? 's' : ''} found`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" iconName="Table" onClick={() => setViewMode('table')} className="flex-shrink-0" />
                <Button variant={viewMode === 'card' ? 'default' : 'outline'} size="sm" iconName="LayoutGrid" onClick={() => setViewMode('card')} className="flex-shrink-0" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Icon name="Loader" size={48} className="mx-auto mb-3 opacity-30 animate-spin" color="var(--color-muted-foreground)" />
              <p className="text-base text-muted-foreground">Loading tickets from server...</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {colHeaders.map(({ key, label, sortable }) => (
                      <th key={key} className="px-3 md:px-4 py-3 md:py-4 text-left">
                        {sortable ? (
                          <button className="flex items-center gap-2 text-xs md:text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth caption" onClick={() => handleSort(key)}>
                            {label}<Icon name={getSortIcon(key)} size={16} />
                          </button>
                        ) : (
                          <span className="text-xs md:text-sm font-medium text-muted-foreground caption">{label}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets?.length > 0 ? (
                    tickets?.map((ticket) => (<TicketTableRow key={ticket?.id} ticket={ticket} />))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" color="var(--color-muted-foreground)" />
                        <p className="text-base text-muted-foreground">No tickets found matching your filters</p>
                        <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">Clear Filters</Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 md:p-6">
              {tickets?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {tickets?.map((ticket) => (<TicketCard key={ticket?.id} ticket={ticket} />))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-30" color="var(--color-muted-foreground)" />
                  <p className="text-base text-muted-foreground">No tickets found matching your filters</p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">Clear Filters</Button>
                </div>
              )}
            </div>
          )}

          {tickets?.length > 0 && (
            <div className="p-4 md:p-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground caption">Showing {tickets?.length} of {allTickets?.length} tickets</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>Previous</Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">Next</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatbotWidget />
      </main>
    </div>
  );
};

export default AgentDashboard;