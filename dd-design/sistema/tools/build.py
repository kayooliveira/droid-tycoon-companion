import sys,os
sys.path.insert(0,os.path.dirname(__file__))
from screens import S,SCREENS
from ui import page,ROOT
os.makedirs(ROOT+'/html',exist_ok=True)
for k,(t,b) in S.items():
    open(f'{ROOT}/html/{k}.html','w').write(page(t,b))
import json
json.dump([[k,S[k][0]] for k in SCREENS],open(ROOT+'/html/screens.json','w'),ensure_ascii=False)
print(len(S),'telas')
