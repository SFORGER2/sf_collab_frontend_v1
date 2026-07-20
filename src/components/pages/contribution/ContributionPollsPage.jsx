import { contributionAPI } from "@/utils/APIs/contributionAPI";
import { Vote, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CreatePollSection from "./CreatePollSection";
import PollCard from "./Poll";

// const polls = [
//   {
//     id: 1,
//     title: "What should we ship first?",
//     description: "Help us prioritize the next major feature for SFCollab.",
//     options: [
//       "Startup public profiles",
//       "Investor discovery",
//       "Team matching",
//       "Analytics dashboard",
//     ],
//     points: 2,
//     status: "active",
//     endsIn: "2 days",
//   },
//   {
//     id: 2,
//     title: "Preferred onboarding experience",
//     description: "Choose how new users should be onboarded.",
//     options: [
//       "Guided step-by-step",
//       "Minimal + self explore",
//       "Founder-focused flow",
//     ],
//     points: 1,
//     status: "active",
//     endsIn: "5 days",
//   },
//   {
//     id: 3,
//     title: "Community role rewards",
//     description: "Decide which contributors should earn higher multipliers.",
//     options: ["Founders", "Builders", "Influencers", "Investors"],
//     points: 3,
//     status: "completed",
//   },
// ];

export default function ContributionPollsPage({ userRoles = [] }) {
  const [polls, setPolls] = useState([]);
  const { user, access_token } = useSelector((state) => state.auth);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (user && (user.role === "admin" || userRoles.includes("admin"))) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user, userRoles]);
  useEffect(() => {
    async function fetchPolls() {
      try {
        const params = {
          // any params if needed
        }
        const response = await contributionAPI.getAllPolls(params, access_token)
        if (!response.success) {
          console.error("Failed to fetch polls:", response.message);
          toast.error("Failed to fetch polls");
          return;
        }
        setPolls(response.data.polls.filter(poll => poll.usersVoted ? isAdmin || !poll.usersVoted?.includes(user.id): true));
      } catch (error) {
        console.error("Error fetching polls:", error);
        toast.error("Error fetching polls");
      }
    }
    fetchPolls();
  }, [access_token, user, isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-6 py-10 text-white">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <section className="space-y-3">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Vote className="h-8 w-8 text-purple-400" />
            Vote in Community Polls
          </h1>
          <p className="text-gray-300 max-w-2xl">
            Your vote directly influences product decisions. Every vote earns
            points and improves your access priority.
          </p>
        </section>

        {/* ================= POLLS ================= */}
        
        <section className="space-y-6">
          {polls.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <p className="text-sm text-white/60">
                No polls available right now
              </p>
              <p className="text-xs text-white/40">
                New community polls will appear here once they’re published.
              </p>
            </div>
          )}

          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} isAdmin={isAdmin} setPolls={setPolls} />
          ))}
        </section>

        {/* ================= FOOTER INFO ================= */}
        <section className="text-sm text-gray-400 max-w-3xl mb-4">
          Votes are weighted equally during early access. Future stages may
          introduce multipliers based on contribution history.
        </section>
        {
          user && isAdmin &&
          <CreatePollSection />
        }
      </div>
      
    </div>
  );
};
