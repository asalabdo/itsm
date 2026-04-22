import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, { ManageEngineZeroBadge, countHiddenZeroMetrics } from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeManageEngineUnified } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';

const ManageEngineExecutiveSummary = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
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
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.catalog },
    { value: summary.operations },
    { value: (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0) },
  ]);

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

  useEffect(() => {
    void loadData();
  }, []);

  const executiveMetrics = [
    {
      label: isArabic ? 'الكتالوج الخارجي' : 'External Catalog',
      value: summary.catalog,
      helper: isArabic
        ? `${summary.serviceDeskCatalog} من ServiceDesk + ${summary.opManagerCatalog} من OpManager`
        : `${summary.serviceDeskCatalog} ServiceDesk + ${summary.opManagerCatalog} OpManager`,
      icon: 'Layers3',
    },
    {
      label: isArabic ? 'التدفق التشغيلي' : 'Operational Feed',
      value: summary.operations,
      helper: isArabic
        ? `${summary.serviceDeskRequests} طلبات + ${summary.opManagerAlerts} تنبيهات`
        : `${summary.serviceDeskRequests} requests + ${summary.opManagerAlerts} alerts`,
      icon: 'Activity',
    },
    {
      label: isArabic ? 'التذاكر المستوردة' : 'Imported Tickets',
      value: (syncStatus?.createdCount || 0) + (syncStatus?.updatedCount || 0),
      helper: isArabic
        ? `${syncStatus?.createdCount || 0} تم إنشاؤها / ${syncStatus?.updatedCount || 0} تم تحديثها`
        : `${syncStatus?.createdCount || 0} created / ${syncStatus?.updatedCount || 0} updated`,
      icon: 'ArrowUpDown',
    },
    {
      label: isArabic ? 'صحة المزامنة' : 'Sync Health',
      value: syncStatus?.status ? (isArabic ? { idle: 'خامل', running: 'جارٍ التشغيل', healthy: 'سليم', error: 'خطأ' }[String(syncStatus.status).toLowerCase()] || syncStatus.status : syncStatus.status) : 'idle',
      helper: syncStatus?.message || (isArabic ? 'لم يتم تشغيل أي مزامنة بعد.' : 'No sync has been run yet.'),
      icon: 'ShieldCheck',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow mb-8">
      <div className="flex items-center gap-2 mb-5">
        <Icon name="ServerCog" size={20} className="text-primary" />
          <div>
          <h3 className="text-lg font-semibold text-foreground">{isArabic ? 'لقطة تنفيذية من ManageEngine' : 'ManageEngine Executive Snapshot'}</h3>
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? 'عرض عبر المنصات لطلب الخدمات الخارجية وحجم المراقبة وصحة مزامنة التذاكر.'
              : 'Cross-platform view of external service demand, monitoring volume, and ticket sync health.'}
          </p>
        </div>
        {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} className="ml-auto" /> : null}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {isArabic ? 'جارٍ تحميل ملخص ManageEngine...' : 'Loading ManageEngine summary...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {executiveMetrics.map((metric) => (
            <ManageEngineMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={<Icon name={metric.icon} size={18} className="text-primary" />}
              helper={metric.helper}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEngineExecutiveSummary;
