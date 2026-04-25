import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ManageEngineProblemSignals from './components/ManageEngineProblemSignals';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import { problemAPI } from '../../services/api';

const emptyForm = {
  title: '',
  description: '',
  rootCause: '',
  workaround: '',
  priority: 'Medium',
  category: '',
  status: 'Open',
};

const getPriorityOptions = (t) => [
  { value: 'Low', label: t('low', 'Low') },
  { value: 'Medium', label: t('medium', 'Medium') },
  { value: 'High', label: t('high', 'High') },
  { value: 'Critical', label: t('critical', 'Critical') },
];

const getStatusOptions = (t) => [
  { value: 'Open', label: t('open', 'Open') },
  { value: 'Investigating', label: t('investigating', 'Investigating') },
  { value: 'Resolved', label: t('resolved', 'Resolved') },
  { value: 'Closed', label: t('closed', 'Closed') },
];

const getLinkedTickets = (problem) => (Array.isArray(problem?.linkedTickets) ? problem.linkedTickets : []);

const getTicketDisplayNumber = (ticket) => ticket?.ticketNumber || (ticket?.id ? `TCK-${ticket.id}` : 'Linked ticket');

const getTicketAssignee = (ticket) => ticket?.assignedTo?.fullName || ticket?.assignedTo?.username || 'Unassigned';

const Problems = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [linkTicketId, setLinkTicketId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProblems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await problemAPI.getAll();
      const nextProblems = res.data || [];
      setProblems(nextProblems);
      setSelectedProblem((current) => current || nextProblems[0] || null);
    } catch (err) {
      console.error('Failed to load problems:', err);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProblems();
  }, [loadProblems]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (problem) => {
    setEditingId(problem.id);
    setForm({
      title: problem.title || '',
      description: problem.description || '',
      rootCause: problem.rootCause || '',
      workaround: problem.workaround || '',
      priority: problem.priority || 'Medium',
      category: problem.category || '',
      status: problem.status || 'Open',
    });
    setError('');
    setShowForm(true);
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.title.trim()) return t('titleRequired', 'Title is required');
    if (!form.description.trim()) return t('descriptionRequired', 'Description is required');
    if (!form.category.trim()) return t('categoryRequired', 'Category is required');
    if (['Resolved', 'Closed'].includes(form.status)) {
      if (!form.rootCause.trim()) return t('rootCauseRequired', 'Root cause is required before closing the problem.');
      if (!form.workaround.trim()) return t('workaroundRequired', 'Workaround is required before closing the problem.');
    }
    return '';
  };

  const saveProblem = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        rootCause: form.rootCause.trim(),
        workaround: form.workaround.trim(),
        priority: form.priority,
        category: form.category.trim(),
      };

      if (editingId) {
        await problemAPI.update(editingId, {
          ...payload,
          status: form.status,
        });
      } else {
        await problemAPI.create(payload);
      }

      setShowForm(false);
      await loadProblems();
    } catch (err) {
      console.error('Failed to save problem:', err);
      setError(t('failedSaveProblem', 'Failed to save problem.'));
    } finally {
      setSaving(false);
    }
  };

  const linkTicket = async () => {
    const ticketId = Number(linkTicketId);
    if (!selectedProblem || !Number.isInteger(ticketId) || ticketId < 1) {
      setError(t('failedLinkTicket', 'Enter a valid ticket ID of 1 or greater.'));
      return;
    }

    try {
      setSaving(true);
      setError('');
      await problemAPI.linkTicket(selectedProblem.id, ticketId);
      setLinkTicketId('');
      await loadProblems();
    } catch (err) {
      console.error('Failed to link ticket:', err);
      setError(t('failedLinkTicket', 'Failed to link ticket.'));
    } finally {
      setSaving(false);
    }
  };

  const selectedDetail = useMemo(() => selectedProblem || problems[0] || null, [selectedProblem, problems]);
  const linkedTickets = useMemo(() => getLinkedTickets(selectedDetail), [selectedDetail]);
  const rcaSummary = useMemo(() => {
    if (!selectedDetail) {
      return null;
    }

    return {
      knownError: `${selectedDetail.problemNumber || 'Problem'} - ${selectedDetail.category || t('uncategorized', 'Uncategorized')} - ${selectedDetail.status || t('unknownStatus', 'Unknown')}`,
      fiveWhys: selectedDetail.rootCause?.trim()
        ? selectedDetail.rootCause.trim()
        : t('captureFiveWhys', 'Capture the 5 Whys chain here so the next incident follows the cause, not just the symptom.'),
      fishbone: t(
        'captureFishbone',
        'Check people, process, technology, and environment for contributing factors before marking the record known-error ready.'
      ),
      workaround: selectedDetail.workaround?.trim()
        ? selectedDetail.workaround.trim()
        : t('addWorkaround', 'Add a workaround so agents can resolve the next linked incident consistently.'),
    };
  }, [selectedDetail, t]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />

      <main className="px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground">{t('problems', 'Problems')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('problemsDescription', 'Backend-backed problem records for root cause tracking and permanent fixes.')}
            </p>
          </div>
          <Button iconName="Plus" iconPosition="left" onClick={openCreate}>
            {t('newProblem', 'New Problem')}
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-6">
          <section className="rounded-2xl border border-border bg-card shadow-elevation-1 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('problemRecords', 'Problem Records')}</h2>
                <p className="text-sm text-muted-foreground">{problems.length} {t('problemRecordsLoaded', 'problem records loaded')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={loadProblems}>
                {t('refresh', 'Refresh')}
              </Button>
            </div>

            {loading ? (
              <div className="p-10 text-center text-muted-foreground">{t('loadingProblems', 'Loading problems...')}</div>
            ) : problems.length === 0 ? (
              <div className="p-10 text-center">
                <Icon name="AlertTriangle" size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground">{t('noProblemsFound', 'No problems found')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('createFirstProblem', 'Create the first problem record to track root causes.')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('problem', 'Problem')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('priority', 'Priority')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('status', 'Status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{t('category', 'Category')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{t('actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {problems.map((problem) => (
                      <tr
                        key={problem.id}
                        className={`hover:bg-muted/30 transition-colors ${selectedDetail?.id === problem.id ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <button type="button" onClick={() => setSelectedProblem(problem)} className="text-left">
                            <div className="font-medium text-foreground">{problem.problemNumber}</div>
                            <div className="text-sm text-muted-foreground">{problem.title}</div>
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">{problem.priority}</td>
                        <td className="px-4 py-4 text-sm text-foreground">{problem.status}</td>
                        <td className="px-4 py-4 text-sm text-foreground">{problem.category}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedProblem(problem)}>
                              {t('view', 'View')}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(problem)}>
                              {t('edit', 'Edit')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <ManageEngineProblemSignals />

            <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className={`flex items-center justify-between gap-3 mb-4`}>
                <div>
                  <h2 className={`text-lg font-semibold text-foreground`}>{t('problemDetail', 'Problem Detail')}</h2>
                  <p className={`text-sm text-muted-foreground`}>{t('selectedBackendRecord', 'Selected backend record')}</p>
                </div>
                <Icon name="ClipboardList" size={18} className="text-primary" />
              </div>

              {selectedDetail ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('title', 'Title')}</p>
                    <p className="font-medium text-foreground">{selectedDetail.title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('rootCause', 'Root Cause')}</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedDetail.rootCause}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('workaround', 'Workaround')}</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selectedDetail.workaround}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">{t('priority', 'Priority')}</p>
                      <p className="text-sm font-medium text-foreground">{selectedDetail.priority}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-[10px] uppercase text-muted-foreground">{t('status', 'Status')}</p>
                      <p className="text-sm font-medium text-foreground">{selectedDetail.status}</p>
                    </div>
                  </div>
                  {rcaSummary && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('rcaQuickView', 'RCA Quick View')}</p>
                          <p className="text-sm font-medium text-foreground">{rcaSummary.knownError}</p>
                        </div>
                        <Icon name="GitBranch" size={18} className="text-primary" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-background/80 border border-border p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('fiveWhys', '5 Whys')}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{rcaSummary.fiveWhys}</p>
                        </div>
                        <div className="rounded-xl bg-background/80 border border-border p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('fishbone', 'Fishbone')}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{rcaSummary.fishbone}</p>
                        </div>
                        <div className="rounded-xl bg-background/80 border border-border p-3">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('knownErrorWorkaround', 'Known Error / Workaround')}</p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{rcaSummary.workaround}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-border space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('linkedIncidents', 'Linked Incidents')}</p>
                        <p className="text-xs text-muted-foreground">
                          {linkedTickets.length > 0
                            ? t('linkedIncidentsCount', `${linkedTickets.length} incident(s) linked to this problem`)
                            : t('noLinkedIncidents', 'No linked incidents yet.')}
                        </p>
                      </div>
                      <Icon name="Link" size={18} className="text-primary" />
                    </div>
                    {linkedTickets.length > 0 ? (
                      <div className="space-y-2">
                        {linkedTickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="rounded-xl border border-border bg-background px-3 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{getTicketDisplayNumber(ticket)}</span>
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                  {ticket.priority || t('priority', 'Priority')}
                                </span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {ticket.status || t('status', 'Status')}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-foreground">{ticket.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {ticket.category || t('uncategorized', 'Uncategorized')} - {getTicketAssignee(ticket)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              iconName="ArrowUpRight"
                              iconPosition="left"
                              onClick={() => navigate(ticket?.id ? `/ticket-details/${ticket.id}` : '/ticket-management-center')}
                            >
                              {t('openIncident', 'Open')}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('noLinkedIncidentsYet', 'Link incidents here to make recurring issues easier to investigate and reuse.')}</p>
                    )}
                    <div className="pt-1">
                      <label className="block text-sm font-medium text-foreground mb-2">{t('linkTicketId', 'Link Ticket ID')}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={linkTicketId}
                          onChange={(e) => setLinkTicketId(e?.target?.value)}
                          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                          placeholder={t('ticketId', 'Ticket ID')}
                        />
                        <Button type="button" onClick={linkTicket} disabled={saving || !linkTicketId}>
                          {t('link', 'Link')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">{t('selectProblemDetail', 'Select a problem record to see more detail.')}</div>
              )}
            </section>
          </aside>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-[1500] bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={saveProblem} className="w-full max-w-4xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{editingId ? t('editProblem', 'Edit Problem') : t('newProblem', 'New Problem')}</h2>
                <p className="text-sm text-muted-foreground">{t('matchesCreateUpdateDto', 'Matches `CreateProblemRecordDto` and `UpdateProblemRecordDto`.')}</p>
              </div>
              <Button variant="ghost" size="sm" type="button" onClick={() => setShowForm(false)}>
                <Icon name="X" size={18} />
              </Button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
              <Input label={t('title', 'Title')} value={form.title} onChange={(e) => setField('title', e?.target?.value)} required />
              <Select label={t('priority', 'Priority')} options={getPriorityOptions(t)} value={form.priority} onChange={(value) => setField('priority', value)} />
              <div className="md:col-span-2">
                <Input label={t('category', 'Category')} value={form.category} onChange={(e) => setField('category', e?.target?.value)} required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">{t('description', 'Description')}</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setField('description', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">{t('rootCause', 'Root Cause')}</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  {t('rootCauseGuidance', 'Optional while the problem is open; required before a record can be resolved or closed.')}
                </p>
                <textarea
                  rows={4}
                  value={form.rootCause}
                  onChange={(e) => setField('rootCause', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">{t('workaround', 'Workaround')}</label>
                <p className="mb-2 text-xs text-muted-foreground">
                  {t('workaroundGuidance', 'Document the temporary fix or known error guidance here.')}
                </p>
                <textarea
                  rows={4}
                  value={form.workaround}
                  onChange={(e) => setField('workaround', e?.target?.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {editingId && (
                <Select label={t('status', 'Status')} options={getStatusOptions(t)} value={form.status} onChange={(value) => setField('status', value)} />
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? t('saving', 'Saving...') : t('saveProblem', 'Save Problem')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Problems;


