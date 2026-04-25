import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, {
  ManageEngineZeroBadge,
  countHiddenZeroMetrics,
} from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEnginePerformanceInsights = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    services: 0,
    alerts: 0,
    criticalAlerts: 0,
    warningAlerts: 0,
    healthyServices: 0,
    degradedServices: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [unifiedRes, syncRes] = await Promise.all([
          manageEngineAPI.getOpManagerAnalytics().catch(() => ({ data: null })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);

        setSummary({
          services: Number(unifiedRes?.data?.servicesCount || 0),
          alerts: Number(unifiedRes?.data?.alertsCount || 0),
          criticalAlerts: Number(unifiedRes?.data?.criticalAlertsCount || 0),
          warningAlerts: Number(unifiedRes?.data?.warningAlertsCount || 0),
          healthyServices: Number(unifiedRes?.data?.healthyServicesCount || 0),
          degradedServices: Number(unifiedRes?.data?.degradedServicesCount || 0),
        });
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.services },
    { value: summary.alerts },
    { value: summary.criticalAlerts },
  ]);

  const readout = summary.alerts > 0
    ? t('opManager270ReadoutAlerts', 'OpManager 12.8.270 is currently showing active alerts that can be treated as the primary operational signal.')
    : summary.services > 0
      ? t('opManager270ReadoutServices', 'OpManager 12.8.270 services are available for review, but there are no active alerts right now.')
      : t('opManager270ReadoutEmpty', 'No OpManager 12.8.270 services or alerts are currently available.');

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Icon name="ServerCog" size={18} />
            <h4 className="text-lg font-semibold text-foreground">
              {t('manageEnginePerformanceInsights', 'ManageEngine Performance Insights')}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEnginePerformanceDescription', 'Read only OpManager 12.8.270 services and alerts without inferring unsupported analytics.')}
          </p>
        </div>
        {loading ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {t('loading', 'Loading')}
          </span>
        ) : zeroHiddenCount > 0 ? (
          <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} />
        ) : (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {summary.services + summary.alerts} {t('supportedSignals', 'supported signals')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingManageEngineInsights', 'Loading ManageEngine insights...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <ManageEngineMetricCard
            label={t('opManagerServices', 'OpManager services')}
            value={summary.services}
            icon={<Icon name="Server" size={16} className="text-primary" />}
            helper={t('opManagerServicesTracked', 'Services exposed by the OpManager 12.8.270 feed.')}
          />
          <ManageEngineMetricCard
            label={t('opManagerAlerts', 'OpManager alerts')}
            value={summary.alerts}
            icon={<Icon name="Radar" size={16} className="text-primary" />}
            helper={t('opManagerAlertsTracked', 'Active alerts visible from the OpManager 12.8.270 feed.')}
          />
          <ManageEngineMetricCard
            label={t('criticalAlerts', 'Critical alerts')}
            value={summary.criticalAlerts}
            icon={<Icon name="AlertTriangle" size={16} className="text-primary" />}
            helper={t('criticalAlertsTracked', 'Alerts with urgent or critical severity.')}
          />
          <ManageEngineMetricCard
            label={t('healthyServices', 'Healthy services')}
            value={summary.healthyServices}
            icon={<Icon name="ShieldCheck" size={16} className="text-primary" />}
            helper={t('healthyServicesTracked', 'Services currently reporting healthy or monitored status.')}
          />
          <ManageEngineMetricCard
            label={t('degradedServices', 'Degraded services')}
            value={summary.degradedServices}
            icon={<Icon name="Activity" size={16} className="text-primary" />}
            helper={t('degradedServicesTracked', 'Services not currently reporting a healthy state.')}
          />
          <ManageEngineMetricCard
            label={t('syncHealth', 'Sync health')}
            value={syncStatus?.status || t('idle', 'idle')}
            icon={<Icon name="ShieldCheck" size={16} className="text-primary" />}
            helper={syncStatus?.message || t('noSyncDetails', 'No additional sync detail is currently available.')}
            hideWhenZero={false}
          />
        </div>
      )}

      {!loading && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('manageEngineReadout', 'Current readout')}</span>
          </div>
          <p className="text-sm text-muted-foreground">{readout}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t('opManagerAnalyticsDetail', 'The OpManager feed now includes health, severity, and drift counts derived from 12.8.270 services and alerts.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageEnginePerformanceInsights;
