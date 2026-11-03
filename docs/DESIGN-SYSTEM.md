# DroidDeck design system (foundation)

This document describes the token layer and primitives introduced in PR 1 of the redesign. Implementation lives in:

- `src/styles/theme-tokens.css` — semantic colors (dark/light), toast, buttons, badges
- `src/styles/design-tokens.css` — spacing, typography, radii, elevation, motion, tier palette
- `src/index.css` — Tailwind `@theme`, glass utilities, z-index scale

## Color roles

| Token | Role |
|-------|------|
| `--ui-bg` | App background |
| `--ui-raised` / `--ui-elevated` | Cards, panels |
| `--ui-sunken` | Inset areas |
| `--ui-fg` / `--ui-secondary` / `--ui-muted` / `--ui-soft` | Text hierarchy |
| `--ui-border` / `--ui-border-subtle` | Strokes |
| `--ui-accent-fg`, `--ui-success-fg`, `--ui-warn-fg`, `--ui-danger-fg` | Status accents |
| `--tier-*` | Droid tier accents (default, gold, diamond, …) |

Use Tailwind utilities: `bg-ui-bg`, `text-ui-fg`, `border-ui`, `text-ui-success`, etc.

## Typography

- **Sans:** Inter (`--font-sans`) for body UI
- **Display:** Orbitron (`--font-display`) for headings and sci-fi accents
- Scale utilities: `text-ds-xs` … `text-ds-lg`, `text-ds-display-sm`, `text-ds-display-md`

## Spacing

4px grid: `--space-1` (4px) through `--space-16` (64px). Prefer `gap-ds-4`, `p-ds-4` where mapped in `@theme`.

## Radii & elevation

`--radius-sm` … `--radius-2xl`, `--radius-full`. Shadows: `shadow-elevation-1` … `shadow-elevation-3`.

## Motion

Durations `--motion-duration-fast|normal|slow` collapse to `0ms` when `prefers-reduced-motion: reduce`.

## Z-index

Defined in `src/index.css` `@theme`: content (1), sticky (40), nav (45), banner (46), overlay (100), modal (101), popover (102), toast (110).

## Primitives

| Component | Path |
|-----------|------|
| Button, IconButton | `src/components/ui/Button.tsx`, `IconButton.tsx` |
| Card | `src/components/ui/Card.tsx` |
| Badge / Chip | `Badge.tsx`, `Chip.tsx` |
| SearchInput | `SearchInput.tsx` |
| SegmentedControl | `SegmentedControl.tsx` |
| Modal | `Modal.tsx` |
| Toast | `src/components/ToastProvider.tsx` |
| EmptyState, ListRow, Skeleton | `EmptyState.tsx`, `ListRow.tsx`, `Skeleton.tsx` |
| SectionHeader | `SectionHeader.tsx` |

## Contrast guardrails

- Unit: `src/styles/themeContrast.test.ts` checks WCAG AA pairs (4.5:1 text, 3:1 borders, surface steps) for dark and light token blocks.
- E2E: `e2e/design-system-a11y.spec.ts` runs axe `color-contrast` on `/design` components section in both themes.

Semantic backgrounds use runtime CSS variables (see `theme-tokens.css` overrides) so light/dark switches stay in sync.

Button/segment styles apply **background only on the `<button>`**, never on inner `.truncate` / `.text-pretty` spans (avoids “label chip” glitches in full-page screenshots).

E2E catalog captures use `openDesignCatalogSettled()` (`e2e/designSystemHelpers.ts`): pt-BR store seed, theme from settings (no toggle flicker), fonts ready, `design-capture-ready` (zero transitions), then full page + component crops.

## Living catalog

Open **`/design`** in the app (not linked from nav) to preview tokens and components in dark and light themes.

## Lint guards

`npm run lint` runs `scripts/check-theme-tokens.sh` and `scripts/check-design-tokens.sh` to discourage raw `text-white` / `#hex` in TSX outside allowlisted files.
