import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import {
  HiOutlineUsers,
  HiUsers,
  HiOutlineLightBulb,
  HiLightBulb,
} from "react-icons/hi";
import { IoNotificationsOutline, IoNotifications } from "react-icons/io5";
import { BsChatDots, BsChatDotsFill } from "react-icons/bs";

const MobileNavBar = ({ isHidden = false, isAdmin }) => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: AiOutlineHome,
      activeIcon: AiFillHome,
      label: "Home",
      isActive: location.pathname === "/" || location.pathname === "/home",
    },
    {
      path: "/projects",
      icon: HiOutlineUsers,
      activeIcon: HiUsers,
      label: "Contributors",
      isActive: location.pathname === "/projects",
    },
    {
      path: "/knowledge",
      icon: HiOutlineLightBulb,
      activeIcon: HiLightBulb,
      label: "K.Base",
      isActive: location.pathname === "/knowledge",
    },
    {
      path: "/notifications",
      icon: IoNotificationsOutline,
      activeIcon: IoNotifications,
      label: "Notifications",
      isActive: location.pathname === "/notifications",
    },
    {
      path: "/chat",
      icon: BsChatDots,
      activeIcon: BsChatDotsFill,
      label: "Messages",
      isActive: location.pathname === "/messages",
    },
  ];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#262626] p-1 z-50 sm:hidden transition-transform duration-300 will-change-transform ${isHidden ? "translate-y-full" : "translate-y-0"
        } md:translate-y-0 lg:translate-y-0`}
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const IconComponent = item.isActive ? item.activeIcon : item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${item.isActive ? "text-white" : "text-gray-400 hover:text-white"
                }`}
            >
              <IconComponent size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        
      </div>
    </div>
  );
};

export default MobileNavBar;
