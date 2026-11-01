# Droid Tycoon Companion

Ferramenta de fã para **Star Wars Droid Tycoon** (ilha UEFN 7865-8305-9184). Acompanhe Path, rebirths, inventário e o que vale vender.

Fan-made companion for **Star Wars Droid Tycoon** — same island code. Not official.

**Produção / Live:** https://dthelper.kayooliveira.com

## O que faz / Features

- Path + rebirths (terminologia: concluídos vs próximo rebirth)
- Inventário com droid + tier + quantidade
- Sell Center (keep / vender / upgradar) só para rebirths restantes no Path atual
- Droiddex, Fusion Lab, export/import JSON
- English + Português (pt-BR), detecção do navegador
- PWA instalável, funciona offline para shell + dados cacheados

## Dev

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run preview
```

Docker: `docker build -t droid-tycoon-companion .` → porta 80

## Deploy

Push em `current` dispara `.github/workflows/image.yml` → `ghcr.io/kayooliveira/droid-tycoon-companion:current`. Coolify puxa a imagem (porta 80, domínio acima).

## Dados

Fonte principal: [droidtycoonhelper.com](https://droidtycoonhelper.com/). Rebirths disputados (Path 2 #17, Path 6 #19) e fusões aparecem marcados no app. Atualize via `scripts/parse.py` + `src/data/gameData.json`.

## Imagens

CC BY-SA via wiki / Helper — `public/assets/droids/ATTRIBUTION.md`.

## Aviso

Sem vínculo com Epic Games, Lucasfilm, Disney ou FOAD.
