import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const defaultFilters = {
  status: 'all',
  priority: 'all',
  department: 'all',
  assignee: 'all',
  dateRange: 'all',
  slaStatus: 'all',
};

const SearchBar = ({ onSearch, onFilterChange, filters = defaultFilters, onQuickFilter, onSaveFilter, departmentOptions = null }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'all', label: t('allStatus', 'All Status') },
    { value: 'open', label: t('open', 'Open') },
    { value: 'in-progress', label: t('inProgress', 'In Progress') },
    { value: 'pending', label: t('pending', 'Pending') },
    { value: 'resolved', label: t('resolved', 'Resolved') },
    { value: 'closed', label: t('closed', 'Closed') }
  ];

  const priorityOptions = [
    { value: 'all', label: t('allPriorities', 'All Priorities') },
    { value: 'critical', label: t('critical', 'Critical') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') }
  ];

  const fallbackDepartmentOptions = [
    { value: 'all', label: t('allDepartments', 'All Departments') },
    { value: 'it', label: t('itSupport', 'IT Support') },
    { value: 'hr', label: t('humanResources', 'Human Resources') },
    { value: 'finance', label: t('finance', 'Finance') },
    { value: 'operations', label: t('operations', 'Operations') },
    { value: 'facilities', label: t('facilities', 'Facilities') }
  ];

  const dateRangeOptions = [
    { value: 'all', label: t('allTime', 'All Time') },
    { value: 'today', label: t('today', 'Today') },
    { value: 'week', label: t('thisWeek', 'This Week') },
    { value: 'month', label: t('thisMonth', 'This Month') },
    { value: 'quarter', label: t('thisQuarter', 'This Quarter') },
    { value: 'custom', label: t('customRange', 'Custom Range') }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery);
  };

  const currentFilters = { ...defaultFilters, ...filters };
  const resolvedDepartmentOptions = Array.isArray(departmentOptions) && departmentOptions.length > 0
    ? [{ value: 'all', label: t('allDepartments', 'All Departments') }, ...departmentOptions]
    : fallbackDepartmentOptions;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="search"
            placeholder={t('searchPlaceholder', 'Search tickets by ID, title, requester, or description...')}
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
          {t('search', 'Search')}
        </Button>
        <Button
          type="button"
          variant="outline"
          iconName={showAdvanced ? 'ChevronUp' : 'ChevronDown'}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {t('filters', 'Filters')}
        </Button>
      </form>
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <Select
            label={t('status', 'Status')}
            options={statusOptions}
            value={currentFilters?.status}
            onChange={(value) => onFilterChange('status', value)}
          />
          <Select
            label={t('priority', 'Priority')}
            options={priorityOptions}
            value={currentFilters?.priority}
            onChange={(value) => onFilterChange('priority', value)}
          />
          <Select
            label={t('department', 'Department')}
            options={resolvedDepartmentOptions}
            value={currentFilters?.department}
            onChange={(value) => onFilterChange('department', value)}
          />
          <Select
            label={t('dateRange', 'Date Range')}
            options={dateRangeOptions}
            value={currentFilters?.dateRange}
            onChange={(value) => onFilterChange('dateRange', value)}
          />
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">{t('quickFilters', 'Quick filters')}:</span>
          <button type="button" onClick={() => onQuickFilter?.('my-tickets')} className="text-primary hover:underline">{t('myTickets', 'My Tickets')}</button>
          <button type="button" onClick={() => onQuickFilter?.('unassigned')} className="text-primary hover:underline">{t('unassigned', 'Unassigned')}</button>
          <button type="button" onClick={() => onQuickFilter?.('overdue')} className="text-primary hover:underline">{t('overdue', 'Overdue')}</button>
          <button type="button" onClick={() => onQuickFilter?.('high-priority')} className="text-primary hover:underline">{t('highPriority', 'High Priority')}</button>
        </div>
        <button type="button" onClick={() => onSaveFilter?.({ query: searchQuery, filters: currentFilters })} className="text-primary hover:underline flex items-center gap-1">
          <Icon name="Save" size={14} />
          {t('saveFilter', 'Save Filter')}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
