import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';

const ManageEngineComparativeInsights = ({ internalTickets = [] }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    operations: 0,
    serviceDeskRequests: 0,
    opManagerAlerts: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await manageEngineAPI.getUnified().catch(() => ({ data: { summary: {} } }));
        setSummary(summarizeManageEngineUnified(response));
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const openInternal = useMemo(
    () => internalTickets.filter((ticket) => !['resolved', 'closed'].includes(String(ticket?.status || '').toLowerCase())).length,
    [internalTickets]
  );

  const externalPressure = summary.operations;
  const pressureDelta = externalPressure - openInternal;
  const comparisonLabel = pressureDelta > 0
    ? 'External pressure is higher than the current open internal backlog.'
    : pressureDelta < 0
      ? 'Internal backlog is still heavier than the current external feed.'
      : 'External pressure and internal backlog are currently balanced.';

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Icon name="GitCompareArrows" size={18} />
            <h3 className="font-semibold text-foreground">ManageEngine Comparative Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Compare internal backlog against live external demand from ServiceDesk and OpManager.
          </p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Live comparison
        </span>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          Loading ManageEngine comparison...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground mb-1">Open internal tickets</div>
              <div className="text-2xl font-semibold text-foreground">{openInternal}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground mb-1">ServiceDesk requests</div>
              <div className="text-2xl font-semibold text-foreground">{summary.serviceDeskRequests}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground mb-1">OpManager alerts</div>
              <div className="text-2xl font-semibold text-foreground">{summary.opManagerAlerts}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Sparkles" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Analyst take</span>
            </div>
            <p className="text-sm text-muted-foreground">{comparisonLabel}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Total external operations: {summary.operations}. Delta vs open internal backlog: {pressureDelta > 0 ? '+' : ''}{pressureDelta}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageEngineComparativeInsights;
