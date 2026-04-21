import { useCallback, useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineList } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineProblemSignals = () => {
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertRes, requestRes] = await Promise.all([
        manageEngineAPI.getOperations({ source: 'OpManager', type: 'alert' }).catch(() => ({ data: { items: [] } })),
        manageEngineAPI.getOperations({ source: 'ServiceDesk', type: 'request' }).catch(() => ({ data: { items: [] } })),
      ]);

      setAlerts(normalizeManageEngineList(alertRes).slice(0, 4));
      setRequests(normalizeManageEngineList(requestRes).slice(0, 4));
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
            <h2 className="text-lg font-semibold text-foreground">{t('manageEngineProblemSignals', 'ManageEngine Problem Signals')}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineProblemSignalsDesc', 'External alert and request signals that can help confirm recurring patterns before creating root-cause work.')}
          </p>
        </div>
        <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
          {t('loadingExternalSignals', 'Loading external signals...')}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <h3 className="font-medium text-foreground">{t('opManagerAlerts', 'OpManager Alerts')}</h3>
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noActiveAlerts', 'No active external alerts are available.')}</p>
              ) : (
                alerts.map((alert) => (
                  <div key={`${alert.source}-${alert.externalId}`} className="rounded-lg bg-muted/30 p-3">
                    <div className="font-medium text-foreground">{alert.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{alert.status || t('active', 'Active')}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="ClipboardList" size={16} className="text-primary" />
              <h3 className="font-medium text-foreground">{t('serviceDeskRequests', 'ServiceDesk Requests')}</h3>
            </div>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noLinkedRequests', 'No linked external requests are available.')}</p>
              ) : (
                requests.map((request) => (
                  <div key={`${request.source}-${request.externalId}`} className="rounded-lg bg-muted/30 p-3">
                    <div className="font-medium text-foreground">{request.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{request.status || 'Open'}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageEngineProblemSignals;
