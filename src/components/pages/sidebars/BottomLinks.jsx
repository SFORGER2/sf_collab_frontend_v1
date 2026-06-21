import SidebarFeedbackCard from "@/components/sections/SidebarFeedbackCard";
import { FileText, HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomLinks({
  onLinkClick,
  callback,
  isHovered = true
}) {
  const location = useLocation();
  return (
    <div className={`flex flex-col gap-1 px-2.5 pb-2`}>
      <div className="w-full">
        <SidebarFeedbackCard callback={callback} isHovered={isHovered} />
      </div>
      <Link
        to="/contribution"
        className={`w-full flex items-center ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"
          } py-3 rounded-lg transition-colors min-w-0 ${location.pathname === "/contribution"
            ? "bg-amber-500/20 text-amber-500"
            : "text-amber-400 hover:bg-[#2A2A2A] hover:text-amber-300"
          }`}
        onClick={onLinkClick}
      >
        <div className="flex items-center justify-center w-6">
          <FileText size={20} />
        </div>
        {isHovered && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
            Earn Points
          </span>
        )}
      </Link>
      <Link
        to="/help"
        className={`w-full flex items-center ${isHovered ? "gap-3 px-3 justify-start" : "justify-center px-0"
          } py-3 rounded-lg transition-colors min-w-0 ${location.pathname === "/help"
            ? "bg-blue-600/20 text-blue-400"
            : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
          }`}
        onClick={onLinkClick}
      >
        <div className="flex items-center justify-center w-6 text-white">
          <HelpCircle size={20} />
        </div>
        {isHovered && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-gray-400 group-hover:text-white">
            Help & Support
          </span>
        )}
      </Link>
    </div>
  )
}