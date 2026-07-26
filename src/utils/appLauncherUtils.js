/**
 * The App Center — the five first-class apps that live outside the day-to-day
 * navigation, in the order the product presents them:
 *
 *   SF Drive → ERP → AI Tools → SF Meet → Wallet & Store
 *
 * Order is deliberate and fixed here rather than inherited from whatever order
 * a role's sidebar happens to build its links in, so the launcher looks the
 * same for every role. Adding an app means adding it to APP_ORDER.
 */
export const APP_ORDER = [
  'SF Drive',
  'ERP',
  'AI Tools',
  'SF Meet',
  'Marketplace',
  'Wallet & Store',
];

/** Back-compat alias — `filterOutLauncherApps` callers used this name. */
export const LAUNCHER_APP_LABELS = APP_ORDER;

/**
 * Per-app presentation. Kept out of the sidebar definitions because it is
 * launcher-only: the accent drives the tile glow and the sub-item highlight.
 */
export const APP_META = {
  'SF Drive': { accent: '#4fd8ff', blurb: 'Files, decks and shared folders' },
  'ERP': { accent: '#3ee6a0', blurb: 'Tasks, attendance and payouts' },
  'AI Tools': { accent: '#8b6cff', blurb: 'Every assistant in one place' },
  'SF Meet': { accent: '#ff6fd8', blurb: 'Calls, rooms and recordings' },
  'Marketplace': { accent: '#ff8f5e', blurb: 'Cosmetics, apps, assets and services' },
  'Wallet & Store': { accent: '#ffbf5e', blurb: 'Credits, rewards and the store' },
};

/**
 * Marketplace is a first-class app but has no top-level sidebar section — it
 * lives as a sub-item under Wallet & Store. Rather than restructure every
 * role's link list, the launcher carries its own definition and uses it when
 * the role's links don't supply one.
 */
const MARKETPLACE_FALLBACK = {
  id: 'app-marketplace',
  href: '/marketplace',
  label: 'Marketplace',
  subItems: [
    { id: 'mk-all', href: '/marketplace', label: 'Browse all' },
    { id: 'mk-cosmetics', href: '/marketplace?tab=cosmetics', label: 'Cosmetics' },
    { id: 'mk-apps', href: '/marketplace?tab=apps', label: 'Apps' },
    { id: 'mk-assets', href: '/marketplace?tab=assets', label: 'Code & design' },
    { id: 'mk-services', href: '/marketplace?tab=services', label: 'Services' },
    { id: 'mk-sell', href: '/marketplace?tab=sell', label: 'Sell something' },
  ],
};

const FALLBACKS = { Marketplace: MARKETPLACE_FALLBACK };

/**
 * Returns the launcher's apps in canonical order, with presentation metadata
 * attached. Apps a role cannot see are simply absent.
 */
export function getLauncherApps(links = []) {
  const byLabel = new Map();
  for (const link of links) {
    if (APP_ORDER.includes(link.label) && !byLabel.has(link.label)) {
      byLabel.set(link.label, link);
    }
  }

  return APP_ORDER.filter((label) => byLabel.has(label) || FALLBACKS[label]).map((label) => ({
    ...(byLabel.get(label) || FALLBACKS[label]),
    ...APP_META[label],
  }));
}

/**
 * Removes launcher apps from the sidebar links.
 */
export function filterOutLauncherApps(links = []) {
  return links.filter((link) => !APP_ORDER.includes(link.label));
}
