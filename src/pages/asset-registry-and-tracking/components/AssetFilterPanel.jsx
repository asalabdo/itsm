import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AssetFilterPanel = ({ onFilterChange, isCollapsed, onToggleCollapse }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    location: '',
    status: [],
    ownershipType: '',
    valueRange: { min: '', max: '' },
    maintenanceStatus: []
  });

  const categoryOptions = [
    { value: '', label: t('allCategories', 'All Categories') },
    { value: 'computers', label: language === 'ar' ? 'أجهزة الكمبيوتر والحواسيب المحمولة' : 'Computers & Laptops' },
    { value: 'furniture', label: language === 'ar' ? 'أثاث المكاتب' : 'Office Furniture' },
    { value: 'equipment', label: language === 'ar' ? 'معدات وآلات' : 'Equipment & Machinery' },
    { value: 'vehicles', label: language === 'ar' ? 'مركبات ونقل' : 'Vehicles' },
    { value: 'software', label: language === 'ar' ? 'تراخيص البرمجيات' : 'Software Licenses' },
    { value: 'mobile', label: language === 'ar' ? 'الأجهزة المحمولة' : 'Mobile Devices' },
    { value: 'networking', label: language === 'ar' ? 'معدات الشبكات' : 'Networking Equipment' }
  ];

  const locationOptions = [
    { value: '', label: t('allLocations', 'All Locations') },
    { value: 'hq-floor1', label: language === 'ar' ? 'المقر - الطابق 1' : 'HQ - Floor 1' },
    { value: 'hq-floor2', label: language === 'ar' ? 'المقر - الطابق 2' : 'HQ - Floor 2' },
    { value: 'hq-floor3', label: language === 'ar' ? 'المقر - الطابق 3' : 'HQ - Floor 3' },
    { value: 'warehouse-a', label: language === 'ar' ? 'المستودع A' : 'Warehouse A' },
    { value: 'warehouse-b', label: language === 'ar' ? 'المستودع B' : 'Warehouse B' },
    { value: 'remote', label: language === 'ar' ? 'عن بُعد/ميداني' : 'Remote/Field' },
    { value: 'branch-ny', label: language === 'ar' ? 'فرع نيويورك' : 'NY Branch' },
    { value: 'branch-la', label: language === 'ar' ? 'فرع لوس أنجلوس' : 'LA Branch' }
  ];

  const ownershipOptions = [
    { value: '', label: t('allOwnershipTypes', 'All Ownership Types') },
    { value: 'owned', label: language === 'ar' ? 'مملوك للشركة' : 'Company Owned' },
    { value: 'leased', label: language === 'ar' ? 'مؤجر' : 'Leased' },
    { value: 'rented', label: language === 'ar' ? 'مستأجر' : 'Rented' },
    { value: 'borrowed', label: language === 'ar' ? 'مستعار' : 'Borrowed' }
  ];

  const statusTypes = [
    { id: 'active', label: 'نشط' },
    { id: 'inactive', label: 'غير نشط' },
    { id: 'maintenance', label: 'تحت الصيانة' },
    { id: 'retired', label: 'متقاعد' },
    { id: 'lost', label: 'مفقود/ضائع' }
  ];

  const maintenanceTypes = [
    { id: 'due', label: 'الصيانة المستحقة' },
    { id: 'overdue', label: 'الصيانة المتأخرة' },
    { id: 'scheduled', label: 'مجدولة' },
    { id: 'completed', label: 'مكتملة حديثًا' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (statusId, checked) => {
    const newStatus = checked
      ? [...filters?.status, statusId]
      : filters?.status?.filter(s => s !== statusId);
    handleFilterChange('status', newStatus);
  };

  const handleMaintenanceChange = (maintenanceId, checked) => {
    const newMaintenance = checked
      ? [...filters?.maintenanceStatus, maintenanceId]
      : filters?.maintenanceStatus?.filter(m => m !== maintenanceId);
    handleFilterChange('maintenanceStatus', newMaintenance);
  };

  const handleReset = () => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      location: '',
      status: [],
      ownershipType: '',
      valueRange: { min: '', max: '' },
      maintenanceStatus: []
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
          aria-label="توسيع الفلاتر"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">الفلاتر</h2>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring lg:block hidden"
          aria-label="طي الفلاتر"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
        <div>
          <Input
            type="search"
            placeholder={t('searchByIdNameSerial', 'Search by ID, name or serial...')}
            value={filters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
            className="w-full"
          />
        </div>

        <div>
          <Select
            label={t('category', 'Category')}
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>

        <div>
          <Select
            label={t('location', 'Location')}
            options={locationOptions}
            value={filters?.location}
            onChange={(value) => handleFilterChange('location', value)}
            searchable
          />
        </div>

        <div>
          <Select
            label={t('ownershipType', 'Ownership Type')}
            options={ownershipOptions}
            value={filters?.ownershipType}
            onChange={(value) => handleFilterChange('ownershipType', value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">{t('assetStatus', 'Asset Status')}</label>
          <div className="space-y-2">
            {statusTypes?.map((status) => (
              <Checkbox
                key={status?.id}
                label={status?.label}
                checked={filters?.status?.includes(status?.id)}
                onChange={(e) => handleStatusChange(status?.id, e?.target?.checked)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">{t('maintenanceStatus', 'Maintenance Status')}</label>
          <div className="space-y-2">
            {maintenanceTypes?.map((maintenance) => (
              <Checkbox
                key={maintenance?.id}
                label={maintenance?.label}
                checked={filters?.maintenanceStatus?.includes(maintenance?.id)}
                onChange={(e) => handleMaintenanceChange(maintenance?.id, e?.target?.checked)}
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
              value={filters?.valueRange?.min}
              onChange={(e) => handleFilterChange('valueRange', { ...filters?.valueRange, min: e?.target?.value })}
            />
            <Input
              type="number"
              placeholder={t('maxValue', 'Max Value')}
              value={filters?.valueRange?.max}
              onChange={(e) => handleFilterChange('valueRange', { ...filters?.valueRange, max: e?.target?.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          iconName="RotateCcw"
          iconPosition="left"
          onClick={handleReset}
        >
          إعادة ضبط الفلاتر
        </Button>
      </div>
    </div>
  );
};

export default AssetFilterPanel;
