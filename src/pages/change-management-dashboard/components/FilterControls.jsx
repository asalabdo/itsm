import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFiltersChange, onExport }) => {
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
    // Mock saved filters
    const mockSavedFilters = [
      { id: 1, name: 'High Priority Changes', filters: { priority: 'high', riskLevel: 'high' } },
      { id: 2, name: 'Production Only', filters: { environment: 'production' } },
      { id: 3, name: 'Emergency Changes', filters: { changeType: 'emergency', priority: 'critical' } }
    ];
    setSavedFilters(mockSavedFilters);
  }, []);

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const changeTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'standard', label: 'Standard' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' }
  ];

  const environmentOptions = [
    { value: 'all', label: 'All Environments' },
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'test', label: 'Test' },
    { value: 'development', label: 'Development' }
  ];

  const riskLevelOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' },
    { value: 'critical', label: 'Critical Risk' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'database-team', label: 'Database Team' },
    { value: 'security-team', label: 'Security Team' },
    { value: 'development-team', label: 'Development Team' },
    { value: 'network-team', label: 'Network Team' },
    { value: 'platform-team', label: 'Platform Team' }
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
          <h3 className="font-medium text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()} active
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
            <span className="ml-1">{isExpanded ? 'Less' : 'More'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            disabled={getActiveFilterCount() === 0}
          >
            <Icon name="RotateCcw" size={16} />
            <span className="ml-1">Reset</span>
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={filters?.dateRange}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label="Change Type"
            options={changeTypeOptions}
            value={filters?.changeType}
            onChange={(value) => handleFilterChange('changeType', value)}
          />
          
          <Select
            label="Environment"
            options={environmentOptions}
            value={filters?.environment}
            onChange={(value) => handleFilterChange('environment', value)}
          />
          
          <Select
            label="Risk Level"
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
          placeholder="Search changes by title, ID, or description..."
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
              label="Status"
              options={statusOptions}
              value={filters?.status}
              onChange={(value) => handleFilterChange('status', value)}
            />
            
            <Select
              label="Priority"
              options={priorityOptions}
              value={filters?.priority}
              onChange={(value) => handleFilterChange('priority', value)}
            />
            
            <Select
              label="Assignee"
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
          <h4 className="text-sm font-medium text-foreground">Quick Filters</h4>
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
            <span className="ml-1">Save Current</span>
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
            Export filtered results for compliance and reporting
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
    </div>
  );
};

export default FilterControls;