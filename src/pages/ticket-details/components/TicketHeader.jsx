import React from 'react';
import Icon from '../../../components/AppIcon';
import { formatLocalizedValue, getLocalizedDisplayName } from '../../../services/displayValue';
import { useLanguage } from '../../../context/LanguageContext';
import { getTranslation } from '../../../services/i18n';

const TicketHeader = ({ ticket }) => {
  const { language } = useLanguage();
  const t = (key, fallback) => getTranslation(language, key, fallback);
  const customer = ticket?.customer || ticket?.requestedBy || {};
  const createdAt = ticket?.createdAt ? new Date(ticket.createdAt) : null;
  const slaDeadline = ticket?.slaDeadline || ticket?.slaDueDate || (createdAt ? createdAt.toLocaleString() : '-');
  const slaRemaining = ticket?.slaRemaining || (
    ticket?.slaRemainingMinutes != null
      ? `${ticket.slaRemainingMinutes} ${t('minRemaining', 'min remaining')}`
      : ticket?.slaStatus
  );
  const assignedName = getLocalizedDisplayName(ticket?.assignedTo) || t('unassigned', 'Unassigned');
  const assignedRole = formatLocalizedValue(
    ticket?.assignedTo?.role ||
      ticket?.assignedTo?.jobTitle ||
      ticket?.assignedTo?.department ||
      ''
  );

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'medium':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'in progress':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'resolved':
        return 'bg-success/10 text-success border-success/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'incident':
        return 'AlertCircle';
      case 'problem':
        return 'AlertTriangle';
      case 'change':
        return 'RefreshCw';
      default:
        return 'Ticket';
    }
  };

  const getTranslatedPriority = (priority) => {
    if (!priority) return priority;
    const priorityMap = {
      'critical': 'critical',
      'urgent': 'urgent',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    const key = priorityMap[priority.toLowerCase()];
    return key ? t(key, priority) : priority;
  };

  const getTranslatedStatus = (status) => {
    if (!status) return status;
    const statusMap = {
      'open': 'statusOpen',
      'in progress': 'statusInProgress',
      'assigned': 'assigned',
      'pending': 'statusPending',
      'resolved': 'statusResolved',
      'closed': 'statusClosed',
      'pending customer': 'statusPendingCustomer'
    };
    const key = statusMap[status.toLowerCase()];
    return key ? t(key, status) : status;
  };

  const getTranslatedCategory = (category) => {
    if (!category) return category;
    const categoryMap = {
      'incident': 'categoryIncident',
      'problem': 'categoryProblem',
      'change': 'categoryChange'
    };
    const key = categoryMap[category.toLowerCase()];
    return key ? t(key, category) : category;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 shadow-elevation-1">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground truncate">
              {ticket?.title}
            </h1>
            <span className="text-lg md:text-xl text-muted-foreground whitespace-nowrap">
              #{ticket?.id}
            </span>
          </div>
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
            {ticket?.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border ${getPriorityColor(ticket?.priority)}`}>
            {getTranslatedPriority(ticket?.priority)}
          </span>
          <span className={`px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border ${getStatusColor(ticket?.status)}`}>
            {getTranslatedStatus(ticket?.status)}
          </span>
          <span className="px-3 py-1.5 text-xs md:text-sm font-medium rounded-md border bg-muted text-foreground border-border flex items-center gap-2">
            <Icon name={getCategoryIcon(ticket?.category)} size={16} />
            {getTranslatedCategory(ticket?.category)}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={20} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{t('customer', 'Customer')}</p>
            <p className="text-sm md:text-base font-medium text-foreground truncate">
              {getLocalizedDisplayName(customer) || t('unassigned', 'Unassigned')}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {customer?.email || customer?.role || ''}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
            <Icon name="UserCheck" size={20} color="var(--color-success)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{t('assignedTo', 'Assigned To')}</p>
            <p className="text-sm md:text-base font-medium text-foreground truncate">{assignedName}</p>
            <p className="text-xs md:text-sm text-muted-foreground truncate">{assignedRole}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Icon name="Clock" size={20} color="var(--color-warning)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground mb-1">{t('slaDeadline', 'SLA Deadline')}</p>
            <p className="text-sm md:text-base font-medium text-foreground">{slaDeadline}</p>
            <p className="text-xs md:text-sm text-warning">{slaRemaining}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Icon name="Calendar" size={20} color="var(--color-muted-foreground)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{t('created', 'Created')}</p>
            <p className="text-sm md:text-base font-medium text-foreground">
              {createdAt ? createdAt.toLocaleDateString() : ticket?.createdDate}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {createdAt ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ticket?.createdTime}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketHeader;
