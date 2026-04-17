import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DashboardCard from '../../components/ui/DashboardCard';
import Icon from '../../components/AppIcon';
import notificationService from '../../services/notificationService';
import { ticketsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const seedActions = [
  {
    id: 'seed-1',
    type: 'approval',
    title: 'Manager approved escalation for TKT-4812',
    actor: 'Mona Ali',
    role: 'Manager',
    target: 'TKT-4812',
    area: 'Incident',
    severity: 'high',
    status: 'Completed',
    time: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    note: 'Approval completed and workflow moved to assignment.',
    source: 'workflow',
  },
  {
    id: 'seed-2',
    type: 'ticket',
    title: 'Ticket reassigned to ERP network support',
    actor: 'System',
    role: 'Automation',
    target: 'TKT-4766',
    area: 'Service Request',
    severity: 'medium',
    status: 'Completed',
    time: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
    note: 'Matched by service and organization rules.',
    source: 'ticket',
  },
  {
    id: 'seed-3',
    type: 'integration',
    title: 'Third-party sync sent after submit',
    actor: 'Integration Engine',
    role: 'Connector',
    target: 'SRQ-2191',
    area: 'Integration',
    severity: 'high',
    status: 'Synced',
    time: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
    note: 'Outbound payload accepted by external service.',
    source: 'integration',
  },
  {
    id: 'seed-4',
    type: 'security',
    title: 'Compliance exception reviewed for overdue SLA',
    actor: 'Amina Hassan',
    role: 'Compliance',
    target: 'TKT-4703',
    area: 'Audit',
    severity: 'critical',
    status: 'Review required',
    time: new Date(Date.now() - 1000 * 60 * 109).toISOString(),
    note: 'Action remains open until remediation note is attached.',
    source: 'audit',
  },
  {
    id: 'seed-5',
    type: 'ticket',
    title: 'Priority updated to High on TKT-4890',
    actor: 'Omar Youssef',
    role: 'Agent',
    target: 'TKT-4890',
    area: 'Incident',
    severity: 'medium',
    status: 'Completed',
    time: new Date(Date.now() - 1000 * 60 * 146).toISOString(),
    note: 'Customer impact increased after the last update.',
    source: 'ticket',
  },
  {
    id: 'seed-6',
    type: 'approval',
    title: 'Assignment request waiting for manager review',
    actor: 'System',
    role: 'Workflow',
    target: 'SRQ-2314',
    area: 'Service Request',
    severity: 'low',
    status: 'Pending',
    time: new Date(Date.now() - 1000 * 60 * 203).toISOString(),
    note: 'Queue item is waiting for the next approval step.',
    source: 'workflow',
  },
];

const severityMeta = {
  critical: {
    label: 'Critical',
    className: 'bg-error/10 text-error border-error/20',
    icon: 'AlertTriangle',
  },
  high: {
    label: 'High',
    className: 'bg-warning/10 text-warning border-warning/20',
    icon: 'Zap',
  },
  medium: {
    label: 'Medium',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: 'Activity',
  },
  low: {
    label: 'Low',
    className: 'bg-success/10 text-success border-success/20',
    icon: 'CheckCircle2',
  },
};

const typeLabels = {
  approval: 'Approval',
  ticket: 'Ticket',
  integration: 'Integration',
  security: 'Audit',
};

const formatTime = (value) => {
  if (!value) return 'Just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString();
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const buildNotificationAction = (notification) => {
  const title = notification?.title || notification?.message || 'Notification update';
  const content = `${title} ${notification?.message || ''}`.trim();
  const ticketMatch = content.match(/\b(TKT|SRQ|CHG|AST)-\d+\b/i);
  return {
    id: `notification-${notification?.id || title}`,
    type: normalizeText(notification?.type) || 'ticket',
    title,
    actor: notification?.sender || notification?.author || 'System',
    role: 'Notification',
    target: ticketMatch?.[0] || notification?.link || 'General',
    area: 'Inbox',
    severity: notification?.type && ['error', 'urgent'].includes(normalizeText(notification.type)) ? 'high' : 'medium',
    status: notification?.read || notification?.isRead ? 'Read' : 'Unread',
    time: notification?.createdAt || notification?.created_at || notification?.time || new Date().toISOString(),
    note: notification?.message || 'Notification activity recorded in the control feed.',
    source: 'notification',
    link: notification?.link || null,
  };
};

const buildTicketAction = (ticket) => ({
  id: `ticket-${ticket?.id || ticket?.ticketNumber || Math.random().toString(36).slice(2)}`,
  type: 'ticket',
  title: `${ticket?.ticketNumber || `TKT-${ticket?.id || '0000'}`} ${ticket?.title || 'Ticket activity'}`,
  actor: ticket?.assignedTo?.name || ticket?.requestedBy?.name || 'System',
  role: ticket?.assignedTo?.role || 'Agent',
  target: ticket?.ticketNumber || `TKT-${ticket?.id || '0000'}`,
  area: ticket?.category || 'Incident',
  severity: normalizeText(ticket?.priority) === 'critical' ? 'critical' : normalizeText(ticket?.priority) === 'high' ? 'high' : 'medium',
  status: ticket?.status || 'Updated',
  time: ticket?.updatedAt || ticket?.createdAt || new Date().toISOString(),
  note: ticket?.description || 'Ticket record updated.',
  source: 'ticket',
});

const AuditTrailAndComplianceViewer = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [actions, setActions] = useState(seedActions);

  useEffect(() => {
    const loadActions = async () => {
      setLoading(true);
      try {
        const [notifications, ticketsRes] = await Promise.allSettled([
          notificationService.getNotifications(),
          ticketsAPI.getAll(),
        ]);

        const notificationItems = notifications.status === 'fulfilled' && Array.isArray(notifications.value)
          ? notifications.value.map(buildNotificationAction)
          : [];
        const ticketItems = ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value?.data)
          ? ticketsRes.value.data.slice(0, 25).map(buildTicketAction)
          : [];

        const merged = [...notificationItems, ...ticketItems, ...seedActions]
          .sort((a, b) => new Date(b.time) - new Date(a.time));

        setActions(merged);
        setSelectedActionId((current) => current || merged[0]?.id || null);
      } catch (error) {
        console.error('Failed to load audit activity:', error);
        setActions(seedActions);
        setSelectedActionId(seedActions[0]?.id || null);
      } finally {
        setLoading(false);
      }
    };

    loadActions();
  }, []);

  const filteredActions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return actions.filter((action) => {
      const matchesType = selectedType === 'all' || action.type === selectedType;
      const haystack = [
        action.title,
        action.actor,
        action.role,
        action.target,
        action.area,
        action.status,
        action.note,
      ].join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesType && matchesQuery;
    });
  }, [actions, searchQuery, selectedType]);

  const visibleActions = showAll ? filteredActions : filteredActions.slice(0, 8);
  const selectedAction = filteredActions.find((action) => action.id === selectedActionId) || visibleActions[0] || filteredActions[0] || null;

  useEffect(() => {
    if (!selectedActionId && selectedAction?.id) {
      setSelectedActionId(selectedAction.id);
    }
  }, [selectedActionId, selectedAction]);

  const stats = useMemo(() => {
    const now = Date.now();
    const within24h = actions.filter((action) => now - new Date(action.time).getTime() <= 24 * 60 * 60 * 1000);
    return {
      total: actions.length,
      recent: within24h.length,
      critical: actions.filter((action) => action.severity === 'critical').length,
      pending: actions.filter((action) => ['pending', 'review required', 'unread'].includes(normalizeText(action.status))).length,
    };
  }, [actions]);

  const actionTypes = [
  { value: 'all', label: t('all', 'All Actions') },
  { value: 'approval', label: t('approval', 'Approvals') },
  { value: 'ticket', label: t('ticket', 'Tickets') },
  { value: 'integration', label: t('integration', 'Integrations') },
  { value: 'security', label: t('audit', 'Audit') },
  ];

  return (
    <>
      <Helmet>
        <title>عارض سجل التدقيق والامتثال</title>
        <meta
          name="description"
          content="مركز تحكم لمراجعة الإجراءات الأخيرة والموافقات وتحديثات التذاكر ونشاط التكامل."
        />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="pt-16">
          <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 md:p-8 shadow-sm">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    مركز التحكم
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    آخر الإجراءات، مرئية بالكامل.
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                    راجع الموافقات وتحديثات التذاكر وأحداث الامتثال والعمليات الخارجية في مكان واحد. استخدم عناصر التحكم في الرأس لإظهار كل الإجراءات أو تضييق التدفق لما يحتاج اهتمامًا الآن.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={showAll ? 'default' : 'outline'}
                    iconName={showAll ? 'List' : 'Rows3'}
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? 'عرض كل الإجراءات' : 'إظهار كل الإجراءات'}
                  </Button>
                  <Button
                    variant="ghost"
                    iconName="RefreshCw"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                  >
                    تحديث
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <DashboardCard title="كل الإجراءات" value={stats.total} subtitle="مُتتبعة في التدفق الحالي">
                <Icon name="Activity" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard title="آخر 24 ساعة" value={stats.recent} subtitle="نافذة النشاط الأخير">
                <Icon name="Clock3" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard title="عناصر حرجة" value={stats.critical} subtitle="تحتاج اهتمامًا فوريًا">
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </DashboardCard>
              <DashboardCard title="قيد المراجعة" value={stats.pending} subtitle="بانتظار إجراءات التحكم">
                <Icon name="ClipboardCheck" size={20} className="text-warning" />
              </DashboardCard>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              <section className="xl:w-[420px] space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">تصفية التدفق</h2>
                      <p className="text-xs text-muted-foreground">احتفظ فقط بأنواع الإجراءات التي تريد التحكم بها.</p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {visibleActions.length} shown
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث عن الإجراءات أو المستخدمين أو التذاكر"
                    />
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                      <Icon name="Filter" size={16} className="text-muted-foreground" />
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none"
                      >
                        {actionTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {actionTypes.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedType(option.value)}
                        className={`px-3 py-2 rounded-full text-xs font-medium border transition-colors ${
                          selectedType === option.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-border hover:text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div>
                      <h2 className="font-semibold text-foreground">الإجراءات الأخيرة</h2>
                      <p className="text-xs text-muted-foreground">
                        {showAll ? 'عرض كل إجراء متاح' : 'عرض آخر 8 إجراءات'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {filteredActions.length} total
                    </span>
                  </div>

                  <div className="max-h-[760px] overflow-y-auto divide-y divide-border">
                    {loading ? (
                      <div className="p-6 text-sm text-muted-foreground">جارٍ تحميل آخر الإجراءات...</div>
                    ) : visibleActions.length === 0 ? (
                      <div className="p-6 text-sm text-muted-foreground">لا توجد إجراءات تطابق الفلاتر الحالية.</div>
                    ) : (
                      visibleActions.map((action) => {
                        const meta = severityMeta[action.severity] || severityMeta.medium;
                        const isSelected = selectedAction?.id === action.id;
                        const TypeIcon = meta.icon;

                        return (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => setSelectedActionId(action.id)}
                            className={`w-full text-left p-4 transition-colors ${
                              isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${meta.className}`}>
                                <Icon name={TypeIcon} size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {typeLabels[action.type] || 'إجراء'}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${meta.className}`}>
                                    {meta.label}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-4">
                                  <h3 className="font-semibold text-foreground truncate">
                                    {action.title}
                                  </h3>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatTime(action.time)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {action.actor} • {action.role} • {action.target}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>

              <section className="flex-1 min-w-0 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  {selectedAction ? (
                    <>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              الإجراء المحدد
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${severityMeta[selectedAction.severity]?.className || severityMeta.medium.className}`}>
                              {severityMeta[selectedAction.severity]?.label || 'Medium'}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">{selectedAction.title}</h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {selectedAction.actor} • {selectedAction.role} • {selectedAction.area}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="rounded-xl bg-muted/50 px-3 py-2">
                            <span className="text-muted-foreground">الوجهة</span>
                            <div className="font-semibold text-foreground">{selectedAction.target}</div>
                          </div>
                          <div className="rounded-xl bg-muted/50 px-3 py-2">
                            <span className="text-muted-foreground">الحالة</span>
                            <div className="font-semibold text-foreground">{selectedAction.status}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">الوقت</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{formatTime(selectedAction.time)}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Source</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{selectedAction.source}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Reference</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{selectedAction.link || selectedAction.target}</p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary/5 to-muted/30 border border-border p-5">
                        <h3 className="font-semibold text-foreground">What this means</h3>
                        <p className="mt-2 text-sm text-muted-foreground leading-6">
                          {selectedAction.note}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                          variant="default"
                          iconName="Eye"
                          onClick={() => setShowAll(true)}
                        >
                          Show all
                        </Button>
                        <Button
                          variant="outline"
                          iconName="ClipboardCheck"
                          onClick={() => setSelectedType(selectedAction.type || 'all')}
                        >
                          Focus on this type
                        </Button>
                        <Button
                          variant="ghost"
                          iconName="Share2"
                          onClick={() => navigator?.clipboard?.writeText?.(selectedAction.title || '')}
                        >
                          Copy title
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      لا يوجد إجراء محدد.
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Control notes</h3>
                      <p className="text-xs text-muted-foreground">أوامر سريعة لمراجعة آخر تدفق للإجراءات.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-muted/30 border border-border p-4">
                      <p className="text-sm font-medium text-foreground">عرض كل الإجراءات</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Expands the feed so nothing recent is hidden behind pagination or quick filters.
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/30 border border-border p-4">
                      <p className="text-sm font-medium text-foreground">راجع العناصر الحرجة أولًا</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Critical approvals, escalations, and sync failures stay visible at the top of the feed.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuditTrailAndComplianceViewer;
