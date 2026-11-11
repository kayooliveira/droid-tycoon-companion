import json,collections
ROOT='/workspace/dd-design/sistema'
R=[]
for t in ['oficina','figurinhas','cartaz']: R+=json.load(open(f'{ROOT}/tools/_resultado_{t}.json'))
tot=collections.Counter(); fc=collections.Counter(); per=collections.defaultdict(lambda:[0,0,0])
for r in R:
    for k,v in r['n'].items(): tot[k]+=v
    per[r['theme']][0]+=1; per[r['theme']][1]+=sum(r['n'].values()); per[r['theme']][2]+=len(r['fails'])
    for c,_ in r['fails']: fc[c]+=1
T=sum(tot.values()); F=sum(fc.values())
OLD28={'inicio','skeleton-inicio','progresso-foco','toast-desfazer','progresso-lista','progresso-super','inventario-grade','inventario-lista','vender','ciclos','mais','droiddex','fusao','ajustes','ajustes-aparencia','sheet-droid','modal-super-renascimento','modal-trocar-ciclo','modal-remover','onb-1-boas-vindas','onb-2-ciclo','onb-3-progresso','onb-4-tema','onb-5-pronto','vazio-inventario','vazio-vender','skeleton-inventario','componentes'}
NSCR=len({r['screen'] for r in R})
newr=[r for r in R if r['screen'] not in OLD28]
NEWS=sorted({r['screen'] for r in newr})
ntot=collections.Counter(); nf=0
for r in newr:
    for k,v in r['n'].items(): ntot[k]+=v
    nf+=len(r['fails'])
REF=[r for r in R if r['screen'] in OLD28]
fmt=lambda n: f'{n:,}'.replace(',','.')
names={'overflow':'Sem overflow horizontal (scrollWidth e caixas de todos os elementos e de todo texto)','toque':'Alvo de toque maior ou igual a 44px (largura e altura)','input16':'Campo de texto com fonte maior ou igual a 16px','corte':'Texto e nome de droid sem corte (sem reticências, sem overflow oculto, sem line-clamp)','toast':'Toast sem sobrepor botão, texto ou conteúdo interativo','contraste_texto':'Contraste AA de texto medido em pixels (4,5:1 normal, 3:1 grande)','contraste_controle':'Contraste de borda ou preenchimento de controle (3:1)','contraste_grafico':'Contraste da régua, barras e páginas do medidor (3:1)','fontes':'Fonte do tema carregada (sem cair no fallback)'}
order=['overflow','toque','input16','corte','toast','contraste_texto','contraste_controle','contraste_grafico','fontes']
md=f'''# Validação automática: DroidDeck, 3 temas x 2 modos

Gerado por `tools/validar.py` (Playwright + Chrome, viewport 390 e 360, 1x, movimento reduzido). Rodar de novo: `python3 tools/validar.py && python3 tools/resumo.py && python3 tools/gen_validacao.py`.

## Resultado final

**{fmt(T)} checagens em {len(R)} páginas ({NSCR} telas x 6 combinações x 2 larguras). {F} falhas na versão final.**
Falhas encontradas durante o trabalho e corrigidas estão na seção "O que a validação achou e o que foi corrigido".

| Checagem | Quantidade | Falhas finais |
|---|---:|---:|
'''
for k in order: md+=f'| {names[k]} | {fmt(tot[k])} | {fc[k]} |\n'
md+='\n| Tema | Páginas | Checagens | Falhas |\n|---|---:|---:|---:|\n'
for t in ['oficina','figurinhas','cartaz']: md+=f'| {t} | {per[t][0]} | {fmt(per[t][1])} | {per[t][2]} |\n'
md+='''
Cobertura: todas as telas, modais, sheets, toasts, banners e estados listados em `sistema.md` (seção 6) e `auditoria/inventario.md`, nos 3 temas, nos 2 modos, em 390 e 360px.

## Como cada checagem é feita

- **Overflow:** `scrollWidth` maior que a largura da janela falha; além disso, cada elemento visível e cada linha de texto (via `Range.getClientRects`) precisa caber em `[0, largura]`.
- **Alvo de toque:** todo `a[href]`, `button`, `[role=button|radio]`, `label.opt`, `label.switch-row`, `input` de texto e `range`, `.sel`, `.chip` e a área do `input` do switch precisa ter largura e altura maiores ou iguais a 44px (43,5 com tolerância de arredondamento).
- **Input maior ou igual a 16px:** `font-size` calculado de todo `input` de texto, busca e número (evita o zoom do iOS).
- **Texto e nomes sem corte:** nenhum `text-overflow: ellipsis`, nenhum `line-clamp`, e a caixa de cada linha de texto precisa ficar dentro de todo ancestral com `overflow` diferente de `visible` (menos o shell da tela). Todos os `.dname` (nomes de droid), títulos, botões, tags e toasts entram. Nomes longos como "Util-Tec (Ulti-Tech)" quebram de linha em vez de cortar.
- **Toast:** o retângulo de cada `.toast` não pode se intersectar com nenhum botão, link, input, nome ou texto da tela. O toast fica em um slot **em fluxo** acima da tab bar, então a garantia é estrutural. O teste de sanidade (abaixo) prova que a checagem detecta um toast sobreposto.
- **Contraste de texto (AA):** o script tira um segundo screenshot **com todo texto e ícone transparente** e mede, para cada linha de texto visível, a cor de fundo realmente renderizada (mediana e também os pixels mais claros e escuros da área, o pior caso vale). A cor do texto vem do estilo calculado (com `opacity`). Limite: 4,5:1, ou 3:1 para texto grande (maior ou igual a 24px, ou maior ou igual a 18,66px em negrito). Placeholders entram. Ficam de fora: desabilitados, `aria-hidden`, texto sob o scrim (coberto por sheet ou modal) e os índices decorativos dos tiles.
- **Contraste de controles (3:1):** para botões (menos o de texto), campos, `.sel`, chips, trilho do switch, bolinha do rádio, cards de tema e controle segmentado, compara os pixels da borda ou do preenchimento com os pixels logo fora do controle. Vale o melhor entre borda e preenchimento.
- **Régua, barras e páginas do medidor:** mesma ideia aplicada a cada célula das 40 (feita, atual, pendente), mesmo sendo decorativa.
- **Fontes:** `document.fonts.check` para cada família e peso realmente usados na tela.

### Teste de sanidade do validador

`tools/teste_validador.py` injeta uma falha conhecida de cada tipo (botão de 30px, caixa de 420px, campo de 13px, texto cinza claro, borda de controle invisível, nome com reticências, toast fixo sobre o conteúdo, régua sem contraste) e confirma que a checagem correspondente falha. Resultado da última execução:

```
'''
md+=open('/tmp/teste.txt').read() if __import__('os').path.exists('/tmp/teste.txt') else ''
md+='''```

## O que a validação achou e o que foi corrigido

| # | Achado | Onde | Correção |
|---|---|---|---|
| 1 | **Toast cobrindo botões a 360px** (problema conhecido, Figurinhas e Cartaz, tela Progresso) | Progresso | Toast agora vive em um slot **em fluxo** (`.toast-slot`) acima da tab bar: o conteúdo rola, o toast nunca cobre nada. Verificado nas 6 combinações a 390 e 360 (36 checagens de toast, 0 sobreposições). A mensagem completa "R7 adicionado ao Renascimento #30" quebra em duas linhas, sem cortar. |
| 2 | **Lima da Oficina no claro** (régua e chips lima abaixo de 3:1 sobre `#ECEBE6`, cerca de 1,1:1) | Régua, tags, chips, botão primário, switch, seg | No claro, o preenchimento lima mantém a identidade mas ganha **contorno de tinta** (`#141517`, 1,5 a 2px), e os elementos finos usam `--c-accent-graph` `#4F8A00` (3,5:1). No escuro o lima puro já passa. Medido: 0 falhas em controles e régua. |
| 3 | Controle segmentado do Figurinhas com borda invisível (fundo `surface-2` contra o fundo da tela, 1,13 a 1,45:1) | Progresso, Inventário, Aparência, onboarding | Borda de 2px `--c-control-border` e fundo de superfície nos dois modos. |
| 4 | Overflow horizontal de 2px a 360px na Oficina (botões Exportar e Importar lado a lado) | Ajustes | `min-width:0` nos filhos de `.grid2`, `.grid3`, `.modal-act` e `.btn`, para o texto quebrar em vez de estourar. |
| 5 | Cartaz: tab bar com rótulos encostando ("PROGRESSO INVENTÁRIO") | Todas as telas com tab bar | Rótulo da tab de 17px para 15px e espaçamento menor. |
| 6 | Cartaz: numeral gigante do hero sobreposto demais pelo trio | Início | Sobreposição de 48px para 40px e margem acima do hero. |
| 7 | Cards de tema com pré-visualização muito alta no Figurinhas (medidor de 40 páginas) | Aparência, onboarding | Pré-visualização usa um medidor reduzido (20 células) e as mesmas cores e formas do tema. |
| 8 | Receitas de Fusão quebravam linha no Figurinhas | Fusão | Tiles de 48px, linha sem quebra. |
| 9 | Esqueleto do Cartaz com número sobreposto ao trio | Início carregando | Margem própria no esqueleto. |
| 10 | Falsos positivos do próprio validador (corrigidos no script, não no design): amostragem de borda pegando o preenchimento; fonte "não carregada" quando o tema não usa aquele peso na tela; régua sob o scrim de modal; contraste do numeral do Cartaz medido na parte coberta pelos tiles | `validar.py` | Amostragem pega o melhor entre borda e preenchimento; verifica só famílias em uso; ignora o que está sob o scrim; mede só a parte visível do numeral (a parte coberta é sobreposição intencional do design). |
| 11 | **Fase 3, validador quebrava** (`IndexError`) em chip fora da janela dentro de lista que rola na horizontal (filtros do Inventário) | `tools/validar.py` | Medição de pixel ignora o que está fora da imagem; elemento cortado por contêiner com rolagem horizontal própria (`.chips--scroll`) deixa de contar como overflow ou texto cortado. A página em si continua sem rolagem horizontal (checado por `scrollWidth`). |
| 12 | **Fase 3, Cartaz a 360px:** título do modal "Super Renascimento?" (40px) com botão fechar passava 13px da tela | `modal-super-renascimento` e todos os modais com título e fechar | `--mt-size` do Cartaz `min(40px, 9.4vw)`, título com `min-width:0` e `overflow-wrap:anywhere`. |
| 13 | **Fase 3:** no detalhe do Droiddex o tile em tamanho grande ocupava a linha e escondia as etiquetas (texto 1,15:1 de contraste) | `droiddex-detalhe` | Tile em caixa de 96px, etiquetas ao lado. |
| 14 | **Fase 3:** linhas ad hoc com tile pequeno sem largura fixa empurravam o texto para fora da tela (386px de 390) | `progresso-busca`, `progresso-busca-nunca` | Tile em caixa de largura `--item-tile`, `flex:none`. |

Na primeira rodada completa da fase 3 (antes das correções 11 a 14): 684 páginas, 90 com falha, 902 falhas (566 de overflow e 312 de corte, todas de chips em rolagem horizontal ou das linhas dos itens 13 e 14; 12 de contraste de controle e 12 de contraste de texto, nos mesmos casos). Depois das correções: 0.

## Itens verificados manualmente (leitura dos prints)

Lidos com a ferramenta de imagem, nos 3 temas e nos dois modos: Início, Progresso (Foco), sheet de droid, modal de Super Renascimento, Aparência, onboarding de tema, Fusão, esqueleto do Início, folha de componentes (as 3 colunas de seções de cada combinação) e Inventário (grade). Também a 360px: Progresso com toast, Início, Inventário em lista e sheet, nas 6 combinações (`prints/_360/`).

## Limites e pendências (honestidade)

1. A validação automática roda em **Chromium**. Falta conferir em **Safari iOS** e **Firefox** em aparelho real (principalmente `:has()`, `cqw`, `font-variation-settings` e o `<input type=range>` estilizado). Os requisitos mínimos de navegador estão em `sistema.md`.
2. Os mocks usam dados e imagens do app, mas só existem 35 imagens locais de droid. Droids sem imagem (por exemplo AMP-Walker, Snow-Mouse, resultados de Fusão) aparecem como **vaga com silhueta**. No app real todos terão imagem.
3. Contraste de texto sobre os tiles coloridos não é medido (só há texto decorativo ali: o índice do nível, `aria-hidden`). A quantidade `×2` do tile **é** medida. A placa do índice da Oficina e da Figurinhas tem contraste alto por construção (branco sobre quase preto, escuro sobre branco).
4. A checagem de toast é estrutural (slot em fluxo). Se alguém reposicionar o toast com `position:fixed`, a checagem pega, como mostra o teste de sanidade.
5. Big Shoulders (Cartaz) usa fallback aproximado (`Arial Narrow` ou `Impact`), porque não existe fonte do sistema com métricas parecidas. Só afeta o instante antes da fonte chegar.
6. O seletor de tema e o hook `useAppearance` são especificados mas **não implementados** no app (decisão do Kayo: primeiro aprovar).
'''
md+=f'''
## Fase 3: telas novas e refeitas (auditoria de cobertura)

Auditoria contra o código do app em `auditoria/inventario.md`. Das {NSCR} telas, **{len(NEWS)} são novas** (não existiam na fase 2) e **15 foram refeitas** para bater com o código real (`inicio`, `progresso-super`, `toast-desfazer`, `inventario-grade`, `inventario-lista`, `sheet-droid`, `vender`, `ciclos`, `mais`, `droiddex`, `fusao`, `ajustes`, `onb-5-pronto`, `modal-super-renascimento`, `modal-trocar-ciclo`). Três slugs antigos saíram (`progresso-foco`, `progresso-lista`, `modal-remover`) porque o código não tem abas Foco e Lista e a confirmação de remover é um sheet.

**Resultado nas telas novas ({len(NEWS)} telas x 6 combinações x 2 larguras = {len(newr)} páginas):** {fmt(sum(ntot.values()))} checagens, **{nf} falhas**.

| Checagem (telas novas) | Quantidade |
|---|---:|
'''
for k in order: md+=f'| {names[k]} | {fmt(ntot[k])} |\n'
md+=f'''
Telas novas: {', '.join('`'+x+'`' for x in NEWS)}.

Observação sobre a contagem: com o ajuste do validador (item 11), a contagem de checagens de overflow e corte ficou menor que nas fases anteriores porque itens dentro de listas com rolagem horizontal própria deixaram de ser contados. Nenhuma checagem foi relaxada para o resto da tela.
'''
open(f'{ROOT}/validacao.md','w').write(md); print(len(md))
