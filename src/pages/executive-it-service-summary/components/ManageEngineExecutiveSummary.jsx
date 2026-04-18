import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { manageEngineAPI } from '../../../services/api';

const ManageEngineExecutiveSummary = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    catalog: 0,
    operations: 0,
    serviceDeskCatalog: 0,
    opManagerCatalog: 0,
    serviceDeskRequests: 0,
    opManagerAlerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unifiedRes, syncRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { summary: {} } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      setSummary({
        catalog: unifiedRes?.data?.summary?.catalog || 0,
        operations: unifiedRes?.data?.summary?.operations || 0,
        serviceDeskCatalog: unifiedRes?.data?.summary?.serviceDeskCatalog || 0,
        opManagerCatalog: unifiedRes?.data?.summary?.opManagerCatalog || 0,
        serviceDeskRequests: unifiedRes?.data?.summary?.serviceDeskRequests || 0,
        opManagerAlerts: unifiedRes?.data?.summary?.opManagerAlerts || 0,
      });
      setSyncStatus(syncRes?.data || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const executiveMetrics = [
    {
      label: 'External Catalog',
      value: summary.catalog,
      helper: `${summary.serviceDeskCatalog} ServiceDesk + ${summary.opManagerCatalog} OpManager`,
      icon: 'Layers3',
    },
    {
      label: 'Operational Feed',
      value: summary.operations,
      helper: `${summary.serviceDeskRequests} requests + ${summary.opManagerAlerts} alerts`,
      icon: 'Activity',
    },
    {
      label: 'Imported Tickets',
      value: (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0),
      helper: `${syncStatus?.createdCount || 0} created / ${syncStatus?.updatedCount || 0} updated`,
      icon: 'ArrowUpDown',
    },
    {
      label: 'Sync Health',
      value: syncStatus?.status || 'idle',
      helper: syncStatus?.message || 'No sync has been run yet.',
      icon: 'ShieldCheck',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow mb-8">
      <div className="flex items-center gap-2 mb-5">
        <Icon name="ServerCog" size={20} className="text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">ManageEngine Executive Snapshot</h3>
          <p className="text-sm text-muted-foreground">
            Cross-platform view of external service demand, monitoring volume, and ticket sync health.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          Loading ManageEngine summary...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {executiveMetrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                <Icon name={metric.icon} size={18} className="text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground capitalize">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{metric.helper}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEngineExecutiveSummary;
