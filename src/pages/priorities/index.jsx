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
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

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
    { key: 'urgent', label: t('urgent', 'Urgent'), impact: t('critical', 'Critical'), urgency: t('immediate', 'Immediate'), responseHours: 1, resolutionHours: 4, escalationMinutes: 30, description: t('stopTheLineIssues', 'Stop-the-line issues.') },
    { key: 'high', label: t('high', 'High'), impact: t('high', 'High'), urgency: t('high', 'High'), responseHours: 2, resolutionHours: 8, escalationMinutes: 120, description: t('significantOperationalImpact', 'Significant operational impact.') },
    { key: 'medium', label: t('medium', 'Medium'), impact: t('medium', 'Medium'), urgency: t('medium', 'Medium'), responseHours: 8, resolutionHours: 24, escalationMinutes: 240, description: t('standardSupportRequest', 'Standard support request.') },
    { key: 'low', label: t('low', 'Low'), impact: t('low', 'Low'), urgency: t('low', 'Low'), responseHours: 24, resolutionHours: 72, escalationMinutes: 480, description: t('canBeScheduled', 'Can be scheduled.') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>{t('priorities', 'Priorities')}</title></Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-gradient-to-br from-amber-500/10 via-background to-background p-6 md:p-8 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-600 font-semibold">{t('priorityMatrix', 'Priority Matrix')}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{t('priorities', 'Priorities')}</h1>
              <p className="text-muted-foreground">{t('prioritiesDescription', 'Use these targets to route tickets, incidents, and escalations consistently.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">{t('tickets', 'Tickets')}</Button>
              <Button variant="outline" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">{t('incidents', 'Incidents')}</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-creation')} iconName="Plus">{t('newTicket', 'New Ticket')}</Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((priority) => (
            <div key={priority.key} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{priority.label}</h2>
                  <p className="text-sm text-muted-foreground">{priority.description}</p>
                </div>
                <Icon name="Flag" size={20} className="text-primary" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{t('impact', 'Impact')}</span><span className="font-medium">{priority.impact}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('urgency', 'Urgency')}</span><span className="font-medium">{priority.urgency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('response', 'Response')}</span><span className="font-medium">{priority.responseHours}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('resolution', 'Resolution')}</span><span className="font-medium">{priority.resolutionHours}h</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{t('escalate', 'Escalate')}</span><span className="font-medium">{priority.escalationMinutes}m</span></div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => navigate(`/ticket-management-center?priority=${encodeURIComponent(priority.label)}`)}>{t('tickets', 'Tickets')}</Button>
                <Button size="sm" variant="outline" onClick={() => navigate(`/search?priority=${encodeURIComponent(priority.label)}`)}>{t('search', 'Search')}</Button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default PrioritiesPage;
