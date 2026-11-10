import sys,os,re,json
sys.path.insert(0,os.path.dirname(__file__))
import io,contextlib
with contextlib.redirect_stdout(io.StringIO()):
    import gen_tokens as G
ROOT='/workspace/dd-design/sistema'
def V(theme,dark):
    v={**G.theme_vars(theme,dark),**G.extra(theme,dark)}; return v
rows_colors=[('--c-bg','Fundo da tela'),('--c-surface','Superfície (painel, campo, sheet)'),('--c-surface-2','Superfície 2 (chip estático, esqueleto)'),('--c-border','Linha decorativa'),('--c-control-border','Borda de controle (3:1)'),
 ('--c-text','Texto'),('--c-text-2','Texto secundário'),('--c-accent','Destaque (preenchimento do botão primário)'),('--c-on-accent','Texto sobre o destaque'),('--c-accent-text','Destaque usado como texto/link'),('--c-accent-graph','Destaque em elementos gráficos (régua, barras, rádio)'),
 ('--c-bad-fg','Erro / "Não venda" / "Falta" (texto)'),('--c-bad-bg','Fundo de erro'),('--c-ok-fg','OK (texto)'),('--c-ok-bg','Fundo de OK')]
def cell(k):
    out=[]
    for t in ['oficina','figurinhas','cartaz']:
        for d in (True,False):
            out.append('`'+V(t,d)[k]+'`')
    return ' | '.join(out)
tab='| Token | Uso | Oficina escuro | Oficina claro | Figurinhas escuro | Figurinhas claro | Cartaz escuro | Cartaz claro |\n|---|---|---|---|---|---|---|---|\n'
tab+='\n'.join(f'| `{k}` | {u} | {cell(k)} |' for k,u in rows_colors)
def tv(k): return ' | '.join('`'+V(t,True)[k].replace('|','\\|')+'`' for t in ['oficina','figurinhas','cartaz'])
def tvl(rows,header='Token | Oficina | Figurinhas | Cartaz'):
    return '| '+header+' |\n|---|---|---|---|\n'+'\n'.join(f'| `{k}` ({u}) | {tv(k)} |' for k,u in rows)
type_rows=[('--title-font','título da tela: família'),('--title-size','título: tamanho'),('--title-weight','título: peso'),('--title-case','título: caixa'),('--h2-font','título de seção: família'),('--h2-size','título de seção: tamanho'),('--h2-case','título de seção: caixa'),('--label-font','rótulo: família'),('--label-size','rótulo: tamanho'),('--label-case','rótulo: caixa'),('--label-ls','rótulo: espaçamento'),('--meta-font','linha de meta: família'),('--meta-size','linha de meta: tamanho'),('--name-font','nome de droid: família'),('--name-size','nome de droid: tamanho'),('--name-weight','nome de droid: peso'),('--btn-font','botão: família'),('--btn-size','botão: tamanho'),('--btn-case','botão: caixa'),('--tab-fs','tab bar: tamanho'),('--hrn-size','hero: número gigante'),('--cmn-font','medidor: número'),('--cm-num-size','medidor: tamanho do número')]
shape_rows=[('--r-control','campo e controle'),('--r-card','card'),('--r-chip','chip'),('--r-sheet','sheet (topo)'),('--r-modal','modal'),('--btn-r','botão'),('--bw','espessura de borda'),('--btn-bw','borda do botão'),('--btn-sh','sombra do botão'),('--row-sh','sombra de linha/card'),('--elev-pop','elevação do sheet'),('--modal-sh','elevação do modal'),('--ic-sw','traço do ícone'),('--ic-cap','ponta do ícone'),('--ic-join','junção do ícone'),('--tile-r','raio do tile de droid'),('--tile-pad','moldura do tile'),('--tile-sh','sombra do tile'),('--btn-h','altura do botão'),('--field-h','altura do campo'),('--row-h','altura mínima de linha'),('--tab-h','altura da tab bar')]
sig_rows=[('--tile-frame','tile: moldura'),('--tnum-bg','tile: placa do índice'),('--tnum-fs','tile: tamanho do índice'),('--img-b','tile: base do desenho'),('--img-filter','tile: contorno do desenho'),('--slot-bd','vaga vazia: borda'),('--slot-q-display','vaga vazia: mostra "?"'),
 ('--hr-dir','hero: direção'),('--hrn-size','hero: número'),('--hrn-prefix','hero: prefixo do número'),('--trio-mt','hero: sobreposição do trio'),
 ('--cm-cells-display','medidor: mostra células'),('--cm-cols','medidor: colunas'),('--cell-w','medidor: largura da célula'),('--cell-h','medidor: altura da célula'),('--cm-marks-display','medidor: mostra marcas 10/20/30/40'),
 ('--head-areas','cabeçalho: áreas'),('--brand-display','cabeçalho: marca'),('--tab-pill-bg','tab ativa: pílula'),('--tab-bar-h','tab ativa: barra superior'),('--tab-on-bg','tab ativa: bloco'),
 ('--sheet-title-align','sheet: alinhamento do nome'),('--sheet-tier-display','sheet: nível ao lado do nome')]
tiers=tvl([(f'--tier-{k}',k) for k in ['default','gold','diamond','rainbow','beskar','galactic','stellar','kyber','scourge']])
sz=lambda f: os.path.getsize(f'{ROOT}/assets/fonts/{f}')/1024
fonts=f'''| Tema | Arquivos baixados (só quando o tema está ativo) | Peso aprox. |
|---|---|---|
| Oficina | `archivo-var.woff2` (Archivo, variável: peso 100 a 900 e largura 62 a 125) {sz('archivo-var.woff2'):.0f} KB, `plex-mono-500.woff2` {sz('plex-mono-500.woff2'):.0f} KB, `plex-mono-400.woff2` {sz('plex-mono-400.woff2'):.0f} KB | {sz('archivo-var.woff2')+sz('plex-mono-500.woff2')+sz('plex-mono-400.woff2'):.0f} KB |
| Figurinhas | `bricolage-var.woff2` (Bricolage Grotesque, variável) {sz('bricolage-var.woff2'):.0f} KB, `figtree-var.woff2` (Figtree, variável) {sz('figtree-var.woff2'):.0f} KB | {sz('bricolage-var.woff2')+sz('figtree-var.woff2'):.0f} KB |
| Cartaz | `big-shoulders-900.woff2` {sz('big-shoulders-900.woff2'):.0f} KB, `big-shoulders-800.woff2` {sz('big-shoulders-800.woff2'):.0f} KB, `hanken-var.woff2` (Hanken Grotesk, variável) {sz('hanken-var.woff2'):.0f} KB | {sz('big-shoulders-900.woff2')+sz('big-shoulders-800.woff2')+sz('hanken-var.woff2'):.0f} KB |
'''
fb=open(f'{ROOT}/css/fonts.css').read()
fbs='\n'.join(l for l in fb.splitlines() if 'Fallback' in l and 'local(' in l)
meta=' | '.join(f'`{V(t,d)["--c-bg"]}`' for t in ['oficina','figurinhas','cartaz'] for d in (True,False))
doc=open(f'{ROOT}/tools/sistema_template.md').read()
doc=doc.replace('{{CORES}}',tab).replace('{{TIPO}}',tvl(type_rows)).replace('{{FORMA}}',tvl(shape_rows)).replace('{{ASSINATURA}}',tvl(sig_rows)).replace('{{TIERS}}',tiers).replace('{{FONTES}}',fonts).replace('{{FALLBACKS}}',fbs).replace('{{METATHEME}}',meta)
open(f'{ROOT}/sistema.md','w').write(doc); print(len(doc))
