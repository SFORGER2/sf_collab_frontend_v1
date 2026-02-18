
import React, { useState } from "react";
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Users,
  Briefcase,
  Star,
  Calendar,
  Clock,
  Send,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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
    created_at: "2025-02-10",
    updated_at: "2025-02-20",
    milestones: [
      {
        id: 1,
        title: "Design UI",
        description: "Design all wireframes and final screens.",
        order: 1,
        is_completed: true,
        completed_date: "2025-03-01",
        owner: { id: 11, name: "Ritu Ranjan" },
      },
      {
        id: 2,
        title: "User Authentication",
        description: "Sign up, login, password reset.",
        order: 2,
        is_completed: true,
        completed_date: "2025-04-03",
        owner: { id: 10, name: "Aman Khan" },
      },
      {
        id: 3,
        title: "Core Features",
        description: "Project create/update workflows.",
        order: 3,
        is_completed: false,
        completed_date: null,
        owner: { id: 10, name: "Aman Khan" },
      },
      {
        id: 4,
        title: "API Integration",
        description: "Connect backend endpoints.",
        order: 4,
        is_completed: false,
        completed_date: null,
        owner: { id: 12, name: "Mohammed Sforgers" },
      },
      {
        id: 5,
        title: "Final Testing & Launch",
        description: "Beta launch & bug fixes.",
        order: 5,
        is_completed: false,
        completed_date: null,
        owner: { id: 11, name: "Ritu Ranjan" },
      },
    ],
    comments: [
      { id: 1, user: { name: "Sarah", avatar: "https://i.pravatar.cc/150?img=6" }, message: "Finalize auth flow.", created_at: "1h" },
      { id: 2, user: { name: "Mike", avatar: "https://i.pravatar.cc/150?img=7" }, message: "UI handoff done.", created_at: "4h" },
    ],
    attachments: [
      { id: 1, name: "MVP-Requirements.pdf", url: "#" },
      { id: 2, name: "UI-Wireframes.zip", url: "#" },
    ],
  },
  {
    id: 5,
    title: "AI Integration Engine",
    description: "Integrate AI-driven features (recommendations, tagging, predictive analytics).",
    startup: { id: 2, name: "NovaTech", logo: allimg.profileImg },
    owner: { id: 11, name: "Ritu Ranjan", avatar: allimg.profileImg },
    progress_percentage: 30,
    milestones_completed: 1,
    milestones_total: 4,
    status: "active",
    target_date: "2026-02-10",
    is_on_track: false,
    created_at: "2025-04-10",
    updated_at: "2025-04-28",
    milestones: [
      { id: 6, title: "Define AI Requirements", description: "", order: 1, is_completed: true, completed_date: "2025-04-15", owner: { id: 11, name: "Ritu" } },
      { id: 7, title: "Data Pipeline Setup", description: "", order: 2, is_completed: false, completed_date: null, owner: { id: 12, name: "Mohammed" } },
      { id: 8, title: "Model Training", description: "", order: 3, is_completed: false, completed_date: null, owner: { id: 10, name: "Aman" } },
      { id: 9, title: "Frontend Integration", description: "", order: 4, is_completed: false, completed_date: null, owner: { id: 10, name: "Aman" } },
    ],
    comments: [{ id: 3, user: { name: "Aman", avatar: allimg.profileImg }, message: "Pipeline blocked by schema mismatch.", created_at: "3d" }],
    attachments: [{ id: 3, name: "AI-Architecture.png", url: "#" }],
  },
  {
    id: 6,
    title: "Sustainability Analytics Dashboard",
    description: "Build a sustainability scoring dashboard for product usage and carbon footprint tracking.",
    startup: { id: 3, name: "GreenWave", logo: allimg.profileImg },
    owner: { id: 12, name: "Mohammed Sforgers", avatar: allimg.profileImg },
    progress_percentage: 100,
    milestones_completed: 3,
    milestones_total: 3,
    status: "completed",
    target_date: "2025-09-10",
    is_on_track: true,
    created_at: "2025-01-05",
    updated_at: "2025-09-10",
    milestones: [
      { id: 10, title: "Data Source Mapping", description: "", order: 1, is_completed: true, completed_date: "2025-02-10", owner: { id: 12, name: "Mohammed" } },
      { id: 11, title: "Dashboard UI Build", description: "", order: 2, is_completed: true, completed_date: "2025-04-15", owner: { id: 10, name: "Aman" } },
      { id: 12, title: "Final Deployment", description: "", order: 3, is_completed: true, completed_date: "2025-09-10", owner: { id: 12, name: "Mohammed" } },
    ],
    comments: [{ id: 4, user: { name: "Ritu", avatar: allimg.profileImg }, message: "Great job!", created_at: "1w" }],
    attachments: [{ id: 4, name: "Carbon-Factors.xlsx", url: "#" }],
  },
];

// utility
function findGoalById(id) {
  return MOCK_GOALS.find((g) => g.id === id);
}

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value || 0)));
  return (
    <div className="w-full bg-zinc-800 rounded-full h-2">
      <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#06b6d4,#6366f1)" }} />
    </div>
  );
}

export default function ProjectDetails() {
  const [params] = useSearchParams();
  const id = params.get("id") ? Number(params.get("id")) : 4;
  const goal = findGoalById(id) || MOCK_GOALS[0];

  const [isJoined, setIsJoined] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const completedCount = goal.milestones.filter((m) => m.is_completed).length;

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    goal.comments.unshift({ id: Date.now(), user: { name: "You", avatar: allimg.profileImg }, message: commentText.trim(), created_at: "just now" });
    setCommentText("");
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/project-details?id=${goal.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: goal.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (e) {
      console.error("share failed", e);
    }
  };

  return (
    <div className="min-h-screen  text-white">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link to="/projects" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Projects</span>
            </Link>

            <div className="flex items-center gap-3">
              <button onClick={handleShare} className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Share">
                <Share2 className="h-5 w-5" />
              </button>

              <button onClick={() => setIsBookmarked((s) => !s)} aria-label="Bookmark" className={`p-2 rounded-lg transition-colors ${isBookmarked ? "bg-blue-500/10 text-blue-400" : "hover:bg-white/10"}`}>
                <Bookmark className="h-5 w-5" />
              </button>

              <button onClick={() => setIsJoined((s) => !s)} className={`px-4 py-2 rounded-lg text-sm font-medium ${isJoined ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                {isJoined ? <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Joined</span> : "Join Goal"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-zinc-700 flex items-center justify-center">
                    <img loading="lazy" src={goal.startup.logo || allimg.profileImg} alt={goal.startup.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{goal.title}</h1>
                    <p className="text-sm text-gray-400 mt-1">{goal.startup.name} • Owner: {goal.owner.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full uppercase ${goal.status === "completed" ? "bg-green-600" : "bg-blue-600"}`}>{goal.status}</div>
                  <div className="text-xs text-gray-400 mt-2">Target</div>
                  <div className="text-sm">{goal.target_date || "N/A"}</div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-300">{goal.description}</p>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-gray-400">Progress</div>
                    <div className="text-xs text-gray-400">{goal.progress_percentage}%</div>
                  </div>
                  <ProgressBar value={goal.progress_percentage} />
                </div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold mb-3">Milestones</h2>
              <div className="space-y-3">
                {goal.milestones.slice().sort((a,b)=> (a.order||0)-(b.order||0)).map((m)=> (
                  <div key={m.id} className={`p-4 rounded-lg ${m.is_completed ? "bg-zinc-900" : "bg-[#0f0f0f]"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-semibold">{m.title}</h3>
                          <span className="text-xs text-gray-400">• Owner: {m.owner?.name}</span>
                        </div>
                        {m.description && <p className="text-xs text-gray-400 mt-1">{m.description}</p>}
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-gray-400">Order: {m.order}</div>
                        <div className={`text-xs mt-2 ${m.is_completed ? "text-green-400" : "text-yellow-400"}`}>
                          {m.is_completed ? `Completed on ${m.completed_date || "N/A"}` : "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold mb-4">Attachments</h2>
              <div className="space-y-2">
                {goal.attachments?.map((a)=> (
                  <a key={a.id} href={a.url} className="flex items-center justify-between p-3 bg-[#0F0F0F] rounded-md hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-zinc-800 flex items-center justify-center">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm">{a.name}</div>
                        <div className="text-xs text-gray-400">Attachment</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">Download</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold mb-4">Discussion</h2>

              <div className="space-y-4">
                {goal.comments.map((c)=> (
                  <div key={c.id} className="flex gap-4">
                    <img loading="lazy" src={c.user?.avatar} alt={c.user?.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium">{c.user?.name}</div>
                        <div className="text-xs text-gray-400">{c.created_at}</div>
                      </div>
                      <div className="text-sm text-gray-300">{c.message}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="flex gap-4">
                  <img loading="lazy" src={allimg.profileImg} alt="you" className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <textarea value={commentText} onChange={(e)=> setCommentText(e.target.value)} placeholder="Write a comment..." className="w-full bg-[#0F0F0F] rounded-xl p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" />
                    <div className="flex items-center justify-between mt-3 gap-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ImageIcon className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><LinkIcon className="h-4 w-4" /></button>
                      </div>
                      <button onClick={handleSendComment} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"><Send className="h-4 w-4" /> <span>Send</span></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            <div className="bg-[#1A1A1A] rounded-4xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between"><span className="text-gray-400">Startup</span><span>{goal.startup.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400">Owner</span><span>{goal.owner.name}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400">Status</span><span className="capitalize">{goal.status}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400">Progress</span><span>{goal.progress_percentage}%</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400">Milestones</span><span>{completedCount}/{goal.milestones_total}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-400">Target</span><span>{goal.target_date || "N/A"}</span></div>
              </div>
              <div className="mt-4"><ProgressBar value={goal.progress_percentage} /></div>
            </div>

            <div className="bg-[#1A1A1A] rounded-4xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold mb-4">Activity</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>Last updated</span></div><div className="text-gray-400 text-xs">{goal.updated_at}</div></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Users className="h-4 w-4" /><span>Team</span></div><div className="text-gray-400 text-xs">{goal.milestones_total} members</div></div>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-4xl p-6 sm:p-8">
              <h3 className="text-lg font-semibold mb-4">Links</h3>
              <div className="space-y-2">
                <a href="#" className="block p-3 bg-[#0F0F0F] rounded-md hover:bg-zinc-900 transition-colors text-sm">Project Board</a>
                <a href="#" className="block p-3 bg-[#0F0F0F] rounded-md hover:bg-zinc-900 transition-colors text-sm">Design Files</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
