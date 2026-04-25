import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ManageEngineOnPremSnapshot from '../../components/manageengine/ManageEngineOnPremSnapshot';
import { slaAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const EscalationsPage = () => {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState([]);
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';

  const levelCopy = useMemo(() => ({
    L1: {
      ar: { title: 'المستوى الأول', trigger: 'التعيين الأولي / لا يوجد رد', action: 'أخطر مكتب الخدمة وأبقها في قائمة الانتظار' },
      en: { title: 'Level 1', trigger: 'Initial assignment / no response', action: 'Notify service desk and keep on queue' },
      route: '/ticket-management-center',
      routeLabel: { ar: 'فتح مركز التذاكر', en: 'Open ticket center' },
    },
    L2: {
      ar: { title: 'المستوى الثاني', trigger: 'لا تزال أولوية عالية مفتوحة', action: 'صعّد إلى قائمة المختصين' },
      en: { title: 'Level 2', trigger: 'High priority still open', action: 'Escalate to specialist queue' },
      route: '/ticket-details',
      routeLabel: { ar: 'فتح التفاصيل', en: 'Open details' },
    },
    L3: {
      ar: { title: 'المستوى الثالث', trigger: 'خطر على SLA / انقطاع حرج', action: 'أخطر مدير الحوادث وابدأ الجسر' },
      en: { title: 'Level 3', trigger: 'SLA risk / critical outage', action: 'Notify incident manager and start bridge' },
      route: '/incident-management-workflow',
      routeLabel: { ar: 'فتح إدارة الحوادث', en: 'Open incident workflow' },
    },
    L4: {
      ar: { title: 'المستوى الرابع', trigger: 'خرق أو تأثير تنفيذي', action: 'صعّد إلى الإدارة ولوحة المدير التنفيذية' },
      en: { title: 'Level 4', trigger: 'Breach or executive impact', action: 'Escalate to management and executive dashboard' },
      route: '/manager-dashboard',
      routeLabel: { ar: 'فتح لوحة المدير', en: 'Open manager dashboard' },
    },
  }), []);

  const resolveLevel = (rawLevel) => {
    const key = String(rawLevel || '').toUpperCase();
    const entry = levelCopy[key];
    if (!entry) return rawLevel || '';
    return isArabic ? entry.ar.title : entry.en.title;
  };

  const resolveTrigger = (item) => {
    const key = String(item?.level || item?.Level || '').toUpperCase();
    const entry = levelCopy[key];
    if (isArabic && entry) return entry.ar.trigger;
    return item?.trigger || item?.Trigger || (entry ? entry.en.trigger : '');
  };

  const resolveAction = (item) => {
    const key = String(item?.level || item?.Level || '').toUpperCase();
    const entry = levelCopy[key];
    if (isArabic && entry) return entry.ar.action;
    return item?.action || item?.Action || (entry ? entry.en.action : '');
  };

  const resolveRoute = (item) => {
    const key = String(item?.level || item?.Level || '').toUpperCase();
    return item?.route || item?.Route || levelCopy[key]?.route || '/ticket-management-center';
  };

  const resolveRouteLabel = (item) => {
    const key = String(item?.level || item?.Level || '').toUpperCase();
    const entry = levelCopy[key];
    if (!entry) return isArabic ? 'فتح' : 'Open';
    return isArabic ? entry.routeLabel.ar : entry.routeLabel.en;
  };

  const resolveOwner = (item) => {
    const key = String(item?.level || item?.Level || '').toUpperCase();
    const defaults = {
      L1: 'Service Desk',
      L2: 'Team Lead',
      L3: 'Incident Manager',
      L4: 'IT Service Manager',
    };
    return item?.owner || item?.Owner || defaults[key] || '';
  };

  const resolveThreshold = (item) => item?.triggerMinutes || item?.TriggerMinutes || item?.threshold || item?.Threshold || '';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await slaAPI.getEscalations();
        setEscalations(Array.isArray(res.data) && res.data.length ? res.data : []);
      } catch {
        setEscalations([]);
      }
    };
    load();
  }, []);

  const fallback = [
    { level: 'L1' },
    { level: 'L2' },
    { level: 'L3' },
    { level: 'L4' },
  ];

  const cards = escalations.length ? escalations : fallback;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('escalations', 'Escalations')}</title>
      </Helmet>

      <Header />
      <BreadcrumbTrail />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 lg:px-8 md:py-8">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-elevation-1">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {t('escalationPaths', 'Escalation Paths')}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-foreground">
                {t('escalations', 'Escalations')}
              </h1>
              <p className="text-muted-foreground">
                {t(
                  'escalationsDescription',
                  'See when tickets move up the chain and jump into the right operational page.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">
                {t('incidents', 'Incidents')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">
                {t('tickets', 'Tickets')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/manager-dashboard')} iconName="LineChart">
                {t('manager', 'Manager')}
              </Button>
            </div>
          </div>
        </section>

        <ManageEngineOnPremSnapshot
          compact
          title={t('manageEngineEscalationSignals', 'ManageEngine Escalation Signals')}
          description={t('manageEngineEscalationSignalsDesc', 'Correlate ServiceDesk request pressure with OpManager 12.8.270 alerts before deciding escalation thresholds.')}
        />

        <section className="space-y-4">
          {cards.map((item, index) => {
            const route = resolveRoute(item);
            const level = resolveLevel(item.level || item.Level);
            const trigger = resolveTrigger(item);
            const action = resolveAction(item);
            const owner = resolveOwner(item);
            const threshold = resolveThreshold(item);

            return (
              <div key={`${item.level || item.Level || 'escalation'}-${index}`} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon name="ArrowUpRight" size={20} className="text-primary" />
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{level}</div>
                      <h2 className="mt-1 text-lg font-semibold text-foreground">{trigger}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{action}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" onClick={() => navigate(route)}>
                      {resolveRouteLabel(item)}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/search')}>
                      {t('search', 'Search')}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <span className="text-muted-foreground">{t('owner', 'Owner')}</span>
                    <span className="ml-2 font-medium text-foreground">{owner}</span>
                  </div>
                  <div className="rounded-lg bg-muted px-3 py-2">
                    <span className="text-muted-foreground">{t('threshold', 'Threshold')}</span>
                    <span className="ml-2 font-medium text-foreground">{threshold}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default EscalationsPage;
