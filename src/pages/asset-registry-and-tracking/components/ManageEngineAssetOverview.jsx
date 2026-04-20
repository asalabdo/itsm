import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const ManageEngineAssetOverview = ({ overview, syncStatus, loading, onRefresh }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const cards = [
    {
      label: t('monitoredAssets', 'Monitored assets'),
      value: overview?.monitoredAssets ?? 0,
      icon: 'Radar',
      tone: 'text-sky-700 bg-sky-500/10',
    },
    {
      label: t('assetsWithAlerts', 'Assets with alerts'),
      value: overview?.assetsWithAlerts ?? 0,
      icon: 'AlertTriangle',
      tone: 'text-amber-700 bg-amber-500/10',
    },
    {
      label: t('assetsWithRequests', 'Assets with requests'),
      value: overview?.assetsWithRequests ?? 0,
      icon: 'ClipboardList',
      tone: 'text-emerald-700 bg-emerald-500/10',
    },
    {
      label: t('linkedAlerts', 'Linked alerts'),
      value: overview?.totalAlerts ?? 0,
      icon: 'BellRing',
      tone: 'text-rose-700 bg-rose-500/10',
    },
  ];

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Icon name="ServerCog" size={14} />
              {t('manageEngineAssetView', 'ManageEngine Asset View')}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-foreground">
              {t('manageEngineCoverage', 'External monitoring and service context for assets')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('manageEngineCoverageDesc', 'Match internal assets with OpManager monitoring and ServiceDesk operational workload.')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
              <div className="text-xs text-muted-foreground">{t('syncHealth', 'Sync health')}</div>
              <div className="mt-1 text-sm font-semibold capitalize text-foreground">{syncStatus?.status || t('idle', 'idle')}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {syncStatus?.message || t('manageEngineReady', 'ManageEngine data is ready for asset review.')}
              </div>
            </div>
            <Button variant="outline" iconName="RefreshCw" iconPosition="left" onClick={() => void onRefresh()}>
              {loading ? t('loading', 'Loading...') : t('refresh', 'Refresh')}
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-muted/20 p-4">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                <Icon name={card.icon} size={18} />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{card.label}</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManageEngineAssetOverview;
