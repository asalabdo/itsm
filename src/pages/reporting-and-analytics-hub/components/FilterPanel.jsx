import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const getTodayDate = () => new Date();

const formatDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FilterPanel = ({ onApplyFilters, onResetFilters }) => {
  const [dateRange, setDateRange] = useState('last-30-days');
  const [startDate, setStartDate] = useState(() => {
    const start = getTodayDate();
    start.setDate(start.getDate() - 29);
    return formatDateInputValue(start);
  });
  const [endDate, setEndDate] = useState(() => formatDateInputValue(getTodayDate()));
  const [selectedDepartments, setSelectedDepartments] = useState(['all']);
  const [selectedMetrics, setSelectedMetrics] = useState(['tickets', 'assets', 'workflows']);
  const [dataGranularity, setDataGranularity] = useState('daily');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last-7-days', label: 'Last 7 Days' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-90-days', label: 'Last 90 Days' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'this-year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'it', label: 'IT Department' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const granularityOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const metricCategories = [
    { id: 'tickets', label: 'Ticket Metrics', checked: selectedMetrics?.includes('tickets') },
    { id: 'assets', label: 'Asset Metrics', checked: selectedMetrics?.includes('assets') },
    { id: 'workflows', label: 'Workflow Metrics', checked: selectedMetrics?.includes('workflows') },
    { id: 'approvals', label: 'Approval Metrics', checked: selectedMetrics?.includes('approvals') },
    { id: 'performance', label: 'Performance Metrics', checked: selectedMetrics?.includes('performance') }
  ];

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev =>
      prev?.includes(metricId)
        ? prev?.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleApplyFilters = () => {
    onApplyFilters({
      dateRange,
      startDate,
      endDate,
      departments: selectedDepartments,
      metrics: selectedMetrics,
      granularity: dataGranularity
    });
  };

  const handleReset = () => {
    setDateRange('last-30-days');
    const start = getTodayDate();
    start.setDate(start.getDate() - 29);
    setStartDate(formatDateInputValue(start));
    setEndDate(formatDateInputValue(getTodayDate()));
    setSelectedDepartments(['all']);
    setSelectedMetrics(['tickets', 'assets', 'workflows']);
    setDataGranularity('daily');
    onResetFilters();
  };

  return (
    <div className={`h-full flex flex-col bg-card border-l border-border transition-all ${isCollapsed ? 'w-12' : 'w-full'}`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!isCollapsed && <h2 className="text-lg font-semibold">Filters</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-muted transition-smooth"
          aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
        >
          <Icon name={isCollapsed ? 'ChevronLeft' : 'ChevronRight'} size={20} />
        </button>
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
            <div>
              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={dateRange}
                onChange={setDateRange}
              />
            </div>

            {dateRange === 'custom' && (
              <div className="space-y-3">
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

            <div>
              <Select
                label="Department"
                options={departmentOptions}
                value={selectedDepartments?.[0]}
                onChange={(value) => setSelectedDepartments([value])}
              />
            </div>

            <div>
              <Select
                label="Data Granularity"
                options={granularityOptions}
                value={dataGranularity}
                onChange={setDataGranularity}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Metric Categories</label>
              <div className="space-y-2">
                {metricCategories?.map(metric => (
                  <Checkbox
                    key={metric?.id}
                    label={metric?.label}
                    checked={metric?.checked}
                    onChange={() => handleMetricToggle(metric?.id)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Icon name="Info" size={16} />
                <span>Advanced Options</span>
              </div>
              <div className="space-y-2">
                <Checkbox label="Include archived data" />
                <Checkbox label="Show trend lines" />
                <Checkbox label="Enable forecasting" />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border space-y-2">
            <Button
              variant="default"
              fullWidth
              iconName="Filter"
              iconPosition="left"
              onClick={handleApplyFilters}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              fullWidth
              iconName="RotateCcw"
              iconPosition="left"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterPanel;
