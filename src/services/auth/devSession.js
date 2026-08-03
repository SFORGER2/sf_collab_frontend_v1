/**
 * DEVELOPMENT-ONLY AUTH BYPASS
 * ============================
 *
 * Lets the UI be opened and reviewed without a running backend. The app proxies
 * /api to 127.0.0.1:5000; with no backend there, login can never succeed, so
 * every protected screen is unreachable.
 *
 * ⚠️  This is a real authentication bypass. Two things keep it out of production:
 *
 *   1. Vite replaces `import.meta.env.DEV` with the literal `false` when
 *      building, so every guard below becomes `if (true) return <empty>` and
 *      esbuild drops the unreachable remainder. The fake credentials are
 *      deliberately declared *inside* those guarded functions rather than at
 *      module scope — at module scope they would be live bindings that survive
 *      tree-shaking and ship inside the bundle even though the flag is false.
 *      `npm run build && grep -c "dev@sfcollab.local" dist/assets/*.js` must
 *      return 0.
 *   2. It can be disabled in dev via VITE_DEV_AUTH_BYPASS=false in .env.local,
 *      without touching code.
 *
 * The fake session is a UI shell only — every API call still fails, so panels
 * render empty. To see real data, run the backend and log in normally.
 *
 * Remove this file and its usages (search for DEV_AUTH_BYPASS) once the backend
 * is routinely available during frontend work.
 */

export const DEV_AUTH_BYPASS = 'false';

/**
 * The fake user. Shaped to satisfy isUserProfileComplete() so the profile
 * completion modal stays shut. Returns null in any production build.
 */
export function getDevUser() {
  return null;
}

export function getDevRoles() {
return [];
}

export function getDevToken() {
  return null;  
}

let announced = false;

/** Loud, once, so nobody mistakes the fake session for a real login. */
export function announceDevBypass() {}
