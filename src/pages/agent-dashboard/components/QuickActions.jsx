import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Create Ticket',
      icon: 'Plus',
      variant: 'default',
      onClick: () => navigate('/ticket-creation')
    },
    {
      label: 'View Analytics',
      icon: 'BarChart3',
      variant: 'outline',
      onClick: () => navigate('/manager-dashboard')
    },
    {
      label: 'Employee Portal',
      icon: 'Users',
      variant: 'outline',
      onClick: () => navigate('/customer-portal')
    },
    {
      label: 'Reports',
      icon: 'FileText',
      variant: 'outline',
      onClick: () => navigate('/reports-analytics')
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      {actions?.map((action, index) => (
        <Button
          key={index}
          variant={action?.variant}
          size="default"
          iconName={action?.icon}
          iconPosition="left"
          onClick={action?.onClick}
          className="flex-shrink-0"
        >
          <span className="hidden sm:inline">{action?.label}</span>
        </Button>
      ))}
    </div>
  );
};

export default QuickActions;