import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Compass, LineChart, Rocket, Users } from "lucide-react";
import DashboardChangeSection from "../../dashboardChangeSection";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { AdSlot, DashboardGrid, DashboardMasthead, Tag } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";
import { QuickAction } from "../../founderDashboard/Quicks";

export default function DesktopInvestorDashboard({
  userRoles,
  activeRole,
  setActiveRole,
  setUserRoles,
}) {
  const { user } = useSelector((state) => state.auth);

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
        id: "actions",
        title: "Find opportunities",
        eyebrow: "Quick actions",
        span: "half",
        node: (
          <div className="grid grid-cols-2 gap-3.5">
            <QuickAction label="Discover startups" href="/discover-startups" icon={Rocket} accent="#8b6cff" />
            <QuickAction label="Explore visions" href="/ideation" icon={Compass} accent="#ffbf5e" />
            <QuickAction label="Find founders" href="/discover-users" icon={Users} accent="#4fd8ff" />
            <QuickAction label="Leaderboard" href="/leaderboard" icon={LineChart} accent="#3ee6a0" />
          </div>
        ),
      },
      {
        id: "pipeline",
        title: "Your pipeline",
        eyebrow: "Deal flow",
        span: "half",
        node: (
          <div className="flex flex-col gap-3">
            <p className="text-dim text-[0.92rem]">
              Follow Visions and Startups to build a watchlist. Progress signals and team activity
              show up here as they happen.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Tag tone="planned">Watchlist</Tag>
              <Tag tone="dev">Signals</Tag>
              <Tag tone="future">Diligence</Tag>
            </div>
          </div>
        ),
      },
      {
        id: "announcements",
        title: "Announcements / Newsletter",
        eyebrow: "From SF",
        span: "full",
        node: <AnnouncementsSection userRoles={userRoles} />,
      },
      { id: "calendar", title: "Calendar", eyebrow: "Schedule", span: "half", node: <Calendar /> },
      { id: "worldclock", title: "World clock", eyebrow: "Your network", span: "half", node: <WorldClock /> },
      {
        id: "platform",
        title: "Platform overview",
        eyebrow: "SFCollab",
        span: "full",
        node: <OverviewWebsite />,
      },
      ...commonWidgets(),
    ],
    [userRoles, activeRole, setActiveRole, setUserRoles]
  );

  return (
    <div className="w-full px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <DashboardMasthead
        role="investor"
        name={user?.firstName}
        primaryAction={{ label: "Discover startups", to: "/discover-startups" }}
      >
        Discover potential before it becomes obvious.
      </DashboardMasthead>

      <AdSlot placement="dashboard-top" format="banner" className="mb-5" />

      <DashboardGrid
        layoutKey="investor"
        role="investor"
        widgets={widgets}
        header={null}
      />
    </div>
  );
}
