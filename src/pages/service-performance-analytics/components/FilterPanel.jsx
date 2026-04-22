import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { getErpDepartmentOptions, loadErpDepartmentDirectory } from '../../../services/organizationUnits';

const FilterPanel = ({ onFiltersChange, onExport, lastUpdated }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const isArabic = String(language || '').toLowerCase().startsWith('ar');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [erpDepartments, setErpDepartments] = useState([]);

  const timeRangeOptions = [
    { value: '7d', label: t('last7Days', 'Last 7 days') },
    { value: '30d', label: t('last30Days', 'Last 30 days') },
    { value: '90d', label: t('last90Days', 'Last 90 days') },
    { value: 'q1', label: t('q1', 'Q1 2024') },
    { value: 'q2', label: t('q2', 'Q2 2024') },
    { value: 'q3', label: t('q3', 'Q3 2024') },
    { value: 'yearly', label: t('yearly2024', 'Year 2024') },
  ];

  useEffect(() => {
    let mounted = true;
    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) setErpDepartments(Array.isArray(departments) ? departments : []);
      })
      .catch(() => {
        if (mounted) setErpDepartments([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const departmentOptions = useMemo(() => getErpDepartmentOptions(erpDepartments, t), [erpDepartments, t]);

  const serviceOptions = [
    { value: 'all', label: t('allServices', 'All Services') },
    { value: 'incident', label: t('incidentManagement', 'Incident Management') },
    { value: 'request', label: t('serviceRequests', 'Service Requests') },
    { value: 'change', label: t('changeManagement', 'Change Management') },
    { value: 'problem', label: t('problemManagement', 'Problem Management') },
    { value: 'asset', label: t('assetManagement', 'Asset Management') },
  ];

  const handleFilterChange = (type, value) => {
    const filters = {
      timeRange: type === 'timeRange' ? value : selectedTimeRange,
      department: type === 'department' ? value : selectedDepartment,
      service: type === 'service' ? value : selectedService,
      comparison: type === 'comparison' ? value : comparisonMode,
    };

    switch (type) {
      case 'timeRange':
        setSelectedTimeRange(value);
        break;
      case 'department':
        setSelectedDepartment(value);
        break;
      case 'service':
        setSelectedService(value);
        break;
      case 'comparison':
        setComparisonMode(value);
        break;
      default:
        break;
    }

    onFiltersChange(filters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 operations-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Select
            label={t('timeRange', 'Time Range')}
            options={timeRangeOptions}
            value={selectedTimeRange}
            onChange={(value) => handleFilterChange('timeRange', value)}
            className="w-full sm:w-48"
          />

          <Select
            label={t('department', 'Department')}
            options={departmentOptions}
            value={selectedDepartment}
            onChange={(value) => handleFilterChange('department', value)}
            className="w-full sm:w-48"
          />

          <Select
            label={t('serviceCategory', 'Service Category')}
            options={serviceOptions}
            value={selectedService}
            onChange={(value) => handleFilterChange('service', value)}
            className="w-full sm:w-48"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="comparison-mode"
              checked={comparisonMode}
              onChange={(e) => handleFilterChange('comparison', e?.target?.checked)}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="comparison-mode" className="text-sm font-medium text-foreground">
              {t('compareMode', 'Compare Mode')}
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onExport('pdf')} iconName="FileText" iconPosition="left">
              {t('exportPdf', 'Export PDF')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport('csv')} iconName="Download" iconPosition="left">
              {t('exportCsv', 'Export CSV')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('lastUpdated', 'Last updated')}: {lastUpdated ? new Date(lastUpdated).toLocaleString(isArabic ? 'ar-SA' : 'en-US') : '—'}
          </span>
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCw" size={14} />
            <span>{t('autoRefresh', 'Auto Refresh')}: {t('hourly', 'Hourly')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
