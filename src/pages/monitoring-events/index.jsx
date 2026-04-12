import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { monitoringAPI } from '../../services/api';

const severityOptions = [
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const categoryOptions = [
  { value: 'Incident', label: 'Incident' },
  { value: 'Network', label: 'Network' },
  { value: 'Security', label: 'Security' },
  { value: 'Application', label: 'Application' },
  { value: 'Infrastructure', label: 'Infrastructure' },
];

const MonitoringEvents = () => {
  const navigate = useNavigate();
  const [pingStatus, setPingStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);
  const [form, setForm] = useState({
    eventId: `EVT-${Date.now()}`,
    title: 'Server failure detected',
    description: 'Monitoring detected a critical server outage on the primary application host.',
    severity: 'Critical',
    source: 'Monitoring',
    category: 'Incident',
    issueSignature: 'server-failure-primary-app',
    createProblem: true,
    problemTitle: 'Recurring server failure',
    problemDescription: 'Repeated monitoring alerts indicate a recurring infrastructure issue that needs root cause analysis.',
  });

  useEffect(() => {
    const checkPing = async () => {
      try {
        await monitoringAPI.ping();
        setPingStatus('online');
      } catch {
        setPingStatus('offline');
      }
    };

    checkPing();
  }, []);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const validate = () => {
    if (!form.eventId.trim()) return 'Event ID is required';
    if (!form.title.trim()) return 'Title is required';
    if (!form.description.trim()) return 'Description is required';
    return '';
  };

  const submitEvent = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await monitoringAPI.createEvent({
        eventId: form.eventId.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        source: form.source.trim() || undefined,
        category: form.category || undefined,
        issueSignature: form.issueSignature.trim() || undefined,
        createProblem: Boolean(form.createProblem),
        problemTitle: form.createProblem ? form.problemTitle.trim() || form.title.trim() : undefined,
        problemDescription: form.createProblem ? form.problemDescription.trim() || form.description.trim() : undefined,
      });

      setResponse(res.data || null);
      setError('');
    } catch (err) {
      console.error('Failed to submit monitoring event:', err);
      setError('Failed to submit monitoring event.');
    } finally {
      setLoading(false);
    }
  };

  const loadServerFailureExample = () => {
    setForm({
      eventId: `EVT-${Date.now()}`,
      title: 'Server failure detected',
      description: 'CPU, memory, and health checks failed on the primary server.',
      severity: 'Critical',
      source: 'Prometheus',
      category: 'Incident',
      issueSignature: 'primary-server-failure',
      createProblem: true,
      problemTitle: 'Primary server failure trend',
      problemDescription: 'Several incidents with the same signature suggest a recurring infrastructure issue.',
    });
    setResponse(null);
    setError('');
  };

  const responseTicket = response?.ticket || null;
  const responseProblem = response?.problem || null;
  const canOpenTicket = Boolean(responseTicket?.id);

  const summaryCards = useMemo(() => ([
    { label: 'Ping Status', value: pingStatus === 'online' ? 'Connected' : pingStatus === 'offline' ? 'Offline' : 'Checking' },
    { label: 'Severity', value: form.severity },
    { label: 'Category', value: form.category },
    { label: 'Create Problem', value: form.createProblem ? 'Yes' : 'No' },
  ]), [pingStatus, form.severity, form.category, form.createProblem]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BreadcrumbTrail />

      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${pingStatus === 'online' ? 'bg-success' : pingStatus === 'offline' ? 'bg-error' : 'bg-warning'}`} />
              {pingStatus === 'online' ? 'Monitoring API online' : pingStatus === 'offline' ? 'Monitoring API offline' : 'Checking monitoring API'}
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Monitoring Events</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Create monitoring-driven incidents and optionally promote repeated alerts into problem records.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={loadServerFailureExample} iconName="Wand2" iconPosition="left">
              Load Example
            </Button>
            <Button variant="ghost" onClick={() => navigate('/problems')} iconName="Bug" iconPosition="left">
              Open Problems
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
          <section className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Ingest Event</h2>
                <p className="text-sm text-muted-foreground">Matches `MonitoringEventDto` from the backend.</p>
              </div>
              <Icon name="Activity" size={20} className="text-primary" />
            </div>

            <form onSubmit={submitEvent} className="p-6 space-y-5">
              {error && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Event ID" value={form.eventId} onChange={(e) => setField('eventId', e?.target?.value)} required />
                <Select label="Severity" options={severityOptions} value={form.severity} onChange={(value) => setField('severity', value)} />
                <div className="md:col-span-2">
                  <Input label="Title" value={form.title} onChange={(e) => setField('title', e?.target?.value)} required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(e) => setField('description', e?.target?.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Input label="Source" value={form.source} onChange={(e) => setField('source', e?.target?.value)} />
                <Select label="Category" options={categoryOptions} value={form.category} onChange={(value) => setField('category', value)} />
                <Input label="Issue Signature" value={form.issueSignature} onChange={(e) => setField('issueSignature', e?.target?.value)} />
                <div className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                  <input
                    id="createProblem"
                    type="checkbox"
                    checked={form.createProblem}
                    onChange={(e) => setField('createProblem', e?.target?.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="createProblem" className="text-sm text-foreground">
                    Create or promote a problem record
                  </label>
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Problem Title"
                    value={form.problemTitle}
                    onChange={(e) => setField('problemTitle', e?.target?.value)}
                    disabled={!form.createProblem}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Problem Description</label>
                  <textarea
                    rows={4}
                    value={form.problemDescription}
                    onChange={(e) => setField('problemDescription', e?.target?.value)}
                    disabled={!form.createProblem}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" loading={loading} iconName="Send" iconPosition="right">
                  Submit Event
                </Button>
                <Button type="button" variant="outline" onClick={loadServerFailureExample}>
                  Reset Example
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Live Summary</h2>
              <div className="space-y-3">
                {summaryCards.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4">Backend Response</h2>
              {responseTicket ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Created Ticket</p>
                    <p className="font-medium text-foreground">{responseTicket.ticketNumber || `TKT-${responseTicket.id}`}</p>
                    <p className="text-sm text-muted-foreground">{responseTicket.title}</p>
                    <Button
                      className="mt-3"
                      size="sm"
                      onClick={() => navigate(`/ticket-details/${responseTicket.id}`)}
                      disabled={!canOpenTicket}
                    >
                      Open Ticket
                    </Button>
                  </div>

                  {responseProblem ? (
                    <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Problem Record</p>
                      <p className="font-medium text-foreground">{responseProblem.problemNumber}</p>
                      <p className="text-sm text-muted-foreground">{responseProblem.title}</p>
                      <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate('/problems')}>
                        Open Problems
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                      No problem record was created for this event.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  Submit an event to see the ticket and problem response here.
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MonitoringEvents;
