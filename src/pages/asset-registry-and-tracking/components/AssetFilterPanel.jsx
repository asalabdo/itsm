import { useCallback, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AssetFilterPanel = ({
  onFilterChange,
  isCollapsed,
  onToggleCollapse,
  categoryOptions = [],
  locationOptions = [],
}) => {
  const { language } = useLanguage();
  const t = useCallback((key, fallback) => getTranslation(language, key, fallback), [language]);

  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    location: '',
    status: [],
    manageEngineStatus: '',
    valueRange: { min: '', max: '' },
    maintenanceStatus: [],
  });

  const localizedCategoryOptions = useMemo(
    () => categoryOptions.map((option, index) => ({
      ...option,
      label: index === 0 ? t('allCategories', 'All Categories') : option.label,
    })),
    [categoryOptions, t]
  );

  const localizedLocationOptions = useMemo(
    () => locationOptions.map((option, index) => ({
      ...option,
      label: index === 0 ? t('allLocations', 'All Locations') : option.label,
    })),
    [locationOptions, t]
  );

  const manageEngineOptions = [
    { value: '', label: t('allAssetsView', 'All assets') },
    { value: 'monitored', label: t('opManagerMonitored', 'OpManager monitored') },
    { value: 'alerts', label: t('assetsWithAlerts', 'Assets with alerts') },
    { value: 'requests', label: t('assetsWithRequests', 'Assets with requests') },
  ];

  const statusTypes = [
    { id: 'active', label: language === 'ar' ? 'نشط' : 'Active' },
    { id: 'inactive', label: language === 'ar' ? 'غير نشط' : 'Inactive' },
    { id: 'maintenance', label: language === 'ar' ? 'تحت الصيانة' : 'Maintenance' },
    { id: 'retired', label: language === 'ar' ? 'متقاعد' : 'Retired' },
    { id: 'lost', label: language === 'ar' ? 'مفقود/ضائع' : 'Lost' },
  ];

  const maintenanceTypes = [
    { id: 'due', label: language === 'ar' ? 'الصيانة المستحقة' : 'Due soon' },
    { id: 'overdue', label: language === 'ar' ? 'الصيانة المتأخرة' : 'Overdue' },
    { id: 'scheduled', label: language === 'ar' ? 'مجدولة' : 'Scheduled' },
    { id: 'completed', label: language === 'ar' ? 'مكتملة حديثًا' : 'Recently completed' },
  ];

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    onFilterChange(nextFilters);
  };

  const handleStatusChange = (statusId, checked) => {
    const nextStatus = checked
      ? [...filters.status, statusId]
      : filters.status.filter((status) => status !== statusId);
    handleFilterChange('status', nextStatus);
  };

  const handleMaintenanceChange = (maintenanceId, checked) => {
    const nextMaintenance = checked
      ? [...filters.maintenanceStatus, maintenanceId]
      : filters.maintenanceStatus.filter((status) => status !== maintenanceId);
    handleFilterChange('maintenanceStatus', nextMaintenance);
  };

  const handleReset = () => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      location: '',
      status: [],
      manageEngineStatus: '',
      valueRange: { min: '', max: '' },
      maintenanceStatus: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label={t('expandFilters', 'Expand filters')}
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{t('filters', 'Filters')}</h2>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring lg:block hidden"
          aria-label={t('collapseFilters', 'Collapse filters')}
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
        <Input
          type="search"
          placeholder={t('searchByIdNameSerial', 'Search by ID, name or serial...')}
          value={filters.searchQuery}
          onChange={(event) => handleFilterChange('searchQuery', event?.target?.value)}
          className="w-full"
        />

        <Select
          label={t('category', 'Category')}
          options={localizedCategoryOptions}
          value={filters.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        <Select
          label={t('location', 'Location')}
          options={localizedLocationOptions}
          value={filters.location}
          onChange={(value) => handleFilterChange('location', value)}
          searchable
        />

        <Select
          label={t('manageEngine', 'ManageEngine')}
          options={manageEngineOptions}
          value={filters.manageEngineStatus}
          onChange={(value) => handleFilterChange('manageEngineStatus', value)}
        />

        <div>
          <label className="text-sm font-medium mb-3 block">{t('assetStatus', 'Asset Status')}</label>
          <div className="space-y-2">
            {statusTypes.map((status) => (
              <Checkbox
                key={status.id}
                label={status.label}
                checked={filters.status.includes(status.id)}
                onChange={(event) => handleStatusChange(status.id, event?.target?.checked)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">{t('maintenanceStatus', 'Maintenance Status')}</label>
          <div className="space-y-2">
            {maintenanceTypes.map((maintenance) => (
              <Checkbox
                key={maintenance.id}
                label={maintenance.label}
                checked={filters.maintenanceStatus.includes(maintenance.id)}
                onChange={(event) => handleMaintenanceChange(maintenance.id, event?.target?.checked)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">{t('valueRangeSAR', 'Value Range (SAR)')}</label>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder={t('minValue', 'Min Value')}
              value={filters.valueRange.min}
              onChange={(event) => handleFilterChange('valueRange', { ...filters.valueRange, min: event?.target?.value })}
            />
            <Input
              type="number"
              placeholder={t('maxValue', 'Max Value')}
              value={filters.valueRange.max}
              onChange={(event) => handleFilterChange('valueRange', { ...filters.valueRange, max: event?.target?.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <Button variant="outline" fullWidth iconName="RotateCcw" iconPosition="left" onClick={handleReset}>
          {t('resetFilters', 'Reset Filters')}
        </Button>
      </div>
    </div>
  );
};

export default AssetFilterPanel;
