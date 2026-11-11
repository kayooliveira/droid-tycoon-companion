import json,collections,sys
R=[]
for t in ['oficina','figurinhas','cartaz']: R+=json.load(open(f'/workspace/dd-design/sistema/tools/_resultado_{t}.json'))
tot=collections.Counter(); fc=collections.Counter(); pages=len(R); pf=0
byk=collections.defaultdict(list)
for r in R:
    for k,v in r['n'].items(): tot[k]+=v
    if r['fails']: pf+=1
    for c,m in r['fails']:
        fc[c]+=1; byk[(c,r['theme'],r['mode'],r['screen'],m)].append(r['width'])
print('páginas',pages,'com falha',pf,'checagens',sum(tot.values()),dict(tot)); print('falhas',sum(fc.values()),dict(fc))
lim=int(sys.argv[1]) if len(sys.argv)>1 else 60
for i,((c,t,m,s,msg),w) in enumerate(sorted(byk.items())):
    if i>=lim: print('...',len(byk)-lim,'mais'); break
    print(c,t,m,s,sorted(set(w)),msg[:150])
