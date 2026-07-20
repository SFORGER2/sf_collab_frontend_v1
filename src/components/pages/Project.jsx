import {
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import FindContributionHeader from "../headers/FindContributionHeader";
import ScrollToTop from "../sections/ScrollToTop";
import { allimg } from "../../utils";


const MOCK_GOALS = [
  {
    id: 4,
    title: "Build MVP",
    description:
      "Develop the initial MVP of the platform with authentication, profile management, and core collaboration tools. Focus on performance and seamless UX.",
    startup: { id: 1, name: "Acme Labs", logo: allimg.profileImg },
    owner: { id: 10, name: "Aman Khan", avatar: allimg.profileImg },
    progress_percentage: 65,
    milestones_completed: 3,
    milestones_total: 5,
    status: "active",
    target_date: "2025-12-15",
    is_on_track: true,
  },
  {
    id: 5,
    title: "AI Integration Engine",
    description:
      "Integrate AI-driven features (recommendations, tagging, predictive analytics).",
    startup: { id: 2, name: "NovaTech", logo: allimg.profileImg },
    owner: { id: 11, name: "Ritu Ranjan", avatar: allimg.profileImg },
    progress_percentage: 30,
    milestones_completed: 1,
    milestones_total: 4,
    status: "active",
    target_date: "2026-02-10",
    is_on_track: false,
  },
  {
    id: 6,
    title: "Sustainability Analytics Dashboard",
    description:
      "Build a sustainability scoring dashboard for product usage and carbon footprint tracking.",
    startup: { id: 3, name: "GreenWave", logo: allimg.profileImg },
    owner: { id: 12, name: "Mohammed Sforgers", avatar: allimg.profileImg },
    progress_percentage: 100,
    milestones_completed: 3,
    milestones_total: 3,
    status: "completed",
    target_date: "2025-09-10",
    is_on_track: true,
  },
];

const STARTUP_OPTIONS = [
  { id: 1, name: "Acme Labs" },
  { id: 2, name: "NovaTech" },
  { id: 3, name: "GreenWave" },
];

const OWNER_OPTIONS = [
  { id: 10, name: "Aman Khan" },
  { id: 11, name: "Ritu Ranjan" },
  { id: 12, name: "Mohammed Sforgers" },
];

const STATUS_OPTIONS = ["all", "active", "completed", "on_hold", "cancelled"];

export default function Project() {
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedStartup, setSelectedStartup] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMilestones, setSelectedMilestones] = useState("All"); // All | Completed | Incomplete

  const filteredGoals = useMemo(() => {
    const q = (searchQuery || "").trim().toLowerCase();

    return MOCK_GOALS.filter((g) => {
      const matchesSearch =
        !q ||
        g.title.toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q) ||
        (g.startup?.name || "").toLowerCase().includes(q) ||
        (g.owner?.name || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedStartup !== "all" && String(g.startup?.id) !== String(selectedStartup)) return false;

      if (selectedOwner !== "all" && String(g.owner?.id) !== String(selectedOwner)) return false;

      if (selectedStatus !== "all" && g.status !== selectedStatus) return false;

      if (selectedMilestones === "Completed" && g.milestones_completed < g.milestones_total) return false;
      if (selectedMilestones === "Incomplete" && g.milestones_completed >= g.milestones_total) return false;

      return true;
    });
  }, [searchQuery, selectedStartup, selectedOwner, selectedStatus, selectedMilestones]);

  function ProgressBar({ value }) {
    const safe = Math.max(0, Math.min(100, Number(value || 0)));
    return (
      <div className="w-full bg-zinc-800 rounded-full h-2">
        <div className="h-2 rounded-full" style={{ width: `${safe}%`, background: "linear-gradient(90deg,#06b6d4,#6366f1)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <FindContributionHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedUserType={undefined}
        setSelectedUserType={undefined}
        selectedAvailability={undefined}
        setSelectedAvailability={undefined}
        selectedPosition={undefined}
        setSelectedPosition={undefined}

        selectedStartup={selectedStartup}
        setSelectedStartup={setSelectedStartup}
        startupOptions={STARTUP_OPTIONS}

        selectedOwner={selectedOwner}
        setSelectedOwner={setSelectedOwner}
        ownerOptions={OWNER_OPTIONS}

        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        statusOptions={STATUS_OPTIONS}

        selectedMilestones={selectedMilestones}
        setSelectedMilestones={setSelectedMilestones}
        milestonesOptions={["All", "Completed", "Incomplete"]}
      />

      {/* Grid */}
      <div className="max-w-7xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((g) => (
            <Link key={g.id} to={`/project-details?id=${g.id}`} className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition flex flex-col min-h-60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-medium">{g.title}</h3>
                  <p className="text-xs text-gray-400">{g.startup?.name} • Owner: {g.owner?.name}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${g.status === "completed" ? "bg-green-600" : "bg-blue-600"}`}>
                  {g.status}
                </span>
              </div>

              <p className="text-sm text-gray-300 line-clamp-2 mb-3">{g.description}</p>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-2">
                  <small className="text-xs text-gray-400">{g.progress_percentage}%</small>
                  <small className="text-xs text-gray-400">Milestones {g.milestones_completed}/{g.milestones_total}</small>
                </div>
                <ProgressBar value={g.progress_percentage} />
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{g.target_date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    See Details <ArrowUpRight size={12} />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {filteredGoals.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
              No project goals match your filters.
            </div>
          )}
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}
