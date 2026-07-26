import { Link } from "react-router-dom";

/**
 * A single headline metric. Mono caption over an Unbounded numeral in the
 * accent colour — the cosmos stat treatment, shared with the landing page.
 */
function QuickStat({ label, value, icon: Icon, to }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="cosmos-stat-label">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-dim shrink-0" aria-hidden="true" />}
      </div>
      <span className="cosmos-stat-value mt-1">{value}</span>
    </>
  );

  const className =
    "cosmos-card cosmos-card-interactive p-4 flex flex-col min-w-[150px] flex-1";

  return to ? (
    <Link to={to} className={className}>{body}</Link>
  ) : (
    <div className={className.replace(" cosmos-card-interactive", "")}>{body}</div>
  );
}

/** A shortcut tile. Kept large enough to be a comfortable touch target. */
function QuickAction({ label, href, icon: Icon, accent }) {
  return (
    <Link
      to={href}
      className="cosmos-card cosmos-card-interactive p-4 flex flex-col gap-2.5"
      style={accent ? { "--cosmos-accent": accent } : undefined}
    >
      {Icon && (
        <Icon
          className="w-5 h-5"
          style={{ color: "var(--cosmos-accent, #ffbf5e)" }}
          aria-hidden="true"
        />
      )}
      <span className="text-[0.92rem] font-medium text-star">{label}</span>
    </Link>
  );
}

export { QuickStat, QuickAction };
