import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import DesktopToolsDashboard from "./views/DesktopToolsDashboard";
import MobileToolsDashboard from "./views/MobileToolsDashboard";

const ToolsDashboard = () => {
  const isMobile = useIsMobile();
  const { user } = useSelector((state) => state.auth);
  const [requestingTool, setRequestingTool] = useState(false);

  const handleRequestTool = async () => {
    setRequestingTool(true);
    try {
      await fetch("/api/tools/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (error) {
      console.error("Failed to request tool:", error);
    } finally {
      setRequestingTool(false);
    }
  };

  if (isMobile) {
    return (
      <MobileToolsDashboard 
        user={user}
        requestingTool={requestingTool}
        handleRequestTool={handleRequestTool}
      />
    );
  }

  return <DesktopToolsDashboard />;
};

export default ToolsDashboard;
