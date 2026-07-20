import { useNavigate } from "react-router-dom";
import { Building2, Users, Eye, Briefcase } from "lucide-react";
import { API_URL } from "@/utils/config";

export default function StartupAdminItems({ startup }) {
  const navigate = useNavigate();

  return (
    <li
      onClick={() => navigate(`/startup-details/${startup.id}`)}
      className="
        group cursor-pointer
        rounded-xl border border-gray-700/40
        bg-gradient-to-br from-gray-800/40 to-gray-900/40
        p-4 transition
        hover:border-purple-500/40 hover:bg-gray-800/60
      "
    >
      <div className="flex gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          {startup.logo_url ? (
            <img
              src={startup.logo_url.startsWith("http") ? startup.logo_url : `${API_URL}${startup.logo_url}`}
              alt={startup.name}
              className="h-12 w-12 rounded-lg object-cover border border-gray-700"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate font-semibold text-purple-300 group-hover:text-purple-200">
              {startup.name}
            </h3>

            <span
              className={`
                text-xs px-2 py-0.5 rounded-full border
                ${
                  startup.status === "active"
                    ? "border-green-500/30 text-green-400 bg-green-500/10"
                    : "border-red-500/30 text-red-400 bg-red-500/10"
                }
              `}
            >
              {startup.status}
            </span>
          </div>

          {/* Meta */}
          <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
            <span className="capitalize">
              🚀 {startup.stage}
            </span>
            <span>
              🏭 {startup.industry}
            </span>
            {startup.location && (
              <span>
                📍 {startup.location}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {startup.memberCount} members
            </span>

            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {startup.positions} positions
            </span>

            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {startup.views} views
            </span>
          </div>

          {/* Footer */}
          <div className="mt-2 text-[11px] text-gray-500">
            Created{" "}
            {new Date(startup.createdAt).toLocaleDateString()} • Creator{" "}
            {startup.creator?.firstName} {startup.creator?.lastName}
          </div>
        </div>
      </div>
    </li>
  );
}
