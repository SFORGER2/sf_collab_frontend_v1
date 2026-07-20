import React from "react";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import DesktopInfluencerDashboard from "./views/DesktopInfluencerDashboard";
import MobileInfluencerDashboard from "./views/MobileInfluencerDashboard";

const InfluencerDashboard = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileInfluencerDashboard {...props} />;
  }

  return <DesktopInfluencerDashboard {...props} />;
};

export default InfluencerDashboard;
