import React from 'react';
import { cn } from '../../utils/cn';

const DashboardCard = ({ title, value, subtitle, children, className }) => {
  return (
    <div
      className={cn('rounded-lg p-4 shadow-sm', className)}
      style={{ backgroundColor: '#ffffff', borderLeft: '6px solid #006853' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#000' }}>{title}</h3>
          {value && <div className="mt-2 text-2xl font-bold" style={{ color: '#005051' }}>{value}</div>}
          {subtitle && <div className="text-xs mt-1" style={{ color: '#6b7280' }}>{subtitle}</div>}
        </div>
        <div className="ml-4">{children}</div>
      </div>
    </div>
  );
};

export default DashboardCard;