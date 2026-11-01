# Droid Tycoon Companion / Companheiro Droid Tycoon

**English:** Fan-made companion web app for [Star Wars Droid Tycoon](https://droidtycoonhelper.com/about/) (Fortnite UEFN island by FOAD, code **7865-8305-9184**). Track paths, rebirths, inventory, sell decisions, droid encyclopedia, and fusion recipes — 100% static, works offline after load.

**Português:** Ferramenta feita por fãs para jogadores de Droid Tycoon. Acompanhe path, rebirths, inventário, vendas, droiddex e fusões. Não é oficial.

**Live (after Pages deploy):** https://kayooliveira.github.io/droid-tycoon-companion/

## Features

- Onboarding (path, rebirth progress, theme, inventory tracking)
- Dashboard with **Next Rebirth** requirements and status
- Progress (list + focus modes, complete/undo, Super Rebirth)
- Inventory (droid + **tier** + quantity)
- **Sell Center** — keep / sellable / upgrade analysis for remaining path rebirths
- Droiddex (101 droids, sources, confidence)
- Fusion Lab (17 recipes + rules, partial/single-source labeled)
- Settings — export/import JSON, data freshness, credits, reset
- LocalStorage persistence with schema versioning & migrations

## Screenshots

| Dashboard (desktop) | Dashboard (mobile) |
|---|---|
| ![Dashboard desktop](docs/screenshots/dashboard-desktop.png) | ![Dashboard mobile](docs/screenshots/dashboard-mobile.png) |

See also `docs/screenshots/` for Progress, Sell Center, Droiddex, Fusion Lab, Inventory, Settings.

## Data sources & confidence

- Primary: [droidtycoonhelper.com](https://droidtycoonhelper.com/) (game v1.37, checked 2026-10-31)
- Cross-check: [tycoon-tools.com](https://tycoon-tools.com/droid-tycoon/rebirth-requirements/)
- Images: Helper / [Fandom wiki](https://star-wars-droid-tycoon.fandom.com/) (CC BY-SA) — see `public/assets/droids/ATTRIBUTION.md`
- **Unconfirmed in UI:** Path 2 Rebirth 17 (R7 vs B2-RP), Path 6 Rebirth 19 (Proto-Roller Gold vs Diamond)
- Fusion data: single source → labeled **partial**
- Scourge-tier satisfies any requirement: **partial**, one source
- `staleAfterDays: 14` — stale banner in app when data is old

### Updating data

1. Run / adapt `scripts/parse.py` against droidtycoonhelper.com (see `docs/RESEARCH.md`)
2. Replace `src/data/gameData.json` and images under `public/assets/droids/`
3. Run `npm test` (includes validation that requirements reference real droids)

## Development

```bash
npm install
npm run dev          # local dev (base path /droid-tycoon-companion/)
npm run typecheck
npm test             # Vitest unit tests
npm run test:e2e     # Playwright smoke (+ screenshot spec)
npm run build
npm run preview      # test production build locally
```

## Architecture

- **UI:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion + lucide-react
- **State:** Zustand + persist (LocalStorage)
- **Routing:** HashRouter (GitHub Pages friendly) + `public/404.html` fallback
- **Domain:** Pure functions in `src/domain/` (sell logic, tiers, requirements, progress)
- **Adapters:** `src/storage/adapter.ts`, `src/data/dataSource.ts` (ready for future cloud/remote data)

## Deployment (GitHub Pages)

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**
2. Push to `main` runs `.github/workflows/deploy-pages.yml` (test, build, deploy)
3. PRs run `.github/workflows/ci.yml`

## Disclaimer

Fan-made companion tool. **Not affiliated with Epic Games, Lucasfilm, Disney, or FOAD.**

## License

App code: MIT (see repository). Game data/images remain under their respective sources (CC BY-SA for wiki images).
