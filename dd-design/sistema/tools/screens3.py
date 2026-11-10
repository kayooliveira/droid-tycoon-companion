"""Fase 3: telas fieis ao codigo do repo (auditoria/inventario.md). Mesma base: ui.py + components.css + tokens.css."""
from ui import *
import screens as _s
S=_s.S
C=_s.C
acc=_s.acc
ICONS.update({
 'link':'<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"/>',
 'upload':'<path d="M12 15.5V4M7.5 8 12 3.5 16.5 8"/><path d="M5 19.5h14"/>',
 'chat':'<path d="M4 5h16v11H9l-5 4z"/>',
 'file':'<path d="M6 3.5h8l4 4V20.5H6z"/><path d="M14 3.5v4h4"/>',
 'alert':'<path d="M12 4 21 19.5H3z"/><path d="M12 10v4"/><circle cx="12" cy="16.8" r=".6"/>'})
def sk(cls='',st=''): return f'<div class="sk {cls}" style="{st}"></div>'
def grp(rows): return rows
def modal_wrap2(h,body,acts=''):
    x=f'<button class="btn btn--icon btn--ghost" aria-label="Fechar">{ic("x",22)}</button>'
    a=f'<div class="modal-act">{acts}</div>' if acts else ''
    return (f'<div class="scrim"></div><div class="modal-wrap"><div class="modal" role="dialog" aria-label="{esc(h)}"><div class="row2" style="justify-content:space-between;align-items:flex-start"><h2>{esc(h)}</h2>{x}</div>{body}{a}</div></div>')

# =============== INÍCIO (fiel ao DashboardPage) ===============
def inicio3(overlay='',fixed=False,toast_html='',tab='home'):
    b=top('Início',cyc_chip())
    b+=sec('Progresso do ciclo',meter(29,40))
    b+=hero(30,kicker='Próximo Renascimento')
    b+='<div class="row" style="margin-top:12px"><span class="row-main"><span class="t-label" style="display:block">Créditos</span><span class="dname" style="display:block">100T</span><span class="hint" style="display:block">Confira no jogo antes de vender ou fundir.</span></span></div>'
    b+=sec('Pode vender agora',row('sell','2 droids livres','Neste Ciclo'))
    b+='<div style="margin-top:16px">'+btn('Ver progresso','primary')+'</div>'
    b+=sec('Resumo do Ciclo',row('progress','Renascimentos concluídos','','29',tail=False)+row('star','Super Renascimento','Ainda não')+row('inventory','Inventário','','10'))
    return app(b,tab,toast_html,fixed=fixed,overlay=overlay)
S['inicio']=('Início',inicio3())

# =============== MAIS (menu, não é página) ===============
def mais_menu():
    ov=('<div class="scrim scrim--above"></div><section class="sheet sheet--above" role="dialog" aria-label="Mais"><span class="grab"></span>'
        f'<div class="sheet-h"><h2 class="t-h2">Mais</h2>{ibtn("x","Fechar")}</div>'
        +row('sell','Vender','Pode vender 2 droids agora')+row('book','Droiddex','101 droids e onde cada um entra')+row('fusion','Fusão','Receitas e regras')
        +row('info','Sobre','Fonte dos dados e avisos')+row('sliders','Ajustes','Visual, idioma, dados')+'</section>')
    return inicio3(overlay=ov,fixed=True,tab='more')
S['mais']=('Mais (menu sobre a tab bar)',mais_menu())

# =============== PROGRESSO (fiel ao ProgressPage) ===============
P_REQ=[('r7','galactic',2,1),('lep','beskar',1,1),('cyclens','galactic',0,1)]
def req_rows(track=True,sell=None):
    out=''
    for k,(i,t,owned,need) in enumerate(P_REQ):
        sellable=(sell or [False,False,False])[k]
        st=('ok','Pode vender') if sellable else ('bad','Não venda')
        meta=f'{TL[t]} · {owned}/{need}' if track else f'{TL[t]} · 0/{need}'
        acts=(ibtn('x',f'Tirar {dname(i)} do Renascimento #30')+ibtn('plus',f'Adicionar {dname(i)} ao Renascimento #30','primary')) if track else ''
        out+=item(i,t,status=st,actions=acts,meta=meta)
    # droids que ficam livres depois do passo (sell extras)
    out+=item('kx','beskar',status=('ok','Pode vender'),meta='Beskar · Qtd. 1')
    return out
def summary(done=29,nxt=30,cycle='Ciclo 5',foot=None):
    foot=foot or f'Concluídos: {done} · Próximo renascimento: #{nxt}'
    return sec('Progresso do ciclo',meter(done,40,compact=True,label=cycle,foot=foot)+'<div style="margin-top:12px">'+cycle_sel(cycle)+'</div>')
def actions3(complete=True,disabled=False,sup=False,force=False):
    a='<div class="stack" style="margin-top:16px">'
    if complete: a+=btn('Concluir','primary',disabled=disabled)
    if sup: a+=btn('Super Renascimento','primary')
    if force: a+=btn('Concluir mesmo assim','secondary')
    a+=btn('Desfazer','ghost','undo')
    return a+'</div>'
def rebirth_list():
    return (sec_act('Renascimentos','Recolher todos')
        +acc(29,[('lo','galactic','ok'),('trak-r','galactic','ok'),('drft-r','beskar','ok')],done=True)
        +acc(30,C.REQ,open_=True,cur=True)
        +acc(31,[('amp-walker','stellar','falta'),('opti-strk','beskar','ok'),('snow-mouse','beskar','falta')])
        +acc(32,[('lo','galactic','ok'),('trak-r','galactic','ok'),('drft-r','beskar','falta')]))
def pdf_card():
    return sec('PDF do meu progresso','<p class="hint" style="margin-bottom:12px">Inclui seu renascimento atual, inventário e notas de venda neste Ciclo.</p>'+btn('Baixar PDF','secondary','file'))
def progresso3(toast_html='',overlay='',fixed=False,track=True,query='',middle=None,listing=True,acts=None,head=None):
    b=top('Progresso')
    b+=head or summary()
    b+='<div style="margin-top:14px">'+search('Buscar pelo nome do droid',query,clear=bool(query))+'</div>'
    if middle is not None: b+=middle
    else:
        b+=sec('Renascimento #30',req_rows(track,[False,False,False]),'Créditos 100T')
        b+=acts if acts is not None else actions3(complete=True,disabled=False,force=track)
    if listing: b+=rebirth_list()+pdf_card()
    return app(b,'progress',toast_html,fixed=fixed,overlay=overlay)
S.pop('progresso-foco',None); S.pop('progresso-lista',None)
S['progresso']=('Progresso',progresso3())
S['toast-desfazer']=('Toast com Desfazer (adicionar no Progresso)',progresso3(toast('R7 adicionado','Desfazer',detail='Renascimento #30')))
S['progresso-sem-inventario']=('Progresso sem registrar inventário',progresso3(track=False,acts=actions3(complete=True,force=False)))

# ciclo completo (isPathComplete)
def prog_completo(overlay='',fixed=False):
    mid='<p class="hint" style="margin-top:16px">Ciclo completo. Use Super Renascimento para seguir.</p>'
    return progresso3(overlay=overlay,fixed=fixed,middle=mid+actions3(complete=False,sup=True),head=summary(40,40,foot='Concluídos: 40 · Próximo renascimento: #40'),listing=True)
S['progresso-super']=('Progresso, Ciclo completo',prog_completo())

# requisitos disputados
def disputa():
    d=('<section class="sec"><div class="sec-h"><h2 class="t-h2">Requisitos disputados</h2></div>'
       '<div class="row"><span class="row-main"><span class="hint" style="display:block">Renascimento #17: R7 (Diamante) ou B2-RP (Diamante), conforme o guia.</span></span></div>'
       f'<div class="row"><span class="row-main"><span class="t-meta" style="display:block">Principal (R7 Diamante)</span><span class="dname">R7 Diamante</span></span></div>'
       f'<div class="row"><span class="row-main"><span class="t-meta" style="display:block">Alternativa (B2-RP Diamante)</span><span class="dname">B2-RP Diamante</span></span></div></section>')
    req=''.join(item(i,t,status=('bad','Não venda'),actions=ibtn('x',f'Tirar {dname(i)} do Renascimento #17')+ibtn('plus',f'Adicionar {dname(i)} ao Renascimento #17','primary'),meta=f'{TL[t]} · {o}/1') for i,t,o in [('r7','diamond',1),('lo','galactic',1),('r6','galactic',0)])
    mid=d+sec('Renascimento #17',req,'Créditos 40T')+actions3(force=True)
    return progresso3(middle=mid,head=summary(16,17,'Ciclo 2'),listing=False)
S['progresso-disputa']=('Progresso, requisito disputado',disputa())

# busca no Progresso
def hit(n,line,badges='',cur=False):
    return (f'<button class="row" style="text-align:left{";outline:2px solid var(--c-accent-graph)" if cur else ""}"><span class="row-main"><span class="dname" style="display:block">Renascimento #{n}</span>'
            f'<span class="hint" style="display:block">{esc(line)}</span>{badges}</span><span class="chev">{ic("chev",20)}</span></button>')
def busca_resultado():
    head=('<div class="row" style="margin-top:14px;gap:12px"><span style="width:var(--item-tile);flex:none">'+tile('r7','default','sm')+'</span><span class="row-main"><span class="dname" style="display:block">R7</span><span class="hint">Onde você vai precisar deste droid</span></span></div>')
    pickers=chips(['R7','R6','R2'],0)
    cur=('<section class="sec"><div class="sec-h"><h2 class="t-h2">Ciclo 5</h2><span class="t-label">seu ciclo</span></div>'
         +hit(30,'Galáctico · qtd. 1',tag('mute','Próximo para você'),cur=True)+hit(33,'Beskar · qtd. 1')+hit(37,'Galáctico · qtd. 2 · fusão para OPT-AR')+'</section>')
    others=('<div style="margin-top:14px">'
            +'<button class="row" style="text-align:left"><span class="row-main"><span class="dname">Ciclo 6 · 3 renascimentos</span></span><span class="chev">'+ic('chev',20)+'</span></button>'
            +'<button class="row" style="text-align:left"><span class="row-main"><span class="dname">Ciclo 4 · 2 renascimentos</span></span><span class="chev">'+ic('chev',20)+'</span></button></div>')
    return head+'<div style="margin-top:12px">'+pickers+'</div>'+cur+others
S['progresso-busca']=('Progresso, busca por droid',progresso3(query='R7',middle=busca_resultado(),listing=False))
S['progresso-busca-nunca']=('Progresso, busca: droid nunca necessário',progresso3(query='C-3PO',middle='<div class="row" style="margin-top:14px;gap:12px"><span style="width:var(--item-tile);flex:none">'+tile('c-3po','default','sm')+'</span>'+'<span class="row-main"><span class="dname" style="display:block">Você não vai precisar do C-3PO em nenhum Ciclo.</span><span class="hint">Pode vender sem medo.</span></span></div>',listing=False))
S['progresso-busca-vazia']=('Progresso, busca sem resultado',progresso3(query='zzz',middle='<p class="hint" style="margin-top:14px" role="status">Nenhum droid com esse nome.</p>',listing=False))

# modais do Progresso
def over_prog(m): return progresso3(overlay=m,fixed=True)
S['modal-super-renascimento']=('Modal: Super Renascimento',prog_completo(modal_wrap2('Super Renascimento?','<p style="margin:10px 0 16px">Você sai do Ciclo 5 e entra no Ciclo 6. O renascimento #40 fica fechado no app e o novo ciclo começa do #1. Não dá para desfazer.</p>',btn('Cancelar','secondary')+btn('Confirmar','primary')),True))
S['modal-concluir-mesmo-assim']=('Modal: Concluir mesmo assim',over_prog(modal_wrap2('Concluir mesmo assim','<p class="hint" style="margin:10px 0 16px">Faltam droids no inventário.</p>',btn('Cancelar','secondary')+btn('Concluir','primary'))))
S['modal-desfazer-renascimento']=('Modal: Desfazer renascimento',over_prog(modal_wrap2('Desfazer','<p class="hint" style="margin:10px 0 16px">Voltar um renascimento neste ciclo? O inventário não muda.</p>',btn('Cancelar','secondary')+btn('Desfazer','primary'))))
def trocar():
    body=('<p style="margin:10px 0 14px;color:var(--c-text-2)">Ir para Ciclo 6. O inventário continua. O progresso de renascimento também, a menos que você marque reset abaixo.</p>'
          '<div class="chips chips--grid" role="radiogroup" aria-label="Ciclo" style="margin-bottom:14px">'+''.join(f'<button class="chip" role="radio" aria-pressed="{"true" if n==6 else "false"}" aria-checked="{"true" if n==6 else "false"}">Ciclo {n}</button>' for n in range(1,7))+'</div>'
          +switch('Zerar renascimentos no novo ciclo (começar no #1)',False)+'<div style="height:16px"></div>')
    return over_prog(modal_wrap2('Trocar de ciclo?',body,btn('Cancelar','secondary')+btn('Confirmar','primary')))
S['modal-trocar-ciclo']=('Modal: Trocar de ciclo',trocar())
S['modal-trocar-ciclo-reset']=('Modal: Trocar de ciclo com reset',over_prog(modal_wrap2('Trocar de ciclo?',
   '<p style="margin:10px 0 10px;color:var(--c-text-2)">Ir para Ciclo 6. O inventário continua. O progresso de renascimento também, a menos que você marque reset abaixo.</p><p class="note-warn" style="margin-bottom:14px">Os renascimentos no Ciclo 6 começam do #1. Não dá para desfazer.</p>'
   '<div class="chips chips--grid" role="radiogroup" aria-label="Ciclo" style="margin-bottom:14px">'+''.join(f'<button class="chip" role="radio" aria-pressed="{"true" if n==6 else "false"}" aria-checked="{"true" if n==6 else "false"}">Ciclo {n}</button>' for n in range(1,7))+'</div>'
   +switch('Zerar renascimentos no novo ciclo (começar no #1)',True)+'<div style="height:16px"></div>',btn('Cancelar','secondary')+btn('Confirmar','primary'))))

# ficha do droid (DroidDetailSheet)
def sheet3(i,tier,qty=None,sell=None,children='',bg=None,label='Ficha do droid'):
    rows=kv('Nível',TL[tier])+kv('Raridade',rar(i))
    if qty is not None: rows+=kv('Quantidade',str(qty))
    if sell is not None: rows+=f'<div class="kv"><span>Vender</span>{tag("ok","Pode vender") if sell else tag("bad","Não venda")}</div>'
    sh=(f'<div class="scrim"></div><section class="sheet" role="dialog" aria-label="{esc(dname(i))} {TL[tier]}"><span class="grab"></span>'
        f'<div class="sheet-h"><span class="t-label">{label}</span>{ibtn("x","Fechar")}</div>'
        f'<div class="sheet-art">{tile(i,tier,"lg")}</div>'
        f'<div class="sheet-title"><h2 class="sheet-name dname">{esc(dname(i))}</h2><span class="sheet-tier">{TL[tier]}</span></div><div style="margin-top:12px">{rows}</div>{children}</section>')
    return sh
def inv_children():
    return '<div class="stack" style="margin-top:12px"><div class="row2" style="justify-content:space-between"><span class="dname">Quantidade</span>'+stepper(1)+'</div>'+btn('Remover do inventário','ghost','trash')+'</div>'

# =============== INVENTÁRIO (fiel ao InventoryPage) ===============
INV10=_s.INV10
RAR_LBL=['Todas','Comum','Raro','Épico','Lendário','Mítico','Icônico']
TIER_LBL=['Todos']+[TL[t] for t in TIERS9]
def inv_head(filtro='todos',mode='grade'):
    b=top('Inventário',ibtn('plus','Adicionar droid','primary'))
    b+='<div style="margin-top:6px">'+search()+'</div>'
    on={'todos':0,'raridade':1,'nivel':2}[filtro]
    b+='<div class="row2" style="margin-top:12px;gap:10px"><div style="flex:1;min-width:0">'+seg(['Todos','Raridade','Nível'],on,'Uso no ciclo')+'</div>'+view_toggle(0 if mode=='grade' else 1)+'</div>'
    if filtro=='raridade': b+='<div style="margin-top:12px">'+chips(RAR_LBL,2,'chips--scroll')+'</div>'
    elif filtro=='nivel': b+='<div style="margin-top:12px">'+chips(TIER_LBL,5,'chips--scroll')+'</div>'
    else: b+='<div style="margin-top:12px">'+seg(['Todos','Usa no ciclo','Não usa'],0,'Uso no ciclo')+'</div>'
    return b
def inv_body(mode,filtro='todos'):
    its=INV10
    if filtro=='raridade': its=[x for x in INV10 if rar(x[0]) in('Épico',)]  # Épico selecionado
    if filtro=='nivel': its=[x for x in INV10 if x[1]=='galactic' or x[1]=='beskar']
    if mode=='grade':
        cards=''
        for i,t,q,sell,note in its:
            cards+=dcard(i,t,qty=q,status=('ok','Pode vender') if sell else ('bad','Não venda'),note='')
        return '<div class="grid2" style="margin-top:18px">'+cards+'</div>'
    rows=''
    for i,t,q,sell,note in its:
        acts=ibtn('minus',f'Tirar um {dname(i)}')+ibtn('plus',f'Adicionar um {dname(i)}','primary')
        rows+=item(i,t,status=('ok','Pode vender') if sell else ('bad','Não venda'),actions=acts,meta=f'{rar(i)} · {TL[t]} · ×{q}')
    return '<div style="margin-top:12px">'+rows+'</div>'
def inventario3(mode='grade',filtro='todos',fixed=False,overlay='',toast_html=''):
    return app(inv_head(filtro,mode)+inv_body(mode,filtro),'inventory',toast_html,fixed=fixed,overlay=overlay)
S['inventario-grade']=('Inventário, Grade',inventario3('grade'))
S['inventario-lista']=('Inventário, Lista',inventario3('lista'))
S['inventario-filtro-raridade']=('Inventário, filtro por raridade',inventario3('grade','raridade'))
S['inventario-filtro-nivel']=('Inventário, filtro por nível',inventario3('grade','nivel'))
S['sheet-droid']=('Ficha do droid (Inventário)',inventario3('grade',fixed=True,overlay=sheet3('lep','kyber',1,False,inv_children())))
S['sheet-droid-progresso']=('Ficha do droid (a partir do Progresso)',progresso3(overlay=sheet3('r7','galactic',2,False),fixed=True))
def add_sheet():
    grid=''.join(pick(i,'default',k==1) for k,i in enumerate(['bb','r7','mouse','kx','lep','cyclens']))
    sh=('<div class="scrim"></div><section class="sheet" role="dialog" aria-label="Adicionar droid"><span class="grab"></span>'
        f'<div class="sheet-h"><h2 class="t-h2">Adicionar droid</h2>{ibtn("x","Fechar")}</div>'
        +search('Buscar droids…')+f'<div class="grid2" style="margin-top:12px;gap:8px">{grid}</div>'
        +'<div style="margin-top:14px"><span class="lbl">Nível deste droid</span>'+chips(['Padrão','Ouro','Diamante','Arco-íris','Beskar','Galáctico','Estelar','Kyber','Scourge'],5,'chips--scroll')+'</div>'
        +'<div class="row2" style="justify-content:space-between;margin-top:12px"><span class="dname">Quantidade</span>'+stepper(1)+'</div>'
        +'<div style="margin-top:12px">'+btn('Adicionar','primary')+'</div></section>')
    return inventario3('grade',fixed=True,overlay=sh)
S['sheet-adicionar-droid']=('Sheet: Adicionar droid',add_sheet())
def rem_sheet():
    sh=('<div class="scrim"></div><section class="sheet" role="alertdialog" aria-label="Remover do inventário?"><span class="grab"></span>'
        f'<div class="sheet-h"><h2 class="t-h2">Remover do inventário?</h2>{ibtn("x","Fechar")}</div>'
        '<p class="hint" style="margin-bottom:16px">Remove LEP (Kyber) da sua lista. Você pode adicionar de novo depois.</p>'
        '<div class="grid2">'+btn('Cancelar','secondary')+btn('Confirmar','danger-solid')+'</div></section>')
    return inventario3('grade',fixed=True,overlay=sh)
S.pop('modal-remover',None)
S['sheet-remover-inventario']=('Sheet: Remover do inventário',rem_sheet())
S['inventario-toast-removido']=('Inventário, toast ao remover',inventario3('grade',toast_html=toast('LEP saiu do inventário.',act='',icon='info')))
S['inventario-sem-rastreio']=('Inventário desligado',app(top('Inventário')+'<div class="row" style="margin-top:12px"><span class="row-ic">'+ic('inventory',24)+'</span><span class="row-main"><span class="dname" style="display:block">Inventário desligado</span><span class="hint" style="display:block">Liga o inventário em Ajustes pra comparar com os renascimentos.</span></span></div>','inventory'))
S['inventario-sem-resultado']=('Inventário, filtro sem resultado',app(inv_head('raridade')+'<div style="margin-top:12px"><div class="row"><span class="row-main"><span class="hint">Cadastre os droids da sua base pra comparar com o próximo renascimento.</span></span></div>'+'<div style="margin-top:8px">'+btn('Adicionar droid','secondary','plus')+'</div></div>','inventory'))

# =============== VENDER (fiel ao SellCenterPage: seções, sem sub-abas) ===============
def vender3():
    b=top('Vender',back='Mais')
    b+='<p class="hint" style="margin-top:6px">Renascimentos 30 a 40 do Ciclo 5. Depois do Super Renascimento quase tudo reseta, então planeje o próximo ciclo.</p>'
    b+='<div style="margin-top:12px">'+cycle_sel('Ciclo 5')+'</div>'
    def sct(title,rows,foot=''):
        f=f'<p class="hint" style="margin-top:8px">{esc(foot)}</p>' if foot else ''
        return sec(title,rows+f,str(rows.count('class="item"')))
    ok=lambda: ('ok','Pode vender')
    b+=sct('Pode vender agora',item('kx','beskar',note='Está no seu inventário e pode vender antes do próximo renascimento.',meta='Beskar · Qtd. 1')+item('orb-walker','diamond',note='Está no seu inventário e pode vender antes do próximo renascimento.',meta='Diamante · Qtd. 1'),'Com base nos renascimentos concluídos até o #29 e no que ainda falta neste ciclo.')
    b+=sct('Usar no próximo',item('r7','galactic',note='Entrega no Renascimento #30 e depois pode vender.',status=ok(),meta='Galáctico · Qtd. 2'))
    b+=sct('Guardar',item('mecha-droid','stellar',note='Guarde Mecha-Droid. Precisa dele no renascimento #35.',meta='Estelar · Qtd. 1')
           +item('lep','beskar',note='Guarde LEP. Precisa de novo no renascimento #33.',meta='Beskar · Qtd. 1')
           +f'<div class="item"><span class="item-body"><span class="note-warn">Guardar pra fusão</span></span></div>','Ainda entra em renascimentos que faltam neste ciclo.')
    b+=sct('Upar',item('util-tec-ulti-tech','gold',note='Upe Util-Tec (Ulti-Tech) pra pelo menos Estelar antes do renascimento #33.',meta='Ouro · Qtd. 1'),'Suba o nível antes do renascimento que pede.')
    b+=sct('Vender',item('mouse','default',note='Venda 1 Mouse extra. Só precisa de um pro que falta neste ciclo.',meta='Padrão · Qtd. 2'),'Não entra nos renascimentos que faltam; venda quando quiser.')
    return app(b,'more')
S['vender']=('Vender',vender3())
S['vazio-vender']=('Vender vazio',S['vazio-vender'])

# =============== CICLOS (fiel ao CyclesPage) ===============
def acc2(n,credits,conf,open_=False,reqs=(),note=''):
    body=''
    if open_:
        nt=f'<p class="note-warn" style="padding:4px 0 8px">{esc(note)}</p>' if note else ''
        body='<div class="acc-body">'+nt+''.join(item(i,t,meta=TL[t]+(f' · ×{q}' if q>1 else '')) for i,t,q in reqs)+'</div>'
    h=(f'<button class="acc-h" aria-expanded="{"true" if open_ else "false"}"><span class="row-main"><span class="dname" style="display:block">Renascimento #{n}</span>'
       f'<span class="hint" style="display:block">{credits} · {conf}</span></span><span class="chev">{ic("down" if open_ else "chev",20)}</span></button>')
    return f'<div class="acc">{h}{body}</div>'
def ciclos3(toast_html=''):
    b=top('Ciclos')
    b+='<p class="hint" style="margin-top:6px">Guia de referência dos dados da comunidade. Não usa seu progresso salvo.</p>'
    b+=sec('Escolha o Ciclo',chips([f'Ciclo {n}' for n in range(1,7)],4,'chips--grid')+'<div style="margin-top:14px">'+btn('Exportar PDF do Ciclo','secondary','file')+'<p class="hint" style="margin-top:8px">Guia imprimível de Ciclo 5 com cada renascimento. Sem progresso pessoal.</p></div>')
    b+=acc2(1,'10K','Confirmado',True,[('mouse','default',2),('cb','default',1),('bb','default',1)],'Alguns guias divergem neste passo.')
    b+=acc2(2,'25K','Confirmado')+acc2(3,'50K','Parcial')+acc2(4,'80K','Confirmado')
    b+='<p class="hint" style="margin:10px 0 0">Mais 36 renascimentos abaixo, na mesma lista.</p>'
    b+=sec('Super Renascimento','<p style="margin-bottom:8px">Libera depois do renascimento #40. Reseta créditos e melhorias da base; quase todos os droids somem, exceto os Icônicos.</p><span class="hint">Não confirmado</span>')
    return app(b,'cycles',toast_html)
S['ciclos']=('Ciclos',ciclos3())
S['ciclos-toast-pdf']=('Ciclos, PDF pronto (toast)',ciclos3(toast('PDF do ciclo pronto.',act='',icon='check')))

# =============== DROIDDEX (fiel ao DroiddexPage) ===============
def droiddex3(overlay='',fixed=False):
    b=top('Droiddex',back='Mais')
    b+='<div style="margin-top:12px">'+search('Buscar droids…')+'</div>'
    b+='<div style="margin-top:12px">'+chips(['Todas classes','Worker','Astromech','Battle','Protocol'],0)+'</div>'
    ids=['mouse','pit','cb','bb','orb-walker','r6','mecha-droid','bb9','lep','cyclens','bb-8','c-3po']
    b+='<div class="grid2" style="margin-top:18px">'+''.join(dcard(i,'default',qty=1,meta=rar(i)) for i in ids)+'</div>'
    return app(b,'more',fixed=fixed,overlay=overlay)
S['droiddex']=('Droiddex',droiddex3())
def dex_modal():
    body=(f'<div class="row2" style="align-items:flex-start;gap:14px;margin:10px 0 14px"><div style="width:96px;flex:none">{tile("lep","kyber")}</div>'
          f'<div class="stack" style="gap:8px;align-items:flex-start">{tag("mute","Worker")}{tag("mute","Mítico")}{tag("ok","Confirmado")}</div></div>'
          '<span class="lbl">Níveis</span><p style="margin-bottom:12px">Padrão · Ouro · Diamante · Arco-íris · Beskar · Galáctico · Estelar · Kyber</p>'
          '<span class="lbl">Aparece nos renascimentos</span>'+kv('Ciclo 5 R33','Beskar')+kv('Ciclo 5 R40','Kyber')+kv('Ciclo 6 R12','Galáctico')
          +'<p class="hint" style="margin:6px 0 4px">+ 3 a mais</p><a class="link-btn" href="#">Fonte (verificado 31/10/2026)</a>')
    return droiddex3(modal_wrap2('LEP',body),True)
S['droiddex-detalhe']=('Droiddex, detalhe do droid (modal)',dex_modal())

# =============== FUSÃO (fiel ao FusionLabPage) ===============
def recipe3(ings,res,name,conf='Parcial'):
    tl=''
    for k,(i,q) in enumerate(ings):
        tl+=f'<div style="width:48px">{tile(i,"default","sm")}</div>'+(f'<span class="t-label" style="align-self:center">×{q}</span>' if q>1 else '')
        if k<len(ings)-1: tl+=f'<span aria-hidden="true" style="align-self:center">{ic("plus",16)}</span>'
    return (f'<div class="row" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="row2" style="flex-wrap:nowrap;gap:6px;width:100%">{tl}<span class="t-label" style="align-self:center;margin-left:2px">vira</span><div style="width:48px">{tile(res,"default","sm",missing=True)}</div></div>'
            f'<span class="dname">{esc(name)}</span>{tag("mute","Só uma fonte. Confira no jogo." if conf=="Parcial" else conf)}</div>')
def fusao3(helps=True,query='',empty=False):
    b=top('Fusão',back='Mais')
    rules=''.join(f'<div class="row"><span class="row-ic">{ic(ik,22)}</span><span class="row-main"><span class="dname" style="display:block">{esc(t)}</span><span class="hint">Parcial</span></span></div>' for ik,t in [
        ('fusion','Três do mesmo droid no mesmo nível viram um desse droid no nível seguinte.'),
        ('star','Três droids diferentes da mesma raridade base viram um droid aleatório uma raridade acima.'),
        ('lock','Fusão abre no renascimento 3.')])
    rules+='<div class="row"><span class="row-main"><span class="hint">O resultado fica no menor nível entre os três ingredientes.</span></span></div>'
    b+=sec('Regras gerais',rules+'<p class="hint" style="margin-top:8px">Fusão libera no renascimento #3. Droids só de fusão não entram em renascimento (pelas fontes).</p>')
    if helps: b+=sec('Útil pro próximo renascimento',recipe3([('cb',1),('bb',1),('mouse',1)],'r7','R7'))
    else: b+=sec('Útil pro próximo renascimento','<div class="row"><span class="row-main"><span class="hint">Nada marcado pro próximo renascimento ainda.</span></span></div>')
    rec=('<div class="row"><span class="row-main"><span class="hint">Nenhuma receita bate com a busca.</span></span></div>' if empty
         else recipe3([('r2',2),('b2-super',1)],'opt-ar','OPT-AR')+recipe3([('kx',1),('ig',1),('ric',1)],'riv-3t','RIV-3T')+recipe3([('mouse',2),('pit',1)],'whl-ex','WHL-EX'))
    b+=sec('Receitas','<div style="margin-bottom:12px">'+search('Buscar…',query,clear=bool(query))+'</div>'+rec)
    return app(b,'more')
S['fusao']=('Fusão',fusao3())
S['fusao-vazio']=('Fusão, sem receita na busca e nada para o próximo',fusao3(False,'xyz',True))

# =============== AJUSTES (fiel ao SettingsPage) ===============
def ajustes3(overlay='',fixed=False,toast_html='',stale=False):
    b=top('Ajustes',back='Mais')
    b+=sec('Aparência',row('sliders','Visual e modo','Oficina · segue o sistema')+switch('Animações',True)+switch('Registrar inventário',True))
    b+=sec('Idioma',seg(['Português','English'],0,'Idioma'))
    b+=sec('Progresso',
        '<div class="row"><span class="row-main"><span class="t-label" style="display:block">Ciclo</span></span>'+cycle_sel('Ciclo 5')+'</div>'
        +'<div class="row"><span class="row-main"><span class="dname" style="display:block">Progresso do ciclo</span><span class="hint">Concluídos: 29 · Próximo renascimento: #30</span></span></div>'
        +'<div class="row" style="display:block;min-height:0"><div class="lbl-row"><span class="lbl">Renascimentos concluídos (29)</span><span class="val">29</span></div><input class="range" type="range" min="0" max="40" value="29" style="--p:72.5%" aria-label="Renascimentos concluídos"><div class="range-scale"><span>0</span><span>40</span></div></div>')
    sub='v1.36 · 1.2.0 · '+('Velho' if stale else 'Dados recentes')
    b+=sec('Dados',row('info','Dados do jogo',sub,tail=False)+row('download','Exportar','Salva o progresso em um arquivo JSON')+row('upload','Importar','Escolha um arquivo JSON')+'<p class="hint" style="margin-top:8px">Atualize com scripts/parse.py e troque src/data/gameData.json.</p>')
    b+=sec('Compartilhar',row('link','Compartilhar app','',tail=False)+row('chat','WhatsApp','',tail=False)+row('share','Card de progresso','',tail=False)+'<p class="hint" style="margin-top:8px">Nada é enviado ao servidor.</p>')
    b+=sec('Sobre',row('cycles','Refazer setup')+row('info','Sobre')+row('chat','Mandar feedback / Entrar no grupo'))
    b+=sec('Zona de risco',btn('Apagar tudo','danger','trash'))
    return app(b,'more',toast_html,fixed=fixed,overlay=overlay)
S['ajustes']=('Ajustes (página completa)',ajustes3())
S['ajustes-dados-velhos']=('Ajustes, dados velhos',ajustes3(stale=True))
S['modal-importar']=('Modal: Importar progresso',ajustes3(modal_wrap2('Importar progresso?','<p class="hint" style="margin:10px 0 16px">Substitui inventário, ciclo e renascimentos pelos dados do arquivo. Não dá para desfazer.</p>',btn('Cancelar','secondary')+btn('Confirmar','primary')),True))
S['modal-apagar-tudo']=('Modal: Apagar tudo',ajustes3(modal_wrap2('Apagar tudo?','<p class="hint" style="margin:10px 0 16px">Remove progresso, inventário e ajustes deste aparelho. Não dá para desfazer.</p>',btn('Cancelar','secondary')+btn('Confirmar','danger-solid')),True))
S['toast-importar-erro']=('Ajustes, arquivo inválido (toast de erro)',ajustes3(toast_html=toast('Arquivo inválido','',icon='info',kind='toast--err',detail='Confira o JSON e tente novamente.')))
S['toast-card-erro']=('Ajustes, card não gerado (toast de erro)',ajustes3(toast_html=toast('Não deu pra gerar o card. Tenta de novo.','',icon='info',kind='toast--err')))

# =============== SOBRE ===============
def sobre():
    b=top('Sobre',back='Mais')
    b+=sec('App de fã','<p>App de fã do Star Wars Droid Tycoon. Os números vêm de guias da comunidade, não da Epic nem da FOAD.</p><p class="hint" style="margin-top:10px">Ferramenta de fã. Sem vínculo com Epic Games, Lucasfilm, Disney ou FOAD.</p>')
    b+=sec('Fontes e atualização','<p class="dname">Pacote 1.36 · jogo 1.2.0 · dados de 31/10/2026</p><p class="hint" style="margin:4px 0 10px">Dados recentes</p><p class="hint">Renascimentos disputados aparecem com aviso quando os guias não batem.</p>')
    b+=sec('Dado errado ou sugestão?','<p style="margin-bottom:12px">Conta o que você viu no jogo versus o que o app mostra.</p>'+btn('Mandar feedback / Entrar no grupo','secondary','chat'))
    b+='<div style="margin-top:16px">'+row('sliders','Ajustes')+'</div>'
    b+=('<footer class="credits" style="margin-top:20px"><p>Imagens: Star Wars Droid Tycoon Wiki (Fandom), licença CC BY-SA 4.0.</p><p style="margin-top:6px">Wikis e guias da comunidade (sem vínculo com sites de terceiros).</p>'
        '<p style="margin-top:6px">Site: <a class="link-btn" style="min-height:44px" href="#">dthelper.kayooliveira.com</a></p></footer>')
    return app(b,'more')
S['sobre']=('Sobre',sobre())

# =============== 404 ===============
S['nao-encontrada']=('Página não encontrada',app('<div class="empty" style="padding-top:64px"><div class="empty-art" aria-hidden="true">'+tile('r2','default',missing=True)+'</div><h1 class="t-h2">Página não encontrada</h1><p class="hint">Esse endereço não existe no app. Volte ao início para continuar.</p>'+btn('Ir ao início','primary')+'</div>','home'))

# =============== BANNERS E TOASTS ===============
S['banner-instalar']=('Banner: instalar o app (Android e desktop)',inicio3(toast_html=banner('Instalar no celular','Atalho na tela inicial enquanto joga.',btn('Instalar','primary')+btn('Agora não','ghost'))))
S['banner-instalar-ios']=('Banner: instalar o app (iOS, instrução)',inicio3(toast_html=banner('Instalar no celular','Toque em Compartilhar e "Adicionar à Tela de Início".',btn('Agora não','ghost'))))
S['toast-atualizacao-pwa']=('Toast: nova versão do app (fixo até agir)',inicio3(toast_html=toast('Nova versão do app disponível.','Atualizar',icon='info')))
def toasts_var():
    cap=lambda t: f'<p class="t-label" style="margin:14px 0 6px">{esc(t)}</p>'
    b=top('Toasts e avisos')
    b+=cap('Sucesso (com Desfazer e detalhe)')+toast('R7 adicionado','Desfazer',detail='Renascimento #30')
    b+=cap('Sucesso (sem ação)')+toast('Progresso importado','',icon='check')
    b+=cap('Informação')+toast('Agora você tá no Ciclo 6.','',icon='info')
    b+=cap('Neutro')+toast('LEP saiu do inventário.','',icon='info')
    b+=cap('Aviso')+toast('Dados apagados neste aparelho','',icon='alert',kind='toast--warn')
    b+=cap('Erro com detalhe')+toast('Arquivo inválido','',icon='info',kind='toast--err',detail='Confira o JSON e tente novamente.')
    b+=cap('Fixo até agir (atualização do app)')+toast('Nova versão do app disponível.','Atualizar',icon='info')
    b+=cap('Atualizado automaticamente')+toast('DroidDeck atualizado','',icon='check')
    b+=cap('Dois ao mesmo tempo (empilhados)')+'<div class="toast-stack" style="display:flex;flex-direction:column;gap:8px">'+toast('Card de progresso compartilhado.','',icon='check')+toast('Link copiado','',icon='check')+'</div>'
    b+='<p class="hint" style="margin-top:16px">Na tela, o toast fica logo acima da tab bar, empurra o conteúdo e nunca cobre um botão.</p>'
    return app(b,'home')
S['toasts-variantes']=('Toasts e avisos (todas as variantes)',toasts_var())

# =============== CARREGANDO ===============
def skel_pagina():
    b='<div aria-busy="true" aria-label="Carregando" style="padding-top:14px">'+sk('','height:41px;width:55%')
    b+='<div style="margin-top:16px">'+''.join(f'<div style="display:flex;gap:12px;padding:12px 0">{sk("","width:44px;height:44px;flex:none")}<div style="flex:1;display:flex;flex-direction:column;gap:8px;padding:4px 0">{sk("sk-line","width:66%;height:16px")}{sk("sk-line","width:50%;height:12px")}</div></div>' for _ in range(2))+'</div>'
    b+=sk('','height:44px;margin:12px 0')
    b+=''.join(f'<div style="display:flex;gap:12px;padding:12px 0">{sk("","width:50px;height:50px;flex:none")}<div style="flex:1;display:flex;flex-direction:column;gap:8px;padding:4px 0">{sk("sk-line","width:75%;height:16px")}{sk("sk-line","width:33%;height:12px")}</div></div>' for _ in range(3))+'</div>'
    return app(b,'progress')
S['skeleton-pagina']=('Carregando página (fallback das rotas)',skel_pagina())

# =============== ONBOARDING: passo "O que você ganha" com Registrar inventário ===============
def onb5b():
    rows=''.join(f'<div class="row"><span class="row-ic">{ic(k,22)}</span><span class="row-main"><span class="dname" style="display:block">{t}</span><span class="hint">{s}</span></span></div>' for k,t,s in [
      ('progress','Progresso','Veja o próximo renascimento e o que falta.'),('sell','Vender','Saiba o que pode vender antes do renascimento.'),('share','Exportar e compartilhar','Compartilhe progresso ou exporte PDF do ciclo.')])
    return _s.onb(4,4,'O que você ganha','Painel, listas de venda e export quando precisar.',rows+'<div style="margin-top:8px">'+switch('Registrar inventário',True)+'</div>',primary='Abrir início',skip='Voltar',back=False)
S['onb-5-pronto']=('Onboarding 5: O que você ganha',onb5b())
S['skeleton-inicio']=S['skeleton-inicio']

# =============== COMPONENTES: acrescenta os da fase 3 ===============
def _cs():
    t,body=S['componentes']
    def csec(t,b): return f'<section class="cs-sec"><h2 class="cs-h">{t}</h2>{b}</section>'
    extra=(csec('Toasts: sucesso, aviso e erro com detalhe','<div class="stack">'+toast('R7 adicionado','Desfazer',detail='Renascimento #30')+toast('Dados apagados neste aparelho','',icon='alert',kind='toast--warn')+toast('Arquivo inválido','',icon='info',kind='toast--err',detail='Confira o JSON e tente novamente.')+'</div>')
           +csec('Banner de instalação',banner('Instalar no celular','Atalho na tela inicial enquanto joga.',btn('Instalar','primary')+btn('Agora não','ghost')))
           +csec('Filtros: segmentado, chips que rolam, seletor de ciclo','<div class="stack">'+seg(['Todos','Raridade','Nível'],1)+chips(RAR_LBL,2,'chips--scroll')+chips([f'Ciclo {n}' for n in range(1,7)],4,'chips--grid')+'<div>'+cycle_sel()+'</div></div>')
           +csec('Escolha de droid (picker) e busca com limpar','<div class="stack"><div class="grid2">'+pick('bb')+pick('r7','default',True)+'</div>'+search('Buscar pelo nome do droid','R7',clear=True)+'<div>'+link_btn('Recolher todos')+'</div></div>'))
    k=body.rfind('</div>')
    return (t,body[:k]+extra+body[k:])
S['componentes']=_cs()
