# Website Generator — File Structure

All `.tsx` / `.ts` files below belong to the **Website Generator** module.
The company's code uses `.jsx` files.

---

## Entry Points

| File | Purpose |
|---|---|
| `src/main.tsx` | App bootstrap — mounts React root |
| `src/App.tsx` | Root component — routes between Dashboard ↔ Workspace |
| `src/index.css` | Tailwind theme + global styles (fonts, colors, scrollbars) |

---

## Dashboard (project listing)

| File | Purpose |
|---|---|
| `src/components/dashboard.tsx` | Main dashboard — loads projects, search, create/delete |
| `src/components/project-card.tsx` | Individual project card with status, date, actions |
| `src/components/status-badge.tsx` | Status indicator (draft, generating, delivered, failed, etc.) |
| `src/components/empty-state.tsx` | Shown when no projects exist |
| `src/components/create-website-modal.tsx` | Wrapper that opens the multi-step wizard |
| `src/components/delete-website-dialog.tsx` | Confirm dialog before deleting a project |

---

## Multi-Step Creation Wizard

| File | Purpose |
|---|---|
| `src/components/website-wizard.tsx` | Wizard shell — step indicator, progress, navigation |
| `src/components/wizard-steps/business-info-step.tsx` | Step 1 — Business name, website name, description |
| `src/components/wizard-steps/template-step.tsx` | Step 2 — Choose a template |
| `src/components/wizard-steps/industry-step.tsx` | Step 3 — Select industry (13 options) |
| `src/components/wizard-steps/brand-details-step.tsx` | Step 4 — Colors, font, logo URL, tagline |
| `src/components/wizard-steps/design-preferences-step.tsx` | Step 5 — Theme, button style, radius, layout |
| `src/components/wizard-steps/review-step.tsx` | Step 6 — Review all data with edit buttons |
| `src/components/wizard-steps/generate-step.tsx` | Step 7 — Animated generation loading screen |
| `src/components/branding-config.tsx` | Color picker, font selector, logo input (reused in wizard) |
| `src/components/theme-preview.tsx` | Live preview of selected theme/colors |

---

## Workspace (project detail)

| File | Purpose |
|---|---|
| `src/components/workspace.tsx` | Project workspace with stepper (discovery → deliver) |

---

## Reusable UI Components

| File | Purpose |
|---|---|
| `src/components/ui/button.tsx` | Button component with variants |
| `src/components/ui/modal.tsx` | Modal/dialog overlay with animation |
| `src/components/ui/toast.tsx` | Toast notification component |
| `src/components/ui/toaster.tsx` | Toast container + position manager |
| `src/components/ui/stepper.tsx` | Step indicator bar (used in workspace) |
| `src/components/ui/color-picker.tsx` | Color input with presets + hex validation |

---

## Hooks

| File | Purpose |
|---|---|
| `src/hooks/use-projects.ts` | Load/save projects from localStorage + API |
| `src/hooks/use-toast.tsx` | Toast state management + context provider |
| `src/hooks/use-project.ts` | Fetch individual project with workspace steps |
| `src/hooks/use-create-project.ts` | POST project to API with loading state |

---

## Types & Utilities

| File | Purpose |
|---|---|
| `src/types/index.ts` | All TypeScript types (Project, WizardData, Branding, etc.) |
| `src/lib/utils.ts` | Utility functions (cn, formatDate, etc.) |
| `src/lib/animations.ts` | Reusable Framer Motion animation presets |

---

## Total: 33 files
