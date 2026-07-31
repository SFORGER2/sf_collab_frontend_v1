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
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const MyApplications = () => {
  const { user, access_token } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
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
        setTimeout(() => setSuccess(null), 2000);
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
      class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: <Clock className="w-4 h-4" />,
    },
    under_review: {
      label: "Under Review",
      class: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    approved: {
      label: "Accepted",
      class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    rejected: {
      label: "Rejected",
      class: "bg-red-500/10 text-red-400 border-red-500/20",
      icon: <X className="w-4 h-4" />,
    },
  };

  const stats = [
    {
      label: "Total Applications",
      value: applications.length,
      icon: Briefcase,
      chip: "bg-indigo-500/10 text-indigo-400"
    },
    {
      label: "Pending",
      value: applications.filter(a => a.status === "pending").length,
      icon: Clock,
      chip: "bg-amber-500/10 text-amber-400"
    },
    {
      label: "Approved",
      value: applications.filter(a => a.status === "approved").length,
      icon: CheckCircle,
      chip: "bg-emerald-500/10 text-emerald-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-2 py-8 text-zinc-100 md:px-4">
      <div className="relative mx-auto w-full space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
              <Mail className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                My Applications
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Track your startup applications and decisions
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Stats */}
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
                whileHover={{ y: -2 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-colors hover:border-zinc-700"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.chip}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-zinc-50">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup or role..."
              className="border border-zinc-700 bg-zinc-900 pl-9 text-zinc-200 placeholder:text-zinc-500 focus-visible:ring-indigo-500"
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
              <button
                key={filter.value}
                onClick={() => {
                  setFilterStatus(filter.value);
                  refetch();
                }}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  filterStatus === filter.value
                    ? "border border-indigo-500 bg-indigo-600 text-white"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {(searchQuery || filterStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                refetch();
              }}
              className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {loading && applications.length === 0 ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-56 animate-pulse rounded bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <motion.div
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 py-16 text-center"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80">
                  <Briefcase className="h-6 w-6 text-zinc-500" />
                </div>
              </div>
              <p className="font-medium text-zinc-200">No applications found</p>
              <p className="mt-1 text-sm text-zinc-500">Start exploring startups to submit applications</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
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
                      transition={{ delay: index * 0.04 }}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 transition-colors hover:border-zinc-700"
                    >
                      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div className="min-w-0 flex-1 space-y-2.5">
                          <h3 className="truncate text-lg font-semibold text-zinc-100">
                            {app.startup?.name || "Startup"}
                          </h3>
                          <Badge className="w-fit border border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-400 hover:bg-indigo-500/10">
                            {app.role || "Role not specified"}
                          </Badge>
                          {app.message && (
                            <p className="text-sm italic text-zinc-400">
                              "{app.message}"
                            </p>
                          )}
                          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                            <Calendar className="h-3 w-3" />
                            Applied on {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex w-full shrink-0 items-center gap-3 md:w-auto">
                          <Badge
                            className={`flex items-center gap-2 whitespace-nowrap border ${status.class}`}
                          >
                            {status.icon}
                            {status.label}
                          </Badge>

                          {(app.status === "pending" || app.status === "under_review") && (
                            <button
                              onClick={() => handleWithdraw(app.id)}
                              className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/30 bg-transparent px-3.5 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                            >
                              <X className="h-4 w-4" />
                              Withdraw
                            </button>
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
