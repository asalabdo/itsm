import { useEffect, useMemo, useState } from 'react';
import { manageEngineAPI } from '../../../services/api';
import { normalizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ManageEngineIntegration = ({ onSyncComplete }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncDetails, setSyncDetails] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    overall: 'unknown',
    serviceDeskConnected: false,
    opManagerConnected: false,
  });
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncResults, setSyncResults] = useState(null);
  const [operations, setOperations] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    source: '',
    type: '',
    status: '',
    search: '',
  });

  const resetFilters = () => {
    setFilters({
      source: '',
      type: '',
      status: '',
      search: '',
    });
  };

  const refreshAll = async () => {
    await Promise.all([testConnection(), loadUnifiedData(), loadSyncStatus()]);
  };

  useEffect(() => {
    void Promise.all([testConnection(), loadUnifiedData(), loadSyncStatus()]);
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void loadUnifiedData();
    // Refetch when filter values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.source, filters.type, filters.status, filters.search]);

  const testConnection = async () => {
    try {
      const response = await manageEngineAPI.testConnection();
      setConnectionStatus({
        overall: response?.data?.status === 'connected' ? 'connected' : 'failed',
        serviceDeskConnected: Boolean(response?.data?.serviceDeskConnected),
        opManagerConnected: Boolean(response?.data?.opManagerConnected),
      });
    } catch {
      setConnectionStatus({
        overall: 'failed',
        serviceDeskConnected: false,
        opManagerConnected: false,
      });
      setError('Failed to test ManageEngine connection');
    }
  };

  const loadUnifiedData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      const response = await manageEngineAPI.getUnified(filters);
      const unified = normalizeManageEngineUnified(response);
      setCatalog(unified.catalog);
      setOperations(unified.operations);
    } catch (err) {
      setCatalog([]);
      setOperations([]);
      setError(err?.response?.data?.error || 'Failed to load unified ManageEngine data');
    } finally {
      setLoadingData(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const response = await manageEngineAPI.getSyncStatus();
      setSyncDetails(response?.data || null);
    } catch {
      setSyncDetails(null);
    }
  };

  const handleSync = async () => {
    try {
      setSyncStatus('syncing');
      setError(null);
      const response = await manageEngineAPI.syncIncidents();
      setSyncResults(response.data);
      setLastSyncTime(response?.data?.lastSyncAt ? new Date(response.data.lastSyncAt) : new Date());
      setSyncStatus(response?.data?.status === 'partial' ? 'error' : 'success');
      await Promise.all([loadUnifiedData(), loadSyncStatus()]);
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      setSyncStatus('error');
      setError(err?.response?.data?.error || 'Sync failed');
    }
  };

  const getConnectionStatusColor = (connected) => (
    connected ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
  );

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-700 bg-blue-100';
      case 'success':
        return 'text-green-700 bg-green-100';
      case 'error':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const operationGroups = useMemo(() => ({
    serviceDesk: operations.filter((item) => item.source === 'ServiceDesk'),
    opManager: operations.filter((item) => item.source === 'OpManager'),
  }), [operations]);

  const catalogGroups = useMemo(() => ({
    serviceDesk: catalog.filter((item) => item.source === 'ServiceDesk'),
    opManager: catalog.filter((item) => item.source === 'OpManager'),
  }), [catalog]);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-elevation-1">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">ManageEngine Unified Integration</h3>
          <p className="text-sm text-muted-foreground mt-1">
            ServiceDesk requests and catalog data combined with OpManager services and alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getSyncStatusColor()}`}>
            {syncStatus === 'syncing' ? 'Syncing' : syncStatus === 'success' ? 'Synced' : syncStatus === 'error' ? 'Sync Failed' : 'Ready'}
          </span>
          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={refreshAll}>
            Refresh
          </Button>
          <Button
            variant="default"
            size="sm"
            iconName="ArrowUpDown"
            onClick={handleSync}
            disabled={syncStatus === 'syncing' || connectionStatus.overall !== 'connected'}
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Incidents'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-sm text-muted-foreground mb-1">ServiceDesk</div>
          <div className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getConnectionStatusColor(connectionStatus.serviceDeskConnected)}`}>
            {connectionStatus.serviceDeskConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-sm text-muted-foreground mb-1">OpManager</div>
          <div className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getConnectionStatusColor(connectionStatus.opManagerConnected)}`}>
            {connectionStatus.opManagerConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-sm text-muted-foreground mb-1">Operational Items</div>
          <div className="text-2xl font-semibold text-foreground">{operations.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-sm text-muted-foreground mb-1">Catalog + Services</div>
          <div className="text-2xl font-semibold text-foreground">{catalog.length}</div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">All sources</option>
          <option value="ServiceDesk">ServiceDesk</option>
          <option value="OpManager">OpManager</option>
        </select>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          <option value="">All types</option>
          <option value="request">Requests</option>
          <option value="alert">Alerts</option>
          <option value="catalog">Catalog</option>
          <option value="service">Services</option>
        </select>
        <input
          type="text"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          placeholder="Filter by status"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search external items"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear Filters
        </Button>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          ServiceDesk ops: {operationGroups.serviceDesk.length}
        </span>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          OpManager ops: {operationGroups.opManager.length}
        </span>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          ServiceDesk catalog: {catalogGroups.serviceDesk.length}
        </span>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          OpManager services: {catalogGroups.opManager.length}
        </span>
      </div>

      {(lastSyncTime || syncDetails?.lastSyncAt) && (
        <div className="text-xs text-muted-foreground mb-4">
          Last sync: {(lastSyncTime || new Date(syncDetails.lastSyncAt)).toLocaleString()}
        </div>
      )}

      {syncResults && (
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          {syncResults.message}
          {(syncResults.createdCount || syncResults.updatedCount || syncResults.failedCount) ? (
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-background px-2 py-1">Created: {syncResults.createdCount || 0}</span>
              <span className="rounded-full bg-background px-2 py-1">Updated: {syncResults.updatedCount || 0}</span>
              <span className="rounded-full bg-background px-2 py-1">Failed: {syncResults.failedCount || 0}</span>
            </div>
          ) : null}
        </div>
      )}

      {syncDetails && (
        <div className="mb-4 rounded-xl border border-border bg-background p-4 text-sm text-foreground">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-1">Sync status: {syncDetails.status}</span>
            <span className="rounded-full bg-muted px-2 py-1">ServiceDesk tickets: {syncDetails.serviceDeskCount || 0}</span>
            <span className="rounded-full bg-muted px-2 py-1">OpManager tickets: {syncDetails.opManagerCount || 0}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {loadingData ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center text-muted-foreground">
          Loading ManageEngine data...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Activity" size={18} className="text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Operational Feed</h4>
            </div>
            {[...operationGroups.serviceDesk, ...operationGroups.opManager].slice(0, 10).map((item) => (
              <div key={`${item.source}-${item.externalId}`} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.source} {item.itemType}</div>
                    <div className="text-base font-semibold text-foreground mt-1">{item.name}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.status || 'Active'}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description || 'No description available.'}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {item.priority && <span className="rounded-full bg-muted px-2 py-1">{item.priority}</span>}
                  {item.category && <span className="rounded-full bg-muted px-2 py-1">{item.category}</span>}
                  {item.owner && <span className="rounded-full bg-muted px-2 py-1">{item.owner}</span>}
                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-primary/10 px-2 py-1 text-primary hover:bg-primary/20"
                    >
                      Open Source
                    </a>
                  )}
                </div>
              </div>
            ))}
            {operations.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No ServiceDesk requests or OpManager alerts were returned.
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="Layers3" size={18} className="text-primary" />
              <h4 className="text-lg font-semibold text-foreground">Catalog and Services</h4>
            </div>
            {[...catalogGroups.serviceDesk, ...catalogGroups.opManager].slice(0, 10).map((item) => (
              <div key={`${item.source}-${item.externalId}`} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{item.source} {item.itemType}</div>
                    <div className="text-base font-semibold text-foreground mt-1">{item.name}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{item.category || item.source}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description || 'No description available.'}</p>
                {item.externalUrl && (
                  <div className="mt-3">
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Open Source
                    </a>
                  </div>
                )}
              </div>
            ))}
            {catalog.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-muted-foreground">
                No ServiceDesk templates or OpManager services were returned.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ManageEngineIntegration;
