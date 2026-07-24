import React from "react";
import DashboardHeader from "@/components/headers/DashboardHeader";
import OverviewWebsite from "@/components/pages/dashboards/dashboard/OverviewWebsite";
import DashboardChangeSection from "@/components/pages/dashboards/dashboardChangeSection";
import AnnouncementsSection from "@/components/pages/dashboards/dashboard/AnnouncementsSection";
import DashboardSummaryCard from "@/components/pages/dashboards/dashboard/DashboardSummarySection";
import ShinyText from "@/components/ui/ShinyText";
import { GrOverview } from "react-icons/gr";
import Loader from "@/components/loader/loader";

const MobileDashboard = ({
  activeRole,
  setActiveRole,
  userRoles,
  setUserRoles,
  query,
  setQuery,
  userData,
  loading,
  sections // Pass rendered sections
}) => {
  return (
    <div id="dashboard-mobile" className="relative min-h-screen text-white w-full overflow-x-hidden pb-20">
      {loading && <Loader />}
      
      {/* Compact Header for Mobile */}
      <DashboardHeader searchQuery={query} onSearchChange={setQuery} />

      <div className="relative w-full p-4 flex flex-col gap-6">
        <OverviewWebsite />
        
        <DashboardChangeSection
          sections={userRoles.map(role => ({
            id: role,
            label: role.charAt(0).toUpperCase() + role.slice(1)
          }))}
          onSectionChange={(sectionId) => {
            setActiveRole(sectionId);
            localStorage.setItem('activeRole', sectionId);
          }}
          setUserRoles={setUserRoles}
          setActiveRole={setActiveRole}
          userRoles={userRoles}
          activeRole={activeRole}
        />

        <AnnouncementsSection userRoles={userRoles} />
        <DashboardSummaryCard userData={userData} />

        <div className="flex items-center gap-3 px-2">
          <GrOverview className="h-6 w-6 text-zinc-400" />
          <h1 className="text-xl font-bold text-white">
            <ShinyText text="Overview" speed={3} />
          </h1>
        </div>

        {/* Stacked Sortable Sections (Simplified for mobile touch) */}
        <div className="flex flex-col gap-4">
          {sections.map(section => (
            <div key={section.id} className="w-full">
              {section.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;
