import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineOperationsPanel = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState({
    serviceDeskConnected: false,
    opManagerConnected: false,
    status: 'unknown',
  });
  const [operations, setOperations] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connectionRes, unifiedRes] = await Promise.all([
        manageEngineAPI.testConnection().catch(() => ({ data: { status: 'failed', serviceDeskConnected: false, opManagerConnected: false } })),
        manageEngineAPI.getUnified({ type: '' }).catch(() => ({ data: { operations: [] } })),
      ]);

      setConnection({
        status: connectionRes?.data?.status || 'failed',
        serviceDeskConnected: Boolean(connectionRes?.data?.serviceDeskConnected),
        opManagerConnected: Boolean(connectionRes?.data?.opManagerConnected),
      });
      setOperations(normalizeManageEngineUnified(unifiedRes).operations.slice(0, 6));
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

  const serviceDeskCount = operations.filter((item) => item.source === 'ServiceDesk').length;
  const opManagerCount = operations.filter((item) => item.source === 'OpManager').length;
  const connectionLabel = (value) => (value ? t('connected', 'Connected') : t('offline', 'Offline'));
  const sourceLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'servicedesk') return t('serviceDesk', 'ServiceDesk');
    if (normalized === 'opmanager') return t('opManager', 'OpManager');
    return value || '';
  };
  const itemStatusLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'active') return t('active', 'Active');
    return value || t('active', 'Active');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow h-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Icon name="ServerCog" size={18} />
            <h3 className="text-lg font-semibold text-foreground">{t('manageEngineLiveOperations', 'ManageEngine Live Operations')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineLiveOperationsDesc', 'ServiceDesk requests and OpManager alerts in one live operational feed.')}
          </p>
        </div>
        <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('serviceDesk', 'ServiceDesk')}</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-foreground">{serviceDeskCount}</span>
            <span className={`text-xs font-medium ${connection.serviceDeskConnected ? 'text-success' : 'text-error'}`}>
              {connectionLabel(connection.serviceDeskConnected)}
            </span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('opManager', 'OpManager')}</div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-foreground">{opManagerCount}</span>
            <span className={`text-xs font-medium ${connection.opManagerConnected ? 'text-success' : 'text-error'}`}>
              {connectionLabel(connection.opManagerConnected)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('loadingManageEngineOperations', 'Loading ManageEngine operations...')}
          </div>
        ) : operations.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('noOperationalEvents', 'No external operational events are available right now.')}
          </div>
        ) : (
          operations.map((item) => (
            <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {sourceLabel(item.source)} {t('event', item.itemType)}
                  </div>
                  <div className="font-medium text-foreground mt-1">{item.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {itemStatusLabel(item.status)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {item.description || t('noAlertDescription', 'No description available.')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEngineOperationsPanel;
