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
  UserCheck,
  Check,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { usersAPI } from "@/utils/APIs/userAPI";
import { getProfilePicture } from "@/utils/getProfilePicture";
import useSocket from "@/utils/hooks/useSocket";
import DeleteConfirmationModal from "@/utils/confirm";

const BASE_URL = API_BASE_URL + "/ideas";

const VisionDetails = () => {
  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState("comments");
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

  // Current user's own collab request status
  const [myCollabStatus, setMyCollabStatus] = useState(null);
  const [myCollabRequestId, setMyCollabRequestId] = useState(null);
  const [joinSkills, setJoinSkills] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const commentInputRef = useRef(null);
  const discussionSectionRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const ideaId = queryParams.get("id")?.toString();
  const { user, access_token } = useSelector((state) => state.auth);
  const { socket } = useSocket();

  const API_URL = import.meta.env.VITE_API_URL || "";

  // Co-developer requests state (creator only)
  const [collabRequests, setCollabRequests] = useState([]);
  const [collabRequestsLoading, setCollabRequestsLoading] = useState(false);
  const [showCollabRequests, setShowCollabRequests] = useState(true);

  const fetchCollabRequests = useCallback(async () => {
    if (!ideaId || !access_token) return;
    setCollabRequestsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/ideas/${ideaId}/collab-requests`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setCollabRequests(res.data.data?.collab_requests || []);
    } catch {
      // Not creator or no requests — silently ignore
    } finally {
      setCollabRequestsLoading(false);
    }
  }, [ideaId, access_token]);

  // Fetch current user's own request status (non-creator)
  const fetchMyCollabStatus = useCallback(async () => {
    if (!ideaId || !access_token) return;
    try {
      const res = await axios.get(`${API_URL}/ideas/${ideaId}/collab-requests/my-status`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const cr = res.data.data?.collab_request;
      if (cr) {
        setMyCollabStatus(cr.status);
        setMyCollabRequestId(cr.id);
      } else {
        setMyCollabStatus(null);
        setMyCollabRequestId(null);
      }
    } catch {
      setMyCollabStatus(null);
    }
  }, [ideaId, access_token]);

  const handleCollabAction = async (requestId, action) => {
    try {
      await axios.post(
        `${API_URL}/ideas/collab-requests/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      toast.success(action === "approve" ? "Request approved! They've been added to your team." : "Request rejected.");
      fetchCollabRequests();
      const res = await ideaAPI.getIdeaById(ideaId, access_token);
      const ideaData = res.data.data?.idea || res.data.idea;
      if (ideaData) setIdea(ideaData);
    } catch {
      toast.error(`Failed to ${action} request`);
    }
  };

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        const res = await ideaAPI.getIdeaById(ideaId);
        setIdea(res.data.idea);
        setLikes(res.data.idea.likes ?? 0);
        setLiked(res.data.idea.hasLiked || false);
        setBookmarked(res.data.idea.hasBookmarked || false);
        if (user && res.data.idea.likedBy?.length) {
          setLiked(res.data.idea.likedBy.includes(user.id));
        }
        const comments = await ideaAPI.getIdeaComments({ ideaId });
        const result = Object.groupBy(comments.data.comments, ({ suggestion }) => suggestion ? 'suggestions' : 'comments');
      
        setComments(result.comments || []);
        setSuggestions(result.suggestions || []);

        setIdea((prevIdea) => ({
          ...prevIdea,
          comments: comments.data.comments,
        }));
      } catch (error) {
        console.error("Error fetching vision:", error);
        setIdea(null);
      } finally {
        setLoading(false);
      }
    };
    if (ideaId) fetchIdea();
  }, [ideaId, access_token, user]);

  // Fetch collab requests when idea loads (creator only)
  useEffect(() => {
    if (idea && user?.id === idea?.creator?.id) {
      fetchCollabRequests();
    }
  }, [idea?.id, user?.id]);

  // Fetch current user's own request status (non-creator)
  useEffect(() => {
    if (idea && user?.id !== idea?.creator?.id) {
      fetchMyCollabStatus();
    }
  }, [idea?.id, user?.id]);

  // Realtime: listen for new collab requests via socket
  useEffect(() => {
    if (!socket || !idea || user?.id !== idea?.creator?.id) return;
    const handleNewRequest = (data) => {
      if (String(data?.idea_id) !== String(ideaId)) return;
      fetchCollabRequests();
      toast.info(`New co-developer request from ${data?.requester_name || "someone"}!`);
    };
    socket.on("new_collab_request", handleNewRequest);
    return () => socket.off("new_collab_request", handleNewRequest);
  }, [socket, idea?.id, user?.id, ideaId]);


  useEffect(() => {
    async function getCreator() {
      if (idea?.creator?.id) {
        try {
          const res = await usersAPI.getById(idea.creator.id, { include_stats: true });
          setIdeaCreator(res.data.user);
        } catch (err) {
          console.error("Error fetching vision creator:", err);
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

  const handleJoinSubmit = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/ideas/${ideaId}/collab-requests`,
        { message: joinMessage, role: "co-developer" },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const cr = res.data.data?.collab_request;
      if (cr) {
        setMyCollabStatus(cr.status);
        setMyCollabRequestId(cr.id);
      }
      toast.success("Request sent! The creator will review it.");
      setJoinMessage("");
      setShowJoinModal(false);
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to send request";
      toast.error(msg);
    }
  };

  const handleCancelMyRequest = async () => {
    if (!myCollabRequestId) return;
    try {
      await axios.post(
        `${API_URL}/ideas/collab-requests/${myCollabRequestId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setMyCollabStatus(null);
      setMyCollabRequestId(null);
      toast.info("Request cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel request");
    }
  };

  const handleLeaveIdea = async () => {
    try {
      await axios.post(
        `${API_URL}/ideas/${ideaId}/leave`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setMyCollabStatus(null);
      setMyCollabRequestId(null);
      // Refresh idea to update team count
      const res = await ideaAPI.getIdeaById(ideaId, access_token);
      const ideaData = res.data.data?.idea || res.data.idea;
      if (ideaData) setIdea(ideaData);
      toast.info("You have left the project");
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to leave project");
    }
  };


  const handleCommentSubmit = async (e, isSuggestion = false) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const body = {
        idea_id: ideaId,
        content: comment.trim(),
        author_id: user?.id,
        author_first_name: user?.firstName || "",
        author_last_name: user?.lastName || "",
        suggestion: isSuggestion
      }
      const res = await ideaAPI.createIdeaComment(body, access_token);
      if (!res.success) {
        throw new Error("Failed to post comment");
      }

      if (isSuggestion) {
        setSuggestions((prev) => [...prev, res.data.comment]);
      } else {
        setComments((prev) => [...prev, res.data.comment]);
      }
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
        setSuccessMsg(response?.message || "Vision deleted successfully");
        setTimeout(() => {
          navigate("/ideation");
        }, 1500);
      }
    } catch (err) {
      console.error("Error deleting vision:", err);
      setShowDeleteModal(false);
      toast.error("Failed to delete vision. Please try again.");
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
        console.error("Error liking vision:", err);
      }
    },
    [ideaId, access_token, user]
  );
  const handleCommentLike = async (commentId) => {
    try {
      const response = await ideaAPI.toggleIdeaCommentLike(commentId);
    
      if (response.success) {
        // Update comments list
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? { ...c, likes: response.data.likes_count, userLiked: response.data.user_liked }
              : c
          )
        );
      
        // Update suggestions list
        setSuggestions(prevSuggestions =>
          prevSuggestions.map(s =>
            s.id === commentId
              ? { ...s, likes: response.data.likes_count, userLiked: response.data.user_liked }
              : s
          )
        );
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Failed to like comment");
    }
  }
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
        Vision not found.
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
        <div className="w-full mx-auto px-4 py-4 flex items-center justify-between w-full">
          <Link
            to="/ideation"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
              <ArrowLeft className="h-5 w-5" />
            </motion.div>
            <span className="font-medium">Back to Visions</span>
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
              title="Like this vision"
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
              title="Share this vision"
            >
              <Share2 className="h-5 w-5" />
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`p-2.5 rounded-lg border transition-all ${bookmarked
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/50"
                  : "bg-white/5 border-white/20 hover:bg-white/10"
                }`}
              onClick={handleBookmark}
              aria-pressed={bookmarked}
              title="Bookmark this vision"
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
                title="Delete this vision"
              >
                <Trash2 className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Layout */}
      <motion.div
        className="w-full mx-auto px-2 md:px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full relative z-10"
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
                  src={idea.imageUrl}
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
              {!isCreator && (
                <div>
                  {myCollabStatus === 'approved' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        ✓ Co-Developer on this project
                      </div>
                      <motion.button
                        variants={buttonVariants} whileHover="hover" whileTap="tap"
                        onClick={handleLeaveIdea}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all"
                      >
                        Leave Project
                      </motion.button>
                    </div>
                  ) : myCollabStatus === 'pending' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium">
                        <Users className="h-4 w-4" />
                        Interest Sent — Awaiting Review
                      </div>
                      <motion.button
                        variants={buttonVariants} whileHover="hover" whileTap="tap"
                        onClick={handleCancelMyRequest}
                        className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-medium transition-all"
                      >
                        Cancel Request
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      variants={buttonVariants} whileHover="hover" whileTap="tap"
                      className="bg-white/5 hover:bg-white/10 border border-white/20 px-6 py-3 rounded-lg font-medium transition-all"
                      onClick={() => setShowJoinModal(true)}
                    >
                      <Users className="h-4 w-4 mr-2 inline" />
                      {myCollabStatus === 'rejected' ? 'Express Interest Again' : 'Interested in Co-Developing'}
                    </motion.button>
                  )}
                </div>
              )}
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

            {/* Comments and Suggestions Tabs */}
            <motion.div
              className="space-y-6 mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Tabs */}
              <div className="flex gap-4 border-b border-white/10">
                <motion.button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-3 px-4 font-medium transition-all ${activeTab === 'comments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  whileHover={{ y: -2 }}
                >
                  Comments ({comments.length})
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab('suggestions')}
                  className={`pb-3 px-4 font-medium transition-all ${activeTab === 'suggestions' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                  whileHover={{ y: -2 }}
                >
                  Suggestions ({suggestions.length})
                </motion.button>
              </div>

              {/* Comments Section */}
              {activeTab === 'comments' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {comments && comments.length > 0 ? (
                    comments.map((c, idx) => (
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="group relative flex gap-4 p-4 rounded-2xl 
                 bg-gradient-to-br from-white/5 to-white/[0.02] 
                 border border-white/10 
                 hover:border-white/20 
                 transition-all duration-300"
                      >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br 
                      from-blue-500 to-purple-600 
                      flex items-center justify-center 
                      text-sm font-semibold text-white 
                      shadow-md shadow-black/20">
                          {(c.author?.firstName?.[0] || "U").toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm tracking-tight">
                              {c.author?.firstName} {c.author?.lastName}
                            </h3>

                            <span className="text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Comment Text */}
                          <p className="text-gray-300 mt-2 text-sm leading-relaxed break-words">
                            {c.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-3">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleCommentLike(c.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
              text-xs font-medium transition-all
              ${c?.userLiked
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <Heart
                                fill={c?.userLiked ? "currentColor" : "none"}
                                stroke="currentColor"
                                className="w-4 h-4 transition-all"
                              />
                              {c.likes ?? 0}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No comments yet. Be the first to share your thoughts!</p>
                  )}
                </motion.div>
              )}
              {activeTab === 'suggestions' && (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {suggestions && suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -3 }}
                        className="group relative flex gap-4 p-5 rounded-2xl
                 bg-gradient-to-br from-amber-500/10 to-orange-500/[0.04]
                 border border-amber-500/20
                 hover:border-amber-400/40
                 transition-all duration-300"
                      >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 rounded-2xl
                      bg-gradient-to-br from-amber-500/10 to-orange-500/10
                      opacity-0 group-hover:opacity-100
                      transition duration-500 pointer-events-none" />

                        {/* Icon Avatar */}
                        <div className="w-11 h-11 rounded-full
                      bg-gradient-to-br from-amber-500 to-orange-600
                      flex items-center justify-center
                      shadow-md shadow-black/20">
                          <Zap className="h-5 w-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm tracking-tight">
                              {s.author?.firstName}{" "}
                              {s.author?.lastName}
                            </h3>

                            <span className="text-xs text-amber-300/70">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Body */}
                          <p className="text-gray-300 mt-2 text-sm leading-relaxed break-words">
                            {s.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-4">
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => handleCommentLike(s.id)}
                              disabled={loading}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              text-xs font-medium transition-all
              ${s.userLiked
                                  ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <Heart
                                fill={s.userLiked ? "red" : "none"}
                                stroke="currentColor"
                                className="w-4 h-4 transition-all"
                              />
                              {s.likes ?? 0}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">No suggestions yet. Share your ideas!</p>
                  )}
                </motion.div>
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
              <div className="flex justify-end gap-2">
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
                <motion.button
                  type="button"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-amber-600 hover:bg-amber-700 px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all disabled:opacity-50"
                  onClick={(e) => {
                    setComment(e.target.value)

                    handleCommentSubmit(e, true)
                  }}
                  disabled={!comment.trim()}
                >
                  <Zap className="h-4 w-4" /> Suggest Improvement
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
              <h2 className="text-lg font-bold mb-6">Vision Creator</h2>
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

          {/* Co-Developer Requests Panel — creator only */}
          {isCreator && (
            <>
            <motion.div
              className="bg-gradient-to-br from-emerald-900/20 to-teal-900/10 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-sm"
              variants={itemVariants}
            >
              <button
                onClick={() => setShowCollabRequests((v) => !v)}
                className="w-full flex items-center justify-between mb-1"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white">Co-Developer Requests</h3>
                  {collabRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500 text-black text-xs font-bold rounded-full">
                      {collabRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </div>
                {showCollabRequests
                  ? <ChevronUp className="h-4 w-4 text-gray-400" />
                  : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              <AnimatePresence>
                {showCollabRequests && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {collabRequestsLoading ? (
                      <div className="flex justify-center py-6">
                        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                      </div>
                    ) : collabRequests.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4 mt-2">No requests yet.</p>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {collabRequests.map((req) => (
                          <div
                            key={req.id}
                            className={`rounded-xl p-4 border transition-all ${
                              req.status === 'pending'
                                ? 'bg-white/5 border-emerald-500/20'
                                : req.status === 'approved'
                                ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60'
                                : 'bg-red-500/5 border-red-500/10 opacity-60'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                {req.first_name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm">{req.first_name} {req.last_name}</p>
                                <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full capitalize mt-0.5">
                                  {req.role}
                                </span>
                                {req.message && (
                                  <p className="text-gray-400 text-xs mt-2 italic line-clamp-3">"{req.message}"</p>
                                )}
                              </div>
                            </div>
                            {req.status === 'pending' ? (
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleCollabAction(req.id, 'approve')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all"
                                >
                                  <Check className="h-3.5 w-3.5" /> Accept
                                </button>
                                <button
                                  onClick={() => handleCollabAction(req.id, 'reject')}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/40 text-gray-400 hover:text-red-400 font-semibold text-xs transition-all"
                                >
                                  <XCircle className="h-3.5 w-3.5" /> Reject
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {req.status === 'approved' ? '✓ Accepted' : '✗ Rejected'}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Launch Vision Card */}
            <motion.div
              className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm"
              variants={itemVariants}
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Ready to Launch?</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Turn this vision into reality and start your journey as a founder.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/register-startup?ideaId=${ideaId}`}
                  className="w-full"
                >
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Launch as Startup
                  </motion.button>
                </Link>
              </div>
            </motion.div>
            </>
          )}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              className="bg-gray-900 border border-emerald-500/30 w-full max-w-md p-6 rounded-2xl relative shadow-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white mb-1">Interested in Co-Developing?</h2>
              <p className="text-sm text-gray-400 mb-5 line-clamp-1">"{idea?.title}"</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Message to creator <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    placeholder="Tell them why you'd be a great fit..."
                    rows={4}
                    className="w-full bg-white/5 border border-gray-700 focus:border-emerald-500/50 rounded-xl p-3 text-sm text-white placeholder-gray-600 outline-none resize-none transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Express Interest
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteIdea}
          title="Delete Vision"
          message="Are you sure you want to delete this vision? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default VisionDetails;