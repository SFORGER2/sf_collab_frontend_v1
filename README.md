# SFCollab — Website Generator

A modern, AI-powered website generator built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**. Create, manage, and deploy website projects through an intuitive multi-step wizard with heavy animations.

---

## Features

### Dashboard

- **Project grid** — Browse all websites in a responsive 3-column card layout with staggered entrance animations
- **Search** — Filter projects by name in real-time with animated transitions
- **Status indicators** — Color-coded badges for draft, building, deployed, and error states (with fade+scale entrance)
- **Context menu** — Three-dot menu with delete action (visible on hover on desktop, always visible on mobile)
- **Empty state** — Welcoming onboarding screen with staggered entrance animations
- **Animated navbar** — Logo, title, text, badge, and action buttons cascade in on page load
- **Refresh** — One-click reload with spinning indicator
- **LocalStorage persistence** — Projects survive page reloads

### Website Creation Wizard

A 5-step guided wizard with AnimatePresence vertical slide transitions:

| Step | Section            | Description                                                       |
| ---- | ------------------ | ----------------------------------------------------------------- |
| 1    | **App Type**       | Choose a template (Landing Site, Blog, Ecommerce, SaaS Dashboard) |
| 2    | **Website Name**   | Enter a name and description with real-time validation            |
| 3    | **Branding**       | Configure primary/accent colors, font, tagline, and logo URL      |
| 4    | **Features**       | Select from 20+ clickable feature tags or search for specific ones |
| 5    | **Reference URLs** | Add reference URLs with inline validation and max limit of 10     |

- **Progress indicator** — Segmented bar segments with scale-in animation, animated step labels
- **Form validation** — Real-time name validation (min 2 characters)
- **Smooth transitions** — Vertical slide (y: 16→0) with 0.18s easeOut
- **Instant feedback** — Toast notifications with slide-in animation
- **Step headers** — Each step icon springs in (scale 0→1), title and description fade+slide staggered

### Branding Configuration

- **Primary color picker** — 5 preset swatches with spring stagger entrance + custom hex input
- **Accent color picker** — Same swatch pattern with live color preview bar
- **Tagline field** — Text input with icon
- **Logo URL field** — URL input with image preview
- **Font selector** — 4 font options (Inter, Audiowide, System UI, Mono)
- **Animated sections** — All form sections fade+slide in with cascading delays (0.1s–0.3s)

### Feature Input System

- **Clickable feature tags** — All 20 features shown as toggle buttons with scale+fade animation (0.18s, 40ms stagger)
- **Search input** — Type to filter suggestions from a dropdown
- **Chip display** — Selected features shown as pills with X to remove (animated enter/exit)
- **Max limit** — 20 feature limit with counter and warning indicator
- **Custom features** — Type and add your own features not in the suggestions list

### Reference URL Management

- **URL input** — Add URLs via Enter key or Add button with auto-normalization
- **URL validation** — Format validation via `new URL()` + hostname dot check
- **Duplicate detection** — Shows error if URL already added
- **Max limit** — 10 URL limit with counter and warning indicator
- **URL list** — Each row shows Link icon, clickable URL, ExternalLink button, and X delete button
- **Animated** — Same scale+fade staggered animation as feature chips

### UI Components

- **Button** — Multi-variant (default, outline, ghost) with hover scale and active press effects
- **Modal** — Animated backdrop blur + panel scale/fade with staggered header
- **Toast** — Context-based notification system with slide-in animation
- **Status badge** — Color-coded indicators with loading spinner animation
- **Delete dialog** — Warning icon with spring rotation, staggered text + buttons

---

## Tech Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| **Framework**  | React 19             |
| **Language**   | TypeScript 5.7       |
| **Build tool** | Vite 8               |
| **Styling**    | Tailwind CSS v4      |
| **Animation**  | Framer Motion 11     |
| **Icons**      | Lucide React         |
| **Utilities**  | clsx, tailwind-merge |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **pnpm** or **yarn**

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` by default.

### Build

```bash
npm run build
```

Outputs to the `dist/` directory.

### Preview production build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── ui/                          # Reusable UI primitives
│   │   ├── button.tsx               # Animated multi-variant button
│   │   ├── modal.tsx                # Animated modal with backdrop + header
│   │   ├── toast.tsx                # Toast notification item
│   │   ├── toaster.tsx              # Toast container with AnimatePresence
│   │   ├── color-picker.tsx         # Color swatches with custom hex input
│   │   ├── feature-chip-input.tsx   # Feature chips with add/remove/search
│   │   └── url-input.tsx            # URL input with validation + list
│   ├── wizard-steps/                # Wizard step components
│   │   ├── app-type-step.tsx        # Template selection step
│   │   ├── website-name-step.tsx    # Name + description step
│   │   ├── branding-step.tsx        # Branding delegation step
│   │   ├── features-step.tsx        # Feature tag buttons + search
│   │   └── reference-urls-step.tsx  # URL management step
│   ├── dashboard.tsx                # Main dashboard layout with animated navbar
│   ├── website-wizard.tsx           # 5-step wizard with vertical slide transitions
│   ├── project-card.tsx             # Project card with staggered content animation
│   ├── create-website-modal.tsx     # Modal wrapper for wizard
│   ├── delete-website-dialog.tsx    # Delete confirmation with spring animation
│   ├── branding-config.tsx          # Full branding form with staggered sections
│   ├── app-type-card.tsx            # Template selection card
│   ├── empty-state.tsx              # Empty dashboard state with staggered entrance
│   └── status-badge.tsx             # Status indicator with fade+scale entrance
├── hooks/
│   ├── use-projects.ts              # Fetch + persist projects (GET /projects)
│   ├── use-packs.ts                 # Fetch template packs (GET /packs)
│   ├── use-create-project.ts        # Create project (POST /projects)
│   └── use-toast.tsx                # Toast notification context
├── types/
│   └── index.ts                     # TypeScript types, constants, wizard data
├── lib/
│   ├── utils.ts                     # cn() utility (clsx + tailwind-merge)
│   └── animations.ts                # Shared scale+fade animation config
├── App.tsx
├── main.tsx
└── index.css
```

---

## API

The app is designed to work with a backend. When unavailable, mock data is used and persisted to localStorage.

| Method | Path        | Description                   |
| ------ | ----------- | ----------------------------- |
| `GET`  | `/projects` | List all projects             |
| `POST` | `/projects` | Create a new project          |
| `GET`  | `/packs`    | List available template packs |

### POST /projects

```json
{
  "name": "My Website",
  "description": "A personal site",
  "packId": "landing",
  "branding": {
    "primaryColor": "#503c8c",
    "accentColor": "#0d9488",
    "tagline": "My awesome site",
    "logoUrl": "https://example.com/logo.png",
    "font": "Inter"
  },
  "features": ["SEO optimized", "Contact form"],
  "referenceUrls": ["https://example.com"]
}
```

---

## Animation System

The app uses a consistent animation system built on Framer Motion:

### Shared Config (`src/lib/animations.ts`)

- **`scaleFadeIn`** — Reusable `initial`/`animate`/`exit` object (opacity 0→1, scale 0.85→1)
- **`getScaleFadeTransition(index)`** — Returns `{ duration: 0.18, delay: index * 0.04, ease: "easeOut" }`

### Animation Patterns

| Pattern | Duration | Delay | Elements |
|---------|----------|-------|----------|
| Spring scale | 0.3–0.4s | 0.05s stagger | Icons, swatches, badges |
| Fade + slide up | 0.3s | 0.05–0.3s cascade | Section headers, form inputs, cards |
| Scale + fade | 0.18s | 0.04s stagger | Feature tags, chips, URL items |
| Vertical slide | 0.18s | — | Wizard step transitions |
| Hover scale | — | — | All buttons (1.02x), cards (-3px lift) |

---

## What's Included

### Phase 1 — Core UI & Wizard
- ✅ Dashboard with project grid, search, and empty state
- ✅ Full 5-step website creation wizard with validation
- ✅ Template pack selection (4 templates)
- ✅ Project creation and deletion flow
- ✅ Toast notifications
- ✅ Responsive design (mobile + desktop)

### Phase 2 — Branding & Input Components
- ✅ Branding configuration module (colors, font, tagline, logo URL)
- ✅ Color picker with presets + custom hex
- ✅ Feature input system with clickable tags and search
- ✅ Reference URL management with validation
- ✅ Animated tag buttons, chips, and URL items
- ✅ Shared animation config (`src/lib/animations.ts`)

### Phase 2+ — Polish & Animations
- ✅ Comprehensive animation pass across all components
- ✅ Dashboard navbar staggered entrance
- ✅ Project card inner content animations
- ✅ Wizard progress bar segment animation
- ✅ All step headers animated (icon spring, title/description fade)
- ✅ Color swatches spring stagger entrance
- ✅ Delete dialog content stagger
- ✅ Modal header animated
- ✅ Status badge entrance animation
- ✅ All buttons have hover/tap scale effects
- ✅ localStorage persistence for projects
- ✅ 3-dots menu visible on mobile
- ✅ Feature tag buttons animate in/out

---

## License

Private — SFCollab
