import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ onFiltersChange, onExport }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [comparisonMode, setComparisonMode] = useState(false);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'q1', label: 'Q1 2024' },
    { value: 'q2', label: 'Q2 2024' },
    { value: 'q3', label: 'Q3 2024' },
    { value: 'yearly', label: '2024 Full Year' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'it', label: 'IT Services' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales & Marketing' }
  ];

  const serviceOptions = [
    { value: 'all', label: 'All Services' },
    { value: 'incident', label: 'Incident Management' },
    { value: 'request', label: 'Service Requests' },
    { value: 'change', label: 'Change Management' },
    { value: 'problem', label: 'Problem Management' },
    { value: 'asset', label: 'Asset Management' }
  ];

  const handleFilterChange = (type, value) => {
    const filters = {
      timeRange: type === 'timeRange' ? value : selectedTimeRange,
      department: type === 'department' ? value : selectedDepartment,
      service: type === 'service' ? value : selectedService,
      comparison: type === 'comparison' ? value : comparisonMode
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
    }

    onFiltersChange(filters);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6 operations-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Select
            label="Time Range"
            options={timeRangeOptions}
            value={selectedTimeRange}
            onChange={(value) => handleFilterChange('timeRange', value)}
            className="w-full sm:w-48"
          />
          
          <Select
            label="Department"
            options={departmentOptions}
            value={selectedDepartment}
            onChange={(value) => handleFilterChange('department', value)}
            className="w-full sm:w-48"
          />
          
          <Select
            label="Service Category"
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
              Comparison Mode
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              iconName="FileText"
              iconPosition="left"
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              iconName="Download"
              iconPosition="left"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: September 21, 2024 at 8:48 AM</span>
          <div className="flex items-center space-x-2">
            <Icon name="RefreshCw" size={14} />
            <span>Auto-refresh: Hourly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;