import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import ExternalSystemBadge from '../../../components/ui/ExternalSystemBadge';

const ManageEngineTicketContext = ({ ticket }) => {
  const [loading, setLoading] = useState(true);
  const [matchedItem, setMatchedItem] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);

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
        const title = String(ticket?.title || '').toLowerCase();
        const description = String(ticket?.description || '').toLowerCase();
        const externalId = String(ticket?.externalId || '').toLowerCase();

        const matched = searchable.find((item) => {
          const itemId = String(item?.externalId || '').toLowerCase();
          const itemName = String(item?.name || '').toLowerCase();
          const itemDescription = String(item?.description || '').toLowerCase();
          if (externalId && itemId && itemId === externalId) return true;
          if (title && itemName && itemName.includes(title)) return true;
          if (description && itemDescription && itemDescription.includes(description.slice(0, 40))) return true;
          return false;
        }) || null;

        setMatchedItem(matched);
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [ticket?.description, ticket?.externalId, ticket?.title]);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-elevation-1 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="ServerCog" size={18} className="text-primary" />
        <h2 className="text-lg font-semibold text-foreground">ManageEngine Context</h2>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
          Loading external ticket context...
        </div>
      ) : matchedItem ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {matchedItem.source} {matchedItem.itemType}
              </div>
              <div className="font-medium text-foreground mt-1">{matchedItem.name}</div>
            </div>
            <ExternalSystemBadge system={`ManageEngine-${matchedItem.source}`} />
          </div>
          <p className="text-sm text-muted-foreground">{matchedItem.description || 'No external description available.'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Status</p>
              <p className="text-sm font-medium text-foreground">{matchedItem.status || 'Active'}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Sync health</p>
              <p className="text-sm font-medium text-foreground capitalize">{syncStatus?.status || 'idle'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-border border-dashed p-4 text-sm text-center text-muted-foreground">
            No matching ManageEngine item was found for this ticket yet.
          </div>
          <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            {syncStatus?.message || 'The ticket is still eligible for external sync context when ManageEngine data overlaps with its content.'}
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageEngineTicketContext;
