import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import DashboardCard from '../../components/ui/DashboardCard';
import Icon from '../../components/AppIcon';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
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

const typeLabelsAr = {
  approval: 'موافقة',
  ticket: 'تذكرة',
  integration: 'تكامل',
  security: 'تدقيق',
};

const sourceLabels = {
  workflow: { en: 'workflow', ar: 'سير العمل' },
  ticket: { en: 'ticket', ar: 'التذاكر' },
  integration: { en: 'integration', ar: 'التكامل' },
  audit: { en: 'audit', ar: 'التدقيق' },
  notification: { en: 'notification', ar: 'إشعار' },
};

const statusLabels = {
  completed: { en: 'Completed', ar: 'مكتمل' },
  synced: { en: 'Synced', ar: 'مزامن' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  read: { en: 'Read', ar: 'مقروء' },
  unread: { en: 'Unread', ar: 'غير مقروء' },
  'review required': { en: 'Review required', ar: 'يحتاج مراجعة' },
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
  const isArabic = language === 'ar';
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [actions, setActions] = useState(seedActions);

  const localizeTitle = (action) => {
    if (!isArabic) return action.title;
    const map = {
      'Manager approved escalation for TKT-4812': 'تمت الموافقة على تصعيد TKT-4812',
      'Ticket reassigned to ERP network support': 'إعادة إسناد التذكرة إلى دعم شبكة ERP',
      'Third-party sync sent after submit': 'تم إرسال المزامنة الخارجية بعد الإرسال',
      'Compliance exception reviewed for overdue SLA': 'تمت مراجعة استثناء الامتثال بسبب تجاوز SLA',
      'Priority updated to High on TKT-4890': 'تم تحديث الأولوية إلى مرتفع على TKT-4890',
      'Assignment request waiting for manager review': 'طلب الإسناد بانتظار مراجعة المدير',
    };
    return map[action.title] || action.title;
  };

  const localizeNote = (action) => {
    if (!isArabic) return action.note;
    const map = {
      'Approval completed and workflow moved to assignment.': 'اكتملت الموافقة وانتقل سير العمل إلى مرحلة الإسناد.',
      'Matched by service and organization rules.': 'تمت المطابقة وفق قواعد الخدمة والجهة.',
      'Outbound payload accepted by external service.': 'تم قبول الحمولة الصادرة من الخدمة الخارجية.',
      'Action remains open until remediation note is attached.': 'ستظل العملية مفتوحة حتى تتم إضافة ملاحظة المعالجة.',
      'Customer impact increased after the last update.': 'ازداد تأثير العميل بعد آخر تحديث.',
      'Queue item is waiting for the next approval step.': 'عنصر القائمة ينتظر خطوة الموافقة التالية.',
      'Notification activity recorded in the control feed.': 'تم تسجيل نشاط الإشعار في سجل التحكم.',
      'Ticket record updated.': 'تم تحديث سجل التذكرة.',
    };
    return map[action.note] || action.note;
  };

  const localizeActor = (action) => {
    if (!isArabic) return action.actor;
    const map = {
      System: 'النظام',
      'Integration Engine': 'محرك التكامل',
      'Amina Hassan': 'أمينة حسن',
      'Mona Ali': 'منى علي',
      'Omar Youssef': 'عمر يوسف',
    };
    return map[action.actor] || action.actor;
  };

  const localizeRole = (action) => {
    if (!isArabic) return action.role;
    const map = {
      Manager: 'مدير',
      Automation: 'أتمتة',
      Connector: 'موصل',
      Compliance: 'امتثال',
      Agent: 'وكيل',
      Workflow: 'سير العمل',
      Notification: 'إشعار',
    };
    return map[action.role] || action.role;
  };

  const localizeArea = (action) => {
    if (!isArabic) return action.area;
    const map = {
      Incident: 'حادث',
      'Service Request': 'طلب خدمة',
      Integration: 'تكامل',
      Audit: 'تدقيق',
      Inbox: 'الوارد',
    };
    return map[action.area] || action.area;
  };

  const localizeSource = (action) => {
    const source = sourceLabels[action.source] || { en: action.source, ar: action.source };
    return isArabic ? source.ar : source.en;
  };

  const localizeStatus = (status) => {
    const key = normalizeText(status);
    return isArabic ? (statusLabels[key]?.ar || status) : (statusLabels[key]?.en || status);
  };

  const localizeSeverity = (severity) => {
    if (!isArabic) return severityMeta[severity]?.label || severity || 'Medium';
    const map = {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
    };
    return map[severity] || severityMeta[severity]?.label || severity || 'متوسط';
  };

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
      return matchesType && (!query || haystack.includes(query));
    });
  }, [actions, searchQuery, selectedType]);

  const visibleActions = showAll ? filteredActions : filteredActions.slice(0, 8);
  const selectedAction =
    filteredActions.find((action) => action.id === selectedActionId) ||
    visibleActions[0] ||
    filteredActions[0] ||
    null;

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
    { value: 'approval', label: isArabic ? 'الموافقات' : t('approval', 'Approvals') },
    { value: 'ticket', label: isArabic ? 'التذاكر' : t('ticket', 'Tickets') },
    { value: 'integration', label: isArabic ? 'التكاملات' : t('integration', 'Integrations') },
    { value: 'security', label: isArabic ? 'التدقيق' : t('audit', 'Audit') },
  ];

  return (
    <>
      <Helmet>
        <title>{t('auditTrailTitle', 'Audit Trail and Compliance Viewer')}</title>
        <meta
          name="description"
          content={t(
            'auditTrailDescription',
            'Control center for reviewing recent actions, approvals, ticket updates, and integration activity.'
          )}
        />
      </Helmet>
      <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        <BreadcrumbTrail />

        <main className="pt-16">
          <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                    {isArabic ? 'مركز التحكم' : 'Control Center'}
                  </p>
                  <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                    {t('recentActionsVisible', 'Recent actions, fully visible.')}
                  </h1>
                  <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    {t(
                      'reviewApprovalsTickets',
                      'Review approvals, ticket updates, compliance events, and external operations in one place.'
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={showAll ? 'default' : 'outline'}
                    iconName={showAll ? 'List' : 'Rows3'}
                    onClick={() => setShowAll((prev) => !prev)}
                  >
                    {showAll ? t('showAllActions', 'Show all actions') : t('displayAllActions', 'Display all actions')}
                  </Button>
                  <Button
                    variant="ghost"
                    iconName="RefreshCw"
                    onClick={() => window.location.reload()}
                    disabled={loading}
                  >
                    {t('refresh', 'Refresh')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DashboardCard
                title={t('allActions', 'All Actions')}
                value={stats.total}
                subtitle={t('recentActionsVisible', 'Recent actions, fully visible.')}
              >
                <Icon name="Activity" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard
                title={isArabic ? 'آخر 24 ساعة' : 'Last 24 Hours'}
                value={stats.recent}
                subtitle={isArabic ? 'نافذة النشاط الأخير' : 'Recent activity window'}
              >
                <Icon name="Clock3" size={20} className="text-primary" />
              </DashboardCard>
              <DashboardCard
                title={isArabic ? 'عناصر حرجة' : 'Critical Items'}
                value={stats.critical}
                subtitle={isArabic ? 'تحتاج اهتمامًا فوريًا' : 'Need immediate attention'}
              >
                <Icon name="AlertTriangle" size={20} className="text-error" />
              </DashboardCard>
              <DashboardCard
                title={isArabic ? 'قيد المراجعة' : 'Under Review'}
                value={stats.pending}
                subtitle={isArabic ? 'بانتظار إجراءات التحكم' : 'Awaiting control actions'}
              >
                <Icon name="ClipboardCheck" size={20} className="text-warning" />
              </DashboardCard>
            </div>

            <ManageEngineOnPremSnapshot
              compact
              title={t('manageEngineAuditContext', 'ManageEngine Audit Context')}
              description={t('manageEngineAuditContextDesc', 'Live ServiceDesk and OpManager integration health for compliance reviews, external operations, and audit evidence.')}
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <section className="space-y-4 xl:w-[420px]">
                <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {isArabic ? 'تصفية التدفق' : 'Flow Filter'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {isArabic
                          ? 'احتفظ فقط بأنواع الإجراءات التي تريد التحكم بها.'
                          : 'Keep only the action types you want to control.'}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {isArabic ? `${visibleActions.length} معروضة` : `${visibleActions.length} shown`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isArabic ? 'ابحث عن الإجراءات أو المستخدمين أو التذاكر' : 'Search actions, users, or tickets'}
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
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                          selectedType === option.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {isArabic ? 'الإجراءات الأخيرة' : 'Recent Actions'}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {showAll
                          ? isArabic
                            ? 'عرض كل إجراء متاح'
                            : 'Showing all available actions'
                          : isArabic
                            ? 'عرض آخر 8 إجراءات'
                            : 'Showing the latest 8 actions'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {filteredActions.length} total
                    </span>
                  </div>

                  <div className="max-h-[760px] divide-y divide-border overflow-y-auto">
                    {loading ? (
                      <div className="p-6 text-sm text-muted-foreground">
                        {isArabic ? 'جارٍ تحميل آخر الإجراءات...' : 'Loading recent actions...'}
                      </div>
                    ) : visibleActions.length === 0 ? (
                      <div className="p-6 text-sm text-muted-foreground">
                        {isArabic ? 'لا توجد إجراءات تطابق الفلاتر الحالية.' : 'No actions match the current filters.'}
                      </div>
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
                            className={`w-full p-4 text-left transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${meta.className}`}>
                                <Icon name={TypeIcon} size={18} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    {isArabic ? (typeLabelsAr[action.type] || 'إجراء') : (action.type || 'Action')}
                                  </span>
                                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.className}`}>
                                    {localizeSeverity(action.severity)}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-4">
                                  <h3 className="truncate font-semibold text-foreground">
                                    {localizeTitle(action)}
                                  </h3>
                                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                                    {formatTime(action.time)}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {localizeActor(action)} • {localizeRole(action)} • {action.target}
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

              <section className="min-w-0 flex-1 space-y-4">
                <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  {selectedAction ? (
                    <>
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              {isArabic ? 'الإجراء المحدد' : 'Selected Action'}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${severityMeta[selectedAction.severity]?.className || severityMeta.medium.className}`}>
                              {localizeSeverity(selectedAction.severity)}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-foreground">{localizeTitle(selectedAction)}</h2>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {localizeActor(selectedAction)} • {localizeRole(selectedAction)} • {localizeArea(selectedAction)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="rounded-xl bg-muted/50 px-3 py-2">
                            <span className="text-muted-foreground">{isArabic ? 'الوجهة' : 'Destination'}</span>
                            <div className="font-semibold text-foreground">{selectedAction.target}</div>
                          </div>
                          <div className="rounded-xl bg-muted/50 px-3 py-2">
                            <span className="text-muted-foreground">{isArabic ? 'الحالة' : 'Status'}</span>
                            <div className="font-semibold text-foreground">{localizeStatus(selectedAction.status)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {isArabic ? 'الوقت' : 'Time'}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">{formatTime(selectedAction.time)}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t('source', 'Source')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">{localizeSource(selectedAction)}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                            {t('reference', 'Reference')}
                          </p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {selectedAction.link || selectedAction.target}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-muted/30 p-5">
                        <h3 className="font-semibold text-foreground">{t('whatThisMeans', 'What this means')}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {localizeNote(selectedAction)}
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Button variant="default" iconName="Eye" onClick={() => setShowAll(true)}>
                          {isArabic ? 'عرض كل الإجراءات' : 'Show all'}
                        </Button>
                        <Button variant="outline" iconName="ClipboardCheck" onClick={() => setSelectedType(selectedAction.type || 'all')}>
                          {isArabic ? 'تركيز على هذا النوع' : 'Focus on this type'}
                        </Button>
                        <Button variant="ghost" iconName="Share2" onClick={() => navigator?.clipboard?.writeText?.(selectedAction.title || '')}>
                          {isArabic ? 'نسخ العنوان' : 'Copy title'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-10 text-center text-muted-foreground">
                      {isArabic ? 'لا يوجد إجراء محدد.' : 'No action selected.'}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{t('controlNotes', 'Control notes')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'أوامر سريعة لمراجعة آخر تدفق للإجراءات.' : 'Quick actions to review the latest action stream.'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">
                        {isArabic ? 'عرض كل الإجراءات' : 'Show all actions'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isArabic
                          ? 'يوسّع الخلاصة حتى لا يختبئ أي عنصر حديث خلف التصفية أو الصفحات.'
                          : 'Expands the feed so nothing recent is hidden behind pagination or quick filters.'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">
                        {isArabic ? 'راجع العناصر الحرجة أولًا' : 'Review critical items first'}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isArabic
                          ? 'تبقى الموافقات الحرجة والتصعيدات وفشل المزامنة ظاهرة في أعلى الخلاصة.'
                          : 'Critical approvals, escalations, and sync failures stay visible at the top of the feed.'}
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
