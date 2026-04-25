import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { getOpManager270LatestAlerts, summarizeOpManager270 } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineMonitoringFeed = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ alerts: 0, services: 0 });
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([{ value: alerts.length }]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unifiedRes, syncRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      setAlerts(getOpManager270LatestAlerts(unifiedRes, 5));
      setSummary(summarizeOpManager270(unifiedRes));
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Icon name="ServerCog" size={18} />
            <h2 className="text-lg font-semibold text-foreground">{t('manageEngineMonitoringFeed', 'ManageEngine Monitoring Feed')}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineMonitoringFeedDesc', 'Live OpManager 12.8.270 alerts to compare against the event you are about to create.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : null}
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ManageEngineMetricCard
          label={t('liveAlerts', 'Live alerts')}
          value={summary.alerts}
          icon={<Icon name="Radar" size={16} className="text-primary" />}
        />
        <div className="rounded-xl bg-muted/40 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('syncHealth', 'Sync health')}</div>
          <div className="text-sm font-semibold text-foreground capitalize">{syncStatus?.status || t('idle', 'idle')}</div>
        </div>
      </div>

      {!loading && (
        <div className="mb-4 rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {t('trackedOpManagerServices', 'Tracked OpManager services')}: <span className="font-medium text-foreground">{summary.services}</span>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
            {t('loadingOpManagerAlerts', 'Loading OpManager alerts...')}
          </div>
        ) : alerts.length === 0 ? (
          <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
            {t('noOpManagerAlerts', 'No OpManager alerts are available right now.')}
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={`${alert.source}-${alert.externalId}`} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {alert.source} {alert.itemType}
                  </div>
                  <div className="font-medium text-foreground mt-1">{alert.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {alert.status || t('active', 'Active')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {alert.description || t('noAlertDescription', 'No alert description available.')}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ManageEngineMonitoringFeed;
