import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { manageEngineAPI } from '../../../services/api';

const ManageEngineRequestIntake = () => {
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

      setRequests(Array.isArray(items) ? items.slice(0, 5) : []);
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

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Icon name="ServerCog" size={18} />
            <h3 className="text-lg font-semibold text-foreground">ManageEngine ServiceDesk Intake</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Live external service requests flowing from ServiceDesk into the fulfillment workspace.
          </p>
        </div>
        <Button variant="outline" size="sm" iconName="RefreshCw" onClick={() => void loadData()}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">External requests</div>
          <div className="text-2xl font-semibold text-foreground">{requests.length}</div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">Imported locally</div>
          <div className="text-2xl font-semibold text-foreground">{syncStatus?.createdCount || 0}</div>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <div className="text-xs text-muted-foreground mb-1">Sync state</div>
          <div className="text-sm font-semibold text-foreground capitalize">{syncStatus?.status || 'idle'}</div>
          <div className="text-xs text-muted-foreground mt-2">
            {syncStatus?.message || 'Waiting for the next ManageEngine sync.'}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            Loading ServiceDesk intake...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
            No external ServiceDesk requests are available right now.
          </div>
        ) : (
          requests.map((request) => (
            <div key={`${request.source}-${request.externalId}`} className="rounded-lg border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    {request.source} {request.itemType}
                  </div>
                  <div className="font-medium text-foreground mt-1">{request.name}</div>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {request.status || 'Open'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {request.description || 'No request description provided.'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEngineRequestIntake;
