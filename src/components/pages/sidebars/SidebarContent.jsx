import { Link, useLocation } from "react-router-dom";
// FIX: ChevronRight, Crown, and BottomLinks were used in JSX but never imported,
// causing "X is not defined" ReferenceErrors at runtime.
import { ChevronRight, Crown } from "lucide-react";
import BottomLinks from "./BottomLinks";

export default function SidebarContent({
  onLinkClick,
  isMobile = false,
  links,
  currentContextId,
  isAdmin,
  CHAT_CONTEXT_ID,
  shouldShowSubItems,
}) {
  // FIX: location was read from props in the original but the prop was never
  // passed by any caller. Read it from the hook instead.
  const location = useLocation();

  return (
    <div className="flex flex-col justify-between h-full w-full py-2.5 overflow-y-auto">
      {/* Main navigation */}
      <div className="flex flex-col gap-1 items-center px-1">
        {links.map((link) => {
          const isActive = link.id === currentContextId;

          return (
            <div key={link.id} className="w-full">
              {/* Main nav link */}
              <Link
                to={link.href}
                onClick={onLinkClick}
                className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg transition-colors relative ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-center relative">
                  {link.icon}
                  {link.unreadCount}
                </div>

                {isMobile && (
                  <span className="text-sm font-medium">{link.label}</span>
                )}

                {isMobile &&
                  Array.isArray(link.subItems) &&
                  link.subItems.length > 0 &&
                  link.id !== CHAT_CONTEXT_ID && (
                    <ChevronRight
                      size={16}
                      className={`ml-auto transition-transform ${isActive ? "rotate-90" : ""}`}
                    />
                  )}
              </Link>

              {/* Sub-items */}
              {shouldShowSubItems(link, isActive) && (
                <div
                  className={`flex flex-col gap-1 mt-1 ${isMobile ? "pl-6" : "pl-0"}`}
                >
                  {link.subItems.map((subItem) => {
                    const isSubActive =
                      location.pathname === subItem.href ||
                      (subItem.href === "/ideation" && (location.pathname === "/ideation-details" || location.pathname.startsWith("/vision")));
  const handleSubItemClick = (e) => {
    if (subItem.onLinkClick) {
      subItem.onLinkClick();
    }
    if (onLinkClick) {
      onLinkClick();
    }
  };

                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.href}
                        onClick={onLinkClick}
                        className={`
                          ${isMobile ? "justify-start" : "justify-center"}
                          flex items-center gap-2 px-2 py-2 rounded-md transition-colors
                          ${
                            isSubActive
                              ? "bg-blue-600/30 text-white"
                              : "text-gray-500 hover:bg-[#2A2A2A] hover:text-white"
                          }
                        `}
                        title={subItem.label}
                        aria-label={subItem.label}
                      >
                        {subItem.icon ? (
                          <span className="inline-flex items-center justify-center">
                            {subItem.icon}
                          </span>
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        )}

                        {isMobile && (
                          <span className="text-xs font-medium">{subItem.label}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Admin link */}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onLinkClick}
            className={`w-full flex items-center gap-3 px-2 py-3 rounded-lg transition-colors ${
              location.pathname === "/admin"
                ? "bg-yellow-600/20 text-yellow-400"
                : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            }`}
          >
            <Crown size={22} />
            {isMobile && <span className="text-sm font-medium">Admin Panel</span>}
          </Link>
        )}
      </div>

      <BottomLinks onLinkClick={onLinkClick} />
    </div>
  );
}