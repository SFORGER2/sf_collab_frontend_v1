import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomLinks from "./BottomLinks";
import { Crown, Lock, ChevronDown, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getAllRoutes } from "./sidebar/links";
import { useState } from "react";
import { roleAccent, roleAccentVars } from "@/components/cosmos";
import { useUserVision } from "@/hooks/useUserVision";

/**
 * `< 2/4 >` stepper for people who hold more than one role.
 *
 * Sits inline on the Dashboard row. Stops the click from reaching the parent
 * button, which would otherwise navigate or collapse the item underneath you.
 */
function RoleStepper({ roles, current, accent, onPick }) {
  const index = Math.max(0, roles.indexOf(current));
  const step = (delta) => onPick(roles[(index + delta + roles.length) % roles.length]);

  const arrow =
    "p-0.5 rounded text-dim hover:text-star hover:bg-white/10 transition-colors";

  return (
    <span className="ml-auto flex items-center gap-0.5 shrink-0">
      <span
        role="button"
        tabIndex={0}
        aria-label="Previous dashboard"
        className={arrow}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); step(-1); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); step(-1); } }}
      >
        <ChevronLeft size={14} />
      </span>

      <span
        className="font-mono text-[9px] tabular-nums tracking-[0.08em] px-0.5"
        style={{ color: accent }}
        title={`${current} dashboard — ${index + 1} of ${roles.length}`}
      >
        {index + 1}/{roles.length}
      </span>

      <span
        role="button"
        tabIndex={0}
        aria-label="Next dashboard"
        className={arrow}
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); step(1); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); step(1); } }}
      >
        <ChevronRight size={14} />
      </span>
    </span>
  );
}

export default function DesktopSidebarContent({
  links = [],
  currentContextId,
  expandedItems = {},
  toggleExpand,
  hasSubItems,
  shouldShowSubItems,
  isAdmin,
  onLinkClick,
  callback,
  role,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { hasVision, loading: visionLoading } = useUserVision();

  // Workspace section item IDs — these are locked until the user registers a Vision.
  // IDs match what sidebarCommons.jsx and links.jsx assign.
  const WORKSPACE_LINK_IDS = new Set([5, 11, 12, 'erp', 'sf-drive', 'sf-meet']);
  const isWorkspaceLocked = (link) =>
    !visionLoading && !hasVision && WORKSPACE_LINK_IDS.has(link.id);

  // The active role owns the sidebar's accent, so which profile you're working
  // as is readable at a glance — same five colours as the landing page.
  //
  // The active item gets a subtle fill plus an accent bar on its leading edge,
  // but the label stays star-white. Tinting the label the accent colour made
  // the current item read as highlighted copy rather than "you are here".
  const accent = roleAccent(role);
  const activeStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: 'var(--color-star)',
    boxShadow: `inset 2px 0 0 ${accent.color}`,
  };

  const handleNavigation = (link) => {
    if (link.isUpcoming) return;
    if (link.href) navigate(link.href);
    onLinkClick?.();
  };

  const upcomingClasses = "opacity-50 cursor-not-allowed hover:bg-transparent";

  return (
    <div
      className="sidebar hidden lg:flex fixed left-0 top-16 h-[calc(100dvh-64px)] text-white border-r border-white/10"
      style={{ zIndex: 50, ...roleAccentVars(role) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background — solid panel fill with a blur, so nav sits above the atmosphere */}
      <div
        className="absolute inset-0 backdrop-blur-xl"
        style={{ background: "rgba(9, 7, 20, 0.82)", zIndex: -1 }}
      />

      {/* Sidebar container */}
      <motion.div
        className={`flex flex-col justify-between h-full overflow-hidden py-2.5 ${
          isHovered ? 'scrollbar-visible' : 'scrollbar-hide'
        }`}
        animate={{ width: isHovered ? 250 : 60 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className={`flex flex-col gap-1 overflow-y-auto px-2.5 ${
          isHovered ? 'scrollbar-visible' : 'scrollbar-hide'
        }`}>
          {links.map((link) => {
            // Section divider entries (e.g. { isSection: true, sectionLabel: "Grow" })
            // are not real nav items — skip them so they don't create a gap or label.
            if (link.isSection) {
              return null;
            }

            // Task 5: Workspace links are locked until user registers a Vision
            if (isWorkspaceLocked(link)) {
              return (
                <div key={link.id}>
                  <button
                    onClick={() => navigate('/vision/create')}
                    title="Create a Vision to unlock this Workspace feature"
                    className={`
                      w-full flex items-center
                      ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"}
                      py-3 rounded-lg transition-colors min-w-0
                      text-slate-600 hover:text-gold hover:bg-gold/5
                      opacity-60 hover:opacity-90
                    `}
                  >
                    <div className="flex items-center justify-center w-6">
                      <Lock size={20} className="text-slate-600" />
                    </div>
                    {isHovered && (
                      <>
                        <motion.span
                          initial={false}
                          animate={{ opacity: 1 }}
                          className="text-xs font-medium whitespace-nowrap overflow-hidden text-slate-500"
                        >
                          {link.label}
                        </motion.span>
                        <Sparkles size={12} className="ml-auto text-gold/60 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              );
            }

            // FIX: removed duplicate declarations; expandedId → expandedItems[link.id]
            const isActive   = getAllRoutes(link).includes(location.pathname);
            const showSubs   = expandedItems[link.id] ?? false;
            const isUpcoming = link.isUpcoming;

            return (
              <div key={link.id}>
                {/* Main item */}
                <button
                  onClick={() => {
                    if (hasSubItems(link) && !link.href) {
                      if (!isUpcoming) toggleExpand(link.id);
                      return;
                    }
                    handleNavigation(link);
                  }}
                  style={isActive ? activeStyle : undefined}
                  className={`
                    w-full flex items-center
                    ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"}
                    py-3 rounded-lg transition-colors min-w-0
                    ${isActive ? "" : "text-slate-400 hover:bg-white/[0.06] hover:text-star"}
                    ${isUpcoming ? upcomingClasses : ""}
                  `}
                >
                  {/* Icon — always visible */}
                  <div className="flex items-center justify-center w-6">
                    {link.icon}
                  </div>

                  {/* Label + chevron — only when hovered */}
                  {isHovered && (
                    <>
                      <motion.span
                        initial={false}
                        animate={{ opacity: 1 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {link.label}
                      </motion.span>

                      {/* Dashboard with more than one role gets prev/next
                          arrows, so switching is one click from the nav
                          instead of expand → scan → pick. */}
                      {link.roleSwitch?.length > 1 ? (
                        <RoleStepper
                          roles={link.roleSwitch}
                          current={role}
                          accent={accent.color}
                          onPick={(r) => {
                            link.onRoleSwitch?.(r);
                            navigate(link.href || '/dashboard');
                            onLinkClick?.();
                          }}
                        />
                      ) : hasSubItems(link) && (
                        <ChevronDown
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleExpand(link.id);
                          }}
                          size={18}
                          className={`ml-auto transition-transform ${showSubs ? "rotate-180" : ""}`}
                        />
                      )}

                      {!hasSubItems(link) && isUpcoming && (
                        <Lock size={16} className="ml-auto opacity-60" />
                      )}
                    </>
                  )}
                </button>

                {/* Sub Items */}
                {isHovered && showSubs && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-0.5 mt-1 ml-4 pl-3 border-l border-zinc-700/50 overflow-hidden"
                    >
                      {(link.subItems || []).map((subItem) => {
                      const isSubActive = location.pathname === subItem.href;


                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              if (subItem.isUpcoming) return;
                              if (subItem.onLinkClick) {
                                subItem.onLinkClick();
                                return;
                              }
                              navigate(subItem.href);
                              onLinkClick?.();
                            }}
                            style={isSubActive ? activeStyle : undefined}
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors
                              ${isSubActive ? "" : "text-slate-500 hover:bg-white/[0.06] hover:text-star"}
                            `}
                          >
                            {subItem.icon || (
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            )}
                            <span className="text-xs font-medium flex-1 whitespace-nowrap">
                              {subItem.label}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                )}
              </div>
            );
          })}

          {/* Admin */}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onLinkClick}
              style={location.pathname.startsWith("/admin") ? activeStyle : undefined}
              className={`
                w-full flex items-center
                ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"}
                py-3 rounded-lg transition-colors
                ${location.pathname.startsWith("/admin") ? "" : "text-slate-400 hover:bg-white/[0.06] hover:text-star"}
              `}
            >
              <div className="flex items-center justify-center w-6">
                <Crown size={22} />
              </div>
              <motion.span
                animate={{ opacity: isHovered ? 1 : 0, maxWidth: isHovered ? 160 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                Admin Panel
              </motion.span>
            </Link>
          )}
        </div>

        <BottomLinks onLinkClick={onLinkClick} callback={callback} isHovered={isHovered} role={role} />
      </motion.div>
    </div>
  );
}