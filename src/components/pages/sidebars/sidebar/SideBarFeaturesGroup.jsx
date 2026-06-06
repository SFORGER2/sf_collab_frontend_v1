import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { groupFeatures } from "./groupFeatures";
import { aiFeatures } from "./aiFeatures";

export default function SideBarFeatureGroup({ link, onClick }) {
  // FIX: original used bare `location.pathname` which reads window.location (always "/"),
  // not the React Router location. Must use the hook for correct active-route detection.
  const location = useLocation();

  return (
    <div key={link.id} className="relative" style={{ zIndex: 9999999999 }}>
      <TooltipProvider key={link.id}>
        <Tooltip key={link.id}>
          <TooltipTrigger asChild>
            <button
              // FIX: was calling handleDropdownClick("profile") which was never
              // defined anywhere — replaced with the onClick prop passed in.
              onClick={onClick}
              className="flex items-center gap-2.5 w-11 h-11 transition-all duration-300 group"
              style={{ zIndex: 9999999999 }}
            >
              <div className="flex items-center justify-center w-full px-2 py-2 rounded-lg transition-colors text-gray-400 hover:bg-[#2A2A2A] hover:text-white">
                <div className="flex items-center justify-center">
                  {link.icon}
                </div>
              </div>
            </button>
          </TooltipTrigger>

          <TooltipContent
            side="right"
            style={{ zIndex: 99999 }}
            arrowColor="bg-gray-800 fill-gray-800"
            className="p-4 bg-gray-800 fill-gray-800 border-gray-600 text-white"
          >
            <div
              className="mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-200"
              style={{ zIndex: 9999999999 }}
            >
              <div className="flex flex-col gap-6">
                {Object.entries(groupFeatures(aiFeatures)).map(([type, pages]) => (
                  <div key={type} className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      {type}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {pages.map((page) => (
                        <Link
                          key={page.id}
                          to={page.href}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                            location.pathname === page.href
                              ? "bg-white text-gray-900"
                              : "text-gray-400 hover:bg-black/60 hover:text-white"
                          }`}
                          onClick={onClick}
                          style={{ zIndex: 9999999999 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            {page.icon}
                          </div>
                          <span className="text-xs font-medium text-center mb-1">
                            {page.label}
                          </span>
                          <p className="text-xs text-gray-500 text-center">
                            {page.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}