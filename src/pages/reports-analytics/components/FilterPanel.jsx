import { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { getErpDepartmentOptions, loadErpDepartmentDirectory } from '../../../services/organizationUnits';

const FilterPanel = ({ onApplyFilters, onResetFilters }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [dateRange, setDateRange] = useState('last30days');
  const [department, setDepartment] = useState('all');
  const [ticketType, setTicketType] = useState('all');
  const [priority, setPriority] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [erpDepartments, setErpDepartments] = useState([]);

  const dateRangeOptions = [
    { value: 'today', label: t('today', 'Today') },
    { value: 'yesterday', label: t('yesterday', 'Yesterday') },
    { value: 'last7days', label: t('last7Days', 'Last 7 Days') },
    { value: 'last30days', label: t('last30Days', 'Last 30 Days') },
    { value: 'last90days', label: t('last90Days', 'Last 90 Days') },
    { value: 'thismonth', label: t('thisMonth', 'This Month') },
    { value: 'lastmonth', label: t('lastMonth', 'Last Month') },
    { value: 'custom', label: t('customRange', 'Custom Range') },
  ];

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

  const ticketTypeOptions = [
    { value: 'all', label: t('allTypes', 'All Types') },
    { value: 'incident', label: t('incident', 'Incident') },
    { value: 'problem', label: t('problem', 'Problem') },
    { value: 'change', label: t('changeRequest', 'Change Request') },
    { value: 'service', label: t('serviceRequest', 'Service Request') },
  ];

  const priorityOptions = [
    { value: 'all', label: t('allPriorities', 'All Priorities') },
    { value: 'urgent', label: t('urgent', 'Urgent') },
    { value: 'high', label: t('high', 'High') },
    { value: 'medium', label: t('medium', 'Medium') },
    { value: 'low', label: t('low', 'Low') },
  ];

  const handleApply = () => {
    const filters = {
      dateRange,
      department,
      ticketType,
      priority,
      startDate: dateRange === 'custom' ? startDate : null,
      endDate: dateRange === 'custom' ? endDate : null,
    };
    onApplyFilters(filters);
  };

  const handleReset = () => {
    setDateRange('last30days');
    setDepartment('all');
    setTicketType('all');
    setPriority('all');
    setStartDate('');
    setEndDate('');
    onResetFilters();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h3 className="text-lg font-semibold text-foreground">{t('filtersTitle', 'Filters')}</h3>
        </div>
        <Button variant="ghost" size="sm" iconName="RotateCcw" onClick={handleReset}>
          {t('resetFilters', 'Reset')}
        </Button>
      </div>
      <div className="space-y-4">
        <Select
          label={t('dateRange', 'Date Range')}
          options={dateRangeOptions}
          value={dateRange}
          onChange={setDateRange}
        />

        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('startDate', 'Start Date')}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e?.target?.value)}
            />
            <Input
              label={t('endDate', 'End Date')}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e?.target?.value)}
            />
          </div>
        )}

        <Select
          label={t('departmentLabel', 'Department')}
          options={departmentOptions}
          value={department}
          onChange={setDepartment}
        />

        <Select
          label={t('ticketType', 'Ticket Type')}
          options={ticketTypeOptions}
          value={ticketType}
          onChange={setTicketType}
        />

        <Select
          label={t('priorityLabel', 'Priority')}
          options={priorityOptions}
          value={priority}
          onChange={setPriority}
        />

        <Button variant="default" fullWidth onClick={handleApply} iconName="Check">
          {t('applyFilters', 'Apply Filters')}
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
