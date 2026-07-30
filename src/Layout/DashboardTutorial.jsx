import { PageTour } from "@/components/cosmos/PageTour";
import { DASHBOARD_TOURS } from "@/components/cosmos/tours";

/**
 * Dashboard walkthrough.
 *
 * Content now lives in components/cosmos/tours.js and rendering in PageTour, so
 * every tour in the app shares one implementation. This file only picks the
 * right script for the active role.
 */
export default function DashboardTutorial({ activeRole = "member" }) {
  const role = DASHBOARD_TOURS[activeRole] ? activeRole : "member";
  return <PageTour tourKey="dashboard" role={role} steps={DASHBOARD_TOURS[role]} />;
}
