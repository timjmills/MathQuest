# Colour maths: WCAG contrast, hue, CIELAB, Machado 2009 CVD simulation, candidate colours.
import itertools, colorsys, random, math
TW={'red':['#DC2626','#B91C1C','#991B1B'],'orange':['#EA580C','#C2410C','#9A3412'],'amber':['#D97706','#B45309','#92400E'],
'yellow':['#CA8A04','#A16207','#854D0E'],'gold':['#8A6A00','#7A5C00','#6B5100'],'lime':['#65A30D','#4D7C0F','#3F6212'],'green':['#16A34A','#15803D','#166534'],
'emerald':['#059669','#047857','#065F46'],'teal':['#0D9488','#0F766E','#115E59'],'cyan':['#0891B2','#0E7490','#155E75'],
'sky':['#0284C7','#0369A1','#075985'],'blue':['#2563EB','#1D4ED8','#1E40AF'],'indigo':['#4F46E5','#4338CA','#3730A3'],
'violet':['#7C3AED','#6D28D9','#5B21B6'],'purple':['#9333EA','#7E22CE','#6B21A8'],'fuchsia':['#C026D3','#A21CAF','#86198F'],
'pink':['#DB2777','#BE185D','#9D174D'],'rose':['#E11D48','#BE123C','#9F1239'],'brown':['#8B4513','#7C2D12','#6B3A1E']}
def rgb(h): return [int(h[i:i+2],16)/255 for i in (1,3,5)]
def lin(c): return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def lum(h): r,g,b=[lin(c) for c in rgb(h)]; return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b): la,lb=lum(a),lum(b); return (max(la,lb)+0.05)/(min(la,lb)+0.05)
def hue(h): r,g,b=rgb(h); return colorsys.rgb_to_hls(r,g,b)[0]*360
M={'normal':None,'deut':[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
'prot':[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
'trit':[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]}
def lab(h,mode):
    l=[lin(c) for c in rgb(h)]
    if M[mode]: l=[max(0,min(1,sum(M[mode][i][j]*l[j] for j in range(3)))) for i in range(3)]
    X=0.4124*l[0]+0.3576*l[1]+0.1805*l[2]; Y=0.2126*l[0]+0.7152*l[1]+0.0722*l[2]; Z=0.0193*l[0]+0.1192*l[1]+0.9505*l[2]
    def f(t): return t**(1/3) if t>0.008856 else 7.787*t+16/116
    fx,fy,fz=f(X/0.95047),f(Y),f(Z/1.08883); return (116*fy-16,500*(fx-fy),200*(fy-fz))
def dE(a,b,mode): A,B=lab(a,mode),lab(b,mode); return math.dist(A,B)
def hd(a,b): d=abs(a-b)%360; return min(d,360-d)
cands=[]
for fam,hs in TW.items():
    if fam in('red','orange','amber'): continue
    for h in hs:
        if cr(h,'#FFFFFF')>=4.5 and hd(hue(h),0)>=30 and hd(hue(h),17.5)>=30: cands.append((fam,h))
print(len(cands),'candidates')
def score(sel):
    m=1e9
    for (fa,a),(fb,b) in itertools.combinations(sel,2):
        for mode in ('normal','deut','prot'):
            d=dE(a,b,mode)
            if mode=='normal': d=d*0.8  # normal vision already far
            m=min(m,d)
    return m
random.seed(1)
best=None
fams=sorted(set(f for f,_ in cands))
for it in range(40000):
    fs=random.sample(fams,8); sel=[random.choice([c for c in cands if c[0]==f]) for f in fs]
    s=score(sel)
    if not best or s>best[0]: best=(s,sel)
# local improve
s,sel=best
improved=True
while improved:
    improved=False
    for i in range(8):
        for c in cands:
            if c[0] in [x[0] for j,x in enumerate(sel) if j!=i]: continue
            t=sel[:]; t[i]=c; st=score(t)
            if st>s+1e-9: s,sel,improved=st,t,True
print('min dE (normal*0.8/deut/prot):',round(s,1))
for f,h in sorted(sel,key=lambda x:hue(x[1])):
    print(f,h,'hue',round(hue(h)),'white',round(cr(h,'#FFFFFF'),1),'L*',round(lab(h,'normal')[0]))
print('pairwise worst:')
for (fa,a),(fb,b) in sorted(itertools.combinations(sel,2),key=lambda p:min(dE(p[0][1],p[1][1],m) for m in('deut','prot')))[:5]:
    print(fa,fb,{m:round(dE(a,b,m),1) for m in('normal','deut','prot','trit')})
