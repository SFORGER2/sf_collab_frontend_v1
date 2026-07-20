export const LAUNCHER_APP_LABELS = [
  'ERP',
  'SF Drive',
  'SF Meet',
  'AI Tools',
  'Wallet & Store'
];

/**
 * Returns only the apps that belong in the Application Launcher.
 */
export function getLauncherApps(links = []) {
  return links.filter(link =>
    LAUNCHER_APP_LABELS.includes(link.label)
  );
}

/**
 * Removes launcher apps from the sidebar links.
 */
export function filterOutLauncherApps(links = []) {
  return links.filter(link =>
    !LAUNCHER_APP_LABELS.includes(link.label)
  );
}