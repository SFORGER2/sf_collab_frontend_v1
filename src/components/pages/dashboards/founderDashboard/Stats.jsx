import { BrainCircuit, CheckSquare, Layers, Lightbulb, Plus, Rocket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { QuickAction, QuickStat } from "./Quicks";

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-white/40">{label}</p>
      <p className="text-white font-medium">{value}</p>
    </div>
  );
}

function FounderStats({ totals, user, startups }) {
  return <>
    <header
      className="rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-900/40 border-purple-500/20 p-6">
      <div className="flex flex-col lg:flex-row justify-between gap-6 py-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-600">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Founder Dashboard</h1>
          </div>
          <p className="text-sm text-white/60">
            Welcome back, {user?.firstName || "Founder"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={startups.length === 1 ? `/startup-details/${startups[0].startup.id}` : "/my-startups"}
            className="flex h-full gap-3 items-center transition">
          <QuickStat
              label="Startups" value={startups.length} icon={Rocket} />
          
          
            <QuickStat label="Team Members" value={totals.members - startups.length} icon={Users} />
          </Link>
          <Link 
          to="/erp/tasks">
          <QuickStat
            
            label="Open Tasks" value={totals.tasks} icon={CheckSquare} />
          </Link>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
      <QuickAction label="Create Vision" href="/ideation" icon={Plus} />
      <QuickAction label="Ideation" href="/ideation" icon={Lightbulb} />
      <QuickAction label="Find Builders" href="/discover-users" icon={Users} />
      <QuickAction label="AI Tools" href="/ai-dashboard" icon={BrainCircuit} />
    </div>
  </>
}

export { FounderStats, Stat };