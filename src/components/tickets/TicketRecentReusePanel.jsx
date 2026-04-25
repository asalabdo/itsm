import Icon from '../AppIcon';

const TicketRecentReusePanel = ({
  tickets = [],
  loading = false,
  onSelect,
  title,
  description,
  emptyLabel,
  compact = false,
}) => {
  return (
    <section className={`bg-card border border-border rounded-2xl shadow-elevation-1 ${compact ? 'p-4' : 'p-4 md:p-6'}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-left">
          {title ? <h2 className="text-base font-semibold text-foreground">{title}</h2> : null}
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {loading ? <span className="text-xs text-muted-foreground">Loading...</span> : null}
      </div>
      <div className="space-y-2">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <button
              key={ticket?.id}
              type="button"
              onClick={() => onSelect?.(ticket)}
              className={`w-full text-left rounded-xl border border-border bg-background ${compact ? 'p-3' : 'p-3'} hover:border-primary/40 hover:shadow-elevation-2 transition-all`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-left">
                  <div className="text-sm font-semibold text-foreground truncate text-left">
                    {ticket?.ticketNumber || `TKT-${ticket?.id}`}
                  </div>
                  <div className="text-xs text-muted-foreground truncate text-left">
                    {ticket?.title || 'Untitled ticket'}
                  </div>
                </div>
                <Icon name="RotateCcw" size={16} className="text-primary shrink-0" />
              </div>
            </button>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </section>
  );
};

export default TicketRecentReusePanel;
