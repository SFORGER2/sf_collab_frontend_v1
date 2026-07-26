import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LayoutGrid, ArrowUpRight } from "lucide-react";
import { getLauncherApps } from "@/utils/appLauncherUtils";
import { Link } from "react-router-dom";
import { Eyebrow } from "@/components/cosmos";

/**
 * The App Center.
 *
 * Five apps, always in the same order (SF Drive, ERP, AI Tools, SF Meet,
 * Wallet & Store — see appLauncherUtils). Previously only SF Drive and SF Meet
 * exposed their sub-navigation, via a nested dropdown that opened on top of the
 * grid; every app has sub-items, so now hovering a tile reveals its shortcuts
 * in a shared rail underneath. One popover, no stacking, and the destination
 * you actually want is one click rather than two.
 *
 * Tiles are links, so clicking straight through to the app still works — the
 * rail is a shortcut, not a gate.
 */
const AppLauncher = ({ links }) => {
  const apps = getLauncherApps(links);
  const [activeLabel, setActiveLabel] = useState(null);

  if (apps.length === 0) return null;

  const active = apps.find((a) => a.label === activeLabel) || apps[0];
  const shortcuts = (active?.subItems || []).slice(0, 8);

  return (
    <Popover onOpenChange={(open) => !open && setActiveLabel(null)}>
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
        className="w-[min(94vw,26rem)] p-0 overflow-hidden cosmos-panel-neon border-white/10 rounded-2xl"
      >
        <div className="p-5">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <Eyebrow>App Center</Eyebrow>
            <span className="font-mono text-[9.5px] tracking-[0.14em] uppercase text-dim">
              {apps.length} apps
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {apps.map((app) => (
              <AppTile
                key={app.id}
                app={app}
                isActive={active?.label === app.label}
                onFocus={() => setActiveLabel(app.label)}
              />
            ))}
          </div>
        </div>

        {shortcuts.length > 0 && (
          <div
            className="px-5 py-4 border-t border-white/[0.07] bg-white/[0.02]"
            style={{ "--cosmos-accent": active.accent }}
          >
            <div className="flex items-baseline justify-between gap-3 mb-2.5">
              <Eyebrow>{active.label}</Eyebrow>
              <span className="text-[0.75rem] text-dim truncate">{active.blurb}</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {shortcuts.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="group/link flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 text-[0.8rem] text-dim hover:text-star transition-colors"
                  style={{ "--hover": active.accent }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${active.accent}66`;
                    e.currentTarget.style.background = `${active.accent}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                    e.currentTarget.style.background = "";
                  }}
                >
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon, { size: 13 })
                    : item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

function AppTile({ app, isActive, onFocus }) {
  return (
    <Link
      to={app.href}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 overflow-hidden"
      style={{
        borderColor: isActive ? `${app.accent}55` : "rgba(255,255,255,0.08)",
        background: isActive ? `${app.accent}0f` : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Accent bloom behind the icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-2xl transition-opacity duration-500"
        style={{ background: app.accent, opacity: isActive ? 0.35 : 0 }}
      />

      <span
        className="relative grid place-items-center w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `${app.accent}18`,
          border: `1px solid ${app.accent}33`,
          color: app.accent,
        }}
      >
        {React.isValidElement(app.icon)
          ? React.cloneElement(app.icon, { size: 20 })
          : app.icon}
      </span>

      <span className="relative text-[0.78rem] font-medium text-star text-center leading-tight">
        {app.label}
      </span>

      <ArrowUpRight
        size={11}
        className="absolute top-2 right-2 text-dim opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </Link>
  );
}

export default AppLauncher;
