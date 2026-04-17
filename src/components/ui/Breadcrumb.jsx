import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const Breadcrumb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const pathMap = {
    '/agent-dashboard': t('agentDashboard', 'Dashboard'),
    '/agent-ticket-view': t('allTickets', 'All Tickets'),
    '/create-ticket': t('createTicket', 'Create Ticket'),
    '/ticket-details': t('ticketDetails', 'Ticket Details'),
    '/dashboard': t('dashboard', 'Dashboard'),
    '/profile': t('profile', 'Profile'),
    '/settings': t('settings', 'Settings')
  };

  const generateBreadcrumbs = () => {
    const paths = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: t('home', 'Home'), path: '/' }];

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
    <nav className="breadcrumb-container" dir={isRtl ? 'rtl' : 'ltr'}>
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          <span
            className={`breadcrumb-item ${index === breadcrumbs?.length - 1 ? 'active' : ''}`}
            onClick={() => index !== breadcrumbs?.length - 1 && handleBreadcrumbClick(crumb?.path)}
          >
            {crumb?.label}
          </span>
          {index < breadcrumbs?.length - 1 && (
            <Icon 
              name={isRtl ? 'ChevronLeft' : 'ChevronRight'} 
              size={14} 
              className="breadcrumb-separator" 
            />
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;