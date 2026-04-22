import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineComparativeInsights = ({ internalTickets = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
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
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.serviceDeskRequests },
    { value: summary.opManagerAlerts },
  ]);
  const comparisonLabel = pressureDelta > 0
    ? t('externalPressureHigher', 'External pressure is higher than the current open internal backlog.')
    : pressureDelta < 0
      ? t('internalBacklogHigher', 'Internal backlog is still heavier than the current external feed.')
      : t('externalPressureBalanced', 'External pressure and internal backlog are currently balanced.');

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-elevation-1">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Icon name="GitCompareArrows" size={18} />
            <h3 className="font-semibold text-foreground">{t('manageEngineComparativeInsights', 'ManageEngine Comparative Insights')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('manageEngineComparativeInsightsDesc', 'Compare internal backlog against live external demand from ServiceDesk and OpManager.')}
          </p>
        </div>
        {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} /> : (
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {t('liveComparison', 'Live comparison')}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {t('loadingManageEngineComparison', 'Loading ManageEngine comparison...')}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <ManageEngineMetricCard
              label={t('openInternalTickets', 'Open internal tickets')}
              value={openInternal}
              icon={<Icon name="Ticket" size={16} className="text-primary" />}
              hideWhenZero={false}
            />
            <ManageEngineMetricCard
              label={t('serviceDeskRequests', 'ServiceDesk requests')}
              value={summary.serviceDeskRequests}
              icon={<Icon name="ClipboardList" size={16} className="text-primary" />}
            />
            <ManageEngineMetricCard
              label={t('opManagerAlerts', 'OpManager alerts')}
              value={summary.opManagerAlerts}
              icon={<Icon name="Radar" size={16} className="text-primary" />}
            />
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Sparkles" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{t('analystTake', 'Analyst take')}</span>
            </div>
            <p className="text-sm text-muted-foreground">{comparisonLabel}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {t('totalExternalOperations', 'Total external operations')}: {summary.operations}. {t('deltaVsOpenInternalBacklog', 'Delta vs open internal backlog')}: {pressureDelta > 0 ? '+' : ''}{pressureDelta}.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageEngineComparativeInsights;
