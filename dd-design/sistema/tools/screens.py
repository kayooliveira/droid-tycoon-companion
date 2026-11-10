from ui import *
S={}   # slug -> (título, html do corpo)
T_FOCO='R7 adicionado ao Renascimento #30'

# ---------- Início ----------
def inicio(skel=False):
    b=top('Início',cyc_chip())
    b+=hero()
    b+=sec('Progresso do ciclo',meter(29,40))
    b+=sec('Resumo',stats([('Precisa agora',3),('Já tem',2),('Pode vender',2)]))
    b+=sec('Próximo passo','<p style="margin-bottom:14px">Falta 1 droid pro próximo renascimento.</p>'+btn('Ver meu próximo renascimento','primary'))
    return app(b,'home')
S['inicio']=('Início',inicio())

def skeleton_inicio():
    sk=lambda cls,st='':f'<div class="sk {cls}" style="{st}"></div>'
    b=top('Início',cyc_chip())
    b+='<section class="hero" aria-busy="true"><div class="sk sk-line" style="width:40%"></div>'+sk('sk-title','height:56px;width:30%;margin:8px 0 12px')
    b+='<div class="trio" style="margin-top:12px">'+''.join(f'<div>{sk("sk-tile")}<div class="sk sk-line" style="width:70%;margin-top:12px"></div><div class="sk sk-line" style="width:50%"></div></div>' for _ in range(3))+'</div></section>'
    b+='<section class="sec">'+sk('sk-line','width:35%;height:20px')+sk('','height:90px;margin-top:12px')+'</section>'
    b+='<section class="sec">'+sk('','height:76px')+'</section>'
    return app(b,'home')
S['skeleton-inicio']=('Início carregando',skeleton_inicio())

# ---------- Progresso ----------
def prog_actions(i,t):
    return ibtn('x',f'Tirar {dname(i)} do Renascimento #30')+ibtn('plus',f'Adicionar {dname(i)} ao Renascimento #30','primary')
def progresso_foco(toast_html=''):
    b=top('Progresso',cyc_chip())
    b+='<div style="margin-top:6px">'+seg(['Foco','Lista'],0)+'</div>'
    b+=sec('Concluídos',meter(29,40,compact=True))
    items=''
    for i,t,st in C.REQ:
        items+=item(i,t,note=('Qtd. 2 no inventário' if i=='r7' else ('Qtd. 1 no inventário' if i=='lep' else 'Não está no inventário')),status=('ok','Ok') if st=='ok' else ('bad','Falta'),actions=prog_actions(i,t))
    b+=sec('Renascimento #30 agora',items,'Créditos 100T')
    b+='<div class="stack" style="margin-top:16px">'+'<p class="hint">Ainda faltam droids neste renascimento. Atualize o inventário ou conclua mesmo assim se você não registra tudo aqui.</p>'+btn('Concluir mesmo assim','secondary')+'</div>'
    return app(b,'progress',toast_html)
S['progresso-foco']=('Progresso, Foco',progresso_foco())
S['toast-desfazer']=('Toast com Desfazer',progresso_foco(toast(T_FOCO)))

def acc(n,reqs,open_=False,done=False,cur=False):
    mini=''.join(tile(i,t,'xs') for i,t,_ in reqs)
    state=tag('ok','Feito') if done else (tag('mute','Atual') if cur else '')
    h=(f'<button class="acc-h" aria-expanded="{"true" if open_ else "false"}"><span class="row-main"><span class="dname" style="display:block">Renascimento #{n}</span>'
       f'<span class="mini-tiles" style="margin-top:6px">{mini}</span></span>{state}<span class="chev">{ic("down" if open_ else "chev",20)}</span></button>')
    body=''
    if open_:
        body='<div class="acc-body">'+''.join(item(i,t,status=('ok','Ok') if s=='ok' else ('bad','Falta')) for i,t,s in reqs)+'</div>'
    return f'<div class="acc">{h}{body}</div>'
def progresso_lista():
    b=top('Progresso',cyc_chip())
    b+='<div style="margin-top:6px">'+seg(['Foco','Lista'],1)+'</div>'
    b+=sec('Renascimentos',acc(29,[('lo','galactic','ok'),('trak-r','galactic','ok'),('drft-r','beskar','ok')],done=True)
      +acc(30,C.REQ,open_=True,cur=True)
      +acc(31,[('amp-walker','stellar','falta'),('opti-strk','beskar','ok'),('snow-mouse','beskar','falta')])
      +acc(32,[('lo','galactic','ok'),('trak-r','galactic','ok'),('drft-r','beskar','falta')]),'Ciclo 5')
    b+='<p class="hint" style="margin-top:12px">Etiqueta verde: pode vender neste Ciclo. Etiqueta vermelha: ainda necessário ou reservado.</p>'
    return app(b,'progress')
S['progresso-lista']=('Progresso, Lista',progresso_lista())

def progresso_super(overlay=''):
    b=top('Progresso',cyc_chip())
    b+='<div style="margin-top:6px">'+seg(['Foco','Lista'],0)+'</div>'
    b+=sec('Concluídos',meter(40,40,compact=True,foot='Ciclo completo'))
    b+=sec('Ciclo completo','<p style="margin-bottom:14px">Ciclo completo. Use Super Renascimento para seguir.</p><p class="hint" style="margin-bottom:16px">Super Renascimento libera depois de 40 renascimentos concluídos.</p>'+btn('Super Renascimento','primary')+'<div style="height:10px"></div>'+btn('Desfazer o último renascimento','secondary'))
    return app(b,'progress',fixed=bool(overlay),overlay=overlay)
S['progresso-super']=('Progresso, Ciclo completo',progresso_super())

# ---------- Inventário ----------
INV10=C.INV+[('bb-8','rainbow',1,True,''),('c-3po','scourge',1,True,'')]
def inv_filters():
    return '<div class="grid3" style="margin-top:12px">'+sel('Raridade','Todas','r')+sel('Nível','Todos','n')+sel('Uso no ciclo','Todos','u')+'</div>'
def inventario(mode='grade',fixed=False,overlay='',toast_html=''):
    b=top('Inventário',ibtn('plus','Adicionar droid','primary'))
    b+='<div style="margin-top:6px">'+search()+'</div>'
    b+=inv_filters()
    b+='<div style="margin-top:12px">'+seg(['Grade','Lista'],0 if mode=='grade' else 1,'Visão')+'</div>'
    if mode=='grade':
        cards=''
        for i,t,q,sell,note in INV10:
            st=('ok','Pode vender') if sell else ('bad','Não venda')
            cards+=dcard(i,t,qty=q,status=st,note=note)
        b+='<div class="grid2" style="margin-top:18px">'+cards+'</div>'
    else:
        rows=''
        for i,t,q,sell,note in INV10:
            st=('ok','Pode vender') if sell else ('bad','Não venda')
            acts=ibtn('minus',f'Tirar um {dname(i)}')+ibtn('plus',f'Adicionar um {dname(i)}','primary')
            rows+=item(i,t,note=note,status=st,actions=acts,meta=f'{rar(i)} · {TL[t]} · ×{q}')
        b+='<div style="margin-top:12px">'+rows+'</div>'
    return app(b,'inventory',toast_html,fixed=fixed,overlay=overlay)
S['inventario-grade']=('Inventário, Grade',inventario('grade'))
S['inventario-lista']=('Inventário, Lista',inventario('lista'))

# ---------- Vender ----------
def vender():
    b=top('Vender',back='Mais')
    b+='<p class="hint" style="margin-top:6px">Renascimentos 30 a 40 do Ciclo 5. Depois do Super Renascimento quase tudo reseta, então planeje o próximo ciclo.</p>'
    kind={'safe':('ok','Vender'),'up':('mute','Upar'),'keep':('bad','Guardar')}
    foot={'safe':'Não entra nos renascimentos que faltam; venda quando quiser.','up':'Suba o nível antes do renascimento que pede.','keep':'Ainda entra em renascimentos que faltam neste Ciclo.'}
    for title,k,its in C.SELL_GROUPS:
        rows=''.join(item(i,t,note=n,status=kind[k]) for i,t,n in its)
        b+=sec(title,rows+f'<p class="hint" style="margin-top:8px">{foot[k]}</p>',str(len(its)))
    return app(b,'more')
S['vender']=('Vender',vender())

# ---------- Ciclos ----------
def ciclos():
    b=top('Ciclos')
    b+='<p class="hint" style="margin-top:6px">Guia de referência dos dados da comunidade. Não usa seu progresso salvo.</p>'
    rows=''
    for k,(n,c) in enumerate(C.CYCLES):
        cur=tag('mute','Atual') if n=='Ciclo 5' else ''
        rows+=(f'<a class="row" href="#"><span class="row-main"><span class="dname" style="display:block">{n}</span><span class="hint" style="display:block">{c} renascimentos neste Ciclo</span>{cur}</span><span class="chev">{ic("chev",20)}</span></a>')
    b+=sec('Escolha o Ciclo',rows)
    b+=sec('Super Renascimento','<p style="margin-bottom:14px">Libera depois do renascimento #40. Reseta créditos e melhorias da base; quase todos os droids somem, exceto os Icônicos.</p>'+btn('Exportar PDF do Ciclo','secondary','download'))
    b+='<div style="margin-top:12px">'+btn('Trocar ciclo','ghost')+'</div>'
    return app(b,'cycles')
S['ciclos']=('Ciclos',ciclos())

# ---------- Mais ----------
def mais():
    b=top('Mais')
    rows=''.join(row(k,t,s.replace('Tema, inventário, dados','Aparência, inventário, dados')) for k,t,s in C.MORE)
    b+='<div style="margin-top:8px">'+rows+'</div>'
    b+='<p class="hint" style="margin-top:20px">Ferramenta de fã. Sem vínculo com Epic Games, Lucasfilm, Disney ou FOAD.</p>'
    return app(b,'more')
S['mais']=('Mais',mais())

# ---------- Droiddex ----------
def droiddex():
    b=top('Droiddex',back='Mais')
    b+='<p class="hint" style="margin-top:6px">101 droids e onde cada um entra</p>'
    b+='<div style="margin-top:12px">'+search('Buscar droids…')+'</div>'
    b+='<div class="row2" style="margin-top:12px"><button class="sel" style="flex:1;justify-content:space-between">Todas classes'+ic('down',18)+'</button><button class="chip" aria-pressed="false">Só fusão</button></div>'
    ids=['mouse','pit','cb','bb','orb-walker','r6','mecha-droid','bb9','lep','cyclens','bb-8','c-3po']
    cards=''.join(dcard(i,'default',qty=1,meta=rar(i)) for i in ids)
    b+='<div class="grid3" style="margin-top:18px">'+cards+'</div>'
    return app(b,'more')
S['droiddex']=('Droiddex',droiddex())

# ---------- Fusão ----------
def recipe(ings,res,name):
    tl=''
    for k,(i,q) in enumerate(ings):
        tl+=f'<div style="width:48px">{tile(i,"default","sm",qty=None)}</div>'+(f'<span class="t-label" style="align-self:center">×{q}</span>' if q>1 else '')
        if k<len(ings)-1: tl+=f'<span aria-hidden="true" style="align-self:center">{ic("plus",16)}</span>'
    return (f'<div class="row" style="flex-direction:column;align-items:flex-start;gap:10px"><div class="row2" style="flex-wrap:nowrap;gap:6px;width:100%">{tl}<span class="t-label" style="align-self:center;margin-left:2px">vira</span><div style="width:48px">{tile(res,"default","sm",missing=True)}</div></div>'
            f'<span class="dname">{esc(name)}</span><span class="hint">O resultado fica no menor nível entre os três ingredientes.</span></div>')
def fusao():
    b=top('Fusão',back='Mais')
    b+='<div style="margin-top:6px">'+tag('mute','Só uma fonte. Confira no jogo.')+'</div>'
    rules=''.join(f'<div class="row"><span class="row-ic">{ic(ik,22)}</span><span class="row-main">{esc(t)}</span></div>' for ik,t in [
        ('fusion','Três do mesmo droid no mesmo nível viram um desse droid no nível seguinte.'),
        ('star','Três droids diferentes da mesma raridade base viram um droid aleatório uma raridade acima.'),
        ('lock','Fusão abre no renascimento 3.')])
    b+=sec('Regras gerais',rules+'<p class="hint" style="margin-top:8px">Fusão libera no renascimento #3. Droids só de fusão não entram em renascimento (pelas fontes).</p>')
    b+=sec('Útil pro próximo renascimento',f'<div class="row"><span style="width:56px">{tile("r7","galactic","sm")}</span><span class="row-main"><span class="dname" style="display:block">R7</span><span class="hint">Entra em FUS-3 e no Renascimento #30</span></span></div>')
    b+=sec('Receitas',recipe([('r2',2),('b2-super',1)],'opt-ar','OPT-AR')+recipe([('kx',1),('ig',1),('ric',1)],'riv-3t','RIV-3T')+recipe([('mouse',2),('arg',1)],'whl-ex','WHL-EX'))
    return app(b,'more')
S['fusao']=('Fusão',fusao())

# ---------- Ajustes ----------
def ajustes():
    b=top('Ajustes',back='Mais')
    b+=sec('Aparência','<a class="row" href="#"><span class="row-ic">'+ic('sliders',24)+'</span><span class="row-main"><span class="dname" style="display:block">Tema e modo</span><span class="hint">Oficina, seguir o sistema</span></span><span class="chev">'+ic('chev',20)+'</span></a>')
    b+=sec('Progresso',f'<div class="row" style="justify-content:space-between"><span class="row-main"><span class="dname" style="display:block">Renascimentos concluídos</span><span class="hint">Ciclo 5</span></span><div class="stepper">{ibtn("minus","Diminuir renascimentos")}<span class="stepper-val">29</span>{ibtn("plus","Aumentar renascimentos","primary")}</div></div>'+switch('Registrar inventário',True)+switch('Animações',True))
    b+=sec('Dados','<div class="grid2">'+btn('Exportar','secondary','download')+btn('Importar','secondary','share')+'</div><p class="hint" style="margin-top:10px">Dados recentes. Pacote 1.36 · dados de 31/10/2026.</p>')
    b+=sec('Zona de risco','<p class="hint" style="margin-bottom:12px">Remove progresso, inventário e ajustes deste aparelho. Não dá para desfazer.</p>'+btn('Apagar tudo','danger','trash'))
    return app(b,'more')
S['ajustes']=('Ajustes',ajustes())

def aparencia(pref=2):
    b=top('Aparência',back='Ajustes')
    cards=''.join(theme_card(k,k=='oficina') for k in ['oficina','figurinhas','cartaz'])
    b+=sec('Tema','<div role="radiogroup" aria-label="Tema">'+cards+'</div>')
    b+=sec('Modo',seg(['Sistema','Claro','Escuro'],0,'Modo')+'<p class="hint" style="margin-top:10px">Sistema segue o modo claro ou escuro do aparelho.</p>')
    return app(b,'more')
S['ajustes-aparencia']=('Ajustes, Aparência',aparencia())

# ---------- Sheet e modais ----------
def sheet_droid():
    strip=''.join(f'<div style="width:100%">{tile("lep",t,"xs")}</div>' for t in TIERS9)
    sh=(f'<div class="scrim"></div><section class="sheet" role="dialog" aria-label="LEP Kyber"><span class="grab"></span>'
        f'<div class="sheet-h"><span class="t-label">Ficha do droid</span>{ibtn("x","Fechar")}</div>'
        f'<div class="sheet-art">{tile("lep","kyber","lg")}</div>'
        f'<div class="sheet-title"><h2 class="sheet-name dname">LEP</h2><span class="sheet-tier">Kyber</span></div><p class="t-meta">Mítico · Kyber</p>'
        f'<div class="row2" style="gap:6px;margin-bottom:10px" aria-label="Níveis">{"".join(f"<div style=width:100%>{tile("lep",t,"xs")}</div>" for t in TIERS9)}</div>'
        f'<div class="row" style="justify-content:space-between;min-height:56px"><span class="row-main"><span class="dname" style="display:block">Usa no ciclo</span><span class="hint">Entra no Renascimento #40</span></span>{tag("bad","Não venda")}</div>'
        f'<div class="row" style="justify-content:space-between;min-height:56px"><span class="dname">Quantidade</span><div class="stepper">{ibtn("minus","Diminuir quantidade")}<span class="stepper-val">1</span>{ibtn("plus","Aumentar quantidade","primary")}</div></div>'
        f'<div style="margin-top:10px">{btn("Remover do inventário","danger","trash")}</div></section>')
    return inventario('grade',fixed=True,overlay=sh)
S['sheet-droid']=('Ficha do droid',sheet_droid())

def modal(h,p,extra,acts):
    return f'<div class="scrim"></div><div class="modal-wrap"><div class="modal" role="alertdialog" aria-label="{esc(h)}"><h2>{esc(h)}</h2><p>{p}</p>{extra}<div class="modal-act">{acts}</div></div></div>'
def modal_super():
    m=modal('Super Renascimento?','Libera depois do renascimento #40. Reseta créditos e melhorias da base; quase todos os droids somem, exceto os Icônicos.','',btn('Cancelar','secondary')+btn('Confirmar','primary'))
    return progresso_super(m)
S['modal-super-renascimento']=('Modal: Super Renascimento',modal_super())
def modal_ciclo():
    m=modal('Trocar de ciclo?','Ir para Ciclo 6. O inventário continua. O progresso de renascimento também, a menos que você marque reset abaixo.',
            switch('Zerar renascimentos no novo ciclo (começar no #1)',False),btn('Cancelar','secondary')+btn('Trocar ciclo','primary'))
    return app(top('Ciclos')+'<p class="hint" style="margin-top:6px">Guia de referência dos dados da comunidade. Não usa seu progresso salvo.</p>'+sec('Escolha o Ciclo','<a class="row" href="#"><span class="row-main"><span class="dname" style="display:block">Ciclo 6</span><span class="hint">40 renascimentos neste Ciclo</span></span></a>'),'cycles',fixed=True,overlay=m)
S['modal-trocar-ciclo']=('Modal: Trocar ciclo',modal_ciclo())
def modal_remover():
    m=modal('Remover do inventário?','Remove LEP (Kyber) da sua lista. Você pode adicionar de novo depois.','',btn('Cancelar','secondary')+btn('Remover','danger-solid'))
    return inventario('grade',fixed=True,overlay=m)
S['modal-remover']=('Modal: Remover do inventário',modal_remover())

# ---------- Onboarding ----------
def onb(n,total,title,hint,body,primary='Continuar',back=True,skip='Pular'):
    steps='<div class="steps" role="img" aria-label="Passo %d de %d">%s</div>'%(n,total,''.join(f'<i class="{"on" if k<n else ""}"></i>' for k in range(total)))
    foot='<div class="stack" style="margin-top:24px">'+btn(primary,'primary')+('<div class="grid2">'+btn('Voltar','secondary')+btn(skip,'ghost')+'</div>' if back else btn(skip,'ghost'))+'</div>'
    return app(steps+'<h1 class="t-display" style="grid-area:auto;margin-top:22px;margin-bottom:8px;font-size:min(var(--title-size),9vw)">'+esc(title)+'</h1><p class="hint" style="margin-bottom:18px">'+esc(hint)+'</p>'+body+foot,'home',tab=False)
def onb1():
    art='<div class="trio" style="margin:28px 0 24px">'+''.join(f'<div>{tile(i,t)}</div>' for i,t in [('r7','galactic'),('lep','kyber'),('bb-8','rainbow')])+'</div>'
    b=('<header class="top"><span class="top-brand">DroidDeck</span><div class="top-aside"></div><h1 class="t-display" style="font-size:min(var(--title-size),11vw)">DroidDeck</h1></header>'
       '<h2 class="t-h2" style="margin-top:20px;font-size:calc(var(--h2-size) + 8px)">Planeje o próximo renascimento</h2>'
       '<p class="hint" style="margin-top:8px">Ciclo, inventário e o que vender, pensado pro celular enquanto você joga.</p>'+art+
       '<div class="stack">'+btn('Começar','primary')+btn('Pular','ghost')+'</div><p class="hint" style="margin-top:20px">Feito por fãs. Sem vínculo com a Epic Games.</p>')
    return app(b,'home',tab=False)
S['onb-1-boas-vindas']=('Onboarding 1: Boas-vindas',onb1())
S['onb-2-ciclo']=('Onboarding 2: Ciclo',onb(1,4,'Escolha o Ciclo','Dá pra trocar o Ciclo depois em Ajustes.',opts('ciclo',[(n,f'{c} renascimentos neste Ciclo') for n,c in C.CYCLES],4),back=True))
S['onb-3-progresso']=('Onboarding 3: Progresso',onb(2,4,'Onde você está neste Ciclo?','Quantos renascimentos você já terminou?',
   f'<div class="row" style="justify-content:space-between"><span class="row-main"><span class="dname" style="display:block">Renascimentos feitos</span><span class="hint">Próximo renascimento: #30</span></span><div class="stepper">{ibtn("minus","Diminuir renascimentos")}<span class="stepper-val">29</span>{ibtn("plus","Aumentar renascimentos","primary")}</div></div>'
   '<div class="chips" style="margin-top:14px"><button class="chip" aria-pressed="false">Começando</button><button class="chip" aria-pressed="true">Meio do Ciclo</button></div>'
   '<div style="margin-top:18px">'+meter(29,40,compact=True,foot='Prévia do renascimento #30')+'</div>'))
S['onb-4-tema']=('Onboarding 4: Tema (novo)',onb(3,4,'Escolha o visual','Você pode mudar depois em Ajustes, Aparência.',
   '<div role="radiogroup" aria-label="Tema">'+''.join(theme_card(k,k=='oficina') for k in ['oficina','figurinhas','cartaz'])+'</div>'+seg(['Sistema','Claro','Escuro'],0,'Modo'),skip='Pular'))
def onb5():
    rows=''.join(f'<div class="row"><span class="row-ic">{ic(k,22)}</span><span class="row-main"><span class="dname" style="display:block">{t}</span><span class="hint">{s}</span></span></div>' for k,t,s in [
      ('progress','Progresso','Veja o próximo renascimento e o que falta.'),('sell','Vender','Saiba o que pode vender antes do renascimento.'),('share','Exportar e compartilhar','Compartilhe progresso ou exporte PDF do ciclo.')])
    return onb(4,4,'O que você ganha','Painel, listas de venda e export quando precisar.',rows,primary='Abrir início',skip='Voltar',back=False)
S['onb-5-pronto']=('Onboarding 5: Pronto',onb5())

# ---------- Vazios ----------
def vazio_inv():
    b=top('Inventário',ibtn('plus','Adicionar droid','primary'))
    art='<div class="empty-art" aria-hidden="true">'+''.join(tile(i,'default',missing=True) for i in ['r2','bb','mouse'])+'</div>'
    b+='<div class="empty">'+art+'<h2 class="t-h2">Nenhum droid ainda.</h2><p class="hint">Cadastre os droids da sua base pra comparar com o próximo renascimento.</p>'+btn('Adicionar droid','primary','plus')+'</div>'
    return app(b,'inventory')
S['vazio-inventario']=('Inventário vazio',vazio_inv())
def vazio_vender():
    b=top('Vender',back='Mais')
    art='<div class="empty-art" aria-hidden="true">'+''.join(tile(i,'default',missing=True) for i in ['kx','orb-walker','lo'])+'</div>'
    b+='<div class="empty">'+art+'<h2 class="t-h2">Cadastra o inventário pra ver o que vender</h2><p class="hint">Marca os droids que você tem pra comparar com os próximos renascimentos.</p>'+btn('Ir pro inventário','primary')+'</div>'
    return app(b,'more')
S['vazio-vender']=('Vender vazio',vazio_vender())
def skeleton_inv():
    sk=lambda cls,st='':f'<div class="sk {cls}" style="{st}"></div>'
    b=top('Inventário',ibtn('plus','Adicionar droid','primary'))
    b+='<div style="margin-top:6px" aria-busy="true">'+sk('','height:54px')+'</div>'
    b+='<div class="grid2" style="margin-top:18px">'+''.join(f'<div>{sk("sk-tile")}<div class="sk sk-line" style="width:70%;margin-top:12px"></div><div class="sk sk-line" style="width:50%"></div></div>' for _ in range(6))+'</div>'
    return app(b,'inventory')
S['skeleton-inventario']=('Inventário carregando',skeleton_inv())

# ---------- Componentes ----------
def componentes():
    def csec(t,body): return f'<section class="cs-sec"><h2 class="cs-h">{t}</h2>{body}</section>'
    sw=''.join(f'<div class="swatch"><i style="background:var(--{v})"></i>{n}</div>' for v,n in [('c-bg','fundo'),('c-surface','superfície'),('c-surface-2','superfície 2'),('c-border','linha'),('c-control-border','borda de controle'),('c-text','texto'),('c-text-2','texto 2'),('c-accent','destaque'),('c-accent-graph','destaque gráfico'),('c-bad-fg','erro'),('c-bad-bg','fundo de erro'),('c-ok-fg','ok')])
    typo=('<div class="stack"><div class="t-display" style="font-size:min(var(--title-size),12vw)">Título 30</div><div class="t-h2">Seção</div><div class="t-label">Rótulo em destaque</div><div class="t-meta">Mítico · Kyber</div>'
          '<div class="dname">Util-Tec (Ulti-Tech)</div><p>Texto de corpo com 16 pixels e entrelinha confortável para ler no celular.</p><p class="hint">Texto de apoio com 14 pixels.</p></div>')
    btns=('<div class="stack">'+btn('Primário','primary')+btn('Secundário','secondary')+btn('Destrutivo','danger','trash')+btn('Desabilitado','secondary',disabled=True)+btn('Texto','ghost')+
          f'<div class="row2" style="flex-wrap:wrap">{ibtn("x","Tirar")}{ibtn("plus","Adicionar","primary")}{btn("Pequeno","secondary",cls="btn--sm")}</div></div>')
    fields=('<div class="stack"><div><span class="lbl">Busca</span>'+search()+'</div><div><span class="lbl">Foco</span>'+search('Buscar por nome…','LEP','is-focus')+'</div>'
            '<div><span class="lbl">Erro</span><input class="field is-error" value="Kyber++" aria-label="Quantidade" aria-invalid="true"><p class="err">'+ic('x',16)+'Use um número de 1 a 99.</p></div>'
            +seg(['Foco','Lista'],0)+'<div class="chips"><button class="chip" aria-pressed="true">Meio do Ciclo</button><button class="chip" aria-pressed="false">Começando</button></div>'
            +opts('dem',[('Sistema','Segue o aparelho'),('Claro',''),('Escuro','')],0)
            +'<div><div class="lbl-row"><span class="lbl">Renascimentos feitos</span><span class="val">29</span></div><input class="range" type="range" min="0" max="40" value="29" style="--p:72.5%" aria-label="Renascimentos feitos"><div class="range-scale"><span>0</span><span>40</span></div></div>'
            +switch('Registrar inventário',True)+switch('Animações',False)
            +f'<div class="row" style="justify-content:space-between"><span class="dname">Quantidade</span><div class="stepper">{ibtn("minus","Diminuir")}<span class="stepper-val">2</span>{ibtn("plus","Aumentar","primary")}</div></div></div>')
    tags='<div class="row2" style="flex-wrap:wrap;gap:10px">'+tag('ok','Pode vender')+tag('bad','Não venda')+tag('mute','Upar')+tag('ok','Ok')+tag('bad','Falta')+'</div>'
    tiles='<div class="grid3">'+''.join(f'<div><div style="width:100%">{tile("lep",t,qty=2 if t in("gold","scourge") else None)}</div><span class="dname" style="display:block;margin-top:8px;font-size:14px">{TL[t]}</span></div>' for t in TIERS9)+'</div>'
    states='<div class="grid3" style="margin-top:14px"><div>'+tile('r2','default',missing=True)+'<span class="t-meta" style="display:block;margin-top:6px">Vaga vazia</span></div><div>'+tile('r2','gold',qty=3)+'<span class="t-meta" style="display:block;margin-top:6px">Com quantidade</span></div><div>'+tile('r2','kyber')+'<span class="t-meta" style="display:block;margin-top:6px">Nome inteiro</span></div></div>'
    cards=('<div class="stack"><div>'+hero.__call__(30)+'</div></div>') # hero real
    meters=meter(29,40)+'<div style="height:16px"></div>'+meter(12,40,compact=True,label='Ciclo 2')
    sheet=(f'<div class="demo-stage" style="height:380px"><div class="scrim"></div><section class="sheet" style="position:absolute"><span class="grab"></span><div class="sheet-h"><span class="t-label">Ficha do droid</span>{ibtn("x","Fechar")}</div>'
           f'<div class="sheet-title"><h2 class="sheet-name dname">R7</h2><span class="sheet-tier">Galáctico</span></div><p class="t-meta">Lendário · Galáctico</p>{btn("Remover do inventário","danger","trash")}</section></div>')
    modal_demo=('<div class="demo-stage demo-center"><div class="scrim"></div><div class="modal" role="group" aria-label="Exemplo"><h2>Remover do inventário?</h2><p>Remove LEP (Kyber) da sua lista. Você pode adicionar de novo depois.</p><div class="modal-act">'+btn('Cancelar','secondary')+btn('Remover','danger-solid')+'</div></div></div>')
    toasts='<div class="stack">'+toast('R7 adicionado ao Renascimento #30')+toast('Arquivo inválido. Confira o JSON e tente de novo.','Fechar','toast--err','info')+'</div>'
    tabdemo='<div class="tab-demo" style="margin:0 calc(var(--sp-page)*-1)">'+tabbar('inventory')+'</div>'
    icons='<div class="ico-grid">'+''.join(f'<div class="ico-cell">{ic(k,24)}<span>{C.ICN[k]}</span></div>' for k in C.ICONS)+'</div>'
    sk=lambda cls,st='':f'<div class="sk {cls}" style="{st}"></div>'
    vazio=('<div class="empty" style="padding-top:8px"><div class="empty-art" aria-hidden="true">'+''.join(tile(i,'default',missing=True) for i in ['r2','bb','mouse'])+'</div><h2 class="t-h2">Nenhum droid ainda.</h2><p class="hint">Cadastre os droids da sua base pra comparar com o próximo renascimento.</p></div>'
           +'<div class="grid2" style="margin-top:14px"><div>'+sk('sk-tile')+sk('sk-line','width:70%;margin-top:12px')+'</div><div>'+sk('sk-tile')+sk('sk-line','width:50%;margin-top:12px')+'</div></div>')
    b=('<div class="cs"><div class="cs-head"><div class="t-label" style="margin-bottom:6px">Folha de componentes</div><h1 class="t-display" style="font-size:min(var(--title-size),11vw)">DroidDeck</h1></div>'
       +csec('Cores',f'<div class="swatches">{sw}</div>')+csec('Tipografia',typo)+csec('Botões',btns)+csec('Campos e controles',fields)+csec('Tags de estado',tags)
       +csec('Droids nos 9 níveis',tiles+states)+csec('Hero do próximo renascimento',hero(30))+csec('Medidor do Ciclo',meters)+csec('Sheet',sheet)+csec('Modal',modal_demo)+csec('Toast',toasts)
       +csec('Tab bar',tabdemo)+csec('Vazio e carregando',vazio)+csec('Ícones',icons)+'</div>')
    return b
S['componentes']=('Folha de componentes',componentes())
SCREENS=list(S.keys())
