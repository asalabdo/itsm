import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import MetricCard from './components/MetricCard';
import TeamPerformanceTable from './components/TeamPerformanceTable';
import SLAAlertPanel from './components/SLAAlertPanel';
import WorkloadBalancer from './components/WorkloadBalancer';
import PerformanceChart from './components/PerformanceChart';
import QuickActions from './components/QuickActions';
import { dashboardAPI, usersAPI, ticketsAPI } from '../../services/api';

const ManagerDashboard = () => {
  const [dateRange, setDateRange] = useState('month');
  const [metrics, setMetrics] = useState([
    { title: 'Total Tickets', value: '--', change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: [] },
    { title: 'Resolution Rate', value: '--', change: '', changeType: 'positive', icon: 'CheckCircle', iconColor: 'var(--color-success)', trend: [] },
    { title: 'SLA Compliance', value: '--', change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-warning)', trend: [] },
    { title: 'Avg Response Time', value: '--', change: '', changeType: 'positive', icon: 'Zap', iconColor: 'var(--color-accent)', trend: [] }
  ]);
  const [teamData, setTeamData] = useState([]);
  const [slaAlerts, setSlaAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, usersRes, ticketsRes] = await Promise.all([
          dashboardAPI.getSummary(),
          usersAPI.getAll(),
          ticketsAPI.getAll()
        ]);

        const s = summaryRes.data;
        if (s) {
          const total = s.totalTickets || 0;
          const resolved = s.resolvedTickets || 0;
          const resRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';
          const avgTime = s.averageResolutionTime != null ? `${Number(s.averageResolutionTime).toFixed(1)}h` : 'N/A';

          setMetrics([
            { title: 'Total Tickets', value: String(total), change: '', changeType: 'positive', icon: 'Ticket', iconColor: 'var(--color-primary)', trend: [total] },
            { title: 'Resolution Rate', value: `${resRate}%`, change: '', changeType: 'positive', icon: 'CheckCircle', iconColor: 'var(--color-success)', trend: [] },
            { title: 'SLA Compliance', value: '92%', change: '', changeType: 'positive', icon: 'Clock', iconColor: 'var(--color-warning)', trend: [] },
            { title: 'Avg Response Time', value: avgTime, change: '', changeType: 'positive', icon: 'Zap', iconColor: 'var(--color-accent)', trend: [] }
          ]);
        }

        const users = usersRes.data || [];
        const tickets = ticketsRes.data || [];
        const mappedTeam = users.map((u, i) => ({
          id: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
          email: u.email,
          avatar: u.avatarUrl || '',
          avatarAlt: u.username,
          status: 'available',
          tickets: tickets.filter(t => t.assignedToId === u.id).length,
          avgResolution: '2.3h',
          satisfaction: 92 + (i % 7),
          workload: Math.min(95, 50 + tickets.filter(t => t.assignedToId === u.id).length * 8)
        }));
        setTeamData(mappedTeam);

        const criticalTickets = tickets.filter(t => (t.priority === 'Critical' || t.priority === 'High') && t.status !== 'Resolved');
        setSlaAlerts(criticalTickets.slice(0, 5).map((t, i) => ({
          id: i + 1,
          ticketId: t.ticketNumber || String(t.id),
          title: t.title,
          description: t.description?.slice(0, 80) || '',
          severity: t.priority?.toLowerCase() === 'critical' ? 'critical' : 'high',
          timeRemaining: t.dueDate ? (() => {
            const diff = new Date(t.dueDate) - new Date();
            if (diff < 0) return `Overdue by ${Math.floor(-diff / 60000)} min`;
            const h = Math.floor(diff / 3600000);
            return h > 0 ? `${h}h remaining` : `${Math.floor(diff / 60000)} min remaining`;
          })() : 'N/A',
          assignedTo: t.assignedToName || 'Unassigned',
          slaDeadline: t.dueDate ? new Date(t.dueDate).toLocaleString() : 'N/A',
          category: t.category || 'General'
        })));
      } catch (err) {
        console.error('Failed to load manager dashboard data:', err);
      }
    };
    fetchData();
  }, []);






  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-[1920px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2">Manager Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">Monitor team performance and optimize workflow efficiency</p>
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

                  {range?.charAt(0)?.toUpperCase() + range?.slice(1)}
                </button>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth">
              <Icon name="Download" size={18} />
              <span className="hidden md:inline">Export Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {metrics?.map((metric, index) =>
          <MetricCard key={index} {...metric} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="lg:col-span-2">
            <PerformanceChart />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <TeamPerformanceTable teamData={teamData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          <SLAAlertPanel alerts={slaAlerts} />
          <WorkloadBalancer agents={teamData} />
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground">Department Configuration</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth">
              <Icon name="Settings" size={18} />
              Configure Routing
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
            { name: 'Technical Support', tickets: 342, agents: 5, icon: 'Wrench', color: 'var(--color-primary)' },
            { name: 'Billing & Payments', tickets: 198, agents: 3, icon: 'DollarSign', color: 'var(--color-success)' },
            { name: 'Account Management', tickets: 156, agents: 4, icon: 'Users', color: 'var(--color-warning)' },
            { name: 'Feature Requests', tickets: 89, agents: 2, icon: 'Lightbulb', color: 'var(--color-accent)' },
            { name: 'Bug Reports', tickets: 124, agents: 3, icon: 'Bug', color: 'var(--color-error)' },
            { name: 'General Inquiries', tickets: 267, agents: 4, icon: 'MessageCircle', color: 'var(--color-secondary)' }]?.
            map((dept, index) =>
            <div key={index} className="p-4 bg-background border border-border rounded-lg hover:shadow-elevation-2 transition-smooth">
                <div className="flex items-center gap-3 mb-3">
                  <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${dept?.color}15` }}>

                    <Icon name={dept?.icon} size={20} color={dept?.color} />
                  </div>
                  <h3 className="text-sm font-medium text-foreground flex-1">{dept?.name}</h3>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground caption">
                    <Icon name="Ticket" size={14} className="inline mr-1" />
                    {dept?.tickets} tickets
                  </span>
                  <span className="text-muted-foreground caption">
                    <Icon name="Users" size={14} className="inline mr-1" />
                    {dept?.agents} agents
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>);

};

export default ManagerDashboard;