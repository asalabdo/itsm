import { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import ManageEngineMetricCard, {
  ManageEngineZeroBadge,
  countHiddenZeroMetrics,
} from '../../../components/manageengine/ManageEngineMetricCard';
import { manageEngineAPI } from '../../../services/api';
import { summarizeOpManager270 } from '../../../services/manageEngineDataUtils';
import { useLanguage } from '../../../context/LanguageContext';

const ManageEngineExecutiveSummary = () => {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    services: 0,
    alerts: 0,
  });
  const [syncStatus, setSyncStatus] = useState(null);
  const zeroHiddenCount = countHiddenZeroMetrics([
    { value: summary.services },
    { value: summary.alerts },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [unifiedRes, syncRes] = await Promise.all([
        manageEngineAPI.getUnified().catch(() => ({ data: { catalog: [], operations: [] } })),
        manageEngineAPI.getSyncStatus().catch(() => ({ data: null })),
      ]);

      setSummary(summarizeOpManager270(unifiedRes));
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
      label: isArabic ? 'خدمات OpManager' : 'OpManager Services',
      value: summary.services,
      helper: isArabic
        ? 'الخدمات المدعومة من OpManager 12.8.270.'
        : 'Services exposed by the OpManager 12.8.270 feed.',
      icon: 'Server',
    },
    {
      label: isArabic ? 'تنبيهات OpManager' : 'OpManager Alerts',
      value: summary.alerts,
      helper: isArabic
        ? 'التنبيهات النشطة من OpManager 12.8.270.'
        : 'Alerts visible from the OpManager 12.8.270 feed.',
      icon: 'Radar',
    },
    {
      label: isArabic ? 'صحة المزامنة' : 'Sync Health',
      value: syncStatus?.status ? (isArabic ? { idle: 'خامل', running: 'جار التشغيل', healthy: 'سليم', error: 'خطأ' }[String(syncStatus.status).toLowerCase()] || syncStatus.status : syncStatus.status) : 'idle',
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
              ? 'لقطة سريعة مبنية فقط على الخدمات والتنبيهات المدعومة من OpManager 12.8.270.'
              : 'Snapshot based only on services and alerts supported by OpManager 12.8.270.'}
          </p>
        </div>
        {!loading && zeroHiddenCount > 0 ? <ManageEngineZeroBadge label={`${zeroHiddenCount} hidden`} className="ml-auto" /> : null}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border border-dashed p-6 text-sm text-center text-muted-foreground">
          {isArabic ? 'جارٍ تحميل ملخص ManageEngine...' : 'Loading ManageEngine summary...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {executiveMetrics.map((metric) => (
            <ManageEngineMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={<Icon name={metric.icon} size={18} className="text-primary" />}
              helper={metric.helper}
              hideWhenZero={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEngineExecutiveSummary;
