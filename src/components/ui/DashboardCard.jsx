import React from 'react';
import { cn } from '../../utils/cn';

const DashboardCard = ({ title, value, subtitle, children, className }) => {
  return (
    <div
      className={cn('rounded-lg p-4 shadow-sm bg-card border border-border border-l-4 border-l-primary text-card-foreground', className)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
          {value && <div className="mt-2 text-2xl font-bold text-primary">{value}</div>}
          {subtitle && <div className="text-xs mt-1 text-muted-foreground">{subtitle}</div>}
        </div>
        <div className="ml-4">{children}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
