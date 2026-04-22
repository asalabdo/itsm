import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { getErpDepartmentOptions, loadErpDepartmentDirectory } from '../../../services/organizationUnits';

const FilterPanel = ({ filters, onFilterChange, onClearFilters }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [erpDepartments, setErpDepartments] = useState([]);

  useEffect(() => {
    let mounted = true;
    loadErpDepartmentDirectory()
      .then((departments) => {
        if (mounted) setErpDepartments(Array.isArray(departments) ? departments : []);
      })
      .catch(() => {
        if (mounted) setErpDepartments([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const departmentOptions = useMemo(() => getErpDepartmentOptions(erpDepartments, t), [erpDepartments, t]);

  const requestTypeOptions = [
    { value: 'all', label: t('allTypes', 'All Types') },
    { value: 'purchase', label: t('purchaseRequest', 'Purchase Request') },
    { value: 'travel', label: t('travelAuthorization', 'Travel Authorization') },
    { value: 'budget', label: t('budgetReallocation', 'Budget Reallocation') },
    { value: 'hiring', label: t('hiringRequest', 'Hiring Request') },
    { value: 'equipment', label: t('equipmentProcurement', 'Equipment Procurement') }
  ];

  const urgencyOptions = [
    { value: 'all', label: t('allUrgencyLevels', 'All Urgency Levels') },
    { value: 'critical', label: t('critical', 'Critical') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') }
  ];

  const statusOptions = [
    { value: 'all', label: t('allStatus', 'All Status') },
    { value: 'pending', label: t('pending', 'Pending') },
    { value: 'approved', label: t('approved', 'Approved') },
    { value: 'denied', label: t('denied', 'Denied') }
  ];

  const agingOptions = [
    { value: 'all', label: t('allAges', 'All Ages') },
    { value: 'today', label: t('today', 'Today') },
    { value: 'week', label: t('thisWeek', 'This Week') },
    { value: 'month', label: t('thisMonth', 'This Month') },
    { value: 'overdue', label: t('overdue', 'Overdue') }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="Filter" size={20} />
          {t('advancedFilters', 'Advanced Filters')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          iconName="X"
          onClick={onClearFilters}
        >
          {t('clearAll', 'Clear All')}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label={t('department', 'Department')}
          options={departmentOptions}
          value={filters?.department}
          onChange={(value) => onFilterChange('department', value)}
        />

        <Select
          label={t('requestType', 'Request Type')}
          options={requestTypeOptions}
          value={filters?.requestType}
          onChange={(value) => onFilterChange('requestType', value)}
        />

        <Select
          label={t('urgency', 'Urgency')}
          options={urgencyOptions}
          value={filters?.urgency}
          onChange={(value) => onFilterChange('urgency', value)}
        />

        <Select
          label={t('status', 'Status')}
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        <Select
          label={t('age', 'Age')}
          options={agingOptions}
          value={filters?.aging}
          onChange={(value) => onFilterChange('aging', value)}
        />

        <Input
          label={t('minValue', 'Min Value ($)')}
          type="number"
          placeholder="0"
          value={filters?.minValue}
          onChange={(e) => onFilterChange('minValue', e?.target?.value)}
        />

        <Input
          label={t('maxValue', 'Max Value ($)')}
          type="number"
          placeholder="100000"
          value={filters?.maxValue}
          onChange={(e) => onFilterChange('maxValue', e?.target?.value)}
        />

        <Input
          label={t('requester', 'Requester')}
          type="text"
          placeholder={t('searchByName', 'Search by name')}
          value={filters?.requester}
          onChange={(e) => onFilterChange('requester', e?.target?.value)}
        />

        <Input
          label={t('requestId', 'Request ID')}
          type="text"
          placeholder={t('requestIdPlaceholder', 'APR-XXXX')}
          value={filters?.requestId}
          onChange={(e) => onFilterChange('requestId', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default FilterPanel;
