import React from "react";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import DesktopInvestorDashboard from "./views/DesktopInvestorDashboard";
import MobileInvestorDashboard from "./views/MobileInvestorDashboard";

const InvestorDashboard = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileInvestorDashboard {...props} />;
  }

  return <DesktopInvestorDashboard {...props} />;
};

export default InvestorDashboard;
