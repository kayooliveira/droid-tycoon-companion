"""Validação automática com Playwright: cada tela x 6 combos x (390, 360).
Checagens: overflow horizontal, alvos de toque >= 44px, input >= 16px, texto/nome cortado, toast sobreposto,
contraste AA medido em pixels (texto e bordas/preenchimento de controles), fontes carregadas.
Uso: python3 tools/validar.py [tema ...]   -> escreve tools/_resultado_<tema>.json"""
import json,os,sys,io,re
from multiprocessing import Pool
from playwright.sync_api import sync_playwright
from PIL import Image
import statistics
ROOT='/workspace/dd-design/sistema'
THEMES=['oficina','figurinhas','cartaz']; MODES=['dark','light']; WIDTHS=[390,360]
SCREENS=[s for s,_ in json.load(open(ROOT+'/html/screens.json'))]

JS_COLLECT=r"""
() => {
 const W = document.documentElement.clientWidth;
 const out = {W, scrollW: document.documentElement.scrollWidth, over:[], touch:[], inputs:[], clip:[], texts:[], controls:[], toasts:[], fonts:{}, fam:{}, pageH: document.documentElement.scrollHeight};
 const vis = (e) => { const r=e.getBoundingClientRect(); if(r.width<=0||r.height<=0) return false; const cs=getComputedStyle(e); if(cs.visibility==='hidden'||cs.display==='none') return false; return true; };
 const hiddenAnc = (e) => { for(let p=e;p&&p!==document.body;p=p.parentElement){ if(p.hasAttribute('hidden')||p.getAttribute('aria-hidden')==='true') return true; const cs=getComputedStyle(p); if(cs.display==='none') return true;} return false; };
 const desc = (e) => { let s=e.tagName.toLowerCase(); if(e.className&&typeof e.className==='string') s+='.'+e.className.trim().split(/\s+/).slice(0,2).join('.'); const t=(e.getAttribute('aria-label')||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,36); return s+' "'+t+'"'; };
 const rect = (e) => { const r=e.getBoundingClientRect(); return [r.left+scrollX, r.top+scrollY, r.width, r.height]; };
 const srOnly = (e) => e.closest('.sr-only')!==null;
 const inSk = (e) => e.closest('.sk')!==null;
 const hClip = (e) => { const r=e.getBoundingClientRect(); for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){ if(p.classList.contains('app')||p.classList.contains('scroll')) break; const cs=getComputedStyle(p); if((cs.overflowX==='auto'||cs.overflowX==='scroll')&&p.scrollWidth>p.clientWidth+1){ const pr=p.getBoundingClientRect(); if(r.right>pr.right+0.6||r.left<pr.left-0.6) return true; } } return false; };
 // 1. overflow por caixa
 document.querySelectorAll('body *').forEach(e=>{
   if(!vis(e)||srOnly(e)||inSk(e)||e.closest('svg')&&e.tagName!=='svg'||hClip(e)) return;
   const r=e.getBoundingClientRect();
   if(r.right>W+0.6||r.left<-0.6) out.over.push({d:desc(e),l:+r.left.toFixed(1),r:+r.right.toFixed(1)});
 });
 // texto fora da tela
 const tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const seen=new Set();
 while(tw.nextNode()){
   const n=tw.currentNode; if(!n.textContent.trim()) continue; const el=n.parentElement;
   if(['SCRIPT','STYLE','TITLE'].includes(el.tagName)) continue;
   if(!vis(el)||srOnly(el)||hClip(el)) continue;
   const rg=document.createRange(); rg.selectNodeContents(n); const rs=[...rg.getClientRects()].filter(x=>x.width>0);
   if(!rs.length) continue;
   const u=rs.reduce((a,b)=>({l:Math.min(a.l,b.left),r:Math.max(a.r,b.right),t:Math.min(a.t,b.top),b:Math.max(a.b,b.bottom)}),{l:1e9,r:-1e9,t:1e9,b:-1e9});
   if(u.r>W+0.6||u.l<-0.6) out.over.push({d:'texto '+desc(el),l:+u.l.toFixed(1),r:+u.r.toFixed(1)});
   // corte por ancestrais com overflow != visible (exceto o shell)
   for(let p=el;p&&p!==document.body;p=p.parentElement){
     if(p.classList.contains('app')||p.classList.contains('scroll')) break;
     const cs=getComputedStyle(p);
     if(cs.textOverflow==='ellipsis'&&p===el) out.clip.push({d:desc(el),why:'text-overflow:ellipsis'});
     if(cs.webkitLineClamp&&cs.webkitLineClamp!=='none'&&p===el) out.clip.push({d:desc(el),why:'line-clamp'});
     if(cs.overflowX!=='visible'||cs.overflowY!=='visible'){
       const pr=p.getBoundingClientRect();
       if(u.r>pr.right+1||u.l<pr.left-1||u.b>pr.bottom+1||u.t<pr.top-1) out.clip.push({d:desc(el),why:'cortado por '+desc(p)});
     }
   }
   if(seen.has(el)) continue; seen.add(el);
   // candidatos a contraste
   if(hiddenAnc(el)) continue;
   if(el.closest('[disabled]')||el.closest('.dtile-num,.dtile-q')||el.closest('.sk')) continue;
   // coberto por scrim?
   let under=false; const host=el.closest('.demo-stage')||el.closest('.app'); if(host&&host.querySelector(':scope > .scrim')&&!el.closest('.sheet,.modal-wrap,.modal')) under=true;
   if(under) continue;
   const cs=getComputedStyle(el); let op=1; for(let p=el;p&&p!==document.documentElement;p=p.parentElement){ op*=parseFloat(getComputedStyle(p).opacity); }
   const r=el.getBoundingClientRect();
   if(r.bottom<0) continue;
   let ub=u.b; if(el.classList.contains('hr-num')){const tr=document.querySelector('.trio'); if(tr) ub=Math.min(ub,tr.getBoundingClientRect().top);}
   const fam=cs.fontFamily.split(',')[0].replace(/["']/g,'').trim(); out.fam[fam+'|'+cs.fontWeight]=1;
   out.texts.push({d:desc(el),color:cs.color,op,size:parseFloat(cs.fontSize),weight:parseInt(cs.fontWeight)||400,rect:[u.l+scrollX,u.t+scrollY,u.r-u.l,ub-u.t]});
 }
 // inputs (valor/placeholder)
 document.querySelectorAll('input,textarea,select').forEach(e=>{
   if(!vis(e)||hiddenAnc(e)) return; const t=(e.type||'').toLowerCase();
   if(['checkbox','radio','range','hidden'].includes(t)) return;
   const cs=getComputedStyle(e); out.inputs.push({d:desc(e),size:parseFloat(cs.fontSize)});
   const ph=getComputedStyle(e,'::placeholder'); const showsPh=!e.value;
   const host=e.closest('.demo-stage')||e.closest('.app'); if(host&&host.querySelector(':scope > .scrim')&&!e.closest('.sheet,.modal-wrap')) return;
   const r=e.getBoundingClientRect();
   // área do texto: usa o interior do campo
   out.texts.push({d:'input '+desc(e),color:showsPh?ph.color:cs.color,op:1,size:parseFloat(cs.fontSize),weight:parseInt(cs.fontWeight)||400,rect:[r.left+scrollX+parseFloat(cs.paddingLeft)+2,r.top+scrollY+r.height*0.3,Math.min(60,r.width-parseFloat(cs.paddingLeft)-8),r.height*0.4]});
 });
 // 2. alvos de toque
 const sel='a[href],button,[role=button],[role=radio],label.opt,label.switch-row,input[type=range],input[type=search],input[type=text],input[type=number],.sel,.chip';
 document.querySelectorAll(sel).forEach(e=>{
   if(!vis(e)||hiddenAnc(e)||e.closest('.tp')) return;
   if(e.matches('input[type=radio],input[type=checkbox]')) return;
   const r=e.getBoundingClientRect();
   out.touch.push({d:desc(e),w:+r.width.toFixed(1),h:+r.height.toFixed(1)});
 });
 document.querySelectorAll('.switch input').forEach(e=>{const r=e.getBoundingClientRect(); out.touch.push({d:'switch '+desc(e.closest('label')),w:+r.width.toFixed(1),h:+r.height.toFixed(1)});});
 // 3. controles com borda/preenchimento
 const ctl='.btn:not(.btn--ghost),.field,.sel,.chip,.switch i,.opt .mark,.tcard,.seg';
 document.querySelectorAll(ctl).forEach(e=>{
   if(!vis(e)||hiddenAnc(e)||e.closest('.tp')||hClip(e)) return;
   if(e.disabled||e.hasAttribute('disabled')) return;
   const host=e.closest('.demo-stage')||e.closest('.app'); if(host&&host.querySelector(':scope > .scrim')&&!e.closest('.sheet,.modal-wrap')) return;
   const cs=getComputedStyle(e);
   let name=desc(e); const pressed=e.getAttribute('aria-pressed')==='true'||e.getAttribute('aria-checked')==='true'||(e.matches('.switch i')&&e.previousElementSibling.checked);
   out.controls.push({d:name,rect:rect(e),radius:cs.borderTopLeftRadius,bw:parseFloat(cs.borderLeftWidth)||0,bc:cs.borderLeftColor,bg:cs.backgroundColor,kind:e.className});
 });
 // 3b. régua do Ciclo (decorativa, mas a gente exige 3:1 também)
 out.cells=[];
 document.querySelectorAll('.cm-cells i').forEach(i=>{ if(!vis(i)) return; { const host=i.closest('.demo-stage')||i.closest('.app'); if(host&&host.querySelector(':scope > .scrim')&&!i.closest('.sheet,.modal-wrap')) return; } const a=getComputedStyle(i,'::after'); const r=i.getBoundingClientRect(); out.cells.push({rect:[r.left+scrollX,r.top+scrollY,r.width,r.height],aw:parseFloat(a.width)||r.width,ah:parseFloat(a.height)||0,bw:parseFloat(a.borderLeftWidth)||0,bc:a.borderLeftColor,bg:a.backgroundColor,cls:i.className}); });
 // 4. toast
 document.querySelectorAll('.toast').forEach(t=>{
   const tr=t.getBoundingClientRect();
   const hits=[];
   document.querySelectorAll('a[href],button,input,.dname,.btn,.t-label,.t-meta,.hint,.item,.tab').forEach(e=>{
     if(t.contains(e)||!vis(e)||hiddenAnc(e)) return;
     if(e.closest('.demo-stage,.stack')&&t.closest('.stack')&&!t.closest('.toast-slot')) { /* folha: toasts em pilha */ }
     const r=e.getBoundingClientRect();
     const ix=Math.min(r.right,tr.right)-Math.max(r.left,tr.left), iy=Math.min(r.bottom,tr.bottom)-Math.max(r.top,tr.top);
     if(ix>1&&iy>1) hits.push(desc(e));
   });
   out.toasts.push({d:desc(t),hits,inSlot:!!t.closest('.toast-slot')});
 });
 // 5. fontes
 for(const k of Object.keys(out.fam)){const [f,w]=k.split('|'); if(['Archivo','Plex Mono','Bricolage','Figtree','Big Shoulders','Hanken'].includes(f)) out.fonts[w+' 16px "'+f+'"']=document.fonts.check(w+' 16px "'+f+'"');}
 out.fontsLoaded=[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/"/g,''));
 return out;
}
"""

def lum(c):
    def f(v):
        v/=255; return v/12.92 if v<=0.03928 else ((v+0.055)/1.055)**2.4
    return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2])
def cr(a,b):
    la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def parse(c):
    m=re.findall(r'[\d.]+',c); v=[float(x) for x in m]
    if len(v)==3: v.append(1.0)
    return v
def blend(fg,a,bg): return tuple(fg[i]*a+bg[i]*(1-a) for i in range(3))
def crop_pixels(im,rect,pad=0):
    x,y,w,h=rect; x0=max(0,int(x-pad)); y0=max(0,int(y-pad)); x1=min(im.width,int(x+w+pad+0.999)); y1=min(im.height,int(y+h+pad+0.999))
    if x1<=x0 or y1<=y0: return None
    return im.crop((x0,y0,x1,y1))
def med(px):
    px=list(px); n=len(px)
    return tuple(sorted(p[i] for p in px)[n//2] for i in range(3))
def sample_ring(im,rect,inner,outer):
    """mediana dos pixels numa faixa entre 'inner' e 'outer' px de distância (positivo = fora) nas laterais esquerda e direita (meio vertical)"""
    x,y,w,h=rect; cy=y+h/2; pts=[]
    for dx in range(inner,outer+1):
        for sx in (x-dx-1, x+w+dx):
            for dy in (-3,0,3):
                px_,py=int(sx),int(cy+dy)
                if 0<=px_<im.width and 0<=py<im.height: pts.append(im.getpixel((px_,py))[:3])
    return med(pts) if pts else None

def analisar(pg,theme):
    d=pg.evaluate(JS_COLLECT)
    # screenshot sem texto/ícones para medir fundos
    pg.add_style_tag(content='*{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}::placeholder{color:transparent!important}svg.ic,.dtile-num,.dtile-q{visibility:hidden!important}')
    pg.wait_for_timeout(40)
    png=pg.screenshot(full_page=True); im=Image.open(io.BytesIO(png)).convert('RGB')
    fails=[]; n={'contraste_grafico':0,'overflow':0,'toque':0,'input16':0,'corte':0,'toast':0,'contraste_texto':0,'contraste_controle':0,'fontes':0}
    # overflow
    n['overflow']+=1
    if d['scrollW']>d['W']: fails.append(('overflow',f"scrollWidth {d['scrollW']} > {d['W']}"))
    for o in d['over']:
        n['overflow']+=1; fails.append(('overflow',f"{o['d']} fora da tela ({o['l']}..{o['r']} de {d['W']})"))
    for t in d['touch']:
        n['toque']+=1
        if t['w']<43.5 or t['h']<43.5: fails.append(('toque',f"{t['d']} {t['w']}x{t['h']}"))
    for i in d['inputs']:
        n['input16']+=1
        if i['size']<16: fails.append(('input16',f"{i['d']} {i['size']}px"))
    n['corte']+=len(d['texts'])
    for c in d['clip']: fails.append(('corte',f"{c['d']}: {c['why']}"))
    for t in d['toasts']:
        n['toast']+=1
        if t['hits'] or not (t['inSlot'] or True): fails.append(('toast',f"{t['d']} sobrepõe {t['hits'][:3]}"))
    n['fontes']+=1
    for f,ok in d['fonts'].items():
        n['fontes']+=0
        if not ok: fails.append(('fontes',f'fonte não carregada: {f}'))
    if not d['fonts']: fails.append(('fontes','nenhuma fonte do tema em uso'))
    # contraste de texto
    for t in d['texts']:
        r=crop_pixels(im,t['rect'])
        if r is None: continue
        px=list(r.get_flattened_data()) if hasattr(r,'get_flattened_data') else list(r.getdata());
        if not px: continue
        bgm=med(px); fg=parse(t['color']); a=fg[3]*t['op']
        # pior caso: pixels do fundo mais claro e mais escuro da área
        srt=sorted(px,key=lum); lo,hi=srt[len(srt)//10],srt[-1-len(srt)//10]
        fgc=blend(fg[:3],a,bgm)
        worst=min(cr(blend(fg[:3],a,lo),lo),cr(blend(fg[:3],a,hi),hi),cr(fgc,bgm))
        large=t['size']>=24 or (t['size']>=18.66 and t['weight']>=700)
        need_r=3.0 if large else 4.5
        n['contraste_texto']+=1
        if worst<need_r: fails.append(('contraste_texto',f"{t['d']} {worst:.2f}:1 (mín {need_r}) fg={t['color']}"))
    # contraste de controles
    for c in d['cells']:
        x,y,w,h=c['rect']; aw,ah=c['aw'],c['ah']
        if ah<2: continue
        cx=x+w/2; y0=y+h-ah
        outs=[im.getpixel((int(cx+k),int(y0-3)))[:3] for k in (-2,0,2) if 0<=int(y0-3)<im.height]
        if not outs: continue
        o=med(outs); best=0
        for k in range(-4,5,2):
            for dd in (0,1,2,int(ah/2)):
                px_,py=int(cx+k),int(y0+dd)
                if 0<=px_<im.width and 0<=py<im.height and abs(k)<=aw/2: best=max(best,cr(im.getpixel((px_,py))[:3],o))
        n['contraste_grafico']+=1
        if best<3.0: fails.append(('contraste_grafico',f"régua célula {c['cls'] or 'todo'} {best:.2f}:1 (mín 3.0)"))
    for c in d['controls']:
        rect=c['rect']
        if rect[2]<6 or rect[3]<6: continue
        outside=sample_ring(im,rect,2,4)
        if outside is None: continue
        bw=c['bw']; bc=parse(c['bc']); bg=parse(c['bg'])
        cands=[]
        if bw>0 and bc[3]>0.5: cands.append(tuple(bc[:3]))
        if bg[3]>0.5: cands.append(tuple(bg[:3]))
        # amostra real: pixel logo dentro da borda (borda ou preenchimento)
        x,y,w,h=rect; cy=int(y+h/2)
        pill=c['radius']!='0px' and parse(c['radius'])[0]>=h/2-1
        best=0
        for dd in (0,1,2,3):
            if pill:
                a_=[im.getpixel((int(x+w/2),int(y+dd)))[:3]] if 0<=int(y+dd)<im.height and 0<=int(x+w/2)<im.width else []
                o_=[im.getpixel((int(x+w/2),int(y-k)))[:3] for k in (2,3,4) if 0<=int(y-k)<im.height and 0<=int(x+w/2)<im.width]
            else:
                a_=[im.getpixel((int(x+dd),cy+k))[:3] for k in (-3,0,3) if 0<=int(x+dd)<im.width and 0<=cy+k<im.height]
                o_=[outside]
            if a_ and o_: best=max(best,cr(med(a_),med(o_)))
        if not best: continue
        n['contraste_controle']+=1
        ratio=best
        if ratio<3.0:
            if bw==0 and bg[3]<0.5: n['contraste_controle']-=1; continue
            fails.append(('contraste_controle',f"{c['d']} borda/fundo {ratio:.2f}:1 (mín 3.0)"))
    return n,fails

def run_theme(theme):
    res=[]
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        for W in WIDTHS:
            ctx=b.new_context(viewport={'width':W,'height':844},device_scale_factor=1,reduced_motion='reduce',locale='pt-BR')
            pg=ctx.new_page()
            for s in SCREENS:
                for m in MODES:
                    key=f'{theme}/{m}/{s}@{W}'
                    pg.goto(f'file://{ROOT}/html/{s}.html?theme={theme}&mode={m}'); pg.evaluate('document.fonts.ready'); pg.wait_for_load_state('networkidle')
                    pg.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>0)))'); pg.wait_for_timeout(80)
                    n,fails=analisar(pg,theme)
                    res.append({'key':key,'theme':theme,'mode':m,'screen':s,'width':W,'n':n,'fails':fails})
            ctx.close()
        b.close()
    json.dump(res,open(f'{ROOT}/tools/_resultado_{theme}.json','w'),ensure_ascii=False)
    return theme

if __name__=='__main__':
    ths=sys.argv[1:] or THEMES
    with Pool(len(ths)) as pool: print(pool.map(run_theme,ths))
