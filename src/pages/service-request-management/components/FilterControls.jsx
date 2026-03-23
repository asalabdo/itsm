import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterControls = ({ onFiltersChange, onExport }) => {
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
    // Mock saved filters
    const mockSavedFilters = [
      { id: 1, name: 'High Priority Requests', filters: { priority: 'high', status: 'pending' } },
      { id: 2, name: 'Engineering Team', filters: { department: 'engineering' } },
      { id: 3, name: 'Urgent Approvals', filters: { status: 'pending_approval', priority: 'critical' } },
      { id: 4, name: 'Completed This Week', filters: { status: 'completed', dateRange: '7d' } }
    ];
    setSavedFilters(mockSavedFilters);
  }, []);

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'custom', label: 'Custom range' }
  ];

  const serviceTypeOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'onboarding', label: 'Employee Onboarding' },
    { value: 'equipment', label: 'Hardware Requests' },
    { value: 'software', label: 'Software Licenses' },
    { value: 'security', label: 'Access Requests' },
    { value: 'facilities', label: 'Facilities & Booking' },
    { value: 'support', label: 'IT Support' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'design', label: 'Design' },
    { value: 'operations', label: 'Operations' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
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
    { value: 'it-operations', label: 'IT Operations Team' },
    { value: 'security-team', label: 'Security Team' },
    { value: 'hr-team', label: 'HR Team' },
    { value: 'finance-team', label: 'Finance Team' },
    { value: 'facilities-team', label: 'Facilities Team' },
    { value: 'alex-rodriguez', label: 'Alex Rodriguez' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' }
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
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const newFilter = {
        id: Date.now(),
        name: filterName,
        filters: { ...filters }
      };
      setSavedFilters(prev => [...prev, newFilter]);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border operations-shadow">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-foreground">Service Request Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
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
            label="Service Type"
            options={serviceTypeOptions}
            value={filters?.serviceType}
            onChange={(value) => handleFilterChange('serviceType', value)}
          />
          
          <Select
            label="Department"
            options={departmentOptions}
            value={filters?.department}
            onChange={(value) => handleFilterChange('department', value)}
          />
          
          <Select
            label="Status"
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
          placeholder="Search requests by ID, service name, requester, or description..."
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
          <Button variant="ghost" size="sm" onClick={saveCurrentFilter}>
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

      {/* Export and Analytics */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Export filtered results for reporting and analytics
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log('Analytics dashboard')}
            >
              <Icon name="BarChart3" size={16} />
              <span className="ml-1">Analytics</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;