import { useCallback, useEffect, useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import { manageEngineAPI } from '../../services/api';
import { normalizeManageEngineUnified, summarizeManageEngineUnified, summarizeOpManager270 } from '../../services/manageEngineDataUtils';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from './ManageEngineMetricCard';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const ManageEngineOnPremSnapshot = ({ title, description, compact = false }) => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    catalog: 0,
    operations: 0,
    serviceDeskRequests: 0,
    opManagerServices: 0,
    opManagerAlerts: 0,
  });
  const [latestItems, setLatestItems] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.serviceDeskRequests },
    { value: summary.opManagerServices },
    { value: summary.opManagerAlerts },
  ]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [unifiedRes, syncRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [], summary: {} } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);
      const unified = normalizeManageEngineUnified(unifiedRes);
      const unifiedSummary = summarizeManageEngineUnified(unifiedRes);
      const opManagerSummary = summarizeOpManager270(unifiedRes);
      setSummary({
        ...unifiedSummary,
        opManagerServices: opManagerSummary.services,
      });
      setLatestItems(unified.operations.slice(0, compact ? 2 : 4));
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  }, [compact]);

  useEffect(() => {
    void loadData();

    const handleRefresh = () => {
      void loadData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, [loadData]);

  return (
    <section className="hidden rounded-2xl border border-border bg-card p-5 shadow-elevation-1" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between gap-3 ${compact ? 'mb-3' : 'mb-5'}`}>
        <div>
          <div className={`flex items-center gap-2 text-primary`}>
            <Icon name="ServerCog" size={18} />
            <h2 className="text-lg font-semibold text-foreground">
              {title || t('manageEngineOnPremSnapshot', 'ManageEngine On-Prem Snapshot')}
            </h2>
          </div>
          <p className={`mt-1 text-sm text-muted-foreground`}>
            {description || t('manageEngineOnPremSnapshotDesc', 'Live ServiceDesk Plus API v3 and OpManager 12.8.270 context for this workspace.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={isArabic ? `${zeroHiddenCount} مخفية` : `${zeroHiddenCount} hidden`} /> : null}
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {loading ? (
          <div className="rounded-xl border border-border border-dashed p-5 text-center text-sm text-muted-foreground">
          {t('loadingManageEngine', 'Loading ManageEngine data...')}
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
            <ManageEngineMetricCard label={t('serviceDeskRequests', 'ServiceDesk Requests')} value={summary.serviceDeskRequests} icon={<Icon name="ClipboardList" size={16} className="text-primary" />} />
            <ManageEngineMetricCard label={t('opManagerServices', 'OpManager Services')} value={summary.opManagerServices} icon={<Icon name="Server" size={16} className="text-primary" />} />
            <ManageEngineMetricCard label={t('opManagerAlerts', 'OpManager Alerts')} value={summary.opManagerAlerts} icon={<Icon name="Radar" size={16} className="text-primary" />} />
            {!compact && (
              <ManageEngineMetricCard
                label={t('syncHealth', 'Sync Health')}
                value={syncStatus?.status || 'idle'}
                icon={<Icon name="ShieldCheck" size={16} className="text-primary" />}
                hideWhenZero={false}
              />
            )}
          </div>

          {!compact && (
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className={`mb-3 flex items-center justify-between gap-3`}>
                <span className="text-sm font-medium text-foreground">{t('latestExternalOperations', 'Latest External Operations')}</span>
                <span className="text-xs text-muted-foreground">{syncStatus?.message || t('waitingForSync', 'Waiting for sync status.')}</span>
              </div>
              <div className="space-y-2">
                {latestItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('noExternalOperations', 'No external operations are available right now.')}</p>
                ) : (
                  latestItems.map((item) => (
                    <div key={`${item.source}-${item.externalId}`} className={`flex items-start justify-between gap-3 rounded-lg bg-background px-3 py-2`}>
                      <div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.source} {item.itemType}</div>
                        <div className="text-sm font-medium text-foreground">{item.name || item.externalId}</div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.status || t('active', 'Active')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ManageEngineOnPremSnapshot;
