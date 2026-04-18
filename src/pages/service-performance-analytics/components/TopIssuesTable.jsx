import { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';
import { formatLocalizedValue } from '../../../services/displayValue';

const TopIssuesTable = ({ tickets = [] }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [sortBy, setSortBy] = useState('frequency');
  const [sortOrder, setSortOrder] = useState('desc');

  const issuesData = useMemo(() => {
    const groups = new Map();

    tickets.forEach((ticket) => {
      const rawCategory = ticket?.subcategory || ticket?.category || 'General';
      const key = rawCategory;
      const existing = groups.get(key) || {
        id: key,
        issue: formatLocalizedValue(ticket?.titleAr || ticket?.title || key, language) || key,
        category: formatLocalizedValue(ticket?.categoryAr || ticket?.category || 'General', language) || 'General',
        frequency: 0,
        totalHours: 0,
        impactScore: 0,
        trend: 'stable',
        rootCause: formatLocalizedValue(ticket?.subcategoryAr || ticket?.subcategory || ticket?.categoryAr || ticket?.category || 'Unclassified', language) || 'Unclassified',
        impactKey: 'Low',
      };

      const created = new Date(ticket?.createdAt || Date.now());
      const resolved = new Date(ticket?.resolvedAt || ticket?.updatedAt || Date.now());
      const durationHours = Math.max(0.5, (resolved - created) / 36e5);

      existing.frequency += 1;
      existing.totalHours += durationHours;
      existing.impactScore += ticket?.priority === 'Critical' ? 4 : ticket?.priority === 'High' ? 3 : ticket?.priority === 'Medium' ? 2 : 1;
      groups.set(key, existing);
    });

    return Array.from(groups.values())
      .map((item) => {
        const avgHours = item.totalHours / Math.max(1, item.frequency);
        const impactKey = item.impactScore >= 12 ? 'Critical' : item.impactScore >= 8 ? 'High' : item.impactScore >= 4 ? 'Medium' : 'Low';
        return {
          ...item,
          avgResolution: `${avgHours.toFixed(1)}h`,
          impactKey,
          impact: t(impactKey.toLowerCase(), impactKey),
          trend: avgHours > 4 ? 'up' : avgHours < 1.5 ? 'down' : 'stable',
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);
  }, [tickets, language]);

  const getImpactColor = (impactKey) => {
    switch (impactKey) {
      case 'Critical': return 'text-error bg-error/10';
      case 'High': return 'text-warning bg-warning/10';
      case 'Medium': return 'text-secondary bg-secondary/10';
      case 'Low': return 'text-success bg-success/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'TrendingUp';
      case 'down': return 'TrendingDown';
      default: return 'Minus';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-error';
      case 'down': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedData = [...issuesData].sort((a, b) => {
    let aValue = a?.[sortBy];
    let bValue = b?.[sortBy];

    if (sortBy === 'frequency') {
      aValue = parseInt(aValue, 10);
      bValue = parseInt(bValue, 10);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    }

    return aValue < bValue ? 1 : -1;
  });

  return (
    <div className="bg-card border border-border rounded-lg operations-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{t('topIssues', 'Top Issues')}</h3>
            <p className="text-sm text-muted-foreground">{t('topIssuesByCategory', 'Most frequent issues by category')}</p>
          </div>
          <Button variant="outline" size="sm" iconName="Filter" iconPosition="left">
            {t('filter', 'Filter')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button onClick={() => handleSort('issue')} className="flex items-center space-x-1 hover:text-foreground">
                  <span>{t('issue', 'Issue')}</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('serviceCategory', 'Category')}</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                <button onClick={() => handleSort('frequency')} className="flex items-center space-x-1 hover:text-foreground">
                  <span>{t('frequency', 'Frequency')}</span>
                  <Icon name="ArrowUpDown" size={14} />
                </button>
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('averageResolution', 'Avg Resolution')}</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('impact', 'Impact')}</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('trend', 'Trend')}</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('rootCause', 'Root Cause')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((issue, index) => (
              <tr key={issue?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{issue?.issue}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{issue?.category}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">{issue?.frequency}</span>
                    <span className="text-xs text-muted-foreground">{t('ticketsCount', 'tickets')}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm text-foreground">{issue?.avgResolution}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(issue?.impactKey)}`}>
                    {issue?.impact}
                  </span>
                </td>
                <td className="p-4">
                  <Icon name={getTrendIcon(issue?.trend)} size={16} className={getTrendColor(issue?.trend)} />
                </td>
                <td className="p-4">
                  <span className="text-sm text-muted-foreground">{issue?.rootCause}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('showingTopIssues', 'Showing top 8 issues from last 30 days')}</span>
          <Button variant="ghost" size="sm">
            {t('viewAllIssues', 'View All Issues')}
            <Icon name="ArrowRight" size={14} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopIssuesTable;
