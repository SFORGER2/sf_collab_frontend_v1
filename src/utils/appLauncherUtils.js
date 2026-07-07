export const LAUNCHER_APP_LABELS = ['ERP', 'SF Drive', 'SF Meet', 'AI Tools', 'Wallet & Store'];

/**
 * Returns only the apps that belong in the Application Launcher.
 */
// appLauncherUtils.js
export const getLauncherApps = (user) => {
  // Ensure user.apps exists and is an array
  const apps = user?.apps || [];
  return apps.filter(app => app.enabled); // or any other logic
};

/**
 * Removes launcher apps from the sidebar links.
 */
export function filterOutLauncherApps(links) {
  return links.filter(link => !LAUNCHER_APP_LABELS.includes(link.label));
}