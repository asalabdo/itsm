import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import ThemeToggle from './ThemeToggle';
import notificationService from '../../services/notificationService';
import { ticketsAPI } from '../../services/api';
import { isBackendReady, markBackendReady } from '../../services/backendAvailability';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [userRole, setUserRole] = useState('IT Service Manager');
  const [headerSearch, setHeaderSearch] = useState('');
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [newTicketAlert, setNewTicketAlert] = useState(null);
  const [ticketProgress, setTicketProgress] = useState({ open: 0, inProgress: 0, resolved: 0, total: 0 });
  const [slaBreaches, setSlaBreaches] = useState(0);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const prevTicketIdsRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    if (!isStatsOpen) return;
    const handler = (e) => { if (statsRef.current && !statsRef.current.contains(e.target)) setIsStatsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isStatsOpen]);

  // Simulate connection status monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['connected', 'warning', 'error'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      setConnectionStatus(randomStatus);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isBackendReady()) {
      setNotifications([]);
      return undefined;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      markBackendReady(true);
    } catch (error) {
      setNotifications([]);
      markBackendReady(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const resolveNotificationLink = (notification) => {
    if (notification?.link) {
      return notification.link;
    }

    const content = `${notification?.title || ''} ${notification?.message || ''}`;
    const codeMatch = content.match(/\b(TKT|CHG|AST)-\d+\b/i);
    if (codeMatch) {
      return `/search?q=${encodeURIComponent(codeMatch[0])}`;
    }

    return null;
  };

  const handleNotificationClick = async (notification) => {
    await handleMarkAsRead(notification.id);

    const target = resolveNotificationLink(notification);
    if (target) {
      navigate(target);
      setIsNotificationsOpen(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const res = await ticketsAPI.getAll();
      const tickets = Array.isArray(res?.data) ? res.data : [];
      const csvRows = [
        ['Ticket ID', 'Title', 'Status', 'Priority', 'Category', 'Created At'].join(','),
        ...tickets.map((ticket) => [
          `"${String(ticket?.ticketNumber || ticket?.id || '').replace(/"/g, '""')}"`,
          `"${String(ticket?.title || '').replace(/"/g, '""')}"`,
          `"${String(ticket?.status || '').replace(/"/g, '""')}"`,
          `"${String(ticket?.priority || '').replace(/"/g, '""')}"`,
          `"${String(ticket?.category || '').replace(/"/g, '""')}"`,
          `"${String(ticket?.createdAt || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `itsm-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export report:', error);
      navigate('/reports-analytics');
    }
  };

  const handleHeaderSearch = (event) => {
    event?.preventDefault();
    const query = headerSearch.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setHeaderSearch('');
    setIsHeaderSearchOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!isBackendReady()) {
      setCriticalAlerts(0);
      return undefined;
    }

    const fetchTicketStats = async () => {
      try {
        const res = await ticketsAPI.getAll();
        const tickets = res?.data || [];

        // Critical alerts
        const critCount = tickets
          .filter(t => t.priority === 'Critical' && t.status !== 'Resolved' && t.status !== 'Closed')
          .length;
        setCriticalAlerts(critCount);

        // Pending requests (Open or In Progress)
        const open = tickets.filter(t => t.status === 'Open').length;
        const inProgress = tickets.filter(t => t.status === 'In Progress').length;
        setPendingCount(open + inProgress);

        // Progress breakdown
        const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
        setTicketProgress({ open, inProgress, resolved, total: tickets.length });

        // SLA breaches: overdue tickets (past dueDate and not resolved)
        const now = new Date();
        const breached = tickets.filter(t =>
          t.dueDate && new Date(t.dueDate) < now &&
          t.status !== 'Resolved' && t.status !== 'Closed'
        ).length;
        setSlaBreaches(breached);

        // New ticket detection
        const currentIds = new Set(tickets.map(t => t.id));
        if (prevTicketIdsRef.current !== null) {
          const newTickets = tickets.filter(t => !prevTicketIdsRef.current.has(t.id));
          if (newTickets.length > 0) {
            setNewTicketAlert({ count: newTickets.length, title: newTickets[0]?.title || 'New Ticket' });
          }
        }
        prevTicketIdsRef.current = currentIds;

        markBackendReady(true);
      } catch {
        setCriticalAlerts(0);
        markBackendReady(false);
      }
    };

    fetchTicketStats();
    const interval = setInterval(fetchTicketStats, 45000);
    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      label: 'Operations',
      path: '/it-operations-command-center',
      icon: 'Activity',
      description: 'Real-time monitoring and incident response'
    },
    {
      label: 'Analytics',
      path: '/service-performance-analytics',
      icon: 'BarChart3',
      description: 'Performance analysis and reporting',
      submenu: [
        { label: 'Service Performance', path: '/service-performance-analytics' },
        { label: 'Advanced Analytics', path: '/advanced-analytics' },
        { label: 'Reports & Analytics', path: '/reporting-and-analytics-hub' },
        { label: 'Change Management', path: '/change-management-dashboard' },
        { label: 'Asset Lifecycle', path: '/asset-lifecycle-management' },
        { label: 'Manager Dashboard', path: '/manager-dashboard', icon: 'LineChart' },
      ]
    },
    {
      label: 'Executive',
      path: '/executive-it-service-summary',
      icon: 'TrendingUp',
      description: 'Strategic overview and business metrics'
    }
  ];

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'Wifi';
      case 'warning': return 'WifiOff';
      case 'error': return 'AlertTriangle';
      default: return 'Wifi';
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/service-performance-analytics') {
      return ['/service-performance-analytics', '/advanced-analytics', '/reporting-and-analytics-hub', '/change-management-dashboard', '/asset-lifecycle-management', '/sla-policies', '/ticket-sla', '/priorities', '/escalations']?.includes(location?.pathname);
    }
    return location?.pathname === path;
  };

  const bannerCount = (criticalAlerts > 0 ? 1 : 0) + (newTicketAlert ? 1 : 0);
  const progressPct = ticketProgress.total > 0 ? Math.round((ticketProgress.resolved / ticketProgress.total) * 100) : 0;
  const inProgressPct = ticketProgress.total > 0 ? Math.round((ticketProgress.inProgress / ticketProgress.total) * 100) : 0;

  return (
    <>
      {/* New Ticket Alert Banner */}
      {newTicketAlert && (
        <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-2 z-[1101]">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Icon name="TicketPlus" size={18} className="animate-bounce" />
              <span className="text-sm font-medium">
                {newTicketAlert.count > 1
                  ? `${newTicketAlert.count} new tickets submitted`
                  : `New ticket: ${newTicketAlert.title}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80 h-7 px-3 text-xs">
                <Link to="/ticket-management-center">View</Link>
              </Button>
              <button onClick={() => setNewTicketAlert(null)} className="text-primary-foreground/70 hover:text-primary-foreground">
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Critical Alert Banner */}
      {criticalAlerts > 0 && (
        <div className={`fixed left-0 right-0 bg-error text-error-foreground px-4 py-3 z-[2200] ${newTicketAlert ? 'bottom-9' : 'bottom-0'}`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Icon name="AlertTriangle" size={20} className="animate-pulse" />
              <span className="font-medium">
                {criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''} - Immediate Action Required
              </span>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-error-foreground hover:bg-error/20">
              <Link to="/search?priority=Critical">
                View Details
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      {/* Main Header */}
      <header className={`fixed left-0 right-0 bg-card backdrop-blur-sm border-b border-border/50 z-[1000] ${bannerCount === 2 ? 'top-[72px]' : bannerCount === 3 ? 'top-[36px]' : 'top-0'}`}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/it-operations-command-center" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="ITSM Hub"
                className="w-9 h-9 rounded-lg object-contain bg-background border border-border p-1"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground font-heading">
                  ITSM Hub
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <div key={item?.path} className="relative group">
                <Link
                  to={item?.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md nav-transition ${
                    isActiveRoute(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={item?.description}
                >
                  <Icon name={item?.icon} size={18} />
                  <span className="font-medium">{item?.label}</span>
                </Link>

                {/* Submenu for Analytics */}
                {item?.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-1200">
                    <div className="py-2">
                      {item?.submenu?.map((subItem) => (
                        <Link
                          key={subItem?.path}
                          to={subItem?.path}
                          className={`block px-4 py-2 text-sm nav-transition ${
                            location?.pathname === subItem?.path
                              ? 'bg-primary text-primary-foreground'
                              : 'text-popover-foreground hover:bg-muted'
                          }`}
                        >
                          {subItem?.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">

            {/* Search — icon only, expands on click */}
            <div className="relative">
              <Button variant="ghost" size="sm" title="Search" onClick={() => setIsHeaderSearchOpen(p => !p)} className="h-9 w-9">
                <Icon name="Search" size={17} />
              </Button>
              {isHeaderSearchOpen && (
                <form onSubmit={handleHeaderSearch} className="absolute top-full right-0 mt-2 flex items-center gap-2 rounded-full border border-border bg-popover px-2 py-1.5 z-[1200] shadow-lg">
                  <Input type="search" value={headerSearch} onChange={e => setHeaderSearch(e.target.value)}
                    placeholder="Search tickets..." className="h-8 w-52 border-0 bg-transparent px-3 text-sm focus-visible:ring-0" autoFocus />
                  <Button type="submit" variant="default" size="sm" className="h-8 rounded-full px-3 text-xs">Go</Button>
                </form>
              )}
            </div>

            {/* Quick Create */}
            <Button asChild variant="default" size="sm" className="h-8 px-2 gap-1" title="New Ticket">
              <Link to="/ticket-creation">
                <Icon name="Plus" size={15} />
                <span className="hidden md:inline text-xs font-medium">New Ticket</span>
              </Link>
            </Button>

            {/* Pending badge */}
            {pendingCount > 0 && (
              <Link to="/ticket-management-center" title={`${pendingCount} pending`}
                className="flex items-center gap-1 px-2 h-8 rounded-md hover:bg-muted transition-colors">
                <Icon name="Clock" size={15} className="text-warning" />
                <span className="text-xs font-bold text-warning">{pendingCount}</span>
                <span className="hidden md:inline text-xs text-muted-foreground">Pending</span>
              </Link>
            )}

            {/* SLA breach badge */}
            {slaBreaches > 0 && (
              <Link to="/ticket-sla" title={`${slaBreaches} SLA breach${slaBreaches > 1 ? 'es' : ''}`}
                className="flex items-center gap-1 px-2 h-8 rounded-md hover:bg-muted transition-colors">
                <Icon name="AlertOctagon" size={15} className="text-error animate-pulse" />
                <span className="text-xs font-bold text-error">{slaBreaches}</span>
                <span className="hidden md:inline text-xs text-muted-foreground">SLA</span>
              </Link>
            )}

            {/* Progress bar + stats popover */}
            {ticketProgress.total > 0 && (
              <div ref={statsRef} className="relative">
                <button onClick={() => setIsStatsOpen(p => !p)}
                  className="flex flex-col gap-0.5 w-24 px-1 py-1 rounded-md hover:bg-muted transition-colors"
                  title="Ticket progress — click for breakdown">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Progress</span>
                    <span className="text-[10px] font-semibold">{progressPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-success transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    <div className="h-full bg-primary/60 transition-all duration-500" style={{ width: `${inProgressPct}%` }} />
                  </div>
                </button>
                {isStatsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-popover border border-border rounded-xl shadow-lg p-4 z-[1200] space-y-2">
                    <p className="text-xs font-semibold text-popover-foreground">Ticket Breakdown</p>
                    {[
                      { label: 'Open', value: ticketProgress.open, color: 'bg-warning' },
                      { label: 'In Progress', value: ticketProgress.inProgress, color: 'bg-primary' },
                      { label: 'Resolved', value: ticketProgress.resolved, color: 'bg-success' },
                      { label: 'Total', value: ticketProgress.total, color: 'bg-muted-foreground' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <span className="text-xs font-semibold text-popover-foreground">{value}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <Link to="/ticket-management-center" className="text-xs text-primary hover:underline" onClick={() => setIsStatsOpen(false)}>View all tickets →</Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Connection status dot */}
            <div title={`Connection: ${connectionStatus}`} className="flex items-center px-1">
              <Icon name={getConnectionStatusIcon()} size={16} className={getConnectionStatusColor()} />
            </div>

            <ThemeToggle />

            <Button variant="ghost" size="sm" title="Refresh" className="h-9 w-9"
              onClick={() => window.dispatchEvent(new CustomEvent('itsm:refresh'))}>
              <Icon name="RefreshCw" size={16} />
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <Button variant="ghost" size="sm" title="Notifications" className="relative h-9 w-9"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                <Icon name="Bell" size={17} className={unreadCount > 0 ? 'text-primary' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-error text-error-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border border-background">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-popover border border-border rounded-2xl overflow-hidden z-[1200] shadow-xl">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
                    <h3 className="font-bold text-sm text-popover-foreground">Notifications</h3>
                    <button onClick={() => notificationService.markAllAsRead().then(fetchNotifications)}
                      className="text-xs font-semibold text-primary hover:opacity-80">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Icon name="Inbox" size={28} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">All caught up!</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} type="button"
                        className={`w-full text-left p-3 border-b border-border hover:bg-muted/60 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                        onClick={() => handleNotificationClick(n)}>
                        <div className="flex gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${n.type === 'Success' ? 'bg-success/10 text-success' : n.type === 'Warning' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                            <Icon name={n.type === 'Success' ? 'CheckCircle' : n.type === 'Warning' ? 'AlertCircle' : 'Info'} size={13} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${!n.isRead ? 'font-semibold' : ''} text-popover-foreground`}>{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button variant="ghost" size="sm" title="Export CSV" className="h-9 w-9" onClick={handleExportReport}>
              <Icon name="Download" size={16} />
            </Button>
          </div>

            {/* User */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center gap-1.5 h-9 px-2">
                <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center shrink-0">
                  <Icon name="User" size={14} className="text-accent-foreground" />
                </div>
                <span className="text-xs font-medium max-w-[100px] truncate">{userRole}</span>
                <Icon name="ChevronDown" size={14} className="shrink-0" />
              </Button>
              <div className="absolute top-full right-0 mt-1 w-56 bg-popover border border-border rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-[1200] shadow-lg">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-popover-foreground">{userRole}</p>
                    <p className="text-xs text-muted-foreground">Operations Center</p>
                  </div>
                  <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">Dashboard Settings</button>
                  <button onClick={() => navigate('/settings')} className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">Notification Preferences</button>
                  <button onClick={() => navigate('/manager-dashboard')} className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">Switch Role</button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-muted nav-transition">Sign Out</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <div key={item?.path}>
                  <Link
                    to={item?.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md nav-transition ${
                      isActiveRoute(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon name={item?.icon} size={20} />
                    <div>
                      <div className="font-medium">{item?.label}</div>
                      <div className="text-xs text-muted-foreground">{item?.description}</div>
                    </div>
                  </Link>

                  {/* Mobile Submenu */}
                  {item?.submenu && isActiveRoute(item?.path) && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item?.submenu?.map((subItem) => (
                        <Link
                          key={subItem?.path}
                          to={subItem?.path}
                          className={`block px-4 py-2 text-sm rounded-md nav-transition ${
                            location?.pathname === subItem?.path
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem?.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Stats */}
              <div className="px-4 py-3 border-t border-border mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Requests</span>
                  <span className="text-sm font-semibold text-warning">{pendingCount}</span>
                </div>
                {slaBreaches > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">SLA Breaches</span>
                    <span className="text-sm font-semibold text-error">{slaBreaches}</span>
                  </div>
                )}
                {ticketProgress.total > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resolution Progress</span>
                      <span className="text-sm font-semibold text-foreground">{progressPct}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
                      <div className="h-full bg-success transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      <div className="h-full bg-primary/60 transition-all duration-500" style={{ width: `${inProgressPct}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Connection Status</span>
                  <div className="flex items-center space-x-2">
                    <Icon name={getConnectionStatusIcon()} size={16} className={getConnectionStatusColor()} />
                    <span className={`text-sm capitalize ${getConnectionStatusColor()}`}>{connectionStatus}</span>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
