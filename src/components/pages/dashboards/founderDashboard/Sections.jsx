import { ChevronRight, Plus, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import StartupCard from "./StartupFounderCard";

/**
 * The founder's portfolio grid.
 *
 * No panel of its own — it renders inside a DashboardWidget, which already
 * supplies the surface and heading. Nesting a second bordered box here was
 * producing double chrome on every dashboard.
 */
function StartupSection({ startups = [] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {startups.map(({ startup, stats }) => (
          <StartupCard key={startup.id} startup={startup} stats={stats} />
        ))}

        <Link
          to="/register-startup"
          className="flex flex-col items-center justify-center min-h-[180px] rounded-2xl border border-dashed border-white/15 text-dim transition-colors hover:border-gold/50 hover:text-gold hover:bg-gold/[0.04]"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="text-[0.92rem]">Create a new startup</span>
        </Link>
      </div>

      {startups.length > 0 && (
        <Link
          to="/my-startups"
          className="self-start font-mono text-[10.5px] tracking-[0.18em] uppercase text-dim hover:text-gold transition-colors flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

/**
 * Standalone titled surface, for pages that aren't dashboard widgets.
 * Inside a DashboardGrid, use the widget's own title instead.
 */
function Section({ icon: Icon, title, subtitle, action, children }) {
  return (
    <section className="cosmos-panel p-6 space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-3 items-center min-w-0">
          {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color: "var(--cosmos-accent, #ffbf5e)" }} />}
          <div className="min-w-0">
            <h3 className="font-display text-[1.05rem] text-star truncate">{title}</h3>
            {subtitle && <p className="cosmos-stat-label">{subtitle}</p>}
          </div>
        </div>
        {action && (
          <Link
            to={action.href}
            className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-dim hover:text-gold transition-colors flex items-center gap-1 shrink-0"
          >
            {action.label}
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export { Section, StartupSection, Rocket };
