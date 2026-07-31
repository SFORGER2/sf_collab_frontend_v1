import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Eyebrow } from '@/components/cosmos';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * Shared form primitives for Settings.
 *
 * One panel style, one input style, one toggle. Sections carry an accent
 * for their icon and focus ring — designed for high visual rhythm and consistency.
 */

export const FIELD =
  'w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[46px] rounded-xl bg-white/[0.04] border border-white/10 text-base sm:text-[0.91rem] text-star font-sans ' +
  'placeholder:text-dim/45 focus:outline-none focus:border-[var(--field-accent,#ffbf5e)] ' +
  'focus:bg-white/[0.07] focus:ring-2 focus:ring-[var(--field-accent,#ffbf5e)]/25 ' +
  'hover:border-white/20 hover:bg-white/[0.06] transition-all duration-200 ease-out shadow-xs';

const READONLY =
  'w-full px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[46px] rounded-xl bg-white/[0.02] border border-white/[0.06] text-base sm:text-[0.91rem] text-dim/70 ' +
  'cursor-not-allowed select-none font-sans';

/** Section header — icon, title, one line of context. */
export function SectionHead({ icon: Icon, title, description, accent = '#ffbf5e' }) {
  return (
    <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0">
      <span
        className="grid place-items-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 transition-transform duration-200 shadow-md mt-0.5 sm:mt-0"
        style={{
          background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)`,
          border: `1px solid ${accent}40`,
          color: accent,
          boxShadow: `0 0 20px -4px ${accent}30`,
        }}
      >
        <Icon size={19} className="sm:hidden" />
        <Icon size={21} className="hidden sm:block" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-[1.18rem] sm:text-[1.32rem] font-bold text-star leading-tight tracking-tight break-words">{title}</h2>
        {description && <p className="text-[0.8rem] sm:text-[0.84rem] text-dim/85 mt-0.5 leading-relaxed break-words">{description}</p>}
      </div>
    </div>
  );
}

/** A grouped block of related fields. */
export function SettingsCard({ title, hint, accent = '#ffbf5e', children, className = '', bodyClassName = 'gap-4 sm:gap-6' }) {
  return (
    <div
      className={`cosmos-panel p-4 sm:p-6 transition-all duration-300 w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0919]/90 backdrop-blur-xl shadow-[0_12px_35px_rgba(0,0,0,0.45)] hover:border-white/15 ${className}`}
      style={{ '--cosmos-accent': accent, '--field-accent': accent }}
    >
      {title && (
        <div className="mb-4 pb-1 min-w-0 border-b border-white/[0.06]">
          <Eyebrow>{title}</Eyebrow>
          {hint && <p className="text-[0.8rem] sm:text-[0.83rem] text-dim/85 mt-1 leading-relaxed break-words">{hint}</p>}
        </div>
      )}
      <div className={`flex flex-col w-full max-w-full min-w-0 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/** Label + control + optional hint/error, in a consistent vertical rhythm. */
export function Field({ label, hint, error, required, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-2 min-w-0 ${className}`}>
      <span className="flex items-center justify-between gap-2 min-h-[22px] flex-wrap sm:flex-nowrap">
        <span className="cosmos-stat-label text-dim/90 font-semibold tracking-[0.07em] text-[0.8rem] uppercase break-words">{label}</span>
        {required && (
          <span className="text-[0.65rem] tracking-wider uppercase font-mono px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 font-semibold shrink-0">
            required
          </span>
        )}
      </span>
      {children}
      {error ? (
        <span className="block text-[0.78rem] text-red-400/90 font-medium leading-normal break-words">{error}</span>
      ) : hint ? (
        <span className="block text-[0.78rem] text-dim/75 leading-relaxed break-words">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput({ readOnly, className = '', ...props }) {
  return <input {...props} readOnly={readOnly} className={`${readOnly ? READONLY : FIELD} ${className}`} />;
}

export function TextArea({ className = '', ...props }) {
  return <textarea {...props} className={`${FIELD} resize-y min-h-[110px] leading-relaxed ${className}`} />;
}

/**
 * Custom floating popover Select portaled directly to document.body, eliminating
 * overflow clipping, stacking context bugs, and z-index overlap issues.
 */
export function Select({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select…',
  className = '',
  disabled = false,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    return options.map((o) => {
      if (typeof o === 'string') return { value: o, label: o };
      return { value: o.value, label: o.label || o.value };
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find((o) => String(o.value) === String(value));
  }, [normalizedOptions, value]);

  const isSearchable = normalizedOptions.length > 8;

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return normalizedOptions;
    const q = search.toLowerCase();
    return normalizedOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [normalizedOptions, search]);

  const updateMenuPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < 250 && rect.top > 250;
      const triggerWidth = rect.width;
      const maxW = Math.min(triggerWidth, window.innerWidth - 24);
      const clampedLeft = Math.max(12, Math.min(rect.left, window.innerWidth - maxW - 12));

      setMenuStyle({
        position: 'fixed',
        left: `${clampedLeft}px`,
        width: `${triggerWidth}px`,
        minWidth: '200px',
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 9999,
        ...(showAbove
          ? { bottom: `${window.innerHeight - rect.top + 6}px`, maxHeight: `${Math.min(260, rect.top - 16)}px` }
          : { top: `${rect.bottom + 6}px`, maxHeight: `${Math.min(260, spaceBelow - 16)}px` }),
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      updateMenuPosition();
      window.addEventListener('resize', updateMenuPosition);
      window.addEventListener('scroll', updateMenuPosition, true);
      if (isSearchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      return () => {
        window.removeEventListener('resize', updateMenuPosition);
        window.removeEventListener('scroll', updateMenuPosition, true);
      };
    } else {
      setSearch('');
    }
  }, [open, isSearchable, updateMenuPosition]);

  const handleSelect = (val) => {
    setOpen(false);
    if (onChange) {
      onChange({ target: { value: val }, value: val });
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${open ? 'z-50' : 'z-10'} ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-base sm:text-[0.91rem] font-sans font-medium text-star hover:border-white/20 hover:bg-white/[0.06] focus:outline-none focus:border-[var(--field-accent,#ffbf5e)] focus:ring-2 focus:ring-[var(--field-accent,#ffbf5e)]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none min-h-[46px] text-left shadow-sm cursor-pointer"
      >
        <span className={selectedOption ? 'text-star truncate' : 'text-dim/50 truncate font-normal'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-dim/70 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-star' : ''}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="bg-[#12141d]/95 backdrop-blur-xl border border-white/12 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col"
          >
            {isSearchable && (
              <div className="relative mb-1.5 px-1 pt-1 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim/60" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-white/[0.05] border border-white/10 rounded-lg pl-8 pr-7 py-1.5 text-base sm:text-[0.84rem] text-star placeholder:text-dim/50 focus:outline-none focus:border-[var(--field-accent,#ffbf5e)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dim/60 hover:text-star p-1 min-h-[32px] flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            <div className="max-h-[220px] overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {placeholder && !isSearchable && (
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className="w-full flex items-center justify-between px-3 py-2 text-[0.85rem] text-dim/60 hover:text-star hover:bg-white/[0.06] rounded-lg transition-colors text-left cursor-pointer min-h-[38px]"
                >
                  <span>{placeholder}</span>
                </button>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((o) => {
                  const isSelected = String(o.value) === String(value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => handleSelect(o.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-[0.86rem] rounded-lg transition-all duration-150 text-left my-0.5 cursor-pointer min-h-[40px] ${
                        isSelected
                          ? 'bg-amber-500/14 text-amber-400 font-medium'
                          : 'text-dim hover:text-star hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="truncate pr-2">{o.label}</span>
                      {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-[0.82rem] text-dim/60 font-mono">
                  No matching options
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

/** Row with a label, a description and a switch on the right — ALWAYS single horizontal row. */
export function Toggle({ label, description, checked, onChange, accent = '#ffbf5e' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={`${label}: ${checked ? 'on' : 'off'}`}
      onClick={() => onChange?.(!checked)}
      className="flex flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] hover:border-white/[0.15] cursor-pointer transition-all duration-200 select-none min-h-[68px] w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--field-accent,#ffbf5e)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0919]"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...(checked
          ? {
              borderColor: `${accent}50`,
              background: `linear-gradient(135deg, ${accent}15 0%, rgba(255,255,255,0.02) 100%)`,
              boxShadow: `0 0 16px -4px ${accent}25`,
            }
          : {}),
      }}
    >
      <span className="min-w-0 flex-1 pr-1 sm:pr-2">
        <span className="block text-[0.86rem] sm:text-[0.9rem] font-semibold text-star break-words leading-tight">{label}</span>
        {description && <span className="block text-[0.76rem] sm:text-[0.78rem] text-dim/80 mt-0.5 leading-relaxed break-words">{description}</span>}
      </span>

      <span
        className="relative shrink-0 block"
        aria-hidden="true"
        style={{ width: '44px', height: '24px', flex: '0 0 44px' }}
      >
        <span
          className="absolute inset-0 block rounded-full transition-all duration-200 ease-out"
          style={{
            background: checked ? accent : 'rgba(255,255,255,0.14)',
            boxShadow: checked ? `0 0 16px -2px ${accent}88` : 'none',
          }}
        />
        <span
          className="absolute top-[3px] left-[3px] block rounded-full bg-white shadow-md transition-transform duration-200 ease-out"
          style={{ width: '18px', height: '18px', transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </span>
    </button>
  );
}

/** Multi-select as a row of pills — used for roles, focus areas, interests. */
export function PillGroup({ options = [], value = [], onChange, accent = '#ffbf5e' }) {
  const toggle = (v) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-2.5 w-full min-w-0">
      {options.map((o) => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        const on = value.includes(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => toggle(val)}
            className="px-3.5 sm:px-4 py-2.5 min-h-[44px] rounded-xl border text-[0.82rem] sm:text-[0.84rem] font-semibold capitalize whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer text-center max-w-full flex-1 sm:flex-initial min-w-[90px] active:scale-[0.98]"
            style={
              on
                ? {
                    minWidth: '90px',
                    borderColor: `${accent}aa`,
                    background: `linear-gradient(135deg, ${accent}25 0%, ${accent}10 100%)`,
                    color: accent,
                    boxShadow: `0 0 16px -2px ${accent}50`,
                  }
                : { minWidth: '90px', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--color-dim)', background: 'rgba(255,255,255,0.02)' }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Inline warning — for "you must set X" states that block a feature. */
export function Notice({ tone = 'warn', children }) {
  const tones = {
    warn: { color: '#ffbf5e', bg: 'rgba(255,191,94,0.08)', border: 'rgba(255,191,94,0.28)', glow: 'rgba(255,191,94,0.12)' },
    error: { color: '#ff8080', bg: 'rgba(255,128,128,0.08)', border: 'rgba(255,128,128,0.3)', glow: 'rgba(255,128,128,0.12)' },
    info: { color: '#4fd8ff', bg: 'rgba(79,216,255,0.08)', border: 'rgba(79,216,255,0.28)', glow: 'rgba(79,216,255,0.12)' },
  };
  const t = tones[tone] || tones.warn;

  return (
    <div
      className="rounded-xl p-3.5 sm:px-4 sm:py-3 text-[0.82rem] sm:text-[0.84rem] leading-relaxed transition-all duration-200 border shadow-sm break-words min-w-0 font-medium"
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.color,
        boxShadow: `0 0 18px -4px ${t.glow}`,
      }}
    >
      {children}
    </div>
  );
}

/** Two-column grid that collapses on narrow screens. */
export function FieldGrid({ children, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full max-w-full min-w-0 ${className}`}>
      {children}
    </div>
  );
}

