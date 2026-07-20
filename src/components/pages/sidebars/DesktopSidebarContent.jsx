import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BottomLinks from "./BottomLinks";
import { Crown, Lock, ChevronDown } from "lucide-react";
import { getAllRoutes } from "./sidebar/links";
import { useState } from "react";

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
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigation = (link) => {
    if (link.isUpcoming) return;
    if (link.href) navigate(link.href);
    onLinkClick?.();
  };

  const upcomingClasses = "opacity-50 cursor-not-allowed hover:bg-transparent";

  return (
    <div
      className="sidebar hidden lg:flex fixed left-0 top-16 h-[calc(100vh-64px)] text-white"
      style={{ zIndex: 9999999999 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #000000 40%, #0d1a36 100%)",
          zIndex: -1,
        }}
      />

      {/* Sidebar container */}
      <motion.div
        className="flex flex-col justify-between h-full overflow-hidden py-2.5"
        animate={{ width: isHovered ? 250 : 60 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <div className="flex flex-col gap-1 overflow-y-auto px-2.5">
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
                  className={`
                    w-full flex items-center
                    ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"}
                    py-3 rounded-lg transition-colors min-w-0
                    ${isActive
                      ? "bg-blue-600/20 text-blue-400"
                      : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"}
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
                        const isSubActive =
                          location.pathname === subItem.href &&
                          location.pathname !== "/dashboard";

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
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors
                              ${isSubActive
                                ? "bg-blue-600/30 text-white"
                                : "text-gray-500 hover:bg-[#2A2A2A] hover:text-white"}
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
              className={`
                w-full flex items-center
                ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"}
                py-3 rounded-lg transition-colors
                ${location.pathname.startsWith("/admin")
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                }
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