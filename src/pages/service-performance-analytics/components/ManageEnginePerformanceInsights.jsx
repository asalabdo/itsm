import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEnginePerformanceInsights = () => {
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const text = (arText, enText) => (isArabic ? arText : enText);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    operations: 0,
    serviceDeskRequests: 0,
    opManagerAlerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [unifiedRes, syncRes] = await Promise.all([
          manageEngineAPI.getUnified().catch(() => ({ data: { summary: {} } })),
          manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
        ]);

        setSummary(summarizeManageEngineUnified(unifiedRes));
        setSyncStatus(syncRes?.data || null);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const importedTotal = (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0);
  const dominantSource = summary.opManagerAlerts > summary.serviceDeskRequests
    ? t('opManagerAlerts', 'OpManager alerts')
    : t('serviceDeskRequests', 'ServiceDesk requests');
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.serviceDeskRequests },
    { value: summary.opManagerAlerts },
    { value: importedTotal },
  ]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className={`flex items-start justify-between gap-3 mb-5`}>
        <div>
          <div className={`flex items-center gap-2 text-primary mb-2`}>
            <Icon name="ServerCog" size={18} />
            <h4 className="text-lg font-semibold text-foreground">
              {text('رؤى أداء ManageEngine', t('manageEnginePerformanceInsights', 'ManageEngine Performance Insights'))}
            </h4>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {text('قارن الطلب الخارجي وضغط المراقبة بجانب أداء الخدمة الداخلي.', t('manageEnginePerformanceDescription', 'Cross-check external demand and monitoring pressure beside internal service performance.'))}
          </p>
        </div>
        {loading ? (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {text('جارٍ التحميل', t('loading', 'Loading'))}
          </span>
        ) : zeroHiddenCount > 0 ? (
          <ManageEngineZeroBadge label={text(`${zeroHiddenCount} مخفية`, `${zeroHiddenCount} hidden`)} />
        ) : (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {text(`${summary.operations} عناصر خارجية`, `${summary.operations} ${t('externalItems', 'external items')}`)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {text('جارٍ تحميل رؤى ManageEngine...', t('loadingManageEngineInsights', 'Loading ManageEngine insights...'))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ManageEngineMetricCard
            label={text('مزيج الطلب الخارجي', t('externalDemandMix', 'External demand mix'))}
            value={summary.serviceDeskRequests}
            icon={<Icon name="ClipboardList" size={16} className="text-primary" />}
            helper={text('طلبات ServiceDesk النشطة في التغذية التشغيلية.', t('serviceDeskRequestsActive', 'Active ServiceDesk requests in the operational feed.'))}
          />
          <ManageEngineMetricCard
            label={text('ضغط المراقبة', t('monitoringPressure', 'Monitoring pressure'))}
            value={summary.opManagerAlerts}
            icon={<Icon name="Radar" size={16} className="text-primary" />}
            helper={text('تنبيهات OpManager التي تساهم حالياً في ضغط الخدمة.', t('opManagerAlertsTracked', 'OpManager alerts currently contributing to service pressure.'))}
          />
          <ManageEngineMetricCard
            label={text('تغطية مزامنة التذاكر', t('ticketSyncCoverage', 'Ticket sync coverage'))}
            value={importedTotal}
            icon={<Icon name="ArrowUpDown" size={16} className="text-primary" />}
            helper={syncStatus?.message || text('العمل المستورد من ManageEngine مرتبط حالياً بالتذاكر المحلية.', t('manageEngineSyncHealthy', 'Imported ManageEngine work currently mapped into local tickets.'))}
          />
        </div>
      )}

      {!loading && (
        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <div className={`flex items-center gap-2 mb-2`}>
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{text('القراءة الحالية', t('manageEngineReadout', 'Current readout'))}</span>
          </div>
          <p className={`text-sm text-muted-foreground`}>
            {text('أقوى إشارة خارجية الآن هي', t('manageEngineReadoutText', 'The strongest external signal right now is'))} <span className="font-medium text-foreground">{dominantSource}</span>.{' '}
            {summary.operations > 0
              ? text('استخدمها للتحقق مما إذا كانت اتجاهات الخدمة الحالية داخلية فقط أم مدفوعة بمنصات خارجية.', t('manageEngineReadoutAction', 'Use it to validate whether current service trends are internal-only or driven by external platforms.'))
              : text('لا يوجد ضغط خارجي ظاهر حالياً من ManageEngine.', t('manageEngineReadoutIdle', 'No external pressure is currently visible from ManageEngine.'))}
          </p>
        </div>
      )}
    </div>
  );
};

export default ManageEnginePerformanceInsights;
