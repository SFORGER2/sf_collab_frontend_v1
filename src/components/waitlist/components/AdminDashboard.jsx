import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import ShinyText from "./ui/ShinyText";
import ShineButton from "./ui/ShineButton";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard({ onLogout }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch users here
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0b10] to-[#11131a] p-8 text-slate-300">
      {/* Header */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white">
          <ShinyText text="Admin Dashboard" speed={3} />
        </h1>
        <ShineButton
          label="Logout"
          size="sm"
          bgColor="linear-gradient(325deg, hsl(0 100% 56%) 0%, hsl(0 100% 69%) 55%, hsl(0 100% 56%) 90%)"
          onClick={onLogout}
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto mb-8">
        <StatCard title="Total Users" value={entries.length} icon={<Users className="text-cyan-400" />} />
        <StatCard title="Pending Approvals" value="12" icon={<AlertTriangle className="text-orange-400" />} />
        <StatCard title="Active Warnings" value="3" icon={<CheckCircle2 className="text-purple-400" />} />
        <StatCard title="Rewards Distributed" value="$1,250" icon={<DollarSign className="text-emerald-400" />} />
      </div>

      {/* Users Table */}
      <Card className="max-w-6xl mx-auto bg-[#0d0f17] border border-slate-800 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-200">Registered Users ({entries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : entries.length === 0 ? (
            <div>No users have joined yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Joined</th>
                    <th className="px-3 py-2 text-left">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr key={entry.email} className="border-b border-slate-700 hover:bg-slate-800/40 transition-colors">
                      <td className="px-3 py-2">{i + 1}</td>
                      <td className="px-3 py-2">{entry.email}</td>
                      <td className="px-3 py-2">{entry.name || "-"}</td>
                      <td className="px-3 py-2">
                        {entry.created_at ? new Date(entry.created_at).toLocaleString() : "-"}
                      </td>
                      <td className="px-3 py-2">{entry.reward_months} mo</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// --- StatCard Helper ---
const StatCard = ({ title, value, icon }) => (
  <div className="p-4 rounded-xl bg-[#0d0f17] border border-slate-800 flex flex-col gap-3 hover:border-slate-700 transition-colors shadow-sm">
    <div className="flex items-center justify-between">
      <div className="p-2 bg-[#11131a] rounded-lg border border-slate-800">{icon}</div>
      <TrendingUp className="w-3 h-3 text-slate-600" />
    </div>
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{title}</p>
      <p className="text-2xl font-bold text-slate-200">{value}</p>
    </div>
  </div>
);
