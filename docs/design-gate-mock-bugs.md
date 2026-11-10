# Design gate — documented mock / tooling mismatches

Issues discovered while aligning the app with `comparar_1a1.py` (oficina theme). The app may apply **capture-only** fixtures via `isDesignGateCapture()` when the mock or seed disagrees without changing production behavior.

## `modal-trocar-ciclo.html`

- **Gate:** `after_trocar` clicks `path-switcher-option-path-2` → Ciclo **2** selected (`aria-pressed="true"`).
- **Static mock:** shows **Ciclo 6** selected.
- **Evidence:** chip position deltas in comparar runs (e.g. selected chip x ≈136px app vs ≈232px mock on 360px dark).

## `modal-super-renascimento.html` vs `super_modal` seed

- **Seed (`super_modal`):** `completedOnPath: 39`, `nextRebirth: 40` — still one step before path complete.
- **Static mock backdrop:** meter **40/40**, copy “Ciclo completo…”, **no** `btn--icon btn--primary` rows (0 icon primaries); first `.btn.btn--primary` is full-width **Super Renascimento** in the action stack.
- **App handling:** capture-only `isGateSuperModalBackdrop()` hides the +/- rebirth panel and presents the completed-cycle UI; see `src/e2e/gateProgressFixture.ts`.

## Global selector `.btn.btn--primary`

- Comparer uses `document.querySelector('.btn.btn--primary')` (first match only). Modal and progress captures are sensitive to DOM order and to icon `+` buttons sharing the same classes as stack/modal primaries.
