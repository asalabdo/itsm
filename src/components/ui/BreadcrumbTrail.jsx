import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const BreadcrumbTrail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const routeMap = {
    '/agent-dashboard': { label: t('myTickets', 'My Tickets'), parent: null },
    '/ticket-details': { label: t('ticketDetails', 'Ticket Details'), parent: '/agent-dashboard' },
    '/customer-portal': { label: t('employeePortal', 'Employee Portal'), parent: null },
    '/manager-dashboard': { label: t('analytics', 'Analytics'), parent: null },
    '/ticket-creation': { label: t('newTicket', 'New Ticket'), parent: null },
    '/my-work': { label: t('myWork', 'My Work'), parent: null },
    '/asset-registry-and-tracking': { label: t('assetRegistry', 'Asset Registry'), parent: null },
    '/manage/assets': { label: t('assetRegistry', 'Manage Assets'), parent: '/asset-registry-and-tracking' },
    '/reports-analytics': { label: t('reports', 'Reports'), parent: '/manager-dashboard' },
    '/advanced-analytics': { label: t('advancedAnalytics', 'Advanced Analytics'), parent: '/manager-dashboard' },
    '/reporting-and-analytics-hub': { label: t('reportsAnalytics', 'Reports & Analytics'), parent: '/manager-dashboard' },
    '/sla-policies': { label: t('slaPolicies', 'SLA Policies'), parent: '/manager-dashboard' },
    '/ticket-sla': { label: t('ticketSLA', 'Ticket SLA'), parent: '/manager-dashboard' },
    '/priorities': { label: t('priorities', 'Priorities'), parent: '/manager-dashboard' },
    '/escalations': { label: t('escalations', 'Escalations'), parent: '/manager-dashboard' },
    '/ticket-workflow-crud': { label: t('ticketWorkflow', 'Ticket Workflow'), parent: '/workflow-builder-studio' },
    '/audit-trail-and-compliance-viewer': { label: t('auditTrail', 'Audit Trail'), parent: '/manager-dashboard' },
    '/monitoring-events': { label: t('monitoringEvents', 'Monitoring Events'), parent: '/manager-dashboard' },
    '/problems': { label: t('problems', 'Problems'), parent: '/manager-dashboard' },
    '/knowledge-base': { label: t('knowledgeBase', 'Knowledge Base'), parent: '/customer-portal' },
    '/settings': { label: t('settings', 'Settings'), parent: null },
    '/manage': { label: t('dataManagement', 'Data Management'), parent: null },
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ label: t('home', 'Home'), path: '/' }];
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
    <nav className={`flex items-center gap-2 text-sm text-muted-foreground px-4 py-3 bg-muted/30 border-b border-border`} dir={isRtl ? 'rtl' : 'ltr'}>
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
              name={isRtl ? 'ChevronLeft' : 'ChevronRight'}
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
