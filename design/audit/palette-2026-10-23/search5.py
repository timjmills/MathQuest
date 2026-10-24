# Area-aware palette search on CIEDE2000 (IMPROVEMENT_PLAN.md §2.7, after critic r3 D1).
# Areas that share a grade (so sit side by side in a grade-filtered list) must stay apart under deuteranopia and
# protanopia; every pair must stay apart with normal vision. Candidates: Tailwind 400-800 (bold, not pastel).
# python3 search5.py SIM_ALL_MIN NORMAL_MIN KEYERR_MIN
import itertools, random, sys, os
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'colour.py')).read())
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'search4.py')).read().split('N = int')[0].split('exec(open')[0])
exec('TW = ' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'search4.py')).read().split('TW = ')[1].split('\n}\n')[0] + '\n}')
AREAS = ['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS']
GRADES = {'K': ['CC', 'OA', 'NBT', 'MEAS', 'DATA', 'G'], '1-2': ['OA', 'NBT', 'MEAS', 'DATA', 'G'],
          '3-5': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '6': ['RPNS', 'OA', 'DATA', 'G']}
CO = {frozenset(p) for g in GRADES.values() for p in itertools.combinations(g, 2)}
SIMALL = float(sys.argv[1]); NMIN = float(sys.argv[2]); KMIN = float(sys.argv[3])
cands = []
for fam, hs in TW.items():
    for h in (hs if os.environ.get("PASTEL") else hs[1:]):
        if hue_gap(hue(h), 0) < 25 or hue_gap(hue(h), 17.5) < 25: continue
        if min(de00(h, KEY, m) for m in MODES) < KMIN or min(de00(h, ERR, m) for m in MODES) < KMIN: continue
        t = text_for(h)
        if t: cands.append((fam, h, t))
cache = {}
def d(a, b, m):
    k = (a, b, m)
    if k not in cache: cache[k] = de00(a, b, m)
    return cache[k]
COOL = {'teal', 'cyan', 'sky', 'emerald'}
MAXCOOL = int(os.environ.get('MAXCOOL', '8'))
def score(sel):
    s = 1e9
    if sum(1 for x in sel if x[0] in COOL) > MAXCOOL: return -1
    for (i, a), (j, b) in itertools.combinations(enumerate(sel), 2):
        if d(a[1], b[1], 'normal') < NMIN: return -1
        sim = min(d(a[1], b[1], 'deut'), d(a[1], b[1], 'prot'))
        if sim < SIMALL: return -1
        if frozenset((AREAS[i], AREAS[j])) in CO: s = min(s, sim)
    return s
random.seed(3); fams = sorted(set(c[0] for c in cands)); best = (-2, None)
for it in range(30000):
    sel = [random.choice([c for c in cands if c[0] == f]) for f in random.sample(fams, 8)]
    sc = score(sel)
    if sc > best[0]: best = (sc, sel)
sc, sel = best; improved = sel is not None
while improved:
    improved = False
    for i in range(8):
        for c in cands + [None]:
            t = sel[:]
            if c is None: continue
            if c[0] in [x[0] for j, x in enumerate(sel) if j != i]: continue
            t[i] = c; st = score(t)
            if st > sc + 1e-9: sc, sel, improved = st, t, True
    for i, j in itertools.combinations(range(8), 2):
        t = sel[:]; t[i], t[j] = t[j], t[i]; st = score(t)
        if st > sc + 1e-9: sc, sel, improved = st, t, True
if not sel: print('none'); sys.exit()
allsim = min(min(d(a[1], b[1], 'deut'), d(a[1], b[1], 'prot')) for a, b in itertools.combinations(sel, 2))
nmin = min(d(a[1], b[1], 'normal') for a, b in itertools.combinations(sel, 2))
print('min simulated (same grade)', round(sc, 1), '| simulated, any pair', round(allsim, 1), '| normal, any pair', round(nmin, 1))
for a, (f, h, t) in zip(AREAS, sel):
    print(f'  {a:5} {f:8} {h} text={t:5} hue {hue(h):4.0f} L* {lab(h)[0]:3.0f} contrast {cr(h, WHITE if t == "white" else INK):4.1f}'
          f' vsKey {min(de00(h, KEY, m) for m in MODES):4.1f} vsErr {min(de00(h, ERR, m) for m in MODES):4.1f}')
