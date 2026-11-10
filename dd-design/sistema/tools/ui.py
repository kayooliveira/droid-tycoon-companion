"""Construtores de marcação (UMA estrutura para os 3 temas). Nenhuma função aqui conhece o tema."""
import sys, os, json, html
sys.path.insert(0,'/workspace/dd-design/_shared')
import common as C
ROOT='/workspace/dd-design/sistema'
D=json.load(open('/workspace/droid-tycoon-research/data.json'))
DR={x['id']:x for x in D['droids']}
HAVE={f[:-5] for f in os.listdir(ROOT+'/assets/droids')}
TL=dict(C.TL); TL['scourge']='Scourge'
TN=dict(C.TN); TN['scourge']=9
RAR_PT={'Common':'Comum','Rare':'Raro','Epic':'Épico','Legendary':'Lendário','Mythic':'Mítico','Iconic':'Icônico'}
TIERS9=['default','gold','diamond','rainbow','beskar','galactic','stellar','kyber','scourge']
ICONS=dict(C.ICONS)

def esc(s): return html.escape(s,quote=True)
def ic(name,size=24,extra=''):
    return f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" aria-hidden="true"{extra}>{ICONS[name]}</svg>'
def dname(i):
    return DR[i]['name'] if i in DR else i.upper()
def rar(i):
    return RAR_PT.get(DR[i]['baseRarity'],'') if i in DR else ''
def num(tier): return 'S' if tier=='scourge' else f'{TN[tier]:02d}'

def tile(i,tier='default',size='',qty=None,missing=False,showq=False):
    """Droid tile. size: '', 'sm', 'xs', 'lg'. Sem imagem local vira vaga com silhueta."""
    if i not in HAVE: missing=True; src='pit'
    else: src=i
    cls='dtile'+(f' dtile--{size}' if size else '')+(' dtile--missing' if missing else '')
    q=f'<span class="dtile-qty" aria-label="quantidade {qty}">×{qty}</span>' if qty and qty>1 else ''
    n='' if missing else f'<span class="dtile-num" aria-hidden="true">{num(tier)}</span>'
    return (f'<span class="{cls}" data-tier="{tier}"><span class="dtile-bg"></span>{n}<img src="../assets/droids/{src}.webp" alt="" width="128" height="128" loading="eager">'
            f'{q}<span class="dtile-q" aria-hidden="true">?</span></span>')

def tag(kind,text):
    icon={'ok':'check','bad':'x','mute':'plus'}[kind]
    return f'<span class="tag tag--{kind}"><i class="tag-sq" aria-hidden="true"></i>{ic(icon,14)}{esc(text)}</span>'

def btn(text,kind='primary',icon=None,extra='',cls='',disabled=False):
    k={'primary':'btn--primary','secondary':'btn--secondary','danger':'btn--danger','danger-solid':'btn--danger-solid','ghost':'btn--ghost'}[kind]
    i=ic(icon,22) if icon else ''
    return f'<button class="btn {k} {cls}"{" disabled" if disabled else ""} {extra}>{i}{esc(text)}</button>'
def ibtn(icon,label,kind='secondary',size=22):
    return f'<button class="btn btn--icon btn--{kind}" aria-label="{esc(label)}">{ic(icon,size)}</button>'

TABS=[('home','Início'),('progress','Progresso'),('inventory','Inventário'),('cycles','Ciclos'),('more','Mais')]
def tabbar(active):
    out='<nav class="tabbar" aria-label="Principal">'
    for k,l in TABS:
        cur=' aria-current="page"' if k==active else ''
        out+=f'<a class="tab" href="#"{cur}><span class="tab-ic">{ic(k,24)}</span><span>{l}</span></a>'
    return out+'</nav>'

def top(title,aside='',back=None):
    b=''
    if back: b=f'<div class="backbar"><a class="top-back" href="#">{ic("chev",20)}{esc(back)}</a></div>'
    return b+f'<header class="top"><span class="top-brand" aria-hidden="true">DroidDeck</span><div class="top-aside">{aside}</div><h1 class="t-display">{esc(title)}</h1></header>'

def cyc_chip(t='Ciclo 5'): return f'<span class="chip-static">{esc(t)}</span>'
def sec_h(title,right=''):
    r=f'<span class="t-label">{esc(right)}</span>' if right else ''
    return f'<div class="sec-h"><h2 class="t-h2">{esc(title)}</h2>{r}</div>'
def sec(title,body,right='',extra=''):
    return f'<section class="sec"{extra}>{sec_h(title,right)}{body}</section>'

def seg(labels,on,aria='Visão'):
    b=''.join(f'<button aria-pressed="{"true" if i==on else "false"}">{esc(l)}</button>' for i,l in enumerate(labels))
    return f'<div class="seg" role="group" aria-label="{esc(aria)}">{b}</div>'

def meter(done=29,total=40,compact=False,label='Ciclo 5',foot='Super Renascimento depois do #40'):
    cells=''
    for n in range(1,total+1):
        c='done' if n<=done else ('cur' if n==done+1 else '')
        if n%5==0: c+=' m5'
        cells+=f'<i class="{c.strip()}"></i>'
    marks=''.join(f'<span style="left:{(n-.5)/total*100:.2f}%">{n}</span>' for n in (10,20,30,40))
    return (f'<div class="cm{" cm--compact" if compact else ""}"><div class="cm-top"><span class="cm-num">{done}</span><span class="cm-of">de {total}</span>'
            f'<span class="cm-label t-label">{esc(label)}</span></div><div class="cm-cells" aria-hidden="true">{cells}</div><div class="cm-marks" aria-hidden="true">{marks}</div>'
            f'<div class="cm-foot"><span class="t-meta">{esc(foot)}</span></div></div>')

def req_col(i,tier,st):
    t=tag('ok','Ok') if st=='ok' else tag('bad','Falta')
    return (f'<button class="req-col" aria-label="Abrir {esc(dname(i))} {TL[tier]}">{tile(i,tier)}<span class="dname">{esc(dname(i))}</span>'
            f'<span class="t-meta">{TL[tier]}</span>{t}</button>')
def hero(n=30,reqs=C.REQ,kicker='Próximo renascimento'):
    return (f'<section class="hero"><div class="hr-head"><h2 class="hr-kicker">{esc(kicker)}</h2><span class="hr-num" aria-label="Renascimento {n}">{n}</span></div>'
            f'<div class="trio">{"".join(req_col(*r) for r in reqs)}</div></section>')

def stats(items):
    return '<div class="stats">'+''.join(f'<div class="stat"><span class="t-label">{esc(l)}</span><b>{v}</b></div>' for l,v in items)+'</div>'

def item(i,tier,note='',status=None,actions='',meta=None,qty=None):
    m=meta if meta is not None else f'{rar(i)} · {TL[tier]}'
    st=''
    if status: st=tag(*status)
    nt=f'<span class="item-note">{esc(note)}</span>' if note else ''
    return (f'<div class="item"><button class="item-open" aria-label="Abrir {esc(dname(i))} {TL[tier]}">{tile(i,tier,"sm")}<span class="item-body"><span class="dname">{esc(dname(i))}</span>'
            f'<span class="t-meta">{esc(m)}</span>{st}{nt}</span></button>{actions}</div>')

def dcard(i,tier,qty=1,note='',status=None,meta=None):
    m=meta if meta is not None else f'{rar(i)} · {TL[tier]}'
    st=tag(*status) if status else ''
    nt=f'<span class="item-note">{esc(note)}</span>' if note else ''
    return (f'<button class="dcard" aria-label="Abrir {esc(dname(i))} {TL[tier]}">{tile(i,tier,qty=qty)}<span class="dname" style="display:block">{esc(dname(i))}</span>'
            f'<span class="t-meta dmeta" style="display:block">{esc(m)}</span>{st}{nt}</button>')

def search(ph='Buscar por nome…',value='',cls=''):
    return f'<div class="field-wrap">{ic("search",20)}<input class="field {cls}" type="search" placeholder="{esc(ph)}" value="{esc(value)}" aria-label="{esc(ph)}"></div>'
def sel(label,value,nm):
    return f'<div><span class="lbl">{esc(label)}</span><button class="sel" style="width:100%;justify-content:space-between" aria-label="{esc(label)}: {esc(value)}">{esc(value)}{ic("down",18)}</button></div>'

def toast(msg,act='Desfazer',kind='',icon='check'):
    a=f'<button class="toast-act">{esc(act)}</button>' if act else ''
    return f'<div class="toast {kind}" role="status">{ic(icon,22)}<span class="toast-msg">{esc(msg)}</span>{a}</div>'

def row(icon,title,sub='',val='',tail=True):
    return (f'<a class="row" href="#"><span class="row-ic">{ic(icon,24)}</span><span class="row-main"><span class="dname" style="display:block">{esc(title)}</span>'
            f'<span class="hint" style="display:block">{esc(sub)}</span></span>'+(f'<span class="row-val">{esc(val)}</span>' if val else '')+(f'<span class="chev">{ic("chev",20)}</span>' if tail else '')+'</a>')

def switch(label,on=True,hint=''):
    h=f'<span class="hint" style="display:block;font-weight:500">{esc(hint)}</span>' if hint else ''
    return f'<label class="switch-row"><span><span style="display:block">{esc(label)}</span>{h}</span><span class="switch"><input type="checkbox" role="switch"{" checked" if on else ""}><i></i></span></label>'

def opts(name,items,sel_i=0):
    o=''
    for k,(t,s) in enumerate(items):
        sm=f'<small>{esc(s)}</small>' if s else ''
        o+=f'<label class="opt"><input type="radio" name="{name}"{" checked" if k==sel_i else ""}><span class="mark"></span><span class="opt-t">{esc(t)}{sm}</span></label>'
    return f'<div class="opts" role="radiogroup">{o}</div>'

def app(body,active,toast_html='',fixed=False,overlay='',tab=True):
    tb=tabbar(active) if tab else ''
    ts=f'<div class="toast-slot">{toast_html}</div>' if toast_html else '<div class="toast-slot" hidden></div>'
    return f'<div class="app"{" data-fixed" if fixed else ""}><main class="scroll">{body}</main>{ts}{tb}{overlay}</div>'

THEMES={'oficina':('Oficina','Plaquinhas, régua e linhas finas. Direto e técnico.'),
        'figurinhas':('Figurinhas','Álbum de figurinhas: cantos redondos e cores vivas.'),
        'cartaz':('Cartaz','Números gigantes, preto e branco, sem cantos.')}
def theme_card(key,selected,small=False):
    n,desc=THEMES[key]
    cols={'oficina':20,'figurinhas':10,'cartaz':20}[key]
    cells=''.join('<i class="done"></i>' for _ in range(12))+'<i class="cur"></i>'+''.join('<i></i>' for _ in range(7))
    pre=(f'<div class="tp" data-theme="{key}" data-theme-scope>{tile("r7","galactic")}<div class="tp-body">'
         f'<div class="cm cm--compact"><div class="cm-top"><span class="cm-num">12</span><span class="cm-of">de 20</span></div>'
         f'<div class="cm-cells" style="--cm-cols:{cols}" aria-hidden="true">{cells}</div></div>'
         f'<span class="tp-btn">Concluir</span></div></div>')
    return (f'<button class="tcard" role="radio" aria-checked="{"true" if selected else "false"}" aria-label="Tema {n}">{pre}'
            f'<span class="tcard-head"><span class="tcard-name"><span class="t-h2" style="display:block">{n}</span><span class="hint" style="display:block">{esc(desc)}</span></span><span class="mark"></span></span></button>')

SCOPE_JS="""<script>(function(){function s(){var m=document.documentElement.dataset.mode;document.querySelectorAll('[data-theme-scope]').forEach(function(e){e.dataset.mode=m})}s();window.__syncScopes=s})()</script>"""
HEAD_JS="""<script>(function(){var d=document.documentElement,q=new URLSearchParams(location.search),t,p;
try{t=localStorage.getItem('dd-theme');p=localStorage.getItem('dd-mode')}catch(e){}
t=q.get('theme')||t||'oficina';if(['oficina','figurinhas','cartaz'].indexOf(t)<0)t='oficina';
p=q.get('mode')||p||'system';if(['system','light','dark'].indexOf(p)<0)p='system';
var mq=matchMedia('(prefers-color-scheme:dark)');
function apply(){d.dataset.mode=p==='system'?(mq.matches?'dark':'light'):p;if(window.__syncScopes)window.__syncScopes()}
d.dataset.theme=t;d.dataset.pref=p;apply();
if(mq.addEventListener)mq.addEventListener('change',function(){if(p==='system')apply()});
var F={oficina:['archivo-var','plex-mono-500','plex-mono-400'],figurinhas:['bricolage-var','figtree-var'],cartaz:['big-shoulders-900','big-shoulders-800','hanken-var']}[t];
F.forEach(function(n){var l=document.createElement('link');l.rel='preload';l.as='font';l.type='font/woff2';l.crossOrigin='';l.href='../assets/fonts/'+n+'.woff2';document.head.appendChild(l)})})()</script>"""
def page(title,body):
    return (f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{esc(title)} | DroidDeck</title><link rel="stylesheet" href="../css/fonts.css"><link rel="stylesheet" href="../css/tokens.css"><link rel="stylesheet" href="../css/components.css">{HEAD_JS}</head>'
            f'<body>{body}{SCOPE_JS}</body></html>')
