import React, { useState, useEffect, useRef } from 'react';
import Icon from '../AppIcon';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'SLA Breach Alert',
      message: 'Ticket #4521 approaching SLA deadline in 15 minutes',
      time: '2 min ago',
      read: false,
    },
    {
      id: 2,
      type: 'update',
      title: 'Ticket Assigned',
      message: 'New ticket #4523 has been assigned to you',
      time: '10 min ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'Employee Response',
      message: 'Employee replied to ticket #4518',
      time: '1 hour ago',
      read: true,
    },
    {
      id: 4,
      type: 'success',
      title: 'Ticket Resolved',
      message: 'Ticket #4515 marked as resolved',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const dropdownRef = useRef(null);
  const unreadCount = notifications?.filter((n) => !n?.read)?.length;

  useEffect(() => {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent':
        return { name: 'AlertCircle', color: 'var(--color-error)' };
      case 'update':
        return { name: 'Bell', color: 'var(--color-primary)' };
      case 'success':
        return { name: 'CheckCircle', color: 'var(--color-success)' };
      default:
        return { name: 'Info', color: 'var(--color-muted-foreground)' };
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev?.map((notif) =>
        notif?.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev?.map((notif) => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-md hover:bg-muted transition-smooth"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-popover border border-border rounded-md shadow-elevation-3 z-dropdown overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </button>
              )}
              {notifications?.length > 0 && (
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Icon name="Bell" size={48} className="mx-auto mb-3 opacity-30" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications?.map((notification) => {
                const icon = getNotificationIcon(notification?.type);
                return (
                  <div
                    key={notification?.id}
                    className={`p-4 border-b border-border hover:bg-muted cursor-pointer transition-smooth ${
                      !notification?.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => markAsRead(notification?.id)}
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
                  </div>
                );
              })
            )}
          </div>

          {notifications?.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <button className="text-sm text-primary hover:underline">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;