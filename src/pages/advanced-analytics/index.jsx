import { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';
import Icon from '../../components/AppIcon';
import { dashboardAPI, ticketsAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const { isRtl } = useLanguage();
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-center justify-between mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{title}</p>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon name={icon} size={18} color={color} />
        </div>
      </div>
      <p className={`text-2xl font-bold text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{value}</p>
      {subtitle && <p className={`text-xs text-muted-foreground mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{subtitle}</p>}
    </div>
  );
};

const AdvancedAnalyticsHub = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, ticketsRes] = await Promise.all([
          dashboardAPI.getSummary(),
          ticketsAPI.getAll(),
        ]);
        setSummary(summaryRes?.data || {});
        setTickets(ticketsRes?.data || []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const byPriority = tickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const byCategory = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const resolutionRate = tickets.length ? ((resolved / tickets.length) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header />
      <BreadcrumbTrail />
      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-semibold text-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('advancedAnalytics', 'Advanced Analytics')}</h1>
          <p className={`text-sm text-muted-foreground mt-1 ${isRtl ? 'text-right' : 'text-left'}`}>{t('deepInsights', 'Deep insights into service performance and trends')}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Icon name="Loader" size={40} className="animate-spin opacity-30" color="var(--color-muted-foreground)" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title={t('totalTickets', 'Total Tickets')} value={summary?.totalTickets ?? tickets.length} subtitle={t('allTime', 'All time')} icon="Ticket" color="var(--color-primary)" />
              <StatCard title={t('openTickets', 'Open Tickets')} value={summary?.openTickets ?? tickets.filter(t => t.status === 'Open').length} subtitle={t('awaitingResolution', 'Awaiting resolution')} icon="AlertCircle" color="var(--color-warning)" />
              <StatCard title={t('resolutionRate', 'Resolution Rate')} value={`${resolutionRate}%`} subtitle={`${resolved} ${t('resolved', 'resolved')}`} icon="CheckCircle" color="var(--color-success)" />
              <StatCard title={t('avgResolution', 'Avg Resolution')} value={summary?.averageResolutionTime != null ? `${Number(summary.averageResolutionTime).toFixed(1)}h` : 'N/A'} subtitle={t('averageTime', 'Average time')} icon="Clock" color="var(--color-accent)" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <h3 className={`font-semibold text-foreground mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('ticketsByPriority', 'Tickets by Priority')}</h3>
                <div className="space-y-3">
                  {Object.entries(byPriority).length === 0 ? (
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('noDataAvailable', 'No data available')}</p>
                  ) : Object.entries(byPriority).map(([priority, count]) => {
                    const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                    const colors = { Urgent: 'bg-error', High: 'bg-warning', Medium: 'bg-primary', Low: 'bg-success' };
                    return (
                      <div key={priority}>
                        <div className={`flex justify-between text-sm mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-foreground">{priority}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[priority] || 'bg-primary'}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
                <h3 className={`font-semibold text-foreground mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('ticketsByCategory', 'Tickets by Category')}</h3>
                <div className="space-y-3">
                  {Object.entries(byCategory).length === 0 ? (
                    <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>{t('noDataAvailable', 'No data available')}</p>
                  ) : Object.entries(byCategory).map(([cat, count]) => {
                    const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div className={`flex justify-between text-sm mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                          <span className="text-foreground">{cat}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdvancedAnalyticsHub;
