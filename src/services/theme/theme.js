/**
 * THEME — dark (default) or light.
 *
 * The switch is one attribute on <html>; every colour in the app follows from
 * the token overrides in index.css. That works precisely because the cosmos
 * recolour was done at token level rather than per component — there is no
 * light variant of any component to maintain, and nothing can drift.
 *
 * Dark is the default and always will be: this is the product's actual
 * identity. Light exists because people work in bright rooms and some of them
 * cannot comfortably read light-on-dark for long.
 */

const KEY = 'sfc.theme';
export const THEMES = ['dark', 'light'];

/** Stored choice, else the OS preference, else dark. */
export function resolve() {
  try {
    const stored = localStorage.getItem(KEY);
    if (THEMES.includes(stored)) return stored;
  } catch {
    /* storage blocked */
  }
  if (typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function apply(theme) {
  const next = THEMES.includes(theme) ? theme : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  // Keeps native controls (scrollbars, form widgets, the URL bar on mobile)
  // in step — without it a light page keeps dark scrollbars.
  document.documentElement.style.colorScheme = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* storage blocked */
  }
  window.dispatchEvent(new CustomEvent('sfc:theme', { detail: next }));
  return next;
}

export function toggle() {
  return apply(resolve() === 'dark' ? 'light' : 'dark');
}

/** Call once at startup, before first paint, to avoid a flash of the wrong theme. */
export function init() {
  return apply(resolve());
}

export function subscribe(fn) {
  const handler = (e) => fn(e.detail || resolve());
  window.addEventListener('sfc:theme', handler);
  return () => window.removeEventListener('sfc:theme', handler);
}
