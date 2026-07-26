import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LayoutGrid, ArrowUpRight, ShoppingBag, ChevronLeft } from "lucide-react";
import { getLauncherApps } from "@/utils/appLauncherUtils";
import { Link } from "react-router-dom";
import { Eyebrow } from "@/components/cosmos";

/**
 * The App Center.
 *
 * Six apps in a fixed order (SF Drive, ERP, AI Tools, SF Meet, Marketplace,
 * Wallet & Store — see appLauncherUtils), the same for every role.
 *
 * Interaction is click-driven, not hover-driven. An earlier version revealed an
 * app's shortcuts on hover, which meant crossing other tiles to reach the one
 * you wanted and watching the rail flicker through every app on the way. Now
 * you click an app to open its shortcuts, and the grid steps aside so the list
 * has room; "Back to apps" returns. Nothing changes under the cursor by
 * accident.
 *
 * Every tile is also a plain link, so if you just want the app itself, one
 * click on its name still takes you there.
 */

/** Apps synthesised by the launcher have no sidebar icon of their own. */
const ICON_FALLBACK = {
  Marketplace: <ShoppingBag size={22} />,
};

const AppLauncher = ({ links }) => {
  const apps = getLauncherApps(links);
  const [openApp, setOpenApp] = useState(null);

  if (apps.length === 0) return null;

  const active = apps.find((a) => a.label === openApp) || null;

  return (
    <Popover onOpenChange={(open) => !open && setOpenApp(null)}>
      <PopoverTrigger asChild>
        <button
          className="p-2 rounded-xl text-star hover:bg-white/10 hover:text-gold transition-all duration-300"
          aria-label="App Center"
        >
          <LayoutGrid size={22} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(94vw,26rem)] p-5 cosmos-panel-neon border-white/10 rounded-2xl"
      >
        {active ? (
          <AppDetail app={active} onBack={() => setOpenApp(null)} />
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <Eyebrow>App Center</Eyebrow>
              <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
                {apps.length} apps
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {apps.map((app) => (
                <AppTile key={app.id} app={app} onOpen={() => setOpenApp(app.label)} />
              ))}
            </div>

            <p className="text-[0.75rem] text-dim mt-4 text-center">
              Click an app for its shortcuts, or its name to open it.
            </p>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

/** One app's shortcut list, shown in place of the grid. */
function AppDetail({ app, onBack }) {
  const items = app.subItems || [];

  return (
    <div style={{ "--cosmos-accent": app.accent }}>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-dim hover:text-star transition-colors mb-3.5"
      >
        <ChevronLeft size={14} />
        <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase">Back to apps</span>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <span
          className="grid place-items-center w-11 h-11 rounded-xl shrink-0"
          style={{
            background: `${app.accent}18`,
            border: `1px solid ${app.accent}33`,
            color: app.accent,
          }}
        >
          {renderIcon(app, 20)}
        </span>
        <div className="min-w-0">
          <Eyebrow>{app.label}</Eyebrow>
          <p className="text-[0.78rem] text-dim mt-0.5 truncate">{app.blurb}</p>
        </div>
      </div>

      <Link
        to={app.href}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl mb-2 transition-colors"
        style={{ background: `${app.accent}14`, border: `1px solid ${app.accent}44` }}
      >
        <span className="text-[0.88rem] font-medium" style={{ color: app.accent }}>
          Open {app.label}
        </span>
        <ArrowUpRight size={14} style={{ color: app.accent }} />
      </Link>

      <div className="flex flex-col gap-0.5 max-h-[15rem] overflow-y-auto -mr-1 pr-1">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[0.85rem] text-dim hover:text-star hover:bg-white/[0.05] transition-colors"
          >
            <span className="shrink-0 opacity-70">
              {React.isValidElement(item.icon) ? (
                React.cloneElement(item.icon, { size: 14 })
              ) : (
                <span className="block w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function AppTile({ app, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] transition-all duration-300 overflow-hidden hover:border-white/20"
    >
      {/* Accent bloom behind the icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: app.accent }}
      />

      <span
        className="relative grid place-items-center w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `${app.accent}18`,
          border: `1px solid ${app.accent}33`,
          color: app.accent,
        }}
      >
        {renderIcon(app, 20)}
      </span>

      {/* The label opens the app directly — the tile body opens its shortcuts. */}
      <Link
        to={app.href}
        onClick={(e) => e.stopPropagation()}
        className="relative text-[0.78rem] font-medium text-star text-center leading-tight hover:text-gold transition-colors"
      >
        {app.label}
      </Link>
    </button>
  );
}

function renderIcon(app, size) {
  const icon = app.icon || ICON_FALLBACK[app.label];
  return React.isValidElement(icon) ? React.cloneElement(icon, { size }) : icon;
}

export default AppLauncher;
