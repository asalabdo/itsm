import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const QuickActionsPanel = ({ tickets = [] }) => {
  const navigate = useNavigate();
  const { language, isRtl } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailUpdates: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyDigest: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('customerPortalPreferences');
    if (stored) {
      try {
        setNotificationPreferences((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch {
        // Ignore malformed values and keep defaults.
      }
    }
  }, []);

  const quickActions = [
    {
      id: 'track-ticket',
      title: t('trackTicketStatus', 'Track Ticket Status'),
      description: t('getRealTimeUpdates', 'Get real-time updates on your ticket progress'),
      icon: 'MapPin',
      color: 'var(--color-primary)',
      bgColor: 'bg-primary/10',
      action: () => navigate('/search?status=Open'),
    },
    {
      id: 'track-request',
      title: t('trackServiceRequests', 'Track Service Requests'),
      description: t('followSubmittedRequests', 'Follow submitted service requests and fulfillment progress'),
      icon: 'ClipboardList',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10',
      action: () => navigate('/service-request-management?view=requests'),
    },
    {
      id: 'view-history',
      title: t('communicationHistory', 'Communication History'),
      description: t('reviewAllInteractions', 'Review all interactions and responses'),
      icon: 'MessageSquare',
      color: 'var(--color-secondary)',
      bgColor: 'bg-secondary/10',
      action: () => {
        const latest = [...tickets].sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0))[0];
        navigate(latest?.id ? `/ticket-details/${latest.id}` : '/search');
      },
    },
    {
      id: 'download-reports',
      title: t('downloadReports', 'Download Reports'),
      description: t('exportTicketHistory', 'Export your ticket history and analytics'),
      icon: 'Download',
      color: 'var(--color-success)',
      bgColor: 'bg-success/10',
      action: () => navigate('/reports-analytics'),
    },
    {
      id: 'feedback',
      title: t('provideFeedback', 'Provide Feedback'),
      description: t('shareYourExperience', 'Share your experience with our service'),
      icon: 'Star',
      color: 'var(--color-warning)',
      bgColor: 'bg-warning/10',
      action: () => navigate('/ticket-chatbot'),
    },
  ];

  const recentActivity = [...tickets]
    .sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0))
    .slice(0, 4)
    .map((ticket, index) => ({
      id: ticket?.id || index,
      type: ticket?.status === 'Resolved' ? 'resolved' : ticket?.status === 'In Progress' ? 'update' : 'created',
      message: `${ticket?.ticketNumber || `TKT-${ticket?.id}`} status is "${ticket?.status || 'Open'}"`,
      timestamp: ticket?.updatedAt || ticket?.createdAt,
      icon: ticket?.status === 'Resolved' ? 'CheckCircle' : ticket?.status === 'In Progress' ? 'RefreshCw' : 'Plus',
      backendId: ticket?.id,
    }));

  const formatTimestamp = (dateString) => {
    if (!dateString) return t('justNow', 'Just now');
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `${diffMins} ${t('minAgo', 'min ago')}`;
    if (diffHours < 24) return `${diffHours} ${diffHours > 1 ? t('hoursAgo', 'hours ago') : t('hourAgo', 'hour ago')}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotificationChange = (key) => {
    setNotificationPreferences((prev) => {
      const next = { ...prev, [key]: !prev?.[key] };
      localStorage.setItem('customerPortalPreferences', JSON.stringify(next));
      return next;
    });
  };

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('itsm:refresh'));
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
          {t('quickActions', 'Quick Actions')}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`group flex items-start gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary hover:shadow-elevation-2 transition-smooth hover-lift`}
            >
              <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0 transition-smooth group-hover:scale-110`}>
                <Icon name={action.icon} size={24} color={action.color} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-foreground mb-1">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {action.description}
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
            {t('notificationPreferences', 'Notification Preferences')}
          </h3>
          <Icon name="Bell" size={24} color="var(--color-primary)" />
        </div>
        <div className="space-y-4">
          <Checkbox
            label={t('emailUpdates', 'Email Updates')}
            description={t('receiveTicketUpdates', 'Receive ticket updates via email')}
            checked={notificationPreferences?.emailUpdates}
            onChange={() => handleNotificationChange('emailUpdates')}
          />
          <Checkbox
            label={t('smsAlerts', 'SMS Alerts')}
            description={t('getUrgentNotifications', 'Get urgent notifications via text message')}
            checked={notificationPreferences?.smsAlerts}
            onChange={() => handleNotificationChange('smsAlerts')}
          />
          <Checkbox
            label={t('pushNotifications', 'Push Notifications')}
            description={t('browserNotifications', 'Browser notifications for real-time updates')}
            checked={notificationPreferences?.pushNotifications}
            onChange={() => handleNotificationChange('pushNotifications')}
          />
          <Checkbox
            label={t('weeklyDigest', 'Weekly Digest')}
            description={t('summaryTicketsActivity', 'Summary of your tickets and activity')}
            checked={notificationPreferences?.weeklyDigest}
            onChange={() => handleNotificationChange('weeklyDigest')}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <Button variant="default" fullWidth onClick={handleRefresh}>
            {t('refreshPortal', 'Refresh Portal')}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-elevation-2 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {t('recentActivity', 'Recent Activity')}
          </h3>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left" onClick={handleRefresh}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
            <div
              key={activity.id}
              onClick={() => activity.backendId && navigate(`/ticket-details/${activity.backendId}`)}
              className={`flex items-start gap-3 pb-4 cursor-pointer hover:bg-muted/30 rounded-lg px-2 transition-smooth ${index !== recentActivity.length - 1 ? 'border-b border-border' : ''
                }`}
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={activity.icon} size={16} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1">{activity.message}</p>
                <span className="text-xs text-muted-foreground caption">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">{t('noRecentActivity', 'No recent activity yet.')}</p>
          )}
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            fullWidth
            iconName="History"
            iconPosition="left"
            onClick={() => {
              const latest = [...tickets].sort((a, b) => new Date(b?.updatedAt || b?.createdAt || 0) - new Date(a?.updatedAt || a?.createdAt || 0))[0];
              navigate(latest?.id ? `/ticket-details/${latest.id}` : '/search');
            }}
          >
            {t('viewFullHistory', 'View Full History')}
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
              {t('proTipFasterResolution', 'Pro Tip: Faster Resolution')}
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              {t('includeScreenshots', 'Include screenshots, error messages, and detailed steps to reproduce issues in your tickets. This helps our support team resolve your requests faster.')}
            </p>
            <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right" onClick={() => navigate('/ticket-chatbot')}>
              {t('learnMore', 'Learn More')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
