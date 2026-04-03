import {
  MessageSquare,
  ThumbsUp,
  Users,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  Star,
  Eye,
  Clock,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  User,
  Trophy,
  Zap,
  Plus,
  Tag,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import IdeationHeader from "./IdeationHeader";
import ScrollToTop from "../../sections/ScrollToTop";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { API_BASE_URL } from "@/utils/config";
import { getProfilePicture } from "@/utils/getProfilePicture";
import IdeationCard from "./IdeationCard";
import { getStageColor } from "./getStageColor";
import IdeationTutorial from "./IdeationTutorial";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const Ideation = ({ activeRole}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [sortBy, setSortBy] = useState("trending");

  const [showShareMsg, setShowShareMsg] = useState(false);
  const [ideas, setIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  const { user, access_token } = useSelector((state) => state.auth);
  useEffect(() => {
    fetchIdeas();
  }, [selectedIndustry, selectedStage, searchQuery]);

  const fetchIdeas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNetworkError(false);

      const params = new URLSearchParams({
        page: 1,
        per_page: 20,
      });

      if (selectedIndustry !== "All Industries") {
        params.append("industry", selectedIndustry);
      }
      if (selectedStage !== "All Stages") {
        params.append("stage", selectedStage);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await ideaAPI.getAllIdeas(params);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch ideas");
      }
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
          avatar: idea.creator ? getProfilePicture(idea.creator) : '',
          id: idea.creator?.id,
        },
        createdAt: new Date(idea.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        timeAgo: calculateTimeAgo(idea.createdAt),
        likes: idea.likes,
        hasLiked: idea.hasLiked || false,
        hasBookmarked: idea.hasBookmarked || false,
        comments: idea.commentsCount,
        collaborators: idea.teamSize,
        tags: idea.tags || [],
      }));

      setIdeas(mappedIdeas);
    } catch (err) {
      console.error("Fetch error:", err);
      setNetworkError(true);
      setError("Unable to connect to the server.");
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffHours = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };
  const handleCreateIdea = async (payload) => {
    try {
      if (!user || !access_token) {
        throw new Error("You must be logged in to create a vision.");
      }
      const response = await ideaAPI.createIdea(payload, access_token, { 'Content-Type': 'multipart/form-data' });

      if (!response.success) {
        throw new Error(response.message || "Failed to create vision");
      }


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
      console.error("Failed to create vision:", err);
      setError(err.message || "Failed to create vision. Please try again.");
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [selectedStage, selectedIndustry, sortBy, searchQuery]);




  const handleShare = async (idea) => {
    try {
      const url = `${window.location.origin}/ideation-details?id=${idea.id}`;
      const title = idea.title;
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowShareMsg(true);
        setTimeout(() => setShowShareMsg(false), 1500);
      }
    } catch {
      setShowShareMsg(true);
      setTimeout(() => setShowShareMsg(false), 1500);
    }
  };

  const handleRetry = () => fetchIdeas();
    
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-300">Loading visions...</p>
      </div>
    );
  }
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
          <div className="bg-[#1A1A1A] rounded-2xl p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-500/20 p-4 rounded-full">
                <WifiOff className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Network Connection Issue
            </h3>
            <p className="text-gray-400 mb-6">
              {error ||
                "Unable to connect to the server. Please check your internet connection."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pr-4">
      <IdeationTutorial /> 
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

      {error && !networkError && (
        <div className="mx-4 mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 max-sm:p-2">
        {ideas.map((content) => {
          const isPrivate = content.privacy === "private";
          const isCreator = user?.id && content.creatorId && user.id === content.creatorId;
          const shouldBlur = isPrivate && !isCreator;
          const canAccess = !isPrivate || isCreator;

          return (
            <div key={content.id} className="group relative">
              {canAccess ? (
                <IdeationCard content={content} shouldBlur={shouldBlur} /> 
              ) : (
                <div className={`block bg-[#1A1A1A] border border-white/10 rounded-xl h-full relative overflow-hidden cursor-not-allowed`}>
                  {shouldBlur && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-10 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-gray-400 text-sm mb-2">🔒 Private Vision</div>
                        <div className="text-gray-500 text-xs">Only the creator can view this</div>
                      </div>
                    </div>
                  )}
                  <div className={`p-6 space-y-4 ${shouldBlur ? 'blur-sm pointer-events-none' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={content.author.avatar}
                          alt={content.author.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-sm text-white">
                            {content.author.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {content.author.role}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`${getStageColor(
                          content.stage
                        )} text-xs px-2 py-1 rounded-full font-medium`}
                      >
                        {content.stage}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-lg font-bold text-white leading-tight line-clamp-2">
                        {content.title}
                      </h2>
                      <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                        {content.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {Array.isArray(content.tags) &&
                        content.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-white/5 text-gray-300 text-xs px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
                          >
                            #{tag}
                          </span>
                        ))}

                      {Array.isArray(content.tags) && content.tags.length > 3 && (
                        <span className="text-gray-400 text-xs px-2 py-1">
                          +{content.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {content.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {content.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {content.collaborators}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {content.timeAgo}
                      </span>
                    </div>

                    <div className="flex items-center justify-center pt-2">
                      <span className="text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:text-blue-300 transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        Join Discussion
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {ideas.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center space-y-4">
            <Eye className="h-16 w-16 text-gray-600 mx-auto" />
            <h3 className="text-xl font-semibold text-gray-300">
              No visions found
            </h3>
            <p className="text-gray-500 max-w-md">
              Be the first to share a bold vision! Try adjusting your
              filters or create a new vision to inspire others.
            </p>
            <button
              onClick={() => setShowNewIdeaForm(true)}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Share Your Vision
            </button>
          </div>
        </div>
      )}

      <ScrollToTop />

      {showShareMsg && (
        <div className="fixed bottom-4 left-4 bg-[#232323] text-green-400 px-4 py-2 rounded shadow-lg border border-green-700 z-50">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default Ideation;
