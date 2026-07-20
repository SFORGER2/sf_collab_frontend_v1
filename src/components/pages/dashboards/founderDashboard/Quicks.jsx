import { Link } from "react-router-dom";

function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <Icon className="w-4 h-4 text-purple-400" />
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ label, href, icon: Icon }) {
  return (
    <Link
      to={href}
      className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-purple-500/30 transition"
    >
      <Icon className="w-5 h-5 text-purple-400 mb-2" />
      <p className="text-sm font-medium text-white">{label}</p>
    </Link>
  );
}


export { QuickStat, QuickAction };