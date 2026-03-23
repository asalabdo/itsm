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
    '/reports-analytics': { label: 'Reports', parent: '/manager-dashboard' },
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
    <nav className="flex items-center space-x-2 text-sm text-gray-600 py- px-4 bg-gray-50 border-b">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <button
            onClick={() => handleClick(crumb.path)}
            className={`hover:text-blue-600 transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-gray-900 font-medium cursor-default'
                : 'text-blue-600 hover:underline'
            }`}
            disabled={index === breadcrumbs.length - 1}
          >
            {crumb.label}
          </button>
          {index < breadcrumbs.length - 1 && (
            <Icon
              name="ChevronRight"
              size={14}
              className="text-gray-400"
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbTrail;