import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { manageEngineAPI } from '../../../services/api';
import { findExactManageEngineTicketMatch, normalizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import ExternalSystemBadge from '../../../components/ui/ExternalSystemBadge';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineTicketContext = ({ ticket }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [loading, setLoading] = useState(true);
  const [matchedItem, setMatchedItem] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const ticketExternalId = ticket?.externalId;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [unifiedRes, syncRes] = await Promise.all([
          manageEngineAPI.getUnified().catch(() => ({ data: { operations: [], catalog: [] } })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);

        const { operations, catalog } = normalizeManageEngineUnified(unifiedRes);
        const searchable = [...operations, ...catalog];
        const matched = findExactManageEngineTicketMatch({ externalId: ticketExternalId }, searchable);

        setMatchedItem(matched);
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [ticketExternalId]);

  const syncHealthLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'idle') return t('idle', 'idle');
    if (normalized === 'synced') return t('synced', 'Synced');
    if (normalized === 'failed') return t('failed', 'Failed');
    return value || t('idle', 'idle');
  };

  const monitoredLabel = matchedItem ? t('yes', 'Yes') : t('no', 'No');
  const sourceLabel = (value) => {
    const normalized = String(value || '').toLowerCase();
    if (normalized === 'servicedesk') return t('serviceDesk', 'ServiceDesk');
    if (normalized === 'opmanager') return t('opManager', 'OpManager');
    return value || '';
  };

  return (
    <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ServerCog" size={18} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">{t('manageEngineContext', 'ManageEngine Context')}</h2>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
          {t('loadingExternalTicketContext', 'Loading external ticket context...')}
        </div>
      ) : matchedItem ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {sourceLabel(matchedItem.source)} {matchedItem.itemType}
              </div>
              <div className="font-medium text-foreground mt-1">{matchedItem.name}</div>
            </div>
            <ExternalSystemBadge system={`ManageEngine-${matchedItem.source}`} />
          </div>
          <p className="text-sm text-muted-foreground">{matchedItem.description || t('noAlertDescription', 'No external description available.')}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">{t('status', 'Status')}</p>
              <p className="text-sm font-medium text-foreground">{matchedItem.status || t('active', 'Active')}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">{t('syncHealth', 'Sync health')}</p>
              <p className="text-sm font-medium text-foreground capitalize">{syncHealthLabel(syncStatus?.status)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">{t('manageEngineDataAvailable', 'ManageEngine data is available for this ticket.')}</p>
            <p>{t('monitored', 'Monitored')}: {monitoredLabel}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
            {t('noMatchingManageEngineItem', 'No matching ManageEngine item was found for this ticket yet.')}
          </div>
          <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            {syncStatus?.message || t('manageEngineSyncContextHint', 'The ticket is still eligible for external sync context when it has an exact ManageEngine external ID link.')}
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageEngineTicketContext;
