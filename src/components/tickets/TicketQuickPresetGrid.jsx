import Icon from '../AppIcon';

const TicketQuickPresetGrid = ({
  presets = [],
  onSelect,
  title,
  description,
  progressLabel,
  compact = false,
}) => {
  if (!Array.isArray(presets) || presets.length === 0) {
    return null;
  }

  return (
    <section className={`bg-card border border-border rounded-2xl shadow-elevation-1 ${compact ? 'p-4' : 'p-4 md:p-6'}`}>
      {(title || description || progressLabel) && (
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-left">
            {title ? <h2 className="text-base font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
          {progressLabel ? <div className="text-xs text-muted-foreground">{progressLabel}</div> : null}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect?.(preset)}
            className="rounded-xl border border-border bg-background p-4 text-left hover:border-primary/40 hover:shadow-elevation-2 transition-all"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="font-semibold text-foreground text-left">{preset.title}</div>
              <Icon name="Zap" size={16} className="text-primary shrink-0" />
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2 text-left">{preset.subject}</div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TicketQuickPresetGrid;
