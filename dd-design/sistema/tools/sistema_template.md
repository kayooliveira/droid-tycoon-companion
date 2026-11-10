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
- **`<meta name="theme-color">`** deve acompanhar o fundo da combinação ativa, para a barra do navegador e a splash do PWA não destoarem. Valores de `--c-bg` (Oficina escuro, Oficina claro, Figurinhas escuro, Figurinhas claro, Cartaz escuro, Cartaz claro): {{METATHEME}}.
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

{{CORES}}

Notas:
- `--c-control-border` é a borda de campos e botões secundários e foi escolhida para **3:1 contra o fundo e contra a superfície**. `--c-border` é só decorativa.
- Cartaz usa o próprio texto como destaque (`--c-accent` igual a `--c-text`): o contraste do botão primário é o máximo possível.
- **Oficina claro (lima):** lima sobre claro não chega a 3:1. Solução, mantendo a identidade: o preenchimento lima continua `#BDEB3A` mas ganha **contorno de tinta** (`--btn-primary-bd`, `--tag-ok-sh`, `--seg-on-sh`, `--chip-on-bd`, `--sw-on-bd`), e todo elemento gráfico fino (régua, barra do tab ativo, rádio) usa `--c-accent-graph` `#4F8A00`, um verde-lima escuro com 3,5:1 sobre o fundo claro. No escuro, lima puro `#C8F25A` funciona nas duas funções.

### 3.2 Níveis (tiers) e cores de droid

Fundos dos tiles (iguais nos dois modos, o desenho do droid é transparente). Scourge existe no app e conta para qualquer nível; Arco-íris também.

{{TIERS}}

### 3.3 Tipografia

Escala base (todos os temas): corpo 16px/1,4, apoio 14px, rótulo 12px (13px no Figurinhas). O que muda por tema:

{{TIPO}}

### 3.4 Formas, bordas, elevação, ícones, medidas

{{FORMA}}

Espaçamento (igual): `--sp-1 4px`, `--sp-2 8px`, `--sp-3 12px`, `--sp-4 16px`, `--sp-5 20px`, `--sp-6 24px`, `--sp-8 32px`, margem de página `16px`. Movimento: `--dur-1 120ms`, `--dur-2 220ms`, `--ease cubic-bezier(.2,.7,.2,1)`. Camadas: tabbar 10, toast 15, scrim 20, sheet 30, modal 40. Alvo mínimo de toque `--tap 44px`.

### 3.5 Pontos de assinatura (variantes do mesmo componente)

{{ASSINATURA}}

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

{{FONTES}}

**Estratégia: carrega só o do tema ativo, sem piscar.**

1. `css/fonts.css` declara todos os `@font-face` com `font-display: swap`. O navegador só baixa uma face quando alguma família dela aparece em texto renderizado. Como cada tema só referencia suas famílias, **quem usa Oficina não baixa Bricolage, Figtree, Big Shoulders nem Hanken**.
2. O script do `<head>` faz `<link rel=preload as=font type=font/woff2 crossorigin>` só dos arquivos do tema escolhido, para a fonte chegar junto do primeiro render (no PWA, depois do primeiro acesso, vem do cache do service worker).
3. **Fallback sem salto de layout:** cada pilha termina em uma face local com métricas ajustadas (`size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`), calculadas contra a largura de uma amostra real em pt-BR. Assim a troca de fallback para fonte final quase não move nada.

```css
{{FALLBACKS}}
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
