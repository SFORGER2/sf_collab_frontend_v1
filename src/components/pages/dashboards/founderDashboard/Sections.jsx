import { ChevronRight, Plus, Rocket } from "lucide-react";
import StartupCard from "./StartupFounderCard";
import { Link } from "react-router-dom";

function StartupSection({ startups = [] }) {


  return (
    <Section
      icon={Rocket}
      title="My Startups"
      subtitle="Your active ventures"
      action={{ label: "View All", href: "/my-startups" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {startups.map(({ startup, stats }) => (
          <StartupCard key={startup.id} startup={startup} stats={stats} />
        ))}
        <Link
          to="/register-startup"
          className="flex flex-col items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 text-white/50 hover:text-purple-400 transition"
        >
          <Plus className="w-6 h-6 mb-2" />
          Create New Startup
        </Link>
      </div>
    </Section>
  );
}

function Section({ icon: Icon, title, subtitle, action, children }) {
  return (
    <section className="rounded-xl bg-white/[0.03] border border-white/10 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Icon className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
        </div>
        {action && (
          <Link
            to={action.href}
            className="text-xs text-white/50 hover:text-white flex items-center gap-1"
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

export { Section, StartupSection };