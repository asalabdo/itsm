import Button from '../ui/Button';
import Icon from '../AppIcon';

const TicketDuplicateSuggestions = ({
  tickets = [],
  title,
  description,
  openLabel,
  untitledLabel,
  onOpen,
}) => {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <Icon name="AlertTriangle" size={18} className="text-warning mt-0.5" />
        <div className="min-w-0 text-left">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
          <div className="mt-3 space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket?.id} className="flex items-center justify-between gap-3 rounded-lg bg-background/70 border border-border px-3 py-2">
                <div className="min-w-0 text-left">
                  <div className="text-xs font-semibold text-foreground truncate text-left">
                    {ticket?.ticketNumber || `TKT-${ticket?.id}`}
                  </div>
                  <div className="text-xs text-muted-foreground truncate text-left">
                    {ticket?.title || untitledLabel}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpen?.(ticket)}
                >
                  {openLabel}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDuplicateSuggestions;
