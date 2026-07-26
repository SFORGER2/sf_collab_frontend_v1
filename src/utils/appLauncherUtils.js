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
  'Wallet & Store': { accent: '#ffbf5e', blurb: 'Credits, rewards and the store' },
};

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

  return APP_ORDER.filter((label) => byLabel.has(label)).map((label) => ({
    ...byLabel.get(label),
    ...APP_META[label],
  }));
}

/**
 * Removes launcher apps from the sidebar links.
 */
export function filterOutLauncherApps(links = []) {
  return links.filter((link) => !APP_ORDER.includes(link.label));
}
