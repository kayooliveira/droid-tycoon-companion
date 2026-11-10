"""Gera css/fonts.css: @font-face dos 6 conjuntos + faces de fallback com métricas ajustadas (sem salto de layout)."""
from fontTools.ttLib import TTFont
S="O próximo Renascimento do Ciclo 5 precisa de três droids: R7, LEP e CYCLENS. Super Renascimento? Inventário, Progresso, Início 0123456789 Pode vender Não venda"
def width(path,upper=False):
    f=TTFont(path); cmap=f.getBestCmap(); hm=f['hmtx']; upm=f['head'].unitsPerEm
    s=S.upper() if upper else S
    w=sum(hm[cmap[ord(c)]][0] for c in s if ord(c) in cmap)/upm
    h=f['hhea']; return w,h.ascent/upm,-h.descent/upm,h.lineGap/upm
ref=width('/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf')
refU=width('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',True)
FONTS=[ # familia, arquivo, peso, stretch, caixa alta?, nome do fallback
 ('Archivo','archivo-var.woff2','100 900','62% 125%',False,'Archivo Fallback','Arial'),
 ('Plex Mono','plex-mono-400.woff2','400',None,False,None,None),
 ('Plex Mono','plex-mono-500.woff2','500',None,False,'Plex Mono Fallback','Courier New'),
 ('Bricolage','bricolage-var.woff2','200 800','75% 100%',False,'Bricolage Fallback','Arial'),
 ('Figtree','figtree-var.woff2','300 900',None,False,'Figtree Fallback','Arial'),
 ('Big Shoulders','big-shoulders-800.woff2','800',None,True,None,None),
 ('Big Shoulders','big-shoulders-900.woff2','900',None,True,'Big Shoulders Fallback','Arial Narrow'),
 ('Hanken','hanken-var.woff2','100 900',None,False,'Hanken Fallback','Arial'),
]
out=["/* Gerado por tools/gen_fonts.py. Só baixa o que o tema ativo usa: o navegador só busca um @font-face quando alguma família dele aparece no texto renderizado. */"]
for fam,file,w,st,up,fb,loc in FONTS:
    out.append(f"@font-face{{font-family:'{fam}';src:url('../assets/fonts/{file}') format('woff2');font-weight:{w};{'font-stretch:'+st+';' if st else ''}font-style:normal;font-display:swap}}")
seen=set()
for fam,file,w,st,up,fb,loc in FONTS:
    if not fb or fb in seen: continue
    seen.add(fb)
    fw,asc,desc,gap=width('/workspace/dd-design/sistema/assets/fonts/'+file,up)
    base=refU if up else ref
    adj=base[0]/fw
    if fam=='Plex Mono': adj=0.6/ (fw/len(S))  # mono: avanço de 0.6em do Courier
    out.append(f"@font-face{{font-family:'{fb}';src:local('{loc}');size-adjust:{adj*100:.1f}%;ascent-override:{asc/adj*100:.1f}%;descent-override:{desc/adj*100:.1f}%;line-gap-override:{gap/adj*100:.1f}%}}")
open('css/fonts.css','w').write('\n'.join(out)+'\n'); print('\n'.join(out))
