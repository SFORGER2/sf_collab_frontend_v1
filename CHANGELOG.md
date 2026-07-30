# Changelog

## Task 1 — Website Generator Dashboard

- Added `createdAt` and `designTheme` fields to Project type
- Added status filter chips: All, Draft, In Progress, Completed, Failed
- Added creation date display on project cards
- Added Preview button for delivered projects (V2 feature)
- Added design theme label on project cards
- Added `formatDate`, `matchesStatusFilter`, `getFilterLabel` utilities

## Task 2 — Multi-Step Website Creation Wizard

Rebuilt the wizard with 6 new steps:

1. **Business Info** — Business name, email, website name, description
2. **Industry** — 13 industries in a grid with icons
3. **Brand Details** — Colors, font, tagline, logo URL (reuses BrandingConfig)
4. **Design Preferences** — 5 V2 themes (lumen, aurora, editorial, neobrutal, terra), layout, dark/light mode
5. **Review** — Summary sections with edit links
6. **Generate** — Animated 6-phase progress (analyzing → layout → content → colors → images → finalizing)

Features: Circle step indicator, per-step validation, localStorage progress persistence, edit-back-from-review navigation
Deleted old step files: app-type-step, website-name-step, features-step, reference-urls-step, branding-step, app-type-card

## Task 3 — Form Validation

- Hex color validation with error/success states in ColorPicker
- Logo URL validation on blur in BrandingConfig
- Success checkmarks (CheckCircle) on valid fields
- Green border on valid inputs, red border on errors
- Success confirmation text with CheckCircle icon on completed selections
- Brand-details validation gates in canProceed (colors + font)

## Task 4 — Template Selection

- 6 templates: Business, Startup, Portfolio, Ecommerce, Agency, SaaS
- Each shows: preview bar with color, icon, name, description, expandable features
- Selection persisted to project via packId field
- Template step added between Business Info and Industry

## Task 5 — Theme & Style Customization

- Button style selector: Square, Soft, Rounded, Pill (with visual previews)
- Border radius selector: None, Small, Medium, Large, Full
- Live ThemePreview component with real-time hero section rendering
- Preview reflects: brand colors, font, button shapes, border radius, layout width, dark/light mode
- Independent button style and border radius controls (no conflict)

## Cleanup

- Deleted dead files: use-packs.ts, feature-chip-input.tsx, url-input.tsx
- Removed dead AppPack type from types
