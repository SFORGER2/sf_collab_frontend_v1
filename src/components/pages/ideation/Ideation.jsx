import { WifiOff, RefreshCw, Eye, Clock, Heart, MessageCircle, Users, AlertTriangle } from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { byMomentum } from "@/services/vision/momentum";
import { SAMPLE_VISIONS } from "@/services/mock/boards";
import IdeationHeader from "./IdeationHeader";
import { Link } from "react-router-dom";
import ScrollToTop from "../../sections/ScrollToTop";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { getProfilePicture } from "@/utils/getProfilePicture";
import IdeationCard from "./IdeationCard";
import IdeationTutorial from "./IdeationTutorial";
import { motion } from "framer-motion";

/* Twelve sample Visions spread across stage, industry and engagement — a
   board where everything burns says as little as one where nothing does. */
const MOCK_IDEAS = SAMPLE_VISIONS;

const calculateTimeAgo = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const Ideation = ({ activeRole }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [sortBy, setSortBy] = useState("trending");
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const { user, access_token } = useSelector((state) => state.auth);

  const fetchIdeas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNetworkError(false);

      const params = new URLSearchParams({ page: 1, per_page: 20 });
      if (selectedIndustry !== "All Industries") params.append("industry", selectedIndustry);
      if (selectedStage !== "All Stages") params.append("stage", selectedStage);
      if (searchQuery) params.append("search", searchQuery);

      const response = await ideaAPI.getAllIdeas(params);
      if (!response.success) throw new Error(response.message || "Failed to fetch ideas");

      const data = response.data;
      const ideasArray = data.data?.ideas || data.ideas || [];
      const mappedIdeas = ideasArray.map((idea) => ({
        id: idea.id,
        title: idea.title,
        description: idea.description,
        stage: idea.stage,
        category: idea.industry,
        privacy: idea.privacy,
        creatorId: idea.creator?.id,
        imageUrl: idea.imageUrl,
        author: {
          name: `${idea.creator.firstName} ${idea.creator.lastName}`,
          role: activeRole,
          avatar: idea.creator ? getProfilePicture(idea.creator) : "",
          id: idea.creator?.id,
        },
        createdAt: new Date(idea.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeAgo: calculateTimeAgo(idea.createdAt),
        // Raw ISO, kept alongside the formatted `createdAt` above — momentum
        // decays signals by age, so it needs a real timestamp to parse.
        lastActivityAt: idea.updatedAt || idea.updated_at || idea.createdAt,
        likes: idea.likes,
        hasLiked: idea.hasLiked || false,
        hasBookmarked: idea.hasBookmarked || false,
        comments: idea.commentsCount,
        collaborators: idea.teamSize,
        tags: idea.tags || [],
        visionState: idea.visionState || idea.vision_state || "public",
        readinessScore: idea.readinessScore || idea.readiness_score || 0,
        isConverted: (idea.tags || []).includes("Converted Vision"),
        pending_collab_count: idea.pending_collab_count ?? 0,
      }));

      setIdeas(mappedIdeas);
    } catch (err) {
      console.error("Fetch error (using mock fallback):", err);
      setNetworkError(false);
      setError(null);
      setIdeas(MOCK_IDEAS);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIndustry, selectedStage, searchQuery, sortBy, activeRole]);

  // Single effect — fetches whenever filters or sort changes
  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  /**
   * "Moving now" is sorted here rather than server-side, because momentum is a
   * frontend weighting for now (services/vision/momentum.js) — the backend has
   * no equivalent ordering yet. Every other sort is already applied by the API,
   * so those pass through untouched.
   */
  const orderedIdeas = useMemo(
    () => (sortBy === 'momentum' ? [...ideas].sort(byMomentum) : ideas),
    [ideas, sortBy]
  );

  const handleCreateIdea = async (payload) => {
    try {
      if (!user || !access_token) throw new Error("You must be logged in to post an idea.");

      const response = await ideaAPI.createIdea(payload, access_token, {
        "Content-Type": "multipart/form-data",
      });
      if (!response.success) throw new Error(response.message || "Failed to post idea");

      const newIdea = response.data?.idea || response.idea;
      const formattedIdea = {
        id: newIdea.id,
        title: newIdea.title,
        description: newIdea.description,
        stage: newIdea.stage,
        category: newIdea.industry,
        privacy: newIdea.privacy,
        creatorId: newIdea.creator.id,
        imageUrl: newIdea.imageUrl,
        author: {
          name: `${newIdea.creator.firstName} ${newIdea.creator.lastName}`,
          role: activeRole,
          avatar: getProfilePicture(newIdea.creator),
        },
        timeAgo: "just now",
        createdAt: new Date(newIdea.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        likes: newIdea.likesLength,
        comments: newIdea.commentsCount,
        collaborators: newIdea.teamSize,
        tags: newIdea.tags || [],
      };

      setIdeas((prev) => [formattedIdea, ...prev]);
      setSortBy("latest");
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to post idea:", err);
      setError(err.message || "Failed to post idea. Please try again.");
    }
  };

  // ── Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full"
          style={{
            border: "2px solid rgba(59,130,246,0.15)",
            borderTopColor: "#3b82f6",
          }}
        />
      </div>
    );
  }

  // ── Network error state
  if (networkError) {
    return (
      <div className="min-h-screen bg-black">
        <IdeationHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onCreateIdea={handleCreateIdea}
        />
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div
            className="rounded-2xl p-8 max-w-md w-full text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <WifiOff className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Connection Issue</h3>
            <p className="text-gray-400 text-sm mb-6">
              {error || "Unable to connect to the server. Check your internet connection."}
            </p>
            <button
              onClick={() => fetchIdeas()}
              className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(96,165,250,0.35)", color: "#93c5fd" }}
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4">
      <IdeationTutorial activeRole={activeRole} />

      <div className="mb-0 mt-10">
        <IdeationHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStage={selectedStage}
          setSelectedStage={setSelectedStage}
          selectedIndustry={selectedIndustry}
          setSelectedIndustry={setSelectedIndustry}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onCreateIdea={handleCreateIdea}
          setShowNewIdeaForm={setShowNewIdeaForm}
          showNewIdeaForm={showNewIdeaForm}
        />
      </div>

      {/* Inline error banner (non-network) */}
      {error && !networkError && (
        <div
          className="mx-4 mt-4 rounded-xl p-4"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
        >
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-sm:p-2">
        {orderedIdeas.map((content) => {
          const isPrivate = content.privacy === "private";
          const isCreator = user?.id && content.creatorId && user.id === content.creatorId;
          const shouldBlur = isPrivate && !isCreator;

          return (
            <div key={content.id} className="relative">
              {/* Converted Idea badge */}
              {content.isConverted && (
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span>Launched Startup</span>
                  </div>
                </div>
              )}
              <IdeationCard content={content} shouldBlur={shouldBlur} />
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {ideas.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center space-y-4">
            <Eye className="h-14 w-14 mx-auto" style={{ color: "#374151" }} />
            <h3 className="text-lg font-semibold text-white">No ideas found</h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: "#6b7280" }}>
              Be the first to share an idea! Try adjusting your filters or post a new one.
            </p>
            <Link
              to="/vision/new"
              className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-all border border-gold/45 bg-gold/10 text-gold hover:bg-gold/20"
            >
              Create a Vision
            </Link>
          </div>
        </div>
      )}

      <ScrollToTop />
    </div>
  );
};

export default Ideation;