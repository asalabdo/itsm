import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineReportingSnapshot = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    catalog: 0,
    operations: 0,
    serviceDeskCatalog: 0,
    opManagerCatalog: 0,
    serviceDeskRequests: 0,
    opManagerAlerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.catalog },
    { value: summary.operations },
    { value: (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0) },
  ]);

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
            {t('manageEngineReportingSnapshotDesc', 'External service demand and monitoring data ready for reporting.')}
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
              label={t('externalCatalog', 'External catalog')}
              value={summary.catalog}
              icon={<Icon name="Layers3" size={18} className="text-primary" />}
              helper={`${summary.serviceDeskCatalog} ServiceDesk + ${summary.opManagerCatalog} OpManager`}
            />
            <ManageEngineMetricCard
              label={t('operationalFeed', 'Operational feed')}
              value={summary.operations}
              icon={<Icon name="Activity" size={18} className="text-primary" />}
              helper={`${summary.serviceDeskRequests} requests + ${summary.opManagerAlerts} alerts`}
            />
            <ManageEngineMetricCard
              label={t('importedTickets', 'Imported tickets')}
              value={(syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0)}
              icon={<Icon name="ArrowUpDown" size={18} className="text-primary" />}
              helper={`${syncStatus?.createdCount || 0} created / ${syncStatus?.updatedCount || 0} updated`}
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
                'Use this snapshot to explain how much of the current operational load is coming from external service requests versus monitoring events before exporting reports to stakeholders.'
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageEngineReportingSnapshot;
