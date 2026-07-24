import React from "react";
import { useIsMobile } from "../../../utils/hooks/use-mobile";
import DesktopAdminDashboard from "./DesktopAdminDashboard";

const AdminDashboard = (props) => {
  const isMobile = useIsMobile();
  return <DesktopAdminDashboard {...props} />;
};

export default AdminDashboard;
