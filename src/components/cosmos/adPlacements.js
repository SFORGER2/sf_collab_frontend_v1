/**
 * WHERE ADS GO.
 *
 * One file decides ad placement for the whole app, rather than each page
 * deciding for itself. Ads were previously only on the dashboards and at the
 * *bottom* of the draws page — below the fold, after the content, which is the
 * one position nobody looks at.
 *
 * The rule: an ad goes at the top of pages where people actually spend time,
 * and nowhere near anything private or transactional-in-progress.
 *
 * Free plans only — `AdSlot` reads the entitlement itself, so nothing here
 * needs to think about plans.
 */

/**
 * Pages that get a banner at the top of the content column.
 *
 * Matched as prefixes, so '/erp/payouts' covers its sub-routes. Ordered
 * roughly by how long people sit on them.
 */
export const TOP_AD_ROUTES = [
  '/posts',            // the feed — longest dwell in the app
  '/draws',            // draws and the lottery, both high-attention
  '/marketplace',
  '/store',
  '/leaderboard',
  '/wallet',           // covers /wallet/earn
  '/credits',
  '/erp/payouts',
  '/erp/points',
  '/knowledge',
  '/video-tutorials',
  '/ideation',
  '/discover-users',
  '/discover-startups',
  '/my-startups',
  '/saved-startups',
  '/saved-ideas',
  '/connections',
  '/mentors',
  '/ai-news',
  '/community/ai-news',
  '/crowdfunding',
  '/contribution',
];

/**
 * Never advertise here, even if a prefix above would otherwise match.
 *
 * Three reasons, in order of how badly it would go:
 *   1. Private — chat, meetings, drive.
 *   2. Mid-transaction — checkout, donate, plans, the advertise page itself.
 *      An ad next to a payment form reads as a scam and costs trust.
 *   3. Already carries its own ad — the dashboards place theirs inside the
 *      widget grid, so a Layout-level one would double up.
 */
export const NEVER_AD_ROUTES = [
  '/chat',
  '/meet',
  '/sf-drive',
  '/checkout',
  '/donate',
  '/plans',
  '/pricing',
  '/advertise',
  '/login',
  '/signup',
  '/verify-email',
  '/dashboard',
  '/erp-dashboard',
  '/mentor-dashboard',
  '/ai-dashboard',
  '/builder/rewards',
  '/user-profile',      // the profile is someone's own space
  '/register-startup',  // a request under review shouldn't sit next to an ad
  '/vision/new',
];

const matches = (pathname, list) =>
  list.some((r) => pathname === r || pathname.startsWith(`${r}/`));

/** Should this route show the shared top banner? */
export function wantsTopAd(pathname = '') {
  if (matches(pathname, NEVER_AD_ROUTES)) return false;
  return matches(pathname, TOP_AD_ROUTES);
}

/** Stable placement id for reporting, derived from the route. */
export function placementFor(pathname = '') {
  return `top:${pathname.split('/').filter(Boolean).slice(0, 2).join('-') || 'root'}`;
}
