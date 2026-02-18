import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Search,
  Briefcase,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { builderApplicationsAPI } from "@/services/builderAPI";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import usePaginatedFetch from "@/utils/hooks/usePaginated";
import InfiniteList from "@/components/InfiniteList";
import { motion } from "framer-motion";

const MyApplications = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);

  const {
    items: applications,
    setItems: setApplications,
    loading,
    targetRef,
    refetch
  } = usePaginatedFetch({
    fetchFn: ({ page }) =>
      startupsAPI.getApplications({
        page,
        per_page: 10,
        status: filterStatus !== "all" ? filterStatus : undefined,
        search: searchQuery,
      }),
    search: searchQuery,
    objectKey: "join_requests",
    enabled: !!user && !!access_token,
  });

  const handleWithdraw = async (appId) => {
    try {
      const res = await startupsAPI.deleteJoinRequest(appId);
      if (res.success) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      } else {
        setError("Failed to withdraw application");
      }
    } catch {
      setError("Failed to withdraw application");
    }
  };

  const statusUI = {
    pending: {
      label: "Pending",
      class: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      icon: <Clock className="w-4 h-4" />,
      bgGradient: "from-yellow-900/20 to-slate-900/20",
    },
    under_review: {
      label: "Under Review",
      class: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: <AlertCircle className="w-4 h-4" />,
      bgGradient: "from-blue-900/20 to-slate-900/20",
    },
    approved: {
      label: "Accepted",
      class: "bg-green-500/20 text-green-300 border-green-500/30",
      icon: <CheckCircle className="w-4 h-4" />,
      bgGradient: "from-green-900/20 to-slate-900/20",
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-500/20 text-red-300 border-red-500/30",
      icon: <X className="w-4 h-4" />,
      bgGradient: "from-red-900/20 to-slate-900/20",
    },
  };

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: Briefcase,
      color: "from-blue-500 to-cyan-500"
    },
    {
      label: "Pending",
      value: applications.filter(a => a.status === "pending").length,
      icon: Clock,
      color: "from-yellow-500 to-amber-500"
    },
    {
      label: "Approved",
      value: applications.filter(a => a.status === "approved").length,
      icon: CheckCircle,
      color: "from-green-500 to-emerald-500"
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white px-2 md:px-4 py-8">
      <div className="w-full mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Briefcase className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                Track your startup applications and decisions
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
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className={`bg-gradient-to-br ${stat.color} p-0.5 rounded-xl`}
              >
                <div className="bg-slate-900 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Icon className="w-5 h-5 text-white/60" />
                    <span className="text-xs text-gray-400">Updates</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search + Filter */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 z-10" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by startup or role..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                refetch();
              }}
              className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all" className="bg-slate-900">All Status</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="under_review" className="bg-slate-900">Under Review</option>
              <option value="approved" className="bg-slate-900">Approved</option>
              <option value="rejected" className="bg-slate-900">Rejected</option>
            </select>
          </div>

          {(searchQuery || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                refetch();
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition"
            >
              ✕ Clear Filters
            </button>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div 
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading && applications.length === 0 ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="rounded-full h-12 w-12 border-3 border-blue-500/20 border-t-blue-500"
              />
            </div>
          ) : applications.length === 0 ? (
            <motion.div 
              className="text-center py-16 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 text-lg font-medium">No applications found</p>
              <p className="text-gray-500 text-sm mt-2">Start exploring startups to submit applications</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <InfiniteList
                items={applications}
                loading={loading}
                sentinelRef={targetRef}
                renderItem={(app, index) => {
                  const status = statusUI[app.status] || {};
                  return (
                    <motion.div
                      key={app.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, borderColor: "rgba(59, 130, 246, 0.5)" }}
                      className={`group relative rounded-xl bg-gradient-to-br ${status.bgGradient || 'from-slate-900/40 to-slate-800/40'} border border-white/10 p-6 hover:border-blue-500/30 transition-all`}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-white truncate">
                            {app.startup?.name || "Startup"}
                          </h3>
                          <p className="text-blue-400 text-sm font-medium">
                            {app.role || "Role not specified"}
                          </p>
                          {app.message && (
                            <p className="text-gray-400 text-sm italic">
                              "{app.message}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                            <Calendar className="w-3 h-3" />
                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span
                            className={`px-4 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 whitespace-nowrap ${status.class}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>

                          {(app.status === "pending" || app.status === "under_review") && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleWithdraw(app.id)}
                              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition font-medium text-sm"
                            >
                              Withdraw
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                }}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyApplications;
