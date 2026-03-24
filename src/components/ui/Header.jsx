import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import notificationService from '../../services/notificationService';

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [userRole, setUserRole] = useState('IT Service Manager');

  // Simulate connection status monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['connected', 'warning', 'error'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      setConnectionStatus(randomStatus);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Use empty array - notificationService provides fallback internally
      setNotifications([]);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Simulate critical alerts
  useEffect(() => {
    const interval = setInterval(() => {
      setCriticalAlerts(Math.floor(Math.random() * 5));
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  const navigationItems = [
    {
      label: 'Operations',
      path: '/it-operations-command-center',
      icon: 'Activity',
      description: 'Real-time monitoring and incident response'
    },
    {
      label: 'Analytics',
      path: '/service-performance-analytics',
      icon: 'BarChart3',
      description: 'Performance analysis and reporting',
      submenu: [
        { label: 'Service Performance', path: '/service-performance-analytics' },
        { label: 'Change Management', path: '/change-management-dashboard' },
        { label: 'Asset Lifecycle', path: '/asset-lifecycle-management' }
      ]
    },
    {
      label: 'Executive',
      path: '/executive-it-service-summary',
      icon: 'TrendingUp',
      description: 'Strategic overview and business metrics'
    }
  ];

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return 'Wifi';
      case 'warning': return 'WifiOff';
      case 'error': return 'AlertTriangle';
      default: return 'Wifi';
    }
  };

  const isActiveRoute = (path) => {
    if (path === '/service-performance-analytics') {
      return ['/service-performance-analytics', '/change-management-dashboard', '/asset-lifecycle-management']?.includes(location?.pathname);
    }
    return location?.pathname === path;
  };

  return (
    <>
      {/* Critical Alert Banner */}
      {criticalAlerts > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-error text-error-foreground px-4 py-3 z-1100 operations-shadow">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Icon name="AlertTriangle" size={20} className="animate-pulse" />
              <span className="font-medium">
                {criticalAlerts} Critical Alert{criticalAlerts > 1 ? 's' : ''} - Immediate Action Required
              </span>
            </div>
            <Link to="/it-operations-command-center">
              <Button variant="ghost" size="sm" className="text-error-foreground hover:bg-error/20">
                View Details
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
      {/* Main Header */}
      <header className={`fixed top-0 left-0 right-0 bg-card border-b border-border z-1000 operations-shadow ${criticalAlerts > 0 ? 'mt-14' : ''}`}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/it-operations-command-center" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground font-heading">
                  ITSM Hub
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <div key={item?.path} className="relative group">
                <Link
                  to={item?.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md nav-transition ${
                    isActiveRoute(item?.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted hover:text-foreground'
                  }`}
                  title={item?.description}
                >
                  <Icon name={item?.icon} size={18} />
                  <span className="font-medium">{item?.label}</span>
                </Link>

                {/* Submenu for Analytics */}
                {item?.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md operations-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-1200">
                    <div className="py-2">
                      {item?.submenu?.map((subItem) => (
                        <Link
                          key={subItem?.path}
                          to={subItem?.path}
                          className={`block px-4 py-2 text-sm nav-transition ${
                            location?.pathname === subItem?.path
                              ? 'bg-primary text-primary-foreground'
                              : 'text-popover-foreground hover:bg-muted'
                          }`}
                        >
                          {subItem?.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="hidden md:flex items-center space-x-2" title={`Connection: ${connectionStatus}`}>
              <Icon 
                name={getConnectionStatusIcon()} 
                size={18} 
                className={`${getConnectionStatusColor()} micro-interaction`}
              />
            </div>

            {/* Quick Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" title="Refresh Data">
                <Icon name="RefreshCw" size={18} />
              </Button>
              
              {/* Notification Bell */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  title="Notifications"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative"
                >
                  <Icon name="Bell" size={18} className={unreadCount > 0 ? 'text-blue-600 animate-pulse' : ''} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border-2 border-white rounded-full"></span>
                  )}
                </Button>

                {isNotificationsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50 animate-slide-up">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      <button 
                        onClick={() => notificationService.markAllAsRead().then(fetchNotifications)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Icon name="Inbox" size={32} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm italic">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            onClick={() => handleMarkAsRead(n.id)}
                          >
                            <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded-full ${n.type === 'Success' ? 'bg-green-100 text-green-600' : n.type === 'Warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Icon name={n.type === 'Success' ? 'CheckCircle' : n.type === 'Warning' ? 'AlertCircle' : 'Info'} size={14} />
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm ${!n.isRead ? 'font-bold' : 'font-medium'} text-gray-900`}>{n.title}</p>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" title="Export Report">
                <Icon name="Download" size={18} />
              </Button>
            </div>

            {/* User Context Panel */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <span className="hidden md:block text-sm font-medium">{userRole}</span>
                <Icon name="ChevronDown" size={16} className="hidden md:block" />
              </Button>

              {/* User Dropdown */}
              <div className="absolute top-full right-0 mt-1 w-64 bg-popover border border-border rounded-md operations-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition z-1200">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-popover-foreground">{userRole}</p>
                    <p className="text-xs text-muted-foreground">Operations Center</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">
                    Dashboard Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">
                    Notification Preferences
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">
                    Switch Role
                  </button>
                  <div className="border-t border-border mt-2 pt-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-muted nav-transition">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <div key={item?.path}>
                  <Link
                    to={item?.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-md nav-transition ${
                      isActiveRoute(item?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon name={item?.icon} size={20} />
                    <div>
                      <div className="font-medium">{item?.label}</div>
                      <div className="text-xs text-muted-foreground">{item?.description}</div>
                    </div>
                  </Link>

                  {/* Mobile Submenu */}
                  {item?.submenu && isActiveRoute(item?.path) && (
                    <div className="ml-8 mt-2 space-y-1">
                      {item?.submenu?.map((subItem) => (
                        <Link
                          key={subItem?.path}
                          to={subItem?.path}
                          className={`block px-4 py-2 text-sm rounded-md nav-transition ${
                            location?.pathname === subItem?.path
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {subItem?.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile Connection Status */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border mt-4">
                <span className="text-sm text-muted-foreground">Connection Status</span>
                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getConnectionStatusIcon()} 
                    size={16} 
                    className={getConnectionStatusColor()}
                  />
                  <span className={`text-sm capitalize ${getConnectionStatusColor()}`}>
                    {connectionStatus}
                  </span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;