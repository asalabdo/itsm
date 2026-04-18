import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { slaAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const SlaPoliciesPage = () => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const fallbackPolicies = [
    { key: 'technical-support', name: t('technicalSupport', 'الدعم الفني'), priority: t('high', 'عالية'), responseHours: 2, resolutionHours: 8, escalationMinutes: 120, owner: t('serviceDesk', 'مكتب الخدمة'), notes: t('hardwareIssues', 'مشكلات الأجهزة والبريد والطابعة والشبكة.') },
    { key: 'access-management', name: t('accessManagement', 'إدارة الوصول'), priority: t('high', 'عالية'), responseHours: 1, resolutionHours: 4, escalationMinutes: 60, owner: t('securityOperations', 'عمليات الأمن'), notes: t('passwordResetNotes', 'إعادة تعيين كلمة المرور وMFA وVPN والصلاحيات.') },
    { key: 'incident-management', name: t('incidentManagement', 'إدارة الحوادث'), priority: t('urgent', 'عاجلة'), responseHours: 1, resolutionHours: 4, escalationMinutes: 30, owner: t('incidentManager', 'مدير الحوادث'), notes: t('majorIncidents', 'الحوادث الكبرى والانقطاعات.') },
    { key: 'service-request', name: t('serviceRequests', 'طلبات الخدمة'), priority: t('medium', 'متوسطة'), responseHours: 8, resolutionHours: 24, escalationMinutes: 240, owner: t('fulfillmentTeam', 'فريق التنفيذ'), notes: t('equipmentSoftware', 'المعدات والبرمجيات والتأهيل.') },
  ];

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
    { label: t('policies', 'السياسات'), value: policies.length, icon: 'ShieldCheck' },
    { label: t('urgentPaths', 'المسارات العاجلة'), value: policies.filter((p) => p.priority === t('urgent', 'عاجلة') || p.priority === t('high', 'عالية') || p.priority === 'Urgent' || p.priority === 'High').length, icon: 'AlertTriangle' },
    { label: t('avgResponse', 'متوسط الاستجابة'), value: `${Math.round(policies.reduce((sum, p) => sum + (p.responseHours || 0), 0) / Math.max(policies.length, 1))}h`, icon: 'Clock' },
    { label: t('avgResolution', 'متوسط الحل'), value: `${Math.round(policies.reduce((sum, p) => sum + (p.resolutionHours || 0), 0) / Math.max(policies.length, 1))}h`, icon: 'Timer' },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('slaPoliciesTitle', 'سياسات SLA')}</title>
      </Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 shadow-elevation-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{t('serviceLevelManagement', 'إدارة مستوى الخدمة')}</div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t('slaPoliciesTitle', 'سياسات SLA')}</h1>
              <p className="text-muted-foreground max-w-2xl">{t('slaPoliciesDescription', 'راجع أهداف مستوى الخدمة وانتقل مباشرة إلى التذاكر أو الحوادث عند الحاجة.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-creation')} iconName="Plus">{t('newTicket', 'إنشاء تذكرة')}</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">{t('tickets', 'التذاكر')}</Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">{t('incidents', 'الحوادث')}</Button>
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
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">{t('loadingSlaPolicies', 'جارٍ تحميل سياسات SLA...')}</div>
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
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('responseTime', 'الاستجابة')}</p>
                    <p className="text-sm font-semibold text-foreground">{policy.responseHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('resolutionTime', 'الحل')}</p>
                    <p className="text-sm font-semibold text-foreground">{policy.resolutionHours}h</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('escalationTime', 'التصعيد')}</p>
                    <p className="text-sm font-semibold text-foreground">{policy.escalationMinutes}m</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-management-center?priority=${encodeURIComponent(policy.priority)}`)}>{t('tickets', 'التذاكر')}</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/incident-management-workflow?priority=${encodeURIComponent(policy.priority)}`)}>{t('incidents', 'الحوادث')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/search')}>{t('search', 'بحث')}</Button>
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
