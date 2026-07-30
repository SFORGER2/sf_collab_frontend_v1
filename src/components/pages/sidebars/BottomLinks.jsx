import SidebarFeedbackCard from "@/components/sections/SidebarFeedbackCard";
import { Coins, FileText, HelpCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/**
 * The pinned foot of the sidebar — deliberately *not* part of the scrolling
 * navigation list.
 *
 * These are ways to put something in or back a project, not places you browse.
 *
 * Contribution is limited to founders and builders — they're the roles that
 * contribute work and earn from it. Crowdfunding is open to everyone, because
 * anyone in the ecosystem can back a startup.
 */
const CONTRIBUTOR_ROLES = ["founder", "builder"];

const ITEMS = [
  {
    id: "contribution",
    to: "/contribution",
    label: "Contribution",
    icon: FileText,
    accent: "#ffbf5e",
    roles: CONTRIBUTOR_ROLES,
  },
  {
    id: "crowdfunding",
    to: "/crowdfunding",
    label: "Crowdfunding",
    icon: Coins,
    accent: "#3ee6a0",
    roles: null, // anyone can back a startup
  },
  {
    id: "help",
    to: "/help",
    label: "Help & Support",
    icon: HelpCircle,
    accent: "#a9a2c2",
    roles: null, // everyone
  },
];

export default function BottomLinks({ onLinkClick, callback, isHovered = false, role = "member" }) {
  const location = useLocation();
  const items = ITEMS.filter((i) => !i.roles || i.roles.includes(role));

  return (
    <div
      className={
        isHovered
          ? "flex flex-col gap-2 px-3 py-3 border-t border-white/10"
          : "flex flex-col gap-3 items-center px-2 py-3 border-t border-white/10"
      }
    >
      <div className="flex items-center justify-center w-full">
        <SidebarFeedbackCard callback={callback} />
      </div>

      {items.map((item) => {
        const Icon = item.icon;
        const active = location.pathname === item.to;

        // Active state uses dark text on the accent fill — the previous
        // `bg-amber-500 text-white` put white on bright gold, which was
        // close to unreadable.
        const style = active
          ? { background: item.accent, color: "#241300", boxShadow: `0 0 18px -6px ${item.accent}` }
          : { color: item.accent, borderColor: `${item.accent}4d` };

        return (
          <Link
            key={item.id}
            to={item.to}
            onClick={onLinkClick}
            title={item.label}
            style={style}
            className={
              isHovered
                ? "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors hover:bg-white/[0.06] w-full"
                : "flex items-center justify-center w-10 h-10 rounded-lg border transition-colors hover:bg-white/[0.06]"
            }
          >
            <Icon size={18} className="shrink-0" />
            {isHovered && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        );
      })}
    </div>
  );
}
