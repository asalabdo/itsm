import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AssetFiltersHeader = ({ onFiltersChange, alertCount = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'hardware', label: 'Hardware' },
    { value: 'software', label: 'Software' },
    { value: 'network', label: 'Network Equipment' },
    { value: 'mobile', label: 'Mobile Devices' },
    { value: 'peripherals', label: 'Peripherals' }
  ];

  const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'datacenter-a', label: 'Data Center A' },
    { value: 'datacenter-b', label: 'Data Center B' },
    { value: 'building-a', label: 'Building A' },
    { value: 'building-b', label: 'Building B' },
    { value: 'remote', label: 'Remote Locations' }
  ];

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retirement', label: 'Retirement' }
  ];

  const handleFilterChange = () => {
    const filters = {
      search: searchTerm,
      category: selectedCategory,
      location: selectedLocation,
      stage: selectedStage
    };
    
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedStage('all');
    setShowAdvancedFilters(false);
    
    if (onFiltersChange) {
      onFiltersChange({
        search: '',
        category: 'all',
        location: 'all',
        stage: 'all'
      });
    }
  };

  React.useEffect(() => {
    handleFilterChange();
  }, [searchTerm, selectedCategory, selectedLocation, selectedStage]);

  return (
    <div className="bg-card border border-border rounded-lg p-6 operations-shadow mb-6">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search assets by name, ID, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="w-40"
          />

          <Select
            options={locationOptions}
            value={selectedLocation}
            onChange={setSelectedLocation}
            className="w-40"
          />

          <Select
            options={stageOptions}
            value={selectedStage}
            onChange={setSelectedStage}
            className="w-40"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            iconName={showAdvancedFilters ? "ChevronUp" : "ChevronDown"}
          >
            Advanced
          </Button>
        </div>
      </div>
      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Vendor</label>
              <Select
                options={[
                  { value: 'all', label: 'All Vendors' },
                  { value: 'dell', label: 'Dell Technologies' },
                  { value: 'hp', label: 'HP Enterprise' },
                  { value: 'cisco', label: 'Cisco Systems' },
                  { value: 'microsoft', label: 'Microsoft' },
                  { value: 'vmware', label: 'VMware' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Purchase Date</label>
              <Select
                options={[
                  { value: 'all', label: 'All Dates' },
                  { value: 'last-30', label: 'Last 30 days' },
                  { value: 'last-90', label: 'Last 90 days' },
                  { value: 'last-year', label: 'Last year' },
                  { value: 'older', label: 'Older than 1 year' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Warranty Status</label>
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active Warranty' },
                  { value: 'expiring', label: 'Expiring Soon' },
                  { value: 'expired', label: 'Expired' },
                  { value: 'none', label: 'No Warranty' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cost Range</label>
              <Select
                options={[
                  { value: 'all', label: 'All Ranges' },
                  { value: '0-1000', label: '$0 - $1,000' },
                  { value: '1000-5000', label: '$1,000 - $5,000' },
                  { value: '5000-10000', label: '$5,000 - $10,000' },
                  { value: '10000+', label: '$10,000+' }
                ]}
                value="all"
                onChange={() => {}}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" iconName="Save">
                Save Filter Set
              </Button>
              <Button variant="ghost" size="sm" iconName="Upload">
                Load Saved Filters
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          {/* Alert Counter */}
          {alertCount > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-error/10 border border-error/20 rounded-lg">
              <Icon name="AlertTriangle" size={16} className="text-error" />
              <span className="text-sm font-medium text-error">
                {alertCount} Critical Alert{alertCount > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            Showing assets matching current filters
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Download">
            Export
          </Button>
          <Button variant="outline" size="sm" iconName="RefreshCw">
            Refresh
          </Button>
          <Button variant="default" size="sm" iconName="Plus">
            Add Asset
          </Button>
        </div>
      </div>
      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2 mt-4">
        {searchTerm && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <Icon name="Search" size={14} className="text-primary" />
            <span className="text-sm text-primary">Search: {searchTerm}</span>
            <button onClick={() => setSearchTerm('')} className="text-primary hover:text-primary/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
        
        {selectedCategory !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
            <Icon name="Tag" size={14} className="text-secondary" />
            <span className="text-sm text-secondary">
              Category: {categoryOptions?.find(opt => opt?.value === selectedCategory)?.label}
            </span>
            <button onClick={() => setSelectedCategory('all')} className="text-secondary hover:text-secondary/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {selectedLocation !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
            <Icon name="MapPin" size={14} className="text-accent" />
            <span className="text-sm text-accent">
              Location: {locationOptions?.find(opt => opt?.value === selectedLocation)?.label}
            </span>
            <button onClick={() => setSelectedLocation('all')} className="text-accent hover:text-accent/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}

        {selectedStage !== 'all' && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
            <Icon name="Activity" size={14} className="text-success" />
            <span className="text-sm text-success">
              Stage: {stageOptions?.find(opt => opt?.value === selectedStage)?.label}
            </span>
            <button onClick={() => setSelectedStage('all')} className="text-success hover:text-success/80">
              <Icon name="X" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetFiltersHeader;