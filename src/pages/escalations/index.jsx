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

const EscalationsPage = () => {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState([]);
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

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
    { level: 'L1', trigger: t('30minutes', '30 minutes'), action: t('serviceDeskReview', 'Service desk review'), owner: t('serviceDesk', 'Service Desk'), route: '/ticket-management-center' },
    { level: 'L2', trigger: t('2hours', '2 hours'), action: t('specialistQueueEscalation', 'Specialist queue escalation'), owner: t('teamLead', 'Team Lead'), route: '/ticket-details' },
    { level: 'L3', trigger: t('4hours', '4 hours'), action: t('incidentBridgeManagerNotify', 'Incident bridge and manager notify'), owner: t('incidentManager', 'Incident Manager'), route: '/incident-management-workflow' },
    { level: 'L4', trigger: t('8hours', '8 hours'), action: t('executiveEscalation', 'Executive escalation'), owner: t('itServiceManager', 'IT Service Manager'), route: '/manager-dashboard' },
  ];

  const cards = escalations.length ? escalations : fallback;

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Helmet><title>{t('escalations', 'Escalations')}</title></Helmet>
      <Header />
      <BreadcrumbTrail />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-elevation-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-primary font-semibold">{t('escalationPaths', 'Escalation Paths')}</p>
              <h1 className="text-3xl font-bold text-foreground mt-1">{t('escalations', 'Escalations')}</h1>
              <p className="text-muted-foreground">{t('escalationsDescription', 'See when tickets move up the chain and jump into the right operational page.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={() => navigate('/incident-management-workflow')} iconName="AlertTriangle">{t('incidents', 'Incidents')}</Button>
              <Button variant="outline" onClick={() => navigate('/ticket-management-center')} iconName="Ticket">{t('tickets', 'Tickets')}</Button>
              <Button variant="outline" onClick={() => navigate('/manager-dashboard')} iconName="LineChart">{t('manager', 'Manager')}</Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {cards.map((item, index) => (
            <div key={item.level || index} className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon name="ArrowUpRight" size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">{item.level || item.Level}</div>
                    <h2 className="text-lg font-semibold text-foreground mt-1">{item.trigger || item.Trigger}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{item.action || item.Action}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button size="sm" variant="outline" onClick={() => navigate(item.route || item.Route || '/ticket-management-center')}>{t('open', 'Open')}</Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate('/search')}>{t('search', 'Search')}</Button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="rounded-lg bg-muted px-3 py-2">
                  <span className="text-muted-foreground">{t('owner', 'Owner')}</span> <span className="font-medium text-foreground ml-2">{item.owner || item.Owner}</span>
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <span className="text-muted-foreground">{t('threshold', 'Threshold')}</span> <span className="font-medium text-foreground ml-2">{item.triggerMinutes || item.TriggerMinutes || item.trigger}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default EscalationsPage;
