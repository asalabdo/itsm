import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const FilterPanel = ({ onApplyFilters, onResetFilters }) => {
  const [dateRange, setDateRange] = useState('last30days');
  const [department, setDepartment] = useState('all');
  const [ticketType, setTicketType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'billing', label: 'Billing' },
    { value: 'sales', label: 'Sales' },
    { value: 'general', label: 'General Inquiry' },
  ];

  const ticketTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'incident', label: 'Incident' },
    { value: 'problem', label: 'Problem' },
    { value: 'change', label: 'Change Request' },
    { value: 'service', label: 'Service Request' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const handleApply = () => {
    const filters = {
      dateRange,
      department,
      ticketType,
      priority,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null,
    };
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setDateRange('last30days');
    setDepartment('all');
    setTicketType('all');
    setPriority('all');
    setStartDate('');
    setEndDate('');
    onResetFilters();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" iconName="RotateCcw" onClick={handleReset}>
          Reset
        </Button>
      </div>
      <div className="space-y-4">
        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
        />

        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e?.target?.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e?.target?.value)}
            />
          </div>
        )}

        <Select
          label="Department"
          options={departmentOptions}
          value={department}
          onChange={setDepartment}
        />

        <Select
          label="Ticket Type"
          options={ticketTypeOptions}
          value={ticketType}
          onChange={setTicketType}
        />

        <Select
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={setPriority}
        />

        <Button variant="default" fullWidth onClick={handleApply} iconName="Check">
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;