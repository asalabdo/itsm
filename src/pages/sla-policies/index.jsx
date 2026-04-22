import { useCallback, useEffect, useMemo, useState } from 'react';
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

const SERVICE_CARDS = [
  {
    key: 'technical-support',
    en: {
      name: 'Technical Support',
      owner: 'Service Desk',
      priority: 'High',
      notes: 'Device, email, printer, and network connectivity issues.',
    },
    ar: {
      name: 'الدعم الفني',
      owner: 'مكتب الخدمة',
      priority: 'عالية',
      notes: 'مشكلات الأجهزة والبريد والطابعة والاتصال بالشبكة.',
    },
    responseHours: 2,
    resolutionHours: 8,
    escalationMinutes: 120,
  },
  {
    key: 'access-management',
    en: {
      name: 'Access Management',
      owner: 'Security Operations',
      priority: 'High',
      notes: 'Password resets, account unlocks, MFA, VPN, and permissions.',
    },
    ar: {
      name: 'إدارة الوصول',
      owner: 'عمليات الأمن',
      priority: 'عالية',
      notes: 'إعادة تعيين كلمة المرور، وفتح الحسابات، وMFA، وVPN، والصلاحيات.',
    },
    responseHours: 1,
    resolutionHours: 4,
    escalationMinutes: 60,
  },
  {
    key: 'asset-management',
    en: {
      name: 'Asset Management',
      owner: 'IT Asset Team',
      priority: 'Low',
      notes: 'Register, transfer, audit, and dispose assets.',
    },
    ar: {
      name: 'إدارة الأصول',
      owner: 'فريق أصول تقنية المعلومات',
      priority: 'منخفضة',
      notes: 'تسجيل الأصول ونقلها ومراجعتها والتخلص منها.',
    },
    responseHours: 24,
    resolutionHours: 72,
    escalationMinutes: 480,
  },
  {
    key: 'change-management',
    en: {
      name: 'Change Management',
      owner: 'Change Advisory Board',
      priority: 'Medium',
      notes: 'Planned changes, configs, deployment, rollback.',
    },
    ar: {
      name: 'إدارة التغيير',
      owner: 'لجنة استشارات التغيير',
      priority: 'متوسطة',
      notes: 'التغييرات المخططة، والإعدادات، والنشر، والاسترجاع.',
    },
    responseHours: 8,
    resolutionHours: 24,
    escalationMinutes: 240,
  },
  {
    key: 'cyber-security',
    en: {
      name: 'Cyber Security',
      owner: 'Security Team',
      priority: 'Urgent',
      notes: 'Phishing, breach, VPN, USB, antivirus, suspicious links.',
    },
    ar: {
      name: 'الأمن السيبراني',
      owner: 'فريق الأمن',
      priority: 'عاجلة',
      notes: 'التصيد، والاختراق، وVPN، وUSB، ومضاد الفيروسات، والروابط المشبوهة.',
    },
    responseHours: 1,
    resolutionHours: 4,
    escalationMinutes: 30,
  },
  {
    key: 'hr-services',
    en: {
      name: 'HR Services',
      owner: 'HR Shared Services',
      priority: 'Medium',
      notes: 'Leave, attendance, onboarding, and employee request support.',
    },
    ar: {
      name: 'خدمات الموارد البشرية',
      owner: 'الخدمات المشتركة للموارد البشرية',
      priority: 'متوسطة',
      notes: 'الإجازات والحضور والتعيين ودعم طلبات الموظفين.',
    },
    responseHours: 8,
    resolutionHours: 24,
    escalationMinutes: 240,
  },
  {
    key: 'finance-erp',
    en: {
      name: 'Finance & ERP',
      owner: 'Finance Applications',
      priority: 'Medium',
      notes: 'ERP, procurement, finance, reporting, and data corrections.',
    },
    ar: {
      name: 'المالية وERP',
      owner: 'تطبيقات المالية',
      priority: 'متوسطة',
      notes: 'ERP، والمشتريات، والمالية، والتقارير، وتصحيح البيانات.',
    },
    responseHours: 8,
    resolutionHours: 24,
    escalationMinutes: 240,
  },
  {
    key: 'facilities',
    en: {
      name: 'Facilities',
      owner: 'Facilities Operations',
      priority: 'Low',
      notes: 'Meeting rooms, car services, maintenance and phone services.',
    },
    ar: {
      name: 'المرافق',
      owner: 'عمليات المرافق',
      priority: 'منخفضة',
      notes: 'غرف الاجتماعات، وخدمات السيارات، والصيانة، وخدمات الهاتف.',
    },
    responseHours: 24,
    resolutionHours: 72,
    escalationMinutes: 480,
  },
  {
    key: 'incident-management',
    en: {
      name: 'Incident Management',
      owner: 'Incident Commander',
      priority: 'Urgent',
      notes: 'Major incidents, outages, data loss and security incidents.',
    },
    ar: {
      name: 'إدارة الحوادث',
      owner: 'قائد الحوادث',
      priority: 'عاجلة',
      notes: 'الحوادث الكبرى، والانقطاعات، وفقدان البيانات، والحوادث الأمنية.',
    },
    responseHours: 1,
    resolutionHours: 4,
    escalationMinutes: 30,
  },
  {
    key: 'knowledge-base',
    en: {
      name: 'Knowledge Base',
      owner: 'Knowledge Team',
      priority: 'Low',
      notes: 'Article creation, updates and access requests.',
    },
    ar: {
      name: 'قاعدة المعرفة',
      owner: 'فريق المعرفة',
      priority: 'منخفضة',
      notes: 'إنشاء المقالات وتحديثها وطلبات الوصول.',
    },
    responseHours: 48,
    resolutionHours: 120,
    escalationMinutes: 1440,
  },
  {
    key: 'service-requests',
    en: {
      name: 'Service Requests',
      owner: 'Fulfillment Team',
      priority: 'Medium',
      notes: 'Equipment, software, onboarding and workspace requests.',
    },
    ar: {
      name: 'طلبات الخدمة',
      owner: 'فريق التنفيذ',
      priority: 'متوسطة',
      notes: 'طلبات الأجهزة والبرمجيات والتعيين ومساحات العمل.',
    },
    responseHours: 8,
    resolutionHours: 24,
    escalationMinutes: 240,
  },
  {
    key: 'software-licensing',
    en: {
      name: 'Software Licensing',
      owner: 'Software Asset Team',
      priority: 'Medium',
      notes: 'New, renew, transfer, revoke and audit licenses.',
    },
    ar: {
      name: 'ترخيص البرمجيات',
      owner: 'فريق أصول البرمجيات',
      priority: 'متوسطة',
      notes: 'إصدار التراخيص وتجديدها ونقلها وإلغاؤها ومراجعتها.',
    },
    responseHours: 8,
    resolutionHours: 24,
    escalationMinutes: 240,
  },
];

const SlaPoliciesPage = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const isArabic = language === 'ar';

  const fallbackPolicies = useMemo(
    () =>
      SERVICE_CARDS.map((policy) => ({
        key: policy.key,
        name: isArabic ? policy.ar.name : policy.en.name,
        owner: isArabic ? policy.ar.owner : policy.en.owner,
        priority: isArabic ? policy.ar.priority : policy.en.priority,
        notes: isArabic ? policy.ar.notes : policy.en.notes,
        responseHours: policy.responseHours,
        resolutionHours: policy.resolutionHours,
        escalationMinutes: policy.escalationMinutes,
      })),
    [isArabic]
  );

  const [policies, setPolicies] = useState(fallbackPolicies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPolicies(fallbackPolicies);
  }, [fallbackPolicies]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await slaAPI.getPolicies();
        const rawPolicies = Array.isArray(res.data) ? res.data : [];
        if (rawPolicies.length) {
          const normalized = rawPolicies.map((policy, index) => {
            const catalog = SERVICE_CARDS.find((item) => item.key === policy.key || item.key === policy.id || item.key === policy.name?.toLowerCase?.()?.replace?.(/\s+/g, '-'));
            if (!catalog) {
              return {
                key: policy.key || policy.id || `policy-${index}`,
                name: policy.name || '',
                owner: policy.owner || '',
                priority: policy.priority || '',
                notes: policy.notes || '',
                responseHours: policy.responseHours ?? policy.response ?? 0,
                resolutionHours: policy.resolutionHours ?? policy.resolution ?? 0,
                escalationMinutes: policy.escalationMinutes ?? policy.escalation ?? 0,
              };
            }

            return {
              key: catalog.key,
              name: isArabic ? catalog.ar.name : policy.name || catalog.en.name,
              owner: isArabic ? catalog.ar.owner : policy.owner || catalog.en.owner,
              priority: isArabic ? catalog.ar.priority : policy.priority || catalog.en.priority,
              notes: isArabic ? catalog.ar.notes : policy.notes || catalog.en.notes,
              responseHours: policy.responseHours ?? policy.response ?? catalog.responseHours,
              resolutionHours: policy.resolutionHours ?? policy.resolution ?? catalog.resolutionHours,
              escalationMinutes: policy.escalationMinutes ?? policy.escalation ?? catalog.escalationMinutes,
            };
          });
          setPolicies(normalized);
        } else {
          setPolicies(fallbackPolicies);
        }
      } catch {
        setPolicies(fallbackPolicies);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fallbackPolicies, isArabic]);

  const stats = useMemo(() => {
    const urgentCount = policies.filter((policy) => ['Urgent', 'High', 'عاجلة', 'عالية'].includes(policy.priority)).length;
    const avgResponse = Math.round(policies.reduce((sum, policy) => sum + Number(policy.responseHours || 0), 0) / Math.max(policies.length, 1));
    const avgResolution = Math.round(policies.reduce((sum, policy) => sum + Number(policy.resolutionHours || 0), 0) / Math.max(policies.length, 1));

    return [
      { label: isArabic ? 'البطاقات' : t('policies', 'Policies'), value: policies.length, icon: 'ShieldCheck' },
      { label: isArabic ? 'المسارات العاجلة' : t('urgentPaths', 'Urgent Paths'), value: urgentCount, icon: 'AlertTriangle' },
      { label: isArabic ? 'متوسط الاستجابة' : t('avgResponse', 'Avg Response'), value: `${avgResponse}h`, icon: 'Clock' },
      { label: isArabic ? 'متوسط الحل' : t('avgResolution', 'Avg Resolution'), value: `${avgResolution}h`, icon: 'Timer' },
    ];
  }, [isArabic, policies, t]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{isArabic ? 'سياسات مستوى الخدمة' : t('slaPoliciesTitle', 'SLA Policies')}</title>
      </Helmet>

      <Header />
      <BreadcrumbTrail />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6 lg:px-8 md:py-8">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-elevation-2 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                {isArabic ? 'إدارة مستوى الخدمة' : t('serviceLevelManagement', 'Service Level Management')}
              </div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {isArabic ? 'سياسات مستوى الخدمة' : t('slaPoliciesTitle', 'SLA Policies')}
              </h1>
              <p className="max-w-2xl text-muted-foreground">
                {isArabic
                  ? 'راجع أهداف مستوى الخدمة وانتقل مباشرة إلى التذاكر أو الحوادث عند الحاجة.'
                  : t(
                      'slaPoliciesDescription',
                      'Review service level targets and jump directly to tickets or incidents when needed.'
                    )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-creation')} iconName="Plus">
                {isArabic ? 'تذكرة جديدة' : t('newTicket', 'New Ticket')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">
                {isArabic ? 'التذاكر' : t('tickets', 'Tickets')}
              </Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">
                {isArabic ? 'الحوادث' : t('incidents', 'Incidents')}
              </Button>
              <Button variant="ghost" onClick={() => navigate('/priorities')} iconName="SlidersHorizontal">
                {isArabic ? 'السياسات' : t('priorities', 'Priorities')}
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4 shadow-elevation-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{item.value}</p>
                </div>
                <Icon name={item.icon} size={22} className="text-primary" />
              </div>
            </div>
          ))}
        </section>

        <ManageEngineOnPremSnapshot
          compact
          title={t('manageEngineSlaPolicyContext', 'ManageEngine SLA Policy Context')}
          description={t('manageEngineSlaPolicyContextDesc', 'On-prem ServiceDesk requests and OpManager alerts that can affect response and resolution targets.')}
        />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              {isArabic ? 'جارٍ تحميل سياسات مستوى الخدمة...' : t('loadingSlaPolicies', 'Loading SLA policies...')}
            </div>
          ) : (
            policies.map((policy) => (
              <div
                key={policy.key}
                className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1 transition-shadow hover:shadow-elevation-2"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{policy.name}</h2>
                    <p className="text-sm text-muted-foreground">{policy.owner}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    {policy.priority}
                  </span>
                </div>

                <p className="mb-4 text-sm text-muted-foreground">{policy.notes}</p>

                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {isArabic ? 'الاستجابة' : t('responseTime', 'Response')}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{policy.responseHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {isArabic ? 'الحل' : t('resolutionTime', 'Resolution')}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{policy.resolutionHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {isArabic ? 'التصعيد' : t('escalationTime', 'Escalation')}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{policy.escalationMinutes}m</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-management-center?priority=${encodeURIComponent(policy.priority)}`)}>
                    {isArabic ? 'التذاكر' : t('tickets', 'Tickets')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/incident-management-workflow?priority=${encodeURIComponent(policy.priority)}`)}>
                    {isArabic ? 'الحوادث' : t('incidents', 'Incidents')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/search')}>
                    {isArabic ? 'بحث' : t('search', 'Search')}
                  </Button>
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
