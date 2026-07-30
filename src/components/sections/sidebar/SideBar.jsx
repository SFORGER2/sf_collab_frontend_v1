import {
  HelpCircle,
  X,
  Crown,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import 'tippy.js/dist/tippy.css';
import { createLinks, getCurrentContext } from "./links";
import SidebarFeedbackCard from "../SidebarFeedbackCard";

const SideBar = ({ isOpen, setIsOpen, unreadMessagesCount, isAdmin }) => {
  const location = useLocation();
  const [links, setLinks] = useState(createLinks(unreadMessagesCount));
  const currentContextId = getCurrentContext(location.pathname);

  useEffect(() => {
    setLinks(createLinks(unreadMessagesCount));
  }, [unreadMessagesCount]);

  // Close sidebar on mobile
  const handleMobileLinkClick = () => {
    setIsOpen(false);
  };

  const SidebarContent = ({ onLinkClick, isMobile = false }) => (
    <div className="flex flex-col justify-between h-full w-full py-1 overflow-y-auto">
      {/* Main navigation */}
      <div className="flex flex-col gap-1 items-center px-1">
        {links.map((link) => {
          // ── Section divider ──────────────────────────────────────────────
          if (link.isSection) {
            return (
              <div key={link.id} className="w-full">
                {isMobile ? (
                  <div className="h-px w-full bg-zinc-800/60 my-0.5" />
                ) : (
                  <div className="h-px w-8 mx-auto bg-zinc-800 my-0.5" />
                )}
              </div>
            );
          }

          const isActive = link.id === currentContextId;
          const hasSubItems = link.subItems && link.subItems.length > 0;

          return (
            <div key={link.id} className="w-full">
              {/* Main nav link */}
              <Link
                to={link.href}
                onClick={onLinkClick}
                className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg transition-colors relative ${
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
              </Link>

              {/* Dropdown sub-items - show when this context is active */}
              {isActive && hasSubItems && (
                <div className={`flex flex-col gap-1 mt-1 ${isMobile ? 'pl-6' : 'pl-1'}`}>
                  {link.subItems.map((subItem) => (
                    <Link 
                      key={subItem.id}
                      to={subItem.href}
                      onClick={onLinkClick}
                      className={`flex items-center px-2 py-1 rounded-md transition-colors ${
                        location.pathname === subItem.href
                          ? "bg-blue-600 text-white"
                          : "text-gray-500 hover:bg-[#2A2A2A] hover:text-white"
                      } ${isMobile ? 'text-xs' : 'text-[10px] justify-center'}`}
                    >
                      {isMobile ? subItem.label : subItem.label.split(' ').map(w => w[0]).join('')}
                    </Link>
                  ))}
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
            className={`w-full flex items-center gap-3 px-2 py-1 rounded-lg transition-colors ${
              location.pathname === "/admin"
                ? "bg-yellow-600/20 text-yellow-400"
                : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            }`}
          >
            <Crown size={22} />
            {isMobile && (
              <span className="text-sm font-medium">Admin Panel</span>
            )}
          </Link>
        )}
      </div>

      {/* Bottom links */}
      <div className="flex flex-col gap-1 items-center">
        <div className="flex items-center justify-center w-fit px-2 py-2 rounded-lg transition-colors">
          <SidebarFeedbackCard />
        </div>
        <Link
          to="/help"
          className={`flex items-center justify-center w-fit px-2 py-2 rounded-lg transition-colors ${
            location.pathname === "/help"
              ? "bg-[#2A2A2A] text-white"
              : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
          }`}
          onClick={onLinkClick}
        >
          <HelpCircle size={20} />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex fixed left-0 top-0 h-screen w-[60px] pt-16 text-white shadow-xl shadow-amber-300/14"
        style={{ zIndex: 999999 }}
      >
        <div
          className="absolute inset-0 backdrop-blur-xl"
          style={{ background: "rgba(9, 7, 20, 0.82)", zIndex: -1 }}
        />
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden md:hidden fixed inset-0 transition-all duration-300 ease-in-out ${
          isOpen ? "visible" : "invisible"
        }`}
        style={{ zIndex: 9999999998 }}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar Panel */}
        <div
          className={`absolute left-0 top-0 h-screen w-[220px] bg-[#1A1A1A] shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ zIndex: 9999999999 }}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Mobile-only: Workspace Switcher + Chat */}
          <div className="px-3 pb-3 border-b border-zinc-800 mb-2 space-y-2">
            <WorkspaceSwitcher />
            <button
              type="button"
              onClick={() => { handleMobileLinkClick(); window.location.href = '/chat'; }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                         bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 text-sm transition-colors"
            >
              <MessageSquare size={16} />
              Messages
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="px-2">
            <SidebarContent onLinkClick={handleMobileLinkClick} isMobile={true} />
          </div>
        </div>
      </div>

      {/* Content spacer */}
      <div className="hidden lg:block w-[70px]"></div>
    </>
  );
};

export default SideBar;