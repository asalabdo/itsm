import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const priorityOptions = [
    { value: 'all', label: t('allPriorities', 'All Priorities') },
    { value: 'urgent', label: t('urgent', 'Urgent') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') }
  ];

  const statusOptions = [
    { value: 'all', label: t('allStatuses', 'All Statuses') },
    { value: 'open', label: t('open', 'Open') },
    { value: 'in progress', label: t('inProgress', 'In Progress') },
    { value: 'pending', label: t('pending', 'Pending') },
    { value: 'resolved', label: t('resolved', 'Resolved') },
    { value: 'closed', label: t('closed', 'Closed') }
  ];

  const categoryOptions = [
    { value: 'all', label: t('allCategories', 'All Categories') },
    { value: 'incident', label: t('incident', 'Incident') },
    { value: 'problem', label: t('problem', 'Problem') },
    { value: 'change', label: t('changeRequest', 'Change Request') },
    { value: 'service', label: t('serviceRequest', 'Service Request') }
  ];

  const slaOptions = [
    { value: 'all', label: t('allSlaStatus', 'All SLA Status') },
    { value: 'breached', label: t('breached', 'Breached') },
    { value: 'critical', label: t('critical', 'Critical (&lt;1h)') },
    { value: 'warning', label: t('warningStatus', 'Warning (&lt;4h)') },
    { value: 'safe', label: t('safe', 'Safe (&gt;4h)') }
  ];

  const hasActiveFilters = filters?.priority !== 'all' || filters?.status !== 'all' || filters?.category !== 'all' || filters?.sla !== 'all';

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold text-foreground">{t('filters', 'Filters')}</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            iconPosition="left"
            onClick={onClearFilters}
          >
            {t('clearAll', 'Clear All')}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Select
          label={t('priority', 'Priority')}
          options={priorityOptions}
          value={filters?.priority}
          onChange={(value) => onFilterChange('priority', value)}
        />

        <Select
          label={t('status', 'Status')}
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label={t('category', 'Category')}
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => onFilterChange('category', value)}
        />

        <Select
          label={t('slaStatus', 'SLA Status')}
          options={slaOptions}
          value={filters?.sla}
          onChange={(value) => onFilterChange('sla', value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;