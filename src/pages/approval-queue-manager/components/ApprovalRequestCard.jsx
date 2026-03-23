import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApprovalRequestCard = ({ request, onSelect, isSelected, onApprove, onDeny }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
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
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'approved':
        return 'bg-success/10 text-success';
      case 'denied':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSLAStatus = (hoursRemaining) => {
    if (hoursRemaining < 0) return { color: 'text-error', icon: 'AlertTriangle', label: 'Overdue' };
    if (hoursRemaining < 4) return { color: 'text-warning', icon: 'Clock', label: 'Urgent' };
    return { color: 'text-success', icon: 'Clock', label: 'On Track' };
  };

  const slaStatus = getSLAStatus(request?.slaHoursRemaining);

  return (
    <div
      className={`bg-card border rounded-lg p-4 transition-smooth hover:shadow-elevation-2 cursor-pointer ${
        isSelected ? 'border-primary shadow-elevation-2' : 'border-border'
      }`}
      onClick={() => onSelect(request)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e?.stopPropagation();
              onSelect(request);
            }}
            className="mt-1 w-4 h-4 rounded border-border focus-ring"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm md:text-base text-foreground truncate">
                {request?.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getUrgencyColor(request?.urgency)}`}>
                {request?.urgency?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
              {request?.type}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request?.status)}`}>
          {request?.status}
        </span>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Icon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">{request?.requester}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Icon name="Building2" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">{request?.department}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Icon name="Calendar" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">{request?.submissionDate}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Icon name={slaStatus?.icon} size={14} className={`${slaStatus?.color} flex-shrink-0`} />
          <span className={slaStatus?.color}>
            {request?.slaHoursRemaining < 0 
              ? `${Math.abs(request?.slaHoursRemaining)}h overdue` 
              : `${request?.slaHoursRemaining}h remaining`}
          </span>
        </div>
      </div>
      {request?.value && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-muted rounded">
          <Icon name="DollarSign" size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{request?.value}</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          iconName="Check"
          iconPosition="left"
          onClick={(e) => {
            e?.stopPropagation();
            onApprove(request);
          }}
          className="flex-1"
        >
          Approve
        </Button>
        <Button
          variant="danger"
          size="sm"
          iconName="X"
          iconPosition="left"
          onClick={(e) => {
            e?.stopPropagation();
            onDeny(request);
          }}
          className="flex-1"
        >
          Deny
        </Button>
      </div>
    </div>
  );
};

export default ApprovalRequestCard;