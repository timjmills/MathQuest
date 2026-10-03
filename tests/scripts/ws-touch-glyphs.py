"""GENERATOR for js/modules/sheet/touch-glyphs.js (the touch numerals' geometry).

Reads the app's own self-hosted Andika (css/fonts, OFL) digits 0-9, with the open 4 (cv04, TY-4), and
writes each as an SVG path in 1/1000 em, origin = the centre of the digit's advance (x) and of its
line box (y, down), so a numeral drawn from it lands exactly on the plain digit. It then snaps each
touch point (the conventional landmarks below) to the centre of the nearest stroke.

  pip install fonttools brotli
  python3 tests/scripts/ws-touch-glyphs.py css/fonts/Andika-Regular.woff2 css/fonts/Andika-Bold.woff2 js/modules/sheet/touch-glyphs.js
"""
import json, math, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.basePen import BasePen
from fontTools.pens.pointInsidePen import PointInsidePen

# Landmark guesses from the old fitted tables (em, origin = line-box centre, y down)
OLD = {
 400: {1: [(0.013, -0.235,0)], 2: [(-0.190, -0.195,0), (0.180, 0.372,0)],
  3: [(-0.175, -0.203,0), (-0.030, 0.030,0), (-0.215, 0.285,0)],
  4: [(-0.123, -0.250,0), (-0.188, 0.165,0), (0.112, -0.110,0), (0.113, 0.163,0)],
  5: [(0.130, -0.258,0), (-0.152, -0.255,0), (-0.170, 0.030,0), (0.172, 0.200,0), (-0.193, 0.335,0)],
  6: [(-0.060, -0.240, 1), (-0.190, 0.060, 1), (-0.005, 0.380, 1)],
  7: [(0.170, -0.258, 1), (0.030, 0.037, 1), (-0.100, 0.350, 1), (-0.210, -0.253,0)],
  8: [(-0.165, -0.168, 1), (0.163, -0.165, 1), (-0.198, 0.200, 1), (0.193, 0.193, 1)],
  9: [(-0.020, -0.268, 1), (0.205, -0.030, 1), (0.152, 0.275, 1), (-0.163, 0.340, 1), (-0.185, -0.030,0)]},
 700: {1: [(0.010, -0.228,0)], 2: [(-0.193, -0.170,0), (0.180, 0.352,0)],
  3: [(-0.175, -0.205,0), (-0.030, 0.040,0), (-0.212, 0.282,0)],
  4: [(-0.126, -0.250,0), (-0.193, 0.165,0), (0.125, -0.100,0), (0.125, 0.180,0)],
  5: [(0.135, -0.240,0), (-0.140, -0.240,0), (-0.170, 0.040,0), (0.163, 0.200,0), (-0.190, 0.330,0)],
  6: [(-0.052, -0.230, 1), (-0.185, 0.060, 1), (0.000, 0.365, 1)],
  7: [(0.172, -0.240, 1), (0.028, 0.037, 1), (-0.120, 0.370, 1), (-0.198, -0.237,0)],
  8: [(-0.155, -0.160, 1), (0.150, -0.163, 1), (-0.190, 0.200, 1), (0.188, 0.200, 1)],
  9: [(-0.030, -0.250, 1), (0.195, -0.030, 1), (0.140, 0.275, 1), (-0.160, 0.347, 1), (-0.195, -0.030,0)]},
}

class Flat(BasePen):
    def __init__(self, gs):
        super().__init__(gs); self.segs = []; self.cur = None; self.start = None
    def _moveTo(self, p): self.cur = self.start = p
    def _lineTo(self, p): self.segs.append((self.cur, p)); self.cur = p
    def _curveToOne(self, a, b, c):
        p0 = self.cur
        prev = p0
        for i in range(1, 17):
            t = i / 16; u = 1 - t
            q = (u**3*p0[0]+3*u*u*t*a[0]+3*u*t*t*b[0]+t**3*c[0], u**3*p0[1]+3*u*u*t*a[1]+3*u*t*t*b[1]+t**3*c[1])
            self.segs.append((prev, q)); prev = q
        self.cur = c
    def _qCurveToOne(self, a, c):
        p0 = self.cur; prev = p0
        for i in range(1, 13):
            t = i / 12; u = 1 - t
            q = (u*u*p0[0]+2*u*t*a[0]+t*t*c[0], u*u*p0[1]+2*u*t*a[1]+t*t*c[1])
            self.segs.append((prev, q)); prev = q
        self.cur = c
    def _closePath(self):
        if self.cur != self.start: self.segs.append((self.cur, self.start))
    _endPath = _closePath

def segdist(p, s):
    (ax, ay), (bx, by) = s
    dx, dy = bx-ax, by-ay; L = dx*dx+dy*dy
    t = 0 if L == 0 else max(0, min(1, ((p[0]-ax)*dx+(p[1]-ay)*dy)/L))
    return math.hypot(p[0]-ax-t*dx, p[1]-ay-t*dy)

out = {}
for path, w in ((sys.argv[1], 400), (sys.argv[2], 700)):
    f = TTFont(path); gs = f.getGlyphSet(); cm = f.getBestCmap(); U = f['head'].unitsPerEm
    S = 1000 / U
    res = {}
    for d in range(10):
        name = cm[ord(str(d))]
        if d == 4: name = 'four.Open'
        adv = f['hmtx'][name][0]
        sp = SVGPathPen(gs, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
        BASE = (f['hhea'].ascent + f['hhea'].descent) / 2 * S  # baseline below the line-box centre
        gs[name].draw(TransformPen(sp, (S, 0, 0, -S, -adv * S / 2, BASE)))
        fl = Flat(gs); gs[name].draw(fl)
        def inside(x, y):
            pp = PointInsidePen(gs, (x, y)); gs[name].draw(pp); return pp.getResult()
        dots = []; strokeR = []
        for (ox, oy, dbl) in OLD[w].get(d, []):
            gx = (ox + adv / U / 2) * U; gy = (0.415 - oy) * U
            best = None
            R = 0.07 * U; st = R / 14
            for i in range(-14, 15):
                for j in range(-14, 15):
                    x, y = gx + i*st, gy + j*st
                    if math.hypot(i*st, j*st) > R or not inside(x, y): continue
                    dd = min(segdist((x, y), s) for s in fl.segs)
                    # prefer stroke centre, lightly prefer staying near the landmark
                    score = dd - 0.6 * math.hypot(i*st, j*st)
                    if best is None or score > best[0]: best = (score, x, y, dd)
            if best is None: best = (0, gx, gy, 0); print('MISS', w, d, file=sys.stderr)
            dots.append([round(best[1]*S - adv*S/2, 1), round(-best[2]*S + BASE, 1), dbl])
            strokeR.append(round(best[3]*S, 1))
        res[d] = {'adv': round(adv*S, 2), 'd': sp.getCommands(), 'dots': dots, 'half': strokeR}
    out[w] = res
    out['base'] = round(BASE, 2)
HEAD = '''// js/modules/sheet/touch-glyphs.js  GENERATED by tests/scripts/ws-touch-glyphs.py; never hand-edit.
// The touch numerals' geometry: the app's Andika digits 0-9 (open 4, cv04), 1/1000 em, origin = the
// centre of the digit's advance (x) and of its line box (y down); `base` = the baseline below that
// centre. `dots` = the touch points snapped to the stroke centres, in counting order: [x, y, double].
// `half` = the stroke's half-width at each touch point. Pure data (SCC-01).
'''
with open(sys.argv[3], 'w') as fh:
    fh.write(HEAD)
    fh.write('export const TOUCH_GLYPH_BASE = %s;\n' % out['base'])
    for w in (400, 700):
        fh.write('export const TOUCH_GLYPHS_%d = Object.freeze({\n' % w)
        for d in range(10):
            g = out[w][d]
            fh.write('    %d: Object.freeze({ adv: %s, d: %s, dots: %s, half: %s }),\n' % (d, g['adv'], json.dumps(g['d']), json.dumps(g['dots']), json.dumps(g['half'])))
        fh.write('});\n')
for w in (400, 700):
    for d in range(10): print(w, d, out[w][d]['adv'], out[w][d]['dots'], out[w][d]['half'])
