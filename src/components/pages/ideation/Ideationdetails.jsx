import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from 'react-toastify';
import { mockSuggestedContributors } from '@/services/mock/mockProfiles';
import { DEV_AUTH_BYPASS } from '@/services/auth/devSession';
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
  AlertCircle,
  Lightbulb,
  Smile,
  Paperclip,
  AtSign,
  Plus,
  Info,
  Target,
  Wrench,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/utils/config";
import { ideaAPI } from "@/utils/APIs/ideaAPI";
import { useSelector } from "react-redux";
import { usersAPI } from "@/utils/APIs/userAPI";
import { getProfilePicture } from "@/utils/getProfilePicture";
import useSocket from "@/utils/hooks/useSocket";
import VisionNotFound from "../vision/VisionNotFound";
import DeleteConfirmationModal from "@/utils/confirm";
import VisionReadinessCard from '@/components/pages/ideation/VisionReadinessCard';
import MatchmakingSection from './MatchmakingSection';
import { getStageColor, getCategoryColor } from './getStageColor';
import AdSlot from "@/components/cosmos/AdSlot";

const BASE_URL = API_BASE_URL + "/ideas";
const API_URL = API_BASE_URL;

const MOCK_IDEAS = [
  {
    id: "sv-1",
    title: "Founder Match: Find Your Tech Co-Founder",
    description: "A simple tool that connects non-technical founders with developers based on actual skills and shared interests, not just resume buzzwords.",
    projectDetails: "We're building a platform to solve the biggest headache for early-stage startups: finding a technical co-founder. Instead of endless networking events, we use smart matching to connect you with builders who have the right skills, tech stack, and vibe.",
    stage: "Prototype",
    category: "AI / SaaS",
    privacy: "public",
    creatorId: "mock-user-1",
    imageUrl: "",
    creator: {
      id: "mock-user-1",
      firstName: "Oskar",
      lastName: "K",
    },
    author: {
      name: "Oskar K",
      avatar: "",
      id: "mock-user-1",
      role: "Founder & CEO"
    },
    createdAt: new Date().toISOString(),
    timeAgo: "1 hour ago",
    likes: 12,
    hasLiked: false,
    hasBookmarked: false,
    comments: [],
    teamMembers: [
      { name: "Alice Smith", role: "Frontend Developer" },
      { name: "Bob Johnson", role: "Backend Developer" },
      { name: "Charlie Davis", role: "UI/UX Designer" }
    ],
    collaborators: 1,
    tags: ["Matchmaking", "Startup Tool", "Community"],
    visionState: "public",
    readinessScore: 85,
    isConverted: false,
    problemStatement: "Non-technical founders struggle to find developers who are both skilled and genuinely interested in their domain. Networking events and cold LinkedIn outreach produce low-quality matches and waste months.",
    solution: "Matching on tech stack requirements *and* soft-signal alignment — build consistency, sector interest, availability — so introductions start warm instead of cold.",
    whereItStands: "Working prototype matching on skills and availability. Next: bring in contribution history so the score reflects what people have actually shipped, not what they claim.",
    requiredRoles: ["Fullstack Engineer", "Product Designer", "Growth Marketer"],
    techStack: ["REACT", "NODE.JS", "POSTGRES", "TAILWIND", "WEBSOCKETS"]
  },
  {
    id: "mock-idea-2",
    title: "Builder Rep: Verified Portfolios",
    description: "A transparent way for builders to prove their track record. We track real project outcomes and consistency so founders know who they can trust.",
    projectDetails: "Our platform lets builders build a verified portfolio of their work. We track client satisfaction, real revenue generated, and consistency. This gives founders a transparent, BS-free way to evaluate a builder's actual experience before teaming up.",
    stage: "Concept",
    category: "Web3",
    privacy: "public",
    creatorId: "mock-user-2",
    imageUrl: "",
    creator: {
      id: "mock-user-2",
      firstName: "Marcus",
      lastName: "Dupont",
    },
    author: {
      name: "Marcus Dupont",
      avatar: "",
      id: "mock-user-2",
      role: "Product Lead"
    },
    createdAt: new Date().toISOString(),
    timeAgo: "2 days ago",
    likes: 8,
    hasLiked: false,
    hasBookmarked: false,
    comments: [],
    teamMembers: [
      { name: "Oskar K", avatar: "", role: "Smart Contract Developer" },
      { name: "Sophia Martinez", avatar: "", role: "Frontend Developer" },
      { name: "Lucas Silva", avatar: "", role: "Web3 UI Designer" },
      { name: "Mia Wong", avatar: "", role: "Growth Marketer" },
      { name: "Ryan Reynolds", avatar: "", role: "Solidity Auditor" },
      { name: "Grace Hopper", avatar: "", role: "Protocol Engineer" }
    ],
    collaborators: 0,
    tags: ["Trust Engine", "SaaS", "Portfolio"],
    visionState: "public",
    readinessScore: 50,
    isConverted: false,
    problemStatement: "It is currently impossible for a founder to verify a builder's actual track record of completed projects, code consistency, and client satisfaction. Portfolios are easily faked or embellished.",
    solution: "A decentralized trust platform that logs real project milestones, client ratings, and developer stats on-chain, creating a verified 'Builder Reputation' score.",
    requiredRoles: ["Solidity Developer", "React Developer", "UX Researcher"],
    techStack: ["Solidity", "Ethers.js", "React", "Next.js", "Tailwind CSS"]
  }
];

const MOCK_RECOMMENDATIONS = [
  {
    id: "mock-builder-1",
    name: "Alex Rivera",
    role: "Fullstack Engineer",
    match_score: 95,
    match_label: "Excellent Match",
    skills: ["React", "Node.js", "GraphQL", "Tailwind CSS"],
    explanation: [
      "Has built solid React and Node.js apps in production.",
      "Worked on a similar founder matching platform in the past.",
      "Really interested in building tools that help people collaborate."
    ],
    profile_picture: null
  },
  {
    id: "mock-builder-2",
    name: "Sarah Chen",
    role: "AI Engineer",
    match_score: 88,
    match_label: "Strong Match",
    skills: ["Python", "PyTorch", "LLMs", "FastAPI"],
    explanation: [
      "Knows her way around Large Language Models and search algorithms.",
      "Her skills perfectly match the AI requirements you listed.",
      "Available to start part-time right away."
    ],
    profile_picture: null
  },
  {
    id: "mock-builder-3",
    name: "Marcus Dupont",
    role: "Product Designer",
    match_score: 72,
    match_label: "Good Match",
    skills: ["Figma", "UI/UX Design", "User Research", "Wireframing"],
    explanation: [
      "Great eye for design systems and dark-mode UI.",
      "Has designed MVPs for 3 early-stage startups.",
      "Excited to work on new workflow tools."
    ],
    profile_picture: null
  },
  {
    id: "mock-builder-4",
    name: "Elena Rostova",
    role: "Frontend Developer",
    match_score: 82,
    match_label: "Solid Match",
    skills: ["Vue.js", "React", "TypeScript", "UI Polish"],
    explanation: [
      "Has a strong background in creating pixel-perfect interfaces.",
      "Matches your need for a dedicated frontend specialist.",
      "Looking for a new project to contribute to."
    ],
    profile_picture: null
  },
  // Padded out to 24 in dev. With only four entries the metered states were
  // unreachable — the free allowance is ten, so there was never anything to
  // unlock and the credit gate never appeared. mockSuggestedContributors()
  // returns [] in production builds.
  ...mockSuggestedContributors(20).map((p, i) => ({
    id: `mock-builder-${i + 5}`,
    name: p.name,
    role: p.role,
    match_score: p.match,
    match_label:
      p.match >= 90 ? "Excellent Match" : p.match >= 80 ? "Strong Match" : p.match >= 70 ? "Good Match" : "Possible Match",
    skills: p.skills,
    explanation: p.reasons,
    profile_picture: null,
  })),
];

const VisionDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState("comments");
  const [activeMainTab, setActiveMainTab] = useState(searchParams.get("tab") || "pitch");

  const handleMainTabChange = (tabId) => {
    setActiveMainTab(tabId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tabId);
    setSearchParams(newParams, { replace: true });
  };
  const [ideaCreator, setIdeaCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");
  const [showAllTeam, setShowAllTeam] = useState(false);

  // Current user's own collab request status
  const [myCollabStatus, setMyCollabStatus] = useState(null);
  const [myCollabRequestId, setMyCollabRequestId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const commentInputRef = useRef(null);
  const discussionSectionRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const params = useParams();
  const ideaId = searchParams.get("id")?.toString() || searchParams.get("ideaId")?.toString() || searchParams.get("visionId")?.toString() || params?.id?.toString();
  const { user, access_token } = useSelector((state) => state.auth);
  const { socket } = useSocket();


  // Co-developer requests state (creator only)
  const [collabRequests, setCollabRequests] = useState([]);
  const [collabRequestsLoading, setCollabRequestsLoading] = useState(false);
  const [showCollabRequests, setShowCollabRequests] = useState(true);

  // AI Matchmaking state
  const [recommendations, setRecommendations] = useState([]);
  const [matchmakingLoading, setMatchmakingLoading] = useState(false);

  const fetchCollabRequests = useCallback(async () => {
    if (!ideaId || !access_token) return;
    setCollabRequestsLoading(true);
    try {
      const res = await axios.get(`/api/ideas/${ideaId}/collab-requests`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setCollabRequests(res.data.data?.collab_requests || []);
    } catch {
      // Fallback for mock ideas / offline mode
      if (ideaId && ideaId.startsWith("mock-")) {
        setCollabRequests([
          {
            id: "mcr-1",
            message: "Hey! I am a senior Fullstack Dev with 5 years React experience. I'd love to help build this out!",
            role: "co-developer",
            status: "pending",
            user: { id: "mock-builder-1", firstName: "Alex", lastName: "Rivera", email: "alex.rivera@example.com" }
          },
          {
            id: "mcr-2",
            message: "I am a UX Researcher and designer. I can help with wireframing and conducting user interviews.",
            role: "co-developer",
            status: "pending",
            user: { id: "mock-builder-3", firstName: "Marcus", lastName: "Dupont", email: "marcus.dupont@example.com" }
          }
        ]);
      } else {
        setCollabRequests([]);
      }
    } finally {
      setCollabRequestsLoading(false);
    }
  }, [ideaId, access_token]);

  // Fetch current user's own request status (non-creator)
  const fetchMyCollabStatus = useCallback(async () => {
    if (!ideaId || !access_token) return;
    try {
      const res = await axios.get(`/api/ideas/${ideaId}/collab-requests/my-status`, {
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

  const fetchMatchmaking = useCallback(async () => {
    if (!ideaId) return;
    setMatchmakingLoading(true);
    try {
      const token = access_token || localStorage.getItem("access_token");
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await axios.get(`${API_BASE_URL}/matchmaking/vision/${ideaId}`, {
        headers,
      });
      const recs = res.data.data?.recommendations ||
        res.data.recommendations ||
        res.data.matches ||
        (Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
      setRecommendations(recs.length > 0 ? recs : MOCK_RECOMMENDATIONS);
    } catch (err) {
      console.error("Error fetching matchmaking recommendations (using mock fallback):", err);
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setMatchmakingLoading(false);
    }
  }, [ideaId, access_token]);

  const handleCollabAction = async (requestId, action) => {
    try {
      await axios.post(
        `/api/ideas/collab-requests/${requestId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      toast.success(action === "accept" ? "Request accepted! They've been added to your team." : "Request rejected.");
      fetchCollabRequests();
      const res = await ideaAPI.getIdeaById(ideaId, access_token);
      const ideaData = res.data.data?.idea || res.data.idea;
      if (ideaData) setIdea(ideaData);
    } catch {
      console.warn(`Failed to ${action} request, using mock fallback`);
      toast.success((action === "approve" || action === "accept") ? "Request approved! (offline mode)" : "Request rejected. (offline mode)");
      // Remove approved/rejected request locally
      setCollabRequests(prev => prev.filter(r => r.id !== requestId));
      if (action === "approve" || action === "accept") {
        setIdea(prev => {
          const approvedReq = collabRequests.find(r => r.id === requestId);
          const newMember = approvedReq?.user
            ? { name: `${approvedReq.user.firstName} ${approvedReq.user.lastName}`, role: approvedReq.role || "Co-Developer" }
            : { name: "Approved Developer", role: "Co-Developer" };
          return {
            ...prev,
            teamMembers: [...(prev?.teamMembers || []), newMember]
          };
        });
      }
    }
  };

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        let res = null;
        if (ideaId) {
          res = await ideaAPI.getIdeaById(ideaId).catch(() => null);
        }
        const ideaData = res?.data?.idea || res?.data || null;

        if (ideaData && ideaData.title) {
          setIdea(ideaData);
          setLikes(ideaData.likes ?? 0);
          setLiked(ideaData.hasLiked || false);
          setBookmarked(ideaData.hasBookmarked || false);
          if (user && ideaData.likedBy?.length) {
            setLiked(ideaData.likedBy.includes(user.id));
          }
          const commentsRes = await ideaAPI.getIdeaComments({ ideaId }).catch(() => null);
          const allComments = commentsRes?.data?.comments || [];
          setComments(allComments.filter((c) => !c.suggestion));
          setSuggestions(allComments.filter((c) => c.suggestion));
          setIdea((prevIdea) => ({ ...prevIdea, comments: allComments }));
          return;
        }

        // Fallback to sample visions
        const fallbackIdea = MOCK_IDEAS.find(i => String(i.id) === String(ideaId) || String(i.id) === `sv-${ideaId}`) || MOCK_IDEAS[0];
        setIdea(fallbackIdea);
        setLikes(fallbackIdea.likes || 0);
        setLiked(false);
        setBookmarked(false);

        const mockComments = [
          {
            id: "mc-1",
            content: "This looks like a really promising project! I've ran into this exact co-founder search problem three times before. Definitely needed.",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            author: { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@example.com" },
            likes: 4,
            userLiked: false
          },
          {
            id: "mc-2",
            content: "Agreed. Are you planning to add a portfolio verification mechanic or is it purely self-reported skill tags?",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            author: { firstName: "Alex", lastName: "Rivera", email: "alex.rivera@example.com" },
            likes: 2,
            userLiked: false
          }
        ];

        const mockSuggestions = [
          {
            id: "ms-1",
            content: "Suggest using GitHub OAuth to automatically analyze repositories and generate verified developer tags instead of manual input.",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            author: { firstName: "Elena", lastName: "Rostova", email: "elena.r@example.com" },
            likes: 5,
            userLiked: false,
            suggestion: true
          }
        ];

        setComments(mockComments);
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error("Error fetching vision (using mock fallback):", error);
        const fallbackIdea = MOCK_IDEAS.find(i => String(i.id) === String(ideaId) || String(i.id) === `sv-${ideaId}`) || MOCK_IDEAS[0];
        setIdea(fallbackIdea);
        setLikes(fallbackIdea.likes || 0);
        setLiked(false);
        setBookmarked(false);
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

  // Fetch matchmaking recommendations once when the vision details load
  useEffect(() => {
    if (ideaId) {
      fetchMatchmaking();
    }
  }, [ideaId, fetchMatchmaking]);

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
      toast.error("Please login to bookmark this idea");
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
      if (response?.data) {
        setBookmarked(response.data.isBookmarked);
      }
    } catch (error) {
      console.error("Bookmark toggle error:", error);
      // Fallback for mock ideas / offline mode
      setBookmarked(prev => !prev);
      toast.info("Bookmark state updated locally (offline mode)");
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
    setActiveMainTab("collab");
    setTimeout(() => {
      commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      commentInputRef.current?.focus();
    }, 150);
  };

  const handleJoinSubmit = async () => {
    if (!user?.id) {
      toast.error("Please login to express interest");
      return;
    }
    try {
      const res = await axios.post(
        `/api/ideas/${ideaId}/collab-requests`,
        { message: joinMessage, role: "co-developer" },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const cr = res?.data?.data?.collab_request;
      if (cr) {
        setMyCollabStatus(cr.status);
        setMyCollabRequestId(cr.id);
      }
      toast.success("Request sent! The creator will review it.");
      setJoinMessage("");
      setShowJoinModal(false);
    } catch (err) {
      console.error("Join request error:", err);
      // Local fallback for mock ideas / offline mode
      setMyCollabStatus("pending");
      setMyCollabRequestId("mock-request-id");
      toast.success("Request sent! (offline mode)");
      setJoinMessage("");
      setShowJoinModal(false);
    }
  };

  const handleCancelMyRequest = async () => {
    if (!myCollabRequestId) return;
    try {
      await axios.post(
        `/api/ideas/collab-requests/${myCollabRequestId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      setMyCollabStatus(null);
      setMyCollabRequestId(null);
      toast.info("Request cancelled");
    } catch (err) {
      // Local fallback
      setMyCollabStatus(null);
      setMyCollabRequestId(null);
      toast.info("Request cancelled (offline mode)");
    }
  };

  const handleLeaveIdea = async () => {
    try {
      await axios.post(
        `/api/ideas/${ideaId}/leave`,
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
      // Local fallback
      setMyCollabStatus(null);
      setMyCollabRequestId(null);
      toast.info("You have left the project (offline mode)");
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
      // Local fallback for mock ideas / offline mode
      const newComment = {
        id: Math.random().toString(),
        idea_id: ideaId,
        content: comment.trim(),
        suggestion: isSuggestion,
        author: user || { firstName: "Guest", lastName: "User" },
        createdAt: new Date().toISOString(),
        likes: 0,
        userLiked: false
      };
      if (isSuggestion) {
        setSuggestions((prev) => [...prev, newComment]);
      } else {
        setComments((prev) => [...prev, newComment]);
      }
      setComment("");
      toast.info("Comment posted locally (offline mode)");
    }
  };

  const handleDeleteIdea = async () => {
    try {
      const response = await ideaAPI.deleteIdea(ideaId, access_token)

      if (response.success) {
        setSuccessMsg(response?.message || "Idea deleted successfully");
        setShowDeleteModal(false);
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
      if (!user?.id) {
        toast.error("Please login to like this idea");
        return;
      }
      try {
        setLiked((prevLiked) => {
          const newLiked = !prevLiked;
          setLikes((prevLikes) => (newLiked ? prevLikes + 1 : prevLikes - 1));
          return newLiked;
        });

        const res = await ideaAPI.likeIdea(ideaId, access_token);
        if (res?.data?.idea) {
          setLikes(res.data.idea.likes);
          setLiked(res.data.idea.likedBy?.includes(user.id) || false);
        }
      } catch (err) {
        console.error("Error liking idea:", err);
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
      // Fallback: toggle locally
      const toggleLike = (list) =>
        list.map((c) =>
          c.id === commentId
            ? {
              ...c,
              likes: (c.userLiked ? Math.max(0, c.likes - 1) : c.likes + 1),
              userLiked: !c.userLiked,
            }
            : c
        );
      setComments(toggleLike);
      setSuggestions(toggleLike);
      toast.info("Comment like updated locally (offline mode)");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Attached file: ${file.name}`);
      setComment(prev => prev + ` [Attachment: ${file.name}]`);
    }
  };

  const handleInviteClick = () => {
    const url = `${window.location.origin}/ideation-details?id=${ideaId}`;
    navigator.clipboard.writeText(url);
    toast.success("Project link copied to clipboard! Share it with developers to invite them.");
  };

  const isCreator = useMemo(() => user?.id && idea?.creator?.id && user.id === idea.creator.id, [user, idea]);

  // Only this Vision's owner recruits for it. A builder viewing someone else's
  // Vision must not be shown a list of other builders — that is their own
  // competition, not a useful panel.
  //
  // Under the dev auth bypass there is no real ownership (the fake user owns
  // nothing), so the owner view would be unreachable for review. The override
  // is dev-only and requires the founder role, so production gating is intact.
  const canRecruitBuilders = Boolean(
    isCreator ||
    (DEV_AUTH_BYPASS && (localStorage.getItem('activeRole') || '') === 'founder')
  );

  // B8c FIX: Vision → Startup activation
  const [activating, setActivating] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  const checkEligibility = async () => {
    if (!idea?.id) return;
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/activation/ideas/${idea.id}/eligibility`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEligibility(data);
    } catch { setEligibility(null); }
  };

  const handleActivate = async () => {
    if (!idea?.id || activating) return;
    setActivating(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/activation/ideas/${idea.id}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vision activated as a Startup!');
        if (data.startup?.id) navigate(`/startup-details/${data.startup.id}`);
      } else {
        toast.error(data.error || 'Activation failed');
      }
    } catch { toast.error('Activation failed'); }
    finally { setActivating(false); }
  };

  useEffect(() => { if (isCreator && idea) checkEligibility(); }, [isCreator, idea?.id]);

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
    return <VisionNotFound />;
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
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
    <div className="min-h-screen bg-[#030712] text-white relative overflow-hidden">
      {/* Animated Glowing Orbs Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse pointer-events-none delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#030712]/85 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            to="/ideation"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 group text-xs sm:text-sm font-medium"
          >
            <motion.div whileHover={{ x: -3 }} transition={{ duration: 0.2 }} className="p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl group-hover:bg-white/[0.08] group-hover:border-white/15 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </motion.div>
            <span>Back to Ideas</span>
          </Link>

          <div className="flex items-center gap-1.5 p-1 bg-[#0b0c10]/60 border border-white/[0.08] rounded-2xl backdrop-blur-md shadow-xl">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`p-2 rounded-xl border transition-all duration-200 ${liked
                ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              onClick={handleLike}
              title="Like this idea"
            >
              <motion.div
                animate={liked ? { scale: [1, 1.25, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </motion.div>
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className="p-2 rounded-xl border border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              onClick={handleShare}
              title="Share this idea"
            >
              <Share2 className="h-4 w-4" />
            </motion.button>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`p-2 rounded-xl border transition-all duration-200 ${bookmarked
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                : "bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
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
                  className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
                />
              </motion.div>
            </motion.button>

            {isCreator && eligibility?.eligible && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleActivate}
                disabled={activating}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10
                  hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium transition-all flex items-center gap-1.5"
                title="Vision meets all requirements — activate as Startup"
              >
                🚀 {activating ? 'Activating...' : 'Activate as Startup'}
              </motion.button>
            )}
            {isCreator && eligibility && !eligibility.eligible && (
              <div className="text-[10px] text-zinc-400 px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/80">
                {eligibility.next_requirement || 'Build readiness to activate'}
              </div>
            )}
            {isCreator && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="p-2 rounded-xl border border-transparent bg-transparent text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                onClick={() => setShowDeleteModal(true)}
                title="Delete this idea"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Top Layout Grid: Hero Card & Startup Readiness */}
      <motion.div
        className="w-full mx-auto px-2 md:px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-stretch"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column - Hero Card */}
        <div className="lg:col-span-2">
          {/* Hero Card */}
          <motion.div
            className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-4 sm:p-6 lg:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] h-full flex flex-col justify-between overflow-hidden group transition-all duration-550"
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glowing blur decorations inside Hero Card */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl opacity-40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400">
                    {idea.category || "AI / SaaS"}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                    {idea.stage || "Concept"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-gray-200 bg-clip-text text-transparent mb-4 tracking-tight leading-tight break-words">
                  {idea.title}
                </h1>
                <p className="text-gray-400/90 text-sm sm:text-base md:text-lg leading-relaxed">{idea.description}</p>
              </div>

              {idea.imageUrl && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={idea.imageUrl}
                  alt={idea.title}
                  className="w-full h-44 sm:h-56 md:h-64 object-cover rounded-xl border border-white/10"
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
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.15)" }}
                    className="bg-white/5 text-gray-300 text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.06] cursor-default transition-all duration-200"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </motion.div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.06]">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer shadow-md">
                  <div className="flex items-center gap-1.5 text-red-400 mb-0.5">
                    <Heart className="h-4 w-4" />
                    <span className="font-semibold text-base sm:text-lg">{likes}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Likes</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer shadow-md">
                  <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-semibold text-base sm:text-lg">{idea.comments?.length ?? 0}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Comments</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer shadow-md">
                  <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold text-base sm:text-lg">{idea.teamMembers?.length ?? 0}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Team</span>
                </motion.div>
                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer shadow-md">
                  <div className="flex items-center gap-1.5 text-amber-400 mb-0.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold text-xs sm:text-sm">{new Date(idea.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Posted</span>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row flex-wrap gap-3 pt-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full sm:w-auto justify-center bg-gradient-to-r from-blue-650 to-indigo-650 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-[0_8px_20px_rgba(37,99,235,0.2)]"
                  onClick={handleStartDiscussion}
                >
                  <MessageSquare className="h-4 w-4" />
                  Start Discussion
                </motion.button>
                {!isCreator && (
                  <div className="w-full sm:w-auto">
                    {myCollabStatus === 'approved' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                          <Check className="h-4 w-4" />
                          Co-Developer Joined
                        </div>
                        <motion.button
                          variants={buttonVariants} whileHover="hover" whileTap="tap"
                          onClick={handleLeaveIdea}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-medium transition-all duration-200"
                        >
                          Leave Project
                        </motion.button>
                      </div>
                    ) : myCollabStatus === 'pending' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                          <Clock className="h-4 w-4" />
                          Interest Sent — Reviewing
                        </div>
                        <motion.button
                          variants={buttonVariants} whileHover="hover" whileTap="tap"
                          onClick={handleCancelMyRequest}
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/5 hover:bg-red-500/15 border border-red-500/20 text-red-400 text-xs font-medium transition-all duration-200"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        variants={buttonVariants} whileHover="hover" whileTap="tap"
                        className="w-full sm:w-auto justify-center bg-white/5 hover:bg-white/10 border border-white/15 px-6 py-3 rounded-xl text-white text-xs font-semibold transition-all duration-200"
                        onClick={() => setShowJoinModal(true)}
                      >
                        <Plus className="h-4 w-4 mr-1.5 inline" />
                        {myCollabStatus === 'rejected' ? 'Express Interest Again' : 'Interested in Co-Developing'}
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Startup Readiness */}
        <div className="lg:col-span-1">
          <VisionReadinessCard
            ideaId={ideaId}
            initialData={idea}
            isCreator={isCreator}
            onStateChange={(newState) => {
              setIdea(prev => ({ ...prev, visionState: newState }));
            }}
          />
        </div>
      </motion.div>
      {/* Tabs Selector */}
      <div className="w-full mx-auto px-2 md:px-4 mb-8 relative z-10 border-b border-white/[0.06]">
        <div className="flex gap-4">
          <button
            onClick={() => handleMainTabChange("pitch")}
            className={`pb-3.5 px-2 font-semibold text-base transition-all duration-300 relative flex items-center gap-2 ${activeMainTab === "pitch"
              ? "text-blue-400"
              : "text-gray-500 hover:text-gray-300"
              }`}
          >
            Idea Pitch & Details
            {activeMainTab === "pitch" && (
              <motion.div
                layoutId="activeMainTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
              />
            )}
          </button>
          <button
            onClick={() => handleMainTabChange("collab")}
            className={`pb-3.5 px-2 font-semibold text-base transition-all duration-300 relative flex items-center gap-2.5 ${activeMainTab === "collab"
              ? "text-purple-400"
              : "text-gray-500 hover:text-gray-300"
              }`}
          >
            Collaboration Hub
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all duration-300 ${activeMainTab === "collab"
              ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
              : "bg-white/5 text-gray-500 border-white/10"
              }`}>
              {1 + (idea.teamMembers?.length ?? 0)}
            </span>
            {activeMainTab === "collab" && (
              <motion.div
                layoutId="activeMainTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
              />
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Project Details & Creator/Info sidebar */}
      {activeMainTab === "pitch" && (
        <>
          <motion.div
            className="w-full mx-auto px-2 md:px-4 pb-0 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Column - Project Details & missing sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* AdSlot Top Banner */}
              <AdSlot placement="ideation-details" format="banner" className="w-full" />

              {/* Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* THE PROBLEM */}
                <motion.div
                  variants={itemVariants}
                  className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full flex items-center justify-center">
                        <Target className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-pink-400 uppercase block">
                          T H E   P R O B L E M
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">What is actually broken</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                      {idea.problemStatement || idea.problem_statement || "Non-technical founders struggle to find developers who are both skilled and genuinely interested in their domain. Networking events and cold LinkedIn outreach produce low-quality matches and waste months."}
                    </p>
                  </div>
                </motion.div>

                {/* THE SOLUTION */}
                <motion.div
                  variants={itemVariants}
                  className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-emerald-400 uppercase block">
                          T H E   S O L U T I O N
                        </span>
                        <h3 className="text-sm font-bold text-white mt-0.5">What this does about it</h3>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                      {idea.solution || "Matching on tech stack requirements *and* soft-signal alignment — build consistency, sector interest, availability — so introductions start warm instead of cold."}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* WHERE IT STANDS */}
              <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
              >
                <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-cyan-400 uppercase mb-2.5 block">
                  W H E R E   I T   S T A N D S
                </span>
                <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                  {idea.whereItStands || idea.where_it_stands || "Working prototype matching on skills and availability. Next: bring in contribution history so the score reflects what people have actually shipped, not what they claim."}
                </p>
              </motion.div>

              {/* WHO THIS NEEDS */}
              <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-cyan-400 uppercase">
                    W H O   T H I S   N E E D S
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.14em] uppercase text-zinc-400 font-semibold">
                    {(Array.isArray(idea.requiredRoles || idea.required_roles)
                      ? (idea.requiredRoles || idea.required_roles)
                      : ["Fullstack Engineer", "Product Designer", "Growth Marketer"]
                    ).length} OPEN
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-5">
                  Named roles, not "looking for cofounders" — so you can tell in one read whether it's you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {(Array.isArray(idea.requiredRoles || idea.required_roles) && (idea.requiredRoles || idea.required_roles).length > 0
                    ? (idea.requiredRoles || idea.required_roles)
                    : ["Fullstack Engineer", "Product Designer", "Growth Marketer"]
                  ).map((role, idx) => (
                    <div key={idx} className="bg-[#07080c]/60 border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl group-hover:scale-105 transition-transform shrink-0">
                          <Wrench className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">{role}</p>
                          <span className="text-[9px] font-mono tracking-[0.14em] uppercase text-zinc-500 block mt-0.5">OPEN</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setJoinMessage(`Applying for ${role}`);
                          setShowJoinModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs font-semibold transition-all duration-200 shrink-0 ml-2 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* BUILT WITH */}
              <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
              >
                <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-amber-400 uppercase mb-3.5 block">
                  B U I L T   W I T H
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {(Array.isArray(idea.techStack || idea.tech_stack) && (idea.techStack || idea.tech_stack).length > 0
                    ? (idea.techStack || idea.tech_stack)
                    : ["REACT", "NODE.JS", "POSTGRES", "TAILWIND", "WEBSOCKETS"]
                  ).map((tech, idx) => (
                    <span key={idx} className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-[#07080c] text-zinc-300 font-mono text-xs uppercase tracking-wider font-semibold hover:border-purple-500/30 transition-all cursor-default">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Overview / Details if present */}
              {idea.projectDetails && (
                <motion.div
                  variants={itemVariants}
                  className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
                >
                  <span className="text-[10px] font-mono tracking-[0.2em] font-bold text-blue-400 uppercase mb-2.5 block">
                    A B O U T   T H I S   V I S I O N
                  </span>
                  <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm text-gray-300">
                    {idea.projectDetails}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Column - Creator & Info Cards */}
            <div className="lg:col-span-1 h-full flex flex-col gap-6">
              {/* Converted Idea notice — shown when this is a demoted startup */}
              {idea.tags?.includes('Converted Idea') && (
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-300 font-medium mb-1">
                    <span>🚀</span> Launched Startup
                  </div>
                  <p className="text-sm text-purple-200/70">
                    This project was converted back to an Idea so you can attract collaborators before launching.
                  </p>
                </div>
              )}

              {/* Full Vision Workspace — points, milestones, activity, team, interest.
                  This block was duplicated verbatim, rendering two identical
                  buttons to the same route. */}
              <Link
                to={`/vision/${ideaId}`}
                className="cosmos-card cosmos-card-interactive flex items-center justify-between w-full p-4 group"
                style={{ '--cosmos-accent': '#4fd8ff' }}
              >
                <div>
                  <p className="text-star text-sm font-medium">Open Vision Workspace</p>
                  <p className="text-dim text-xs mt-0.5">Points, milestones, activity &amp; team in one view</p>
                </div>
                <TrendingUp className="w-4 h-4 text-cyan group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Converted Vision notice — shown when this is a demoted startup */}
              {idea.tags?.includes('Converted Vision') && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5">
                  <p className="text-violet-300 text-sm font-semibold mb-1 flex items-center gap-2">
                    ⟳ Converted Vision
                  </p>
                  <p className="text-violet-200/70 text-xs leading-relaxed">
                    This project was converted to a Vision so you can attract collaborators before activation.
                  </p>
                </div>
              )}

              {/* Creator Card */}
              <Link to={`/user-profile?userId=${idea.creator?.id || idea.creator?._id || idea.author?.id || idea.author?._id}`} className="block flex-1">
                <motion.div
                  className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-white/[0.08] rounded-3xl p-4 sm:p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5)] group transition-all h-full flex flex-col justify-between"
                  variants={itemVariants}
                  whileHover={{ y: -2, borderColor: "rgba(59,130,246,0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-3xl pointer-events-none transition-all duration-500" />
                  <div>
                    <h2 className="text-xs font-semibold mb-5 relative z-10 flex items-center gap-2 text-zinc-400 uppercase tracking-wider">
                      <div className="w-1 h-3.5 bg-blue-500 rounded-full" />
                      Idea Creator
                    </h2>
                    <div className="text-center space-y-4">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                        className="relative w-20 h-20 mx-auto"
                      >
                        {getProfilePicture(ideaCreator || idea?.creator) && getProfilePicture(ideaCreator || idea?.creator) !== 'default_avatar_url' ? (
                          <img
                            src={getProfilePicture(ideaCreator || idea?.creator)}
                            alt={`${ideaCreator?.firstName || idea?.creator?.firstName || ''} ${ideaCreator?.lastName || idea?.creator?.lastName || ''}`.trim()}
                            className="w-20 h-20 rounded-full border-2 border-blue-500/20 object-cover relative z-10 shadow-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative z-10 shadow-lg text-xl font-bold text-white">
                            {((ideaCreator?.firstName || idea?.creator?.firstName || "U")[0]).toUpperCase()}
                          </div>
                        )}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-white text-base">
                          {ideaCreator?.firstName || idea?.creator?.firstName} {ideaCreator?.lastName || idea?.creator?.lastName}
                        </h3>
                        {ideaCreator?.profile?.company && (
                          <p className="text-xs text-blue-400 font-medium mt-1">
                            💼 {ideaCreator.profile.company}
                          </p>
                        )}
                        {ideaCreator?.profile?.city && (
                          <p className="text-xs text-zinc-400 mt-1">
                            📍 {ideaCreator.profile.city}, {ideaCreator.profile.country}
                          </p>
                        )}
                      </div>
                      {ideaCreator?.profile?.bio && (
                        <p className="text-xs text-zinc-400 leading-relaxed italic line-clamp-2 select-none">
                          "{ideaCreator.profile.bio}"
                        </p>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/[0.06]">
                        <div className="bg-[#07080c]/40 border border-white/[0.03] rounded-xl p-2.5">
                          <p className="text-sm font-bold text-blue-400">{ideaCreator?.active_startups_count ?? 0}</p>
                          <p className="text-[10px] text-zinc-400">Startups</p>
                        </div>
                        <div className="bg-[#07080c]/40 border border-white/[0.03] rounded-xl p-2.5">
                          <p className="text-sm font-bold text-purple-400 flex items-center justify-center gap-1">
                            {ideaCreator?.statistics?.total_likes_received ?? 0}
                          </p>
                          <p className="text-[10px] text-zinc-400">Total Likes</p>
                        </div>
                        <div className="bg-[#07080c]/40 border border-white/[0.03] rounded-xl p-2.5">
                          <p className="text-sm font-bold text-emerald-400">{ideaCreator?.streak_days ?? 0}</p>
                          <p className="text-[10px] text-zinc-400">Streak</p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2 pt-3 border-t border-white/[0.06] text-left">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">Satisfaction</span>
                          <span className="font-semibold text-amber-400">{ideaCreator?.satisfaction_percentage?.toFixed(0) ?? 0}%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400">Revenue Generated</span>
                          <span className="font-semibold text-emerald-400">${ideaCreator?.total_revenue?.toLocaleString() ?? 0}</span>
                        </div>
                        {ideaCreator?.pref_language && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-400">Language</span>
                            <span className="font-semibold text-gray-300">{ideaCreator.pref_language.toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      {/* Member Badge */}
                      {ideaCreator?.roles && ideaCreator.roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center pt-2">
                          {ideaCreator.roles.map((role, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-medium rounded-full border border-blue-500/20 capitalize">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Info Card */}
              <motion.div
                className="relative bg-gradient-to-b from-[#0e1118] to-[#07090d] border border-blue-500/20 rounded-3xl p-6 shadow-[0_16px_32px_rgba(59,130,246,0.05)] group transition-all"
                variants={itemVariants}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-3xl pointer-events-none transition-all duration-500" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                    <TrendingUp className="h-4.5 w-4.5 text-blue-400 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1.5 text-sm">Community Engaged</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
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
                                  className={`rounded-xl p-4 border transition-all ${req.status === 'pending'
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
                                        onClick={() => handleCollabAction(req.id, 'accept')}
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
                                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
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

          {/* AI Matchmaking Recommendations */}
          <motion.div
            variants={itemVariants}
            className="w-full mx-auto px-2 md:px-4 pb-12 mt-6 relative z-10"
          >
            <MatchmakingSection
              recommendations={recommendations}
              loading={matchmakingLoading}
              canRecruit={canRecruitBuilders}
            />
          </motion.div>
        </>
      )}

      {/* Row 3: Discussion & Project Team side-by-side (Redesigned Unified Workspace) */}
      {activeMainTab === "collab" && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full mx-auto px-2 md:px-4 pb-12 relative z-10"
        >


          <div className="bg-[#0b0d13] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.6)] grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">

            {/* Left Column - Discussion Workspace (75%) */}
            <div className="lg:col-span-3 p-3.5 sm:p-6 md:p-8 flex flex-col gap-6">

              {/* Header with Title & Inline Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Workspace Discussion
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        {comments.length + suggestions.length}
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Share ideas, ask questions, or suggest improvements with the team</p>
                  </div>
                </div>

                {/* Inline Tabs */}
                <div className="flex p-0.5 bg-black/30 rounded-lg border border-white/5 w-fit shrink-0">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`px-4 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${activeTab === 'comments'
                      ? 'bg-white/[0.08] text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] border border-white/5'
                      : 'text-gray-400 hover:text-white border border-transparent'
                      }`}
                  >
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-4 py-1.5 rounded-md font-medium text-xs transition-all duration-200 ${activeTab === 'suggestions'
                      ? 'bg-amber-500/10 text-amber-400 shadow-sm border border-amber-500/10'
                      : 'text-gray-400 hover:text-white border border-transparent'
                      }`}
                  >
                    Suggestions ({suggestions.length})
                  </button>
                </div>
              </div>

              {/* Redesigned Comment Composer (Moved above comments) */}
              <form
                onSubmit={(e) => handleCommentSubmit(e, false)}
                className="bg-[#07080c] border border-white/[0.06] focus-within:border-blue-500/30 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.02)] rounded-xl p-3.5 transition-all duration-300 flex flex-col gap-3 group relative"
              >
                <textarea
                  ref={commentInputRef}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    activeTab === 'suggestions'
                      ? "Suggest a feature, tech stack improvement, or workflow polish..."
                      : "Share feedback, ask a question, or discuss details..."
                  }
                  className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-600 outline-none resize-none min-h-[90px] leading-relaxed custom-workspace-scrollbar"
                />

                {/* Composer Toolbar */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] shrink-0">
                  {/* Formatting / Utility actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Add emoji"
                      onClick={() => setComment(prev => prev + "😊")}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                    >
                      <Smile className="h-4.5 w-4.5" />
                    </button>
                    <button
                      type="button"
                      title="Attach file"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                    >
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      title="Mention team member"
                      onClick={() => {
                        setComment(prev => prev + "@");
                        commentInputRef.current?.focus();
                      }}
                      className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                    >
                      <AtSign className="h-4.5 w-4.5" />
                    </button>
                    <span className="h-4 w-[1px] bg-white/10 mx-1.5" />
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 select-none">
                      <Info className="h-3.5 w-3.5 text-gray-500" /> Supports Markdown
                    </span>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 mr-2 hidden sm:inline select-none">
                      Press <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-sans">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-white/5 rounded border border-white/10 font-sans">Enter</kbd>
                    </span>
                    {activeTab === 'suggestions' ? (
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        onClick={(e) => handleCommentSubmit(e, true)}
                        className="bg-gradient-to-r from-amber-500 to-orange-655 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50 shadow-md shadow-orange-950/20"
                      >
                        <Zap className="h-3.5 w-3.5" /> Suggest
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!comment.trim()}
                        className="bg-gradient-to-r from-blue-650 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-200 disabled:opacity-50 shadow-md shadow-blue-950/20"
                      >
                        <Send className="h-3.5 w-3.5" /> Comment
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Scrollable Comments List */}
              <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-1.5 custom-workspace-scrollbar">
                {activeTab === 'comments' ? (
                  comments && comments.length > 0 ? (
                    comments.map((c, idx) => (
                      <div
                        key={c.id || idx}
                        className="group flex gap-3.5 p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-300 animate-in fade-in duration-200"
                      >
                        <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-semibold text-blue-300 shrink-0 shadow-sm">
                          {(c.author?.firstName?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-250 text-xs tracking-tight">
                              {c.author?.firstName} {c.author?.lastName}
                            </span>
                            <span className="text-[10px] text-gray-550">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mt-1.5 text-xs leading-relaxed break-words">
                            {c.content}
                          </p>
                          <div className="flex items-center justify-between mt-2.5">
                            <button
                              onClick={() => handleCommentLike(c.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${c?.userLiked
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <Heart
                                fill={c?.userLiked ? "currentColor" : "none"}
                                className="w-3.5 h-3.5"
                              />
                              {c.likes ?? 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Beautiful Empty State */
                    <div className="text-center py-16 flex flex-col items-center justify-center gap-3 select-none">
                      <div className="relative flex items-center justify-center mb-1">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl w-14 h-14" />
                        <div className="relative p-3.5 bg-[#0b0d13] rounded-full border border-blue-500/20">
                          <MessageSquare className="h-6 w-6 text-blue-400/80" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Start the conversation</h3>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-1">
                          Share thoughts, ask questions, or welcome team members.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  suggestions && suggestions.length > 0 ? (
                    suggestions.map((s, idx) => (
                      <div
                        key={s.id || idx}
                        className="group flex gap-3.5 p-4 rounded-xl bg-amber-500/[0.02] border border-amber-500/10 hover:border-amber-500/20 transition-all duration-300 animate-in fade-in duration-200"
                      >
                        <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center text-xs font-semibold text-amber-300 shrink-0 shadow-sm">
                          <Zap className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-250 text-xs tracking-tight">
                              {s.author?.firstName} {s.author?.lastName}
                            </span>
                            <span className="text-[10px] text-amber-500/60">
                              {new Date(s.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mt-1.5 text-xs leading-relaxed break-words">
                            {s.content}
                          </p>
                          <div className="flex items-center justify-between mt-2.5">
                            <button
                              onClick={() => handleCommentLike(s.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all ${s.userLiked
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                              <Heart
                                fill={s.userLiked ? "red" : "none"}
                                className="w-3.5 h-3.5"
                              />
                              {s.likes ?? 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Beautiful Empty State */
                    <div className="text-center py-16 flex flex-col items-center justify-center gap-3 select-none">
                      <div className="relative flex items-center justify-center mb-1">
                        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl w-14 h-14" />
                        <div className="relative p-3.5 bg-[#0b0d13] rounded-full border border-amber-500/20">
                          <Zap className="h-6 w-6 text-amber-400/80" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Suggest an Improvement</h3>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed mt-1">
                          Got an idea on how to improve this project? Share suggestions directly with the creator.
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right Column - Team Sidebar (25%) */}
            <div className="lg:col-span-1 p-4 sm:p-6 flex flex-col gap-6 bg-[#08090d]/60">

              {/* Sticky / Fixed Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-white">Project Team</h3>
                  <span className="text-[10px] text-gray-505 flex items-center gap-1.5 mt-0.5 select-none">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    {1 + (idea.teamMembers?.length ?? 0)} Members • 3 Online
                  </span>
                </div>
                <button
                  onClick={isCreator ? handleInviteClick : () => setShowJoinModal(true)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg border border-white/10 transition-all duration-200"
                  title="Invite Member"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Lightweight member rows */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-workspace-scrollbar max-h-[300px]">
                {/* Creator (Founder) */}
                <div className="flex items-center gap-3 py-1.5 px-2 hover:bg-white/[0.04] rounded-lg transition-all duration-200 group">
                  <div className="relative shrink-0">
                    {getProfilePicture(ideaCreator || idea?.creator) && getProfilePicture(ideaCreator || idea?.creator) !== 'default_avatar_url' ? (
                      <img
                        src={getProfilePicture(ideaCreator || idea?.creator)}
                        alt="Creator"
                        className="w-8.5 h-8.5 rounded-full border border-blue-500/20 object-cover"
                      />
                    ) : (
                      <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center font-semibold text-blue-400 text-xs">
                        {((ideaCreator?.firstName || idea?.creator?.firstName || "U")[0]).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#090b0f] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {ideaCreator?.firstName || idea?.creator?.firstName} {ideaCreator?.lastName || idea?.creator?.lastName}
                      </p>
                      <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium px-1 rounded shrink-0 select-none">Founder</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">Founder & Lead</p>
                  </div>
                </div>

                {/* Other Members */}
                {idea.teamMembers && idea.teamMembers.length > 0 ? (
                  idea.teamMembers.map((member, idx) => {
                    const isOnline = idx < 2; // Mocking first 2 members as online
                    return (
                      <div key={idx} className="flex items-center gap-3 py-1.5 px-2 hover:bg-white/[0.04] rounded-lg transition-all duration-200 animate-in fade-in duration-150">
                        <div className="relative shrink-0">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name || "Member"}
                              className="w-8.5 h-8.5 rounded-full border border-white/5 object-cover"
                            />
                          ) : (
                            <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-white/5 to-white/10 border border-white/10 flex items-center justify-center font-semibold text-gray-300 text-xs">
                              {((member.name || member.firstName || "M")[0]).toUpperCase()}
                            </div>
                          )}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#090b0f] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-300 truncate">
                            {member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || "Co-Developer"}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{member.role || "Co-Developer"}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 bg-white/[0.01] rounded-xl border border-dashed border-white/5">
                    <p className="text-[10px] text-zinc-400">No co-developers yet.</p>
                  </div>
                )}
              </div>

              {/* Connected Collaboration Info */}
              <div className="pt-4 border-t border-white/[0.06] space-y-3.5 shrink-0 select-none">
                {/* Typing Indicator */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 bg-[#07080c]/50 border border-white/[0.03] py-1.5 px-2.5 rounded-lg w-fit">
                  <div className="flex gap-0.5 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-450 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-450 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-450 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium text-gray-400"><span className="text-gray-350 font-semibold">Sarah Chen</span> is thinking...</span>
                </div>

                {/* Recent Activity Log */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Recent Activity</span>
                  <div className="relative pl-3 border-l border-white/[0.06] space-y-3 text-[10px] text-gray-400">
                    <div className="relative">
                      <span className="absolute -left-[16px] top-1 w-1.5 h-1.5 bg-blue-500 rounded-full border border-[#090b0f]" />
                      <span className="text-gray-300 font-semibold">Alice Smith</span> commented on pitch
                      <span className="block text-[8px] text-gray-600 mt-0.5">2 hours ago</span>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[16px] top-1 w-1.5 h-1.5 bg-amber-500 rounded-full border border-[#090b0f]" />
                      <span className="text-gray-300 font-semibold">Bob Johnson</span> suggested a tech stack change
                      <span className="block text-[8px] text-gray-600 mt-0.5">4 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Developer requests inside the Team Sidebar space (clean layout) */}
              {isCreator && collabRequests.filter(r => r.status === 'pending').length > 0 && (
                <div className="pt-4 border-t border-white/[0.06] shrink-0">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">Pending Requests</h4>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 custom-workspace-scrollbar">
                    {collabRequests.filter(r => r.status === 'pending').map((req) => (
                      <div key={req.id} className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black shrink-0">
                            {req.first_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-white truncate">{req.first_name} {req.last_name}</p>
                            <p className="text-[8px] text-emerald-450 truncate capitalize">{req.role}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleCollabAction(req.id, 'approve')}
                            className="flex-1 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[8px] transition-all duration-150"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleCollabAction(req.id, 'reject')}
                            className="flex-1 py-1 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-[8px] transition-all duration-150"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Launch Startup CTA Widget for Creator */}
              {isCreator && (
                <div className="p-4 bg-gradient-to-br from-purple-950/20 via-pink-950/5 to-transparent border border-purple-500/20 rounded-xl shrink-0 space-y-3 shadow-inner">
                  <div>
                    <h4 className="text-xs font-bold text-purple-300">Ready to Launch?</h4>
                    <p className="text-[10px] text-gray-550 mt-1 leading-normal">Turn this idea into reality and launch your startup journey.</p>
                  </div>
                  <Link to={`/register-startup?ideaId=${ideaId}`} className="block">
                    <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-650 hover:from-purple-500 hover:to-pink-600 shadow-md shadow-purple-950/30 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200">
                      <Zap className="h-3.5 w-3.5" />
                      Launch Startup
                    </button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

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
          title="Delete Idea"
          message="Are you sure you want to delete this idea? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default VisionDetails;