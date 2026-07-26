# SFCollab frontend — cosmos redesign handoff

Branch: `OSKARUITESTING` (off `FRONTENDFINAL`). **Nothing committed.**

This documents everything added or changed during the redesign sessions, so
frontend and backend can reconnect it. Written for people who were not in the
room.

---

## 1. What this branch does

Reskins the product to the SFCollab landing page's "cosmos" theme, replaces the
landing page with the cinematic design file, makes dashboards editable and
role-specific, and adds the monetisation scaffolding (plans, credits, ads).

**Verified:** `npm run build` passes (exit 0). All screens render in the dev
server.
**Not verified:** anything requiring live data. There was no backend on
`127.0.0.1:5000` during this work, so every screen was reviewed with empty
state. See §9.

---

## 2. Design system

### Tokens — `src/index.css`

Colour, type, radius and motion tokens live in `@theme` blocks.

| Token | Value | Meaning |
|---|---|---|
| `--color-void` | `#050309` | page background |
| `--color-panel` | `#0d0a1a` | panel fill |
| `--color-star` | `#f2effa` | primary text |
| `--color-dim` | `#a9a2c2` | muted text (lifted from the landing page's `#9a94b4` for WCAG AA) |
| `--color-gold` | `#ffbf5e` | the spark — primary CTA, founder |
| `--color-violet` | `#8b6cff` | intelligence layer — AI, investor |
| `--color-cyan` | `#4fd8ff` | structure, product UI, builder |
| `--color-magenta` | `#ff4fd8` | momentum, promotion, influencer |
| `--color-mint` | `#3ee6a0` | live status, validation, mentor |

**Colour carries meaning.** Violet always means AI. Gold always means the
primary action. Don't use them decoratively.

### Global recolour

The app had ~18,000 Tailwind colour-utility usages across 781 files. Rather than
rewriting them, the `GLOBAL RECOLOUR` block in `src/index.css` redefines what
each Tailwind family *resolves to*:

```
blue/sky   → cyan      purple/indigo/violet → violet
amber/yellow/orange → gold     pink/fuchsia → magenta
green/emerald → emerald    slate/gray/zinc/neutral/stone → void neutrals
cyan/teal  → cosmos cyan     red/rose → untouched (destructive must stay red)
```

**Deleting that one block reverts the entire app to stock Tailwind colours.**
Do not "fix" colours by editing utility classes in components — change the token.

### Typography

| Role | Font | Notes |
|---|---|---|
| Display | **Space Grotesk** 600 | headings, `--font-display` |
| Body | **Inter** 400 / 15px | self-hosted, `--font-body` |
| Labels | **JetBrains Mono** | eyebrows, metrics, tags, `--font-mono` |
| Marketing | Unbounded | `--font-marketing`, landing page only |

Originally the app used Unbounded/Outfit to match the landing page. At UI sizes
Unbounded reads as too wide and eccentric, so display switched to Space Grotesk
and body to Inter. The landing page is unaffected — it injects its own CSS.

### shadcn token layer

`:root` in `src/index.css` previously held **light-mode** shadcn values
(`--background: white`) with the dark set behind a `.dark` class nothing applied.
Every `ui/*` component therefore rendered light-on-light and was overridden
inline at each call site. `:root` is now the cosmos dark theme; `ui/*` components
are correct by default.

---

## 3. Component library — `src/components/cosmos/`

| Export | Purpose |
|---|---|
| `Panel` | primary glass surface, 22px radius. Never nest panels. |
| `Card` | secondary surface inside a Panel. `interactive` lifts on hover. |
| `Eyebrow` | mono uppercase label above headings |
| `Display` | Space Grotesk heading, sizes `sm`–`xl` |
| `Lede` | intro paragraph |
| `Tag` | status pill: `live`/`dev`/`planned`/`future`/`demo`/`accent` |
| `StatTile` | metric with mono caption + optional delta chip |
| `ProgressRail` | gold→cyan progress meter |
| `StepPath` | numbered progression with connector |
| `Wordmark` | animated gradient logotype |
| `CosmosButton` | pill with conic "spark" ring. Variants: `primary` (gold), `ghost` (cyan), `ai` (violet), `promo` (magenta), `quiet` (no ring) |
| `Reveal` | blur-up scroll reveal, `stagger` for children |
| `RoleTabs` | five-colour profile switcher |
| `Gated` | plan/credit gate — see §6 |
| `AllowanceMeter` | inline "N left today" |
| `AdSlot` | ad placeholder, see §6 |
| `DashboardGrid` / `DashboardWidget` / `DashboardMasthead` | see §4 |
| `roleAccent(role)` / `roleAccentVars(role)` | role → colour |

CSS that utilities can't express (spark ring, atmosphere, reveal) lives in
`src/components/cosmos/cosmos.css`.

**Live reference: `/design-system`** — a public route rendering every token and
primitive on one page.

---

## 4. Dashboards

### Editable grid — `src/components/cosmos/dashboard/`

- `DashboardGrid` — drag to reorder, per-widget width (third/half/full), hide
  sections, hidden-section tray, reset. Editing is behind a **Customise**
  toggle so the resting state stays clean.
- `useDashboardLayout(key, widgets)` — persists to
  `localStorage['sfc.dashboard.<role>']`. **Reconciles the saved layout against
  the current widget list on every load** — without this, shipping a new widget
  would leave it invisible to every existing user.
- `DashboardMasthead` — replaced the bare "Welcome back, {name}." line. Carries
  role + date, greeting, plan + credit balance, "Ask SF", and the role's primary
  action, over a role-coloured rule.
- `commonWidgets()` — SF Drive, SF Meet and an ad slot, appended to every role
  dashboard. **SF Drive and SF Meet were previously missing from several
  dashboards**, including the default member one.

Widget shape:

```js
{ id, title, eyebrow, span: 'third'|'half'|'full', locked, accent, node }
```

### Per-role dashboards

All five rebuilt: `member`, `founder`, `builder`, `influencer`, `investor`.
Each keyed to its role colour, each with its own persisted layout.

---

## 5. Navigation — `src/components/pages/sidebars/`

Shared builders in `sidebarCommons.jsx`. Changes:

- **`aiTools(id, role)` is now role-filtered.** A founder no longer sees a
  caption generator; an influencer no longer sees a business-plan generator.
  Everything stays reachable from `/ai-dashboard`.
- **`learningSection(id, role)` added and given to every role.** Learning
  previously existed only for member and influencer — founders had no route to
  the knowledge base at all. Includes a role-specific guide.
- **`mentorshipSection(id, role)`** — mentors get a mentor dashboard, everyone
  else gets "find a mentor". Builders no longer see a mentor dashboard.
- **`walletSection(id)`** — now includes Buy Credits and Plans.
- **`ideation(id, role)`** — renamed "Visions". Knowledge and newsletters moved
  out to Learning; founders get "Create a Vision" first.
- **Task management duplicate removed.** The founder sidebar had
  *Manage → Tasks* pointing at `/erp/tasks`, the same route as *ERP → Task
  Board*. The nav entry is gone; ERP is the single home for tasks.
- **ERP added for influencer and investor** (filtered slices). Influencers had
  tasks, updates and payouts but no ERP entry.
- **SF Drive + SF Meet added to the member sidebar** (previously absent).

---

## 6. Monetisation — `src/services/entitlements/`

> ⚠️ **FRONTEND SHAPING ONLY — NOT SECURITY.**
> Everything here decides what to *show*. A user can edit localStorage or call
> the API directly. **The backend must enforce every limit independently.**
> Treat `entitlements.js` as the contract to mirror server-side.

### `entitlements.js`

- `PLANS` — `free` (Explorer, ad-supported), `builder` ($19), `founder` ($49,
  popular), `scale` ($149). Each has `limits` for assistant messages/day, match
  suggestions/day, AI generations/day, active Visions, Drive storage.
- `CREDIT_COSTS` — per metered action (match suggestion 5, assistant message 1,
  AI generation 10, pitch deck 60, …).
- `CREDIT_PACKS` — Spark/Orbit/Nebula/Galaxy with bonus credits.
- `ALWAYS_FREE` — AI News, knowledge, posts, connections, discover. **AI News is
  free by design** and must never consume credits.
- `checkLimit()` / `consume()` — allowance first, then credits, so nobody is
  hard-stopped mid-task.
- `shouldShowAds()` — true only on ad-supported plans **and** when the admin
  toggle is on.

### `useEntitlements()`

React hook. All consumers subscribe to `sfc:entitlements-changed`, so spending a
credit anywhere updates the balance everywhere.

### Backend work required

| Frontend expects | Endpoint to build |
|---|---|
| `readAccount()` | `GET /api/billing/account` → `{planId, credits, usage, usageDate, adsEnabled}` |
| Plan list | `GET /api/billing/plans` |
| Credit purchase | `POST /api/billing/credits/checkout` (Stripe) |
| Plan change | `POST /api/billing/subscribe` (Stripe) |
| Usage increment | server-side on every metered endpoint |
| Ads toggle | admin setting, surfaced in the existing admin panel |

`@stripe/stripe-js` and `@stripe/react-stripe-js` are already dependencies, and
`/checkout/:tierId` + `/checkout/return` exist for crowdfunding.

**Currently stubbed:** "Buy credits" and "Choose plan" mutate local state so the
flows are reviewable. Both are marked with `NOTE FOR BACKEND` in the source.

### `Gated` and `AdSlot`

`<Gated limitKey creditKey title description>` blurs its children and overlays an
unlock panel when the allowance is spent — showing the shape of what's behind the
gate rather than hiding it.

`<AdSlot placement format>` renders nothing on paid plans or when the admin
toggle is off (**the current default — there is no ad inventory yet**).
Positions are reserved now so monetisation can be switched on without relayout.

### New pages

- `/credits` — `src/components/pages/billing/CreditsPage.jsx`
- `/plans` — `src/components/pages/billing/PlansPage.jsx`

---

## 7. Vision page — `src/components/pages/vision/`

The space users spend most time in, rebuilt around one idea: **a Vision is a
star accreting into a startup.**

- `VisionHero.jsx` — orbital progress ring instead of a bar; the arc closes as
  points accumulate and the core brightens near activation. One soft nebula
  behind it. Deliberately restrained — nothing competes with the work below.
- `VisionActions.jsx` — **role-specific**. The same Vision is a different object
  depending on who's looking:
  - founder → invite collaborators, manage applications
  - builder → apply to contribute, save, ask
  - mentor → offer mentorship, review roadmap
  - influencer → promote, generate caption
  - investor → follow for signals, watchlist, contact founder
  
  Previously every viewer saw the founder's controls — **builders were shown
  panels advertising other builders back to themselves.**
- `SuggestedContributors` — matchmaking, shown **only** to the creator and
  founders, metered via `Gated` (few free suggestions/day, then credits).
- `MILESTONES` in `VisionWorkspacePage.jsx` — every readiness category the
  backend scores, each **paired with a button that earns it**. The breakdown was
  previously read-only: you could see you were short on points but not what to
  do about it.

`viewerRole` comes from `localStorage.activeRole` and is distinct from
`isCreator` (ownership).

---

## 8. Landing page — `src/components/landing-page/cosmos/`

`/` serves the cinematic design file. **Ported verbatim, not rewritten** — CSS
(473 lines) and the WebGL scene script (2,009 lines) were extracted with `sed`.

- `landing-cosmos.html` — markup
- `landing-cosmos.css` — injected only while the route is mounted (global
  element selectors that must not leak into the app)
- `universe.js` — the scene, wrapped as a module
- `LandingCosmos.jsx` — React owns the container; the original code owns contents

**Do not tidy `universe.js` into React idioms** — the choreography depends on
imperative DOM access. To update from a new design file, re-run the extraction.

Four adaptations:
1. three.js r128 → 0.181: `ColorManagement.enabled = false`, or r152+ shifts
   every colour off-design.
2. Document scrolling restored via `html.sfc-landing-active` — the app shell
   makes `<body>` the scroller, but the scroll director reads `window.scrollY`.
3. Unmount cleanup — listeners recorded during boot and unwound; rAF stopped;
   renderer disposed.
4. Routes remapped: `/register`→`/signup`, `/visions`→`/discover-startups`.
   The vision fetch also tries `/api/ideas/top` and `/api/startups/top`.

---

## 9. Dev auth bypass — `src/services/auth/devSession.js`

Lets the UI be opened without a backend.

- `import.meta.env.DEV` becomes the literal `false` at build time, so each guard
  folds to `if (true) return null` and esbuild drops the rest.
- Fake credentials are declared **inside** those functions, not at module scope
  — at module scope they survive tree-shaking and ship in the bundle.
- Verify: `npm run build && grep -c "dev@sfcollab.local" dist/assets/*.js` → **0**.
- Disable in dev with `VITE_DEV_AUTH_BYPASS=false` in `.env.local`.

**Remove this file and its usages (grep `DEV_AUTH_BYPASS`) before the branch is
merged for production use.**

---

## 9b. Profile — schema, inline editing, crash net

### `src/services/profile/profileSchema.js`
56 fields in 8 groups. Every field declares `aiFill` (`infer` | `extract` |
`ask` | `derived`) and `reuse` (which surfaces consume it), so the UI can say
who fills what and the assistant knows what it may write.

### `src/services/profile/profileAdapter.js`
The **only** place that knows the API splits a person across three homes:
columns on `user`, the `profile` blob, and `profile.socialLinks`.

- `toSchemaProfile(...sources)` → flat object keyed by schema field keys.
- `fieldPayload(key, value, currentUser)` → the PUT body for a one-field save.
  Returns `null` for `derived` fields so reputation can never be posted.
- Aliases live in `PROFILE_ALIASES` (`currentCompany` → `profile.company`,
  `profilePicture` → `profile.picture`, `coverPhoto` → `profile.cover`).

Change `ROOT` / `SOCIAL` / `PROFILE_ALIASES` there if the backend renames
anything — no other file needs to move.

### Inline editing — `Profile/user-profile/InlineField.jsx`
A pencil per field rather than one 56-field form, because the common action is
correcting one value. Enter commits, Escape cancels, `⌘↵` for long text.
`ProfileDetail` keeps an optimistic overlay and rolls back if the save throws;
`Profile.jsx` persists via `usersAPI.updateProfile(id, payload, token, 'application/json')`.

**BACKEND:** wants `PATCH /api/users/:id` accepting a partial body. Today it
PUTs a merged `profile` blob, which is why `fieldPayload` needs the current
user — a partial blob would drop the other keys. Also still needed:
`POST /api/profile/autofill { fields: [...] }` for the assistant pass.

### `RouteErrorBoundary` — `src/components/cosmos/RouteErrorBoundary.jsx`
There was no error boundary anywhere above the router, so one bad read
unmounted the whole tree and left a white screen with no nav and no way back.
`RouteBoundary` (the router-aware wrapper) is now mounted twice:

- inside `Layout` around `<Outlet />` — a page crash keeps the navigation;
- in `App.jsx` around `<Routes>` — backstop for anything above the layout.

It resets on pathname change, so navigating away recovers without a reload.

---

## 10. Known gaps / not done

- **Nothing has been seen with real data.** Dashboards, calendar and the Vision
  page were only reviewed empty. Calendar event create/edit and its week/list
  views are untested against real events, and the calendar had structural
  surgery — check it first.
- Still on stock styling: discover/startups, AI tools pages, wallet/store/
  leaderboard, ERP, settings, chat dock.
- Mobile dashboard views (`Mobile*Dashboard.jsx`) were not rebuilt — desktop
  only.
- `react-joyride` tutorial buttons style via props, so the token recolour
  doesn't reach them.
- Ad inventory does not exist; `AdSlot` renders a placeholder.
- Vision action buttons with `#hash` targets (`#apply`, `#promote`, `#follow`)
  are wired to anchors, not handlers — they need real actions.
- Build emits a 7.3 MB JS chunk warning (pre-existing, no code splitting).
- Dead code flagged but not removed: `src/router/routes.jsx` (unused, references
  two undefined components), `dashboard/SortableSection.jsx` (superseded).

---

## 11. Running it

```bash
npm install
npm run dev
```

`http://localhost:5173` — no login needed in dev (§9). Roles switch from the
dashboard's role tabs or `localStorage.activeRole`.
Vite proxies `/api` → `http://127.0.0.1:5000`; without that backend every panel
is empty and toasts show "Server Error". That is environmental, not a bug.
