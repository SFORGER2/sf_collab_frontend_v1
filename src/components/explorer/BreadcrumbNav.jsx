import React from "react";
import { ChevronRight, Home } from "lucide-react";

export const BreadcrumbNav = ({ path, onNavigate }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center px-4 py-3 border-b border-slate-800 bg-[#0d0f17]"
    >
      <ol className="flex items-center space-x-2 text-sm text-slate-400">
        <li>
          <button
            onClick={() => onNavigate(path[0])}
            className="hover:text-purple-400 transition-colors flex items-center"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </li>
        {path.slice(1).map((node, index) => {
          const isLast = index === path.length - 2;
          return (
            <li key={node.id} className="flex items-center space-x-2">
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <button
                onClick={() => onNavigate(node)}
                className={`transition-colors ${isLast ? "text-slate-200 font-medium cursor-default" : "hover:text-purple-400"}`}
                aria-current={isLast ? "page" : undefined}
                disabled={isLast}
              >
                {node.name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
