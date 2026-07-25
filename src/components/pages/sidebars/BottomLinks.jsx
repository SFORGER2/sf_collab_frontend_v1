import SidebarFeedbackCard from "@/components/sections/SidebarFeedbackCard";
import { FileText, HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomLinks({
  onLinkClick,
  callback,
  isHovered = false
}) {
  const location = useLocation();
  
  if (!isHovered) {
    // Closed state: Icon-only vertical layout
    return (
      <div className="flex flex-col gap-4 items-center px-2 py-2">
        <div className="flex items-center justify-center w-fit rounded-lg transition-all">
          <SidebarFeedbackCard callback={callback} />
        </div>
        <Link
          to="/contribution"
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all cursor-pointer hover:scale-110 ${
            location.pathname === "/contribution"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
              : "text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
          }`}
          onClick={onLinkClick}
          title="Contribution"
        >
          <FileText size={18} />
        </Link>
        <Link
          to="/help"
          className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all cursor-pointer hover:scale-110 ${
            location.pathname === "/help"
              ? "bg-[#2A2A2A] text-white shadow-lg"
              : "text-gray-400 hover:bg-[#2A2A2A]/50 border border-gray-500/30"
          }`}
          onClick={onLinkClick}
          title="Help"
        >
          <HelpCircle size={18} />
        </Link>
      </div>
    );
  }
  
  // Open state: Full width with labels
  return (
    <div className="flex flex-col gap-2 px-3 py-3 border-t border-gray-700/30">
      <div className="flex items-center justify-center w-full">
        <SidebarFeedbackCard callback={callback} />
      </div>
      
      <div className="flex flex-col gap-2 w-full">
        <Link
          to="/contribution"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer hover:scale-[1.02] ${
            location.pathname === "/contribution"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : "text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50"
          }`}
          onClick={onLinkClick}
        >
          <FileText size={18} />
          <span className="text-sm font-medium">Contribution</span>
        </Link>
        <Link
          to="/help"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer hover:scale-[1.02] ${
            location.pathname === "/help"
              ? "bg-[#2A2A2A] text-white shadow-lg"
              : "text-gray-400 hover:bg-[#2A2A2A]/70 hover:text-white border border-gray-500/30 hover:border-gray-500/50"
          }`}
          onClick={onLinkClick}
        >
          <HelpCircle size={18} />
          <span className="text-sm font-medium">Help & Support</span>
        </Link>
      </div>
    </div>
  );
}