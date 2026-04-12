import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { slaAPI } from '../../services/api';

const fallbackPolicies = [
  { key: 'technical-support', name: 'Technical Support', priority: 'High', responseHours: 2, resolutionHours: 8, escalationMinutes: 120, owner: 'Service Desk', notes: 'Device, email, printer, and network issues.' },
  { key: 'access-management', name: 'Access Management', priority: 'High', responseHours: 1, resolutionHours: 4, escalationMinutes: 60, owner: 'Security Operations', notes: 'Password reset, MFA, VPN, permissions.' },
  { key: 'incident-management', name: 'Incident Management', priority: 'Urgent', responseHours: 1, resolutionHours: 4, escalationMinutes: 30, owner: 'Incident Manager', notes: 'Major incidents and outages.' },
  { key: 'service-request', name: 'Service Requests', priority: 'Medium', responseHours: 8, resolutionHours: 24, escalationMinutes: 240, owner: 'Fulfillment Team', notes: 'Equipment, software, onboarding.' },
];

const SlaPoliciesPage = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState(fallbackPolicies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await slaAPI.getPolicies();
        setPolicies(Array.isArray(res.data) && res.data.length ? res.data : fallbackPolicies);
      } catch {
        setPolicies(fallbackPolicies);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = [
    { label: 'Policies', value: policies.length, icon: 'ShieldCheck' },
    { label: 'Urgent Paths', value: policies.filter((p) => p.priority === 'Urgent' || p.priority === 'High').length, icon: 'AlertTriangle' },
    { label: 'Avg Response', value: `${Math.round(policies.reduce((sum, p) => sum + (p.responseHours || 0), 0) / Math.max(policies.length, 1))}h`, icon: 'Clock' },
    { label: 'Avg Resolution', value: `${Math.round(policies.reduce((sum, p) => sum + (p.resolutionHours || 0), 0) / Math.max(policies.length, 1))}h`, icon: 'Timer' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>SLA Policies</title>
      </Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 shadow-elevation-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Service Level Management</div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">SLA Policies</h1>
              <p className="text-muted-foreground max-w-2xl">Review service-level targets and jump directly into tickets or incidents when a policy needs attention.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-creation')} iconName="Plus">Create Ticket</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">Tickets</Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">Incidents</Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-elevation-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{item.value}</p>
                </div>
                <Icon name={item.icon} size={22} className="text-primary" />
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">Loading SLA policies...</div>
          ) : (
            policies.map((policy) => (
              <div key={policy.key} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{policy.name}</h2>
                    <p className="text-sm text-muted-foreground">{policy.owner}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{policy.priority}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{policy.notes}</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Response</p>
                    <p className="text-sm font-semibold text-foreground">{policy.responseHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Resolution</p>
                    <p className="text-sm font-semibold text-foreground">{policy.resolutionHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Escalate</p>
                    <p className="text-sm font-semibold text-foreground">{policy.escalationMinutes}m</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-management-center?priority=${encodeURIComponent(policy.priority)}`)}>Tickets</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/incident-management-workflow?priority=${encodeURIComponent(policy.priority)}`)}>Incidents</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/search')}>Search</Button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default SlaPoliciesPage;
