/**
 * COSMOS — the app's shared design-system primitives.
 *
 * These carry the SFCollab landing page's visual language into the product:
 * void backgrounds, gold/violet/cyan/magenta/emerald accents, Unbounded display
 * type, JetBrains Mono labels, frosted panels, and the spark-ring button.
 *
 *   import { Panel, Eyebrow, Display, CosmosButton, StatTile } from '@/components/cosmos';
 *
 * Colour and type tokens live in src/index.css (@theme); the CSS that utilities
 * can't express lives in src/components/cosmos/cosmos.css.
 *
 * See /design-system in the running app for a live reference of everything here.
 */
export { CosmosButton, default as Button } from './CosmosButton';
export { Reveal } from './Reveal';
export { MomentumFlame } from './MomentumFlame';
export { BurningBox, StreakBadge } from './BurningBox';
export { RoleTabs } from './RoleTabs';
export {
  Panel,
  Card,
  Eyebrow,
  Display,
  Lede,
  Tag,
  StatTile,
  ProgressRail,
  StepPath,
  Wordmark,
} from './primitives';
export { ROLE_ACCENTS, ROLE_ORDER, roleAccent, roleAccentVars } from './roles';

/* Monetisation surfaces — plan/credit gating and ad slots. Presentation only;
   the backend must enforce the same limits. */
export { Gated, AllowanceMeter } from './Gated';
export { AdSlot, useInterleavedAds } from './AdSlot';
export { DraftField } from './DraftField';
export { PageShell } from './PageShell';
export { PageTour, openTour } from './PageTour';
export * as tours from './tours';

/* Editable dashboards — drag to reorder, resize, hide; persisted per role. */
export { DashboardGrid } from './dashboard/DashboardGrid';
export { DashboardMasthead } from './dashboard/DashboardMasthead';
export { default as AINewsWidget } from './dashboard/AINewsWidget';
export { DashboardWidget } from './dashboard/DashboardWidget';
export { useDashboardLayout, SPANS } from './dashboard/useDashboardLayout';
