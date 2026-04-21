import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import MetricCard from './components/MetricCard';
import TeamPerformanceTable from './components/TeamPerformanceTable';
import SLAAlertPanel from './components/SLAAlertPanel';
import WorkloadBalancer from './components/WorkloadBalancer';
import PerformanceChart from './components/PerformanceChart';
import QuickActions from './components/QuickActions';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { dashboardAPI, usersAPI, ticketsAPI } from '../../services/api';
import { downloadCsv } from '../../services/exportUtils';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ManagerDashboard = () => {
  const { language, isRtl } = useLanguage();
  const t = useMemo(() => (key, fallback) => getTranslation(language, key, fallback), [language]);
  const locale = String(language || 'en').toLowerCase().startsWith('ar') ? 'ar-EG' : 'en-US';
  const [dateRange, setDateRange] = useState('month');
  const [, setMetrics] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [, setSlaAlerts] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [, setChartData] = useState([]);
  const [, setPendingTickets] = useState([]);

  const translateCategory = useCallback((category) => {
    const normalized = String(category || 'General').toLowerCase().replace(/[\s_-]+/g, '');
    const categoryMap = {
      technicalsupport: t('technicalSupport', 'Technical Support'),
      software: t('software', 'Software'),
      alert: t('alert', 'Alert'),
      incident: t('incident', 'Incident'),
      access: t('access', 'Access'),
      servicerequest: t('serviceRequest', 'Service Request'),
      network: t('network', 'Network'),
      problem: t('problem', 'Problem'),
      email: t('email', 'Email'),
      hardware: t('hardware', 'Hardware'),
      printing: t('printing', 'Printing'),
      general: t('generalInquiry', 'General Inquiry'),
    };
    return categoryMap[normalized] || category || t('generalInquiry', 'General Inquiry');
  }, [t]);

  const formatTimeRemaining = useCallback((dueDate) => {
    if (!dueDate) return 'N/A';
    const diff = new Date(dueDate) - new Date();
    if (diff < 0) return `${t('overdueBy', 'Overdue by')} ${Math.floor(-diff / 60000)} ${t('minutesShort', 'min')}`;
    const hours = Math.floor(diff / 3600000);
    return hours > 0
      ? `${hours}${t('hoursShort', 'h')} ${t('remaining', 'remaining')}`
      : `${Math.floor(diff / 60000)} ${t('minutesShort', 'min')} ${t('remaining', 'remaining')}`;
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, usersRes, ticketsRes] = await Promise.all([
          dashboardAPI.getSummary(),
          usersAPI.getAll(),
          ticketsAPI.getAll()
        ]);

        const s = summaryRes?.data;
        if (s && Object.keys(s).length > 0) {
          const total = s.totalTickets || 0;
          const resolved = s.resolvedTickets || 0;
          const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
          const avgTime = s.averageResolutionTime != null ? `${Number(s.averageResolutionTime).toFixed(1)}h` : '0h';

          setMetrics([
            { title: t('totalTickets', 'Total Tickets'), value: String(total), change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: [total] },
            { title: t('resolutionRate', 'Resolution Rate'), value: `${resRate}%`, change: '', changeType: 'positive', icon: 'CheckCircle', iconColor: 'var(--color-success)', trend: [] },
            { title: t('slaCompliance', 'SLA Compliance'), value: '0%', change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-warning)', trend: [] },
            { title: t('avgResponseTime', 'Avg Response Time'), value: avgTime, change: '', changeType: 'positive', icon: 'Zap', iconColor: 'var(--color-accent)', trend: [] }
          ]);
        }

        const users = usersRes?.data || [];
        const tickets = ticketsRes?.data || [];
        setAllTickets(tickets);
        setPendingTickets(tickets.filter(t => !t.assignedToId && !['Resolved', 'Closed'].includes(String(t.status || ''))));
        
        const mappedTeam = users.map((u) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Unknown',
          email: u.email || '',
          avatar: u.avatarUrl || '',
          avatarAlt: (u.username || 'U').substring(0, 2).toUpperCase(),
          status: 'available',
          tickets: tickets.filter(t => t.assignedToId === u.id).length,
          avgResolution: '0h',
          satisfaction: 0,
          workload: Math.min(95, 50 + tickets.filter(t => t.assignedToId === u.id).length * 8)
        }));
        
        setTeamData(mappedTeam);

        const criticalTickets = tickets.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved');
        const slaAlertsList = criticalTickets.slice(0, 5).map((ticket, i) => ({
          id: i + 1,
          ticketId: ticket.ticketNumber || String(ticket.id),
          title: ticket.title || 'Unknown',
          description: (ticket.description || '').slice(0, 80),
          severity: ticket.priority?.toLowerCase() === 'critical' ? 'critical' : 'high',
          timeRemaining: formatTimeRemaining(ticket.dueDate),
          assignedTo: ticket.assignedToName || t('unassigned', 'Unassigned'),
          slaDeadline: ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : 'N/A',
          category: translateCategory(ticket.category)
        }));
        
        setSlaAlerts(slaAlertsList);

        const groupedByDay = tickets.reduce((acc, ticket) => {
          const key = new Date(ticket.createdAt || Date.now()).toLocaleDateString(locale, { weekday: 'short' });
          if (!acc[key]) {
            acc[key] = { name: key, tickets: 0, resolved: 0, sla: 0 };
          }
          acc[key].tickets += 1;
          if (String(ticket.status || '').toLowerCase() === 'resolved') acc[key].resolved += 1;
          if (String(ticket.slaStatus || '').toLowerCase() !== 'breached') acc[key].sla += 1;
          return acc;
        }, {});
        setChartData(Object.values(groupedByDay));

        const totalTickets = tickets.length;
        const resolvedTickets = tickets.filter(t => String(t.status || '').toLowerCase() === 'resolved').length;
        const slaCompliant = tickets.filter(t => String(t.slaStatus || '').toLowerCase() !== 'breached').length;
        const avgResponse = totalTickets > 0 ? (tickets.reduce((sum, t) => sum + Math.max(1, Math.floor(((new Date(t.updatedAt || Date.now())) - new Date(t.createdAt || Date.now())) / 3600000)), 0) / totalTickets).toFixed(1) : '0.0';
        setMetrics([
          { title: t('totalTickets', 'Total Tickets'), value: String(totalTickets), change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: [totalTickets] },
          { title: t('resolutionRate', 'Resolution Rate'), value: `${totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0}%`, change: '', changeType: 'positive', icon: 'CheckCircle', iconColor: 'var(--color-success)', trend: [] },
          { title: t('slaCompliance', 'SLA Compliance'), value: `${totalTickets > 0 ? ((slaCompliant / totalTickets) * 100).toFixed(0) : 0}%`, change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-warning)', trend: [] },
          { title: t('avgResponseTime', 'Avg Response Time'), value: `${avgResponse}h`, change: '', changeType: 'positive', icon: 'Zap', iconColor: 'var(--color-accent)', trend: [] }
        ]);
      } catch (err) {
        console.error('Failed to load manager dashboard data:', err);
      }
    };
    fetchData();
  }, [t, locale, formatTimeRemaining, translateCategory]);

  const rangeToDays = (range) => {
    switch (range) {
      case 'week':
        return 7;
      case 'quarter':
        return 90;
      case 'month':
      default:
        return 30;
    }
  };

  const filteredTickets = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeToDays(dateRange));
    return allTickets.filter((ticket) => {
      const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null;
      return createdAt ? createdAt >= cutoff : true;
    });
  }, [allTickets, dateRange]);

  const filteredChartData = useMemo(() => {
    const groupedByDay = filteredTickets.reduce((acc, ticket) => {
      const key = new Date(ticket.createdAt || Date.now()).toLocaleDateString(locale, { weekday: 'short' });
      if (!acc[key]) {
        acc[key] = { name: key, tickets: 0, resolved: 0, sla: 0 };
      }
      acc[key].tickets += 1;
      if (String(ticket.status || '').toLowerCase() === 'resolved') acc[key].resolved += 1;
      if (String(ticket.slaStatus || '').toLowerCase() !== 'breached') acc[key].sla += 1;
      return acc;
    }, {});
    return Object.values(groupedByDay);
  }, [filteredTickets, locale]);

  const visibleMetrics = useMemo(() => {
    const totalTickets = filteredTickets.length;
    const resolvedTickets = filteredTickets.filter((t) => String(t.status || '').toLowerCase() === 'resolved').length;
    const slaCompliant = filteredTickets.filter((t) => String(t.slaStatus || '').toLowerCase() !== 'breached').length;
    const avgResponse = totalTickets > 0
      ? (filteredTickets.reduce((sum, t) => sum + Math.max(1, Math.floor(((new Date(t.updatedAt || Date.now())) - new Date(t.createdAt || Date.now())) / 3600000)), 0) / totalTickets).toFixed(1)
      : '0.0';

    return [
      { title: t('totalTickets', 'Total Tickets'), value: String(totalTickets), change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: [totalTickets] },
      { title: t('resolutionRate', 'Resolution Rate'), value: `${totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(1) : 0}%`, change: '', changeType: 'positive', icon: 'CheckCircle', iconColor: 'var(--color-success)', trend: [] },
      { title: t('slaCompliance', 'SLA Compliance'), value: `${totalTickets > 0 ? ((slaCompliant / totalTickets) * 100).toFixed(0) : 0}%`, change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-warning)', trend: [] },
      { title: t('avgResponseTime', 'Avg Response Time'), value: `${avgResponse}h`, change: '', changeType: 'positive', icon: 'Zap', iconColor: 'var(--color-accent)', trend: [] }
    ];
  }, [filteredTickets, t]);

  const visibleTeamData = useMemo(() => {
    return teamData.map((agent) => {
      const agentTickets = filteredTickets.filter((t) => t.assignedToId === agent.id);
      return {
        ...agent,
        tickets: agentTickets.length,
        workload: Math.min(95, 50 + agentTickets.length * 8)
      };
    });
  }, [teamData, filteredTickets]);

  const visiblePendingTickets = useMemo(() => {
    return filteredTickets.filter((t) => !t.assignedToId && !['Resolved', 'Closed'].includes(String(t.status || '')));
  }, [filteredTickets]);

  const visibleSlaAlerts = useMemo(() => {
    return filteredTickets
      .filter((t) => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved')
      .slice(0, 5)
      .map((ticket, i) => ({
        id: i + 1,
        ticketId: ticket.ticketNumber || String(ticket.id),
        title: ticket.title || 'Unknown',
        description: (ticket.description || '').slice(0, 80),
        severity: ticket.priority?.toLowerCase() === 'critical' ? 'critical' : 'high',
        timeRemaining: formatTimeRemaining(ticket.dueDate),
        assignedTo: ticket.assignedToName || t('unassigned', 'Unassigned'),
        slaDeadline: ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : 'N/A',
        category: translateCategory(ticket.category)
      }));
  }, [filteredTickets, t, formatTimeRemaining, translateCategory]);

  const handleExportReport = () => {
    downloadCsv(
      filteredTickets.map((ticket) => ([
        ticket.id,
        ticket.title,
        ticket.requester || '',
        ticket.assignee || '',
        ticket.statusLabel || '',
        ticket.priorityLabel || '',
        ticket.department || '',
        ticket.createdAt || ''
      ])),
      `manager-dashboard-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`,
      [t('ticketId', 'Ticket ID'), t('title', 'Title'), t('requester', 'Requester'), t('assignee', 'Assignee'), t('status', 'Status'), t('priority', 'Priority'), t('department', 'Department'), t('createdAt', 'Created At')]
    );
  };






  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">{t('managerDashboard', 'Manager Dashboard')}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{t('monitorTeamPerformance', 'Monitor team performance and optimize workflow efficiency')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              {['week', 'month', 'quarter']?.map((range) =>
              <button
                key={range}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth ${
                dateRange === range ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`
                }
                onClick={() => setDateRange(range)}>

                  {t(range, range?.charAt(0)?.toUpperCase() + range?.slice(1))}
                </button>
              )}
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
              onClick={handleExportReport}
            >
              <Icon name="Download" size={18} />
              <span className="hidden md:inline">{t('exportReport', 'Export Report')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {visibleMetrics?.map((metric, index) =>
          <MetricCard key={index} {...metric} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart data={filteredChartData} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <ManageEngineOnPremSnapshot
            title={t('manageEngineManagerContext', 'ManageEngine Manager Context')}
            description={t('manageEngineManagerContextDesc', 'External ServiceDesk demand and OpManager monitoring pressure alongside team workload.')}
          />
        </div>

        <div className="mb-6 md:mb-8">
          <TeamPerformanceTable teamData={visibleTeamData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <SLAAlertPanel alerts={visibleSlaAlerts} />
          <WorkloadBalancer agents={visibleTeamData} pendingTickets={visiblePendingTickets} />
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">{t('ticketsByCategory', 'Tickets by Category')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              filteredTickets.reduce((acc, ticket) => {
                const category = translateCategory(ticket.category);
                acc[category] = (acc[category] || 0) + 1;
                return acc;
              }, {})
            ).map(([name, count], index) => (
              <div key={index} className="p-4 bg-background border border-border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                    <Icon name="Tag" size={20} color="var(--color-primary)" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground flex-1">{name}</h3>
                </div>
                <div className="text-sm text-muted-foreground caption">
                  <Icon name="Ticket" size={14} className="inline mr-1" />
                  {count} {t('ticketsCount', 'tickets')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>);

};

export default ManagerDashboard;
