const isZeroNumeric = (value) => typeof value === 'number' && Number(value) === 0;

export const ManageEngineZeroBadge = ({ label = 'No data', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-full border border-dashed border-border bg-muted/70 px-2.5 py-1 text-xs font-medium text-muted-foreground ${className}`}
  >
    {label}
  </span>
);

export const countHiddenZeroMetrics = (metrics = []) =>
  metrics.filter((metric) => metric?.hideWhenZero !== false && isZeroNumeric(metric?.value)).length;

const ManageEngineMetricCard = ({
  label,
  value,
  icon,
  helper,
  hideWhenZero = true,
}) => {
  if (hideWhenZero && isZeroNumeric(value)) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="text-xl font-semibold capitalize text-foreground">{value}</div>
      {helper ? <p className="mt-2 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
};

export default ManageEngineMetricCard;
