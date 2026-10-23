"""G7 reader, step 1: read every defect out of design/audit/runs/*/grades*.jsonl.
extract(root): the list-shaped grade files (one row per defect per graded version).
extract_r4(root): regrade4-2026-09-25, whose `versions` is a dict; deduped on (skill, defect text)."""
import json,glob

def extract(root):
  rows=[]
  for f in sorted(glob.glob(root+'design/audit/runs/*/grades*.jsonl')):
    run=f.split('/')[-2]
    for ln,l in enumerate(open(f)):
      l=l.strip()
      if not l: continue
      o=json.loads(l)
      skill=o.get('skill') or o.get('lesson') or '?'
      vers=[v for v in o['versions'] if isinstance(v,dict)] if isinstance(o.get('versions'),list) and any(isinstance(v,dict) for v in o['versions']) else [o]
      for v in vers:
        caps=v.get('caps') or o.get('caps') or []
        caps=[c if isinstance(c,str) else json.dumps(c) for c in caps]
        ver=' '.join(str(v.get(k,'')) for k in ('surface','version','role','page','size','variant','kind') if v.get(k))
        for d in v.get('defects') or []:
          if isinstance(d,str): d={'what':d}
          rows.append(dict(run=run,src=f[len(root):],skill=skill,ver=ver,caps=caps,**{k:(d.get(k) if not isinstance(d.get(k),(list,dict)) else json.dumps(d.get(k))) for k in ('criterion','severity','where','what','fix','file','tag','cap','route')}))
  return rows

def extract_r4(root):
  f=root+'design/audit/runs/regrade4-2026-09-25/grades.jsonl'
  rows=[];seen=set()
  for l in open(f):
    o=json.loads(l)
    for vn,v in o['versions'].items():
      for d in v.get('defects') or []:
        k=(o['skill'],d['what'].strip())
        if k in seen: continue
        seen.add(k)
        rows.append(dict(run='regrade4-2026-09-25',src=f[len(root):],skill=o['skill'],ver=vn,caps=v.get('caps') or [],criterion=d.get('criterion'),severity=d.get('severity'),where=d.get('where'),what=d['what'],fix=d.get('fix'),file=d.get('file'),tag=None,cap=None,route=None))
  return rows
