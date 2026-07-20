/**
 * dashboard.jsx — SFCollab
 * Switcher for Mobile/Desktop Dashboard
 */

import React from "react";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import DesktopDashboard from "./views/DesktopDashboard";
import MobileDashboard from "./views/MobileDashboard";
import { useSelector } from "react-redux";
import AssistantFAB from "@/components/common/AssistantFAB";

const DashboardSwitcher = (props) => {
  const isMobile = useIsMobile();
  const { user } = useSelector((state) => state.auth);

  if (isMobile) {
    return (
      <>
        <MobileDashboard {...props} />
        <AssistantFAB workspaceId={user?.active_workspace_id} label="Ask SF Assistant" />
      </>
    );
  }

  return (
    <>
      <DesktopDashboard {...props} />
      <AssistantFAB workspaceId={user?.active_workspace_id} label="Ask SF Assistant" />
    </>
  );
};

export default DashboardSwitcher;
