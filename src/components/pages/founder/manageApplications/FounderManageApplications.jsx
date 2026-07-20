import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Search,
  Briefcase,
  Calendar,
  Users,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const getAiExplanation = (item) => {
  if (!item) return null;
  const val = 
    item.explanation || 
    item.aiExplanation || 
    item.ai_explanation || 
    item.recommendationReason || 
    item.recommendation_reason || 
    item.fallbackReason || 
    item.fallback_reason || 
    item.reason || 
    (Array.isArray(item.reasons) ? item.reasons.join(', ') : item.reasons);
  
  if (typeof val === 'string' && val.trim() !== '') {
    return val.trim();
  }
  return null;
};

void motion;

const FounderManageApplications = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [expandedStartup, setExpandedStartup] = useState(null);
  const [startups, setStartups] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startupApplications, setStartupApplications] = useState({});

  // Fetch startups and their applications
  useEffect(() => {
    const fetchStartupsAndApplications = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const res = await startupsAPI.getAll({
            my_startups: true
          })
          const startupsList = res.data.startups || [];
          setStartups(startupsList);

          // Fetch applications for each startup
          const applicationsMap = {};
          for (const startup of startupsList) {
            try {
              const appsRes = await startupsAPI.getJoinRequests(startup.id, {
                page: 1,
                per_page: 100,
              });
              applicationsMap[startup.id] = appsRes.data.join_requests || [];
            } catch {
              applicationsMap[startup.id] = [];
            }
          }
          setStartupApplications(applicationsMap);

          if (startupsList.length > 0) {
            setExpandedStartup(startupsList[0].id);
          }
        }
      } catch (err) {
        console.log("❌ Failed to load startups or applications", err); 
        setError("Failed to load startups");
      } finally {
        setLoading(false);
      }
    };

    fetchStartupsAndApplications();
  }, [user]);

  const handleAccept = async (startupId, requestId) => {
    try {
      const res = await startupsAPI.acceptJoinRequest(startupId, requestId);
      if (res.success || res.data) {
        setStartupApplications((prev) => ({
          ...prev,
          [startupId]: prev[startupId].map((a) =>
            a.id === requestId ? { ...a, status: "approved" } : a
          ),
        }));
        setSuccess("Application accepted!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.log("❌ Failed to accept application", err);
      setError("Failed to accept application");
    }
  };

  const handleReject = async (startupId, requestId) => {
    try {
      const res = await startupsAPI.rejectJoinRequest(startupId, requestId);
      if (res.success || res.data) {
        setStartupApplications((prev) => ({
          ...prev,
          [startupId]: prev[startupId].map((a) =>
            a.id === requestId ? { ...a, status: "rejected" } : a
          ),
        }));
        setSuccess("Application rejected");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.log("❌ Failed to reject application", err);
      setError("Failed to reject application");
    }
  };

  const statusUI = {
    pending: {
      label: "Pending",
      class: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      icon: <Clock className="w-4 h-4" />,
    },
    approved: {
      label: "Accepted",
      class: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: <X className="w-4 h-4" />,
    },
  };

  const getFilteredApplications = (apps) => {
    return apps
      .filter((app) =>
        filterStatus === "all" || app.status === filterStatus
      )
      .filter((app) => {
        const fullName = `${app.user?.first_name || ""} ${
          app.user?.last_name || ""
        }`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase());
      });
  };

  const getTotalStats = () => {
    let totalApplications = 0;
    let pendingApplications = 0;
    let acceptedApplications = 0;

    Object.values(startupApplications).forEach((apps) => {
      totalApplications += apps.length;
      pendingApplications += apps.filter((a) => a.status === "pending").length;
      acceptedApplications += apps.filter((a) => a.status === "approved").length;
    });

    return { totalApplications, pendingApplications, acceptedApplications };
  };

  const stats = getTotalStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-black text-white px-2 md:px-4 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full mx-auto space-y-8 relative w-full">
        {/* Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Manage Applications
              </h1>
              <p className="text-gray-400 text-lg mt-2">
                Review and manage join requests for your startups
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.totalApplications}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-yellow-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Awaiting Review
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.pendingApplications}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-green-500/50 rounded-2xl p-6 space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Total Accepted
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.acceptedApplications}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by applicant name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Search
            </button>
          )}

          <div className="flex flex-wrap gap-2">
            {[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Accepted" },
              { value: "rejected", label: "Rejected" },
              { value: "all", label: "All" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterStatus(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterStatus === filter.value
                    ? "bg-blue-600 text-white border border-blue-400 shadow-lg shadow-blue-500/20"
                    : "bg-white/5 border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Messages */}
        {success && (
          <motion.div
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-green-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Startups with Applications */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
              />
            </div>
          ) : startups.length === 0 ? (
            <motion.div
              className="text-center py-20 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl backdrop-blur"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-500/20 rounded-full">
                  <Briefcase className="w-12 h-12 text-blue-400" />
                </div>
              </div>
              <p className="text-gray-300 text-lg font-semibold">
                No startups found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Create a startup to manage applications
              </p>
            </motion.div>
          ) : (
            <Accordion
              type="single"
              value={expandedStartup?.toString()}
              onValueChange={(value) =>
                setExpandedStartup(value ? parseInt(value) : null)
              }
              className="space-y-3"
            >
              {startups.map((startup, startupIndex) => {
                const applications = startupApplications[startup.id] || [];
                const filteredApps = getFilteredApplications(applications);

                return (
                  <motion.div
                    key={startup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: startupIndex * 0.1 }}
                    className="group relative overflow-hidden rounded-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />
                    <div className="relative border border-white/10 group-hover:border-blue-500/30 rounded-xl overflow-hidden bg-slate-900/50 backdrop-blur transition-all">
                      <AccordionItem value={startup.id.toString()} className="border-0">
                        <AccordionTrigger className="px-6 py-4 hover:bg-blue-500/10 transition data-[state=open]:bg-blue-500/10">
                          <div className="flex items-center justify-between gap-4 flex-1 text-left">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                                {startup.name}
                              </h3>
                              <p className="text-sm text-gray-400 mt-1">
                                {applications.length} total application
                                {applications.length !== 1 ? "s" : ""}
                                {filteredApps.length < applications.length &&
                                  ` • ${filteredApps.length} matching filters`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                {filteredApps.length}
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 py-4 border-t border-white/10">
                          {filteredApps.length === 0 ? (
                            <div className="text-center py-8">
                              <p className="text-gray-400">
                                No applications matching filters
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {filteredApps.map((app, appIndex) => {
                                const status = statusUI[app.status] || {};
                                const applicantName = `${
                                  app.user?.firstName || ""
                                } ${app.user?.lastName || ""}`.trim() || "Anonymous";

                                return (
                                  <motion.div
                                    onClick={() => {
                                      navigate(`/user-profile?id=${app.user?.id}`)
                                    }}
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: appIndex * 0.05 }}
                                    whileHover={{
                                      y: -2,
                                      scale: 1.01
                                    }}
                                    className="group/card relative overflow-hidden flex flex-col justify-between gap-3 items-stretch p-4 rounded-lg bg-slate-800/50 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover/card:from-blue-500/5 group-hover/card:via-blue-500/5 group-hover/card:to-transparent transition-all duration-300" />
                                    
                                    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center w-full">
                                      <div className="relative flex items-center gap-3 flex-1 min-w-0 w-full">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                                          {applicantName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-semibold text-white truncate group-hover/card:text-blue-300 transition-colors">
                                            {applicantName}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                              {app.role || "Role not specified"}
                                            </Badge>
                                            {app.createdAt && (
                                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(
                                                  app.createdAt
                                                ).toLocaleDateString()}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="relative flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                                        <Badge
                                          className={`flex items-center gap-2 whitespace-nowrap border ${status.class}`}
                                        >
                                          {status.icon}
                                          {status.label}
                                        </Badge>

                                        {app.status === "pending" && (
                                          <div className="flex gap-2 ml-auto md:ml-0">
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleReject(startup.id, app.id)
                                              }
                                              }
                                              className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                                            >
                                              <X className="w-4 h-4" />
                                              Decline
                                            </motion.button>
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleAccept(startup.id, app.id)
                                              }
                                              }
                                              className="px-3 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 hover:border-green-500/50 transition-all font-medium text-sm flex items-center gap-1 whitespace-nowrap"
                                            >
                                              <CheckCircle className="w-4 h-4" />
                                              Accept
                                            </motion.button>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* AI Explanation Section */}
                                    {getAiExplanation(app) && (
                                      <div className="relative z-10 mt-1 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 flex items-start gap-2 text-xs">
                                        <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                          <span className="font-semibold text-blue-300 mr-1">AI Fit Analysis:</span>
                                          <span className="text-gray-300 leading-relaxed">{getAiExplanation(app)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </div>
                  </motion.div>
                );
              })}
            </Accordion>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FounderManageApplications;