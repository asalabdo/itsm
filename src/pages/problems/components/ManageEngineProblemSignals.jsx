import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { manageEngineAPI } from '../../../services/api';
import { getOpManager270LatestAlerts, normalizeManageEngineList } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineProblemSignals = () => {
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const topAlert = alerts[0] || null;
  const topRequest = requests[0] || null;

  const signalSummary = useMemo(
    () => [
      {
        label: t('opManagerAlerts', 'OpManager Alerts'),
        count: alerts.length,
        detail: topAlert?.name || t('noActiveAlerts', 'No active external alerts are available.'),
        tone: 'warning',
      },
      {
        label: t('serviceDeskRequests', 'ServiceDesk Requests'),
        count: requests.length,
        detail: topRequest?.name || t('noLinkedRequests', 'No linked external requests are available.'),
        tone: 'primary',
      },
      {
        label: t('totalSignals', 'Combined Signals'),
        count: alerts.length + requests.length,
        detail: t('signalSummaryHint', 'Use the counts and top items below to confirm recurring patterns before opening a problem record.'),
        tone: 'muted',
      },
    ],
    [alerts.length, requests.length, t, topAlert, topRequest]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [unifiedRes, requestRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [] } })),
        manageEngineAPI.getOperations({ source: 'ServiceDesk', type: 'request' }).catch(() => ({ data: { items: [] } })),
      ]);

      setAlerts(getOpManager270LatestAlerts(unifiedRes, 4));
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
            {t('manageEngineProblemSignalsDesc', 'ServiceDesk requests plus OpManager 12.8.270 alerts that can help confirm recurring patterns before creating root-cause work.')}
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {signalSummary.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold text-foreground mt-1">{item.count}</p>
                  </div>
                  <Icon
                    name={item.tone === 'warning' ? 'AlertTriangle' : item.tone === 'primary' ? 'ClipboardList' : 'Activity'}
                    size={18}
                    className={item.tone === 'warning' ? 'text-warning' : item.tone === 'primary' ? 'text-primary' : 'text-muted-foreground'}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
              <h3 className="font-medium text-foreground">{t('opManagerAlerts', 'OpManager Alerts')}</h3>
            </div>
            <div className="space-y-3">
              {topAlert && (
                <div className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-warning">{t('topSignal', 'Top Signal')}</p>
                      <div className="font-medium text-foreground">{topAlert.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{topAlert.status || t('active', 'Active')}</div>
                    </div>
                    <Icon name="ArrowUpRight" size={16} className="text-warning" />
                  </div>
                </div>
              )}
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noActiveAlerts', 'No active external alerts are available.')}</p>
              ) : (
                alerts.map((alert) => (
                  <div key={`${alert.source}-${alert.externalId}`} className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{alert.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{alert.status || t('active', 'Active')}</div>
                      </div>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {alert.source || 'OpManager'}
                      </span>
                    </div>
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
              {topRequest && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-primary">{t('topSignal', 'Top Signal')}</p>
                      <div className="font-medium text-foreground">{topRequest.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{topRequest.status || 'Open'}</div>
                    </div>
                    <Icon name="ArrowUpRight" size={16} className="text-primary" />
                  </div>
                </div>
              )}
              {requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('noLinkedRequests', 'No linked external requests are available.')}</p>
              ) : (
                requests.map((request) => (
                  <div key={`${request.source}-${request.externalId}`} className="rounded-lg bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">{request.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{request.status || 'Open'}</div>
                      </div>
                      <span className="rounded-full bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {request.source || 'ServiceDesk'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageEngineProblemSignals;
