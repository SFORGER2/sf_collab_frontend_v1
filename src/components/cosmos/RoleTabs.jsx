import React from 'react';
import { cn } from '../../lib/utils';
import { ROLE_ACCENTS, ROLE_ORDER } from './roles';

/**
 * RoleTabs — the five-colour profile switcher from the landing page. Each tab
 * carries a glowing dot in its role colour and takes that colour when selected.
 *
 * Used for the dashboard role switcher and anywhere a view is filtered by
 * profile. Keyboard support follows the WAI-ARIA tabs pattern: arrow keys move
 * selection, Home/End jump to the ends.
 *
 *   <RoleTabs value={activeRole} onChange={setActiveRole} roles={userRoles} />
 */
export function RoleTabs({
  value,
  onChange,
  roles,
  className,
  label = 'Select a profile',
  ...props
}) {
  const available = (roles?.length ? roles : ROLE_ORDER).filter((r) => ROLE_ACCENTS[r]);

  const handleKeyDown = (e) => {
    const i = available.indexOf(value);
    if (i === -1) return;

    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % available.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (i - 1 + available.length) % available.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = available.length - 1;

    if (next !== null) {
      e.preventDefault();
      onChange?.(available[next]);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('flex flex-wrap gap-2.5', className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {available.map((role) => {
        const accent = ROLE_ACCENTS[role];
        const selected = role === value;

        return (
          <button
            key={role}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange?.(role)}
            style={{
              '--cosmos-accent': accent.color,
              borderColor: selected ? accent.color : undefined,
            }}
            className={cn(
              'flex items-center gap-2.5 rounded-full px-5 py-2.5',
              'font-body text-[14.5px] font-medium tracking-[0.02em]',
              'border transition-[color,border-color,background] duration-200',
              selected
                ? 'text-star bg-white/[0.06]'
                : 'text-dim border-white/10 bg-white/[0.03] hover:text-star hover:border-white/25'
            )}
          >
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full"
              style={{ background: accent.color, boxShadow: `0 0 10px ${accent.color}` }}
            />
            {accent.label}
          </button>
        );
      })}
    </div>
  );
}

export default RoleTabs;
