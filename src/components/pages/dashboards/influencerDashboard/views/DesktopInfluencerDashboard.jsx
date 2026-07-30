import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link2, Megaphone, TrendingUp, Users } from "lucide-react";
import DashboardChangeSection from "../../dashboardChangeSection";
import KnowledgeResources from "@/components/pages/dashboards/influencerDashboard/components/KnowledgeResources";
import OverviewWebsite from "../../dashboard/OverviewWebsite";
import AnnouncementsSection from "../../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { ProfilePrompt, AdSlot, DashboardGrid, DashboardMasthead, Tag } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";
import { QuickAction } from "../../founderDashboard/Quicks";

export default function DesktopInfluencerDashboard({
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
            setActiveRole={setActiveRole}
            setUserRoles={setUserRoles}
            userRoles={userRoles}
            activeRole={activeRole}
          />
        ),
      },
      {
        id: "actions",
        title: "Create momentum",
        eyebrow: "Quick actions",
        span: "half",
        node: (
          <div className="grid grid-cols-2 gap-3.5">
            <QuickAction label="Caption generator" href="/caption-generator" icon={Megaphone} accent="#ff4fd8" />
            <QuickAction label="Video generator" href="/video-generator" icon={TrendingUp} accent="#ff4fd8" />
            <QuickAction label="Refer & earn" href="/refer" icon={Link2} accent="#ffbf5e" />
            <QuickAction label="Discover startups" href="/discover-startups" icon={Users} accent="#4fd8ff" />
          </div>
        ),
      },
      {
        id: "campaigns",
        title: "Your campaigns",
        eyebrow: "Reach",
        span: "half",
        node: (
          <div className="flex flex-col gap-3">
            <p className="text-dim text-[0.92rem]">
              Collaborate with founding teams, support launches, and connect your audience with
              new opportunities. Campaign performance appears here as it accumulates.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Tag tone="demo">Campaigns</Tag>
              <Tag tone="dev">Performance</Tag>
              <Tag tone="future">Payouts</Tag>
            </div>
          </div>
        ),
      },
      {
        id: "knowledge",
        title: "Knowledge & resources",
        eyebrow: "Learn",
        span: "full",
        node: <KnowledgeResources />,
      },
      {
        id: "announcements",
        title: "Announcements / Newsletter",
        eyebrow: "From SF",
        span: "full",
        node: <AnnouncementsSection userRoles={userRoles} />,
      },
      { id: "calendar", title: "Calendar", eyebrow: "Schedule", span: "half", node: <Calendar /> },
      { id: "worldclock", title: "World clock", eyebrow: "Your audience", span: "half", node: <WorldClock /> },
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
        role="influencer"
        name={user?.firstName}
        primaryAction={{ label: "New caption", to: "/caption-generator" }}
      >
        Help good ideas get the attention they need.
      </DashboardMasthead>

      <AdSlot placement="dashboard-top" format="banner" className="mb-5" />
      {/* Only shows while the profile is too thin for matchmaking to work. */}
      <ProfilePrompt className="mb-5" />

      <DashboardGrid
        layoutKey="influencer"
        role="influencer"
        widgets={widgets}
        header={null}
      />
    </div>
  );
}
