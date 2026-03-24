import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import entities from '../../crud/entities';
import Icon from '../AppIcon';

const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'My Tickets', path: '/agent-dashboard', icon: 'Ticket' },
    { label: 'New Ticket', path: '/ticket-creation', icon: 'Plus' },
    { label: 'Advanced Analytics', path: '/advanced-analytics', icon: 'BarChart3' },
    { label: 'Service Catalog', path: '/service-catalog', icon: 'ShoppingBag' },
    { label: 'Fulfillment Center', path: '/fulfillment-center', icon: 'ClipboardCheck' },
    { label: 'Analytics', path: '/manager-dashboard', icon: 'LineChart' },
    { label: 'Employee Portal', path: '/customer-portal', icon: 'Users' },
    { label: 'Approval Queue', path: '/approval-queue-manager', icon: 'CheckCircle' },
    { label: 'Workflow Builder', path: '/workflow-builder-studio', icon: 'GitBranch' },
    { label: 'Ticket Management', path: '/ticket-management-center', icon: 'Settings' },
    { label: 'Reports & Analytics', path: '/reporting-and-analytics-hub', icon: 'PieChart' },
    { label: 'My Work', path: '/my-work', icon: 'FileText' },
    { label: 'Asset Registry', path: '/asset-registry-and-tracking', icon: 'Package' },
    { label: 'Change Management', path: '/change-management', icon: 'GitPullRequest' },
    { label: 'Automation Rules', path: '/automation-rules', icon: 'Cpu' },
    { label: 'User Management', path: '/user-management', icon: 'UserCircle' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon
              name={collapsed ? "ChevronRight" : "ChevronLeft"}
              size={16}
              className="text-gray-500"
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Navigation */}
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive(item.path)
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Icon
              name={item.icon}
              size={20}
              className={isActive(item.path) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
            />
            {!collapsed && (
              <span className="font-medium">{item.label}</span>
            )}
          </Link>
        ))}

        {/* Divider */}
        <div className="my-4 border-t border-gray-200" />

        {/* Management Section */}
        {!collapsed && (
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Management
            </p>
          </div>
        )}

        {entities.map((entity) => (
          <Link
            key={entity.key}
            to={`/manage/${entity.key}`}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group capitalize ${location.pathname.startsWith(`/manage/${entity.key}`)
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <Icon
              name="Settings"
              size={20}
              className={location.pathname.startsWith(`/manage/${entity.key}`) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
            />
            {!collapsed && (
              <span className="font-medium">{entity.label}</span>
            )}
            {collapsed && (
              <span className="sr-only">{entity.label}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
