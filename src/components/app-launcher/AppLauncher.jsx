import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Grid, ChevronDown } from 'lucide-react';
import { getLauncherApps } from '@/utils/appLauncherUtils';
import { Link } from 'react-router-dom';

const AppLauncher = ({ links }) => {
  const apps = getLauncherApps(links);

  if (apps.length === 0) return null;

  // Only these apps will have a dropdown
  const DROPDOWN_APPS = ['SF Drive', 'SF Meet'];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
          aria-label="Application Launcher"
        >
          <Grid size={22} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 bg-[#1a1a1a] border border-[#262626] rounded-xl shadow-2xl"
        align="end"
        sideOffset={8}
      >
        <div className="grid grid-cols-3 gap-4">
          {apps.map((app) => {
            const hasDropdown = DROPDOWN_APPS.includes(app.label);
            const hasSubItems = app.subItems && app.subItems.length > 0;

            // Show dropdown only for SF Drive and SF Meet with subItems
            if (hasDropdown && hasSubItems) {
              return (
                <DropdownMenu key={app.id}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-colors group w-full">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors relative">
                        {app.icon}
                        <ChevronDown size={12} className="absolute -bottom-1 -right-1 text-white/40" />
                      </div>
                      <span className="mt-2 text-xs text-center text-white/70 group-hover:text-white flex items-center gap-1">
                        {app.label}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-[#1a1a1a] border border-[#262626] rounded-xl min-w-[160px] shadow-2xl"
                    align="center"
                    sideOffset={4}
                  >
                    {app.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.id} asChild>
                        <Link
                          to={subItem.href}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <span className="w-4 h-4 flex items-center justify-center text-white/50">
                            {subItem.icon}
                          </span>
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            // Default: simple link (no dropdown)
            return (
              <Link
                key={app.id}
                to={app.href}
                className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  {app.icon}
                </div>
                <span className="mt-2 text-xs text-center text-white/70 group-hover:text-white">
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