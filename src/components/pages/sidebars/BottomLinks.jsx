import SidebarFeedbackCard from "@/components/sections/SidebarFeedbackCard";
import { FileText, HelpCircle } from "lucide-react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomLinks({
  onLinkClick,
  callback
}) {
  const location = useLocation();
  return (
    <div className="flex flex-col gap-2 items-center">

      
      <div
        className="flex items-center justify-center w-fit rounded-lg transition-all">
        <SidebarFeedbackCard callback={callback} />
      </div>
      <Link
        to="/contribution"
        className={`flex items-center justify-center w-fit px-3 py-2 rounded-lg transition-all font-semibold cursor-pointer hover:scale-105 ${
          location.pathname === "/contribution"
            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/50"
            : "text-amber-400 hover:bg-amber-500/30 hover:text-amber-300 border border-amber-500/50"
        }`}
        onClick={onLinkClick}
      >
        <FileText size={20} />
      </Link>
      <Link
        to="/help"
        className={`flex items-center justify-center w-fit px-3 py-2 rounded-lg transition-all font-semibold cursor-pointer hover:scale-105 ${
          location.pathname === "/help"
            ? "bg-[#2A2A2A] text-white"
            : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white border border-gray-500/50"
        }`}
        onClick={onLinkClick}
      >
        <HelpCircle size={20} />
      </Link>
    </div>
  )
}