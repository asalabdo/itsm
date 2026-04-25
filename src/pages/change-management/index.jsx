import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';
import changeService from '../../services/changeService';
import ChangeForm from './components/ChangeForm';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';

const STATUS_OPTIONS = (t) => [
  { value: 'all', label: t('all', 'All') },
  { value: 'Proposed', label: t('proposed', 'Proposed') },
  { value: 'Pending Approval', label: t('pendingApproval', 'Pending Approval') },
  { value: 'Approved', label: t('approved', 'Approved') },
  { value: 'Implementing', label: t('implementing', 'Implementing') },
  { value: 'Completed', label: t('completed', 'Completed') },
  { value: 'Rejected', label: t('rejected', 'Rejected') },
];

const CAB_WAVES = [
  { key: 'proposed', label: 'Proposed', icon: 'FileText', accent: 'text-blue-600' },
  { key: 'pendingApproval', label: 'Pending Approval', icon: 'Gavel', accent: 'text-amber-600' },
  { key: 'approved', label: 'Approved', icon: 'ShieldCheck', accent: 'text-emerald-600' },
  { key: 'implementing', label: 'Implementing', icon: 'Gauge', accent: 'text-indigo-600' },
];

const ChangeManagement = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);

  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [actionError, setActionError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const data = await changeService.getAll();
      setChanges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch changes:', error);
      setChanges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchChanges();
  }, []);

  const handleCreateChange = async (data) => {
    try {
      setSubmitting(true);
      await changeService.create(data);
      setIsFormOpen(false);
      await fetchChanges();
    } catch (error) {
      console.error('Failed to create change:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeAction = async (change, action) => {
    if (!change?.id) return;

    try {
      setActionError('');
      setActioningId(change.id);
      const note = String(decisionNotes[change.id] || '').trim();
      if (action === 'submit') {
        await changeService.submit(change.id);
      } else if (action === 'approve') {
        if (!note) {
          throw new Error(t('cabDecisionNotesRequiredApprove', 'CAB decision notes are required before approval.'));
        }
        if (!window.confirm(`Approve ${change.changeNumber} with these CAB notes?`)) {
          return;
        }
        await changeService.approve(change.id, note);
      } else if (action === 'reject') {
        if (!note) {
          throw new Error(t('cabDecisionNotesRequiredReject', 'CAB decision notes are required before rejection.'));
        }
        if (!window.confirm(`Reject ${change.changeNumber} with these CAB notes?`)) {
          return;
        }
        await changeService.reject(change.id, note);
      }
      setDecisionNotes((prev) => {
        const next = { ...prev };
        delete next[change.id];
        return next;
      });
      await fetchChanges();
    } catch (error) {
      console.error(`Failed to ${action} change:`, error);
      setActionError(error?.message || t('changeActionFailed', 'Unable to update the change right now.'));
    } finally {
      setActioningId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Proposed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Pending Approval':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Implementing':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
      case 'Rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'text-rose-500';
      case 'Medium':
        return 'text-amber-500';
      case 'Low':
        return 'text-emerald-500';
      default:
        return 'text-slate-500';
    }
  };

  const filteredChanges = useMemo(() => (
    filter === 'all'
      ? changes
      : changes.filter((change) => change.status === filter)
  ), [changes, filter]);

  const cabQueue = useMemo(() => ({
    proposed: changes.filter((change) => change.status === 'Proposed').length,
    pendingApproval: changes.filter((change) => change.status === 'Pending Approval').length,
    approved: changes.filter((change) => change.status === 'Approved').length,
    implementing: changes.filter((change) => change.status === 'Implementing').length,
  }), [changes]);

  const scheduledChanges = useMemo(() => (
    [...changes]
      .filter((change) => change.scheduledStartDate)
      .sort((a, b) => new Date(a.scheduledStartDate) - new Date(b.scheduledStartDate))
      .slice(0, 6)
  ), [changes]);
  const upcomingChanges = scheduledChanges;

  const conflictChangeIds = useMemo(() => {
    const conflicts = new Set();

    scheduledChanges.forEach((change, index) => {
      const start = new Date(change.scheduledStartDate).getTime();
      const end = change.scheduledEndDate ? new Date(change.scheduledEndDate).getTime() : start;

      scheduledChanges.slice(index + 1).forEach((other) => {
        const otherStart = new Date(other.scheduledStartDate).getTime();
        const otherEnd = other.scheduledEndDate ? new Date(other.scheduledEndDate).getTime() : otherStart;
        const overlaps = start <= otherEnd && otherStart <= end;

        if (overlaps) {
          conflicts.add(change.id);
          conflicts.add(other.id);
        }
      });
    });

    return conflicts;
  }, [scheduledChanges]);

  const statusOptions = useMemo(() => STATUS_OPTIONS(t), [t]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <BreadcrumbTrail />
      <main className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('changeManagementTitle', 'Change Management')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {t('changeManagementDescription', 'Control and coordinate IT changes to minimize service disruption')}
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} iconName="Plus" iconPosition="left">
            {t('newChangeRequest', 'New Change Request')}
          </Button>
        </div>

        {isFormOpen && (
          <ChangeForm
            onSubmit={handleCreateChange}
            onCancel={() => setIsFormOpen(false)}
            loading={submitting}
          />
        )}

        <div className="mb-8">
          <ManageEngineOnPremSnapshot
            title={t('manageEngineChangeContext', 'ManageEngine Change Context')}
            description={t('manageEngineChangeContextDesc', 'On-prem ServiceDesk changes, requests, and OpManager 12.8.270 alerts to validate change risk before implementation.')}
          />
        </div>

        {actionError && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {CAB_WAVES.map((item) => (
            <div key={item.key} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</div>
                  <div className={`mt-2 text-3xl font-semibold ${item.accent}`}>{cabQueue[item.key] ?? 0}</div>
                </div>
                <Icon name={item.icon} size={20} className={item.accent} />
              </div>
              <div className="text-xs text-slate-500 mt-1">{t('cabQueue', 'CAB queue')}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('changeCalendar', 'Change Calendar')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('upcomingChangeWindows', 'Upcoming change windows and schedule conflicts')}</p>
              </div>
              <Icon name="CalendarDays" size={20} className="text-blue-600" />
            </div>

            <div className="overflow-x-auto">
              {upcomingChanges.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">{t('noScheduledChanges', 'No scheduled changes yet')}</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('changeNumber', 'Change')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('schedule', 'Schedule')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {upcomingChanges.map((change) => (
                      <tr key={change.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-white">{change.changeNumber}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{change.title}</div>
                          <div className="text-xs text-slate-400 mt-1">{change.riskLevel} · {change.category}</div>
                          {conflictChangeIds.has(change.id) && (
                            <div className="mt-2 inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                              {t('scheduleConflict', 'Schedule conflict')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                          <div>
                            {change.scheduledStartDate ? format(new Date(change.scheduledStartDate), 'MMM dd, HH:mm') : t('notScheduled', 'Not scheduled')}
                          </div>
                          {change.scheduledEndDate && (
                            <div className="text-xs text-slate-400">
                              {t('to', 'to')} {format(new Date(change.scheduledEndDate), 'MMM dd, HH:mm')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(change.status)}`}>
                            {change.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('cabReview', 'CAB Review')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('reviewSubmitApproveReject', 'Submit, approve, or reject from the same dashboard')}</p>
              </div>
              <Icon name="Gavel" size={20} className="text-amber-600" />
            </div>

            <div className="space-y-3">
              {changes.filter((change) => ['Proposed', 'Pending Approval'].includes(change.status)).length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-4 text-sm text-slate-500">
                  {t('noCABItems', 'No change items currently awaiting CAB action.')}
                </div>
              ) : (
                changes
                  .filter((change) => ['Proposed', 'Pending Approval'].includes(change.status))
                  .slice(0, 5)
                  .map((change) => (
                    <div key={change.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900 dark:text-white truncate">{change.changeNumber}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{change.title}</div>
                          <div className="text-xs text-slate-400 mt-1">{change.status} · {change.riskLevel}</div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {change.status === 'Proposed' && (
                            <button
                              onClick={() => handleChangeAction(change, 'submit')}
                              disabled={actioningId === change.id}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              {actioningId === change.id ? t('working', 'Working...') : t('submit', 'Submit')}
                            </button>
                          )}
                          {change.status === 'Pending Approval' && (
                            <div className="space-y-2">
                              <textarea
                                rows={2}
                                value={decisionNotes[change.id] || ''}
                                onChange={(event) => setDecisionNotes((prev) => ({ ...prev, [change.id]: event.target.value }))}
                                placeholder={t('cabDecisionNotes', 'Add CAB decision notes for the audit trail')}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {t('cabDecisionConfirm', 'Typed notes and confirmation are required before CAB action is recorded.')}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleChangeAction(change, 'approve')}
                                  disabled={actioningId === change.id || !String(decisionNotes[change.id] || '').trim()}
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  {t('approve', 'Approve')}
                                </button>
                                <button
                                  onClick={() => handleChangeAction(change, 'reject')}
                                  disabled={actioningId === change.id || !String(decisionNotes[change.id] || '').trim()}
                                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-60"
                                >
                                  {t('reject', 'Reject')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto">
            {statusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => setFilter(statusOption.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-smooth ${
                  filter === statusOption.value
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {statusOption.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('changeNumber', 'Change')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('riskAndCategory', 'Risk & Category')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('status', 'Status')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('requester', 'Requester')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('scheduling', 'Scheduling')}</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">{t('actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic animate-pulse">
                      {t('loadingChanges', 'Loading changes...')}
                    </td>
                  </tr>
                ) : filteredChanges.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                      {t('noChangeRequests', 'No change requests')}
                    </td>
                  </tr>
                ) : filteredChanges.map((change) => (
                  <tr key={change.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-smooth group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-smooth">
                        {change.changeNumber}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{change.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium flex items-center gap-1.5 ${getRiskColor(change.riskLevel)}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {change.riskLevel} {t('riskLevel', 'Risk')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{change.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(change.status)}`}>
                        {change.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold uppercase">
                          {change.requestedBy?.username?.substring(0, 2) || '??'}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{change.requestedBy?.username || t('unknown', 'Unknown')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {change.scheduledStartDate ? format(new Date(change.scheduledStartDate), 'MMM dd, HH:mm') : t('notScheduled', 'Not scheduled')}
                      </div>
                      {change.scheduledEndDate && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {t('to', 'to')} {format(new Date(change.scheduledEndDate), 'MMM dd, HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          aria-label={t('openChangeDetails', `Open change details for ${change.changeNumber}`)}
                          onClick={() => navigate(`/change-management/${change.id}`)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-smooth"
                        >
                          <Icon name="ExternalLink" size={18} />
                        </button>
                        {change.status === 'Proposed' && (
                          <Button size="sm" variant="outline" onClick={() => handleChangeAction(change, 'submit')} disabled={actioningId === change.id}>
                            {t('submit', 'Submit')}
                          </Button>
                        )}
                        {change.status === 'Pending Approval' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleChangeAction(change, 'approve')} disabled={actioningId === change.id || !String(decisionNotes[change.id] || '').trim()}>
                              {t('approve', 'Approve')}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleChangeAction(change, 'reject')} disabled={actioningId === change.id || !String(decisionNotes[change.id] || '').trim()}>
                              {t('reject', 'Reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangeManagement;
