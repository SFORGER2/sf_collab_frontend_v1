import { BrainCircuit, CheckSquare, Lightbulb, Plus, Rocket, Users } from "lucide-react";
import { QuickAction, QuickStat } from "./Quicks";

function Stat({ label, value }) {
  return (
    <div>
      <p className="cosmos-stat-label">{label}</p>
      <p className="text-star font-medium">{value}</p>
    </div>
  );
}

/**
 * The founder's headline numbers. Gold throughout — founder is the gold
 * profile in the landing page's five-force palette.
 */
function FounderStats({ totals, startups }) {
  const primaryStartup =
    startups.length === 1 ? `/startup-details/${startups[0].startup.id}` : "/my-startups";

  return (
    <div className="flex flex-wrap gap-3.5">
      <QuickStat label="Startups" value={startups.length} icon={Rocket} to={primaryStartup} />
      <QuickStat
        label="Team members"
        value={Math.max(0, totals.members - startups.length)}
        icon={Users}
        to={primaryStartup}
      />
      <QuickStat label="Open tasks" value={totals.tasks} icon={CheckSquare} to="/erp/tasks" />
      <QuickStat label="Pending requests" value={totals.pending} icon={Users} to="/founder/my-applications" />
    </div>
  );
}

/** The four things a founder reaches for most. */
function FounderQuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      <QuickAction label="Create Vision" href="/ideation" icon={Plus} accent="#ffbf5e" />
      <QuickAction label="Ideation" href="/ideation" icon={Lightbulb} accent="#ffbf5e" />
      <QuickAction label="Find Builders" href="/discover-users" icon={Users} accent="#4fd8ff" />
      <QuickAction label="AI Tools" href="/ai-dashboard" icon={BrainCircuit} accent="#8b6cff" />
    </div>
  );
}

export { FounderStats, FounderQuickActions, Stat };
