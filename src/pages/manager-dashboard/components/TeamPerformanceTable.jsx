import { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const TeamPerformanceTable = ({ teamData }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [sortConfig, setSortConfig] = useState({ key: 'tickets', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = useMemo(() => {
    const sourceData = Array.isArray(teamData) ? teamData : [];
    const sorted = [...sourceData].sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];

      if (typeof aValue === 'string') {
        return sortConfig?.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortConfig?.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [teamData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData?.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData?.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev?.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ChevronsUpDown';
    return sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-success/10 text-success';
      case 'busy':
        return 'bg-warning/10 text-warning';
      case 'offline':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">{t('teamPerformance', 'Team Performance')}</h2>
        <p className="text-sm text-muted-foreground mt-1 caption">{t('individualAgentMetrics', 'Individual agent metrics and workload status')}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('name')}>
                  {t('agent', 'Agent')}
                  <Icon name={getSortIcon('name')} size={16} />
                </button>
              </th>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground hidden md:table-cell">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('status')}>
                  {t('status', 'Status')}
                  <Icon name={getSortIcon('status')} size={16} />
                </button>
              </th>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('tickets')}>
                  {t('tickets', 'Tickets')}
                  <Icon name={getSortIcon('tickets')} size={16} />
                </button>
              </th>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground hidden lg:table-cell">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('avgResolution')}>
                  {t('avgResolution', 'Avg Resolution')}
                  <Icon name={getSortIcon('avgResolution')} size={16} />
                </button>
              </th>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground hidden lg:table-cell">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('satisfaction')}>
                  {t('csat', 'CSAT')}
                  <Icon name={getSortIcon('satisfaction')} size={16} />
                </button>
              </th>
              <th className="text-left p-3 md:p-4 text-sm font-medium text-foreground">
                <button className="flex items-center gap-2 hover:text-primary transition-smooth" onClick={() => handleSort('workload')}>
                  {t('workload', 'Workload')}
                  <Icon name={getSortIcon('workload')} size={16} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((agent) => (
              <tr key={agent?.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
                <td className="p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <Image src={agent?.avatar} alt={agent?.avatarAlt} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{agent?.name}</p>
                      <p className="text-xs text-muted-foreground truncate caption hidden md:block">{agent?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 md:p-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium caption ${getStatusColor(agent?.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {t(agent?.status, agent?.status)}
                  </span>
                </td>
                <td className="p-3 md:p-4">
                  <span className="text-sm font-medium text-foreground data-text">{agent?.tickets}</span>
                </td>
                <td className="p-3 md:p-4 hidden lg:table-cell">
                  <span className="text-sm text-foreground data-text">{agent?.avgResolution}</span>
                </td>
                <td className="p-3 md:p-4 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground data-text">{agent?.satisfaction}%</span>
                    <Icon name="Star" size={16} color="var(--color-warning)" fill="var(--color-warning)" />
                  </div>
                </td>
                <td className="p-3 md:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden min-w-[60px] md:min-w-[80px]">
                      <div
                        className={`h-full transition-smooth ${agent?.workload >= 80 ? 'bg-error' : agent?.workload >= 60 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${agent?.workload}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground data-text whitespace-nowrap">{agent?.workload}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground caption">
          {t('showingAgents', 'Showing')} {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData?.length)} {t('of', 'of')} {sortedData?.length} {t('agents', 'agents')}
        </p>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <span className="text-sm text-foreground data-text px-3">
            {t('page', 'Page')} {currentPage} {t('of', 'of')} {totalPages}
          </span>
          <button
            className="px-3 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-smooth"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamPerformanceTable;
