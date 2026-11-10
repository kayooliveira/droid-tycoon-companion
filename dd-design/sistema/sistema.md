# DroidDeck: sistema de temas (especificação para o Dev)

Estado: **especificação e mocks para aprovação**. Nada foi alterado no app nem na VPS. O Droid Tycoon implementa depois da aprovação do Kayo.

Decisão do Kayo: as três direções viram **temas selecionáveis**. Oficina é o padrão. Figurinhas e Cartaz são opcionais, escolhidos em Ajustes, Aparência (e no passo novo do onboarding). Cada tema tem **claro, escuro e seguir o sistema**. São 6 combinações visuais, todas validadas.

---

## 1. Princípio: uma estrutura, três aparências

1. **Uma só marcação HTML e um só `components.css`.** Nenhum seletor de componente conhece o tema. Tudo que muda vem de variáveis CSS (tokens).
2. O tema é definido por **dois atributos no `<html>`**: `data-theme="oficina|figurinhas|cartaz"` e `data-mode="dark|light"`. Trocar só esses dois atributos troca o app inteiro. Foi assim que os 28 mocks e os 168 prints (28 telas x 6 combinações) foram gerados (uma única base de HTML, só os atributos mudam).
3. As diferenças de "assinatura" (régua, figurinha, número gigante) são **variantes do mesmo componente**, controladas por tokens (exibir ou não um elemento, tamanho, posição em grade, moldura). Mesma informação, mesma ordem, mesmo comportamento, mesmos alvos de toque.
4. Como os tokens são resolvidos no elemento, um **escopo aninhado** funciona: o card de pré-visualização do tema em Ajustes usa `data-theme="figurinhas"` num `<div>` e renderiza os componentes reais de Figurinhas dentro do tema ativo. Nada de screenshot nem de CSS duplicado.

### Arquivos entregues

```
sistema/
  css/fonts.css        @font-face dos 6 conjuntos + faces de fallback com métricas ajustadas (gerado)
  css/tokens.css       6 combinações de tokens (gerado de tools/gen_tokens.py), 41 KB, cerca de 7,5 KB gzip
  css/components.css   componentes só com var(--...), sem condicional de tema
  assets/fonts/*.woff2 fontes (latin) | assets/droids/*.webp imagens usadas nos mocks
  html/*.html          28 telas geradas da MESMA base | viewer.html troca tema, modo e tela
  prints/<tema>/<modo>/<tela>.png        6 combinações x 28 telas, 390px, escala 2
  prints/comparativo/<tela>.png          6 combinações lado a lado, por tela
  tools/               gen_tokens.py, gen_fonts.py, ui.py, screens.py, build.py, capture.py, validar.py, teste_validador.py
  validacao.md         relatório da validação automática
```

### Contrato de tokens e escopos

- `[data-theme=X]` define o que **não** muda com o modo (formas, fontes, tamanhos, assinatura).
- `[data-theme=X][data-mode=dark|light]` define o que muda com o modo (cores, sombras que dependem da cor, filtros de silhueta).
- `:root,[data-theme]` define o que é igual em tudo (espaçamentos, movimento, z-index, tamanho mínimo de toque).
- Sem JS, o padrão é Oficina, claro, e escuro via `@media (prefers-color-scheme: dark)`. Com JS, o script abaixo resolve antes da primeira pintura.
- `color-scheme` é definido em cada combinação, então barras de rolagem, campos e o `<input type=range>` nativo seguem o modo.

### Resolução do modo (Sistema, Claro, Escuro) sem piscar

Preferência do usuário: `dd-theme` (`oficina|figurinhas|cartaz`) e `dd-mode` (`system|light|dark`) em `localStorage`. Script **inline no `<head>`, antes do CSS ser aplicado** (ver `ui.py`, constante `HEAD_JS`):

```html
<script>
(function(){var d=document.documentElement,t,p;
try{t=localStorage.getItem('dd-theme');p=localStorage.getItem('dd-mode')}catch(e){}
if(['oficina','figurinhas','cartaz'].indexOf(t)<0)t='oficina';
if(['system','light','dark'].indexOf(p)<0)p='system';
var mq=matchMedia('(prefers-color-scheme:dark)');
function apply(){d.dataset.mode=p==='system'?(mq.matches?'dark':'light'):p}
d.dataset.theme=t;d.dataset.pref=p;apply();
mq.addEventListener('change',function(){if(p==='system')apply()})})()
</script>
```

- No React, a mesma lógica vira um hook (`useAppearance`) que escreve nos dois atributos e em `localStorage`. O script inline continua existindo só para a primeira pintura.
- Escopos aninhados (cards de tema) recebem `data-mode` explícito igual ao do `<html>` (o mock faz isso em `__syncScopes`). Sem `data-mode`, o escopo cai no fallback por `prefers-color-scheme`, que é aceitável mas não acompanha uma escolha manual de Claro ou Escuro.
- **`<meta name="theme-color">`** deve acompanhar o fundo da combinação ativa, para a barra do navegador e a splash do PWA não destoarem. Valores de `--c-bg` (Oficina escuro, Oficina claro, Figurinhas escuro, Figurinhas claro, Cartaz escuro, Cartaz claro): `#121315` | `#ECEBE6` | `#0F1C2E` | `#F2EDE0` | `#0A0A0B` | `#F3F2EE`.
- O `manifest.webmanifest` tem uma `theme_color` e uma `background_color` estáticas. Usar as da Oficina escuro (padrão) e atualizar a meta em runtime.

---

## 2. Estrutura de componentes (única)

Todos em `css/components.css`. A marcação está em `tools/ui.py` (funções) e é idêntica nos três temas.

| Componente | Classe | Observação de paridade |
|---|---|---|
| Shell | `.app > .scroll + .toast-slot + .tabbar` | `.toast-slot` é **em fluxo**, acima da tab bar: o toast ocupa espaço próprio, nunca cobre botão nem conteúdo. Vazio, fica `hidden`. |
| Cabeçalho | `.top` (grid `--head-areas`) com `.top-brand`, `.top-aside`, `h1.t-display` | Marca "DroidDeck" só aparece no Cartaz (token `--brand-display`). |
| Tab bar | `.tabbar > .tab[aria-current=page]` | Indicador ativo: barra no topo (Oficina), pílula (Figurinhas), bloco invertido (Cartaz). Mesmos 5 itens e mesma ordem. |
| Botões | `.btn` + `--primary --secondary --danger --danger-solid --ghost`, `.btn--icon`, `.btn--sm`, `[disabled]` | Altura 52 a 56, ícone 48, mínimo 44. |
| Campos | `.field-wrap > .field`, `.sel`, `.chip`, `.seg`, `.opts > .opt`, `.range`, `.switch-row`, `.stepper` | Fonte de entrada sempre 16px. Foco e erro visíveis. |
| Tag de estado | `.tag--ok/--bad/--mute` | Oficina: texto mono sobre fundo; Figurinhas: pílula com ícone; Cartaz: quadradinho (vazado, cheio, meio). Nunca depende só de cor: sempre tem texto. |
| Tile de droid | `.dtile[data-tier]` com `--sm --xs --lg --missing` | Os 9 níveis: `default gold diamond rainbow beskar galactic stellar kyber scourge`. |
| Card de droid (grade) | `.dcard` | Abre a ficha ao tocar. |
| Item de lista | `.item > .item-open + ações` | Ficha abre **só** em `.item-open`. Em Progresso, `x` e `+` só removem e adicionam. |
| Linha / acordeão | `.row`, `.acc > .acc-h + .acc-body` | |
| Hero do próximo Renascimento | `.hero` (`.hr-head`, `.hr-kicker`, `.hr-num`, `.trio > .req-col`) | Número do Renascimento aparece antes do trio em todos. |
| Medidor do Ciclo | `.cm` (`.cm-top`, `.cm-cells`, `.cm-marks`, `.cm-foot`) | 40 células nas 3 variantes. Redundante com o texto "29 de 40", por isso `aria-hidden`. |
| Sheet | `.scrim + .sheet` | Ficha do droid. Fechar sempre disponível (botão 44px). |
| Modal | `.modal-wrap > .modal` | Cancelar à esquerda, ação à direita, nas 3 variantes. |
| Toast | `.toast` (+ `.toast--err`) com `.toast-act` | Mensagem completa (sem cortar), botão Desfazer com 44px. |
| Seletor de tema | `.tcard[role=radio]` com `.tp` (preview real) | |
| Vazio e carregando | `.empty`, `.sk` | Esqueleto com `prefers-reduced-motion` respeitado. |

---

## 3. Tokens

### 3.1 Cores semânticas (6 combinações)

| Token | Uso | Oficina escuro | Oficina claro | Figurinhas escuro | Figurinhas claro | Cartaz escuro | Cartaz claro |
|---|---|---|---|---|---|---|---|
| `--c-bg` | Fundo da tela | `#121315` | `#ECEBE6` | `#0F1C2E` | `#F2EDE0` | `#0A0A0B` | `#F3F2EE` |
| `--c-surface` | Superfície (painel, campo, sheet) | `#1A1C1F` | `#F8F7F3` | `#172A44` | `#FFFFFF` | `#131315` | `#FFFFFF` |
| `--c-surface-2` | Superfície 2 (chip estático, esqueleto) | `#24272B` | `#DFDDD4` | `#20385A` | `#E8E0CC` | `#1D1D20` | `#E6E4DD` |
| `--c-border` | Linha decorativa | `#33363B` | `#CAC7BC` | `#31507A` | `#D3C8AE` | `#2E2E33` | `#D3D1C8` |
| `--c-control-border` | Borda de controle (3:1) | `#7C818B` | `#7D7A6E` | `#6A8CBD` | `#857B5F` | `#80808A` | `#7C7A72` |
| `--c-text` | Texto | `#F2F1EC` | `#141517` | `#FFF8EA` | `#172036` | `#F4F3EF` | `#0A0A0B` |
| `--c-text-2` | Texto secundário | `#A9ACB2` | `#54575D` | `#B4C4DC` | `#566178` | `#A9A9B1` | `#55555C` |
| `--c-accent` | Destaque (preenchimento do botão primário) | `#C8F25A` | `#BDEB3A` | `#FF5C82` | `#D8245A` | `#F4F3EF` | `#0A0A0B` |
| `--c-on-accent` | Texto sobre o destaque | `#10140A` | `#141808` | `#1A0A12` | `#FFFFFF` | `#0A0A0B` | `#F3F2EE` |
| `--c-accent-text` | Destaque usado como texto/link | `#C8F25A` | `#3C6200` | `#FF8CA8` | `#C01F52` | `#F4F3EF` | `#0A0A0B` |
| `--c-accent-graph` | Destaque em elementos gráficos (régua, barras, rádio) | `#C8F25A` | `#4F8A00` | `#FF5C82` | `#D8245A` | `#F4F3EF` | `#0A0A0B` |
| `--c-bad-fg` | Erro / "Não venda" / "Falta" (texto) | `#FF8F80` | `#A8221B` | `#FF9DB2` | `#B3173F` | `#FF7468` | `#BE2418` |
| `--c-bad-bg` | Fundo de erro | `#32201E` | `#F6DAD5` | `#3A1A2B` | `#FADDE4` | `#2B1210` | `#FADCD8` |
| `--c-ok-fg` | OK (texto) | `#C8F25A` | `#3C6200` | `#5FE3A8` | `#0B7A4B` | `#F4F3EF` | `#0A0A0B` |
| `--c-ok-bg` | Fundo de OK | `#232B12` | `#E4F0C8` | `#12392F` | `#DDF3E8` | `transparent` | `transparent` |

Notas:
- `--c-control-border` é a borda de campos e botões secundários e foi escolhida para **3:1 contra o fundo e contra a superfície**. `--c-border` é só decorativa.
- Cartaz usa o próprio texto como destaque (`--c-accent` igual a `--c-text`): o contraste do botão primário é o máximo possível.
- **Oficina claro (lima):** lima sobre claro não chega a 3:1. Solução, mantendo a identidade: o preenchimento lima continua `#BDEB3A` mas ganha **contorno de tinta** (`--btn-primary-bd`, `--tag-ok-sh`, `--seg-on-sh`, `--chip-on-bd`, `--sw-on-bd`), e todo elemento gráfico fino (régua, barra do tab ativo, rádio) usa `--c-accent-graph` `#4F8A00`, um verde-lima escuro com 3,5:1 sobre o fundo claro. No escuro, lima puro `#C8F25A` funciona nas duas funções.

### 3.2 Níveis (tiers) e cores de droid

Fundos dos tiles (iguais nos dois modos, o desenho do droid é transparente). Scourge existe no app e conta para qualquer nível; Arco-íris também.

| Token | Oficina | Figurinhas | Cartaz |
|---|---|---|---|
| `--tier-default` (default) | `#747A84` | `#8C97A8` | `#8A8D94` |
| `--tier-gold` (gold) | `#E6B323` | `#FFC531` | `#FFC21A` |
| `--tier-diamond` (diamond) | `#2E78E6` | `#3E8BFF` | `#1F6BFF` |
| `--tier-rainbow` (rainbow) | `linear-gradient(90deg,#E5383B 0.0% 14.29%,#F5A524 14.29% 28.57%,#F7DC3C 28.57% 42.86%,#3DBE6B 42.86% 57.14%,#2E7DF0 57.14% 71.43%,#5B47D6 71.43% 85.71%,#9B4DDB 85.71% 100.0%)` | `linear-gradient(135deg,#FF4D6D,#FFB84D,#FFE45E,#4DD98A,#4DA3FF,#9B6BFF)` | `linear-gradient(135deg,#E5383B 0.0% 14.29%,#F5A524 14.29% 28.57%,#F7DC3C 28.57% 42.86%,#3DBE6B 42.86% 57.14%,#2E7DF0 57.14% 71.43%,#5B47D6 71.43% 85.71%,#9B4DDB 85.71% 100.0%)` |
| `--tier-beskar` (beskar) | `linear-gradient(100deg,#8B9199,#C4C9CF 30%,#9AA0A8 55%,#D0D4D9 80%,#8B9199)` | `linear-gradient(135deg,#9AA5B5,#E3E8EE 45%,#AEB8C6)` | `linear-gradient(135deg,#B9BEC5 0 50%,#8F959D 50% 100%)` |
| `--tier-galactic` (galactic) | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),#4A2BA8` | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),#5A32C8` | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),#5B2FD0` |
| `--tier-stellar` (stellar) | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),linear-gradient(135deg,#F0B93A,#C9811A)` | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),linear-gradient(135deg,#FFD66B,#F2A81D)` | `radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px),#F29A00` |
| `--tier-kyber` (kyber) | `linear-gradient(135deg,#17B07C,#7B47E6 55%,#2B6CF0)` | `linear-gradient(135deg,#1CC98A,#8A4DFF 55%,#2F7BFF)` | `linear-gradient(135deg,#12B886 0 33.3%,#7C3AED 33.3% 66.6%,#2563EB 66.6% 100%)` |
| `--tier-scourge` (scourge) | `#A81B3F` | `linear-gradient(135deg,#B3173F,#6D0F2A)` | `#B80F2E` |

### 3.3 Tipografia

Escala base (todos os temas): corpo 16px/1,4, apoio 14px, rótulo 12px (13px no Figurinhas). O que muda por tema:

| Token | Oficina | Figurinhas | Cartaz |
|---|---|---|---|
| `--title-font` (título da tela: família) | `'Archivo','Archivo Fallback',Arial,Helvetica,sans-serif` | `'Bricolage','Bricolage Fallback',Arial,Helvetica,sans-serif` | `'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif` |
| `--title-size` (título: tamanho) | `32px` | `34px` | `min(84px,21.5vw)` |
| `--title-weight` (título: peso) | `800` | `800` | `900` |
| `--title-case` (título: caixa) | `none` | `none` | `uppercase` |
| `--h2-font` (título de seção: família) | `'Archivo','Archivo Fallback',Arial,Helvetica,sans-serif` | `'Bricolage','Bricolage Fallback',Arial,Helvetica,sans-serif` | `'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif` |
| `--h2-size` (título de seção: tamanho) | `15px` | `21px` | `26px` |
| `--h2-case` (título de seção: caixa) | `uppercase` | `none` | `uppercase` |
| `--label-font` (rótulo: família) | `'Plex Mono','Plex Mono Fallback','Courier New',monospace` | `'Figtree','Figtree Fallback',Arial,Helvetica,sans-serif` | `'Hanken','Hanken Fallback',Arial,Helvetica,sans-serif` |
| `--label-size` (rótulo: tamanho) | `12px` | `13px` | `12px` |
| `--label-case` (rótulo: caixa) | `uppercase` | `none` | `uppercase` |
| `--label-ls` (rótulo: espaçamento) | `.06em` | `.01em` | `.12em` |
| `--meta-font` (linha de meta: família) | `'Plex Mono','Plex Mono Fallback','Courier New',monospace` | `'Figtree','Figtree Fallback',Arial,Helvetica,sans-serif` | `'Hanken','Hanken Fallback',Arial,Helvetica,sans-serif` |
| `--meta-size` (linha de meta: tamanho) | `12px` | `14px` | `12px` |
| `--name-font` (nome de droid: família) | `'Archivo','Archivo Fallback',Arial,Helvetica,sans-serif` | `'Bricolage','Bricolage Fallback',Arial,Helvetica,sans-serif` | `'Hanken','Hanken Fallback',Arial,Helvetica,sans-serif` |
| `--name-size` (nome de droid: tamanho) | `16px` | `17px` | `16px` |
| `--name-weight` (nome de droid: peso) | `700` | `700` | `800` |
| `--btn-font` (botão: família) | `'Archivo','Archivo Fallback',Arial,Helvetica,sans-serif` | `'Bricolage','Bricolage Fallback',Arial,Helvetica,sans-serif` | `'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif` |
| `--btn-size` (botão: tamanho) | `15px` | `17px` | `22px` |
| `--btn-case` (botão: caixa) | `uppercase` | `none` | `uppercase` |
| `--tab-fs` (tab bar: tamanho) | `11px` | `12px` | `15px` |
| `--hrn-size` (hero: número gigante) | `64px` | `48px` | `250px` |
| `--cmn-font` (medidor: número) | `'Archivo','Archivo Fallback',Arial,Helvetica,sans-serif` | `'Bricolage','Bricolage Fallback',Arial,Helvetica,sans-serif` | `'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif` |
| `--cm-num-size` (medidor: tamanho do número) | `40px` | `36px` | `72px` |

### 3.4 Formas, bordas, elevação, ícones, medidas

| Token | Oficina | Figurinhas | Cartaz |
|---|---|---|---|
| `--r-control` (campo e controle) | `4px` | `16px` | `0` |
| `--r-card` (card) | `4px` | `18px` | `0` |
| `--r-chip` (chip) | `4px` | `999px` | `0` |
| `--r-sheet` (sheet (topo)) | `10px` | `30px` | `0` |
| `--r-modal` (modal) | `6px` | `28px` | `0` |
| `--btn-r` (botão) | `4px` | `18px` | `0` |
| `--bw` (espessura de borda) | `1.5px` | `2px` | `2px` |
| `--btn-bw` (borda do botão) | `2px` | `2px` | `3px` |
| `--btn-sh` (sombra do botão) | `none` | `0 4px 0 rgba(0,0,0,.32)` | `none` |
| `--row-sh` (sombra de linha/card) | `none` | `0 3px 0 var(--c-border)` | `none` |
| `--elev-pop` (elevação do sheet) | `0 -8px 0 rgba(0,0,0,.25)` | `0 -6px 0 rgba(0,0,0,.3)` | `none` |
| `--modal-sh` (elevação do modal) | `0 10px 0 rgba(0,0,0,.35)` | `0 8px 0 rgba(0,0,0,.35)` | `none` |
| `--ic-sw` (traço do ícone) | `2` | `2.4` | `2.4` |
| `--ic-cap` (ponta do ícone) | `square` | `round` | `square` |
| `--ic-join` (junção do ícone) | `miter` | `round` | `miter` |
| `--tile-r` (raio do tile de droid) | `4px` | `18px` | `0` |
| `--tile-pad` (moldura do tile) | `0px` | `5px` | `0px` |
| `--tile-sh` (sombra do tile) | `none` | `0 3px 0 rgba(0,0,0,.28)` | `none` |
| `--btn-h` (altura do botão) | `52px` | `54px` | `56px` |
| `--field-h` (altura do campo) | `52px` | `54px` | `54px` |
| `--row-h` (altura mínima de linha) | `60px` | `64px` | `60px` |
| `--tab-h` (altura da tab bar) | `64px` | `68px` | `64px` |

Espaçamento (igual): `--sp-1 4px`, `--sp-2 8px`, `--sp-3 12px`, `--sp-4 16px`, `--sp-5 20px`, `--sp-6 24px`, `--sp-8 32px`, margem de página `16px`. Movimento: `--dur-1 120ms`, `--dur-2 220ms`, `--ease cubic-bezier(.2,.7,.2,1)`. Camadas: tabbar 10, toast 15, scrim 20, sheet 30, modal 40. Alvo mínimo de toque `--tap 44px`.

### 3.5 Pontos de assinatura (variantes do mesmo componente)

| Token | Oficina | Figurinhas | Cartaz |
|---|---|---|---|
| `--tile-frame` (tile: moldura) | `transparent` | `#FFFFFF` | `transparent` |
| `--tnum-bg` (tile: placa do índice) | `rgba(10,10,12,.78)` | `#FFFFFF` | `transparent` |
| `--tnum-fs` (tile: tamanho do índice) | `12px` | `11px` | `38cqw` |
| `--img-b` (tile: base do desenho) | `8%` | `7%` | `0%` |
| `--img-filter` (tile: contorno do desenho) | `none` | `drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff) drop-shadow(0 2px 2px rgba(0,0,0,.22))` | `none` |
| `--slot-bd` (vaga vazia: borda) | `1.5px dashed var(--c-control-border)` | `2.5px dashed var(--c-control-border)` | `2px solid var(--c-control-border)` |
| `--slot-q-display` (vaga vazia: mostra "?") | `none` | `block` | `none` |
| `--hr-dir` (hero: direção) | `row` | `column` | `column` |
| `--hrn-size` (hero: número) | `64px` | `48px` | `250px` |
| `--hrn-prefix` (hero: prefixo do número) | `"#"` | `"#"` | `""` |
| `--trio-mt` (hero: sobreposição do trio) | `12px` | `6px` | `-40px` |
| `--cm-cells-display` (medidor: mostra células) | `grid` | `grid` | `grid` |
| `--cm-cols` (medidor: colunas) | `40` | `8` | `40` |
| `--cell-w` (medidor: largura da célula) | `2px` | `100%` | `100%` |
| `--cell-h` (medidor: altura da célula) | `12px` | `22px` | `16px` |
| `--cm-marks-display` (medidor: mostra marcas 10/20/30/40) | `block` | `none` | `none` |
| `--head-areas` (cabeçalho: áreas) | `"title aside"` | `"title aside"` | `"brand aside" "title title"` |
| `--brand-display` (cabeçalho: marca) | `none` | `none` | `flex` |
| `--tab-pill-bg` (tab ativa: pílula) | `transparent` | `var(--c-accent)` | `transparent` |
| `--tab-bar-h` (tab ativa: barra superior) | `4px` | `0px` | `0px` |
| `--tab-on-bg` (tab ativa: bloco) | `transparent` | `transparent` | `var(--c-text)` |
| `--sheet-title-align` (sheet: alinhamento do nome) | `left` | `center` | `left` |
| `--sheet-tier-display` (sheet: nível ao lado do nome) | `none` | `none` | `block` |

Como cada assinatura funciona **sem marcação própria**:

- **Tile de droid.** Oficina: campo de cor chapado com placa mono do índice no canto. Figurinhas: moldura branca com raio grande, contorno branco no desenho (cinco `drop-shadow` empilhados) e base do desenho 7% acima da borda para "sair" da figurinha; brilho estático diagonal em Ouro, Beskar, Estelar, Kyber e Scourge; vaga vazia tracejada com silhueta e "?". Cartaz: bloco de cor sem moldura com o índice gigante translúcido atrás do desenho (usa `cqw`, então escala com o tamanho do tile). O índice é decorativo (`aria-hidden`).
- **Hero.** O mesmo `h2.hr-kicker` + `span.hr-num`. Oficina: kicker e número lado a lado. Figurinhas: kicker em cima, "#30" abaixo. Cartaz: numeral de 250px com o trio sobrepondo a base (`--trio-mt`), e o texto acessível do número continua em `aria-label`.
- **Medidor.** Mesmas 40 `<i>`. Oficina: régua com tique a cada 2px, tique mais alto de 5 em 5, marcador do Renascimento atual e marcas 10/20/30/40. Figurinhas: 8 colunas por 5 linhas (páginas de álbum), vazias tracejadas. Cartaz: 40 barras. O que muda é `--cm-cols`, `--cell-*` e `--cm-marks-display`.
- **Cabeçalho.** Mesmo `.top`; só `--head-areas` muda ("title aside" ou "brand aside / title title").

### 3.6 Regras de paridade (não negociáveis)

1. Mesma informação, na mesma ordem de leitura, nos três temas e nos dois modos.
2. Mesmos alvos de toque (mínimo 44px), mesmas áreas clicáveis, mesmo comportamento.
3. Em Progresso, `+` e `x` só adicionam e removem. A ficha do droid só abre ao tocar no droid.
4. Nomes de droid sempre inteiros (quebram de linha, nunca cortam, nunca reticências).
5. Contraste AA: 4,5:1 para texto normal, 3:1 para texto grande e para bordas e preenchimentos de controles.
6. Toast nunca cobre conteúdo nem botões.
7. Sem vidro nem blur, sem estilo iOS, sem laranja como identidade, sem HUD ou neon. Texto sem travessão e sem setas.

---

## 4. Fontes

| Tema | Arquivos baixados (só quando o tema está ativo) | Peso aprox. |
|---|---|---|
| Oficina | `archivo-var.woff2` (Archivo, variável: peso 100 a 900 e largura 62 a 125) 88 KB, `plex-mono-500.woff2` 15 KB, `plex-mono-400.woff2` 14 KB | 117 KB |
| Figurinhas | `bricolage-var.woff2` (Bricolage Grotesque, variável) 76 KB, `figtree-var.woff2` (Figtree, variável) 20 KB | 96 KB |
| Cartaz | `big-shoulders-900.woff2` 14 KB, `big-shoulders-800.woff2` 14 KB, `hanken-var.woff2` (Hanken Grotesk, variável) 34 KB | 62 KB |


**Estratégia: carrega só o do tema ativo, sem piscar.**

1. `css/fonts.css` declara todos os `@font-face` com `font-display: swap`. O navegador só baixa uma face quando alguma família dela aparece em texto renderizado. Como cada tema só referencia suas famílias, **quem usa Oficina não baixa Bricolage, Figtree, Big Shoulders nem Hanken**.
2. O script do `<head>` faz `<link rel=preload as=font type=font/woff2 crossorigin>` só dos arquivos do tema escolhido, para a fonte chegar junto do primeiro render (no PWA, depois do primeiro acesso, vem do cache do service worker).
3. **Fallback sem salto de layout:** cada pilha termina em uma face local com métricas ajustadas (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`), calculadas contra a largura de uma amostra real em pt-BR. Assim a troca de fallback para fonte final quase não move nada.

```css
@font-face{font-family:'Archivo Fallback';src:local('Arial');size-adjust:98.2%;ascent-override:89.4%;descent-override:21.4%;line-gap-override:0.0%}
@font-face{font-family:'Plex Mono Fallback';src:local('Courier New');size-adjust:100.0%;ascent-override:102.5%;descent-override:27.5%;line-gap-override:0.0%}
@font-face{font-family:'Bricolage Fallback';src:local('Arial');size-adjust:93.5%;ascent-override:99.5%;descent-override:28.9%;line-gap-override:0.0%}
@font-face{font-family:'Figtree Fallback';src:local('Arial');size-adjust:102.4%;ascent-override:92.8%;descent-override:24.4%;line-gap-override:0.0%}
@font-face{font-family:'Big Shoulders Fallback';src:local('Arial Narrow');size-adjust:140.9%;ascent-override:69.8%;descent-override:15.1%;line-gap-override:0.0%}
@font-face{font-family:'Hanken Fallback';src:local('Arial');size-adjust:101.5%;ascent-override:98.6%;descent-override:29.9%;line-gap-override:0.0%}
```

4. Ao trocar de tema com o app aberto, os arquivos do novo tema são buscados na hora (poucos KB) e o `swap` cobre o intervalo com o fallback ajustado. O seletor pode chamar `document.fonts.load('800 20px "Bricolage"')` ao focar o card para aquecer o cache.
5. Todos os arquivos são subset `latin` (cobre pt-BR). Incluir os arquivos no precache do service worker **por tema**, para não pesar a instalação inicial (Oficina entra no precache; os outros dois entram em runtime cache ao escolher).
6. Big Shoulders cai em `Arial Narrow` (se existir no aparelho) ou `Impact` no fallback; é o único fallback aproximado, por ser uma fonte condensada. Como ela só aparece quando o tema Cartaz está ativo, o impacto é pequeno.

---

## 5. Seletor de tema

### 5.1 Ajustes, Aparência

Entrada: em **Ajustes**, a primeira seção "Aparência" tem a linha **Tema e modo** (subtítulo mostra a escolha atual, por exemplo "Oficina, seguir o sistema") que abre a tela **Aparência**. Mock: `html/ajustes.html` e `html/ajustes-aparencia.html`.

Tela Aparência (pt-BR, sem travessão, sem setas):

- Título: **Aparência**. Voltar: **Ajustes**.
- Seção **Tema** (radiogroup). Três cards, cada um com **pré-visualização real** (tile de droid, medidor e botão renderizados com os componentes do próprio tema, no modo atual) e nome + frase:
  - **Oficina**: "Plaquinhas, régua e linhas finas. Direto e técnico." (padrão, pré-selecionado)
  - **Figurinhas**: "Álbum de figurinhas: cantos redondos e cores vivas."
  - **Cartaz**: "Números gigantes, preto e branco, sem cantos."
- Seção **Modo**: controle segmentado **Sistema | Claro | Escuro**, com a dica "Sistema segue o modo claro ou escuro do aparelho."
- Comportamento: a escolha **aplica na hora** (sem botão Salvar) e persiste em `localStorage` (`dd-theme`, `dd-mode`). Toast opcional "Tema Figurinhas aplicado" com **Desfazer**. Foco mantido no card escolhido. O card é `role=radio` com `aria-checked`.
- A pré-visualização mostra o tema **no modo atual** (se o modo for Sistema, o resolvido).

### 5.2 Onboarding

Passo novo, **entre "Onde você está neste Ciclo?" e o final**. Mock: `html/onb-4-tema.html`. Fluxo total: 1 Ciclo, 2 Progresso, 3 **Tema (novo)**, 4 O que você ganha.

- Título: **Escolha o visual**. Apoio: "Você pode mudar depois em Ajustes, Aparência."
- Os mesmos 3 cards (Oficina pré-selecionada) e o mesmo controle Sistema | Claro | Escuro (Sistema pré-selecionado).
- Botões: **Continuar** (primário), **Voltar**, **Pular**. Pular mantém Oficina com Sistema, sem perguntar de novo.
- A escolha aplica na hora, então o resto do onboarding já aparece no tema escolhido.
- Para quem já completou o onboarding, nada muda: continua Oficina até a pessoa abrir Aparência. **Não** reabrir o onboarding por causa do tema.

---

## 6. Telas e estados cobertos (28)

`inicio`, `progresso-foco`, `progresso-lista`, `progresso-super`, `toast-desfazer`, `inventario-grade`, `inventario-lista`, `sheet-droid`, `modal-remover`, `vender`, `ciclos`, `modal-trocar-ciclo`, `modal-super-renascimento`, `mais`, `droiddex`, `fusao`, `ajustes`, `ajustes-aparencia`, `onb-1-boas-vindas`, `onb-2-ciclo`, `onb-3-progresso`, `onb-4-tema`, `onb-5-pronto`, `vazio-inventario`, `vazio-vender`, `skeleton-inicio`, `skeleton-inventario`, `componentes` (folha completa: cores, tipografia, botões, campos, tags, 9 níveis, vaga vazia, quantidade, hero, medidor, sheet, modal, toast, tab bar, vazio e esqueleto, ícones).

Os dados nos mocks são os do app (Ciclo 5, Renascimento #30 com R7 Galáctico, LEP Beskar e CYCLENS Galáctico; créditos 100T; receitas de fusão e regras reais do `data.json`). Droids sem imagem local aparecem como vaga com silhueta.

Prints: `prints/<tema>/<modo>/<tela>.png` e pranchas `prints/comparativo/<tela>.png`.

---

## 7. Notas de implementação para o Dev

1. **Ordem sugerida:** (a) importar `fonts.css`, `tokens.css`, `components.css`; (b) adicionar o script do `<head>` e o hook `useAppearance`; (c) migrar telas, uma a uma, trocando classes antigas pelas `.btn`, `.item`, `.dtile` etc.; (d) construir Ajustes, Aparência e o passo do onboarding; (e) rodar `validar.py` adaptado contra o app real.
2. **Não escrever condicional de tema em CSS de componente.** Se precisar de uma diferença nova, crie um token em `gen_tokens.py` com valor nos 3 temas.
3. **Os tokens são gerados**: editar `tools/gen_tokens.py`, rodar, commitar o `tokens.css`. Um verificador no final do script falha se algum `var(--x)` usado nos componentes não estiver definido nos 3 temas.
4. Requisitos de navegador: `:has()` (marcar rádio selecionado), `cqw` (índice do Cartaz), `font-variation-settings`, `size-adjust`. Todos existem no Safari 16+, Chrome 105+ e Firefox 121+. Para versões mais antigas, o índice gigante do Cartaz cai num tamanho fixo e o rádio selecionado perde só o realce de linha (continua com o ponto).
5. Strings com aspas em tokens de conteúdo (`--hrn-prefix: "#"`) precisam das aspas literais no CSS.
6. Imagens dos droids: `object-fit: contain`, `alt=""` quando o nome está ao lado (já é o caso), tamanho 128px basta nos tiles; na ficha usar a de 512px se existir.
7. Respeitar `prefers-reduced-motion`: o esqueleto já para a animação; nenhuma outra animação é necessária.
8. Segurança de layout: usar `min-width:0` em filhos de grid e flex que contenham texto (já aplicado), para nome longo quebrar em vez de estourar.
9. Teste: abrir `viewer.html`, escolher tema, modo e tela. `tools/capture.py` regenera todos os prints e `tools/validar.py` a validação (ver `validacao.md`).
