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
      { id: 1, name: t('highPriorityChanges', 'High Priority Changes'), filters: { priority: 'high', riskLevel: 'high' } },
      { id: 2, name: t('productionOnly', 'Production Only'), filters: { environment: 'production' } },
      { id: 3, name: t('emergencyChanges', 'Emergency Changes'), filters: { changeType: 'emergency', priority: 'critical' } }
    ]);
  }, [t]);

  const dateRangeOptions = [
    { value: '7d', label: t('last7Days', 'Last 7 days') },
    { value: '30d', label: t('last30Days', 'Last 30 days') },
    { value: '90d', label: t('last90Days', 'Last 90 days') },
    { value: 'custom', label: t('customRange', 'Custom range') }
  ];

  const changeTypeOptions = [
    { value: 'all', label: t('allTypes', 'All Types') },
    { value: 'standard', label: t('standard', 'Standard') },
    { value: 'emergency', label: t('emergency', 'Emergency') },
    { value: 'major', label: t('major', 'Major') },
    { value: 'minor', label: t('minor', 'Minor') }
  ];

  const environmentOptions = [
    { value: 'all', label: t('allEnvironments', 'All Environments') },
    { value: 'production', label: t('production', 'Production') },
    { value: 'staging', label: t('staging', 'Staging') },
    { value: 'test', label: t('test', 'Test') },
    { value: 'development', label: t('development', 'Development') }
  ];

  const riskLevelOptions = [
    { value: 'all', label: t('allRiskLevels', 'All Risk Levels') },
    { value: 'low', label: t('lowRisk', 'Low Risk') },
    { value: 'medium', label: t('mediumRisk', 'Medium Risk') },
    { value: 'high', label: t('highRisk', 'High Risk') },
    { value: 'critical', label: t('criticalRisk', 'Critical Risk') }
  ];

  const statusOptions = [
    { value: 'all', label: t('allStatuses', 'All Statuses') },
    { value: 'scheduled', label: t('scheduled', 'Scheduled') },
    { value: 'in-progress', label: t('inProgress', 'In Progress') },
    { value: 'completed', label: t('completed', 'Completed') },
    { value: 'failed', label: t('failed', 'Failed') },
    { value: 'cancelled', label: t('cancelled', 'Cancelled') }
  ];

  const priorityOptions = [
    { value: 'all', label: t('allPriorities', 'All Priorities') },
    { value: 'low', label: t('low', 'Low') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'high', label: t('high', 'High') },
    { value: 'critical', label: t('critical', 'Critical') }
  ];

  const assigneeOptions = [
    { value: 'all', label: t('allAssignees', 'All Assignees') },
    { value: 'database-team', label: t('databaseTeam', 'Database Team') },
    { value: 'security-team', label: t('securityTeam', 'Security Team') },
    { value: 'development-team', label: t('developmentTeam', 'Development Team') },
    { value: 'network-team', label: t('networkTeam', 'Network Team') },
    { value: 'platform-team', label: t('platformTeam', 'Platform Team') }
  ];

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

  const getActiveFilterCount = () => {
    return Object.entries(filters)?.filter(([key, value]) => 
      key !== 'dateRange' && value !== 'all' && value !== ''
    )?.length;
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-foreground">{t('filters', 'Filters')}</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
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
            <span className="ml-1">{isExpanded ? t('less', 'Less') : t('more', 'More')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={getActiveFilterCount() === 0}
          >
            <Icon name="RotateCcw" size={16} />
            <span className="ml-1">{t('resetFilters', 'Reset')}</span>
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
          label={t('changeType', 'Change Type')}
            options={changeTypeOptions}
            value={filters?.changeType}
            onChange={(value) => handleFilterChange('changeType', value)}
          />
          
          <Select
          label={t('environment', 'Environment')}
            options={environmentOptions}
            value={filters?.environment}
            onChange={(value) => handleFilterChange('environment', value)}
          />
          
          <Select
          label={t('riskLevel', 'Risk Level')}
            options={riskLevelOptions}
            value={filters?.riskLevel}
            onChange={(value) => handleFilterChange('riskLevel', value)}
          />
        </div>
      </div>
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <Input
          type="search"
          placeholder={t('searchChanges', 'Search changes by title, ID, or description...')}
          value={filters?.searchTerm}
          onChange={handleSearchChange}
          className="w-full"
        />
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={t('status', 'Status')}
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
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
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
            <span className="ml-1">{t('saveCurrent', 'Save Current')}</span>
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
      {/* Export Options */}
      <div className="p-4">
        <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('exportResults', 'Export filtered results for compliance and reporting')}
        </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
            >
              <Icon name="FileText" size={16} />
              <span className="ml-1">PDF</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('excel')}
            >
              <Icon name="FileSpreadsheet" size={16} />
              <span className="ml-1">Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('csv')}
            >
              <Icon name="Download" size={16} />
              <span className="ml-1">CSV</span>
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-xs text-muted-foreground">
        {t('liveChangeCount', 'Live change count')}: {changeCount}
      </div>
    </div>
  );
};

export default FilterControls;
