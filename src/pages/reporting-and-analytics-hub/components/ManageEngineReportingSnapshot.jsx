import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, {
  ManageEngineZeroBadge,
  countHiddenZeroMetrics,
} from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified, summarizeOpManager270 } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineReportingSnapshot = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    serviceDeskRequests: 0,
    opManagerServices: 0,
    opManagerAlerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.serviceDeskRequests },
    { value: summary.opManagerServices },
    { value: summary.opManagerAlerts },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [unifiedRes, syncRes] = await Promise.all([
          manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [], summary: {} } })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);

        const unifiedSummary = summarizeManageEngineUnified(unifiedRes);
        const opManagerSummary = summarizeOpManager270(unifiedRes);
        setSummary({
          serviceDeskRequests: unifiedSummary.serviceDeskRequests,
          opManagerServices: opManagerSummary.services,
          opManagerAlerts: opManagerSummary.alerts,
        });
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const syncStatusLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'idle') return t('idle', 'idle');
    if (normalized === 'synced') return t('synced', 'Synced');
    if (normalized === 'failed') return t('failed', 'Failed');
    return value || t('idle', 'idle');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Icon name="ServerCog" size={18} />
            <h3 className="font-semibold text-foreground">{t('manageEngineReportingSnapshot', 'ManageEngine Reporting Snapshot')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineReportingSnapshotDesc', 'Reporting-ready counts using ServiceDesk requests plus OpManager 12.8.270 services and alerts.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : null}
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {syncStatusLabel(syncStatus?.status)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingManageEngineReportingMetrics', 'Loading ManageEngine reporting metrics...')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            <ManageEngineMetricCard
              label={t('serviceDeskRequests', 'ServiceDesk requests')}
              value={summary.serviceDeskRequests}
              icon={<Icon name="ClipboardList" size={18} className="text-primary" />}
              helper={t('serviceDeskRequestsReadyForReports', 'External request load ready for stakeholder reporting.')}
            />
            <ManageEngineMetricCard
              label={t('opManagerServices', 'OpManager services')}
              value={summary.opManagerServices}
              icon={<Icon name="Server" size={18} className="text-primary" />}
              helper={t('opManagerServicesReadyForReports', 'Supported services from the OpManager 12.8.270 feed.')}
            />
            <ManageEngineMetricCard
              label={t('opManagerAlerts', 'OpManager alerts')}
              value={summary.opManagerAlerts}
              icon={<Icon name="Radar" size={18} className="text-primary" />}
              helper={t('opManagerAlertsReadyForReports', 'Active alert volume from OpManager 12.8.270.')}
            />
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground mb-1">{t('lastSync', 'Last sync')}</div>
              <div className="text-sm font-semibold text-foreground">
                {syncStatus?.lastSyncAt ? new Date(syncStatus.lastSyncAt).toLocaleString() : t('notRunYet', 'Not run yet')}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {syncStatus?.message || t('readyForDownstreamReporting', 'Ready for downstream reporting and export.')}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="LineChart" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('reportingHint', 'Reporting hint')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(
                'reportingHintDescription',
                'Use this snapshot to explain ServiceDesk request demand alongside only the services and alerts that OpManager 12.8.270 actually exposes.'
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageEngineReportingSnapshot;
