import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsBar = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Assets',
      value: stats?.total,
      icon: 'Package',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Active',
      value: stats?.active,
      icon: 'CheckCircle',
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      label: 'Under Maintenance',
      value: stats?.maintenance,
      icon: 'Wrench',
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      label: 'Maintenance Due',
      value: stats?.maintenanceDue,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10'
    },
    {
      label: 'Total Value',
      value: stats?.totalValue,
      icon: 'DollarSign',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    }
  ];

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statItems?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-smooth"
          >
            <div className={`w-10 h-10 rounded-lg ${item?.bgColor} flex items-center justify-center flex-shrink-0`}>
              <Icon name={item?.icon} size={20} className={item?.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item?.label}</p>
              <p className="text-lg font-semibold data-text truncate">{item?.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStatsBar;