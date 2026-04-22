import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const FilterControls = ({ onFiltersChange, onExport, changeCount = 0 }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const [filters, setFilters] = useState({
    dateRange: '30d',
    changeType: 'all',
    environment: 'all',
    riskLevel: 'all',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    searchTerm: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);

  useEffect(() => {
    setSavedFilters([
      { id: 1, name: isArabic ? 'تغييرات ذات أولوية عالية' : 'High Priority Changes', filters: { priority: 'high', riskLevel: 'high' } },
      { id: 2, name: isArabic ? 'الإنتاج فقط' : 'Production Only', filters: { environment: 'production' } },
      { id: 3, name: isArabic ? 'تغييرات طارئة' : 'Emergency Changes', filters: { changeType: 'emergency', priority: 'critical' } }
    ]);
  }, [isArabic]);

  const dateRangeOptions = [
    { value: '7d', label: isArabic ? 'آخر 7 أيام' : 'Last 7 days' },
    { value: '30d', label: isArabic ? 'آخر 30 يومًا' : 'Last 30 days' },
    { value: '90d', label: isArabic ? 'آخر 90 يومًا' : 'Last 90 days' },
    { value: 'custom', label: isArabic ? 'نطاق مخصص' : 'Custom range' }
  ];

  const changeTypeOptions = [
    { value: 'all', label: isArabic ? 'كل الأنواع' : 'All Types' },
    { value: 'standard', label: isArabic ? 'اعتيادي' : 'Standard' },
    { value: 'emergency', label: isArabic ? 'طارئ' : 'Emergency' },
    { value: 'major', label: isArabic ? 'رئيسي' : 'Major' },
    { value: 'minor', label: isArabic ? 'ثانوي' : 'Minor' }
  ];

  const environmentOptions = [
    { value: 'all', label: isArabic ? 'كل البيئات' : 'All Environments' },
    { value: 'production', label: isArabic ? 'الإنتاج' : 'Production' },
    { value: 'staging', label: isArabic ? 'الاستعداد' : 'Staging' },
    { value: 'test', label: isArabic ? 'الاختبار' : 'Test' },
    { value: 'development', label: isArabic ? 'التطوير' : 'Development' }
  ];

  const riskLevelOptions = [
    { value: 'all', label: isArabic ? 'كل مستويات المخاطر' : 'All Risk Levels' },
    { value: 'low', label: isArabic ? 'منخفض' : 'Low Risk' },
    { value: 'medium', label: isArabic ? 'متوسط' : 'Medium Risk' },
    { value: 'high', label: isArabic ? 'مرتفع' : 'High Risk' },
    { value: 'critical', label: isArabic ? 'حرج' : 'Critical Risk' }
  ];

  const statusOptions = [
    { value: 'all', label: isArabic ? 'كل الحالات' : 'All Statuses' },
    { value: 'scheduled', label: isArabic ? 'مجدول' : 'Scheduled' },
    { value: 'in-progress', label: isArabic ? 'قيد التنفيذ' : 'In Progress' },
    { value: 'completed', label: isArabic ? 'مكتمل' : 'Completed' },
    { value: 'failed', label: isArabic ? 'فشل' : 'Failed' },
    { value: 'cancelled', label: isArabic ? 'ملغي' : 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'all', label: isArabic ? 'كل الأولويات' : 'All Priorities' },
    { value: 'low', label: isArabic ? 'منخفضة' : 'Low' },
    { value: 'medium', label: isArabic ? 'متوسطة' : 'Medium' },
    { value: 'high', label: isArabic ? 'عالية' : 'High' },
    { value: 'critical', label: isArabic ? 'حرجة' : 'Critical' }
  ];

  const assigneeOptions = [
    { value: 'all', label: isArabic ? 'كل الفرق' : 'All Assignees' },
    { value: 'database-team', label: isArabic ? 'فريق قواعد البيانات' : 'Database Team' },
    { value: 'security-team', label: isArabic ? 'فريق الأمن' : 'Security Team' },
    { value: 'development-team', label: isArabic ? 'فريق التطوير' : 'Development Team' },
    { value: 'network-team', label: isArabic ? 'فريق الشبكات' : 'Network Team' },
    { value: 'platform-team', label: isArabic ? 'فريق المنصة' : 'Platform Team' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSearchChange = (e) => {
    handleFilterChange('searchTerm', e?.target?.value);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '30d',
      changeType: 'all',
      environment: 'all',
      riskLevel: 'all',
      status: 'all',
      priority: 'all',
      assignee: 'all',
      searchTerm: ''
    };
    setFilters(defaultFilters);
    onFiltersChange?.(defaultFilters);
  };

  const applySavedFilter = (savedFilter) => {
    const newFilters = { ...filters, ...savedFilter?.filters };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const getActiveFilterCount = () => Object.entries(filters).filter(([key, value]) => key !== 'dateRange' && value !== 'all' && value !== '').length;

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-foreground">{isArabic ? 'الفلاتر' : 'Filters'}</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()} {isArabic ? 'نشطة' : 'active'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            <span className="ml-1">{isExpanded ? (isArabic ? 'أقل' : 'Less') : (isArabic ? 'المزيد' : 'More')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters} disabled={getActiveFilterCount() === 0}>
            <Icon name="RotateCcw" size={16} />
            <span className="ml-1">{isArabic ? 'إعادة تعيين' : 'Reset'}</span>
          </Button>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select label={isArabic ? 'النطاق الزمني' : 'Date Range'} options={dateRangeOptions} value={filters?.dateRange} onChange={(value) => handleFilterChange('dateRange', value)} />
          <Select label={isArabic ? 'نوع التغيير' : 'Change Type'} options={changeTypeOptions} value={filters?.changeType} onChange={(value) => handleFilterChange('changeType', value)} />
          <Select label={isArabic ? 'البيئة' : 'Environment'} options={environmentOptions} value={filters?.environment} onChange={(value) => handleFilterChange('environment', value)} />
          <Select label={isArabic ? 'مستوى المخاطر' : 'Risk Level'} options={riskLevelOptions} value={filters?.riskLevel} onChange={(value) => handleFilterChange('riskLevel', value)} />
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <Input
          type="search"
          placeholder={isArabic ? 'ابحث عن التغييرات بالعنوان أو المعرف أو الوصف...' : 'Search changes by title, ID, or description...'}
          value={filters?.searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {isExpanded && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label={isArabic ? 'الحالة' : 'Status'} options={statusOptions} value={filters?.status} onChange={(value) => handleFilterChange('status', value)} />
            <Select label={isArabic ? 'الأولوية' : 'Priority'} options={priorityOptions} value={filters?.priority} onChange={(value) => handleFilterChange('priority', value)} />
            <Select label={isArabic ? 'المسند إليه' : 'Assignee'} options={assigneeOptions} value={filters?.assignee} onChange={(value) => handleFilterChange('assignee', value)} />
          </div>
        </div>
      )}

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">{isArabic ? 'فلاتر سريعة' : 'Quick Filters'}</h4>
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
            <span className="ml-1">{isArabic ? 'حفظ الحالي' : 'Save Current'}</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {savedFilters?.map((savedFilter) => (
            <Button key={savedFilter?.id} variant="outline" size="sm" onClick={() => applySavedFilter(savedFilter)} className="text-xs">
              {savedFilter?.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isArabic ? 'تصدير النتائج المصفاة للامتثال والتقارير' : 'Export filtered results for compliance and reporting'}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onExport?.('pdf')}>
              <Icon name="FileText" size={16} />
              <span className="ml-1">PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
              <Icon name="FileSpreadsheet" size={16} />
              <span className="ml-1">Excel</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport?.('csv')}>
              <Icon name="Download" size={16} />
              <span className="ml-1">CSV</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 text-xs text-muted-foreground">
        {isArabic ? 'العدد المباشر للتغييرات' : 'Live change count'}: {changeCount}
      </div>
    </div>
  );
};

export default FilterControls;
