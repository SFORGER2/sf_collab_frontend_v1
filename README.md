# SFCollab — Website Generator

A modern, AI-powered website generator built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**. Create, manage, and deploy website projects through an intuitive multi-step wizard.

> **Phase 1** — Core UI, project management, and website creation wizard completed.

---

## Features

### Dashboard

- **Project grid** — Browse all your websites in a responsive card layout with hover animations
- **Search** — Filter projects by name in real-time
- **Status indicators** — Visual badges for draft, building, deployed, and error states
- **Context menu** — Right-click / three-dot menu with delete action
- **Empty state** — Welcoming onboarding screen when no projects exist
- **Refresh** — One-click reload of project data

### Website Creation Wizard

A 5-step guided wizard for creating new websites:

| Step | Section            | Description                                                       |
| ---- | ------------------ | ----------------------------------------------------------------- |
| 1    | **App Type**       | Choose a template (Landing Site, Blog, Ecommerce, SaaS Dashboard) |
| 2    | **Website Name**   | Enter a name and description for your project                     |
| 3    | **Branding**       | Pick a primary color and font for your site                       |
| 4    | **Features**       | Select from 20+ feature tags or add custom ones                   |
| 5    | **Reference URLs** | Add reference URLs with inline validation                         |

- **Progress indicator** — Segmented bar with step labels and count
- **Form validation** — Real-time validation on required fields
- **Smooth transitions** — Framer Motion animations between steps
- **Instant feedback** — Toast notifications on success

### UI Components

- **Modal** — Reusable animated modal with backdrop blur
- **Button** — Multi-variant button with hover shine effect
- **Toast** — Context-based toast notification system with success, error, info variants
- **Status badge** — Color-coded project status indicators

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
│   ├── ui/                    # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── modal.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── wizard-steps/          # Wizard step components
│   │   ├── app-type-step.tsx
│   │   ├── website-name-step.tsx
│   │   ├── branding-step.tsx
│   │   ├── features-step.tsx
│   │   └── reference-urls-step.tsx
│   ├── dashboard.tsx          # Main dashboard layout
│   ├── website-wizard.tsx     # Multi-step creation wizard
│   ├── project-card.tsx       # Individual project card
│   ├── create-website-modal.tsx
│   ├── delete-website-dialog.tsx
│   ├── app-type-card.tsx      # Template selection card
│   ├── empty-state.tsx        # Empty dashboard state
│   └── status-badge.tsx       # Project status indicator
├── hooks/
│   ├── use-projects.ts        # Fetch projects (GET /projects)
│   ├── use-packs.ts           # Fetch template packs (GET /packs)
│   ├── use-create-project.ts  # Create project (POST /projects)
│   └── use-toast.tsx          # Toast notification context
├── types/
│   └── index.ts               # TypeScript types & constants
├── lib/
│   └── utils.ts               # cn() utility (clsx + tailwind-merge)
├── App.tsx
├── main.tsx
└── index.css
```

---

## API

The app is designed to work with a backend that exposes the following endpoints. When no backend is available, mock data is used for development.

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
		"font": "Inter"
	},
	"features": ["SEO optimized", "Contact form"],
	"referenceUrls": ["https://example.com"]
}
```

---

## Phase 1 — What's Included

- ✅ Dashboard with project grid, search, and empty state
- ✅ Full 5-step website creation wizard
- ✅ Template pack selection (4 templates)
- ✅ Branding customization (colors + fonts)
- ✅ Feature selection with custom tags
- ✅ Reference URL management with validation
- ✅ Project creation flow with toast feedback
- ✅ Project deletion with confirmation dialog
- ✅ Responsive design (mobile + desktop)
- ✅ Animations (entrance, hover, transitions)
- ✅ Mock API fallback for development
- ✅ TypeScript throughout

---

## License

Private — SFCollab
