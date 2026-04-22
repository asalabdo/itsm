import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineList } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineRequestIntake = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: requests.length },
    { value: syncStatus?.createdCount || 0 },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operationsRes, syncRes] = await Promise.all([
        manageEngineAPI.getOperations({ source: 'ServiceDesk', type: 'request' }).catch(() => ({ data: { items: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      setRequests(normalizeManageEngineList(operationsRes).slice(0, 5));
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();

    const handleRefresh = () => {
      void loadData();
    };

    window.addEventListener('itsm:refresh', handleRefresh);
    return () => window.removeEventListener('itsm:refresh', handleRefresh);
  }, []);

  const syncStateLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'synced') return t('synced', 'Synced');
    if (normalized === 'failed') return t('failed', 'Failed');
    return value || t('idle', 'idle');
  };

  const sourceLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'servicedesk') return t('serviceDesk', 'ServiceDesk');
    if (normalized === 'opmanager') return t('opManager', 'OpManager');
    return value || '';
  };

  const requestStatusLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'open') return t('openRequest', 'Open');
    return value || t('openRequest', 'Open');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Icon name="ServerCog" size={18} />
            <h3 className="text-lg font-semibold text-foreground">{t('manageEngineServiceDeskIntake', 'ManageEngine ServiceDesk Intake')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineServiceDeskIntakeDesc', 'Live external service requests flowing from ServiceDesk into the fulfillment workspace.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : null}
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <ManageEngineMetricCard
          label={t('serviceDeskRequests', 'External requests')}
          value={requests.length}
          icon={<Icon name="ClipboardList" size={16} className="text-primary" />}
        />
        <ManageEngineMetricCard
          label={t('importedLocally', 'Imported locally')}
          value={syncStatus?.createdCount || 0}
          icon={<Icon name="ArrowUpDown" size={16} className="text-primary" />}
        />
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('syncState', 'Sync state')}</div>
          <div className="text-sm font-semibold text-foreground capitalize">{syncStateLabel(syncStatus?.status)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {syncStatus?.message || t('waitingForManageEngineSync', 'Waiting for the next ManageEngine sync.')}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('loadingServiceDeskIntake', 'Loading ServiceDesk intake...')}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('noServiceDeskRequests', 'No external ServiceDesk requests are available right now.')}
          </div>
        ) : (
          requests.map((request) => (
            <div key={`${request.source}-${request.externalId}`} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {sourceLabel(request.source)} {t('request', request.itemType)}
                  </div>
                  <div className="font-medium text-foreground mt-1">{request.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {requestStatusLabel(request.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {request.description || t('noRequestDescription', 'No request description provided.')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEngineRequestIntake;
