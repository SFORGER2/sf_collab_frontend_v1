import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BadgeCheck, GraduationCap, MessageSquare, Rocket, Star, Users } from "lucide-react";
import DashboardChangeSection from "../dashboardChangeSection";
import AnnouncementsSection from "../dashboard/AnnouncementsSection";
import Calendar from "@/components/sections/Calendar";
import WorldClock from "@/components/sections/WorldClock";
import { DashboardGrid, DashboardMasthead, ProgressRail, Tag } from "@/components/cosmos";
import { commonWidgets } from "@/components/cosmos/dashboard/commonWidgets";
import { QuickAction, QuickStat } from "../founderDashboard/Quicks";

/**
 * Mentor dashboard.
 *
 * The mentor was one of the landing page's five forces but had no dashboard at
 * all — selecting the role left you on the generic member board. Mentors are
 * measured by outcomes they influence, so the board leads with who needs them
 * and what they've helped move.
 */
export default function MentorDashboard({
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
            sections={(userRoles || []).map((r) => ({
              id: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            }))}
            setUserRoles={setUserRoles}
            setActiveRole={setActiveRole}
            userRoles={userRoles}
            activeRole={activeRole}
            onSectionChange={(r) => {
              setActiveRole(r);
              localStorage.setItem("activeRole", r);
            }}
          />
        ),
      },
      {
        id: "stats",
        title: "At a glance",
        eyebrow: "Your impact",
        span: "full",
        node: (
          <div className="flex flex-wrap gap-3.5">
            <QuickStat label="Active mentees" value={0} icon={Users} to="/mentor-dashboard" />
            <QuickStat label="Open requests" value={0} icon={Star} to="/my-mentorship-requests" />
            <QuickStat label="Sessions held" value={0} icon={MessageSquare} to="/meet" />
            <QuickStat label="Reputation" value={0} icon={BadgeCheck} to="/user-profile" />
          </div>
        ),
      },
      {
        id: "requests",
        title: "Mentorship requests",
        eyebrow: "Needs you",
        span: "half",
        node: (
          <div className="flex flex-col gap-3">
            <p className="text-[0.9rem] text-dim">
              Founders and builders who have asked for your guidance appear here.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Tag tone="live" dot>Awaiting reply</Tag>
              <Tag tone="dev">Scheduled</Tag>
              <Tag tone="future">Completed</Tag>
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        title: "Find projects to guide",
        eyebrow: "Quick actions",
        span: "half",
        node: (
          <div className="grid grid-cols-2 gap-3.5">
            <QuickAction label="Browse startups" href="/discover-startups" icon={Rocket} accent="#3ee6a0" />
            <QuickAction label="Explore Visions" href="/ideation" icon={GraduationCap} accent="#ffbf5e" />
            <QuickAction label="My mentees" href="/mentor-dashboard" icon={Users} accent="#3ee6a0" />
            <QuickAction label="Directory" href="/mentors" icon={BadgeCheck} accent="#4fd8ff" />
          </div>
        ),
      },
      {
        id: "reputation",
        title: "Reputation",
        eyebrow: "Standing",
        span: "half",
        node: (
          <div className="flex flex-col gap-4">
            <ProgressRail label="Profile completeness" value={40} />
            <p className="text-[0.88rem] text-dim">
              Add your areas of expertise so matchmaking can route the right founders to you.
            </p>
          </div>
        ),
      },
      {
        id: "announcements",
        title: "Announcements",
        eyebrow: "From the ecosystem",
        span: "half",
        node: <AnnouncementsSection userRoles={userRoles} />,
      },
      { id: "calendar", title: "Calendar", eyebrow: "Schedule", span: "half", node: <Calendar /> },
      { id: "worldclock", title: "World clock", eyebrow: "Your mentees", span: "half", node: <WorldClock /> },
      ...commonWidgets(),
    ],
    [userRoles, activeRole, setActiveRole, setUserRoles]
  );

  return (
    <div className="w-full px-4 sm:px-6 py-6 max-w-[1400px] mx-auto">
      <DashboardMasthead
        role="mentor"
        name={user?.firstName}
        primaryAction={{ label: "Find projects", to: "/discover-startups" }}
      >
        Turn experience into direction for the next generation of founders.
      </DashboardMasthead>

      <DashboardGrid layoutKey="mentor" role="mentor" widgets={widgets} header={null} />
    </div>
  );
}
