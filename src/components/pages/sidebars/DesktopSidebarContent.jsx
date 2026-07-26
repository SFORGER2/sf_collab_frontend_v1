import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomLinks from "./BottomLinks";
import { Crown, Lock, ChevronDown } from "lucide-react";
import { getAllRoutes } from "./sidebar/links";
import { useState } from "react";
import { roleAccent, roleAccentVars } from "@/components/cosmos";

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

  // The active role owns the sidebar's accent, so which profile you're working
  // as is readable at a glance — same five colours as the landing page.
  const accent = roleAccent(role);
  const activeStyle = {
    background: accent.soft,
    color: accent.color,
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

                      {hasSubItems(link) && (
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
                            style={isSubActive ? { background: accent.soft, color: accent.color } : undefined}
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

        <BottomLinks onLinkClick={onLinkClick} callback={callback} isHovered={isHovered} />
      </motion.div>
    </div>
  );
}