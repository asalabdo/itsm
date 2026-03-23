import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'View Reports',
      description: 'Detailed analytics and insights',
      icon: 'FileText',
      color: 'var(--color-primary)',
      path: '/reports-analytics',
    },
    {
      id: 2,
      title: 'Create Ticket',
      description: 'Open new support request',
      icon: 'Plus',
      color: 'var(--color-success)',
      path: '/ticket-creation',
    },
    {
      id: 3,
      title: 'Team Dashboard',
      description: 'Monitor agent activity',
      icon: 'Users',
      color: 'var(--color-warning)',
      path: '/agent-dashboard',
    },
    {
      id: 4,
      title: 'Employee Portal',
      description: 'View customer requests',
      icon: 'UserCircle',
      color: 'var(--color-accent)',
      path: '/customer-portal',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1 p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => navigate(action?.path)}
            className="flex items-center gap-3 p-3 md:p-4 bg-background border border-border rounded-lg hover:shadow-elevation-2 hover:border-primary/50 transition-smooth text-left"
          >
            <div 
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${action?.color}15` }}
            >
              <Icon name={action?.icon} size={20} color={action?.color} className="md:w-6 md:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-foreground mb-0.5">{action?.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground caption">{action?.description}</p>
            </div>
            <Icon name="ChevronRight" size={18} color="var(--color-muted-foreground)" className="flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;