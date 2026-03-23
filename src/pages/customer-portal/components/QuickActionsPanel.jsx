import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const QuickActionsPanel = () => {
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyDigest: true,
  });

  const quickActions = [
    {
      id: 'track-ticket',
      title: 'Track Ticket Status',
      description: 'Get real-time updates on your ticket progress',
      icon: 'MapPin',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      action: () => console.log('Track ticket'),
    },
    {
      id: 'view-history',
      title: 'Communication History',
      description: 'Review all interactions and responses',
      icon: 'MessageSquare',
      color: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      action: () => console.log('View history'),
    },
    {
      id: 'download-reports',
      title: 'Download Reports',
      description: 'Export your ticket history and analytics',
      icon: 'Download',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10',
      action: () => console.log('Download reports'),
    },
    {
      id: 'feedback',
      title: 'Provide Feedback',
      description: 'Share your experience with our service',
      icon: 'Star',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      action: () => console.log('Provide feedback'),
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'update',
      message: 'Ticket TKT-4521 status changed to "In Progress"',
      timestamp: '2026-01-06T06:15:00',
      icon: 'RefreshCw',
    },
    {
      id: 2,
      type: 'response',
      message: 'New response from Sarah Mitchell on TKT-4518',
      timestamp: '2026-01-06T05:30:00',
      icon: 'MessageCircle',
    },
    {
      id: 3,
      type: 'resolved',
      message: 'Ticket TKT-4512 has been resolved',
      timestamp: '2026-01-05T14:20:00',
      icon: 'CheckCircle',
    },
    {
      id: 4,
      type: 'created',
      message: 'New ticket TKT-4521 created successfully',
      timestamp: '2026-01-05T10:00:00',
      icon: 'Plus',
    },
  ];

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationChange = (key) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [key]: !prev?.[key],
    }));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {quickActions?.map((action) => (
            <button
              key={action?.id}
              onClick={action?.action}
              className="group flex items-start gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary hover:shadow-elevation-2 transition-smooth text-left hover-lift"
            >
              <div className={`w-12 h-12 ${action?.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-smooth group-hover:scale-110`}>
                <Icon name={action?.icon} size={24} color={action?.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {action?.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {action?.description}
                </p>
              </div>
              <Icon name="ChevronRight" size={20} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-smooth" color="var(--color-primary)" />
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            Notification Preferences
          </h3>
          <Icon name="Bell" size={24} color="var(--color-primary)" />
        </div>
        <div className="space-y-4">
          <Checkbox
            label="Email Updates"
            description="Receive ticket updates via email"
            checked={notificationPreferences?.emailUpdates}
            onChange={() => handleNotificationChange('emailUpdates')}
          />
          <Checkbox
            label="SMS Alerts"
            description="Get urgent notifications via text message"
            checked={notificationPreferences?.smsAlerts}
            onChange={() => handleNotificationChange('smsAlerts')}
          />
          <Checkbox
            label="Push Notifications"
            description="Browser notifications for real-time updates"
            checked={notificationPreferences?.pushNotifications}
            onChange={() => handleNotificationChange('pushNotifications')}
          />
          <Checkbox
            label="Weekly Digest"
            description="Summary of your tickets and activity"
            checked={notificationPreferences?.weeklyDigest}
            onChange={() => handleNotificationChange('weeklyDigest')}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <Button variant="default" fullWidth>
            Save Preferences
          </Button>
        </div>
      </div>
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            Recent Activity
          </h3>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left">
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {recentActivity?.map((activity, index) => (
            <div
              key={activity?.id}
              className={`flex items-start gap-3 pb-4 ${
                index !== recentActivity?.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={activity?.icon} size={16} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1">{activity?.message}</p>
                <span className="text-xs text-muted-foreground caption">
                  {formatTimestamp(activity?.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button variant="outline" fullWidth iconName="History" iconPosition="left">
            View Full History
          </Button>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-success/10 rounded-lg p-6 md:p-8 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="Lightbulb" size={24} color="#FFFFFF" />
          </div>
          <div className="flex-1">
            <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">
              Pro Tip: Faster Resolution
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Include screenshots, error messages, and detailed steps to reproduce issues in your tickets. This helps our support team resolve your requests 40% faster on average.
            </p>
            <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;