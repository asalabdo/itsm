import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'it', label: 'Information Technology' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const requestTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'purchase', label: 'Purchase Request' },
    { value: 'travel', label: 'Travel Authorization' },
    { value: 'budget', label: 'Budget Reallocation' },
    { value: 'hiring', label: 'Hiring Request' },
    { value: 'equipment', label: 'Equipment Procurement' }
  ];

  const urgencyOptions = [
    { value: 'all', label: 'All Urgency Levels' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' }
  ];

  const agingOptions = [
    { value: 'all', label: 'All Ages' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'overdue', label: 'Overdue' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} />
          Advanced Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={onClearFilters}
        >
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label="Department"
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => onFilterChange('department', value)}
        />

        <Select
          label="Request Type"
          options={requestTypeOptions}
          value={filters?.requestType}
          onChange={(value) => onFilterChange('requestType', value)}
        />

        <Select
          label="Urgency"
          options={urgencyOptions}
          value={filters?.urgency}
          onChange={(value) => onFilterChange('urgency', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label="Age"
          options={agingOptions}
          value={filters?.aging}
          onChange={(value) => onFilterChange('aging', value)}
        />

        <Input
          label="Min Value ($)"
          type="number"
          placeholder="0"
          value={filters?.minValue}
          onChange={(e) => onFilterChange('minValue', e?.target?.value)}
        />

        <Input
          label="Max Value ($)"
          type="number"
          placeholder="100000"
          value={filters?.maxValue}
          onChange={(e) => onFilterChange('maxValue', e?.target?.value)}
        />

        <Input
          label="Requester"
          type="text"
          placeholder="Search by name"
          value={filters?.requester}
          onChange={(e) => onFilterChange('requester', e?.target?.value)}
        />

        <Input
          label="Request ID"
          type="text"
          placeholder="APR-XXXX"
          value={filters?.requestId}
          onChange={(e) => onFilterChange('requestId', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;