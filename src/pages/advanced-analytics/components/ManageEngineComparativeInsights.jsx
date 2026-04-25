import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, {
  ManageEngineZeroBadge,
  countHiddenZeroMetrics,
} from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineComparativeInsights = ({ internalTickets = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    services: 0,
    alerts: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
  });
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await manageEngineAPI.getOpManagerAnalytics().catch(() => ({ data: null }));
        if (!isMountedRef.current) {
          return;
        }
        setSummary({
          services: Number(response?.data?.servicesCount || 0),
          alerts: Number(response?.data?.alertsCount || 0),
          criticalAlerts: Number(response?.data?.criticalAlertsCount || 0),
          warningAlerts: Number(response?.data?.warningAlertsCount || 0),
        });
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const openInternal = useMemo(
    () => internalTickets.filter((ticket) => !['resolved', 'closed'].includes(String(ticket?.status || '').toLowerCase())).length,
    [internalTickets]
  );

  const pressureDelta = summary.alerts - openInternal;
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.services },
    { value: summary.alerts },
    { value: summary.criticalAlerts },
  ]);
  const comparisonLabel = pressureDelta > 0
    ? t('externalPressureHigher', 'OpManager alert pressure is higher than the current open internal backlog.')
    : pressureDelta < 0
      ? t('internalBacklogHigher', 'The internal backlog is still heavier than the current OpManager alert feed.')
      : t('externalPressureBalanced', 'OpManager alert pressure and the internal backlog are currently balanced.');

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Icon name="GitCompareArrows" size={18} />
            <h3 className="font-semibold text-foreground">{t('manageEngineComparativeInsights', 'ManageEngine Comparative Insights')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineComparativeInsightsDesc', 'Compare internal backlog against OpManager 12.8.270 services and live alert pressure.')}
          </p>
        </div>
        {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {t('liveComparison', 'Live comparison')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingManageEngineComparison', 'Loading ManageEngine comparison...')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <ManageEngineMetricCard
              label={t('openInternalTickets', 'Open internal tickets')}
              value={openInternal}
              icon={<Icon name="Ticket" size={16} className="text-primary" />}
              hideWhenZero={false}
            />
            <ManageEngineMetricCard
              label={t('opManagerServices', 'OpManager services')}
              value={summary.services}
              icon={<Icon name="Server" size={16} className="text-primary" />}
            />
            <ManageEngineMetricCard
              label={t('opManagerAlerts', 'OpManager alerts')}
              value={summary.alerts}
              icon={<Icon name="Radar" size={16} className="text-primary" />}
            />
            <ManageEngineMetricCard
              label={t('criticalAlerts', 'Critical alerts')}
              value={summary.criticalAlerts}
              icon={<Icon name="AlertTriangle" size={16} className="text-primary" />}
            />
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Sparkles" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('analystTake', 'Analyst take')}</span>
            </div>
            <p className="text-sm text-muted-foreground">{comparisonLabel}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('trackedOpManagerServices', 'Tracked OpManager services')}: {summary.services}. {t('warningAlerts', 'Warning alerts')}: {summary.warningAlerts}. {t('deltaVsOpenInternalBacklog', 'Delta vs open internal backlog')}: {pressureDelta > 0 ? '+' : ''}{pressureDelta}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageEngineComparativeInsights;
