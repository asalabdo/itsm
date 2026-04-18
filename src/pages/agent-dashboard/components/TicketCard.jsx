import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import SLAIndicator from './SLAIndicator';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const TicketCard = ({ ticket }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);

  const handleViewDetails = () => {
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}`);
  };

  const handleReply = () => {
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}?tab=reply`);
  };

  const handleMoreActions = () => {
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}?tab=activity`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-elevation-1 hover:shadow-elevation-2 transition-smooth">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ticket?.unread ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon name="Ticket" size={20} color={ticket?.unread ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">#{ticket?.id}</p>
            {ticket?.unread && (
              <span className="inline-flex items-center gap-1 text-xs text-primary caption">
                <Icon name="Circle" size={8} color="var(--color-primary)" />
                {t('new', 'New')}
              </span>
            )}
          </div>
        </div>
        <PriorityBadge priority={ticket?.priority} />
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1 caption">{t('customer', 'Customer')}</p>
          <p className="text-base font-medium text-foreground">{ticket?.customer}</p>
          <p className="text-sm text-muted-foreground caption">{ticket?.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1 caption">{t('subject', 'Subject')}</p>
          <p className="text-base text-foreground line-clamp-2">{ticket?.subject}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1 caption">{t('status', 'Status')}</p>
            <StatusBadge status={ticket?.status} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1 caption">SLA</p>
            <SLAIndicator timeRemaining={ticket?.slaRemaining} breached={ticket?.slaBreached} />
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground caption">{t('lastUpdated', 'Last updated')}: {formatDate(ticket?.lastUpdated)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Button
          variant="default"
          size="sm"
          iconName="Eye"
          iconPosition="left"
          onClick={handleViewDetails}
          fullWidth
        >
          {t('viewDetails', 'View Details')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          iconName="MessageSquare"
          onClick={handleReply}
          className="flex-shrink-0"
        />
        <Button
          variant="outline"
          size="sm"
          iconName="MoreVertical"
          onClick={handleMoreActions}
          className="flex-shrink-0"
        />
      </div>
    </div>
  );
};

export default TicketCard;
