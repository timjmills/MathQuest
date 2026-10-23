# Teacher site 2.0 maths-area palette check (IMPROVEMENT_PLAN.md §2.7). Run: python3 ramps.py
import itertools
import os
src=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'search.py')).read().split("cands=[]")[0]; ns={}; exec(src,ns)
cr=ns['cr']; hue=ns['hue']; dE=ns['dE']; lab=ns['lab']
INK='#111827'; W='#FFFFFF'; DK='#111318'
A=[('CC','Counting','#FACC15'),('OA','Operations & algebra','#3B82F6'),('NBT','Place value (base ten)','#4338CA'),('NF','Fractions','#86198F'),
   ('MD-M','Measurement','#047857'),('MD-D','Data','#06B6D4'),('G','Geometry','#4ADE80'),('RP-NS','Ratio & number system (Gr 6)','#EC4899')]
SL='#475569'
def h2r(h): return [int(h[i:i+2],16) for i in (1,3,5)]
def r2h(r): return '#'+''.join(f'{max(0,min(255,round(x))):02X}' for x in r)
def mix(a,b,t): ra,rb=h2r(a),h2r(b); return r2h([ra[i]*t+rb[i]*(1-t) for i in range(3)])
def best(h): 
    w,i=cr(h,W),cr(h,INK); return ('white',w) if w>=i else ('ink',i)
print('| Area | tint 10% | soft 30% | bold | deep |')
for code,name,b in A:
    tint=mix(b,W,.10); soft=mix(b,W,.30); t=.75
    while cr(mix(b,'#000000',t),W)<7: t-=.01
    deep=mix(b,'#000000',t)
    row=[]
    for h in (tint,soft,b,deep):
        t,c=best(h); row.append(f'{h} {t} {c:.1f}')
    print(code,' | '.join(row))
    # dark mode: tint/soft over dark page
    dt=mix(b,DK,.18); ds=mix(b,DK,.40)
    print('   dark tint',dt,'text #F3F4F6',round(cr(dt,'#F3F4F6'),1),' dark soft',ds,round(cr(ds,'#F3F4F6'),1),' bold on dark page',round(cr(b,DK),1))
print('min pairwise bold dE:')
for m in ('normal','deut','prot'):
    print(m, round(min(dE(a[2],b[2],m) for a,b in itertools.combinations(A,2)),1), min(((round(dE(a[2],b[2],m),1),a[0],b[0]) for a,b in itertools.combinations(A,2))))
print('slate vs areas min', min((round(min(dE(SL,a[2],m) for m in ('normal','deut','prot')),1),a[0]) for a in A))
print('ink vs areas min', min((round(min(dE(INK,a[2],m) for m in ('normal','deut','prot')),1),a[0]) for a in A))
for code,name,b in A: print(code, 'hue',round(hue(b)), 'L*',round(lab(b,'normal')[0]))
print('chip vs page (light white / dark #111318):')
for code,name,b in A+[('slate','',SL)]: print(' ',code,round(cr(b,W),2),round(cr(b,DK),2))
print('bold vs error red #B91C1C and key orange #C2410C, min over normal/deut/prot:')
for code,name,b in A: print(' ',code,round(min(dE(b,'#B91C1C',m) for m in ('normal','deut','prot')),1),round(min(dE(b,'#C2410C',m) for m in ('normal','deut','prot')),1))
