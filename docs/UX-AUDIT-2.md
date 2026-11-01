# UX Audit — Pro onboarding & PWA (PR stack on #5)

Date: 2026-11-01 · Mobile-first 390×844 · Preview: `npm run build && npm run preview`

Screenshots: `docs/ux-round-screenshots/` (CI) or `/opt/cursor/artifacts/ux-round` when `UX_ARTIFACTS=1`.

## Goals

- First-run setup that feels native on phone: four steps, swipe/back, skip, language pill, Ciclo wording in pt-BR.
- PWA icons and update path that do not trap users on stale shells (`autoUpdate`, skipWaiting, manifest cache bust v4).
- Light haptic on rebirth complete when the device supports `navigator.vibrate`.

## Onboarding (new)

| Step | Content |
|------|---------|
| Welcome | Logo motion, hero droids, PT/EN pill, Start + Skip |
| Ciclo | Cards with droid art, rebirth count, selection ring |
| Progress | Chips (start / mid), stepper + range, live next-rebirth preview |
| Features | Nav tiles + inventory toggle, CTA opens dashboard |

Test IDs: `onboarding-start`, `onboarding-next`, `onboarding-back`, `onboarding-finish`, `onboarding-skip`, `onboarding-rebirth-input`, `onboarding-cycle-{id}`.

E2E: `e2e/onboarding-flow.spec.ts` (full flow + skip).

## PWA

- `registerType: 'autoUpdate'` with Workbox `skipWaiting` / `clientsClaim`.
- Manifest icons v4 (gradient + maskable + monochrome); HTML favicon/apple links bumped to `?v=4`.
- Manifest shortcuts (Progresso / Vender) and store screenshots under `public/screenshots/`.
- Toast `pwa.updatedToast` on silent SW install; existing prompt toast for manual refresh fallback.

## Progress polish

- `hapticTap()` when marking a rebirth complete (Progress page).

## Out of scope (unchanged this round)

- `nginx.conf` (owned by #6 on `current`).
- Game data / sell-after-rebirth logic (landed in #3).

## Verification

```bash
npm run typecheck && npm test && npm run build && npm run test:e2e
npm run generate:icons   # icons + manifest screenshots
UX_ARTIFACTS=1 npm run test:e2e -- e2e/ux-screenshots.spec.ts
```
