export default function UserAdminItems({ user, setActiveUser }) {
  const isVerified = user.isEmailVerified;

  return (
    <li
      onClick={() => setActiveUser(user)}
      className="
        group cursor-pointer
        rounded-xl border border-gray-700/40
        bg-gray-800/40 p-4
        hover:bg-gray-700/40 hover:border-gray-600
        transition-all
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white leading-tight">
            {user.fullName}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {user.email}
          </p>
        </div>

        {/* Status badge */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium
            ${
              user.status === "active"
                ? "bg-green-500/10 text-green-400"
                : "bg-gray-500/10 text-gray-400"
            }`}
        >
          {user.status}
        </span>
      </div>

      {/* Role + verification */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 capitalize">
          {user.role}
        </span>

        <span
          className={`text-xs px-2 py-0.5 rounded-md
            ${
              isVerified
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
        >
          {isVerified ? "Email verified" : "Email not verified"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-300">
        <div>
          <span className="block text-gray-500">Startups</span>
          <span className="font-medium">
            {user.active_startups_count}
          </span>
        </div>

        <div>
          <span className="block text-gray-500">Satisfaction</span>
          <span className="font-medium">
            {user.satisfaction_percentage}%
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </span>

        <span className="opacity-0 group-hover:opacity-100 transition">
          View details →
        </span>
      </div>
    </li>
  );
}
