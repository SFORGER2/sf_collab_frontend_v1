import React from "react";
import { useIsMobile } from "../../../utils/hooks/use-mobile";
import DesktopWalletDashboard from "./views/DesktopWalletDashboard";

const WalletDashboard = (props) => {
  const isMobile = useIsMobile();
  
  // For specialized dashboards, we'll use Desktop version but refined via CSS/Tailwind
  // unless we want to build a completely unique mobile view.
  return <DesktopWalletDashboard {...props} />;
};

export default WalletDashboard;
