import re,json,html,os,urllib.request
R='raw/'
WIKI='https://star-wars-droid-tycoon.fandom.com'
droids={}
# droid catalog
h=open(R+'droids.html').read()
t=re.sub(r'<script.*?</script>|<style.*?</style>','',h,flags=re.S)
for a in re.finditer(r'<a href="/droids/([^/"]+)/"[^>]*>(.*?)</a>',t,re.S):
    slug=a.group(1); inner=a.group(2)
    if slug in('worker','astromech','battle','protocol','best','iconic','scourge'):continue
    img=re.search(r'src="(/img/droids/[^"?]+)',inner)
    txt=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',inner))).strip()
    d=droids.setdefault(slug,{'id':slug})
    if img: d['imagePath']=img.group(1)
    d.setdefault('texts',[]).append(txt)
cycles=[]
for p in range(1,7):
    h=open(R+f'path-{p}.html').read()
    ver=re.search(r'Game version ([\d.]+)\s*(?:<[^>]+>\s*)*Checked ([A-Za-z]+ \d+, \d+)',re.sub(r'<[^>]+>',' ',h))
    rbs=[]
    for m in re.finditer(r'<tr id="rebirth-(\d+)">(.*?)</tr>',h,re.S):
        n=int(m.group(1)); row=m.group(2)
        reqs=[]
        for pr in re.finditer(r'<a href="/droids/([^/"]+)/".*?<span class="n">(.*?)</span></a>\s*<span class="tier t-([^"]+)">',row,re.S):
            reqs.append({'droidId':pr.group(1),'rarity':pr.group(3).lower(),'quantity':1})
            droids.setdefault(pr.group(1),{'id':pr.group(1)}).setdefault('name',html.unescape(pr.group(2)))
        tds=re.findall(r'<td>(.*?)</td>',row,re.S)
        cells=[re.sub(r'<[^>]+>','',html.unescape(c)).strip() for c in tds]
        warn='check' in row.lower() and 'game' in row.lower()
        rbs.append({'rebirth':n,'credits':cells[-2] if len(cells)>=2 else None,'unlocks':cells[-1] or None,
          'requirements':reqs,'sourceUrl':f'{WIKI}/wiki/Rebirth_requirements',
          'lastVerified':'2026-10-31','confidence':'partial' if warn or len(reqs)!=3 else 'confirmed',
          **({'note':re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',html.unescape(row))).strip()} if warn else {})})
    cycles.append({'id':f'path-{p}','name':f'Path {p}','aliases':[f'Cycle {p}',f'Ciclo {p}'],'order':p,
      'gameVersion':ver.group(1) if ver else None,'sourceCheckedDate':ver.group(2) if ver else None,
      'sourceUrl':f'{WIKI}/wiki/Rebirth_requirements','lastVerified':'2026-10-31',
      'confidence':'confirmed' if len(rbs)==40 else 'partial','rebirthCount':len(rbs),'rebirths':rbs})
json.dump({'droids':droids,'cycles':cycles},open('parsed.json','w'),indent=1)
for c in cycles: print(c['id'],c['rebirthCount'],c['gameVersion'],sum(r['confidence']!='confirmed' for r in c['rebirths']))
print(len(droids)); print([d for d in droids.values() if 'texts' not in d][:5])
print(list(droids.values())[:3])
