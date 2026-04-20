import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getDisplayName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
  user?.name ||
  user?.fullName ||
  user?.username ||
  'Administrator';

const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const currentUser = getStoredUser();
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const navSections = [
    {
      title: t('tickets', 'Tickets'),
      icon: 'Ticket',
      items: [
        { label: t('agentDashboard', 'Agent Dashboard'), path: '/agent-dashboard', icon: 'Ticket' },
        { label: t('myWork', 'My Work'), path: '/my-work', icon: 'LayoutDashboard' },
        { label: t('newTicket', 'New Ticket'), path: '/ticket-creation', icon: 'Plus' },
        { label: t('ticketManagement', 'Ticket Management'), path: '/ticket-management-center', icon: 'Settings' },
        { label: t('sla', 'SLA'), path: '/ticket-sla', icon: 'Clock3' },
        { label: t('employeePortal', 'Employee Portal'), path: '/customer-portal', icon: 'Users' },
      ],
    },
    {
      title: t('fulfillment', 'Fulfillment'),
      icon: 'Layers3',
      items: [
        { label: t('workCenter', 'Work Center'), path: '/service-request-management', icon: 'Layers3' },
        { label: t('fulfillmentCenter', 'Fulfillment Center'), path: '/fulfillment-center', icon: 'ClipboardCheck' },
        { label: t('serviceCatalog', 'Service Catalog'), path: '/service-catalog', icon: 'ShoppingBag' },
        { label: t('assetRegistry', 'Asset Registry'), path: '/asset-registry-and-tracking', icon: 'Package' },
        { label: t('changeManagement', 'Change Management'), path: '/change-management', icon: 'GitPullRequest' },
        { label: t('incidentManagement', 'Incident Management'), path: '/incident-management-workflow', icon: 'AlertTriangle' },
        { label: t('knowledgeBase', 'Knowledge Base'), path: '/knowledge-base', icon: 'BookOpen' },
      ],
    },
    {
      title: t('operations', 'Operations'),
      icon: 'Activity',
      items: [
        { label: t('itOperationsCenter', 'IT Operations Center'), path: '/it-operations-command-center', icon: 'Activity' },
        { label: t('executiveSummary', 'Executive Summary'), path: '/executive-it-service-summary', icon: 'BarChart3' },
        { label: t('monitoringEvents', 'Monitoring Events'), path: '/monitoring-events', icon: 'Radar' },
        { label: t('problems', 'Problems'), path: '/problems', icon: 'Bug' },
        // { label: t('reportsAnalytics', 'Reports Hub'), path: '/reporting-and-analytics-hub', icon: 'LineChart' },
        { label: t('servicePerformance', 'Service Analytics'), path: '/service-performance-analytics', icon: 'TrendingUp' },
        { label: t('advancedAnalytics', 'Advanced Analytics'), path: '/advanced-analytics', icon: 'Sparkles' },
        { label: t('scenarioValidation', 'Scenario Validation'), path: '/scenario-validation-center', icon: 'TestTube' },
      ],
    },
    {
      title: t('admin', 'Admin'),
      icon: 'ShieldCheck',
      items: [
        { label: t('slaPolicies', 'SLA Policies'), path: '/sla-policies', icon: 'ShieldCheck' },
        { label: t('priorities', 'Priorities'), path: '/priorities', icon: 'Flag' },
        { label: t('escalations', 'Escalations'), path: '/escalations', icon: 'ArrowUpRight' },
        { label: t('ticketWorkflow', 'Ticket Workflow'), path: '/ticket-workflow-crud', icon: 'Workflow' },
        { label: t('workflowBuilder', 'Workflow Builder'), path: '/workflow-builder-studio', icon: 'GitBranch' },
        { label: t('automationRules', 'Automation Rules'), path: '/automation-rules', icon: 'Cpu' },
        { label: t('approvalQueue', 'Approval Queue'), path: '/approval-queue-manager', icon: 'ClipboardCheck' },
        { label: t('auditTrail', 'Audit Trail'), path: '/audit-trail-and-compliance-viewer', icon: 'ShieldAlert' },
        { label: t('dataManagement', 'Data Management'), path: '/manage', icon: 'Database' },
        { label: t('userManagement', 'User Management'), path: '/user-management', icon: 'UserCircle' },
        { label: t('settings', 'Settings'), path: '/settings', icon: 'Settings' },
        { label: t('ticketChatbot', 'Ticket Chatbot'), path: '/ticket-chatbot', icon: 'Bot' },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (items) => items.some((item) => isActive(item.path));

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-72'} h-[calc(100vh-4rem)] sticky top-16 bg-card text-foreground flex flex-col transition-all duration-300 ${isRtl ? 'border-l border-border' : 'border-r border-border'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 custom-scrollbar">
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-10 h-10 mx-auto mb-6 flex items-center justify-center rounded-xl bg-muted hover:bg-primary text-muted-foreground hover:text-primary-foreground transition-colors border border-border"
          >
            <Icon name={isRtl ? 'ChevronLeft' : 'ChevronRight'} size={18} />
          </button>
        )}

        <div className="space-y-5">
          {navSections.map((section) => {
            const active = isSectionActive(section.items);
            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {section.title}
                  </p>
                )}
                <Link
                  to={section.items[0].path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors group relative overflow-hidden ${
                    active
                      ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                      : 'hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {active && (
                    <div className={`absolute top-1/4 bottom-1/4 w-1 bg-primary ${isRtl ? 'right-0 rounded-l-full' : 'left-0 rounded-r-full'}`} />
                  )}
                  <div className={active ? 'text-primary' : 'text-muted-foreground'}>
                    <Icon name={section.icon} size={20} />
                  </div>
                  {!collapsed && <span className="text-sm tracking-wide">{section.title}</span>}
                  {active && !collapsed && (
                    <div className={`${isRtl ? 'mr-auto' : 'ml-auto'} w-1.5 h-1.5 rounded-full bg-primary`} />
                  )}
                </Link>

                {!collapsed && (
                  <div className={`${isRtl ? 'mr-10 border-r pr-4' : 'ml-10 border-l pl-4'} mt-2 space-y-1 border-border`}>
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 py-2 text-sm transition-colors ${
                          isActive(item.path)
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className={`w-1 h-1 rounded-full ${isActive(item.path) ? 'bg-primary' : 'bg-border'}`} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-muted/40 border-t border-border">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent border border-border flex items-center justify-center text-primary-foreground font-bold text-xs">
            AD
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{getDisplayName(currentUser)}</span>
              <span className="text-[10px] text-muted-foreground truncate">{currentUser?.email || currentUser?.username || 'admin@itsm.com'}</span>
            </div>
          )}
          {!collapsed && <Icon name="LogOut" size={14} className={`${isRtl ? 'mr-auto' : 'ml-auto'} text-muted-foreground group-hover:text-error transition-colors`} />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
