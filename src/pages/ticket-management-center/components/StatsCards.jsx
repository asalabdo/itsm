import React from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const StatsCards = ({ stats }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const cards = [
    {
      id: 'total',
      label: t('totalTickets', 'Total Tickets'),
      value: stats?.total,
      change: '+12%',
      trend: 'up',
      icon: 'Ticket',
      color: 'text-primary bg-primary/10'
    },
    {
      id: 'open',
      label: t('openTickets', 'Open Tickets'),
      value: stats?.open,
      change: '+8%',
      trend: 'up',
      icon: 'AlertCircle',
      color: 'text-warning bg-warning/10'
    },
    {
      id: 'inProgress',
      label: t('inProgress', 'In Progress'),
      value: stats?.inProgress,
      change: '-5%',
      trend: 'down',
      icon: 'RefreshCw',
      color: 'text-primary bg-primary/10'
    },
    {
      id: 'resolved',
      label: t('resolvedToday', 'Resolved Today'),
      value: stats?.resolved,
      change: '+15%',
      trend: 'up',
      icon: 'CheckCircle',
      color: 'text-success bg-success/10'
    },
    {
      id: 'overdue',
      label: t('overdueSLA', 'Overdue SLA'),
      value: stats?.overdue,
      change: '-3%',
      trend: 'down',
      icon: 'Clock',
      color: 'text-error bg-error/10'
    },
    {
      id: 'avgResponse',
      label: t('avgResponseTime', 'Avg Response Time'),
      value: stats?.avgResponse,
      change: '-10%',
      trend: 'down',
      icon: 'Timer',
      color: 'text-success bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards?.map((card) => (
        <div
          key={card?.id}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-elevation-2 transition-smooth"
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card?.color}`}>
              <Icon name={card?.icon} size={20} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${
              card?.trend === 'up' ? 'text-success' : 'text-error'
            }`}>
              <Icon name={card?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={14} />
              {card?.change}
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{card?.value}</p>
            <p className="text-sm text-muted-foreground">{card?.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;