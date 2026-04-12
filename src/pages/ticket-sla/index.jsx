import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { slaAPI } from '../../services/api';

const TicketSlaPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await slaAPI.getTickets();
        setTickets(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const badgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'breached':
        return 'bg-error/10 text-error';
      case 'at_risk':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-success/10 text-success';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Ticket SLA</title></Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">Live SLA View</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">Ticket SLA</h1>
              <p className="text-muted-foreground">See active tickets, their SLA clock, and jump directly to the ticket or incident workflow.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">Tickets</Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">Incidents</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-creation')} iconName="Plus">New Ticket</Button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Active Tickets</h2>
            <span className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${tickets.length} ticket(s)`}</span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading ticket SLA data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Ticket</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Priority</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Policy</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Due</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Remaining</th>
                    <th className="px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr key={ticket.ticketId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{ticket.ticketNumber}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{ticket.title}</div>
                      </td>
                      <td className="px-4 py-4">{ticket.priority}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass(ticket.slaStatus)}`}>{ticket.slaStatus || 'on_track'}</span>
                      </td>
                      <td className="px-4 py-4">{ticket.policyName}</td>
                      <td className="px-4 py-4">{ticket.dueDate ? new Date(ticket.dueDate).toLocaleString() : '-'}</td>
                      <td className="px-4 py-4">{ticket.remainingMinutes != null ? `${ticket.remainingMinutes} min` : '-'}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-details/${ticket.ticketId}`)}>Open</Button>
                          <Button size="sm" variant="ghost" onClick={() => navigate('/incident-management-workflow')}>Escalate</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TicketSlaPage;
