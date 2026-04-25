import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { getOpManager270LatestAlerts, isOpManager270Service, normalizeManageEngineUnified, normalizeManageEngineList } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineChangeImpactPanel = ({ changes = [] }) => {
  const { language, isRtl } = useLanguage();
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [changeItems, setChangeItems] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unifiedRes, changesRes, syncRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [] } })),
        manageEngineAPI.getChanges({ status: 'Open' }).catch(() => ({ data: { items: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      const unified = normalizeManageEngineUnified(unifiedRes);
      setCatalogItems(unified.catalog.filter(isOpManager270Service).slice(0, 5));
      setAlerts(getOpManager270LatestAlerts(unifiedRes, 5));
      setChangeItems(normalizeManageEngineList(changesRes).slice(0, 5));
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const activeChangeCount = useMemo(
    () => changes.filter((change) => !['completed', 'closed', 'cancelled'].includes(String(change?.status || '').toLowerCase())).length,
    [changes]
  );
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: changeItems.length },
    { value: catalogItems.length },
    { value: alerts.length },
  ]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between gap-3 mb-5`}>
        <div>
          <div className={`flex items-center gap-2 text-primary mb-1`}>
            <Icon name="ServerCog" size={18} />
            <h3 className="text-lg font-semibold text-foreground">
              {t('manageEngineChangeImpact', 'ManageEngine Change Impact')}
            </h3>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {t('manageEngineChangeImpactDesc', 'Use live ServiceDesk changes plus OpManager 12.8.270 services and alerts to understand current risk around planned and active changes.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} ${isArabic ? 'مخفية' : 'hidden'}`} /> : null}
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <ManageEngineMetricCard
          label={t('activeChanges', 'Active changes')}
          value={activeChangeCount}
          icon={<Icon name="CalendarClock" size={16} className="text-primary" />}
          hideWhenZero={false}
        />
        <ManageEngineMetricCard
          label={t('liveChanges', 'Live changes')}
          value={changeItems.length}
          icon={<Icon name="GitPullRequest" size={16} className="text-primary" />}
        />
        <ManageEngineMetricCard
          label={t('monitoredServices', 'Monitored services')}
          value={catalogItems.length}
          icon={<Icon name="Layers3" size={16} className="text-primary" />}
        />
        <ManageEngineMetricCard
          label={t('liveAlerts', 'Live alerts')}
          value={alerts.length}
          icon={<Icon name="AlertTriangle" size={16} className="text-warning" />}
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('syncHealth', 'Sync health')}</div>
          <div className="text-sm font-semibold text-foreground capitalize">{syncStatus?.status || 'idle'}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {syncStatus?.message || t('manageEngineChangeIdle', 'External status is ready for change review.')}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingChangeImpact', 'Loading ManageEngine change impact...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-4">
            <div className={`flex items-center gap-2 mb-3`}>
              <Icon name="GitPullRequest" size={16} className="text-primary" />
              <h4 className="font-medium text-foreground">{t('changesInScope', 'Changes in scope')}</h4>
            </div>
            <div className="space-y-3">
              {changeItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noLiveChanges', 'No live ServiceDesk changes are available right now.')}</p>
              ) : (
                changeItems.map((item) => (
                  <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.status || t('planned', 'Planned')}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className={`flex items-center gap-2 mb-3`}>
              <Icon name="Layers3" size={16} className="text-primary" />
              <h4 className="font-medium text-foreground">{t('servicesInScope', 'Services in scope')}</h4>
            </div>
            <div className="space-y-3">
              {catalogItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noMonitoredServices', 'No monitored services are available right now.')}</p>
              ) : (
                catalogItems.map((item) => (
                  <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.status || t('active', 'Active')}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className={`flex items-center gap-2 mb-3`}>
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <h4 className="font-medium text-foreground">{t('alertsAroundChanges', 'Alerts around changes')}</h4>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noOpManagerAlerts', 'No active OpManager 12.8.270 alerts are visible right now.')}</p>
              ) : (
                alerts.map((alert) => (
                  <div key={`${alert.source}-${alert.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className={`flex items-start justify-between gap-3`}>
                      <div>
                        <div className="font-medium text-foreground">{alert.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{alert.description || t('noDescriptionAvailable', 'No description available.')}</div>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                        {alert.status || t('active', 'Active')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEngineChangeImpactPanel;
