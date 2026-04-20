import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { manageEngineAPI } from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineApprovalInsights = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [operationsRes, syncRes] = await Promise.all([
        manageEngineAPI.getOperations({ source: 'ServiceDesk', type: 'request' }).catch(() => ({ data: { items: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      const items = operationsRes?.data?.items || operationsRes?.data?.operations || [];
      setRequests(Array.isArray(items) ? items.slice(0, 4) : []);
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between gap-3 mb-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div>
          <div className={`flex items-center gap-2 text-primary mb-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <Icon name="ServerCog" size={18} />
            <h3 className="font-semibold text-foreground">
              {t('manageEngineApprovalInsights', 'ManageEngine Approval Insights')}
            </h3>
          </div>
          <p className={`text-sm text-muted-foreground ${isRtl ? 'text-right' : 'text-left'}`}>
            {t('manageEngineApprovalInsightsDesc', 'Live ServiceDesk requests that may need follow-up while local approvals are in progress.')}
          </p>
        </div>
        <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
          {t('refresh', 'Refresh')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('externalRequests', 'External requests')}</div>
          <div className="text-2xl font-semibold text-foreground">{requests.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('createdLocalTickets', 'Created local tickets')}</div>
          <div className="text-2xl font-semibold text-foreground">{syncStatus?.createdCount || 0}</div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">{t('syncHealth', 'Sync health')}</div>
          <div className="text-sm font-semibold text-foreground capitalize">{syncStatus?.status || 'idle'}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {syncStatus?.message || t('manageEngineApprovalIdle', 'Waiting for the next ManageEngine sync.')}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('loadingManageEngineRequests', 'Loading ManageEngine requests...')}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('noManageEngineRequests', 'No external requests are available right now.')}
          </div>
        ) : (
          requests.map((request) => (
            <div key={`${request.source}-${request.externalId}`} className="rounded-lg border border-border p-4">
              <div className={`flex items-start justify-between gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {request.source} {request.itemType}
                  </div>
                  <div className="font-medium text-foreground mt-1">{request.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {request.status || t('open', 'Open')}
                </span>
              </div>
              <p className={`text-sm text-muted-foreground mt-2 line-clamp-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                {request.description || t('noDescriptionAvailable', 'No description available.')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEngineApprovalInsights;
