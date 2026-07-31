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
  Mail,
} from "lucide-react";
import { builderApplicationsAPI } from "@/services/builderAPI";
import { startupsAPI } from "@/utils/APIs/startupsAPI";
import usePaginatedFetch from "@/utils/hooks/usePaginated";
import InfiniteList from "@/components/InfiniteList";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { parseApiError } from "@/utils/APIs/parseApiError";
import ErrorState from "@/components/common/ErrorState";

const MyApplications = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [success, setSuccess] = useState(null);

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
        setSuccess("Application withdrawn successfully");
        setError(null);
        setErrorInfo(null);
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError("Failed to withdraw application");
        setErrorInfo({ type: 'unknown', title: 'Action Failed', message: 'Failed to withdraw application. Please try again.' });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setErrorInfo(parsed);
    }
  };

  const statusUI = {
    pending: {
      label: "Pending",
      class: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      icon: <Clock className="w-4 h-4" />,
    },
    under_review: {
      label: "Under Review",
      class: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      icon: <AlertCircle className="w-4 h-4" />,
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
    <div className="min-h-screen bg-black text-white px-2 md:px-4 lg:pl-6 py-8">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        <div className="absolute top-1/4 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full mx-auto space-y-8 w-full relative z-10">
        
        {/* Header */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                My Applications
              </h1>
              <p className="text-gray-400 text-lg mt-2">
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
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative bg-slate-900/90 backdrop-blur border border-white/10 group-hover:border-white/30 rounded-2xl p-6 space-y-3 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Icon className="w-5 h-5 text-white/60" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search + Filter */}
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
              placeholder="Search by startup or role..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-white/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "under_review", label: "Under Review" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ].map((filter) => (
              <motion.button
                key={filter.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setFilterStatus(filter.value);
                  refetch();
                }}
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

          {(searchQuery || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                refetch();
              }}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
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
          errorInfo ? (
            <ErrorState
              title={errorInfo.title}
              message={errorInfo.message}
              type={errorInfo.type}
              onRetry={() => { setError(null); setErrorInfo(null); }}
            />
          ) : (
            <motion.div
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-300 backdrop-blur"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )
        )}

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {loading && applications.length === 0 ? (
            /* Loading Skeleton Cards */
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-hidden relative"
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-44 rounded-full bg-white/10" />
                      <div className="h-2.5 w-28 rounded-full bg-white/[0.07]" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-white/10" />
                  </div>
                  <div className="mt-4 flex gap-3">
                    <div className="h-2 w-20 rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-16 rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-24 rounded-full bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
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
              <p className="text-gray-300 text-lg font-semibold">No applications found</p>
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
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="group relative overflow-hidden rounded-xl bg-slate-900/50 border border-white/10 hover:border-blue-500/30 transition-all backdrop-blur p-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-blue-500/5 group-hover:to-transparent transition-all duration-300" />
                      
                      <div className="relative flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                        <div className="space-y-3 flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                            {app.startup?.name || "Startup"}
                          </h3>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs w-fit">
                            {app.role || "Role not specified"}
                          </Badge>
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

                        <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
                          <Badge
                            className={`flex items-center gap-2 whitespace-nowrap border ${status.class}`}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>

                          {(app.status === "pending" || app.status === "under_review") && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleWithdraw(app.id)}
                              className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 hover:border-red-500/50 transition-all font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                            >
                              <X className="w-4 h-4" />
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
