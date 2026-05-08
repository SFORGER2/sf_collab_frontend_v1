import { useEffect, useState } from "react";
import { Check, X, Settings } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { contributionAPI } from "@/utils/APIs/contributionAPI";
import { toast } from "react-toastify";
import { waitlistAPI } from "@/utils/APIs/waitlistAPI";
import { getProfilePicture } from "@/utils/getProfilePicture";
import usePaginatedFetch from "@/utils/hooks/usePaginated";

export default function AdminIdeasReviewSection() {
  const navigate = useNavigate();
  const { access_token } = useSelector((state) => state.auth);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);

  const fetchIdeas = async ({ page, search }) => {
    const params = {
      page,
      per_page: 10,
      ...(statusFilter && { status: statusFilter }),
    };
    return await contributionAPI.getAllIdeas(params);
  };

  const {
    items: ideas,
    setItems: setIdeas,
    loading,
    targetRef,
  } = usePaginatedFetch({
    fetchFn: fetchIdeas,
    objectKey: "ideas",
    enabled: true,
    startPage: 1,
  });

  useEffect(() => {
    setFilteredIdeas(ideas);
  }, [ideas]);

  const updateIdea = async (id, payload) => {
    try {
      const res = await contributionAPI.updateIdea(id, payload, access_token);

      if (!res.success) {
        toast.error(res.message || "Action failed");
        return;
      }

      if (payload.status === "rejected") {
        setIdeas(ideas.filter((idea) => idea?.id !== id));
        setFilteredIdeas(filteredIdeas.filter((idea) => idea?.id !== id));
        toast.success("Idea rejected");
        return;
      }

      if (payload.status === "approved") {
        await waitlistAPI.givePoints(
          res.data.user_id,
          `${res.data.impact}_contribution`
        );
        toast.success("Idea approved");
      } else {
        toast.success("Idea updated");
      }

      const updatedIdeas = ideas.map((idea) =>
        idea?.id === id ? { ...idea, ...payload } : idea
      );
      setIdeas(updatedIdeas);
      setFilteredIdeas(updatedIdeas);
    } catch (error) {
      console.error("Error updating idea:", error);
      toast.error("Failed to update idea");
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
  };

  if (loading && ideas.length === 0) {
    return <div className="text-center text-gray-400 py-20">Loading ideas…</div>;
  }

  return (
    <div className="px-6 py-10 bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      <div className="w-full mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Admin · Idea Review</h1>

        {ideas.length === 0 && !loading && (
          <p className="text-gray-400">No pending ideas 🎉</p>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleFilterChange(null)}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("pending")}
            className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-sm font-medium text-yellow-300"
          >
            Pending
          </button>
          <button
            onClick={() => handleFilterChange("approved")}
            className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-sm font-medium text-emerald-300"
          >
            Approved
          </button>
          <button
            onClick={() => handleFilterChange("rejected")}
            className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-sm font-medium text-red-300"
          >
            Rejected
          </button>
        </div>

        <div className="space-y-6 max-h-128 overflow-y-auto">
          {filteredIdeas.map((idea) => (
            <div
              key={idea?.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-center gap-4">
                  <img
                    src={getProfilePicture(idea?.user)}
                    alt={`${idea?.user?.first_name} ${idea?.user?.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{idea?.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Submitted by{" "}
                      <button
                        onClick={() =>
                          navigate(`/user-profile?userId=${idea?.user?.id}`)
                        }
                        className="text-blue-400 hover:text-blue-300 underline font-medium"
                      >
                        {idea?.user?.first_name} {idea?.user?.last_name}
                      </button>
                    </p>
                  </div>
                </div>
                {idea?.status === "pending" ? null : idea?.status ===
                  "approved" ? (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                    Approved
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400">
                    Rejected
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300">{idea?.description}</p>

              {idea?.status === "pending" && (
                <>
                  {/* Impact selector */}
                  <div className="flex items-center gap-3">
                    <Settings className="h-4 w-4 text-gray-400" />
                    <select
                      value={idea?.impact || "medium"}
                      onChange={(e) =>
                        updateIdea(idea?.id, { impact: e.target.value })
                      }
                      className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
                    >
                      <option value="small">Small (10 pts)</option>
                      <option value="medium">Medium (25 pts)</option>
                      <option value="large">High (50 pts)</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() =>
                        updateIdea(idea?.id, { status: "approved" })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold transition"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateIdea(idea?.id, { status: "rejected" })
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-red-500/70 hover:bg-red-500 px-4 py-2 text-sm font-semibold transition"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          <div ref={targetRef} className="h-10 flex items-center justify-center">
            {loading && (
              <span className="text-xs text-gray-500">Loading more...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
