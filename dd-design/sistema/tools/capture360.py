"""Pranchas a 360px (escala 1) de telas escolhidas: python3 tools/capture360.py slug ..."""
import sys,os
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT='/workspace/dd-design/sistema'
T=['oficina','figurinhas','cartaz']; M=['dark','light']
os.makedirs(ROOT+'/prints/_360',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    pg=b.new_context(viewport={'width':360,'height':800},device_scale_factor=1,reduced_motion='reduce').new_page()
    for s in sys.argv[1:]:
        ims={}
        for t in T:
            for m in M:
                pg.goto(f'file://{ROOT}/html/{s}.html?theme={t}&mode={m}'); pg.evaluate('document.fonts.ready'); pg.wait_for_load_state('networkidle'); pg.wait_for_timeout(120)
                f='/tmp/_c.png'; pg.screenshot(path=f,full_page=True); ims[(t,m)]=Image.open(f).convert('RGB').copy()
        h=max(i.height for i in ims.values()); W=3*360+4*16; H=2*h+3*16
        B=Image.new('RGB',(W,H),(128,128,128))
        for r,m in enumerate(M):
            for c,t in enumerate(T): B.paste(ims[(t,m)],(16+c*376,16+r*(h+16)))
        B.save(f'{ROOT}/prints/_360/comparativo-{s}.png')
    b.close()
