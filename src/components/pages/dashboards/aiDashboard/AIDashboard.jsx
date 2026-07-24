import React from "react";
import { useIsMobile } from "../../../../utils/hooks/use-mobile";
import useGetCredits from "@/utils/hooks/useGetCredits";
import { isAiToolsLocked, getAiToolsLockRemainingDays } from "../../../../utils/config.js";
import DesktopAIDashboard from "./views/DesktopAIDashboard";
import MobileAIDashboard from "./views/MobileAIDashboard";

const AIDashboard = () => {
  const isMobile = useIsMobile();
  const locked = isAiToolsLocked();
  const daysRemaining = getAiToolsLockRemainingDays();
  const credits = useGetCredits();

  if (isMobile) {
    return (
      <MobileAIDashboard 
        locked={locked}
        daysRemaining={daysRemaining}
        credits={credits}
      />
    );
  }

  return <DesktopAIDashboard />;
};

export default AIDashboard;
