import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineList } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineApprovalInsights = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: approvals.length },
    { value: syncStatus?.createdCount || 0 },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [approvalsRes, syncRes] = await Promise.all([
        manageEngineAPI.getApprovals({ status: 'Pending' }).catch(() => ({ data: { items: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      setApprovals(normalizeManageEngineList(approvalsRes).slice(0, 4));
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
      <div className={`flex items-start justify-between gap-3 mb-4`}>
        <div>
          <div className={`flex items-center gap-2 text-primary mb-1`}>
            <Icon name="ServerCog" size={18} />
            <h3 className="font-semibold text-foreground">
              {t('manageEngineApprovalInsights', 'ManageEngine Approval Insights')}
            </h3>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {t('manageEngineApprovalInsightsDesc', 'Live ServiceDesk approvals that may need follow-up while local approvals are in progress.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : null}
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <ManageEngineMetricCard
          label={t('externalApprovals', 'External approvals')}
          value={approvals.length}
          icon={<Icon name="ClipboardList" size={16} className="text-primary" />}
        />
        <ManageEngineMetricCard
          label={t('createdLocalTickets', 'Created local tickets')}
          value={syncStatus?.createdCount || 0}
          icon={<Icon name="ArrowUpDown" size={16} className="text-primary" />}
        />
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
            {t('loadingManageEngineApprovals', 'Loading ManageEngine approvals...')}
          </div>
        ) : approvals.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            {t('noManageEngineApprovals', 'No external approvals are available right now.')}
          </div>
        ) : (
          approvals.map((approval) => (
            <div key={`${approval.source}-${approval.externalId}`} className="rounded-lg border border-border p-4">
              <div className={`flex items-start justify-between gap-3`}>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {approval.source} {approval.itemType}
                  </div>
                  <div className="font-medium text-foreground mt-1">{approval.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {approval.status || t('open', 'Open')}
                </span>
              </div>
              <p className={`text-sm text-muted-foreground mt-2 line-clamp-2`}>
                {approval.description || t('noDescriptionAvailable', 'No description available.')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEngineApprovalInsights;
