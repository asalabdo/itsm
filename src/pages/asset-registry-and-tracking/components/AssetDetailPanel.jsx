import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AssetDetailPanel = ({ asset, onClose, userRole, syncStatus }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [activeTab, setActiveTab] = useState('details');
  const isArabic = language === 'ar';

  const statusLabel = (status) => {
    const key = String(status || '').toLowerCase();
    const map = {
      active: { en: 'Active', ar: 'نشط' },
      retired: { en: 'Retired', ar: 'متقاعد' },
      maintenance: { en: 'Maintenance', ar: 'الصيانة' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      scheduled: { en: 'Scheduled', ar: 'مجدول' },
      inactive: { en: 'Inactive', ar: 'غير نشط' },
    };
    return isArabic ? (map[key]?.ar || status) : (map[key]?.en || status);
  };

  if (!asset) {
    return (
      <div className="w-full lg:w-96 bg-card border-l border-border flex items-center justify-center p-8">
        <div className="text-center">
          <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t('selectAssetForDetails', 'Select an asset to view details')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: t('details', 'Details'), icon: 'Info' },
    { id: 'manageEngine', label: t('manageEngine', 'ManageEngine'), icon: 'ServerCog' },
    { id: 'relationships', label: t('relationships', 'Relationships'), icon: 'Link' },
    { id: 'history', label: t('history', 'History'), icon: 'History' },
  ];

  const isTabVisible = (tab) => {
    if (!tab?.roleRequired) return true;
    return tab.roleRequired.includes(userRole);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success',
      retired: 'bg-muted text-muted-foreground',
      maintenance: 'bg-warning/10 text-warning',
      completed: 'bg-success/10 text-success',
      scheduled: 'bg-primary/10 text-primary',
    };
    return colors?.[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="w-full lg:w-96 bg-card border-l border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{t('assetDetails', 'Asset Details')}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label={t('closeDetails', 'Close details')}
        >
          <Icon name="X" size={20} />
        </button>
      </div>
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={asset?.icon} size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{asset?.description}</h3>
            <p className="text-sm text-muted-foreground mt-1">{asset?.assetId}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(asset?.status)}`}>
                {statusLabel(asset?.status)}
              </span>
              {asset?.manageEngine?.isMonitored && (
                <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-700">
                  <Icon name="Radar" size={12} />
                  {t('opManagerMonitored', 'OpManager monitored')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-b border-border">
        <div className="flex overflow-x-auto scrollbar-custom">
          {tabs.filter(isTabVisible).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('manufacturerModel', 'Manufacturer / Model')}</label>
              <p className="text-sm mt-1">{asset?.manufacturer || 'N/A'} {asset?.model}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('category', 'Category')}</label>
              <p className="text-sm mt-1">{asset?.category}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('currentOwner', 'Current Owner')}</label>
              <div className="flex items-center gap-2 mt-1">
                <Icon name="User" size={16} className="text-muted-foreground" />
                <span className="text-sm">{asset?.currentOwner}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('location', 'Location')}</label>
              <div className="flex items-center gap-1 mt-1">
                <Icon name="MapPin" size={14} className="text-muted-foreground" />
                <span className="text-sm">{asset?.location}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('serialNumber', 'Serial Number')}</label>
              <p className="text-sm mt-1 data-text">{asset?.serialNumber}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('purchaseDate', 'Purchase Date')}</label>
              <p className="text-sm mt-1">{asset?.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}

        {activeTab === 'manageEngine' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="text-xs text-muted-foreground">{t('syncHealth', 'Sync health')}</div>
              <div className="mt-1 text-sm font-semibold text-foreground capitalize">{syncStatus?.status || t('idle', 'idle')}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {syncStatus?.message || t('manageEngineReady', 'ManageEngine data is available for this asset.')}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t('monitored', 'Monitored')}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{asset?.manageEngine?.isMonitored ? t('yes', 'Yes') : t('no', 'No')}</div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t('alerts', 'Alerts')}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{asset?.manageEngine?.alertCount || 0}</div>
              </div>
              <div className="rounded-xl border border-border p-3">
                <div className="text-xs text-muted-foreground">{t('requests', 'Requests')}</div>
                <div className="mt-1 text-lg font-semibold text-foreground">{asset?.manageEngine?.requestCount || 0}</div>
              </div>
            </div>

            {asset?.manageEngine?.externalUrl && (
              <a
                href={asset.manageEngine.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Icon name="ExternalLink" size={16} />
                {t('openInSourceSystem', 'Open in source system')}
              </a>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{t('opManagerServices', 'OpManager services')}</h4>
              {asset?.manageEngine?.services?.length ? (
                asset.manageEngine.services.map((item) => (
                  <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.status || t('active', 'Active')}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('noMonitoringLinked', 'No monitored service is linked to this asset right now.')}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{t('relatedAlerts', 'Related alerts')}</h4>
              {asset?.manageEngine?.alerts?.length ? (
                asset.manageEngine.alerts.map((item) => (
                  <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.description || t('noDescriptionAvailable', 'No description available.')}</div>
                      </div>
                      <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700">
                        {item.status || t('active', 'Active')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('noAlertsLinked', 'No active alerts are linked to this asset.')}</p>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">{t('serviceDeskRequests', 'ServiceDesk requests')}</h4>
              {asset?.manageEngine?.requests?.length ? (
                asset.manageEngine.requests.map((item) => (
                  <div key={`${item.source}-${item.externalId}`} className="rounded-lg border border-border bg-muted/10 p-3">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.status || t('open', 'Open')}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('noRequestsLinked', 'No ServiceDesk requests are linked to this asset.')}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('assetDependencies', 'Asset dependencies')}</h4>
            {asset?.relationships?.length > 0 ? (
              asset.relationships.map((relationship) => (
                <div key={relationship.id} className="p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-primary uppercase">{relationship.relationshipType}</span>
                    <span className="text-sm">
                      {relationship.sourceAssetId === asset.id ? relationship.targetAssetName : relationship.sourceAssetName}
                    </span>
                  </div>
                  <Icon name={relationship.sourceAssetId === asset.id ? 'ArrowRight' : 'ArrowLeft'} size={16} className="text-muted-foreground" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">{t('noRelationshipsLinked', 'No related assets are linked.')}</p>
            )}
            <Button variant="outline" size="sm" fullWidth iconName="Plus" iconPosition="left">
              {t('linkAsset', 'Link asset')}
            </Button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('auditHistory', 'Audit history')}</h4>
            <div className="relative pl-4 border-l-2 border-border space-y-6">
              {asset?.history?.length > 0 ? (
                asset.history.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-card" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.action}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.oldValue && <span>{t('from', 'From')} <span className="text-foreground">{item.oldValue}</span> </span>}
                        {item.newValue && <span>{t('to', 'to')} <span className="text-foreground">{item.newValue}</span></span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground italic uppercase">
                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>{item.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">{t('noHistoryAvailable', 'No history is available.')}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="default" fullWidth iconName="ArrowRightLeft" iconPosition="left">
          {t('transferAsset', 'Transfer asset')}
        </Button>
        <Button variant="outline" fullWidth iconName="Wrench" iconPosition="left" onClick={() => navigate('/maintenance-scheduling')}>
          {t('scheduleMaintenance', 'Schedule maintenance')}
        </Button>
      </div>
    </div>
  );
};

export default AssetDetailPanel;
