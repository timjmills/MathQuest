# ws-inkclear — the side clearance of every fact cell's INK, measured on a 300 dpi raster of a printed page (facts-print-fix
# r8, after the r8 critic's inkclear.py: the DOM said a bracket kept 2.2 mm while the printed vinculum and answer line ended
# 1.78-1.86 mm from the border).
#
#   python3 -I tests/lib/ws-inkclear.py <page.png> [skip_mm]
#   out: one JSON line {"min": mm, "rows": [[[left, right], ...], ...]}; exit 3 when numpy / PIL are missing (the gate skips)
# The grid's drawn rules are found as long dark runs; each cell's ink is measured from the inner edge of its rules, below the
# number tab's band (skip_mm, default 7.5).
import json
import sys

try:
    import numpy as np
    from PIL import Image
except Exception as e:  # pragma: no cover - the gate reports the skip
    print(json.dumps({"skip": "numpy / PIL not installed: %s" % e}))
    sys.exit(3)

DPI = 300
MM = DPI / 25.4


def groups(v):
    g = []
    for x in v:
        if g and x - g[-1][-1] <= 2:
            g[-1].append(x)
        else:
            g.append([x])
    return [(gg[0], gg[-1]) for gg in g]


def main():
    png = sys.argv[1]
    skip = float(sys.argv[2]) if len(sys.argv) > 2 else 7.5
    a = np.array(Image.open(png).convert('L')) < 128
    H, W = a.shape
    hg = groups([y for y in range(H) if a[y].sum() / W > 0.5])
    rows = []
    for (t0, t1), (b0, b1) in zip(hg, hg[1:]):
        if b0 - t1 < 8 * MM:
            continue
        band = a[t1 + 1:b0]
        vg = groups([x for x in range(W) if band[:, x].sum() / band.shape[0] > 0.9])
        if len(vg) < 3:
            continue
        row = []
        for (l0, l1), (r0, r1) in zip(vg, vg[1:]):
            if r0 - l1 < 5 * MM:
                continue
            cell = a[t1 + 1:b0, l1 + 1:r0]
            ch, cw = cell.shape
            inner = cell[int(skip * MM):ch - int(0.3 * MM), :]
            cols = np.where(inner.any(0))[0]
            if not len(cols):
                continue
            row.append([round(cols[0] / MM, 2), round((cw - 1 - cols[-1]) / MM, 2)])
        if row:
            rows.append(row)
    allv = [min(x) for r in rows for x in r]
    print(json.dumps({"min": min(allv) if allv else None, "rows": rows}))


main()
