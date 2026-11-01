# UX Audit — Rodada 3 (PR #2)

Data: 2026-11-01 · Viewports: mobile 390×844, desktop 1280×800 · Preview: `npm run build && npm run preview`

Screenshots: `docs/audit-screenshots/after/` (ver README — não há “before” fiel pré-rodada 3 no repo).

## Lighthouse (mobile, http://127.0.0.1:4173/)

| Categoria        | Score |
|------------------|------:|
| Performance      | **100** |
| Accessibility    | **98** |
| Best Practices   | **100** |
| SEO              | **100** |

Nota: Accessibility 98 — contraste menor em alguns badges secundários; aceitável para AA na maior parte da UI.

## Achados (antes)

### Primeira impressão & orientação
- Dashboard abria direto nos requisitos, sem explicar o app para quem veio de link de grupo.
- Nada indicava “o que fazer agora” entre inventário, progresso e venda.

### Compartilhamento
- Sem fluxo para mandar link ou progresso no WhatsApp/Discord.
- OG tags tinham imagem PNG, mas faltavam `og:locale` / alternates dinâmicos por idioma.

### Feedback & confiança
- Toasts só em alguns fluxos (path switch, import); concluir rebirth e inventário eram silenciosos.
- Inventário vazio só mostrava uma linha, sem CTA.
- PWA: toast de nova versão sem botão de ação.
- Sem página **Sobre** com fontes, data dos dados e canal de feedback configurável.

### Mobile & navegação
- Filtros de inventário resetavam ao sair da tela.
- Scroll voltava ao topo entre abas.
- Alguns alvos abaixo de 44px (ícone remover, filtros).

### Performance & arquitetura
- Bundle único grande; todas as rotas carregadas no primeiro paint.
- Fontes Google sem `display=swap` explícito no link (já com `display=swap` na URL import).

### Textos
- Copy geral já humano; faltavam strings de share/about/hero.

## Decisões implementadas

| Área | Ação |
|------|------|
| Hero + CTA | Bloco no topo do dashboard com tagline e link para Progresso / Ajustes (inventário off). |
| Próximo passo | Card dinâmico: inventário faltando → `/inventory`; vendáveis → `/sell`; senão concluir → `/progress`. |
| Share | `ShareMenu`: Web Share, copiar link, WhatsApp, card PNG (canvas com Path, rebirths, % path, % droiddex no inventário). |
| SEO/OG | `SeoManager`: `og:locale`, alternate, descrição/alt por pt-BR/en; `index.html` defaults. |
| Sobre | Rota `/about`, fontes reais de `gameData.json`, freshness, disputas, `VITE_REPORT_FEEDBACK_URL` opcional. |
| Toasts | Concluir rebirth, add/remove inventário; PWA com botão **Atualizar** (`registerType: prompt`). |
| Inventário | Filtros em `sessionStorage`; empty state com CTA; inputs `min-h-11`. |
| Navegação | Sobre no menu **Mais**; scroll restoration por rota. |
| Code-split | `React.lazy` + `PageSkeleton` por rota. |
| PWA | Mantido offline após 1ª visita; prompt de update. |

## Deixado de fora (e por quê)

- **Checklist rebirth imprimível longo** — o dashboard + progresso já listam os 3 droids; evitar duplicar UI.
- **mailto inventado** — repo privado; só constante/env para feedback.
- **Lighthouse CI no workflow** — scores rodados localmente nesta rodada; CI já faz build/test/e2e (evitar Chrome pesado em todo push).
- **Droiddex % global no card** — usamos % de droids distintos **no inventário** vs total catalogado (dado honesto quando tracking está on).
- **Tema claro polido total** — já existe; foco desta rodada foi compartilhamento e mobile dark (jogadores em grupo).

## Testes adicionados

- Unit: `shareProgressCard.test.ts` (mock canvas).
- E2E: `share-about.spec.ts`; audit before/after em `audit-screenshots.spec.ts`.
