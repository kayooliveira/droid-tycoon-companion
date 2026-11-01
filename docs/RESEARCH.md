# Droid Tycoon — Research (2026-10-31)
**Game:** Star Wars Droid Tycoon, Fortnite UEFN island by FOAD, island code **7865-8305-9184**. Data matches game v1.37 (checked 2026-10-30).

## Sources
- https://star-wars-droid-tycoon.fandom.com/ (images, CC BY-SA; community rebirth tables)
- https://tycoon-tools.com/droid-tycoon/rebirth-requirements/ (independent cross-check: 240/240 match ours after name normalization; only diff is spelling "J09-4MN" vs "JO9-4MN")
- https://games.gg/fortnite/guides/fortnite-star-wars-droid-tycoon-all-rebirth-requirement/ (path 1 R1–15 only, has errors; not used as authority)

## Model
- 101 droids, 4 classes (Worker 37, Astromech 30, Battle 28, Protocol 6). Base rarity: Common, Rare, Epic, Legendary, Mythic, Iconic. 17 fusion-only.
- Tiers (what requirements use): Default < Gold < Diamond < Rainbow < Beskar < Galactic < Stellar < Kyber; Scourge counts for any tier.
- Higher tier satisfies lower: **confirmed** (two sources).
- 6 Paths (=cycles) × 40 rebirths = 240 rebirths; each = 3 distinct droids ×1 at min tier + credits (credit costs same on every path). Super Rebirth after 12 → next path; after 6 → Path 1.

## Coverage
| Path | Rebirths | Confirmed |
|---|---|---|
| 1 | 40 | 100% |
| 2 | 40 | 97.5% (R17: R7 vs B2-RP disputed) |
| 3 | 40 | 100% |
| 4 | 40 | 100% |
| 5 | 40 | 100% |
| 6 | 40 | 97.5% (R19: Proto-Roller Gold vs Diamond disputed) |

Fusions: 17 fixed recipes + 3 general rules (tier-up 3→1, random rarity-up, lowest-tier result). Single source → `partial`. Source notes no fusion droid is required by any rebirth.

## Gaps / caveats
- No official or public API/JSON found; no GitHub repo found. Recommend a manual/CI refresh script + `staleAfterDays: 14`.
- Per-droid tier caps (e.g. can every droid reach Kyber?) not verified; Iconic/Scourge mechanics thin.
- Droid descriptions not collected (wiki has some; could be added with CC BY-SA attribution).
- Images are 128px webp; 8 droids lack a matching wiki original.
- Game updates frequently (v1.36→1.37 in a week): data will drift.
