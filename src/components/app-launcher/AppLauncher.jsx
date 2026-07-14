import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Grid } from "lucide-react";
import { getLauncherApps } from "@/utils/appLauncherUtils";
import { Link } from "react-router-dom";

const AppLauncher = ({ links }) => {
  const apps = getLauncherApps(links);

  if (apps.length === 0) return null;

  const DROPDOWN_APPS = ["SF Drive", "SF Meet"];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-xl hover:bg-white/10 transition-all duration-300 text-white"
          aria-label="Application Launcher"
        >
          <Grid size={22} className="text-white" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-5 bg-[#1a1a1a] border border-[#303030] rounded-2xl shadow-2xl"
      >
        <div className="grid grid-cols-3 gap-x-8 gap-y-8">
          {apps.map((app) => {
            const hasDropdown =
              DROPDOWN_APPS.includes(app.label) &&
              app.subItems &&
              app.subItems.length > 0;

            if (hasDropdown) {
              return (
                <DropdownMenu key={app.id}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center group w-full">
                      <div
                        className="
                          w-14
                          h-14
                          rounded-xl
                          border
                          border-[#404040]
                          bg-[#252525]
                          flex
                          items-center
                          justify-center
                          transition-all
                          duration-300
                          group-hover:border-[#5c5c5c]
                          group-hover:bg-[#2d2d2d]
                        "
                      >
                        {React.isValidElement(app.icon)
                          ? React.cloneElement(app.icon, {
                              className: "w-6 h-6 text-white",
                            })
                          : app.icon}
                      </div>

                      <span className="mt-3 text-sm font-medium text-white text-center">
                        {app.label}
                      </span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="center"
                    sideOffset={6}
                    className="bg-[#1a1a1a] border border-[#303030] rounded-xl min-w-[180px]"
                  >
                    {app.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.id} asChild>
                        <Link
                          to={subItem.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2b2b2b] text-white"
                        >
                          {React.isValidElement(subItem.icon)
                            ? React.cloneElement(subItem.icon, {
                                className: "w-4 h-4 text-white",
                              })
                            : subItem.icon}

                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            return (
              <Link
                key={app.id}
                to={app.href}
                className="flex flex-col items-center group"
              >
                <div
                  className="
                    w-14
                    h-14
                    rounded-xl
                    border
                    border-[#404040]
                    bg-[#252525]
                    flex
                    items-center
                    justify-center
                    transition-all
                    duration-300
                    group-hover:border-[#5c5c5c]
                    group-hover:bg-[#2d2d2d]
                  "
                >
                  {React.isValidElement(app.icon)
                    ? React.cloneElement(app.icon, {
                        className: "w-6 h-6 text-white",
                      })
                    : app.icon}
                </div>

                <span className="mt-3 text-sm font-medium text-white text-center">
                  {app.label}
                </span>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppLauncher;