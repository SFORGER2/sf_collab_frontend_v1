import { API_BASE_URL } from "@/utils/config";
import { Stat } from "./Stats";
import { MapPin, MoreHorizontal, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export default function StartupCard({ startup, stats }) {
  return (
    <Link
      to={`/startup-details/${startup.id}`}
      className="relative rounded-xl bg-gradient-to-br from-purple-900/20 to-slate-900/20 border border-purple-500/20 p-5 hover:border-purple-500/50 transition overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/10 transition" />
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {startup.logo_url ? (
              <img
                src={
                  startup.logo_url.startsWith("http")
                    ? startup.logo_url
                    : `${API_BASE_URL}/${startup.logo_url}`
                }
                alt={startup.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Rocket className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-semibold text-white truncate">{startup.name}</h4>
              <p className="text-xs text-white/50 truncate">{startup.industry}</p>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-white/40 flex-shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <Stat label="Members" value={stats.members - 1} /> {/* Exclude founder from member count */}
          <Stat label="Tasks" value={stats.tasks} />
          <Stat label="Requests" value={stats.pendingJoinRequests} />
          <Stat label="Revenue" value={`$${(stats.revenue || 0).toLocaleString()}`} />
        </div>
        <div className="flex items-center gap-4 text-xs text-white/50 pt-2 border-t border-white/10">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {startup.location || "Remote"}
          </span>
          <span className="px-2 py-1 rounded bg-purple-600/30 text-purple-300">
            {startup.stage}
          </span>
        </div>
      </div>
      <Link to={`/startup-details/${startup.id}`} className="absolute inset-0" />
    </Link>
  );
}
