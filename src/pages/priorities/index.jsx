import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { slaAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const PrioritiesPage = () => {
  const navigate = useNavigate();
  const [priorities, setPriorities] = useState([]);
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = language === 'ar';

  const priorityDescriptions = {
    urgent: 'حوادث حرجة في الأعمال توقف العمل أو تؤثر على عدد كبير من المستخدمين.',
    high: 'مشكلات مهمة ذات تأثير كبير لكن ضمن نطاق محدود.',
    medium: 'تذاكر تشغيلية قياسية وطلبات خدمة.',
    low: 'طلبات بسيطة وأعمال يمكن جدولتها.',
  };

  const localizedLevel = (level) => {
    const map = {
      urgent: { impact: 'حرجة', urgency: 'فورية' },
      high: { impact: 'عالية', urgency: 'عالية' },
      medium: { impact: 'متوسطة', urgency: 'متوسطة' },
      low: { impact: 'منخفضة', urgency: 'منخفضة' },
    };
    return map[level] || {};
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await slaAPI.getPriorities();
        setPriorities(Array.isArray(res.data) && res.data.length ? res.data : []);
      } catch {
        setPriorities([]);
      }
    };
    load();
  }, []);

  const cards = priorities.length ? priorities : [
    { key: 'urgent', label: isArabic ? 'عاجل' : t('urgent', 'Urgent'), impact: isArabic ? 'حرجة' : t('critical', 'Critical'), urgency: isArabic ? 'فورية' : t('immediate', 'Immediate'), responseHours: 1, resolutionHours: 4, escalationMinutes: 30, description: isArabic ? priorityDescriptions.urgent : t('stopTheLineIssues', 'Stop-the-line issues.') },
    { key: 'high', label: isArabic ? 'عالية' : t('high', 'High'), impact: isArabic ? 'عالية' : t('high', 'High'), urgency: isArabic ? 'عالية' : t('high', 'High'), responseHours: 2, resolutionHours: 8, escalationMinutes: 120, description: isArabic ? priorityDescriptions.high : t('significantOperationalImpact', 'Significant operational impact.') },
    { key: 'medium', label: isArabic ? 'متوسطة' : t('medium', 'Medium'), impact: isArabic ? 'متوسطة' : t('medium', 'Medium'), urgency: isArabic ? 'متوسطة' : t('medium', 'Medium'), responseHours: 8, resolutionHours: 24, escalationMinutes: 240, description: isArabic ? priorityDescriptions.medium : t('standardSupportRequest', 'Standard support request.') },
    { key: 'low', label: isArabic ? 'منخفضة' : t('low', 'Low'), impact: isArabic ? 'منخفضة' : t('low', 'Low'), urgency: isArabic ? 'منخفضة' : t('low', 'Low'), responseHours: 24, resolutionHours: 72, escalationMinutes: 480, description: isArabic ? priorityDescriptions.low : t('canBeScheduled', 'Can be scheduled.') },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet><title>{t('priorities', 'Priorities')}</title></Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-amber-500/10 via-background to-background p-6 md:p-8 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-600 font-semibold">{t('priorityMatrix', 'Priority Matrix')}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{t('priorities', 'Priorities')}</h1>
              <p className="text-muted-foreground">{isArabic ? 'استخدم هذه الأهداف لتوجيه التذاكر والحوادث والتصعيدات بشكل متسق.' : t('prioritiesDescription', 'Use these targets to route tickets, incidents, and escalations consistently.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">{isArabic ? 'تذاكر' : t('tickets', 'Tickets')}</Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">{isArabic ? 'حوادث' : t('incidents', 'Incidents')}</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-creation')} iconName="Plus">{isArabic ? 'تذكرة جديدة' : t('newTicket', 'New Ticket')}</Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((priority) => (
            <div key={priority.key} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className={`flex items-start justify-between gap-2 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h2 className={`text-xl font-semibold text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{priority.label}</h2>
                  <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{priority.description}</p>
                </div>
                <Icon name="Flag" size={20} className="text-primary" />
              </div>
              <div className="space-y-2 text-sm">
                <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-muted-foreground">{isArabic ? 'التأثير' : t('impact', 'Impact')}</span><span className="font-medium">{priority.impact}</span></div>
                <div className={`flex justify-between ${isRtl ? 'flex-row-reverse' : ''}`}><span className="text-muted-foreground">{isArabic ? 'الإلحاح' : t('urgency', 'Urgency')}</span><span className="font-medium">{priority.urgency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isArabic ? 'الاستجابة' : t('response', 'Response')}</span><span className="font-medium">{priority.responseHours}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isArabic ? 'الحل' : t('resolution', 'Resolution')}</span><span className="font-medium">{priority.resolutionHours}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{isArabic ? 'تصعيد' : t('escalate', 'Escalate')}</span><span className="font-medium">{priority.escalationMinutes}m</span></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-management-center?priority=${encodeURIComponent(priority.label)}`)}>{isArabic ? 'تذاكر' : t('tickets', 'Tickets')}</Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/search?priority=${encodeURIComponent(priority.label)}`)}>{isArabic ? 'بحث' : t('search', 'Search')}</Button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PrioritiesPage;
