import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import DesktopBuilderDashboard from "./views/DesktopBuilderDashboard";
import MobileBuilderDashboard from "./views/MobileBuilderDashboard";
import { motion } from "framer-motion";
import { parseApiError } from "@/utils/APIs/parseApiError";
import ErrorState from "@/components/common/ErrorState";

const BuilderDashboard = (props) => {
  const isMobile = useIsMobile();
  const { user } = useSelector((state) => state.auth);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setIsError(false);
    setErrorInfo(null);
    try {
      const res = await dashboardAPI.getBuilderDashboard();
      setStartups(res.data.startups || []);
    } catch (err) {
      console.error("❌ Failed to load builder dashboard", err);
      setIsError(true);
      setErrorInfo(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totals = useMemo(() => {
    return startups.reduce(
      (acc, s) => {
        acc.totalTasks += s.tasks.total;
        acc.completed += s.tasks.completed;
        acc.pending += s.tasks.pending;
        return acc;
      },
      { totalTasks: 0, completed: 0, pending: 0 },
    );
  }, [startups]);

  const completionRate =
    totals.totalTasks > 0
      ? Math.round((totals.completed / totals.totalTasks) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest">
          Building view...
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileBuilderDashboard
        {...props}
        user={user}
        startups={startups}
        totals={totals}
        completionRate={completionRate}
      />
    );
  }

  return <DesktopBuilderDashboard {...props} />;
};

export default BuilderDashboard;
