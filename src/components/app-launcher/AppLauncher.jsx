import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Grid } from 'lucide-react';
import { getLauncherApps } from '@/utils/appLauncherUtils';
import { Link } from 'react-router-dom';

const AppLauncher = ({ links }) => {
  const apps = getLauncherApps(links);

  if (apps.length === 0) return null;

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
          {apps.map((app) => (
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
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AppLauncher;