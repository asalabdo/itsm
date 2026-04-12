import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const defaultFilters = {
  status: [],
  priority: [],
  department: [],
  assignee: [],
  dateRange: 'all',
  dateFrom: '',
  dateTo: ''
};

const FilterSidebar = ({
  isOpen,
  onClose,
  onApplyFilters,
  activeFilters,
  sidebarCounts = {},
  onSavedFilterSelect,
}) => {
  const [localFilters, setLocalFilters] = useState({ ...defaultFilters, ...activeFilters });
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    priority: true,
    department: true,
    assignee: true,
    dateRange: false,
    tags: false
  });

  const statusOptions = sidebarCounts?.status || [];
  const priorityOptions = sidebarCounts?.priority || [];
  const departmentOptions = sidebarCounts?.department || [];
  const assigneeOptions = sidebarCounts?.assignee || [];
  const savedFilters = sidebarCounts?.savedFilters || [];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const handleCheckboxChange = (category, value) => {
    const current = localFilters?.[category] || [];
    const updated = current?.includes(value)
      ? current?.filter((v) => v !== value)
      : [...current, value];
    const nextFilters = { ...localFilters, [category]: updated };
    setLocalFilters(nextFilters);
    onApplyFilters(nextFilters);
  };

  const handleDateChange = (field, value) => {
    const nextFilters = { ...localFilters, [field]: value };
    setLocalFilters(nextFilters);
    onApplyFilters(nextFilters);
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleResetFilters = () => {
    setLocalFilters({ ...defaultFilters });
    onApplyFilters({ ...defaultFilters });
  };

  const activeFilterCount = Object.entries(localFilters).reduce((count, [key, value]) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    if (key === 'dateRange') {
      return count + (value && value !== 'all' ? 1 : 0);
    }
    if (typeof value === 'string') {
      return count + (value.trim() ? 1 : 0);
    }
    return count + (value ? 1 : 0);
  }, 0);

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

        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 mb-6">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Saved Filters
            </h3>
            <div className="space-y-1">
              {savedFilters?.map(filter => (
                <button
                  key={filter?.id}
                  type="button"
                  onClick={() => onSavedFilterSelect?.(filter)}
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

          <div className="space-y-4-- hidden">
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
                    value={localFilters?.dateFrom || ''}
                    onChange={(e) => handleDateChange('dateFrom', e?.target?.value)}
                  />
                  <Input
                    type="date"
                    label="To"
                    size="sm"
                    value={localFilters?.dateTo || ''}
                    onChange={(e) => handleDateChange('dateTo', e?.target?.value)}
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
