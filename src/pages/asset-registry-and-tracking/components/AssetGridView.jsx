import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';


const AssetGridView = ({ assets, selectedAssets, onSelectAsset, onSelectAll, onAssetClick, userRole }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'assetId', direction: 'asc' });

  const columns = [
    { key: 'assetId', label: 'معرف الأصل', sortable: true, width: '10%' },
    { key: 'description', label: 'الوصف', sortable: true, width: '20%' },
    { key: 'currentOwner', label: 'المالك الحالي', sortable: true, width: '15%' },
    { key: 'location', label: 'الموقع', sortable: true, width: '15%' },
    { key: 'status', label: 'الحالة', sortable: true, width: '10%' },
    { key: 'value', label: 'القيمة', sortable: true, width: '10%', roleRequired: ['admin', 'finance'] },
    { key: 'maintenance', label: 'الصيانة القادمة', sortable: true, width: '12%', roleRequired: ['admin', 'custodian'] },
    { key: 'actions', label: 'الإجراءات', sortable: false, width: '8%' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      inactive: 'bg-muted text-muted-foreground border-border',
      maintenance: 'bg-warning/10 text-warning border-warning/20',
      retired: 'bg-error/10 text-error border-error/20',
      lost: 'bg-destructive/10 text-destructive border-destructive/20'
    };
    return colors?.[status] || colors?.inactive;
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

  const sortedAssets = [...assets]?.sort((a, b) => {
    if (sortConfig?.key === 'value') {
      const aVal = parseFloat(a?.[sortConfig?.key]?.replace(/[^0-9.-]+/g, ''));
      const bVal = parseFloat(b?.[sortConfig?.key]?.replace(/[^0-9.-]+/g, ''));
      return sortConfig?.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    if (a?.[sortConfig?.key] < b?.[sortConfig?.key]) {
      return sortConfig?.direction === 'asc' ? -1 : 1;
    }
    if (a?.[sortConfig?.key] > b?.[sortConfig?.key]) {
      return sortConfig?.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const isColumnVisible = (column) => {
    if (!column?.roleRequired) return true;
    return column?.roleRequired?.includes(userRole);
  };

  const allSelected = assets?.length > 0 && selectedAssets?.length === assets?.length;
  const someSelected = selectedAssets?.length > 0 && selectedAssets?.length < assets?.length;

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
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="w-4 h-4 rounded border-border focus-ring"
                />
              </th>
              {columns?.filter(isColumnVisible)?.map((column) => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-sm font-semibold"
                  style={{ width: column?.width }}
                >
                  {column?.sortable ? (
                    <button
                      onClick={() => handleSort(column?.key)}
                      className="flex items-center gap-2 hover:text-primary transition-smooth"
                    >
                      {column?.label}
                      {sortConfig?.key === column?.key && (
                        <Icon
                          name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          size={16}
                        />
                      )}
                    </button>
                  ) : (
                    column?.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAssets?.map((asset) => (
              <tr
                key={asset?.id}
                className="border-b border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                onClick={() => onAssetClick(asset)}
              >
                <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedAssets?.includes(asset?.id)}
                    onChange={(e) => {
                      e?.stopPropagation();
                      onSelectAsset(asset?.id, e?.target?.checked);
                    }}
                    className="w-4 h-4 rounded border-border focus-ring"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                      <Icon name={asset?.icon} size={16} color="var(--color-primary)" />
                    </div>
                    <span className="font-medium text-sm">{asset?.assetId}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{asset?.description}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{asset?.category}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Image
                      src={asset?.ownerAvatar}
                      alt={asset?.ownerAvatarAlt}
                      className="w-6 h-6 rounded-full object-cover"
                    />
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
                        {asset?.maintenanceDaysUntil < 0 ? 'متأخرة' : `${asset?.maintenanceDaysUntil} يومًا`}
                      </p>
                    </div>
                  </td>
                )}
                <td className="px-4 py-3" onClick={(e) => e?.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded hover:bg-muted transition-smooth press-scale focus-ring"
                      aria-label="إجراءات سريعة"
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
