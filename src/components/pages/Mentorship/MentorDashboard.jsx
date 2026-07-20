import React from "react";
import { useIsMobile } from "../../../utils/hooks/use-mobile";
import DesktopMentorDashboard from "./views/DesktopMentorDashboard";

const MentorDashboard = (props) => {
  const isMobile = useIsMobile();
  return <DesktopMentorDashboard {...props} />;
};

export default MentorDashboard;
