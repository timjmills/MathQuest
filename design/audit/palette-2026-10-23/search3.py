# Palette search: python3 search3.py N KEY_ERR_MIN HUE_GAP  (the chosen set: 8 20 20)
import itertools,random,sys
import os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'search.py')).read().split("cands=[]")[0]; ns={}; exec(src,ns)
TW=ns['TW']; cr=ns['cr']; hue=ns['hue']; hd=ns['hd']; dE=ns['dE']; lab=ns['lab']
L45={'yellow':['#FACC15','#EAB308'],'lime':['#A3E635','#84CC16'],'green':['#4ADE80','#22C55E'],'emerald':['#34D399','#10B981'],'teal':['#2DD4BF','#14B8A6'],'cyan':['#22D3EE','#06B6D4'],'sky':['#38BDF8','#0EA5E9'],'blue':['#60A5FA','#3B82F6'],'indigo':['#818CF8','#6366F1'],'violet':['#A78BFA','#8B5CF6'],'purple':['#C084FC','#A855F7'],'fuchsia':['#E879F9','#D946EF'],'pink':['#F472B6','#EC4899'],'rose':['#FB7185','#F43F5E']}
INK='#111827'; KEY='#C2410C'; ERR='#B91C1C'; MODES=('normal','deut','prot')
N=int(sys.argv[1]); KE=float(sys.argv[2]); HG=float(sys.argv[3])
cands=[]
for fam in set(TW)|set(L45):
    if fam in ('red','orange','amber','brown','gold','stone','neutral','zinc','gray','slate'): continue
    for h in TW.get(fam,[])+L45.get(fam,[]):
        if hd(hue(h),0)<25 or hd(hue(h),17.5)<25: continue
        if min(dE(h,KEY,m) for m in MODES)<KE or min(dE(h,ERR,m) for m in MODES)<KE: continue
        if cr(h,'#FFFFFF')>=4.5: cands.append((fam,h,'white'))
        elif cr(h,INK)>=4.5: cands.append((fam,h,'ink'))
def score(sel):
    m=1e9; n=1e9
    for a,b in itertools.combinations(sel,2):
        if hd(hue(a[1]),hue(b[1]))<HG: return -1
        n=min(n,dE(a[1],b[1],'normal'))
        for mode in ('deut','prot'): m=min(m,dE(a[1],b[1],mode))
    if n<30: return -1
    return m
random.seed(11); fams=sorted(set(c[0] for c in cands)); best=(-2,None)
for it in range(60000):
    if len(fams)<N: break
    fs=random.sample(fams,N); sel=[random.choice([c for c in cands if c[0]==f]) for f in fs]
    s=score(sel)
    if s>best[0]: best=(s,sel)
s,sel=best
if sel:
  imp=True
  while imp:
    imp=False
    for i in range(N):
        for c in cands:
            if c[0] in [x[0] for j,x in enumerate(sel) if j!=i]: continue
            t=sel[:]; t[i]=c; st=score(t)
            if st>s+1e-9: s,sel,imp=st,t,True
  nmin=min(dE(a[1],b[1],'normal') for a,b in itertools.combinations(sel,2))
  print(N,'KE',KE,'HG',HG,'min CVD dE',round(s,1),'min normal dE',round(nmin,1))
  for f,h,t in sorted(sel,key=lambda x:hue(x[1])):
    print(f"  {f:8} {h} text={t:5} hue {hue(h):4.0f} contrast {cr(h,'#FFFFFF' if t=='white' else INK):4.1f} L* {lab(h,'normal')[0]:3.0f} vsKey {min(dE(h,KEY,m) for m in MODES):5.1f} vsErr {min(dE(h,ERR,m) for m in MODES):5.1f}")
else: print(N,KE,HG,'none')
