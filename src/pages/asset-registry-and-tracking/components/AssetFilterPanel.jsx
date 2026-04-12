import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const AssetFilterPanel = ({ onFilterChange, isCollapsed, onToggleCollapse }) => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    location: '',
    status: [],
    ownershipType: '',
    valueRange: { min: '', max: '' },
    maintenanceStatus: []
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'computers', label: 'Computers & Laptops' },
    { value: 'furniture', label: 'Office Furniture' },
    { value: 'equipment', label: 'Equipment & Machinery' },
    { value: 'vehicles', label: 'Vehicles & Transportation' },
    { value: 'software', label: 'Software Licenses' },
    { value: 'mobile', label: 'Mobile Devices' },
    { value: 'networking', label: 'Networking Equipment' }
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'hq-floor1', label: 'HQ - Floor 1' },
    { value: 'hq-floor2', label: 'HQ - Floor 2' },
    { value: 'hq-floor3', label: 'HQ - Floor 3' },
    { value: 'warehouse-a', label: 'Warehouse A' },
    { value: 'warehouse-b', label: 'Warehouse B' },
    { value: 'remote', label: 'Remote/Field' },
    { value: 'branch-ny', label: 'New York Branch' },
    { value: 'branch-la', label: 'Los Angeles Branch' }
  ];

  const ownershipOptions = [
    { value: '', label: 'All Ownership Types' },
    { value: 'owned', label: 'Company Owned' },
    { value: 'leased', label: 'Leased' },
    { value: 'rented', label: 'Rented' },
    { value: 'borrowed', label: 'Borrowed' }
  ];

  const statusTypes = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'maintenance', label: 'Under Maintenance' },
    { id: 'retired', label: 'Retired' },
    { id: 'lost', label: 'Lost/Missing' }
  ];

  const maintenanceTypes = [
    { id: 'due', label: 'Maintenance Due' },
    { id: 'overdue', label: 'Maintenance Overdue' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'completed', label: 'Recently Completed' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (statusId, checked) => {
    const newStatus = checked
      ? [...filters?.status, statusId]
      : filters?.status?.filter(s => s !== statusId);
    handleFilterChange('status', newStatus);
  };

  const handleMaintenanceChange = (maintenanceId, checked) => {
    const newMaintenance = checked
      ? [...filters?.maintenanceStatus, maintenanceId]
      : filters?.maintenanceStatus?.filter(m => m !== maintenanceId);
    handleFilterChange('maintenanceStatus', newMaintenance);
  };

  const handleReset = () => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      location: '',
      status: [],
      ownershipType: '',
      valueRange: { min: '', max: '' },
      maintenanceStatus: []
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring"
          aria-label="Expand filters"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md hover:bg-muted transition-smooth press-scale focus-ring lg:block hidden"
          aria-label="Collapse filters"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-custom p-4 space-y-6">
        <div>
          <Input
            type="search"
            placeholder="Search by ID, name, serial..."
            value={filters?.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e?.target?.value)}
            className="w-full"
          />
        </div>

        <div>
          <Select
            label="Category"
            options={categoryOptions}
            value={filters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>

        <div>
          <Select
            label="Location"
            options={locationOptions}
            value={filters?.location}
            onChange={(value) => handleFilterChange('location', value)}
            searchable
          />
        </div>

        <div>
          <Select
            label="Ownership Type"
            options={ownershipOptions}
            value={filters?.ownershipType}
            onChange={(value) => handleFilterChange('ownershipType', value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Asset Status</label>
          <div className="space-y-2">
            {statusTypes?.map((status) => (
              <Checkbox
                key={status?.id}
                label={status?.label}
                checked={filters?.status?.includes(status?.id)}
                onChange={(e) => handleStatusChange(status?.id, e?.target?.checked)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Maintenance Status</label>
          <div className="space-y-2">
            {maintenanceTypes?.map((maintenance) => (
              <Checkbox
                key={maintenance?.id}
                label={maintenance?.label}
                checked={filters?.maintenanceStatus?.includes(maintenance?.id)}
                onChange={(e) => handleMaintenanceChange(maintenance?.id, e?.target?.checked)}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Value Range (ريال)</label>
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Min value"
              value={filters?.valueRange?.min}
              onChange={(e) => handleFilterChange('valueRange', { ...filters?.valueRange, min: e?.target?.value })}
            />
            <Input
              type="number"
              placeholder="Max value"
              value={filters?.valueRange?.max}
              onChange={(e) => handleFilterChange('valueRange', { ...filters?.valueRange, max: e?.target?.value })}
            />
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border">
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
    </div>
  );
};

export default AssetFilterPanel;