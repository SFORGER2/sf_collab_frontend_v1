import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown } from "lucide-react";
import { getTopNavLinks } from "../pages/sidebars/sidebar/links";

const Options = ({ isHidden = false, unreadMessagesCount = 0, isAdmin, activeRole }) => {
  const location = useLocation();
  const subLinks = getTopNavLinks(location.pathname, unreadMessagesCount, activeRole);

  const showSubItems = Array.isArray(subLinks) && subLinks.length > 0;
  const isMobile = window.matchMedia("(max-width: 1024px)").matches;
  if (!showSubItems && !isAdmin) return null;

  return (
    <div
      className={`transition-all duration-400 will-change-transform ${
        isHidden ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"
        } lg:translate-y-0 lg:opacity-100 bg-white/5 backdrop-blur-3xl px-2 rounded-full`}
    >

      <div className="flex items-center gap-1 overflow-x-auto text-sm py-2">
        {(showSubItems && !isMobile) &&
          subLinks.map((link) => (
            <Link
              key={link.id}
              className={`px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                location.pathname === link.href
                  ? "bg-white text-gray-950 shadow-sm"
                  : "text-white hover:text-gray-900 hover:bg-gray-100"
              } flex items-center gap-1 whitespace-nowrap`}
              to={link.href}
            >
              {link.label}
            </Link>
          ))}
          

        {isAdmin && (
          <Link
            className={`px-4 py-2 rounded-full transition-all duration-200 font-medium ${
              location.pathname === "/admin"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-white hover:text-gray-900 hover:bg-gray-100"
            } flex items-center gap-1 whitespace-nowrap`}
            to="/admin"
          >
            <Crown size={21} /> Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
};

export default Options;
