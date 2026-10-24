# Board C search (owner 2026-10-23: "I like these colors style more" — the school's Awsaj maths site).
# Starts from the colours sampled from the Awsaj screenshots and moves each only as far as needed (CIE LCh: lightness,
# chroma, hue) to pass the SAME gates as board B (IMPROVEMENT_PLAN §2.7, ws-teacher-tokens): CIEDE2000 >= 20 normal,
# >= 12 deuteranopia/protanopia for areas sharing a grade, >= 8 any pair, >= 20 from error red and key orange, >= 8 from
# slate, and a text colour >= 4.5 : 1 on the bold. Simulated annealing over candidate variants; the cost is how far
# each colour moved. Run: python3 design/mockups/teacher-2/palette/board-c-search.py [slate]   (LIMIT=seconds SEED=n)
import itertools, math, os, sys, random, time
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, '../../../audit/palette-2026-10-23/colour.py')).read())
CREAM, WINK = '#FBF7EF', '#1A1614'
SAMPLED = {'peach': '#F2C8A0', 'gold': '#F6C96A', 'coral': '#E86A5C', 'sage': '#9AB88B', 'dusty blue': '#7A9AC2', 'mauve': '#C291B8',
           'violet': '#8579B6', 'sea teal': '#74B4A8', 'red': '#C0392B', 'green': '#587C46', 'blue': '#3D6491', 'dark gold': '#A87A10',
           'plum': '#8E5480', 'teal': '#00838F', 'deep violet': '#6A1B9A'}
SLOTS = {'CC': ['coral', 'mauve', 'red'], 'OA': ['violet', 'deep violet', 'plum', 'blue'], 'NBT': ['gold', 'dark gold'],
         'NF': ['mauve', 'coral', 'plum'], 'MEAS': ['sage', 'green'], 'DATA': ['dusty blue', 'blue'],
         'G': ['teal', 'sea teal'], 'RPNS': ['peach', 'gold']}
GRADES = {'K': ['CC', 'OA', 'NBT', 'MEAS', 'DATA', 'G'], '1-2': ['OA', 'NBT', 'MEAS', 'DATA', 'G'],
          '3-5': ['OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G'], '6': ['RPNS', 'OA', 'DATA', 'G']}
CO = {frozenset(p) for g in GRADES.values() for p in itertools.combinations(g, 2)}
SLATE = sys.argv[1] if len(sys.argv) > 1 else '#57534E'
def lab2hex(L, a, b):
    fy = (L + 16) / 116; fx = fy + a / 500; fz = fy - b / 200
    e = 216 / 24389; k = 24389 / 27
    finv = lambda t: t ** 3 if t ** 3 > e else (116 * t - 16) / k
    X, Y, Z = 0.95047 * finv(fx), finv(fy), 1.08883 * finv(fz)
    r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z; g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z; bl = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z
    out = []
    for c in (r, g, bl):
        if c < -0.002 or c > 1.002: return None
        c = min(1, max(0, c)); c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055; out.append(round(c * 255))
    return '#' + ''.join(f'{v:02X}' for v in out)
def variants(h):
    L, a, b = lab(h); C = math.hypot(a, b); H = math.degrees(math.atan2(b, a))
    for dL in range(-24, 25, 4):
        for kC in (0.8, 0.9, 1, 1.1, 1.2, 1.35, 1.5):
            for dH in range(-15, 16, 5):
                x = lab2hex(L + dL, C * kC * math.cos(math.radians(H + dH)), C * kC * math.sin(math.radians(H + dH)))
                if x: yield x, abs(dL) + abs(kC - 1) * 20 + abs(dH) * 0.5
def tf(h):
    w, i = cr(h, '#FFFFFF'), cr(h, WINK); return ('white' if w >= i else 'ink') if max(w, i) >= 4.5 else None
def single_ok(h):
    if not tf(h): return False
    return all(de00(h, ERR, m) >= 20.5 and de00(h, KEY, m) >= 20.5 and de00(h, SLATE, m) >= 8.5 for m in MODES)
L3 = lambda x: {m: lab(x, m) for m in MODES}
def d00lab(p, q):
    (l1, a1, b1), (l2, a2, b2) = p, q
    C1 = math.hypot(a1, b1); C2 = math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7))); a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1 = math.degrees(math.atan2(b1, a1p)) % 360; h2 = math.degrees(math.atan2(b2, a2p)) % 360
    dL = l2 - l1; dC = C2p - C1p; dh = h2 - h1
    if C1p * C2p == 0: dh = 0
    elif dh > 180: dh -= 360
    elif dh < -180: dh += 360
    dH = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2)); Lb = (l1 + l2) / 2; Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0: hb = h1 + h2
    elif abs(h1 - h2) <= 180: hb = (h1 + h2) / 2
    elif h1 + h2 < 360: hb = (h1 + h2 + 360) / 2
    else: hb = (h1 + h2 - 360) / 2
    T = 1 - 0.17 * math.cos(math.radians(hb - 30)) + 0.24 * math.cos(math.radians(2 * hb)) + 0.32 * math.cos(math.radians(3 * hb + 6)) - 0.20 * math.cos(math.radians(4 * hb - 63))
    dth = 30 * math.exp(-((hb - 275) / 25) ** 2); RC = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    SL = 1 + 0.015 * (Lb - 50) ** 2 / math.sqrt(20 + (Lb - 50) ** 2); SC = 1 + 0.045 * Cbp; SH = 1 + 0.015 * Cbp * T
    RT = -math.sin(math.radians(2 * dth)) * RC
    return math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH))
pool = {}
for area, names in SLOTS.items():
    seen = {}
    for rank, n in enumerate(names):
        for x, c in variants(SAMPLED[n]):
            c += rank * 4
            if (x not in seen or seen[x][0] > c) and single_ok(x): seen[x] = (c, n)
    pool[area] = sorted((c, x, n, L3(x)) for x, (c, n) in seen.items())
    print(f'{area}: {len(pool[area])} candidates', flush=True)
AREAS = list(SLOTS); PAIRS = list(itertools.combinations(AREAS, 2))
def penalty(sel):
    pen = 0.0
    for a, b in PAIRS:
        P, Q = sel[a][3], sel[b][3]
        pen += max(0, 20.5 - d00lab(P['normal'], Q['normal']))
        s = min(d00lab(P['deut'], Q['deut']), d00lab(P['prot'], Q['prot']))
        pen += max(0, (12.5 if frozenset((a, b)) in CO else 8.5) - s)
    return pen, sum(sel[a][0] for a in AREAS)
random.seed(int(os.environ.get('SEED', '7'))); LIMIT = float(os.environ.get('LIMIT', '200'))
sel = {a: pool[a][0] for a in AREAS}; pen, cost = penalty(sel); score = pen * 40 + cost; best = (None, 1e18)
T, T0, it = 40.0, time.time(), 0
while time.time() - T0 < LIMIT:
    it += 1; a = random.choice(AREAS); old = sel[a]
    sel[a] = random.choice(pool[a][:400] if random.random() < 0.7 else pool[a])
    p2, c2 = penalty(sel); s2 = p2 * 40 + c2
    if s2 <= score or random.random() < math.exp((score - s2) / T):
        score = s2
        if p2 == 0 and c2 < best[1]: best = ({k: (v[1], v[2]) for k, v in sel.items()}, c2)
    else: sel[a] = old
    T = max(0.2, T * 0.9995)
print(f'annealed {it} steps in {time.time() - T0:.0f}s')
if not best[0]: print('no board found; last penalty', round(pen, 1)); sys.exit(1)
B = best[0]
print('board C (moved %.1f in total), slate %s' % (best[1], SLATE))
for a in ['CC', 'OA', 'NBT', 'NF', 'MEAS', 'DATA', 'G', 'RPNS']:
    x, n = B[a]; s = SAMPLED[n]
    print(f'  {a:5} {x}  from {n} {s}  moved dE00 {de00(x, s):.1f}  text {tf(x)}  deep-on-cream ok')
