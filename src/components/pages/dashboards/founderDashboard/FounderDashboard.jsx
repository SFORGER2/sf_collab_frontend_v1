import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import { dashboardAPI } from "@/utils/APIs/dashboardAPI";
import DesktopFounderDashboard from "./views/DesktopFounderDashboard";
import MobileFounderDashboard from "./views/MobileFounderDashboard";

const FounderDashboard = (props) => {
  const isMobile = useIsMobile();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [startups, setStartups] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getFounderDashboard();
        setStartups(response.data.startups || []);
      } catch (err) {
        console.error("❌ Failed to load founder dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totals = useMemo(() => {
    return startups.reduce(
      (acc, s) => {
        acc.members += s.stats.members;
        acc.tasks += s.stats.tasks;
        acc.pending += s.stats.pendingJoinRequests;
        acc.revenue += s.stats.revenue || 0;
        return acc;
      },
      { members: 0, tasks: 0, pending: 0, revenue: 0 }
    );
  }, [startups]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest">Organizing ecosystem...</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileFounderDashboard 
        {...props}
        user={user}
        startups={startups}
        totals={totals}
      />
    );
  }

  return <DesktopFounderDashboard {...props} />;
};

export default FounderDashboard;
