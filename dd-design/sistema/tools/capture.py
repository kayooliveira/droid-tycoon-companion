"""Prints de TODAS as telas nos 6 combos (3 temas x 2 modos), 390px, escala 2, + pranchas comparativas."""
import json,os,sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ROOT='/workspace/dd-design/sistema'
THEMES=['oficina','figurinhas','cartaz']; MODES=['dark','light']
SCREENS=[s for s,_ in json.load(open(ROOT+'/html/screens.json'))]
only=sys.argv[1:] 
def url(s,t,m): return f'file://{ROOT}/html/{s}.html?theme={t}&mode={m}'
def shoot(pw_page,s,t,m,w=390):
    pw_page.goto(url(s,t,m)); pw_page.evaluate('document.fonts.ready'); pw_page.wait_for_load_state('networkidle')
    pw_page.evaluate('Promise.all([...document.images].map(i=>i.decode().catch(()=>0)))')
    pw_page.wait_for_timeout(120)
    out=f'{ROOT}/prints/{t}/{m}/{s}.png'; os.makedirs(os.path.dirname(out),exist_ok=True)
    pw_page.screenshot(path=out,full_page=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,reduced_motion='reduce',locale='pt-BR')
    pg=ctx.new_page()
    for s in SCREENS:
        if only and s not in only: continue
        for t in THEMES:
            for m in MODES: shoot(pg,s,t,m)
    b.close()
# pranchas comparativas: 6 combos lado a lado (linha escuro em cima, claro embaixo), com legenda
try: F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except: F=None
os.makedirs(ROOT+'/prints/comparativo',exist_ok=True)
for s in SCREENS:
    if only and s not in only: continue
    ims={(t,m):Image.open(f'{ROOT}/prints/{t}/{m}/{s}.png').convert('RGB') for t in THEMES for m in MODES}
    h=max(i.height for i in ims.values()); w=780; gap=24; pad=24; cap=56
    W=pad*2+3*w+2*gap; H=pad+2*(cap+h)+gap+pad
    B=Image.new('RGB',(W,H),(128,128,128)); d=ImageDraw.Draw(B)
    for r,m in enumerate(MODES):
        for c,t in enumerate(THEMES):
            x=pad+c*(w+gap); y=pad+r*(cap+h+gap)
            d.text((x,y+10),f'{t} · {"escuro" if m=="dark" else "claro"}',fill=(255,255,255),font=F)
            B.paste(ims[(t,m)],(x,y+cap))
    B.save(f'{ROOT}/prints/comparativo/{s}.png')
print('ok')
