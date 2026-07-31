import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomLinks from "./BottomLinks";
import { Crown, Lock, ChevronDown } from "lucide-react";
import { getAllRoutes } from "./sidebar/links";

export default function MobileSidebarContent({
  onLinkClick,
  links = [],
  isAdmin,
  expandedItems = {},
  toggleExpand,
  hasSubItems,
  shouldShowSubItems,
  callback,
  role = "member",
}) {
  const location = useLocation();
  const navigate = useNavigate();

  /* -------------------- Animations -------------------- */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  };

  const subItemVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto", transition: { duration: 0.2 } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.15 } },
  };

  /* -------------------- Helpers -------------------- */
  const handleNavigation = (link) => {
    if (link.isUpcoming) return;
    if (link.href) navigate(link.href);
    onLinkClick();
  };

  const baseItemClasses =
    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors";

  const upcomingClasses =
    "opacity-50 cursor-not-allowed hover:bg-transparent";

  /* -------------------- Render -------------------- */
  return (
    <div className="flex flex-col justify-between h-full w-full py-2.5 overflow-y-auto">
      <motion.div
        className="flex flex-col gap-1 px-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {links.map((link) => {
          const isActive = getAllRoutes(link).some(
            (r) => location.pathname === r || location.pathname.startsWith(r + '/') || (r === '/ideation' && (location.pathname === '/ideation-details' || location.pathname.startsWith('/vision')))
          );
          const showSubs = expandedItems[link.id] ?? false;
          const isUpcoming = link.isUpcoming;

          return (
            <motion.div
              id={link.id}
              key={link.id} variants={itemVariants}>
              {/* ---------- Main Item ---------- */}
              <motion.button
                onClick={() => {
                  if (hasSubItems(link) && !link.href) {
                    if (!isUpcoming) toggleExpand(link.id);
                    return;
                  }
                  handleNavigation(link);
                }}
                className={`
                  ${baseItemClasses}
                  ${
                    isActive
                      ? "bg-white/[0.06] text-star border-l-2 border-l-[var(--cosmos-accent)]"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-star"
                  }
                  ${isUpcoming ? upcomingClasses : ""}
                `}
              >
                <div className="relative flex items-center justify-center">
                  {link.icon}
                  {link.unreadCount}
                </div>

                <span className="text-sm font-medium flex-1 text-left">
                  {link.label}
                </span>

                {hasSubItems(link) && (
                  <ChevronDown
                    onClick={
                      (e) => {
                        e.stopPropagation();
                        if (isUpcoming) return;
                        toggleExpand(link.id);
                      }
                    }
                    size={18}
                    className={`transition-transform ${
                      showSubs ? "rotate-180" : ""
                    }`}
                  />
                )}

                {isUpcoming && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock size={14} />
                    <span>Upcoming</span>
                  </div>
                )}
              </motion.button>

              {/* ---------- Sub Items ---------- */}
              <AnimatePresence>
                {showSubs && (
                  <motion.div
                    variants={subItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex flex-col gap-0.5 mt-1 ml-4 pl-3 border-l border-zinc-700/50"
                  >
                    {(link.subItems || []).map((subItem) => {
                      const isSubActive =
                        location.pathname === subItem.href ||
                        (subItem.href === "/ideation" && (location.pathname === "/ideation-details" || location.pathname.startsWith("/vision")));
                      const isSubUpcoming = subItem.isUpcoming;

                      return (
                        <motion.button
                          key={subItem.id}
                          onClick={() => {
                            if (isSubUpcoming) return;
                            if (subItem.onLinkClick) {
                              subItem.onLinkClick();
                              return;
                            }
                            navigate(subItem.href);
                            onLinkClick();
                          }}
                          className={`
                            flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-colors
                            ${
                              isSubActive
                                ? "bg-white/[0.06] text-star border-l-2 border-l-[var(--cosmos-accent)]"
                                : "text-slate-500 hover:bg-white/[0.06] hover:text-star"
                            }
                            ${isSubUpcoming ? upcomingClasses : ""}
                          `}
                        >
                          {subItem.icon || (
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          )}

                          <span className="text-xs font-medium flex-1">
                            {subItem.label}
                          </span>

                          {isSubUpcoming && (
                            <Lock size={12} className="opacity-60" />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* ---------- Admin ---------- */}
        {isAdmin && (
          <motion.div variants={itemVariants}>
            <Link
              to="/admin"
              onClick={onLinkClick}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                location.pathname === "/admin"
                  ? "bg-yellow-600/20 text-yellow-400"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-star"
              }`}
            >
              <Crown size={22} />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          </motion.div>
        )}
      </motion.div>

      <BottomLinks onLinkClick={onLinkClick} callback={callback} isHovered={true} role={role} />
    </div>
  );
}