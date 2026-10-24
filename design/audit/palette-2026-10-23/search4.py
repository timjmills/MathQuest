# Palette search on CIEDE2000 (IMPROVEMENT_PLAN.md §2.7, after critic r3 D1).
# python3 search4.py N NORMAL_MIN KEYERR_MIN  -> maximises the smallest CIEDE2000 between area colours under
# deuteranopia and protanopia (Machado 2009, severity 1), with every pair >= NORMAL_MIN for normal vision and every
# colour >= KEYERR_MIN from error red #B91C1C and key orange #C2410C in all three views; text >= 4.5 : 1.
import itertools, random, sys, os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'colour.py')).read())
TW = {
 'yellow':  ['#FDE047','#FACC15','#EAB308','#CA8A04','#A16207','#854D0E'],
 'lime':    ['#BEF264','#A3E635','#84CC16','#65A30D','#4D7C0F','#3F6212'],
 'green':   ['#86EFAC','#4ADE80','#22C55E','#16A34A','#15803D','#166534'],
 'emerald': ['#6EE7B7','#34D399','#10B981','#059669','#047857','#065F46'],
 'teal':    ['#5EEAD4','#2DD4BF','#14B8A6','#0D9488','#0F766E','#115E59'],
 'cyan':    ['#67E8F9','#22D3EE','#06B6D4','#0891B2','#0E7490','#155E75'],
 'sky':     ['#7DD3FC','#38BDF8','#0EA5E9','#0284C7','#0369A1','#075985'],
 'blue':    ['#93C5FD','#60A5FA','#3B82F6','#2563EB','#1D4ED8','#1E40AF'],
 'indigo':  ['#A5B4FC','#818CF8','#6366F1','#4F46E5','#4338CA','#3730A3'],
 'violet':  ['#C4B5FD','#A78BFA','#8B5CF6','#7C3AED','#6D28D9','#5B21B6'],
 'purple':  ['#D8B4FE','#C084FC','#A855F7','#9333EA','#7E22CE','#6B21A8'],
 'fuchsia': ['#F0ABFC','#E879F9','#D946EF','#C026D3','#A21CAF','#86198F'],
 'pink':    ['#F9A8D4','#F472B6','#EC4899','#DB2777','#BE185D','#9D174D'],
 'rose':    ['#FDA4AF','#FB7185','#F43F5E','#E11D48','#BE123C','#9F1239'],
}
N = int(sys.argv[1]); NMIN = float(sys.argv[2]); KMIN = float(sys.argv[3])
cands = []
for fam, hs in TW.items():
    for h in hs:
        if hue_gap(hue(h), 0) < 25 or hue_gap(hue(h), 17.5) < 25: continue
        if min(de00(h, KEY, m) for m in MODES) < KMIN or min(de00(h, ERR, m) for m in MODES) < KMIN: continue
        t = text_for(h)
        if t: cands.append((fam, h, t))
def score(sel):
    s = 1e9
    for a, b in itertools.combinations(sel, 2):
        if de00(a[1], b[1], 'normal') < NMIN: return -1
        for m in ('deut', 'prot'): s = min(s, de00(a[1], b[1], m))
    return s
random.seed(5); fams = sorted(set(c[0] for c in cands)); best = (-2, None)
for it in range(40000):
    sel = [random.choice([c for c in cands if c[0] == f]) for f in random.sample(fams, N)]
    sc = score(sel)
    if sc > best[0]: best = (sc, sel)
sc, sel = best
improved = sel is not None
while improved:
    improved = False
    for i in range(N):
        for c in cands:
            if c[0] in [x[0] for j, x in enumerate(sel) if j != i]: continue
            t = sel[:]; t[i] = c; st = score(t)
            if st > sc + 1e-9: sc, sel, improved = st, t, True
if not sel: print('none'); sys.exit()
nmin = min(de00(a[1], b[1], 'normal') for a, b in itertools.combinations(sel, 2))
print(N, 'colours: min CIEDE2000 simulated', round(sc, 1), '| normal', round(nmin, 1))
for f, h, t in sorted(sel, key=lambda x: hue(x[1])):
    print(f'  {f:8} {h} text={t:5} hue {hue(h):4.0f} L* {lab(h)[0]:3.0f} contrast {cr(h, WHITE if t == "white" else INK):4.1f}'
          f' vsKey {min(de00(h, KEY, m) for m in MODES):4.1f} vsErr {min(de00(h, ERR, m) for m in MODES):4.1f}')
