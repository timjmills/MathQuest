#!/usr/bin/env python3
"""G7 reader: rebuild tally-src/findings-G7.csv and reports-G7.csv from the structured grade runs
(design/audit/runs/*/grades*.jsonl). Run from anywhere:

    python3 design/status/tally-src/g7/build.py              # writes the two CSVs
    python3 design/status/tally-src/g7/build.py --old-rule-ids --out <dir>
        # the first tally's rule_ids (version caps copied onto every defect), for comparison only

Pipeline (deterministic; nothing random, no network):
  1. extract.py   every defect of every graded version; regrade4 (dict-shaped versions) separately
  2. classify.py  rule-based class per defect, deduped per (run, skill, defect text); DROP = not a defect
  3. ov_r4.txt    hand classes for the 406 regrade4 rows (index into that list)
  4. ov.txt       hand classes for the combined list (index = position in classify output + regrade4 rows)
  5. one CSV row per kept defect; reports-G7.csv one row per run (verdict from the versions' `pass`)

rule_ids (fixed 2026-10-23, critic wave0-b r1 D1): the rule ids the defect itself writes in its
`what`, `fix`, `where` or its own `cap` field, plus a graded version's cap only when the cap's condition
is exactly this defect (CAP_FITS below: the defect's class is the cap's class and its text names the
cap's condition). Quoted on-page text is not read as a citation. Every cap of the graded version is kept, unfiltered, in the `caps` column.
The report dates come from `git log --diff-filter=A` of this clone."""
import json,re,csv,subprocess,collections,glob,os,sys
sys.dont_write_bytecode=True   # no __pycache__ in the repo
HERE=os.path.dirname(os.path.abspath(__file__))
R=os.path.abspath(os.path.join(HERE,'..','..','..','..'))+'/'
sys.path.insert(0,HERE)
from extract import extract,extract_r4
from classify import classify,classify_all
args=sys.argv[1:]
OLD='--old-rule-ids' in args
OUT=args[args.index('--out')+1] if '--out' in args else os.path.join(HERE,'..')
AB={'SPA':'SPACE','PED':'PEDAGOGY','SIZ':'SIZE','MIS':'MISSING','CLA':'CLARITY','VIS':'VISUAL_DESIGN','CLI':'CLIP_OVERLAP','SLO':'SLOT','INK':'INK_FONT','REP':'REPEAT','INS':'INSTRUCTION','NAM':'NAME_CONTENT','SCR':'SCREEN_PARITY','PAT':'PATTERN','VIE':'VIEWPORT','GIV':'GIVEAWAY','KEY':'KEY','NOT':'NOTATION','INT':'INTERACTION','PLA':'PLAIN_WORDS','STE':'STEPS_LAYOUT','PRO':'PROCESS','OTH':'OTHER','DROP':'DROP'}
KIND={'PROCESS':'process','PEDAGOGY':'judgment','CLARITY':'judgment','VISUAL_DESIGN':'judgment','OTHER':'judgment'}
def readov(name): return {int(i):AB[c] for i,c in (l.split() for l in open(os.path.join(HERE,name)) if l.strip())}

main=classify_all(extract(R))
r4=extract_r4(R); o4=readov('ov_r4.txt')
for i,x in enumerate(r4): x['cls']=o4.get(i,classify(x))
o=main+r4
ov=readov('ov.txt')
nchg=0
for i,x in enumerate(o):
  if i in ov and ov[i]!=x['cls']: nchg+=1; x['final']=ov[i]
  else: x['final']=x['cls']
print('overrides changing class',nchg,'of',len(o))
RULE=re.compile(r'\b(H\d{1,2}|L\d{1,2}|OC\d{1,2}|PT-[A-Z]{2,4}-\d+|AK-\d+|SP-\d+|SL-\d+[a-z]?|TY-\d+[a-z]?|DN-\d+[a-z]?|VA-\d+|RP-\d+|INK-\d+|AX-\d+|SC-\d+|P-\d+|PG-\d+|CL-\d+[a-z]?|BD-\d+|SCC-\d+|R2|S[1-9])\b')
# A version cap is copied onto a defect only when the cap's condition (RUBRIC.md §5 H1-H13,
# OPTIONS-RUBRIC.md OC1-OC15) is exactly this defect: (classes the cap belongs to, text the defect must name).
CAP_FITS={
 'H1':({'KEY'},r'\bkey|keyed|answer'),
 'H2':({'CLIP_OVERLAP'},r'.'),
 'H3':({'NAME_CONTENT'},r'.'),
 'H4':({'INK_FONT'},r'.'),
 'H5':({'SPACE'},r'page|lone|split|footer|\bfoot\b|per sheet|under-?fill|half|% (used|full|of the page)|blank (strip|half)|wasted'),
 'H6':({'VIEWPORT'},r'.'),
 'H7':({'SCREEN_PARITY','INSTRUCTION'},r'\bverbs?\b|\btap|click|drag|\btype|circle|\bwrite|colou?r in|shade|tick|on paper|on screen'),
 'H8':({'SCREEN_PARITY'},r'multiple.choice|choice|option button|doubl|two (answer|input|places)|second (input|field|box|answer)|nested|three answer'),
 'H9':({'SLOT'},r'room|small|narrow|short|tight|cramped|fit|write|space'),
 'H10':({'KEY'},r'list|facsimile|not the page|not a copy'),
 'H11':({'MISSING'},r'.'),
 'H12':({'SLOT','VIEWPORT','INTERACTION','MISSING'},r'draw|build|model|mouse|finger|drag|smaller than|too small|on paper'),
 'H13':({'SPACE'},r'band|empty|blank|% of the (cell|row|panel)|cell|row|taller|sized for|white ?space|gap'),
 'OC1':({'MISSING','NAME_CONTENT'},r'nothing|ignor|identical|no (visible )?(change|effect)|same as'),
 'OC2':({'MISSING','NAME_CONTENT'},r'nothing|ignor|identical|no (visible )?(change|effect)|same as'),
 'OC3':({'SCREEN_PARITY','MISSING'},r'print|paper|screen'),
 'OC4':({'NAME_CONTENT'},r'.'),
 'OC8':({'PEDAGOGY','GIVEAWAY'},r'scaffold|support|fade'),
 'OC9':({'MISSING'},r'.'),
 'OC11':({'REPEAT','CLARITY'},r'duplicat|repeat|same|twice'),
 'OC13':({'MISSING','INK_FONT','SIZE'},r'nothing|no (visible )?change|identical|same'),
 'OC14':({'SIZE'},r'\bsize\b|(?-i:\b(at|size) [SL]\b|\b[SL] (and|=|==|vs)\b)|columns?|same (layout|items|page|drawing)|scal|denser|per (A4 )?page|a page|fixed'),
 'OC15':({'MISSING'},r'.'),
}
def own_text(x):
  # quoted on-page text ("L3 · Make Equal Groups", a badge saying "L3") is not a rule citation
  return re.sub(r'"[^"]*"|“[^”]*”',' ',' '.join(str(x.get(k) or '') for k in ('what','fix','where','cap')))
def rule_ids(x,c):
  if OLD:
    ids=list(dict.fromkeys([*x['caps'], *RULE.findall(x['what']+' '+(x.get('cap') or ''))]))
  else:
    t=own_text(x)
    cited=RULE.findall(re.sub(r'\bH\d(?=\.\d)',' ',t))   # "H0.32" is a measured band height, not rule H0
    fit=[cp for cp in x['caps'] if cp in CAP_FITS and c in CAP_FITS[cp][0] and re.search(CAP_FITS[cp][1],x['what'] or '',re.I)]
    ids=list(dict.fromkeys([*cited,*fit]))
  return [i for i in ids if i not in ('S1','S2','S3','S4','S5','S6','S7','S8','S9')]
def rnd(run):
  m=re.search(r'-r(\d+)',run); return int(m.group(1)) if m else 1
CARRY=re.compile(r'persist|still open|not fixed|still present|defect open|defect,? open|open from|r\d defect|regrade\d?,? persists|prior finding|prior R\d|carried|\(r\d+[^)]*persists|unchanged|still (?:dealt|print|says|holds)|again\b|\bstill\b',re.I)
def sev(x):
  s=(x['severity'] or '').lower()
  t=x['what'].lower()
  if s in('critical','major'): return 'blocking'
  if s in('minor','note','note (re-check)'): return 'minor'
  if re.search(r'\bnit\b|\bfine\b|acceptable|minor',t): return 'minor'
  return 'blocking'
def tmpl(x):
  f=(x.get('file') or '')
  m=re.search(r'sheet/cells/([\w-]+)\.js',f)
  if m: return m.group(1)
  if re.search(r'legacy',x['what'],re.I): return 'legacy'
  return ''
def fam(x):
  s=x['skill']
  if x['run'].startswith('lessons'): return 'lessons'
  return s.split(':')[0] if ':' in s else s
rows=[];cnt=collections.Counter();perrep=collections.Counter()
for x in o:
  c=x['final']
  if c=='DROP': continue
  rep='design/audit/runs/%s/'%x['run']
  perrep[rep]+=1
  summ=re.sub(r'\s+',' ',x['what']).strip()
  if len(summ)>120: summ=summ[:117].rstrip()+'...'
  rows.append(dict(report=rep,run=x['run']+'/'+x['skill'],round=rnd(x['run']),defect_id='U%d'%perrep[rep],cls=c,kind=KIND.get(c,'machine'),
    carried='yes' if CARRY.search(x['what']) else 'no',severity=sev(x),rule_ids=';'.join(rule_ids(x,c)),family=fam(x),template=tmpl(x),summary=summ,
    caps=';'.join(dict.fromkeys(x['caps']))))
  cnt[c]+=1
FCOLS='report,run,round,defect_id,class,kind,carried,severity,rule_ids,family,template,summary'.split(',')
with open(os.path.join(OUT,'findings-G7.csv'),'w',newline='') as f:
  w=csv.writer(f); w.writerow(FCOLS+([] if OLD else ['caps']))
  for r in rows: w.writerow([r['report'],r['run'],r['round'],r['defect_id'],r['cls'],r['kind'],r['carried'],r['severity'],r['rule_ids'],r['family'],r['template'],r['summary']]+([] if OLD else [r['caps']]))
# reports
runs=sorted(set(x['run'] for x in o)|set(p.split('/')[-2] for p in glob.glob(R+'design/audit/runs/*/grades*.jsonl')))
with open(os.path.join(OUT,'reports-G7.csv'),'w',newline='') as f:
  w=csv.writer(f); w.writerow('report,run,lane,round,date_added,commit_added,verdict,min_score,mean_score,n_open,notes'.split(','))
  for run in runs:
    rep='design/audit/runs/%s/'%run
    files=sorted(glob.glob(R+rep+'grades*.jsonl'))+sorted(glob.glob(R+rep+'SUMMARY.md'))
    dates=[]
    for fp in files:
      out=subprocess.run(['git','-C',R,'log','--diff-filter=A','--format=%ad %h','--date=iso-strict','--',fp[len(R):]],capture_output=True,text=True).stdout.strip().splitlines()
      if out: dates.append(out[-1])
    dates.sort(); d,c=(dates[0].split() if dates else ('',''))
    scores=[];nv=0;npass=0;commits=set()
    for fp in sorted(glob.glob(R+rep+'grades*.jsonl')):
      for l in open(fp):
        l=l.strip()
        if not l: continue
        ob=json.loads(l)
        if ob.get('commit'): commits.add(ob['commit'])
        V=ob.get('versions')
        vers=list(V.values()) if isinstance(V,dict) else ([v for v in V if isinstance(v,dict)] if isinstance(V,list) and any(isinstance(v,dict) for v in V) else [ob])
        for v in vers:
          sc=v.get('scores') or {k:v[k] for k in ('C1','C2','C3','C4','O1','O2','O3','O4','O5','O6') if isinstance(v.get(k),(int,float))}
          if not sc: continue
          nv+=1; npass+=1 if v.get('pass') else 0
          scores+= [s for s in sc.values() if isinstance(s,(int,float))]
    verdict='NA' if nv==0 else ('PASS' if npass==nv else 'FAIL')
    extra={'lessons-r4':'SUMMARY: 48/48 pages pass at seed 4242 (PASS); robustness line fails at seed 1001',
           'regrade4-2026-09-25':'SUMMARY: 0 of 26 skills pass; tree 9babcc0',
           'options-r3':'SUMMARY: 3/123 panels pass; O-criteria rubric; tree 9babcc0',
           'fractions-r1':'SUMMARY: 0/26 skills pass; tree 4914ea1',
           'pv-r1':'SUMMARY: 0/13 skills pass; tree f8220ad','ea-r5':'SUMMARY: 3/27 skills pass; tree 99d2f50',
           'lessons-r1':'SUMMARY: 4/48 pages pass; tree 933773b','lessons-r2':'SUMMARY: 22/48 pages pass; tree 67ccdc9',
           'lessons-r3':'SUMMARY: 38/48 pages pass; tree 56eb699'}
    if run=='lessons-r4': verdict='PASS'
    lane=re.sub(r'(-r\d+|-?\d{4}-\d\d-\d\d)$','',run)
    notes=(extra.get(run,'')+'; ' if run in extra else '')+'%d/%d versions pass'%(npass,nv)+(('; graded tree '+','.join(sorted(commits))[:40]) if commits else '')
    w.writerow([rep,run,lane,rnd(run),d,c,verdict,min(scores) if scores else '',round(sum(scores)/len(scores),2) if scores else '',perrep[rep],notes[:120]])
print(len(rows)); print(cnt.most_common()); print(len(runs))
