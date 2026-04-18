import { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import apiClient from '../../../services/apiClient';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AgentPerformanceTable = () => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [agents, setAgents] = useState([]);
  const [sortField, setSortField] = useState('resolvedTickets');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    apiClient.get('/reports/technicians').then(r => setAgents(r.data || [])).catch(console.error);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const sorted = [...agents].sort((a, b) => {
    const av = a[sortField], bv = b[sortField];
    return sortDirection === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const SortIcon = ({ field }) => sortField !== field
    ? <Icon name="ChevronsUpDown" size={16} className="text-muted-foreground" />
    : sortDirection === 'asc' ? <Icon name="ChevronUp" size={16} className="text-primary" /> : <Icon name="ChevronDown" size={16} className="text-primary" />;

  const cols = [
    { key: 'technicianName', label: t('agent', 'Agent') },
    { key: 'assignedTickets', label: t('assigned', 'Assigned') },
    { key: 'resolvedTickets', label: t('resolved', 'Resolved') },
    { key: 'pendingTickets', label: t('pending', 'Pending') },
    { key: 'avgResolutionHours', label: t('avgTime', 'Avg Time') },
    { key: 'slaComplianceRate', label: t('slaPercent', 'SLA %') },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border flex items-center gap-2">
        <Icon name="Users" size={20} color="var(--color-primary)" />
        <h3 className="text-lg md:text-xl font-semibold text-foreground">{t('agentPerformance', 'Agent Performance')}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              {cols.map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/50 transition-smooth" onClick={() => handleSort(key)}>
                  <div className="flex items-center gap-2">{label}<SortIcon field={key} /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, index) => (
              <tr key={agent.technicianId} className={`border-t border-border hover:bg-muted/30 transition-smooth ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}>
                <td className="px-4 py-3 text-sm font-medium text-foreground">{agent.technicianName}</td>
                <td className="px-4 py-3 text-sm text-foreground data-text">{agent.assignedTickets}</td>
                <td className="px-4 py-3 text-sm text-success font-medium data-text">{agent.resolvedTickets}</td>
                <td className="px-4 py-3 text-sm text-warning font-medium data-text">{agent.pendingTickets}</td>
                <td className="px-4 py-3 text-sm text-foreground data-text">{agent.avgResolutionHours != null ? `${Number(agent.avgResolutionHours).toFixed(1)}h` : '--'}</td>
                <td className="px-4 py-3 text-sm font-medium data-text" style={{ color: agent.slaComplianceRate >= 95 ? 'var(--color-success)' : agent.slaComplianceRate >= 90 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                  {agent.slaComplianceRate != null ? `${Number(agent.slaComplianceRate).toFixed(1)}%` : '--'}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">{t('noDataAvailable', 'No data available')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentPerformanceTable;
