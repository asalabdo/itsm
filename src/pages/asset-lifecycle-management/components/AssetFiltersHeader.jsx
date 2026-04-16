import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AssetFiltersHeader = ({ onFiltersChange, alertCount = 0 }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categoryOptions = [
    { value: 'all', label: t('allCategories', 'All Categories') },
    { value: 'hardware', label: t('hardware', 'Hardware') },
    { value: 'software', label: t('software', 'Software') },
    { value: 'network', label: t('networkEquipment', 'Network Equipment') },
    { value: 'mobile', label: t('mobileDevices', 'Mobile Devices') },
    { value: 'peripherals', label: t('peripherals', 'Peripherals') }
  ];

  const locationOptions = [
    { value: 'all', label: t('allLocations', 'All Locations') },
    { value: 'datacenter-a', label: t('dataCenterA', 'Data Center A') },
    { value: 'datacenter-b', label: t('dataCenterB', 'Data Center B') },
    { value: 'building-a', label: t('buildingA', 'Building A') },
    { value: 'building-b', label: t('buildingB', 'Building B') },
    { value: 'remote', label: t('remoteLocations', 'Remote Locations') }
  ];

  const stageOptions = [
    { value: 'all', label: t('allStages', 'All Stages') },
    { value: 'procurement', label: t('procurement', 'Procurement') },
    { value: 'deployment', label: t('deployment', 'Deployment') },
    { value: 'active', label: t('active', 'Active') },
    { value: 'maintenance', label: t('maintenance', 'Maintenance') },
    { value: 'retirement', label: t('retirement', 'Retirement') }
  ];

  const handleFilterChange = () => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      stage: selectedStage
    };
    
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedStage('all');
    setShowAdvancedFilters(false);
    
    if (onFiltersChange) {
      onFiltersChange({
        search: '',
        category: 'all',
        location: 'all',
        stage: 'all'
      });
    }
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [searchTerm, selectedCategory, selectedLocation, selectedStage]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="ابحث عن الأصول بالاسم أو المعرف أو الوصف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-40"
          />

          <Select
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            className="w-40"
          />

          <Select
            options={stageOptions}
            value={selectedStage}
            onChange={setSelectedStage}
            className="w-40"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName={showAdvancedFilters ? "ChevronUp" : "ChevronDown"}
          >
            متقدم
          </Button>
        </div>
      </div>
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">المورّد</label>
              <Select
                options={[
                  { value: 'all', label: 'كل المورّدين' },
                  { value: 'dell', label: 'Dell Technologies' },
                  { value: 'hp', label: 'HP Enterprise' },
                  { value: 'cisco', label: 'Cisco Systems' },
                  { value: 'microsoft', label: 'Microsoft' },
                  { value: 'vmware', label: 'VMware' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">تاريخ الشراء</label>
              <Select
                options={[
                  { value: 'all', label: 'كل التواريخ' },
                  { value: 'last-30', label: 'آخر 30 يومًا' },
                  { value: 'last-90', label: 'آخر 90 يومًا' },
                  { value: 'last-year', label: 'أقدم من سنة' },
                  { value: 'older', label: 'أقدم من سنة' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">حالة الضمان</label>
              <Select
                options={[
                  { value: 'all', label: 'كل الحالات' },
                  { value: 'active', label: 'ضمان ساري' },
                  { value: 'expiring', label: 'ينتهي قريبًا' },
                  { value: 'expired', label: 'منتهي' },
                  { value: 'none', label: 'لا يوجد ضمان' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نطاق التكلفة</label>
              <Select
                options={[
                  { value: 'all', label: 'كل النطاقات' },
                  { value: '0-1000', label: '$0 - $1,000' },
                  { value: '1000-5000', label: '$1,000 - $5,000' },
                  { value: '5000-10000', label: '$5,000 - $10,000' },
                  { value: '10000+', label: '$10,000+' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" iconName="Save">
                حفظ مجموعة الفلاتر
              </Button>
              <Button variant="ghost" size="sm" iconName="Upload">
                تحميل الفلاتر المحفوظة
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              مسح كل الفلاتر
            </Button>
          </div>
        </div>
      )}
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          {/* Alert Counter */}
          {alertCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-error/10 border border-error/20 rounded-lg">
              <Icon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-sm font-medium text-error">
                {alertCount} تنبيه حرج{alertCount > 1 ? 'ات' : ''}
              </span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            عرض الأصول المطابقة للفلاتر الحالية
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Download">
            تصدير
          </Button>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            تحديث
          </Button>
          <Button variant="default" size="sm" iconName="Plus">
            إضافة أصل
          </Button>
        </div>
      </div>
      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {searchTerm && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <Icon name="Search" size={14} className="text-primary" />
            <span className="text-sm text-primary">Search: {searchTerm}</span>
            <button onClick={() => setSearchTerm('')} className="text-primary hover:text-primary/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
        
        {selectedCategory !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
            <Icon name="Tag" size={14} className="text-secondary" />
            <span className="text-sm text-secondary">
              Category: {categoryOptions?.find(opt => opt?.value === selectedCategory)?.label}
            </span>
            <button onClick={() => setSelectedCategory('all')} className="text-secondary hover:text-secondary/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {selectedLocation !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
            <Icon name="MapPin" size={14} className="text-accent" />
            <span className="text-sm text-accent">
              Location: {locationOptions?.find(opt => opt?.value === selectedLocation)?.label}
            </span>
            <button onClick={() => setSelectedLocation('all')} className="text-accent hover:text-accent/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {selectedStage !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
            <Icon name="Activity" size={14} className="text-success" />
            <span className="text-sm text-success">
              Stage: {stageOptions?.find(opt => opt?.value === selectedStage)?.label}
            </span>
            <button onClick={() => setSelectedStage('all')} className="text-success hover:text-success/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetFiltersHeader;
