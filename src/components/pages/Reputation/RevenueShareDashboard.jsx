import React from "react";
import { useIsMobile } from "../../../utils/hooks/use-mobile";
import DesktopRevenueShareDashboard from "./views/DesktopRevenueShareDashboard";

const RevenueShareDashboard = (props) => {
  const isMobile = useIsMobile();
  return <DesktopRevenueShareDashboard {...props} />;
};

export default RevenueShareDashboard;
