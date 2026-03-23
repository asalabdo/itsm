import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, activeFilters }) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    priority: true,
    department: true,
    assignee: true,
    dateRange: false,
    tags: false
  });

  const statusOptions = [
    { value: 'open', label: 'Open', count: 234 },
    { value: 'in-progress', label: 'In Progress', count: 156 },
    { value: 'pending', label: 'Pending', count: 89 },
    { value: 'resolved', label: 'Resolved', count: 1247 },
    { value: 'closed', label: 'Closed', count: 3421 }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical', count: 12, color: 'text-error' },
    { value: 'high', label: 'High', count: 45, color: 'text-warning' },
    { value: 'medium', label: 'Medium', count: 178, color: 'text-primary' },
    { value: 'low', label: 'Low', count: 244, color: 'text-muted-foreground' }
  ];

  const departmentOptions = [
    { value: 'it', label: 'IT Support', count: 156 },
    { value: 'hr', label: 'Human Resources', count: 89 },
    { value: 'finance', label: 'Finance', count: 67 },
    { value: 'operations', label: 'Operations', count: 134 },
    { value: 'facilities', label: 'Facilities', count: 78 }
  ];

  const assigneeOptions = [
    { value: 'unassigned', label: 'Unassigned', count: 45 },
    { value: 'me', label: 'Assigned to Me', count: 23 },
    { value: 'my-team', label: 'My Team', count: 67 },
    { value: 'john-doe', label: 'John Doe', count: 12 },
    { value: 'jane-smith', label: 'Jane Smith', count: 18 }
  ];

  const savedFilters = [
    { id: 1, name: 'My Open Tickets', icon: 'User', count: 23 },
    { id: 2, name: 'High Priority', icon: 'AlertTriangle', count: 45 },
    { id: 3, name: 'Overdue SLA', icon: 'Clock', count: 12 },
    { id: 4, name: 'Unassigned', icon: 'UserX', count: 45 }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleCheckboxChange = (category, value) => {
    setLocalFilters(prev => {
      const current = prev?.[category] || [];
      const updated = current?.includes(value)
        ? current?.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onApplyFilters({});
  };

  const activeFilterCount = Object.values(localFilters)?.flat()?.length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-1000 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static top-16 left-0 bottom-0 w-80 bg-card border-r border-border z-1100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={20} />
            <h2 className="font-semibold text-base">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Saved Filters
            </h3>
            <div className="space-y-1">
              {savedFilters?.map(filter => (
                <button
                  key={filter?.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-smooth text-left"
                >
                  <div className="flex items-center gap-2">
                    <Icon name={filter?.icon} size={16} />
                    <span className="text-sm">{filter?.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{filter?.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <button
                onClick={() => toggleSection('status')}
                className="w-full flex items-center justify-between py-2 text-sm font-medium"
              >
                <span>Status</span>
                <Icon
                  name={expandedSections?.status ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                />
              </button>
              {expandedSections?.status && (
                <div className="space-y-2 mt-2">
                  {statusOptions?.map(option => (
                    <Checkbox
                      key={option?.value}
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span>{option?.label}</span>
                          <span className="text-xs text-muted-foreground">{option?.count}</span>
                        </div>
                      }
                      checked={localFilters?.status?.includes(option?.value) || false}
                      onChange={() => handleCheckboxChange('status', option?.value)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={() => toggleSection('priority')}
                className="w-full flex items-center justify-between py-2 text-sm font-medium"
              >
                <span>Priority</span>
                <Icon
                  name={expandedSections?.priority ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                />
              </button>
              {expandedSections?.priority && (
                <div className="space-y-2 mt-2">
                  {priorityOptions?.map(option => (
                    <Checkbox
                      key={option?.value}
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span className={option?.color}>{option?.label}</span>
                          <span className="text-xs text-muted-foreground">{option?.count}</span>
                        </div>
                      }
                      checked={localFilters?.priority?.includes(option?.value) || false}
                      onChange={() => handleCheckboxChange('priority', option?.value)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={() => toggleSection('department')}
                className="w-full flex items-center justify-between py-2 text-sm font-medium"
              >
                <span>Department</span>
                <Icon
                  name={expandedSections?.department ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                />
              </button>
              {expandedSections?.department && (
                <div className="space-y-2 mt-2">
                  {departmentOptions?.map(option => (
                    <Checkbox
                      key={option?.value}
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span>{option?.label}</span>
                          <span className="text-xs text-muted-foreground">{option?.count}</span>
                        </div>
                      }
                      checked={localFilters?.department?.includes(option?.value) || false}
                      onChange={() => handleCheckboxChange('department', option?.value)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={() => toggleSection('assignee')}
                className="w-full flex items-center justify-between py-2 text-sm font-medium"
              >
                <span>Assignee</span>
                <Icon
                  name={expandedSections?.assignee ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                />
              </button>
              {expandedSections?.assignee && (
                <div className="space-y-2 mt-2">
                  {assigneeOptions?.map(option => (
                    <Checkbox
                      key={option?.value}
                      label={
                        <div className="flex items-center justify-between w-full">
                          <span>{option?.label}</span>
                          <span className="text-xs text-muted-foreground">{option?.count}</span>
                        </div>
                      }
                      checked={localFilters?.assignee?.includes(option?.value) || false}
                      onChange={() => handleCheckboxChange('assignee', option?.value)}
                      size="sm"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <button
                onClick={() => toggleSection('dateRange')}
                className="w-full flex items-center justify-between py-2 text-sm font-medium"
              >
                <span>Date Range</span>
                <Icon
                  name={expandedSections?.dateRange ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                />
              </button>
              {expandedSections?.dateRange && (
                <div className="space-y-3 mt-2">
                  <Input
                    type="date"
                    label="From"
                    size="sm"
                  />
                  <Input
                    type="date"
                    label="To"
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="default"
            fullWidth
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={handleResetFilters}
          >
            Reset All
          </Button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;