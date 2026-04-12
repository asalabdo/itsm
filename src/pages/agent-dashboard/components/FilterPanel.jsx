import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'incident', label: 'Incident' },
    { value: 'problem', label: 'Problem' },
    { value: 'change', label: 'Change Request' },
    { value: 'service', label: 'Service Request' }
  ];

  const slaOptions = [
    { value: 'all', label: 'All SLA Status' },
    { value: 'breached', label: 'Breached' },
    { value: 'critical', label: 'Critical (&lt;1h)' },
    { value: 'warning', label: 'Warning (&lt;4h)' },
    { value: 'safe', label: 'Safe (&gt;4h)' }
  ];

  const hasActiveFilters = filters?.priority !== 'all' || filters?.status !== 'all' || filters?.category !== 'all' || filters?.sla !== 'all';

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Select
          label="Priority"
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => onFilterChange('category', value)}
        />

        <Select
          label="SLA Status"
          options={slaOptions}
          value={filters?.sla}
          onChange={(value) => onFilterChange('sla', value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;