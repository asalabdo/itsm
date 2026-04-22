import { useCallback, useState, useEffect, useMemo } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import FilterSidebar from './components/FilterSidebar';
import TicketDataGrid from './components/TicketDataGrid';
import TicketDetailPanel from './components/TicketDetailPanel';
import BulkActionToolbar from './components/BulkActionToolbar';
import SearchBar from './components/SearchBar';
import StatsCards from './components/StatsCards';
import CreateTicketModal from './components/CreateTicketModal';
import TicketOwnershipPanel from './components/TicketOwnershipPanel';
import Icon from '../../components/AppIcon';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { ticketsAPI, dashboardAPI } from '../../services/api';
import userService from '../../services/userService';
import { formatLocalizedValue, getLocalizedDisplayName } from '../../services/displayValue';
import { loadErpDepartmentDirectory, matchOrganizationUnitLabel } from '../../services/organizationUnits';

const normalizeText = (value) => String(value || '').trim().toLowerCase();
const slugify = (value) => normalizeText(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const getDisplayName = (user) => (
  getLocalizedDisplayName(user) ||
  formatLocalizedValue(user?.fullName) ||
  formatLocalizedValue(user?.displayName) ||
  formatLocalizedValue(user?.name) ||
  formatLocalizedValue(user?.username) ||
  formatLocalizedValue(user?.userName) ||
  'Unassigned'
);
const getDepartmentLabel = (ticket, assignedTo) => (
  formatLocalizedValue(assignedTo?.department) ||
  formatLocalizedValue(ticket?.department) ||
  formatLocalizedValue(ticket?.requestedBy?.department) ||
  formatLocalizedValue(ticket?.category) ||
  'Unassigned'
);

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
  const [searchFilters, setSearchFilters] = useState({
    status: 'all',
    priority: 'all',
    department: 'all',
    assignee: 'all',
    dateRange: 'all',
    slaStatus: 'all',
  });
  const [stats, setStats] = useState({
    total: '--', open: '--', inProgress: '--', resolved: '--', overdue: '--', avgResponse: '--'
  });
  const [erpDepartments, setErpDepartments] = useState([]);
  const currentUser = userService.getCurrentUser() || { name: 'Admin User', initials: 'AU', role: 'Admin' };
  const { language, isRtl } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);

  const mapTicket = useCallback((t) => ({
    backendId: t.id,
    id: t.ticketNumber || `TKT-${t.id}`,
    title: t.title,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    requestedById: t.requestedById ?? t.requestedBy?.id ?? null,
    assignedToId: t.assignedToId ?? t.assignedTo?.id ?? null,
    requester: getLocalizedDisplayName(t.requestedBy) || formatLocalizedValue(t.requestedByName) || 'Unknown',
    requesterInitials: (getLocalizedDisplayName(t.requestedBy) || formatLocalizedValue(t.requestedByName) || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    assignee: getDisplayName(t.assignedTo),
    assigneeInitials: getDisplayName(t.assignedTo).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    assigneeDepartment: getDepartmentLabel(t, t.assignedTo),
    status: t.status?.toLowerCase().replace(' ', '-') || 'open',
    statusLabel: t.status || 'Open',
    priority: t.priority?.toLowerCase() || 'medium',
    priorityLabel: t.priority || 'Medium',
    slaStatus: t.slaStatus?.toLowerCase() || (t.dueDate && new Date(t.dueDate) < new Date() ? 'breached' : 'healthy'),
    slaHours: t.dueDate ? Math.max(0, Math.floor((new Date(t.dueDate) - new Date()) / 3600000)) : 48,
    lastActivity: t.updatedAt ? new Date(t.updatedAt).toLocaleString() : 'Not Available',
    hasAttachment: false,
    department: getDepartmentLabel(t, t.assignedTo),
    description: t.description || ''
  }), []);

  const fetchTickets = useCallback(async () => {
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
  }, [mapTicket]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    let mounted = true;

    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) {
          setErpDepartments(Array.isArray(departments) ? departments : []);
        }
      })
      .catch((error) => {
        console.error('Failed to load ERP departments:', error);
        if (mounted) {
          setErpDepartments([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      fetchTickets();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, [fetchTickets]);

  const normalizedCurrentUserName = String(currentUser?.name || '').trim().toLowerCase();
  const normalizedCurrentUserUsername = String(currentUser?.username || '').trim().toLowerCase();
  const normalizedCurrentUserId = currentUser?.id != null ? String(currentUser.id) : '';

  const isCurrentUserTicket = useCallback((ticket) => {
    const assignedName = String(ticket?.assignee || '').trim().toLowerCase();
    const assignedId = ticket?.assignedToId != null ? String(ticket.assignedToId) : '';
    if (!assignedName && !assignedId) return false;
    if (normalizedCurrentUserId && assignedId === normalizedCurrentUserId) return true;
    if (normalizedCurrentUserName && assignedName === normalizedCurrentUserName) return true;
    if (normalizedCurrentUserUsername && assignedName === normalizedCurrentUserUsername) return true;
    return false;
  }, [normalizedCurrentUserId, normalizedCurrentUserName, normalizedCurrentUserUsername]);

  const matchesAssigneeFilter = useCallback((ticket, selected) => {
    if (!selected || selected === 'all') return true;
    const values = Array.isArray(selected) ? selected : [selected];
    const ticketAssignee = String(ticket?.assignee || '').trim().toLowerCase();
    const assignedId = ticket?.assignedToId != null ? String(ticket.assignedToId) : '';

    return values.some((value) => {
      const normalizedValue = String(value || '').trim().toLowerCase();
      switch (value) {
        case 'unassigned':
          return ticketAssignee === 'unassigned';
        case 'me':
          return isCurrentUserTicket(ticket);
        case 'my-team':
          return ticketAssignee !== 'unassigned' && !isCurrentUserTicket(ticket);
        default:
          if (normalizedValue.startsWith('user:')) {
            return assignedId === normalizedValue.replace('user:', '');
          }
          return ticketAssignee === normalizedValue;
      }
    });
  }, [isCurrentUserTicket]);

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const combinedFilters = { ...searchFilters, ...activeFilters };

    const matchesMulti = (value, selected) => {
      if (!selected || selected === 'all') return true;
      const values = Array.isArray(selected) ? selected : [selected];
      const normalizedValue = slugify(value);
      return values.map((entry) => slugify(entry)).includes(normalizedValue);
    };

    return tickets.filter((ticket) => {
      const searchableText = [
        ticket.id,
        ticket.title,
        ticket.requester,
        ticket.assignee,
        ticket.statusLabel,
        ticket.priorityLabel,
        ticket.department,
        ticket.description
      ].join(' ').toLowerCase();

      if (normalizedSearch && !searchableText.includes(normalizedSearch)) {
        return false;
      }

      if (!matchesMulti(ticket.status, combinedFilters.status)) return false;
      if (!matchesMulti(ticket.priority, combinedFilters.priority)) return false;
      if (!matchesMulti(ticket.department, combinedFilters.department)) return false;
      if (!matchesAssigneeFilter(ticket, combinedFilters.assignee)) return false;
      if (!matchesMulti(ticket.slaStatus, combinedFilters.slaStatus)) return false;

      if (combinedFilters.dateRange && combinedFilters.dateRange !== 'all') {
        const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
        if (!createdAt) return true;

        const now = new Date();
        const withinDays = (days) => now - createdAt <= days * 24 * 60 * 60 * 1000;

        switch (combinedFilters.dateRange) {
          case 'today':
            return createdAt.toDateString() === now.toDateString();
          case 'week':
            return withinDays(7);
          case 'month':
            return withinDays(30);
          case 'quarter':
            return withinDays(90);
          default:
            return true;
        }
      }

      return true;
    });
  }, [tickets, searchQuery, searchFilters, activeFilters, matchesAssigneeFilter]);

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => prev?.includes(ticketId) ? prev?.filter(id => id !== ticketId) : [...prev, ticketId]);
  };
  const handleSelectAll = (checked) => setSelectedTickets(checked ? filteredTickets?.map(t => t?.id) : []);
  const handleTicketClick = (ticket) => { setSelectedTicket(ticket); setDetailPanelOpen(true); };
  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };
  const handleSavedFilterSelect = (filter) => {
    const presetName = typeof filter === 'string' ? filter : filter?.name;
    const name = String(presetName || '').toLowerCase();

    setSearchQuery('');
    setActiveFilters({});

    if (name === t('myOpenTickets', 'My Open Tickets').toLowerCase()) {
      setSearchFilters((prev) => ({ ...prev, status: 'open', assignee: 'me', priority: 'all', department: 'all', dateRange: 'all', slaStatus: 'all' }));
      return;
    }

    if (name === t('highPriority', 'High Priority').toLowerCase()) {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'high', department: 'all', assignee: 'all', dateRange: 'all', slaStatus: 'all' }));
      return;
    }

    if (name === t('overdueSLA', 'Overdue SLA').toLowerCase()) {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'all', department: 'all', assignee: 'all', dateRange: 'all', slaStatus: 'breached' }));
      return;
    }

    if (name === t('unassigned', 'Unassigned').toLowerCase()) {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'all', department: 'all', assignee: 'unassigned', dateRange: 'all', slaStatus: 'all' }));
    }
  };
  const handleQuickFilter = (preset) => {
    setSearchQuery('');
    setActiveFilters({});

    if (preset === 'my-tickets') {
      setSearchFilters((prev) => ({ ...prev, status: 'open', assignee: 'me', priority: 'all', department: 'all', dateRange: 'all', slaStatus: 'all' }));
      return;
    }

    if (preset === 'unassigned') {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'all', department: 'all', assignee: 'unassigned', dateRange: 'all', slaStatus: 'all' }));
      return;
    }

    if (preset === 'overdue') {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'all', department: 'all', assignee: 'all', dateRange: 'all', slaStatus: 'breached' }));
      return;
    }

    if (preset === 'high-priority') {
      setSearchFilters((prev) => ({ ...prev, status: 'all', priority: 'high', department: 'all', assignee: 'all', dateRange: 'all', slaStatus: 'all' }));
    }
  };
  const handleOpenDepartment = (bucket) => {
    setSearchFilters((prev) => ({
      ...prev,
      department: slugify(bucket?.department || 'all'),
      assignee: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
      slaStatus: 'all',
    }));
    setFilterSidebarOpen(true);
  };
  const handleSaveFilter = ({ query, filters }) => {
    const filterName = window.prompt(t('saveThisFilterAs', 'Save this filter as'), t('mySavedFilter', 'My Saved Filter'));
    if (!filterName) return;

    const savedFilter = {
      id: Date.now(),
      name: filterName,
      query: query || '',
      filters: filters || {},
    };

    const storageKey = 'ticket-management-center:saved-filters';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify([savedFilter, ...existing].slice(0, 10)));
  };
  const downloadCsv = (rows, filename) => {
    const header = [
      t('ticketIdHeader', 'Ticket ID'),
      t('titleHeader', 'Title'),
      t('requesterHeader', 'Requester'),
      t('assigneeHeader', 'Assignee'),
      t('statusHeader', 'Status'),
      t('priorityHeader', 'Priority'),
      t('lastActivityHeader', 'Last Activity')
    ];
    const csvRows = [
      header.join(','),
      ...rows.map((ticket) => [
        `"${ticket?.id || ''}"`,
        `"${String(ticket?.title || '').replace(/"/g, '""')}"`,
        `"${String(ticket?.requester || '').replace(/"/g, '""')}"`,
        `"${String(ticket?.assignee || '').replace(/"/g, '""')}"`,
        `"${String(ticket?.statusLabel || '').replace(/"/g, '""')}"`,
        `"${String(ticket?.priorityLabel || '').replace(/"/g, '""')}"`,
        `"${String(ticket?.lastActivity || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkAction = async (action, value) => {
    const selectedRows = filteredTickets.filter((ticket) => selectedTickets.includes(ticket.id));

    try {
      if (action === 'export') {
        downloadCsv(selectedRows, `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`);
        return;
      }

      if (action === 'delete') {
        const shouldDelete = window.confirm(
          t('deleteSelectedTicketsConfirm', 'Delete {count} selected ticket(s)?').replace('{count}', String(selectedRows.length))
        );
        if (!shouldDelete) return;
        await Promise.all(selectedRows.map((ticket) => ticketsAPI.delete(ticket.backendId || ticket.id)));
      }

      if (action === 'status') {
        await Promise.all(selectedRows.map((ticket) => ticketsAPI.updateStatus(ticket.backendId || ticket.id, value)));
      }

      if (action === 'priority') {
        await Promise.all(selectedRows.map((ticket) => ticketsAPI.updatePriority(ticket.backendId || ticket.id, value)));
      }

      if (action === 'assign') {
        const assigneeId = window.prompt(t('enterAssigneeUserIdPrompt', 'Enter assignee user ID for the selected tickets:'));
        if (!assigneeId) return;
        const numericAssigneeId = Number(assigneeId);
        if (Number.isNaN(numericAssigneeId)) return;
        await Promise.all(selectedRows.map((ticket) => ticketsAPI.assign(ticket.backendId || ticket.id, numericAssigneeId)));
      }

      await fetchTickets();
    } catch (err) {
      console.error(t('bulkActionFailed', 'Bulk action failed:'), err);
    } finally {
      setSelectedTickets([]);
    }
  };
  const handleSearch = (query) => setSearchQuery(query);
  const handleFilterChange = (filterType, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const activeSidebarFilterCount = useMemo(() => {
    const values = Object.values(activeFilters || {});
    return values.reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      if (typeof value === 'string') {
        return count + (value.trim() ? 1 : 0);
      }
      return count + (value ? 1 : 0);
    }, 0);
  }, [activeFilters]);

  const sidebarCounts = useMemo(() => {
    const countBy = (selector) => tickets.reduce((acc, ticket) => {
      const key = selector(ticket);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = countBy((ticket) => ticket.status);
    const priorityCounts = countBy((ticket) => ticket.priority);
    const departmentCounts = tickets.reduce((acc, ticket) => {
      const department = matchOrganizationUnitLabel(
        ticket?.department ||
        ticket?.requestedBy?.department ||
        ticket?.requestedBy?.organizationUnitName ||
        ticket?.organizationUnitName ||
        ticket?.organizationUnit?.displayName,
        erpDepartments
      ) || ticket?.department || ticket?.category;

      if (!department) {
        return acc;
      }

      acc[department] = (acc[department] || 0) + 1;
      return acc;
    }, {});
    const assigneeMap = tickets.reduce((acc, ticket) => {
      const isUnassigned = !ticket.assignedToId || normalizeText(ticket.assignee) === 'unassigned';
      if (isUnassigned) {
        acc.unassigned = (acc.unassigned || 0) + 1;
        return acc;
      }

      const key = String(ticket.assignedToId);
      const label = ticket.assignee || `User ${key}`;
      acc.assignees = acc.assignees || {};
      acc.assignees[key] = acc.assignees[key] || { value: `user:${key}`, label, count: 0 };
      acc.assignees[key].count += 1;
      return acc;
    }, {});

    const assigneeOptions = [
      { value: 'unassigned', label: t('unassigned', 'Unassigned'), count: assigneeMap.unassigned || 0 },
      { value: 'me', label: t('assignedToMe', 'Assigned to Me'), count: tickets.filter((ticket) => isCurrentUserTicket(ticket)).length },
      { value: 'my-team', label: t('myTeam', 'My Team'), count: tickets.filter((ticket) => ticket.assignee !== 'Unassigned' && !isCurrentUserTicket(ticket)).length },
      ...Object.values(assigneeMap.assignees || {})
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .map((entry) => entry)
    ];

    const departmentOptions = Object.entries(departmentCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([department, count]) => ({
        value: slugify(department),
        label: department,
        count,
      }));

    const savedFilterCounts = [
      { id: 1, name: t('myOpenTickets', 'My Open Tickets'), icon: 'User', count: tickets.filter((ticket) => ticket.status === 'open' && isCurrentUserTicket(ticket)).length },
      { id: 2, name: t('highPriority', 'High Priority'), icon: 'AlertTriangle', count: tickets.filter((ticket) => ['critical', 'high'].includes(ticket.priority)).length },
      { id: 3, name: t('overdueSLA', 'Overdue SLA'), icon: 'Clock', count: tickets.filter((ticket) => ticket.slaHours <= 0).length },
      { id: 4, name: t('unassigned', 'Unassigned'), icon: 'UserX', count: tickets.filter((ticket) => normalizeText(ticket.assignee) === 'unassigned').length },
    ];

    return {
      saved: savedFilterCounts,
      status: [
        { value: 'open', label: t('open', 'Open'), count: statusCounts.open || 0 },
        { value: 'in-progress', label: t('inProgress', 'In Progress'), count: statusCounts['in-progress'] || 0 },
        { value: 'pending', label: t('pending', 'Pending'), count: statusCounts.pending || 0 },
        { value: 'resolved', label: t('resolved', 'Resolved'), count: statusCounts.resolved || 0 },
        { value: 'closed', label: t('closed', 'Closed'), count: statusCounts.closed || 0 },
      ],
      priority: [
        { value: 'critical', label: t('critical', 'Critical'), count: priorityCounts.critical || 0, color: 'text-error' },
        { value: 'high', label: t('high', 'High'), count: priorityCounts.high || 0, color: 'text-warning' },
        { value: 'medium', label: t('medium', 'Medium'), count: priorityCounts.medium || 0, color: 'text-primary' },
        { value: 'low', label: t('low', 'Low'), count: priorityCounts.low || 0, color: 'text-muted-foreground' },
      ],
      department: departmentOptions,
      assignee: assigneeOptions,
      savedFilters: savedFilterCounts
    };
  }, [tickets, t, isCurrentUserTicket, erpDepartments]);

  const handleCreateTicket = async (newTicket) => {
    try {
      const res = await ticketsAPI.create(newTicket);
      if (res.data) setTickets(prev => [mapTicket(res.data), ...prev]);
    } catch (err) {
      console.error(t('failedToCreateTicket', 'Failed to create ticket:'), err);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      <div className="flex pt-16">
        <FilterSidebar
          isOpen={filterSidebarOpen}
          onClose={() => setFilterSidebarOpen(false)}
          onApplyFilters={handleApplyFilters}
          activeFilters={activeFilters}
          sidebarCounts={sidebarCounts}
          onSavedFilterSelect={handleSavedFilterSelect}
        />
        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{t('ticketManagementCenter', 'Ticket Management Center')}</h1>
                <p className="text-sm md:text-base text-muted-foreground">{t('manageTrackTickets', 'Manage and track all support tickets across your organization')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={filterSidebarOpen ? 'default' : 'outline'}
                  iconName="Filter"
                  onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
                  className="whitespace-nowrap"
                >
                  <span className="flex items-center gap-2">
                    {t('filters', 'Filters')}
                    {activeSidebarFilterCount > 0 && (
                      <span className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                        filterSidebarOpen ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                      }`}>
                        {activeSidebarFilterCount}
                      </span>
                    )}
                  </span>
                </Button>
                <Button variant="ghost" iconName="RefreshCw" onClick={fetchTickets} disabled={loading}>
                  {loading ? t('loading', 'Loading...') : t('refresh', 'Refresh')}
                </Button>
                <Button variant="default" iconName="Plus" iconPosition="left" onClick={() => setCreateModalOpen(true)}>{t('newTicket', 'New Ticket')}</Button>
              </div>
            </div>

            <StatsCards stats={stats} />
            <div className="mb-6 md:mb-8">
              <TicketOwnershipPanel tickets={tickets} onOpenDepartment={handleOpenDepartment} />
            </div>
            <ManageEngineOnPremSnapshot
              compact
              title={t('manageEngineTicketQueueContext', 'ManageEngine Ticket Queue Context')}
              description={t('manageEngineTicketQueueContextDesc', 'On-prem ServiceDesk requests and OpManager alerts beside the local ticket queue.')}
            />
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              filters={searchFilters}
              onQuickFilter={handleQuickFilter}
              onSaveFilter={handleSaveFilter}
              departmentOptions={sidebarCounts.department}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {loading ? (
      <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Icon name="Loader" size={14} className="animate-spin" />{t('loadingTickets', 'Loading tickets...')}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">{t('showingTickets', 'Showing')} {filteredTickets?.length} {t('ofTickets', 'of')} {tickets?.length} {t('ticketsLabel', 'tickets')}</span>
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
              <span className="text-sm text-muted-foreground">{t('showingTickets', 'Showing')} {Math.ceil(filteredTickets?.length / 25) || 1} {t('ofTickets', 'of')} {Math.ceil(filteredTickets?.length / 25) || 1}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" iconName="ChevronLeft" disabled>{t('previousBtn', 'Previous')}</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm" iconName="ChevronRight" iconPosition="right">{t('nextBtn', 'Next')}</Button>
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
