import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AssetGridView = ({ assets, selectedAssets, onSelectAsset, onSelectAll, onAssetClick, userRole }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [sortConfig, setSortConfig] = useState({ key: 'assetId', direction: 'asc' });

  const columns = [
    { key: 'assetId', label: t('assetId', 'Asset ID'), sortable: true, width: '10%' },
    { key: 'description', label: t('description', 'Description'), sortable: true, width: '20%' },
    { key: 'currentOwner', label: t('currentOwner', 'Current Owner'), sortable: true, width: '15%' },
    { key: 'location', label: t('location', 'Location'), sortable: true, width: '15%' },
    { key: 'status', label: t('status', 'Status'), sortable: true, width: '10%' },
    { key: 'value', label: t('value', 'Value'), sortable: true, width: '10%', roleRequired: ['admin', 'finance'] },
    { key: 'maintenance', label: t('nextMaintenance', 'Next maintenance'), sortable: true, width: '12%', roleRequired: ['admin', 'custodian'] },
    { key: 'actions', label: t('actions', 'Actions'), sortable: false, width: '8%' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      inactive: 'bg-muted text-muted-foreground border-border',
      maintenance: 'bg-warning/10 text-warning border-warning/20',
      retired: 'bg-error/10 text-error border-error/20',
      lost: 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return colors?.[status] || colors.inactive;
  };

  const getMaintenanceColor = (daysUntil) => {
    if (daysUntil < 0) return 'text-error';
    if (daysUntil <= 7) return 'text-warning';
    return 'text-muted-foreground';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortConfig?.key === 'value') {
      const aValue = parseFloat(a?.[sortConfig.key]?.replace(/[^0-9.-]+/g, ''));
      const bValue = parseFloat(b?.[sortConfig.key]?.replace(/[^0-9.-]+/g, ''));
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (a?.[sortConfig.key] < b?.[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a?.[sortConfig.key] > b?.[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const isColumnVisible = (column) => {
    if (!column?.roleRequired) return true;
    return column.roleRequired.includes(userRole);
  };

  const allSelected = assets.length > 0 && selectedAssets.length === assets.length;
  const someSelected = selectedAssets.length > 0 && selectedAssets.length < assets.length;

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="overflow-x-auto scrollbar-custom flex-1">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(element) => {
                    if (element) {
                      element.indeterminate = someSelected;
                    }
                  }}
                  onChange={(event) => onSelectAll(event?.target?.checked)}
                  className="w-4 h-4 rounded border-border focus-ring"
                />
              </th>
              {columns.filter(isColumnVisible).map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-sm font-semibold"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-primary transition-smooth"
                    >
                      {column.label}
                      {sortConfig?.key === column.key && (
                        <Icon name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={16} />
                      )}
                    </button>
                  ) : column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset) => (
              <tr
                key={asset?.id}
                className="border-b border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                onClick={() => onAssetClick(asset)}
              >
                <td className="px-4 py-3" onClick={(event) => event?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedAssets.includes(asset?.id)}
                    onChange={(event) => {
                      event?.stopPropagation();
                      onSelectAsset(asset?.id, event?.target?.checked);
                    }}
                    className="w-4 h-4 rounded border-border focus-ring"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <Icon name={asset?.icon} size={16} color="var(--color-primary)" />
                    </div>
                    <div>
                      <span className="font-medium text-sm block">{asset?.assetId}</span>
                      {asset?.manageEngine?.isMonitored && (
                        <span className="text-[11px] text-sky-700">{t('opManagerMonitored', 'OpManager monitored')}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{asset?.description}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{asset?.category}</p>
                    {(asset?.manageEngine?.alertCount > 0 || asset?.manageEngine?.requestCount > 0) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {asset?.manageEngine?.alertCount > 0 && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700">
                            {t('alerts', 'Alerts')}: {asset.manageEngine.alertCount}
                          </span>
                        )}
                        {asset?.manageEngine?.requestCount > 0 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700">
                            {t('requests', 'Requests')}: {asset.manageEngine.requestCount}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Image src={asset?.ownerAvatar} alt={asset?.ownerAvatarAlt} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm">{asset?.currentOwner}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-sm">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span>{asset?.location}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(asset?.status)}`}>
                    {asset?.status?.charAt(0)?.toUpperCase() + asset?.status?.slice(1)}
                  </span>
                </td>
                {isColumnVisible({ roleRequired: ['admin', 'finance'] }) && (
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium data-text">{asset?.value}</span>
                  </td>
                )}
                {isColumnVisible({ roleRequired: ['admin', 'custodian'] }) && (
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className={getMaintenanceColor(asset?.maintenanceDaysUntil)}>
                        {asset?.maintenance}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {asset?.maintenanceDaysUntil < 0
                          ? t('overdue', 'Overdue')
                          : `${asset?.maintenanceDaysUntil} ${language === 'ar' ? 'يوماً' : 'days'}`}
                      </p>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3" onClick={(event) => event?.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    {asset?.manageEngine?.externalUrl && (
                      <a
                        href={asset.manageEngine.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-muted transition-smooth press-scale focus-ring"
                        aria-label={t('openInSourceSystem', 'Open in source system')}
                      >
                        <Icon name="ExternalLink" size={16} />
                      </a>
                    )}
                    <button
                      className="p-1.5 rounded hover:bg-muted transition-smooth press-scale focus-ring"
                      aria-label={t('quickActions', 'Quick actions')}
                    >
                      <Icon name="MoreVertical" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetGridView;
