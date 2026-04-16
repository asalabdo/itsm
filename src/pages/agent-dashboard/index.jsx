import { useState, useEffect } from 'react';
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
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const AgentDashboard = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const [filters, setFilters] = useState({ priority: 'all', status: 'all', category: 'all', sla: 'all' });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('agent-dashboard-view-mode') || 'table');
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const metricsData = [
    { icon: 'Ticket', iconColor: 'var(--color-primary)', title: t('openTickets', 'Open Tickets'), value: '--', subtitle: t('loading', 'Loading...'), trend: '', trendDirection: null },
    { icon: 'Clock', iconColor: 'var(--color-warning)', title: t('avgResolution', 'Avg Resolution'), value: '--', subtitle: t('last7Days', 'Last 7 days'), trend: '', trendDirection: null },
    { icon: 'AlertTriangle', iconColor: 'var(--color-error)', title: t('pendingApprovals', 'Pending Approvals'), value: '--', subtitle: t('awaitingAction', 'Awaiting action'), trend: '', trendDirection: null },
    { icon: 'CheckCircle', iconColor: 'var(--color-success)', title: t('resolved', 'Resolved'), value: '--', subtitle: t('totalResolved', 'Total resolved'), trend: '', trendDirection: null }
  ];

  const mapTicket = (ticket) => ({
    id: ticket.ticketNumber || String(ticket.id),
    backendId: ticket.id,
    customer: ticket.requestedByName || t('unknown', 'Unknown'),
    email: ticket.requestedByEmail || '',
    subject: ticket.title,
    priority: ticket.priority,
    status: ticket.status,
    slaRemaining: ticket.dueDate ? (() => {
      const diff = new Date(ticket.dueDate) - new Date();
      if (diff < 0) return t('slaExceeded', 'SLA Exceeded');
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
    })() : t('notAvailable', 'Not Available'),
    slaBreached: ticket.dueDate ? new Date(ticket.dueDate) < new Date() : false,
    lastUpdated: ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : t('notAvailable', 'Not Available'),
    unread: ticket.status === 'Open',
    category: ticket.category
  });

  useEffect(() => {
    localStorage.setItem('agent-dashboard-view-mode', viewMode);
  }, [viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, summaryRes] = await Promise.all([
        ticketsAPI.getAll(),
        dashboardAPI.getSummary()
      ]);

      const mapped = (ticketsRes?.data || []).map(mapTicket);
      setAllTickets(mapped);
      setTickets(mapped);

      const summary = summaryRes?.data;
      if (summary && Object.keys(summary).length > 0) {
        setMetricsData([
          { icon: 'Ticket', iconColor: 'var(--color-primary)', title: t('openTickets', 'Open Tickets'), value: String(summary.openTickets ?? 0), subtitle: `${summary.totalTickets ?? 0} ${t('total', 'Total')}`, trend: '', trendDirection: null },
          { icon: 'Clock', iconColor: 'var(--color-warning)', title: t('avgResolution', 'Avg Resolution'), value: summary.averageResolutionTime != null ? `${Number(summary.averageResolutionTime).toFixed(1)}h` : '0h', subtitle: t('last7Days', 'Last 7 days'), trend: '', trendDirection: null },
          { icon: 'AlertTriangle', iconColor: 'var(--color-error)', title: t('pendingApprovals', 'Pending Approvals'), value: String(summary.pendingApprovals ?? 0), subtitle: t('awaitingAction', 'Awaiting action'), trend: '', trendDirection: null },
          { icon: 'CheckCircle', iconColor: 'var(--color-success)', title: t('resolved', 'Resolved'), value: String(summary.resolvedTickets ?? 0), subtitle: `${summary.activeAssets ?? 0} ${t('assets', 'assets')}`, trend: '', trendDirection: null }
        ]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setMetricsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, []);

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const handleClearFilters = () => setFilters({ priority: 'all', status: 'all', category: 'all', sla: 'all' });
  const handleSort = (key) => setSortConfig((prev) => ({ key, direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc' }));
  const getSortIcon = (key) => (sortConfig?.key !== key ? 'ChevronsUpDown' : sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown');

  useEffect(() => {
    let filtered = [...allTickets];
    if (filters?.priority !== 'all') filtered = filtered.filter((ticket) => ticket?.priority?.toLowerCase() === filters?.priority);
    if (filters?.status !== 'all') filtered = filtered.filter((ticket) => ticket?.status?.toLowerCase() === filters?.status);
    if (filters?.sla === 'breached') filtered = filtered.filter((ticket) => ticket?.slaBreached);
    else if (filters?.sla === 'critical') filtered = filtered.filter((ticket) => !ticket?.slaBreached && ticket?.slaRemaining?.includes('دقيقة'));
    filtered.sort((a, b) => {
      const aVal = a?.[sortConfig?.key];
      const bVal = b?.[sortConfig?.key];
      return sortConfig?.direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setTickets(filtered);
  }, [filters, sortConfig, allTickets]);

  const colHeaders = [
    { key: 'id', label: t('ticketNumberCol', 'Ticket Number'), sortable: true },
    { key: 'customer', label: t('customerCol', 'Customer'), sortable: true },
    { key: 'subject', label: t('subjectCol', 'Subject'), sortable: false },
    { key: 'priority', label: t('priorityCol', 'Priority'), sortable: true },
    { key: 'status', label: t('statusCol', 'Status'), sortable: true },
    { key: 'sla', label: t('slaCol', 'SLA'), sortable: false },
    { key: 'lastUpdated', label: t('lastUpdatedCol', 'Last Updated'), sortable: true },
    { key: 'actions', label: t('actionsCol', 'Actions'), sortable: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">{t('myTicketsTitle', 'My Tickets')}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t('manageTrackTicketsDesc', 'Manage and track your support tickets')}</p>
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
                <h2 className="text-lg md:text-xl font-semibold text-foreground mb-1">{t('activeTicketsTitle', 'Active Tickets')}</h2>
                <p className="text-sm md:text-base text-muted-foreground caption">
                  {loading ? t('loading', 'Loading...') : `${tickets?.length} ${t('ticketsFoundCount', 'tickets found')}`}
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
              <p className="text-base text-muted-foreground">{t('loadingTickets', 'Loading tickets from server...')}</p>
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
                        <p className="text-base text-muted-foreground">{t('noTicketsFound', 'No tickets match the current filters')}</p>
                        <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">{t('clearFiltersBtn', 'Clear Filters')}</Button>
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
                  <p className="text-base text-muted-foreground">{t('noTicketsFound', 'No tickets match the current filters')}</p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-4">{t('clearFiltersBtn', 'Clear Filters')}</Button>
                </div>
              )}
            </div>
          )}

          {tickets?.length > 0 && (
            <div className="p-4 md:p-6 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground caption">{t('showingTickets', 'Showing')} {tickets?.length} {t('ofTickets', 'of')} {allTickets?.length} {t('ticketsLabel', 'tickets')}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>{t('previousBtn', 'Previous')}</Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">{t('nextBtn', 'Next')}</Button>
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
