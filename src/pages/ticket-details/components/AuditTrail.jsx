import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const AuditTrail = ({ activities }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const [isExpanded, setIsExpanded] = useState(false);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'status_change':
        return { name: 'RefreshCw', color: 'var(--color-primary)' };
      case 'priority_change':
        return { name: 'AlertCircle', color: 'var(--color-warning)' };
      case 'assignment':
        return { name: 'UserCheck', color: 'var(--color-success)' };
      case 'comment':
        return { name: 'MessageSquare', color: 'var(--color-muted-foreground)' };
      case 'attachment':
        return { name: 'Paperclip', color: 'var(--color-muted-foreground)' };
      case 'escalation':
        return { name: 'AlertTriangle', color: 'var(--color-error)' };
      default:
        return { name: 'Activity', color: 'var(--color-muted-foreground)' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div
        className="p-4 md:p-6 border-b border-border cursor-pointer hover:bg-muted/30 transition-smooth"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center">
              <Icon name="History" size={18} color="var(--color-muted-foreground)" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-foreground">{t('auditTrail', 'Audit Trail')}</h3>
              <p className="text-xs md:text-sm text-muted-foreground caption">
                {activities?.length} {t('activitiesRecorded', 'activities recorded')}
              </p>
            </div>
          </div>
          <Icon
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'}
            size={20}
            color="var(--color-muted-foreground)"
          />
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 md:p-6">
          <div className="space-y-4">
            {activities?.map((activity, index) => {
              const icon = getActivityIcon(activity?.type);
              return (
                <div key={activity?.id} className="flex gap-3 md:gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon name={icon?.name} size={16} color={icon?.color} />
                    </div>
                    {index < activities?.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <p className="text-sm md:text-base text-foreground">
                        <span className="font-medium">{activity?.user}</span>{' '}
                        {activity?.action}
                      </p>
                      <span className="text-xs md:text-sm text-muted-foreground caption whitespace-nowrap">
                        {activity?.timestamp}
                      </span>
                    </div>
                    {activity?.details && (
                      <p className="text-xs md:text-sm text-muted-foreground mt-1">
                        {activity?.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;