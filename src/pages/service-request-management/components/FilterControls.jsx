import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const FilterControls = ({ onFiltersChange, onExport, filterOptions = {} }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    serviceType: 'all',
    department: 'all',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    searchTerm: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('itsm_saved_filters');
      if (saved) {
        setSavedFilters(JSON.parse(saved));
      } else {
        setSavedFilters([]);
      }
    } catch (e) {
      console.error('Failed to load saved filters', e);
      setSavedFilters([]);
    }
  }, []);

  const dateRangeOptions = [
    { value: '7d', label: t('last7Days', 'Last 7 days') },
    { value: '30d', label: t('last30Days', 'Last 30 days') },
    { value: '90d', label: t('last90Days', 'Last 90 days') },
    { value: 'custom', label: t('customRange', 'Custom range') }
  ];

  const serviceTypeOptions = filterOptions?.serviceTypeOptions || [{ value: 'all', label: t('allServices', 'All Services') }];
  const departmentOptions = filterOptions?.departmentOptions || [{ value: 'all', label: t('allDepartments', 'All Departments') }];
  const statusOptions = filterOptions?.statusOptions || [{ value: 'all', label: t('allStatuses', 'All Statuses') }];
  const priorityOptions = filterOptions?.priorityOptions || [{ value: 'all', label: t('allPriorities', 'All Priorities') }];
  const assigneeOptions = filterOptions?.assigneeOptions || [{ value: 'all', label: t('allAssignees', 'All Assignees') }];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSearchChange = (e) => {
    const searchTerm = e?.target?.value;
    handleFilterChange('searchTerm', searchTerm);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: '30d',
      serviceType: 'all',
      department: 'all',
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

  const getActiveFilterCount = () => {
    return Object.entries(filters)?.filter(([key, value]) =>
      key !== 'dateRange' && value !== 'all' && value !== ''
    )?.length;
  };

  const saveCurrentFilter = () => {
    const filterName = prompt(t('enterFilterName', 'Enter a name for this filter:'));
    if (filterName) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        filters: { ...filters }
      };
      setSavedFilters(prev => {
        const updated = [...prev, newFilter];
        localStorage.setItem('itsm_saved_filters', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-foreground">{t('serviceRequestFilters', 'Service Request Filters')}</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()} {t('active', 'active')}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            <span className="ms-1">{isExpanded ? t('less', 'Less') : t('more', 'More')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={getActiveFilterCount() === 0}
          >
            <Icon name="RotateCcw" size={16} />
            <span className="ms-1">{t('reset', 'Reset')}</span>
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label={t('dateRange', 'Date Range')}
            options={dateRangeOptions}
            value={filters?.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label={t('serviceType', 'Service Type')}
            options={serviceTypeOptions}
            value={filters?.serviceType}
            onChange={(value) => handleFilterChange('serviceType', value)}
          />
          
          <Select
            label={t('department', 'Department')}
            options={departmentOptions}
            value={filters?.department}
            onChange={(value) => handleFilterChange('department', value)}
          />
          
          <Select
            label={t('status', 'Status')}
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <Input
          type="search"
          placeholder={t('searchRequestsById', 'Search requests by ID, service name, requester, or description...')}
          value={filters?.searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('priority', 'Priority')}
              options={priorityOptions}
              value={filters?.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            />
            
            <Select
              label={t('assignee', 'Assignee')}
              options={assigneeOptions}
              value={filters?.assignee}
              onChange={(value) => handleFilterChange('assignee', value)}
            />
          </div>
        </div>
      )}

      {/* Saved Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">{t('quickFilters', 'Quick Filters')}</h4>
          <Button variant="ghost" size="sm" onClick={saveCurrentFilter}>
            <Icon name="Plus" size={14} />
            <span className="ms-1">{t('saveCurrent', 'Save Current')}</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {savedFilters?.map(savedFilter => (
            <Button
              key={savedFilter?.id}
              variant="outline"
              size="sm"
              onClick={() => applySavedFilter(savedFilter)}
              className="text-xs"
            >
              {savedFilter?.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Export and Analytics */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('exportFilteredResults', 'Export filtered results for reporting and analytics')}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
            >
              <Icon name="FileText" size={16} />
              <span className="ms-1">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('excel')}
            >
              <Icon name="FileSpreadsheet" size={16} />
              <span className="ms-1">Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
            >
              <Icon name="Download" size={16} />
              <span className="ms-1">CSV</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/reports-analytics')}
            >
              <Icon name="BarChart3" size={16} />
              <span className="ms-1">{t('analytics', 'Analytics')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
