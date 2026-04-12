import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const routeMap = {
    '/agent-dashboard': { label: 'My Tickets', parent: null },
    '/ticket-details': { label: 'Ticket Details', parent: '/agent-dashboard' },
    '/customer-portal': { label: 'Employee Portal', parent: null },
    '/manager-dashboard': { label: 'Analytics', parent: null },
    '/ticket-creation': { label: 'New Ticket', parent: null },
    '/my-work': { label: 'My Work', parent: null },
    '/asset-registry-and-tracking': { label: 'Asset Registry', parent: null },
    '/manage/assets': { label: 'Manage Assets', parent: '/asset-registry-and-tracking' },
    '/reports-analytics': { label: 'Reports', parent: '/manager-dashboard' },
    '/advanced-analytics': { label: 'Advanced Analytics', parent: '/manager-dashboard' },
    '/reporting-and-analytics-hub': { label: 'Reports & Analytics', parent: '/manager-dashboard' },
    '/sla-policies': { label: 'SLA Policies', parent: '/manager-dashboard' },
    '/ticket-sla': { label: 'Ticket SLA', parent: '/manager-dashboard' },
    '/priorities': { label: 'Priorities', parent: '/manager-dashboard' },
    '/escalations': { label: 'Escalations', parent: '/manager-dashboard' },
    '/monitoring-events': { label: 'Monitoring Events', parent: '/manager-dashboard' },
    '/problems': { label: 'Problems', parent: '/manager-dashboard' },
    '/knowledge-base': { label: 'Knowledge Base', parent: '/customer-portal' },
    '/settings': { label: 'Settings', parent: null },
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    const currentRoute = routeMap[location.pathname];

    if (!currentRoute) return breadcrumbs;

    if (currentRoute.parent) {
      const parentRoute = routeMap[currentRoute.parent];
      if (parentRoute) {
        breadcrumbs.push({
          label: parentRoute.label,
          path: currentRoute.parent,
        });
      }
    }

    breadcrumbs.push({
      label: currentRoute.label,
      path: location.pathname,
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleClick = (path) => {
    if (path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground px-4 py-3 bg-muted/30 border-b border-border">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <button
            onClick={() => handleClick(crumb.path)}
            className={`hover:text-blue-600 transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-foreground font-medium cursor-default'
                : 'text-primary hover:underline'
            }`}
            disabled={index === breadcrumbs.length - 1}
          >
            {crumb.label}
          </button>
          {index < breadcrumbs.length - 1 && (
            <Icon
              name="ChevronRight"
              size={14}
              className="text-muted-foreground"
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbTrail;
