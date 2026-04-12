import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap = {
    '/agent-dashboard': 'Dashboard',
    '/agent-ticket-view': 'All Tickets',
    '/create-ticket': 'Create Ticket',
    '/ticket-details': 'Ticket Details',
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/settings': 'Settings'
  };

  const generateBreadcrumbs = () => {
    const paths = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    paths?.forEach((path) => {
      currentPath += `/${path}`;
      const label = pathMap?.[currentPath] || path?.charAt(0)?.toUpperCase() + path?.slice(1);
      breadcrumbs?.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (path) => {
    navigate(path);
  };

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav className="breadcrumb-container">
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          <span
            className={`breadcrumb-item ${index === breadcrumbs?.length - 1 ? 'active' : ''}`}
            onClick={() => index !== breadcrumbs?.length - 1 && handleBreadcrumbClick(crumb?.path)}
          >
            {crumb?.label}
          </span>
          {index < breadcrumbs?.length - 1 && (
            <Icon name="ChevronRight" size={14} className="breadcrumb-separator" />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;