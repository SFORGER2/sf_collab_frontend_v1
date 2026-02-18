import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Users,
  Clock,
  Send,
  Bookmark,
  Share2,
  Tag,
  X,
  Trash2,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { usersAPI } from "@/utils/APIs/userAPI";
import { getProfilePicture } from "@/utils/getProfilePicture";

const BASE_URL = API_BASE_URL + "/ideas";

const IdeationDetails = () => {
  const [idea, setIdea] = useState(null);
  const [ideaCreator, setIdeaCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinPosition, setJoinPosition] = useState("");
  const [joinSkills, setJoinSkills] = useState("");
  const [suggestMessage, setSuggestMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const commentInputRef = useRef(null);
  const discussionSectionRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const ideaId = queryParams.get("id")?.toString();
  const { user, access_token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        const res = await ideaAPI.getIdeaById(ideaId, access_token);
        setIdea(res.data.idea);
        setLikes(res.data.idea.likes ?? 0);
        setLiked(res.data.idea.hasLiked || false);
        setBookmarked(res.data.idea.hasBookmarked || false);
        if (user && res.data.idea.likedBy?.length) {
          setLiked(res.data.idea.likedBy.includes(user.id));
        }
        const comments = await ideaAPI.getIdeaComments(access_token, { ideaId });
        setIdea((prevIdea) => ({
          ...prevIdea,
          comments: comments.data.comments,
        }));
      } catch (error) {
        console.error("Error fetching idea:", error);
        setIdea(null);
      } finally {
        setLoading(false);
      }
    };
    if (ideaId) fetchIdea();
  }, [ideaId, access_token, user]);


  useEffect(() => {
    async function getCreator() {
      if (idea?.creator?.id) {
        try {
          const res = await usersAPI.getById(idea.creator.id, { include_stats: true });
          setIdeaCreator(res.data.user);
        } catch (err) {
          console.error("Error fetching idea creator:", err);
        }
      }

    }
    getCreator();
  }, [idea]);
  const handleBookmark = async (e) => {
    e?.stopPropagation?.();

    if (!ideaId || !user?.id) {
      toast.error("Unable to bookmark at this time");
      return;
    }

    try {
      const body = {
        user_id: user.id,
        idea_id: ideaId,
        title: idea.title,
        content_preview: idea.description.substring(0, 100),
        url: `/ideation-details?id=${ideaId}`,
      }
      const response = await ideaAPI.toggleIdeaBookmark(body);
      setBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error("Bookmark toggle error:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/ideation-details?id=${ideaId}`;
      if (navigator.share) {
        await navigator.share({
          title: idea?.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {
      // Ignore share errors
    }
  };

  const handleStartDiscussion = () => {
    if (discussionSectionRef.current) {
      discussionSectionRef.current.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => commentInputRef.current?.focus(), 400);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    try {


      if (!joinName.trim() || !joinPosition.trim()) {
        toast.error("Please fill in name and position");
        return;
      }

      const response = await ideaAPI.addTeamMember(ideaId, {
        name: joinName,
        position: joinPosition,
        skills: joinSkills,
        message: joinMessage,
      });


      if (!response.success) {
        const errorMessage = response.error || response.message || "Failed to add team member";
        throw new Error(errorMessage);
      }

      if (response.success && response.data?.team_member) {
        const res = await ideaAPI.getIdeaById(ideaId, access_token);
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const ideaData = isLocal
          ? (res.data.data?.idea || res.data.idea)
          : (res.data.idea || res.data.data?.idea);
        
        if (ideaData) {
          setIdea(ideaData);
        }
        
        toast.success(response.message || "Successfully joined the team!");
        setJoinMessage("");
        setJoinName("");
        setJoinPosition("");
        setJoinSkills("");
          setShowJoinModal(false);

          setSuccessMsg("");

      }
    } catch (err) {
      console.error("Error joining team:", err);
      const errorMessage = err.error || "Failed to join team. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleSuggestSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg("Thank you for your suggestion!");
    setSuggestMessage("");
    setTimeout(() => {
      setShowSuggestModal(false);
      setSuccessMsg("");
    }, 1500);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const body = {
        idea_id: ideaId,
        content: comment.trim(),
        author_id: user?.id,
        author_first_name: user?.firstName || "",
        author_last_name: user?.lastName || "",
      }
      const res = await ideaAPI.createIdeaComment(body, access_token);
      if (!res.success) {
        throw new Error("Failed to post comment");
      }

      setIdea((prev) => ({
        ...prev,
        comments: [res.data.comment, ...(prev.comments || [])],
      }));
      setComment("");

    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleDeleteIdea = async () => {
    try {
      const response = await ideaAPI.deleteIdea(ideaId, access_token)
      
      if (response.success) {
        setShowDeleteModal(false);
        setSuccessMsg(response?.message || "Idea deleted successfully");
        setTimeout(() => {
          navigate("/ideation");
        }, 1500);
      }
    } catch (err) {
      console.error("Error deleting idea:", err);
      setShowDeleteModal(false);
      toast.error("Failed to delete idea. Please try again.");
    }
  };

  const handleLike = useCallback(
    async (e) => {
      e?.stopPropagation();
      try {
        setLiked((prevLiked) => {
          const newLiked = !prevLiked;
          setLikes((prevLikes) => (newLiked ? prevLikes + 1 : prevLikes - 1));
          return newLiked;
        });

        const res = await ideaAPI.likeIdea(ideaId, access_token);
        setLikes(res.data.idea.likes);
        setLiked(res.data.idea.likedBy.includes(user.id));
      } catch (err) {
        console.error("Error liking idea:", err);
      }
    },
    [ideaId, access_token, user]
  );

  const isCreator = useMemo(() => user?.id && idea?.creator?.id && user.id === idea.creator.id, [user, idea]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-blue-500/30 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (!idea) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center text-red-400 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Idea not found.
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <Link
            to="/ideation"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
              <ArrowLeft className="h-5 w-5" />
            </motion.div>
            <span className="font-medium">Back to Ideas</span>
          </Link>

          <div className="flex items-center gap-2">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`p-2.5 rounded-lg border transition-all ${liked
                ? "bg-red-500/20 text-red-400 border-red-500/50"
                : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              onClick={handleLike}
              title="Like this idea"
            >
              <motion.div
                animate={liked ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              </motion.div>
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
              onClick={handleShare}
              title="Share this idea"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`p-2.5 rounded-lg border transition-all ${
                bookmarked
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
              }`}
              onClick={handleBookmark}
              aria-pressed={bookmarked}
              title="Bookmark this idea"
            >
              <motion.div
                animate={bookmarked ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Bookmark
                  className={`h-5 w-5 ${bookmarked ? "fill-current" : ""}`}
                />
              </motion.div>
            </motion.button>

            {isCreator && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                onClick={() => setShowDeleteModal(true)}
                title="Delete this idea"
              >
                <Trash2 className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <motion.div
        className="w-full mx-auto px-2 md:px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {idea.title}
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed">{idea.description}</p>
              </div>

              {idea.imageUrl && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={idea.imageUrl.startsWith('http') ? idea.imageUrl : `${API_BASE_URL}${idea.imageUrl}`}
                  alt={idea.title}
                  className="w-full h-64 object-cover rounded-xl border border-white/10"
                />
              )}

              {/* Tags */}
              <motion.div
                className="flex flex-wrap gap-2 pt-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {idea.tags?.map((tag, idx) => (
                  <motion.span
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                    className="bg-blue-500/10 text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-500/30 cursor-default transition-all"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                  <Heart className="h-4 w-4" />
                  <span className="font-bold text-lg">{likes}</span>
                </div>
                <span className="text-xs text-gray-500">Likes</span>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-bold text-lg">{idea.comments?.length ?? 0}</span>
                </div>
                <span className="text-xs text-gray-500">Comments</span>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="font-bold text-lg">{idea.teamMembers?.length ?? 0}</span>
                </div>
                <span className="text-xs text-gray-500">Team</span>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-bold text-sm">{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="text-xs text-gray-500">Posted</span>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-3 pt-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-6 py-3 rounded-lg font-medium transition-all"
                onClick={handleStartDiscussion}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Start Discussion
              </motion.button>
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="bg-white/5 hover:bg-white/10 border border-white/20 px-6 py-3 rounded-lg font-medium transition-all"
                onClick={() => setShowJoinModal(true)}
              >
                <Users className="h-4 w-4 mr-2 inline" />
                Join Project
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Project Details */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Tag className="h-5 w-5 text-blue-400" />
              </div>
              Project Details
            </h2>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed text-base">
              {idea.projectDetails}
            </p>
          </motion.div>

          {/* Discussion Section */}
          <motion.div
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
            ref={discussionSectionRef}
            variants={itemVariants}
            whileHover={{ y: -4 }}
          >
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-400" />
              </div>
              Discussion
              <span className="ml-2 px-3 py-1 bg-white/10 text-sm rounded-full">
                {idea.comments?.length ?? 0}
              </span>
            </h2>

            {/* Comments */}
            <motion.div
              className="space-y-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {idea.comments && idea.comments.length > 0 ? (
                idea.comments.map((c, idx) => (
                  <motion.div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    variants={itemVariants}
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-sm font-bold">
                      {(c.author?.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">
                        {c.author?.firstName} {c.author?.lastName}
                      </h3>
                      <p className="text-gray-300 mt-1 break-words">{c.content}</p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
              )}
            </motion.div>

            {/* Comment Input */}
            <motion.form
              onSubmit={handleCommentSubmit}
              className="space-y-4 pt-6 border-t border-white/10"
              variants={itemVariants}
            >
              <textarea
                ref={commentInputRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={3}
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all disabled:opacity-50"
                  disabled={!comment.trim()}
                >
                  <Send className="h-4 w-4" /> Post Comment
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>

        {/* Sidebar */}
          <div className="space-y-8">
            {/* Creator Card */}
            <Link to={`/user-profile?userId=${idea.creator?.id}`}>
              <motion.div
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500/50 transition-all"
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <h2 className="text-lg font-bold mb-6">Idea Creator</h2>
                <div className="text-center space-y-4">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={getProfilePicture(ideaCreator)}
              alt={`${ideaCreator?.firstName} ${ideaCreator?.lastName}`}
              className="w-20 h-20 rounded-full mx-auto border-2 border-blue-500/30 object-cover"
            />
            <div>
              <h3 className="font-semibold text-white text-lg">
                {ideaCreator?.firstName} {ideaCreator?.lastName}
              </h3>
              {ideaCreator?.profile?.company && (
                <p className="text-xs text-blue-400 font-medium mt-1">
                  💼 {ideaCreator.profile.company}
                </p>
              )}
              {ideaCreator?.profile?.city && (
                <p className="text-xs text-gray-400 mt-1">
                  📍 {ideaCreator.profile.city}, {ideaCreator.profile.country}
                </p>
              )}
            </div>
            {ideaCreator?.profile?.bio && (
              <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-2">
                "{ideaCreator.profile.bio}"
              </p>
            )}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm font-bold text-blue-400">{ideaCreator?.active_startups_count ?? 0}</p>
                <p className="text-xs text-gray-500">Startups</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm font-bold text-purple-400 flex items-center justify-center gap-1">
                  {ideaCreator?.statistics?.total_likes_received ?? 0}
                </p>
                <p className="text-xs text-gray-500">Total Likes</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-sm font-bold text-green-400">{ideaCreator?.streak_days ?? 0}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 pt-3 border-t border-white/10 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Satisfaction</span>
                <span className="font-semibold text-amber-400">{ideaCreator?.satisfaction_percentage?.toFixed(0) ?? 0}%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Revenue Generated</span>
                <span className="font-semibold text-emerald-400">${ideaCreator?.total_revenue?.toLocaleString() ?? 0}</span>
              </div>
              {ideaCreator?.pref_language && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Language</span>
                  <span className="font-semibold text-gray-300">{ideaCreator.pref_language.toUpperCase()}</span>
                </div>
              )}
              
            </div>

            {/* Member Badge */}
            {ideaCreator?.roles && ideaCreator.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center pt-2">
                {ideaCreator.roles.map((role, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30 capitalize">
              {role}
                  </span>
                ))}
              </div>
            )}
                </div>
              </motion.div>
            </Link>

            {/* Info Card */}
          <motion.div
            className="bg-gradient-to-br my-2 from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm"
            variants={itemVariants}
          >
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-2">Community Engaged</h3>
                <p className="text-sm text-gray-300">
                  Join discussions and collaborate with like-minded builders and entrepreneurs.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 rounded-lg shadow-lg text-white font-medium z-50"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 w-full max-w-md p-8 rounded-2xl relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
              <h2 className="text-2xl font-bold mb-6 text-center">Join Project Team</h2>
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Your Name *"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={joinPosition}
                    onChange={(e) => setJoinPosition(e.target.value)}
                    placeholder="Position/Role *"
                    required
                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={joinSkills}
                    onChange={(e) => setJoinSkills(e.target.value)}
                    placeholder="Skills (e.g., Python, React, AWS)"
                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <textarea
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder="Why do you want to join? (optional)"
                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    rows={3}
                  />
                </div>
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Join Team
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 w-full max-w-md p-8 rounded-2xl relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
              <div className="text-center space-y-6">
                <motion.div
                  className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Trash2 className="h-8 w-8 text-red-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Delete Idea</h2>
                  <p className="text-gray-400">
                    Are you sure? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg font-medium transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleDeleteIdea}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IdeationDetails;
