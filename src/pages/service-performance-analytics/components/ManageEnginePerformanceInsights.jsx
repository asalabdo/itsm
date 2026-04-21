import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEnginePerformanceInsights = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    operations: 0,
    serviceDeskRequests: 0,
    opManagerAlerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [unifiedRes, syncRes] = await Promise.all([
          manageEngineAPI.getUnified().catch(() => ({ data: { summary: {} } })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);

        setSummary(summarizeManageEngineUnified(unifiedRes));
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const importedTotal = (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0);
  const dominantSource = summary.opManagerAlerts > summary.serviceDeskRequests
    ? t('opManagerAlerts', 'OpManager alerts')
    : t('serviceDeskRequests', 'ServiceDesk requests');

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between gap-3 mb-5`}>
        <div>
          <div className={`flex items-center gap-2 text-primary mb-2`}>
            <Icon name="ServerCog" size={18} />
            <h4 className="text-lg font-semibold text-foreground">
              {t('manageEnginePerformanceInsights', 'ManageEngine Performance Insights')}
            </h4>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {t('manageEnginePerformanceDescription', 'Cross-check external demand and monitoring pressure beside internal service performance.')}
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {loading ? t('loading', 'Loading') : `${summary.operations} ${t('externalItems', 'external items')}`}
        </span>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingManageEngineInsights', 'Loading ManageEngine insights...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground mb-2">{t('externalDemandMix', 'External demand mix')}</div>
            <div className="text-2xl font-semibold text-foreground">{summary.serviceDeskRequests}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('serviceDeskRequestsActive', 'Active ServiceDesk requests in the operational feed.')}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground mb-2">{t('monitoringPressure', 'Monitoring pressure')}</div>
            <div className="text-2xl font-semibold text-foreground">{summary.opManagerAlerts}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('opManagerAlertsTracked', 'OpManager alerts currently contributing to service pressure.')}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <div className="text-xs text-muted-foreground mb-2">{t('ticketSyncCoverage', 'Ticket sync coverage')}</div>
            <div className="text-2xl font-semibold text-foreground">{importedTotal}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {syncStatus?.message || t('manageEngineSyncHealthy', 'Imported ManageEngine work currently mapped into local tickets.')}
            </p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className={`flex items-center gap-2 mb-2`}>
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{t('manageEngineReadout', 'Current readout')}</span>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {t('manageEngineReadoutText', 'The strongest external signal right now is')} <span className="font-medium text-foreground">{dominantSource}</span>.{' '}
            {summary.operations > 0
              ? t('manageEngineReadoutAction', 'Use it to validate whether current service trends are internal-only or driven by external platforms.')
              : t('manageEngineReadoutIdle', 'No external pressure is currently visible from ManageEngine.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageEnginePerformanceInsights;
