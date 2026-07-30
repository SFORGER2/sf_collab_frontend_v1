import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { resolve, subscribe, toggle } from '@/services/theme/theme';

/**
 * Dark / light switch for the navbar.
 *
 * Shows the icon of the theme you'd get by clicking, not the one you're in —
 * a sun while you're in light mode reads as "you are here" and people click it
 * expecting nothing to happen.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(resolve);

  useEffect(() => subscribe(setTheme), []);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => toggle()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="p-2 rounded-lg text-slate-300 hover:bg-white/10 hover:text-gold transition-colors"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
