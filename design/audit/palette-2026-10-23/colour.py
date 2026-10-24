# Shared colour maths for the palette scripts: WCAG contrast, CIELAB, CIEDE2000, Machado 2009 CVD simulation.
import math
INK = '#111827'; WHITE = '#FFFFFF'; DARK = '#111318'; KEY = '#C2410C'; ERR = '#B91C1C'
MODES = ('normal', 'deut', 'prot')
_M = {'deut': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
      'prot': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]]}
def rgb(h): return [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
def lin(c): return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
def lum(h): r, g, b = [lin(c) for c in rgb(h)]; return 0.2126 * r + 0.7152 * g + 0.0722 * b
def cr(a, b): la, lb = lum(a), lum(b); return (max(la, lb) + .05) / (min(la, lb) + .05)
def text_for(h):
    w, i = cr(h, WHITE), cr(h, INK)
    return 'white' if w >= 4.5 and w >= i else ('ink' if i >= 4.5 else ('white' if w >= 4.5 else None))
def lab(h, mode='normal'):
    l = [lin(c) for c in rgb(h)]
    if mode != 'normal':
        M = _M[mode]; l = [min(1, max(0, sum(M[i][j] * l[j] for j in range(3)))) for i in range(3)]
    X = 0.4124564 * l[0] + 0.3575761 * l[1] + 0.1804375 * l[2]
    Y = 0.2126729 * l[0] + 0.7151522 * l[1] + 0.0721750 * l[2]
    Z = 0.0193339 * l[0] + 0.1191920 * l[1] + 0.9503041 * l[2]
    e = 216 / 24389; k = 24389 / 27
    f = lambda t: t ** (1 / 3) if t > e else (k * t + 16) / 116
    fx, fy, fz = f(X / 0.95047), f(Y), f(Z / 1.08883)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))
def hue(h):
    import colorsys
    r, g, b = rgb(h); return colorsys.rgb_to_hsv(r, g, b)[0] * 360
def hue_gap(a, b): d = abs(a - b) % 360; return min(d, 360 - d)
def de76(a, b, mode='normal'): return math.dist(lab(a, mode), lab(b, mode))
def de00(a, b, mode='normal'):
    (l1, a1, b1), (l2, a2, b2) = lab(a, mode), lab(b, mode)
    C1 = math.hypot(a1, b1); C2 = math.hypot(a2, b2); Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1 = math.degrees(math.atan2(b1, a1p)) % 360; h2 = math.degrees(math.atan2(b2, a2p)) % 360
    dL = l2 - l1; dC = C2p - C1p; dh = h2 - h1
    if C1p * C2p == 0: dh = 0
    elif dh > 180: dh -= 360
    elif dh < -180: dh += 360
    dH = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dh / 2))
    Lb = (l1 + l2) / 2; Cbp = (C1p + C2p) / 2
    if C1p * C2p == 0: hb = h1 + h2
    elif abs(h1 - h2) <= 180: hb = (h1 + h2) / 2
    elif h1 + h2 < 360: hb = (h1 + h2 + 360) / 2
    else: hb = (h1 + h2 - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hb - 30)) + 0.24 * math.cos(math.radians(2 * hb))
         + 0.32 * math.cos(math.radians(3 * hb + 6)) - 0.20 * math.cos(math.radians(4 * hb - 63)))
    dth = 30 * math.exp(-((hb - 275) / 25) ** 2); RC = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    SL = 1 + 0.015 * (Lb - 50) ** 2 / math.sqrt(20 + (Lb - 50) ** 2); SC = 1 + 0.045 * Cbp; SH = 1 + 0.015 * Cbp * T
    RT = -math.sin(math.radians(2 * dth)) * RC
    return math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH))
def mix(a, b, t):
    ra, rb = rgb(a), rgb(b)
    return '#' + ''.join(f'{max(0, min(255, round(255 * (ra[i] * t + rb[i] * (1 - t))))):02X}' for i in range(3))
