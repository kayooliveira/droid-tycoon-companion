"""Gera css/tokens.css. Fonte única dos tokens: 3 temas x 2 modos.
Vars iguais nos 2 modos vão para o bloco [data-theme]; as que mudam com o modo vão para [data-theme][data-mode]."""
import re, json

def stripes(cols, deg=90):
    n=len(cols); st=[]
    for i,c in enumerate(cols):
        a=round(i*100/n,2); b=round((i+1)*100/n,2)
        st.append(f"{c} {a}% {b}%")
    return f"linear-gradient({deg}deg,{','.join(st)})"
DOTS=("radial-gradient(circle at 20% 28%,#fff 0 1.3px,transparent 1.8px),radial-gradient(circle at 72% 18%,#fff 0 1px,transparent 1.5px),"
      "radial-gradient(circle at 56% 66%,#fff 0 1.5px,transparent 2px),radial-gradient(circle at 86% 78%,#fff 0 1px,transparent 1.5px),"
      "radial-gradient(circle at 12% 84%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 38% 46%,#fff 0 .8px,transparent 1.3px)")
RAINBOW7=['#E5383B','#F5A524','#F7DC3C','#3DBE6B','#2E7DF0','#5B47D6','#9B4DDB']
SANS_ARIAL="Arial,Helvetica,sans-serif"
NUM_DARK='rgba(0,0,0,.24)'; NUM_LIGHT='rgba(255,255,255,.42)'

BASE={ # iguais em todos os temas e modos
 '--fs-body':'16px','--fs-small':'14px','--fs-label':'12px','--lh-body':'1.4',
 '--sp-1':'4px','--sp-2':'8px','--sp-3':'12px','--sp-4':'16px','--sp-5':'20px','--sp-6':'24px','--sp-8':'32px','--sp-page':'16px',
 '--tap':'44px','--dur-1':'120ms','--dur-2':'220ms','--ease':'cubic-bezier(.2,.7,.2,1)',
 '--z-content':'1','--z-tabbar':'10','--z-toast':'15','--z-scrim':'20','--z-sheet':'30','--z-modal':'40',
}

def oficina(dark):
    m=lambda a,b: a if dark else b
    ink=m('#F2F1EC','#141517')
    v={}
    # cores
    v.update({
     '--c-bg':m('#121315','#ECEBE6'),'--c-surface':m('#1A1C1F','#F8F7F3'),'--c-surface-2':m('#24272B','#DFDDD4'),
     '--c-border':m('#33363B','#CAC7BC'),'--c-control-border':m('#7C818B','#7D7A6E'),'--c-border-strong':m('#7C818B','#7D7A6E'),
     '--c-text':ink,'--c-text-2':m('#A9ACB2','#54575D'),
     '--c-accent':m('#C8F25A','#BDEB3A'),'--c-on-accent':m('#10140A','#141808'),
     '--c-accent-text':m('#C8F25A','#3C6200'),'--c-accent-graph':m('#C8F25A','#4F8A00'),
     '--c-focus-border':m('#C8F25A','#141517'),'--c-radio-on':m('#C8F25A','#4F8A00'),
     '--c-bad-fg':m('#FF8F80','#A8221B'),'--c-bad-bg':m('#32201E','#F6DAD5'),'--c-bad-solid':m('#FF8F80','#A8221B'),'--c-on-bad-solid':m('#1E0B08','#FFFFFF'),
     '--c-ok-fg':m('#C8F25A','#3C6200'),'--c-ok-bg':m('#232B12','#E4F0C8'),
     '--c-scrim':m('rgba(0,0,0,.62)','rgba(20,21,23,.5)'),
    })
    edge=m('transparent','#141517')   # no claro, a lima ganha contorno de tinta para manter 3:1 de borda
    edge_sh=m('none','inset 0 0 0 2px #141517')
    # fontes
    A="'Archivo','Archivo Fallback',"+SANS_ARIAL
    MONO="'Plex Mono','Plex Mono Fallback','Courier New',monospace"
    v.update({'--f-display':A,'--f-text':A,'--f-mono':MONO})
    v.update({
     '--title-font':A,'--title-size':'32px','--title-weight':'800','--title-lh':'1.02','--title-case':'none','--title-ls':'-.01em','--title-var':"'wdth' 125",
     '--h2-font':A,'--h2-size':'15px','--h2-weight':'800','--h2-case':'uppercase','--h2-ls':'.05em','--h2-var':"'wdth' 112",
     '--label-font':MONO,'--label-size':'12px','--label-weight':'500','--label-case':'uppercase','--label-ls':'.06em',
     '--meta-font':MONO,'--meta-size':'12px','--meta-weight':'400','--meta-case':'uppercase','--meta-ls':'.04em',
     '--name-font':A,'--name-size':'16px','--name-weight':'700','--name-var':"'wdth' 100",
     '--brand-display':'none','--brand-font':'700 13px '+A,'--brand-ls':'.1em','--top-brand-h':'0px',
     '--head-areas':'"title aside"','--top-h':'64px','--top-pt':'12px',
     '--tab-font':A,'--tab-fs':'11px','--tab-fw':'700','--tab-case':'uppercase','--tab-ls':'.03em',
     '--cs-font':A,'--cs-size':'15px','--cs-weight':'800','--cs-case':'uppercase','--cs-ls':'.05em','--cs-pad':'0 0 8px','--cs-bt':'0','--cs-bb':'2px solid '+ink,'--cs-bg':'transparent','--cs-fg':ink,'--cs-display':'block','--cs-w':'auto','--cs-r':'0','--cs-tf':'none','--cs-mt':'28px',
    })
    # raios, bordas, elevação, ícones
    v.update({'--r-control':'4px','--r-card':'4px','--r-chip':'4px','--r-sheet':'10px','--r-modal':'6px','--bw':'1.5px',
      '--elev-pop':m('0 -8px 0 rgba(0,0,0,.25)','0 -2px 0 rgba(20,21,23,.12)'),'--ic-sw':'2','--ic-cap':'square','--ic-join':'miter',
      '--focus-outline':'3px solid '+m('#C8F25A','#141517'),'--focus-ring':'0 0 0 2px '+m('#C8F25A','#141517'),'--error-sh':'none'})
    # painéis, linhas, itens
    v.update({'--panel-bg':'var(--c-surface)','--panel-r':'4px','--panel-pad':'16px','--panel-sh':'inset 0 0 0 1px var(--c-border)',
      '--hero-bg':'var(--c-surface)','--hero-pad':'16px','--hero-mt':'4px',
      '--row-h':'60px','--row-pad':'10px 0','--row-pad-x':'0px','--row-bg':'transparent','--row-r':'0','--row-sh':'none','--row-bt':'0','--row-bb':'1px solid var(--c-border)','--row-gap':'0px',
      '--row-sheet-bg':'transparent','--item-pad':'8px 0','--item-tile':'56px','--rowic-bg':'var(--c-surface-2)','--rowic-r':'4px','--mini-gap':'4px',
      '--sec-mt':'22px','--sech-pad':'0 0 8px','--sech-bt':'0','--sech-bb':'2px solid var(--c-text)','--sech-mb':'8px',
      '--grid-gap':'12px','--grid-gap-3':'8px'})
    # botões
    v.update({'--btn-font':A,'--btn-size':'15px','--btn-weight':'800','--btn-var':"'wdth' 112",'--btn-case':'uppercase','--btn-ls':'.05em','--btn-h':'52px','--btn-px':'16px','--btn-r':'4px','--btn-bw':'2px','--btn-sh':'none','--btn-icon':'48px',
      '--btn-primary-bd':edge if not dark else 'var(--c-accent)','--btn2-bg':'transparent','--ghost-fg':'var(--c-accent-text)',
      '--dis-bg':'transparent','--dis-img':'repeating-linear-gradient(135deg,transparent 0 6px,var(--c-border) 6px 7px)','--dis-bd':'var(--c-border)','--dis-bs':'solid'})
    # campos
    v.update({'--field-h':'52px','--field-bg':'var(--c-surface)','--field-bw':'1.5px',
      '--seg-gap':'2px','--seg-pad':'3px','--seg-bg':'transparent','--seg-bd':'1.5px solid var(--c-control-border)','--seg-bb':'1.5px solid var(--c-control-border)','--seg-r':'4px','--seg-item-r':'2px',
      '--seg-font':'700 14px '+A,'--seg-ls':'.02em','--seg-case':'none','--seg-fg':'var(--c-text-2)','--seg-on-bg':'var(--c-accent)','--seg-on-fg':'var(--c-on-accent)','--seg-on-sh':edge_sh,
      '--chip-bw':'1.5px','--chip-font':'600 14px '+A,'--chip-on-bg':'var(--c-accent)','--chip-on-fg':'var(--c-on-accent)','--chip-on-bd':edge if not dark else 'var(--c-accent)',
      '--chipst-h':'28px','--chipst-bg':'var(--c-surface-2)','--chipst-fg':'var(--c-text)','--chipst-r':'3px','--chipst-font':'500 12px '+MONO,'--chipst-ls':'.06em','--chipst-case':'uppercase',
      '--sel-bg':'var(--c-surface)','--sel-font':'600 14px '+A,'--sel-ls':'0','--sel-case':'none',
      '--opts-gap':'0px','--opts-bd':'1.5px solid var(--c-control-border)','--opts-r':'4px','--opts-bg':'var(--c-surface)','--opt-px':'14px','--opt-bg':'transparent','--opt-bd':'0','--opt-bt':'1px solid var(--c-border)','--opt-first-bt':'0','--opt-r':'0','--opt-fw':'700',
      '--opt-on-sh':'inset 4px 0 0 var(--c-radio-on)',
      '--rg-track-h':'6px','--rg-track-r':'0','--rg-track-bd':'0','--rg-empty':'var(--c-control-border)','--rg-thumb-w':'14px','--rg-thumb-h':'30px','--rg-thumb-mt':'-12px','--rg-thumb-bg':'var(--c-text)','--rg-thumb-bd':'0','--rg-thumb-r':'2px','--rg-thumb-sh':'none',
      '--sw-bd':'2px solid var(--c-control-border)','--sw-r':'4px','--sw-bg':'transparent','--sw-gap':'4px','--sw-knob':'var(--c-control-border)','--sw-knob-r':'2px','--sw-on-bg':'var(--c-accent)','--sw-on-bd':edge if not dark else 'var(--c-accent)','--sw-on-knob':'var(--c-on-accent)'})
    # tags
    v.update({'--tag-pad':'3px 7px','--tag-r':'3px','--tag-font':MONO,'--tag-size':'12px','--tag-weight':'500','--tag-case':'uppercase','--tag-ls':'.05em','--tag-ic-display':'none','--tag-sq-display':'none',
      '--tag-ok-bg':'var(--c-accent)','--tag-ok-fg':'var(--c-on-accent)','--tag-ok-sh':edge_sh.replace('2px','1.5px'),'--tag-ok-sq-bg':'transparent','--tag-ok-sq-bd':'transparent',
      '--tag-bad-bg':'var(--c-bad-bg)','--tag-bad-fg':'var(--c-bad-fg)','--tag-bad-sh':'inset 0 0 0 1px var(--c-bad-fg)','--tag-bad-sq-bg':'transparent','--tag-bad-sq-bd':'transparent',
      '--tag-mute-bg':'transparent','--tag-mute-fg':'var(--c-text-2)','--tag-mute-sh':'inset 0 0 0 1px var(--c-control-border)','--tag-mute-sq-bg':'transparent','--tag-mute-sq-bd':'transparent'})
    # tab bar
    v.update({'--tab-h':'64px','--tab-bg':'var(--c-surface)','--tab-bt':'1px solid var(--c-border)','--tab-r':'0','--tab-sh':'none','--tab-bar-h':'4px','--tab-bar-bg':'var(--c-accent-graph)','--tab-ic-w':'28px','--tab-ic-h':'28px','--tab-pill-r':'0','--tab-pill-tf':'none','--tab-pill-sh':'none','--tab-pill-bg':'transparent','--tab-on-bg':'transparent','--tab-on-fg':'var(--c-text)','--tab-on-ic':m('#C8F25A','#3C6200')})
    # tiles
    v.update({'--tile-frame':'transparent','--tile-pad':'0px','--tile-pad-sm':'0px','--tile-pad-xs':'0px','--tile-r':'4px','--tile-r-sm':'4px','--tile-r-xs':'3px','--tile-bg-r':'4px','--tile-bg-r-sm':'4px','--tile-bg-r-xs':'3px','--tile-sh':'none','--tile-tf':'none','--tile-tf-alt':'none',
      '--img-b':'8%','--img-w':'84%','--img-h':'84%','--img-filter':'none','--foil':'none',
      '--tnum-z':'3','--tnum-l':'0','--tnum-t':'auto','--tnum-b':'0','--tnum-pad':'3px 7px 3px 6px','--tnum-font':MONO,'--tnum-weight':'500','--tnum-fs':'12px','--tnum-fs-lg':'14px','--tnum-lh':'1.2','--tnum-color':'#FFFFFF','--tnum-bg':'rgba(10,10,12,.78)','--tnum-r':'0 4px 0 4px',
      '--qty-t':'0','--qty-r':'0','--qty-min':'24px','--qty-pad':'3px 6px','--qty-bg':'#0B0B0C','--qty-fg':'#FFFFFF','--qty-rad':'0 4px 0 4px','--qty-font':MONO,'--qty-fs':'12px','--qty-lh':'1.2','--qty-sh':'none',
      '--slot-bg':'repeating-linear-gradient(135deg,transparent 0 6px,var(--c-border) 6px 7px)','--slot-bd':'1.5px dashed var(--c-control-border)','--slot-r':'4px','--slot-img-filter':m('brightness(0) invert(1)','brightness(0)'),'--slot-img-op':m('.2','.18'),'--slot-q-display':'none',
      '--art-w':'100%','--art-ar':'358/210','--art-tf':'none','--art-img':'92%'})
    tiers={'default':'#747A84','gold':'#E6B323','diamond':'#2E78E6','rainbow':stripes(RAINBOW7),
      'beskar':'linear-gradient(100deg,#8B9199,#C4C9CF 30%,#9AA0A8 55%,#D0D4D9 80%,#8B9199)','galactic':DOTS+',#4A2BA8','stellar':DOTS+',linear-gradient(135deg,#F0B93A,#C9811A)',
      'kyber':'linear-gradient(135deg,#17B07C,#7B47E6 55%,#2B6CF0)','scourge':'#A81B3F'}
    return v, tiers
def fig(dark):
    m=lambda a,b: a if dark else b
    v={}
    ink=m('#FFF8EA','#172036')
    v.update({
     '--c-bg':m('#0F1C2E','#F2EDE0'),'--c-surface':m('#172A44','#FFFFFF'),'--c-surface-2':m('#20385A','#E8E0CC'),
     '--c-border':m('#31507A','#D3C8AE'),'--c-control-border':m('#6A8CBD','#857B5F'),'--c-border-strong':m('#6A8CBD','#857B5F'),
     '--c-text':ink,'--c-text-2':m('#B4C4DC','#566178'),
     '--c-accent':m('#FF5C82','#D8245A'),'--c-on-accent':m('#1A0A12','#FFFFFF'),
     '--c-accent-text':m('#FF8CA8','#C01F52'),'--c-accent-graph':m('#FF5C82','#D8245A'),
     '--c-focus-border':m('#FF5C82','#D8245A'),'--c-radio-on':m('#FF5C82','#D8245A'),
     '--c-bad-fg':m('#FF9DB2','#B3173F'),'--c-bad-bg':m('#3A1A2B','#FADDE4'),'--c-bad-solid':m('#FF9DB2','#B3173F'),'--c-on-bad-solid':m('#3A1A2B','#FFFFFF'),
     '--c-ok-fg':m('#5FE3A8','#0B7A4B'),'--c-ok-bg':m('#12392F','#DDF3E8'),
     '--c-scrim':m('rgba(5,10,20,.66)','rgba(23,32,54,.5)'),
    })
    B="'Bricolage','Bricolage Fallback',"+SANS_ARIAL; T="'Figtree','Figtree Fallback',"+SANS_ARIAL
    v.update({'--f-display':B,'--f-text':T,'--f-mono':T})
    v.update({
     '--title-font':B,'--title-size':'34px','--title-weight':'800','--title-lh':'1','--title-case':'none','--title-ls':'-.01em','--title-var':"'wdth' 100",
     '--h2-font':B,'--h2-size':'21px','--h2-weight':'800','--h2-case':'none','--h2-ls':'0','--h2-var':"'wdth' 100",
     '--label-font':T,'--label-size':'13px','--label-weight':'700','--label-case':'none','--label-ls':'.01em',
     '--meta-font':T,'--meta-size':'14px','--meta-weight':'600','--meta-case':'none','--meta-ls':'0',
     '--name-font':B,'--name-size':'17px','--name-weight':'700','--name-var':"'wdth' 100",
     '--brand-display':'none','--brand-font':'700 13px '+T,'--brand-ls':'.08em','--top-brand-h':'0px',
     '--head-areas':'"title aside"','--top-h':'64px','--top-pt':'12px',
     '--tab-font':T,'--tab-fs':'12px','--tab-fw':'700','--tab-case':'none','--tab-ls':'0',
     '--cs-font':B,'--cs-size':'18px','--cs-weight':'800','--cs-case':'none','--cs-ls':'0','--cs-pad':'6px 14px','--cs-bt':'0','--cs-bb':'0','--cs-bg':'var(--c-accent)','--cs-fg':'var(--c-on-accent)','--cs-display':'inline-block','--cs-w':'fit-content','--cs-r':'14px','--cs-tf':'rotate(-1.5deg)','--cs-mt':'30px',
    })
    v.update({'--r-control':'16px','--r-card':'18px','--r-chip':'999px','--r-sheet':'30px','--r-modal':'28px','--bw':'2px',
      '--elev-pop':m('0 -6px 0 rgba(0,0,0,.3)','0 -4px 0 rgba(23,32,54,.12)'),'--ic-sw':'2.4','--ic-cap':'round','--ic-join':'round',
      '--focus-outline':'3px solid '+m('#FF8CA8','#D8245A'),'--focus-ring':'0 0 0 3px '+m('rgba(255,92,130,.4)','rgba(216,36,90,.3)'),'--error-sh':'none'})
    v.update({'--panel-bg':'var(--c-surface)','--panel-r':'24px','--panel-pad':'16px','--panel-sh':'0 4px 0 var(--c-border)',
      '--hero-bg':'var(--c-surface)','--hero-pad':'16px','--hero-mt':'6px',
      '--row-h':'64px','--row-pad':'10px 14px','--row-pad-x':'14px','--row-bg':'var(--c-surface)','--row-r':'18px','--row-sh':'0 3px 0 var(--c-border)','--row-bt':'0','--row-bb':'0','--row-gap':'10px',
      '--row-sheet-bg':'var(--c-surface-2)','--item-pad':'8px 12px','--item-tile':'58px','--rowic-bg':'var(--c-surface-2)','--rowic-r':'14px','--mini-gap':'4px',
      '--sec-mt':'24px','--sech-pad':'0 2px','--sech-bt':'0','--sech-bb':'0','--sech-mb':'10px',
      '--grid-gap':'14px','--grid-gap-3':'10px'})
    v.update({'--btn-font':B,'--btn-size':'17px','--btn-weight':'800','--btn-var':"'wdth' 100",'--btn-case':'none','--btn-ls':'0','--btn-h':'54px','--btn-px':'18px','--btn-r':'18px','--btn-bw':'2px','--btn-sh':m('0 4px 0 rgba(0,0,0,.32)','0 4px 0 rgba(23,32,54,.22)'),'--btn-icon':'48px',
      '--btn-primary-bd':'var(--c-accent)','--btn2-bg':'var(--c-surface)','--ghost-fg':'var(--c-accent-text)',
      '--dis-bg':'var(--c-surface-2)','--dis-img':'none','--dis-bd':'var(--c-control-border)','--dis-bs':'dashed'})
    v.update({'--field-h':'54px','--field-bg':'var(--c-surface)','--field-bw':'2px',
      '--seg-gap':'4px','--seg-pad':'3px','--seg-bg':'var(--c-surface)','--seg-bd':'2px solid var(--c-control-border)','--seg-bb':'2px solid var(--c-control-border)','--seg-r':'18px','--seg-item-r':'14px',
      '--seg-font':'800 15px '+B,'--seg-ls':'0','--seg-case':'none','--seg-fg':'var(--c-text-2)','--seg-on-bg':'var(--c-accent)','--seg-on-fg':'var(--c-on-accent)','--seg-on-sh':m('0 3px 0 rgba(0,0,0,.3)','0 3px 0 rgba(23,32,54,.22)'),
      '--chip-bw':'2px','--chip-font':'700 15px '+T,'--chip-on-bg':'var(--c-accent)','--chip-on-fg':'var(--c-on-accent)','--chip-on-bd':'var(--c-accent)',
      '--chipst-h':'30px','--chipst-bg':'var(--c-surface-2)','--chipst-fg':'var(--c-text)','--chipst-r':'999px','--chipst-font':'800 13px '+T,'--chipst-ls':'0','--chipst-case':'none',
      '--sel-bg':'var(--c-surface)','--sel-font':'700 14px '+T,'--sel-ls':'0','--sel-case':'none',
      '--opts-gap':'8px','--opts-bd':'0','--opts-r':'0','--opts-bg':'transparent','--opt-px':'14px','--opt-bg':'var(--c-surface)','--opt-bd':'2px solid var(--c-border)','--opt-bt':'2px solid var(--c-border)','--opt-first-bt':'2px solid var(--c-border)','--opt-r':'18px','--opt-fw':'800',
      '--opt-on-sh':'0 0 0 3px var(--c-radio-on)',
      '--rg-track-h':'12px','--rg-track-r':'6px','--rg-track-bd':'0','--rg-empty':'var(--c-control-border)','--rg-thumb-w':'32px','--rg-thumb-h':'32px','--rg-thumb-mt':'-10px','--rg-thumb-bg':'#FFFFFF','--rg-thumb-bd':'5px solid var(--c-accent-graph)','--rg-thumb-r':'50%','--rg-thumb-sh':'0 2px 0 rgba(0,0,0,.3)',
      '--sw-bd':'2px solid var(--c-control-border)','--sw-r':'999px','--sw-bg':'var(--c-surface-2)','--sw-gap':'4px','--sw-knob':'var(--c-control-border)','--sw-knob-r':'50%','--sw-on-bg':'var(--c-accent)','--sw-on-bd':'var(--c-accent)','--sw-on-knob':'var(--c-on-accent)'})
    v.update({'--tag-pad':'3px 10px 3px 8px','--tag-r':'999px','--tag-font':T,'--tag-size':'13px','--tag-weight':'800','--tag-case':'none','--tag-ls':'0','--tag-ic-display':'block','--tag-sq-display':'none',
      '--tag-ok-bg':'var(--c-ok-bg)','--tag-ok-fg':'var(--c-ok-fg)','--tag-ok-sh':'none','--tag-ok-sq-bg':'transparent','--tag-ok-sq-bd':'transparent',
      '--tag-bad-bg':'var(--c-bad-bg)','--tag-bad-fg':'var(--c-bad-fg)','--tag-bad-sh':'none','--tag-bad-sq-bg':'transparent','--tag-bad-sq-bd':'transparent',
      '--tag-mute-bg':'var(--c-surface-2)','--tag-mute-fg':'var(--c-text-2)','--tag-mute-sh':'none','--tag-mute-sq-bg':'transparent','--tag-mute-sq-bd':'transparent'})
    v.update({'--tab-h':'68px','--tab-bg':'var(--c-surface)','--tab-bt':'0','--tab-r':'22px 22px 0 0','--tab-sh':'0 -3px 0 var(--c-border)','--tab-bar-h':'0px','--tab-bar-bg':'transparent','--tab-ic-w':'54px','--tab-ic-h':'32px','--tab-pill-r':'16px','--tab-pill-tf':'rotate(-3deg)','--tab-pill-sh':m('0 2px 0 rgba(0,0,0,.3)','0 2px 0 rgba(23,32,54,.22)'),'--tab-pill-bg':'var(--c-accent)','--tab-on-bg':'transparent','--tab-on-fg':'var(--c-text)','--tab-on-ic':'var(--c-on-accent)'})
    ol=m('rgba(0,0,0,.28)','rgba(23,32,54,.22)')
    v.update({'--tile-frame':'#FFFFFF','--tile-pad':'5px','--tile-pad-sm':'3px','--tile-pad-xs':'2px','--tile-r':'18px','--tile-r-sm':'12px','--tile-r-xs':'8px','--tile-bg-r':'14px','--tile-bg-r-sm':'10px','--tile-bg-r-xs':'6px','--tile-sh':'0 3px 0 '+ol,'--tile-tf':'rotate(-1.4deg)','--tile-tf-alt':'rotate(1.2deg)',
      '--img-b':'7%','--img-w':'100%','--img-h':'100%','--img-filter':'drop-shadow(1.5px 0 0 #fff) drop-shadow(-1.5px 0 0 #fff) drop-shadow(0 1.5px 0 #fff) drop-shadow(0 -1.5px 0 #fff) drop-shadow(0 2px 2px rgba(0,0,0,.22))',
      '--foil':'linear-gradient(115deg,transparent 28%,rgba(255,255,255,.42) 44%,transparent 60%)',
      '--tnum-z':'3','--tnum-l':'9px','--tnum-t':'auto','--tnum-b':'9px','--tnum-pad':'2px 8px','--tnum-font':B,'--tnum-weight':'800','--tnum-fs':'11px','--tnum-fs-lg':'14px','--tnum-lh':'1.3','--tnum-color':'#172036','--tnum-bg':'#FFFFFF','--tnum-r':'999px',
      '--qty-t':'-7px','--qty-r':'-6px','--qty-min':'26px','--qty-pad':'2px 7px','--qty-bg':'var(--c-accent)','--qty-fg':'var(--c-on-accent)','--qty-rad':'999px','--qty-font':B,'--qty-fs':'14px','--qty-lh':'1.3','--qty-sh':'0 2px 0 '+ol,
      '--slot-bg':'var(--c-surface)','--slot-bd':'2.5px dashed var(--c-control-border)','--slot-r':'18px','--slot-img-filter':m('brightness(0) invert(1)','brightness(0)'),'--slot-img-op':m('.16','.14'),'--slot-q-display':'block',
      '--art-w':'214px','--art-ar':'1/1','--art-tf':'rotate(-2deg)','--art-img':'100%'})
    tiers={'default':'#8C97A8','gold':'#FFC531','diamond':'#3E8BFF','rainbow':'linear-gradient(135deg,#FF4D6D,#FFB84D,#FFE45E,#4DD98A,#4DA3FF,#9B6BFF)',
      'beskar':'linear-gradient(135deg,#9AA5B5,#E3E8EE 45%,#AEB8C6)','galactic':DOTS+',#5A32C8','stellar':DOTS+',linear-gradient(135deg,#FFD66B,#F2A81D)',
      'kyber':'linear-gradient(135deg,#1CC98A,#8A4DFF 55%,#2F7BFF)','scourge':'linear-gradient(135deg,#B3173F,#6D0F2A)'}
    return v,tiers
def cartaz(dark):
    m=lambda a,b: a if dark else b
    v={}
    ink=m('#F4F3EF','#0A0A0B')
    v.update({
     '--c-bg':m('#0A0A0B','#F3F2EE'),'--c-surface':m('#131315','#FFFFFF'),'--c-surface-2':m('#1D1D20','#E6E4DD'),
     '--c-border':m('#2E2E33','#D3D1C8'),'--c-control-border':m('#80808A','#7C7A72'),'--c-border-strong':m('#80808A','#7C7A72'),
     '--c-text':ink,'--c-text-2':m('#A9A9B1','#55555C'),
     '--c-accent':ink,'--c-on-accent':m('#0A0A0B','#F3F2EE'),
     '--c-accent-text':ink,'--c-accent-graph':ink,'--c-focus-border':ink,'--c-radio-on':ink,
     '--c-bad-fg':m('#FF7468','#BE2418'),'--c-bad-bg':m('#2B1210','#FADCD8'),'--c-bad-solid':m('#FF7468','#BE2418'),'--c-on-bad-solid':m('#1C0806','#FFFFFF'),
     '--c-ok-fg':ink,'--c-ok-bg':'transparent',
     '--c-scrim':m('rgba(0,0,0,.7)','rgba(10,10,11,.5)'),
    })
    D="'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif"; H="'Hanken','Hanken Fallback',"+SANS_ARIAL
    v.update({'--f-display':D,'--f-text':H,'--f-mono':H})
    v.update({
     '--title-font':D,'--title-size':'min(84px,21.5vw)','--title-weight':'900','--title-lh':'.86','--title-case':'uppercase','--title-ls':'-.005em','--title-var':'normal',
     '--h2-font':D,'--h2-size':'26px','--h2-weight':'900','--h2-case':'uppercase','--h2-ls':'.02em','--h2-var':'normal',
     '--label-font':H,'--label-size':'12px','--label-weight':'800','--label-case':'uppercase','--label-ls':'.12em',
     '--meta-font':H,'--meta-size':'12px','--meta-weight':'700','--meta-case':'uppercase','--meta-ls':'.08em',
     '--name-font':H,'--name-size':'16px','--name-weight':'800','--name-var':'normal',
     '--brand-display':'flex','--brand-font':'800 13px '+H,'--brand-ls':'.16em','--top-brand-h':'44px',
     '--head-areas':'"brand aside" "title title"','--top-h':'auto','--top-pt':'8px',
     '--tab-font':D,'--tab-fs':'15px','--tab-fw':'800','--tab-case':'uppercase','--tab-ls':'.02em',
     '--cs-font':D,'--cs-size':'34px','--cs-weight':'900','--cs-case':'uppercase','--cs-ls':'.01em','--cs-pad':'10px 0 0','--cs-bt':'4px solid '+ink,'--cs-bb':'0','--cs-bg':'transparent','--cs-fg':ink,'--cs-display':'block','--cs-w':'auto','--cs-r':'0','--cs-tf':'none','--cs-mt':'32px',
    })
    v.update({'--r-control':'0','--r-card':'0','--r-chip':'0','--r-sheet':'0','--r-modal':'0','--bw':'2px',
      '--elev-pop':'none','--ic-sw':'2.4','--ic-cap':'square','--ic-join':'miter',
      '--focus-outline':'3px solid '+ink,'--focus-ring':'0 0 0 3px '+ink,'--error-sh':'inset 6px 0 0 var(--c-bad-fg)'})
    v.update({'--panel-bg':'transparent','--panel-r':'0','--panel-pad':'0','--panel-sh':'none',
      '--hero-bg':'transparent','--hero-pad':'0','--hero-mt':'14px',
      '--row-h':'60px','--row-pad':'12px 0','--row-pad-x':'0px','--row-bg':'transparent','--row-r':'0','--row-sh':'none','--row-bt':'0','--row-bb':'1px solid var(--c-border)','--row-gap':'0px',
      '--row-sheet-bg':'transparent','--item-pad':'8px 0','--item-tile':'58px','--rowic-bg':'transparent','--rowic-r':'0','--mini-gap':'3px',
      '--sec-mt':'24px','--sech-pad':'8px 0 0','--sech-bt':'3px solid var(--c-text)','--sech-bb':'0','--sech-mb':'6px',
      '--grid-gap':'12px','--grid-gap-3':'8px'})
    v.update({'--btn-font':D,'--btn-size':'22px','--btn-weight':'900','--btn-var':'normal','--btn-case':'uppercase','--btn-ls':'.04em','--btn-h':'56px','--btn-px':'16px','--btn-r':'0','--btn-bw':'3px','--btn-sh':'none','--btn-icon':'48px',
      '--btn-primary-bd':'var(--c-accent)','--btn2-bg':'transparent','--ghost-fg':'var(--c-text)',
      '--dis-bg':'transparent','--dis-img':'repeating-linear-gradient(135deg,transparent 0 6px,var(--c-border) 6px 7px)','--dis-bd':'var(--c-border)','--dis-bs':'solid'})
    v.update({'--field-h':'54px','--field-bg':'transparent','--field-bw':'2px',
      '--seg-gap':'0px','--seg-pad':'0','--seg-bg':'transparent','--seg-bd':'0','--seg-bb':'1px solid var(--c-border)','--seg-r':'0','--seg-item-r':'0',
      '--seg-font':'900 22px '+D,'--seg-ls':'.03em','--seg-case':'uppercase','--seg-fg':'var(--c-text-2)','--seg-on-bg':'transparent','--seg-on-fg':'var(--c-text)','--seg-on-sh':'inset 0 -5px 0 var(--c-text)',
      '--chip-bw':'2px','--chip-font':'800 14px '+H,'--chip-on-bg':'var(--c-text)','--chip-on-fg':'var(--c-bg)','--chip-on-bd':'var(--c-text)',
      '--chipst-h':'28px','--chipst-bg':'var(--c-text)','--chipst-fg':'var(--c-bg)','--chipst-r':'0','--chipst-font':'800 12px '+H,'--chipst-ls':'.1em','--chipst-case':'uppercase',
      '--sel-bg':'transparent','--sel-font':'800 14px '+H,'--sel-ls':'.04em','--sel-case':'uppercase',
      '--opts-gap':'0px','--opts-bd':'0','--opts-r':'0','--opts-bg':'transparent','--opt-px':'16px','--opt-bg':'transparent','--opt-bd':'0','--opt-bt':'1px solid var(--c-border)','--opt-first-bt':'3px solid var(--c-text)','--opt-r':'0','--opt-fw':'800',
      '--opt-on-sh':'inset 6px 0 0 var(--c-text)',
      '--rg-track-h':'8px','--rg-track-r':'0','--rg-track-bd':'0','--rg-empty':'var(--c-control-border)','--rg-thumb-w':'18px','--rg-thumb-h':'36px','--rg-thumb-mt':'-14px','--rg-thumb-bg':'var(--c-text)','--rg-thumb-bd':'0','--rg-thumb-r':'0','--rg-thumb-sh':'none',
      '--sw-bd':'3px solid var(--c-control-border)','--sw-r':'0','--sw-bg':'transparent','--sw-gap':'4px','--sw-knob':'var(--c-control-border)','--sw-knob-r':'0','--sw-on-bg':'var(--c-text)','--sw-on-bd':'var(--c-text)','--sw-on-knob':'var(--c-bg)'})
    v.update({'--tag-pad':'0','--tag-r':'0','--tag-font':H,'--tag-size':'12px','--tag-weight':'800','--tag-case':'uppercase','--tag-ls':'.08em','--tag-ic-display':'none','--tag-sq-display':'inline-block',
      '--tag-ok-bg':'transparent','--tag-ok-fg':'var(--c-text)','--tag-ok-sh':'none','--tag-ok-sq-bg':'transparent','--tag-ok-sq-bd':'var(--c-text)',
      '--tag-bad-bg':'transparent','--tag-bad-fg':'var(--c-bad-fg)','--tag-bad-sh':'none','--tag-bad-sq-bg':'var(--c-bad-fg)','--tag-bad-sq-bd':'var(--c-bad-fg)',
      '--tag-mute-bg':'transparent','--tag-mute-fg':'var(--c-text-2)','--tag-mute-sh':'none','--tag-mute-sq-bg':'transparent','--tag-mute-sq-bd':'var(--c-text-2)'})
    v.update({'--tab-h':'64px','--tab-bg':'var(--c-bg)','--tab-bt':'3px solid var(--c-text)','--tab-r':'0','--tab-sh':'none','--tab-bar-h':'0px','--tab-bar-bg':'transparent','--tab-ic-w':'28px','--tab-ic-h':'26px','--tab-pill-r':'0','--tab-pill-tf':'none','--tab-pill-sh':'none','--tab-pill-bg':'transparent','--tab-on-bg':'var(--c-text)','--tab-on-fg':'var(--c-bg)','--tab-on-ic':'var(--c-bg)'})
    v.update({'--tile-frame':'transparent','--tile-pad':'0px','--tile-pad-sm':'0px','--tile-pad-xs':'0px','--tile-r':'0','--tile-r-sm':'0','--tile-r-xs':'0','--tile-bg-r':'0','--tile-bg-r-sm':'0','--tile-bg-r-xs':'0','--tile-sh':'none','--tile-tf':'none','--tile-tf-alt':'none',
      '--img-b':'0%','--img-w':'88%','--img-h':'88%','--img-filter':'none','--foil':'none',
      '--tnum-z':'1','--tnum-l':'6px','--tnum-t':'2px','--tnum-b':'auto','--tnum-pad':'0','--tnum-font':D,'--tnum-weight':'900','--tnum-fs':'38cqw','--tnum-fs-lg':'38cqw','--tnum-lh':'.85','--tnum-color':'var(--tier-num)','--tnum-bg':'transparent','--tnum-r':'0',
      '--qty-t':'0','--qty-r':'0','--qty-min':'28px','--qty-pad':'2px 8px','--qty-bg':'var(--c-text)','--qty-fg':'var(--c-bg)','--qty-rad':'0','--qty-font':D,'--qty-fs':'20px','--qty-lh':'1.1','--qty-sh':'none',
      '--slot-bg':'repeating-linear-gradient(135deg,transparent 0 7px,var(--c-border) 7px 8px)','--slot-bd':'2px solid var(--c-control-border)','--slot-r':'0','--slot-img-filter':m('brightness(0) invert(1)','brightness(0)'),'--slot-img-op':m('.22','.2'),'--slot-q-display':'none',
      '--art-w':'100%','--art-ar':'358/220','--art-tf':'none','--art-img':'94%'})
    tiers={'default':'#8A8D94','gold':'#FFC21A','diamond':'#1F6BFF','rainbow':stripes(RAINBOW7,135),
      'beskar':'linear-gradient(135deg,#B9BEC5 0 50%,#8F959D 50% 100%)','galactic':DOTS+',#5B2FD0','stellar':DOTS+',#F29A00',
      'kyber':'linear-gradient(135deg,#12B886 0 33.3%,#7C3AED 33.3% 66.6%,#2563EB 66.6% 100%)','scourge':'#B80F2E'}
    return v,tiers

THEMES={'oficina':oficina,'figurinhas':fig,'cartaz':cartaz}
TIER_NUM={'default':NUM_DARK,'gold':NUM_DARK,'diamond':NUM_LIGHT,'rainbow':NUM_LIGHT,'beskar':NUM_DARK,'galactic':NUM_LIGHT,'stellar':NUM_DARK,'kyber':NUM_LIGHT,'scourge':NUM_LIGHT}

# valores que dependem do tema mas não do modo e que referenciam tokens (var) ficam no bloco do tema
def theme_vars(name,dark):
    v,t=THEMES[name](dark)
    for k,c in t.items():
        v['--tier-'+k]=c; v['--tier-'+k+'-num']=TIER_NUM[k]
    # específicos do tema (hero, medidor, estados de carregar, sheet, modal, toast, stats, ícones, cs, tema)
    return v

def extra(name,dark):
    m=lambda a,b: a if dark else b
    x={}
    if name=='oficina':
        A="'Archivo','Archivo Fallback',"+SANS_ARIAL; MONO="'Plex Mono','Plex Mono Fallback','Courier New',monospace"
        x.update({
         '--hr-dir':'row','--hr-align':'baseline','--hr-mb':'6px','--hrk-font':MONO,'--hrk-size':'12px','--hrk-weight':'500','--hrk-case':'uppercase','--hrk-ls':'.06em','--hrk-color':'var(--c-text-2)','--hrk-var':'normal',
         '--hrn-font':A,'--hrn-size':'64px','--hrn-weight':'800','--hrn-lh':'.9','--hrn-ls':'-.02em','--hrn-h':'auto','--hrn-m':'0','--hrn-var':"'wdth' 125",'--hrn-prefix':'"#"','--trio-gap':'10px','--trio-mt':'12px','--cred-pt':'12px','--cred-bt':'1px solid var(--c-border)',
         '--cm-mt':'0','--cm-top-mb':'8px','--cm-num-size':'40px','--cm-num-size-c':'28px','--cmn-font':A,'--cmn-weight':'800','--cmn-var':"'wdth' 125",'--cmo-font':MONO,'--cmo-size':'13px','--cm-label-align':'right',
         '--cm-cells-display':'grid','--cm-cols':'40','--cm-gap':'0px','--cm-row-gap':'0px','--cm-row-h':'30px','--cm-marks-display':'block',
         '--cell-w':'2px','--cell-h':'12px','--cell-h5':'20px','--cell-r':'0','--cell-todo-bg':'var(--c-control-border)','--cell-todo-bd':'0','--cell-done-bg':'var(--c-accent-graph)','--cell-done-bd':'transparent',
         '--cell-cur-w':'4px','--cell-cur-h':'30px','--cell-cur-bg':'var(--c-text)','--cell-cur-bd':'0','--cell-cur-outline':'0',
         '--stats-gap':'0px','--stats-bt':'1px solid var(--c-border)','--stat-pad':'12px 10px','--stat-pad-first':'0px','--stat-bg':'transparent','--stat-r':'0','--stat-sh':'none','--stat-bl':'1px solid var(--c-border)','--stat-font':A,'--stat-size':'24px','--stat-weight':'800','--stat-var':"'wdth' 125",'--stat-case':'none',
         '--sheet-bg':'var(--c-surface)','--sheet-bt':'2px solid var(--c-text)','--grab-h':'4px','--grab-r':'2px','--sheetn-font':A,'--sheetn-size':'32px','--sheetn-weight':'800','--sheetn-case':'none','--sheetn-ls':'-.01em','--sheetn-var':"'wdth' 125",'--sheet-title-align':'left','--sheet-title-j':'flex-start','--sheet-tier-display':'none',
         '--modal-bg':'var(--c-surface)','--modal-bd':'1.5px solid var(--c-control-border)','--modal-sh':m('0 10px 0 rgba(0,0,0,.35)','0 4px 0 rgba(20,21,23,.18)'),'--mt-font':A,'--mt-size':'24px','--mt-weight':'800','--mt-case':'none','--mt-ls':'-.01em','--mt-var':"'wdth' 125",
         '--toast-bg':m('#F2F1EC','#141517'),'--toast-fg':m('#121315','#F2F1EC'),'--toast-r':'4px','--toast-sh':'none','--toast-ic':'var(--toast-fg)','--toast-act-bg':'var(--toast-fg)','--toast-act-fg':'var(--toast-bg)','--toast-act-r':'3px','--toast-act-font':'800 14px '+A,'--toast-act-deco':'none','--toast-err-bg':'var(--c-bad-bg)','--toast-err-fg':'var(--c-bad-fg)',
         '--ico-gap':'0px','--ico-bd':'1px solid var(--c-border)','--ico-r':'0','--ico-bg':'transparent',
         '--sk-bg':'var(--c-surface-2)','--sk-r':'3px','--sk-dur':'1.4s','--sk-shimmer':m('linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent)','linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)'),
        })
    if name=='figurinhas':
        B="'Bricolage','Bricolage Fallback',"+SANS_ARIAL; T="'Figtree','Figtree Fallback',"+SANS_ARIAL
        x.update({
         '--hr-dir':'column','--hr-align':'flex-start','--hr-mb':'8px','--hrk-font':T,'--hrk-size':'14px','--hrk-weight':'700','--hrk-case':'none','--hrk-ls':'0','--hrk-color':'var(--c-text-2)','--hrk-var':'normal',
         '--hrn-font':B,'--hrn-size':'48px','--hrn-weight':'800','--hrn-lh':'1','--hrn-ls':'-.01em','--hrn-h':'auto','--hrn-m':'0','--hrn-var':"'wdth' 100",'--hrn-prefix':'"#"','--trio-gap':'12px','--trio-mt':'6px','--cred-pt':'12px','--cred-bt':'0',
         '--cm-mt':'0','--cm-top-mb':'10px','--cm-num-size':'36px','--cm-num-size-c':'28px','--cmn-font':B,'--cmn-weight':'800','--cmn-var':"'wdth' 100",'--cmo-font':T,'--cmo-size':'15px','--cm-label-align':'right',
         '--cm-cells-display':'grid','--cm-cols':'8','--cm-gap':'6px','--cm-row-gap':'6px','--cm-row-h':'22px','--cm-marks-display':'none',
         '--cell-w':'100%','--cell-h':'22px','--cell-h5':'22px','--cell-r':'7px','--cell-todo-bg':'transparent','--cell-todo-bd':'2px dashed var(--c-control-border)','--cell-done-bg':'var(--c-accent-graph)','--cell-done-bd':'var(--c-accent-graph)',
         '--cell-cur-w':'100%','--cell-cur-h':'22px','--cell-cur-bg':'var(--c-surface)','--cell-cur-bd':'3px solid var(--c-accent-graph)','--cell-cur-outline':'0',
         '--stats-gap':'8px','--stats-bt':'0','--stat-pad':'12px','--stat-pad-first':'12px','--stat-bg':'var(--c-surface)','--stat-r':'18px','--stat-sh':'0 3px 0 var(--c-border)','--stat-bl':'0','--stat-font':B,'--stat-size':'26px','--stat-weight':'800','--stat-var':"'wdth' 100",'--stat-case':'none',
         '--sheet-bg':'var(--c-surface)','--sheet-bt':'0','--grab-h':'6px','--grab-r':'3px','--sheetn-font':B,'--sheetn-size':'36px','--sheetn-weight':'800','--sheetn-case':'none','--sheetn-ls':'-.01em','--sheetn-var':"'wdth' 100",'--sheet-title-align':'center','--sheet-title-j':'center','--sheet-tier-display':'none',
         '--modal-bg':'var(--c-surface)','--modal-bd':'0','--modal-sh':m('0 8px 0 rgba(0,0,0,.35)','0 6px 0 rgba(23,32,54,.16)'),'--mt-font':B,'--mt-size':'28px','--mt-weight':'800','--mt-case':'none','--mt-ls':'-.01em','--mt-var':"'wdth' 100",
         '--toast-bg':'var(--c-text)','--toast-fg':'var(--c-bg)','--toast-r':'18px','--toast-sh':m('0 4px 0 rgba(0,0,0,.35)','0 4px 0 rgba(23,32,54,.22)'),'--toast-ic':'var(--toast-fg)','--toast-act-bg':'var(--c-accent)','--toast-act-fg':'var(--c-on-accent)','--toast-act-r':'12px','--toast-act-font':'800 14px '+B,'--toast-act-deco':'none','--toast-err-bg':'var(--c-bad-bg)','--toast-err-fg':'var(--c-bad-fg)',
         '--ico-gap':'8px','--ico-bd':'0','--ico-r':'14px','--ico-bg':'var(--c-surface)',
         '--sk-bg':'var(--c-surface-2)','--sk-r':'14px','--sk-dur':'1.4s','--sk-shimmer':m('linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)','linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent)'),
        })
    if name=='cartaz':
        D="'Big Shoulders','Big Shoulders Fallback','Arial Narrow',Impact,sans-serif"; H="'Hanken','Hanken Fallback',"+SANS_ARIAL
        x.update({
         '--hr-dir':'column','--hr-align':'flex-start','--hr-mb':'0px','--hrk-font':H,'--hrk-size':'12px','--hrk-weight':'800','--hrk-case':'uppercase','--hrk-ls':'.12em','--hrk-color':'var(--c-text-2)','--hrk-var':'normal',
         '--hrn-font':D,'--hrn-size':'250px','--hrn-weight':'900','--hrn-lh':'.8','--hrn-ls':'-.02em','--hrn-h':'176px','--hrn-m':'4px 0 0 -8px','--hrn-var':'normal','--hrn-prefix':'""','--trio-gap':'8px','--trio-mt':'-40px','--cred-pt':'12px','--cred-bt':'1px solid var(--c-border)',
         '--cm-mt':'0','--cm-top-mb':'6px','--cm-num-size':'72px','--cm-num-size-c':'44px','--cmn-font':D,'--cmn-weight':'900','--cmn-var':'normal','--cmo-font':D,'--cmo-size':'24px','--cm-label-align':'right',
         '--cm-cells-display':'grid','--cm-cols':'40','--cm-gap':'2px','--cm-row-gap':'0px','--cm-row-h':'26px','--cm-marks-display':'none',
         '--cell-w':'100%','--cell-h':'16px','--cell-h5':'16px','--cell-r':'0','--cell-todo-bg':'transparent','--cell-todo-bd':'1.5px solid var(--c-control-border)','--cell-done-bg':'var(--c-text)','--cell-done-bd':'var(--c-text)',
         '--cell-cur-w':'100%','--cell-cur-h':'26px','--cell-cur-bg':'var(--c-bg)','--cell-cur-bd':'3px solid var(--c-text)','--cell-cur-outline':'0',
         '--stats-gap':'0px','--stats-bt':'1px solid var(--c-text)','--stat-pad':'10px 10px','--stat-pad-first':'0px','--stat-bg':'transparent','--stat-r':'0','--stat-sh':'none','--stat-bl':'1px solid var(--c-border)','--stat-font':D,'--stat-size':'44px','--stat-weight':'900','--stat-var':'normal','--stat-case':'uppercase',
         '--sheet-bg':'var(--c-bg)','--sheet-bt':'4px solid var(--c-text)','--grab-h':'6px','--grab-r':'0','--sheetn-font':D,'--sheetn-size':'64px','--sheetn-weight':'900','--sheetn-case':'uppercase','--sheetn-ls':'0','--sheetn-var':'normal','--sheet-title-align':'left','--sheet-title-j':'space-between','--sheet-tier-display':'block',
         '--modal-bg':'var(--c-bg)','--modal-bd':'4px solid var(--c-text)','--modal-sh':'none','--mt-font':D,'--mt-size':'40px','--mt-weight':'900','--mt-case':'uppercase','--mt-ls':'0','--mt-var':'normal',
         '--toast-bg':'var(--c-text)','--toast-fg':'var(--c-bg)','--toast-r':'0','--toast-sh':'none','--toast-ic':'var(--toast-fg)','--toast-act-bg':'var(--c-bg)','--toast-act-fg':'var(--c-text)','--toast-act-r':'0','--toast-act-font':'900 17px '+D,'--toast-act-deco':'none','--toast-err-bg':'var(--c-bad-bg)','--toast-err-fg':'var(--c-bad-fg)',
         '--ico-gap':'0px','--ico-bd':'1px solid var(--c-border)','--ico-r':'0','--ico-bg':'transparent',
         '--sk-bg':'var(--c-surface-2)','--sk-r':'0','--sk-dur':'1.4s','--sk-shimmer':m('linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)','linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent)'),
        })
    return x

def build():
    out=['/* DroidDeck: tokens.css (GERADO por tools/gen_tokens.py, não edite à mão).\n   3 temas x 2 modos. Aplique no <html>: data-theme="oficina|figurinhas|cartaz" data-mode="dark|light".\n   Tema padrão: oficina. Sem JS: claro por padrão e escuro via prefers-color-scheme. */']
    out.append(':root,[data-theme]{'+';'.join(f'{k}:{v}' for k,v in BASE.items())+'}')
    allnames=[]
    for name in THEMES:
        d={**theme_vars(name,True),**extra(name,True)}
        l={**theme_vars(name,False),**extra(name,False)}
        same={k:d[k] for k in d if d[k]==l.get(k)}
        dk={k:d[k] for k in d if k not in same}
        lk={k:l[k] for k in l if k not in same}
        assert set(dk)==set(lk),name
        sel_theme=f'[data-theme={name}]'+(',:root:not([data-theme])' if name=='oficina' else '')
        out.append(f'/* ===== {name}: estrutura (igual nos 2 modos) ===== */')
        out.append(sel_theme+'{'+';'.join(f'{k}:{v}' for k,v in same.items())+'}')
        sel_l=f'[data-theme={name}][data-mode=light],[data-theme={name}]:not([data-mode])'+(',:root:not([data-theme]):not([data-mode]),:root:not([data-theme])[data-mode=light]' if name=='oficina' else '')
        sel_d=f'[data-theme={name}][data-mode=dark]'+(',:root:not([data-theme])[data-mode=dark]' if name=='oficina' else '')
        out.append(f'/* ===== {name}: claro ===== */')
        out.append(sel_l+'{color-scheme:light;'+';'.join(f'{k}:{v}' for k,v in lk.items())+'}')
        out.append(f'/* ===== {name}: escuro ===== */')
        out.append(sel_d+'{color-scheme:dark;'+';'.join(f'{k}:{v}' for k,v in dk.items())+'}')
        sel_md=f'[data-theme={name}]:not([data-mode])'+(',:root:not([data-theme]):not([data-mode])' if name=='oficina' else '')
        out.append(f'@media (prefers-color-scheme:dark){{{sel_md}{{color-scheme:dark;'+';'.join(f'{k}:{v}' for k,v in dk.items())+'}}')
        allnames.append((name,set(d)))
    css='\n'.join(out)+'\n'
    open('css/tokens.css','w').write(css)
    # cobertura: toda var usada em components.css está definida nos 3 temas
    used=set(re.findall(r'var\((--[a-z0-9-]+)',open('css/components.css').read()))
    inline=set()
    for f in ['tools/ui.py','tools/screens.py']:
        try: inline|=set(re.findall(r'var\((--[a-z0-9-]+)',open(f).read()))
        except FileNotFoundError: pass
    local={'--p','--tier-bg','--tier-num','--tag-bg','--tag-fg','--tag-sh','--tag-sq-bg','--tag-sq-bd','--toast-bg','--toast-fg','--toast-ic','--toast-act-fg','--toast-act-bg'}
    for n,s in allnames:
        miss=(used|inline)-s-set(BASE)-local
        print(n,'vars',len(s),'faltando',sorted(miss))
    print('bytes',len(css))
build()
