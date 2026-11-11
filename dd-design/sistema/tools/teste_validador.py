"""Teste de sanidade do validador: injeta falhas conhecidas e confirma que cada categoria é detectada."""
import sys,io,os
sys.path.insert(0,os.path.dirname(__file__))
import validar as V
from playwright.sync_api import sync_playwright
SAB={
 'toque':'.btn--icon{width:30px!important;min-height:30px!important;height:30px!important}',
 'overflow':'.hero{width:420px!important}',
 'input16':'.field{font-size:13px!important}',
 'contraste_texto':'.t-meta,.hint,.dname{color:#8a8a8a!important;opacity:.6}',
 'contraste_controle':':root,[data-theme]{--c-control-border:var(--c-bg)!important}.field,.sel,.btn--secondary{background:var(--c-bg)!important}',
 'toast':'.toast-slot{position:absolute!important;bottom:150px;left:10px;right:10px;z-index:99}',
 'contraste_grafico':':root,[data-theme]{--cell-done-bg:var(--c-bg)!important;--cell-done-bd:var(--c-bg)!important;--cell-todo-bg:var(--c-bg)!important;--cell-todo-bd:0 solid var(--c-bg)!important}',
 'corte':'.dname{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;display:block}',
}
ok=True
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    for cat,css in SAB.items():
        ctx=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce'); pg=ctx.new_page()
        scr='inventario-lista' if cat in('toque','corte','input16') else 'inicio'
        if cat=='contraste_controle': scr='inventario-grade'
        if cat=='toast': scr='toast-desfazer'
        pg.goto(f'file://{V.ROOT}/html/{scr}.html?theme=oficina&mode=dark'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(200)
        pg.add_style_tag(content=css); pg.wait_for_timeout(100)
        n,f=V.analisar(pg,'oficina'); got=[x for x in f if x[0]==cat]
        print(f'{cat}: {len(got)} falhas detectadas', '(OK)' if got else '(NÃO DETECTOU!)'); ok&=bool(got)
        ctx.close()
    b.close()
print('validador sensível a todas as categorias' if ok else 'PROBLEMA NO VALIDADOR')
