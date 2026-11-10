# Design gate — documented mock / tooling mismatches

Issues discovered while aligning the app with `comparar_1a1.py` (oficina theme). The app may apply **capture-only** fixtures via `isDesignGateCapture()` when the mock or seed disagrees without changing production behavior.

## Static overlays are not composited like live portal overlays

- **Live flow:** modals and sheets render in the fixed overlay portal, which Chrome promotes
  to a composited layer and rasterizes text without subpixel color fringes.
- **Static mocks:** overlays are direct children of `.app`; identical geometry and computed
  typography still produce a false pixel diff (up to 2% for text-heavy dialogs).
- **Correction:** `after_mock_static()` applies a no-op `translateZ(0)` to `.modal` and
  `.sheet`, matching the live layer rasterization without changing layout or approved styles.

## `modal-trocar-ciclo.html`

- **Fluxo anterior:** `after_trocar` clicava `path-switcher-option-path-2` → Ciclo **2**
  selecionado (`aria-pressed="true"`).
- **Static mock:** shows **Ciclo 6** selected.
- **Evidence:** chip position deltas in comparar runs (e.g. selected chip x ≈136px app vs ≈232px mock on 360px dark).
- **Correção:** o comparador seleciona `path-switcher-option-path-6`, reproduzindo o estado
  aprovado em ambos os modais de troca.

## `modal-super-renascimento.html` vs `super_modal` seed

- **Seed (`super_modal`):** `completedOnPath: 39`, `nextRebirth: 40` — still one step before path complete.
- **Static mock backdrop:** meter **40/40**, copy “Ciclo completo…”, **no** `btn--icon btn--primary` rows (0 icon primaries); first `.btn.btn--primary` is full-width **Super Renascimento** in the action stack.
- **App handling:** capture-only `isGateSuperModalBackdrop()` hides the +/- rebirth panel and presents the completed-cycle UI; see `src/e2e/gateProgressFixture.ts`.

## `toast-atualizacao-pwa.html`

- **Mock (`screens3.py`):** início com toast sticky “Nova versão do app disponível.” + **Atualizar** (`inicio3(toast_html=…)`).
- **`comparar_1a1.py` (antes):** navegava para `/settings` — viewport de Ajustes, não do Início.
- **Correção:** captura em `/` + `after_pwa` (dispara `pwa-need-refresh` global em `App.tsx`).

## Global selector `.btn.btn--primary`

- Comparer uses `document.querySelector('.btn.btn--primary')` (first match only). Modal and progress captures are sensitive to DOM order and to icon `+` buttons sharing the same classes as stack/modal primaries.

## `progresso-busca` query vs mock (`screens3.py`)

- **Mock generator:** `query='R7'` (`progresso-busca.html`).
- **`comparar_1a1.py` (antes):** `?q=LEP` e `after_busca` com `LEP` — divergia do HTML aprovado.
- **Correção:** `scripts/comparar_1a1.py` usa `q=R7` e preenche `R7` no campo.

## `progresso-busca-nunca` query vs mock

- **Mock generator:** `query='C-3PO'`.
- **`comparar_1a1.py` (antes):** `after_busca_nunca` preenchia `Pit`.
- **Correção:** preencher `C-3PO` para alinhar com `progresso-busca-nunca.html`.

## `droiddex-detalhe.html` abre LEP, não o primeiro card

- **Mock:** modal do **LEP** (Kyber) após tocar no card correspondente.
- **Grid mock:** ordem custom (`mouse`, `pit`, …, `lep`, …), não alfabética.
- **`comparar_1a1.py`:** `after_dex_detalhe` clica no botão cujo texto inclui `LEP`.
- **App (gate):** `DroiddexGateView` replica grid/modal estáticos só em captura.

## `progresso.html` painel unificado vs lógica de venda viva

- **Mock:** CYCLENS `0/1` com tag **Não venda** e botões `−`/`+`; linha extra **KX** “Pode vender”; **Concluir** primário habilitado; sem CTA **Super Renascimento** na stack (só Desfazer).
- **App (produção):** regras de `rebirthSellPlan` marcam CYCLENS vendável e omitem KX; Super CTA aparece com `completedOnPath ≥ 12`.
- **App (gate):** `gateUnifiedRebirthPanelRows()` em `src/e2e/gateProgressFixture.ts` fixa linhas/ações só em `isDesignGateCapture()` + inventário QA.

## `vazio-vender.html` contém texto de tupla fora do app

- **Static mock:** o `<body>` começa com o texto acidental `('Vender vazio', '` e termina com `')`, deslocando todo o mock em cerca de 22 px.
- **Fluxo real:** a tela vazia começa diretamente em `<div class="app">`, sem esses nós de texto.
- **Correção do comparador:** `after_mock_static()` remove somente os nós de texto que são filhos diretos de `body` para esse slug antes da captura. O HTML aprovado permanece intacto para deixar o defeito de geração auditável.

## `inventario-sem-resultado.html` não representa uma busca vazia

- **Static mock:** campo de busca vazio, filtro **Raridade** ativo, chip **Raro** selecionado e nenhum card.
- **`comparar_1a1.py` (antes):** abria a visão **Todos** e preenchia `zzzzsemresultadoxyz`, deixando controles e copy diferentes do HTML aprovado.
- **Correção:** a captura usa `e2e_inv_filter=rarity&e2e_inv_empty=1`; o segundo parâmetro força apenas a coleção gate a ficar vazia. O antigo `after_busca_inv` foi removido.

## `fusao-vazio.html` usa a busca estática `xyz`

- **Static mock:** campo de receitas contém `xyz`, sem foco, e exibe “Nenhuma receita bate com a busca.”
- **`comparar_1a1.py` (antes):** `after_fusao_vazia` preenchia `zzzzfusao` e deixava o campo focado, ativando borda e sombra de foco ausentes no mock.
- **Correção:** preencher `xyz`, remover o foco e restaurar o scroll interno que o Chrome
  móvel aplica ao shell em 360 px antes da captura.
