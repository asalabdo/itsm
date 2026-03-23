import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'it', label: 'IT Support' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'finance', label: 'Finance' },
    { value: 'operations', label: 'Operations' },
    { value: 'facilities', label: 'Facilities' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search tickets by ID, title, requester, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          variant="default"
          iconName="Search"
        >
          Search
        </Button>
        <Button
          type="button"
          variant="outline"
          iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Filters
        </Button>
      </form>
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <Select
            label="Status"
            options={statusOptions}
            value="all"
            onChange={(value) => onFilterChange('status', value)}
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value="all"
            onChange={(value) => onFilterChange('priority', value)}
          />
          <Select
            label="Department"
            options={departmentOptions}
            value="all"
            onChange={(value) => onFilterChange('department', value)}
          />
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value="all"
            onChange={(value) => onFilterChange('dateRange', value)}
          />
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Quick filters:</span>
          <button className="text-primary hover:underline">My Tickets</button>
          <button className="text-primary hover:underline">Unassigned</button>
          <button className="text-primary hover:underline">Overdue</button>
          <button className="text-primary hover:underline">High Priority</button>
        </div>
        <button className="text-primary hover:underline flex items-center gap-1">
          <Icon name="Save" size={14} />
          Save Filter
        </button>
      </div>
    </div>
  );
};

export default SearchBar;