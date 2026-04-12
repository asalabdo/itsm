import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import SLAIndicator from './SLAIndicator';

const TicketTableRow = ({ ticket, onStatusChange }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}`);
  };

  const handleReply = (e) => {
    e?.stopPropagation();
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}?tab=reply`);
  };

  const handleMoreActions = (e) => {
    e?.stopPropagation();
    const ticketId = ticket?.backendId ?? ticket?.id;
    navigate(`/ticket-details/${ticketId}?tab=activity`);
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth cursor-pointer" onClick={handleViewDetails}>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ticket?.unread ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon name="Ticket" size={16} color={ticket?.unread ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} className="md:w-5 md:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-medium text-foreground truncate">#{ticket?.id}</p>
            {ticket?.unread && (
              <span className="inline-flex items-center gap-1 text-xs text-primary caption">
                <Icon name="Circle" size={8} color="var(--color-primary)" />
                New
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <div className="min-w-0">
          <p className="text-sm md:text-base font-medium text-foreground truncate">{ticket?.customer}</p>
          <p className="text-xs md:text-sm text-muted-foreground truncate caption">{ticket?.email}</p>
        </div>
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <p className="text-sm md:text-base text-foreground line-clamp-2">{ticket?.subject}</p>
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <PriorityBadge priority={ticket?.priority} />
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <StatusBadge status={ticket?.status} />
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <SLAIndicator timeRemaining={ticket?.slaRemaining} breached={ticket?.slaBreached} />
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4">
        <p className="text-xs md:text-sm text-muted-foreground whitespace-nowrap caption">{ticket?.lastUpdated}</p>
      </td>
      <td className="px-3 md:px-4 py-3 md:py-4" onClick={(e) => e?.stopPropagation()}>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant="ghost"
            size="icon"
            iconName="Eye"
            iconSize={16}
            onClick={handleViewDetails}
            className="w-8 h-8 md:w-9 md:h-9"
          />
          <Button
            variant="ghost"
            size="icon"
            iconName="MessageSquare"
            iconSize={16}
            onClick={handleReply}
            className="w-8 h-8 md:w-9 md:h-9"
          />
          <Button
            variant="ghost"
            size="icon"
            iconName="MoreVertical"
            iconSize={16}
            onClick={handleMoreActions}
            className="w-8 h-8 md:w-9 md:h-9"
          />
        </div>
      </td>
    </tr>
  );
};

export default TicketTableRow;
