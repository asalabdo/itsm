import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const AssetFilterPanel = ({ onFilterChange, isCollapsed, onToggleCollapse }) => {
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
    { value: '', label: 'كل الفئات' },
    { value: 'computers', label: 'أجهزة الكمبيوتر والحواسيب المحمولة' },
    { value: 'furniture', label: 'أثاث المكاتب' },
    { value: 'equipment', label: 'معدات وآلات' },
    { value: 'vehicles', label: 'مركبات ونقل' },
    { value: 'software', label: 'تراخيص البرمجيات' },
    { value: 'mobile', label: 'الأجهزة المحمولة' },
    { value: 'networking', label: 'معدات الشبكات' }
  ];

  const locationOptions = [
    { value: '', label: 'كل المواقع' },
    { value: 'hq-floor1', label: 'المقر - الطابق 1' },
    { value: 'hq-floor2', label: 'المقر - الطابق 2' },
    { value: 'hq-floor3', label: 'المقر - الطابق 3' },
    { value: 'warehouse-a', label: 'المستودع A' },
    { value: 'warehouse-b', label: 'المستودع B' },
    { value: 'remote', label: 'عن بُعد/ميداني' },
    { value: 'branch-ny', label: 'فرع نيويورك' },
    { value: 'branch-la', label: 'فرع لوس أنجلوس' }
  ];

  const ownershipOptions = [
    { value: '', label: 'كل أنواع الملكية' },
    { value: 'owned', label: 'مملوك للشركة' },
    { value: 'leased', label: 'مؤجر' },
    { value: 'rented', label: 'مستأجر' },
    { value: 'borrowed', label: 'مستعار' }
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
            placeholder="ابحث بالمعرف أو الاسم أو الرقم التسلسلي..."
            value={filters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
            className="w-full"
          />
        </div>

        <div>
          <Select
            label="الفئة"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>

        <div>
          <Select
            label="الموقع"
            options={locationOptions}
            value={filters?.location}
            onChange={(value) => handleFilterChange('location', value)}
            searchable
          />
        </div>

        <div>
          <Select
            label="نوع الملكية"
            options={ownershipOptions}
            value={filters?.ownershipType}
            onChange={(value) => handleFilterChange('ownershipType', value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">حالة الأصل</label>
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
          <label className="text-sm font-medium mb-3 block">حالة الصيانة</label>
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
          <label className="text-sm font-medium mb-3 block">نطاق القيمة (ريال)</label>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="القيمة الدنيا"
              value={filters?.valueRange?.min}
              onChange={(e) => handleFilterChange('valueRange', { ...filters?.valueRange, min: e?.target?.value })}
            />
            <Input
              type="number"
              placeholder="القيمة العليا"
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
