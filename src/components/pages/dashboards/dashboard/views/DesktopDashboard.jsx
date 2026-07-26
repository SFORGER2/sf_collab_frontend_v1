import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";

import WorldClock from "../../../../sections/WorldClock";
import Calendar from "../../../../sections/Calendar";
import DashboardHeader from "../../../../headers/DashboardHeader";
import DashboardSection from "../../../../sections/DashboardSection";
import TaskProgress from "../../../../sections/TaskProgress";
import AINewsSection from "@/components/news/AINewsSection";
import Loader from "@/components/loader/loader";

import DashboardChangeSection from "../../dashboardChangeSection";
import AnnouncementsSection from "../AnnouncementsSection";
import DashboardSummaryCard from "../DashboardSummarySection";
import OverviewWebsite from "../OverviewWebsite";

import { AdSlot, DashboardGrid, DashboardMasthead } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";

const Dashboard = ({ activeRole, setActiveRole, userRoles, setUserRoles }) => {
  const [query, setQuery] = useState("");
  const [userData, setUserData] = useState(null);
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) setUserData(user);
  }, [user]);

  const widgets = useMemo(
    () => [
      {
        id: "roles",
        title: "Your profile",
        eyebrow: "Switch role",
        span: "full",
        locked: true,
        node: (
          <DashboardChangeSection
            sections={userRoles.map((role) => ({
              id: role,
              label: role.charAt(0).toUpperCase() + role.slice(1),
            }))}
            onSectionChange={(sectionId) => {
              setActiveRole(sectionId);
              localStorage.setItem("activeRole", sectionId);
            }}
            setUserRoles={setUserRoles}
            setActiveRole={setActiveRole}
            userRoles={userRoles}
            activeRole={activeRole}
          />
        ),
      },
      {
        id: "summary",
        title: "Your summary",
        eyebrow: "At a glance",
        span: "full",
        node: <DashboardSummaryCard userData={userData} />,
      },
      {
        id: "announcements",
        title: "Announcements / Newsletter",
        eyebrow: "From SF",
        span: "full",
        node: <AnnouncementsSection userRoles={userRoles} />,
      },
      {
        id: "overview",
        title: "Overview",
        eyebrow: "Activity",
        span: "full",
        node: <DashboardSection />,
      },
      {
        id: "progress",
        title: "Task progress",
        eyebrow: "Execution",
        span: "half",
        node: <TaskProgress />,
      },
      {
        id: "calendar",
        title: "Calendar",
        eyebrow: "Schedule",
        span: "half",
        node: <Calendar />,
      },
      {
        id: "worldclock",
        title: "World clock",
        eyebrow: "Your team",
        span: "half",
        node: <WorldClock />,
      },
      {
        id: "platform",
        title: "Platform overview",
        eyebrow: "SFCollab",
        span: "full",
        node: <OverviewWebsite />,
      },
      ...commonWidgets(),
    ],
    [userData, userRoles, activeRole, setActiveRole, setUserRoles]
  );

  return (
    <div id="dashboard" className="relative min-h-screen w-full text-white overflow-x-hidden">
      {loading && <Loader />}

      <DashboardHeader searchQuery={query} onSearchChange={setQuery} />

      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <DashboardMasthead
          role={activeRole || "member"}
          name={user?.firstName}
          primaryAction={{ label: "Explore Visions", to: "/ideation" }}
        >
          Everything you're building, in one place.
        </DashboardMasthead>

      <AdSlot placement="dashboard-top" format="banner" className="mb-5" />

        <DashboardGrid
          layoutKey="member"
          role={activeRole || "member"}
          widgets={widgets}
          header={null}
        />
      </div>
    </div>
  );
};

export default Dashboard;
