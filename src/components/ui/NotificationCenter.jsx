import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import notificationService from '../../services/notificationService';
import { useLanguage } from '../../context/LanguageContext';
import { getTranslation } from '../../services/i18n';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isRtl, language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const normalizeNotification = (notification) => ({
    ...notification,
    read: notification?.read ?? notification?.isRead ?? false,
    createdAt: notification?.createdAt || notification?.created_at || notification?.time,
    time: notification?.time || new Date(notification?.createdAt || notification?.created_at || Date.now()).toLocaleString(),
  });

  const getNotificationIcon = (type) => {
    switch ((type || '').toLowerCase()) {
      case 'error':
      case 'urgent':
        return { name: 'AlertCircle', color: 'var(--color-error)' };
      case 'warning':
      case 'update':
        return { name: 'Bell', color: 'var(--color-primary)' };
      case 'success':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      default:
        return { name: 'Info', color: 'var(--color-muted-foreground)' };
    }
  };

  const refreshNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await refreshNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearAll = async () => {
    await markAllAsRead();
    setNotifications([]);
  };

  const resolveLink = (notification) => {
    if (notification?.link) return notification.link;

    const content = `${notification?.title || ''} ${notification?.message || ''}`;
    const codeMatch = content.match(/\b(TKT|CHG|AST)-\d+\b/i);
    if (codeMatch) {
      return `/search?q=${encodeURIComponent(codeMatch[0])}`;
    }

    return '/search';
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.read && notification?.id) {
      await markAsRead(notification.id);
    }

    navigate(resolveLink(notification));
    setIsOpen(false);
  };

  const normalized = notifications.map(normalizeNotification);
  const unreadCount = normalized.filter((n) => !n?.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-md hover:bg-muted transition-smooth"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('notificationsTitle', 'Notifications')}
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className={`absolute top-12 w-96 bg-popover border border-border rounded-md shadow-lg z-dropdown overflow-hidden ${isRtl ? 'left-0' : 'right-0'}`}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">{t('notificationsTitle', 'Notifications')}</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={markAllAsRead}
                >
                  {t('markAllReadShort', 'Mark all read')}
                </button>
              )}
              {notifications?.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearAll}
                >
                  {t('clearAll', 'Clear all')}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t('loadingNotifications', 'Loading notifications...')}</div>
            ) : normalized?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="Bell" size={48} className="mx-auto mb-3 opacity-30" />
                <p>{t('noNotifications', 'No notifications')}</p>
              </div>
            ) : (
              normalized?.map((notification) => {
                const icon = getNotificationIcon(notification?.type);
                return (
                  <button
                    key={notification?.id}
                    type="button"
                    className={`w-full p-4 border-b border-border hover:bg-muted cursor-pointer transition-smooth ${!notification?.read ? 'bg-primary/10' : ''
                      }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <Icon name={icon?.name} size={20} color={icon?.color} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground">
                            {notification?.title}
                          </h4>
                          {!notification?.read && (
                            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification?.message}
                        </p>
                        <span className="text-xs text-muted-foreground caption">
                          {notification?.time}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {normalized?.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <button className="text-sm text-primary hover:underline" onClick={() => navigate('/search')}>
                {t('viewAllNotifications', 'View all notifications')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
