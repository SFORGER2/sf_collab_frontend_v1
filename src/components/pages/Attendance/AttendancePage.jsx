import React from "react";
import { useIsMobile } from "@/utils/hooks/use-mobile";
import {
  MyAttendancePage as DesktopMyAttendance,
  WorkspaceAttendancePage as DesktopWorkspaceAttendance,
} from "@/components/pages/erp/attendance/DesktopAttendance";
import MobileAttendance from "@/components/pages/erp/attendance/MobileAttendance";

/**
 * Personal attendance – switches between mobile and desktop.
 * Both components handle their own data fetching using the correct workspace ID.
 */
export function MyAttendancePage() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileAttendance />;
  }

  return <DesktopMyAttendance />;
}

/**
 * Workspace (admin) attendance – currently desktop only.
 * Extend with mobile later if needed.
 */
export function WorkspaceAttendancePage() {
  return <DesktopWorkspaceAttendance />;
}