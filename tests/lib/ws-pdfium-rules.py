# ws-pdfium-rules — count the drawn rules of each fact-rows grid in a PDF, rasterised by pdfium (Chrome's own PDF engine)
# (facts-print-fix r4, critic 2026-11-05: the DOM said every rule was there while the PDF, rasterised at 72-93 dpi, lost 3 of
# 10 verticals and 5 of 8 horizontals - gap-drawn rules conflate; only a rasterised count catches that).
#
#   python3 -I tests/lib/ws-pdfium-rules.py <job.json>
#   job: {"pdf": path, "dpis": [72, 93], "pages": [{"page": i (0-based), "grids": [{"box": [x0, y0, x1, y1] (mm from the
#         page's top-left), "cols": c, "rows": r}]}]}
#   out: one JSON line {"page", "dpi", "grid", "v", "h", "wantV", "wantH"} per grid and dpi; exit 3 when pypdfium2 or numpy is
#        missing (the gate then SKIPS the step and says so).
import json
import sys

try:
    import numpy as np
    import pypdfium2 as pdfium
except Exception as e:  # pragma: no cover - the gate reports the skip
    print(json.dumps({"skip": "pypdfium2 / numpy not installed: %s" % e}))
    sys.exit(3)


def groups(idx):
    """Runs of adjacent indices (a rule 2 px wide is one rule)."""
    out = []
    for x in idx:
        if out and x - out[-1][-1] <= 1:
            out[-1].append(x)
        else:
            out.append([x])
    return out


def longest(line):
    """The longest unbroken run of dark pixels (a gap of one pixel is the rasteriser's, not a break)."""
    best = run = gap = 0
    for d in line:
        if d:
            run += 1 + gap
            gap = 0
        elif run and gap == 0:
            gap = 1
        else:
            best = max(best, run)
            run = gap = 0
    return max(best, run)


def main():
    job = json.load(open(sys.argv[1]))
    pdf = pdfium.PdfDocument(job["pdf"])
    for dpi in job.get("dpis", [72, 93]):
        px = dpi / 25.4
        for pg in job["pages"]:
            img = pdf[pg["page"]].render(scale=dpi / 72, grayscale=True).to_pil().convert("L")
            a = np.array(img).astype(int)
            for gi, g in enumerate(pg["grids"]):
                x0, y0, x1, y1 = [int(round(v * px)) for v in g["box"]]
                # a margin of 2 px round the box, so the frame's own rules are inside the crop
                x0, y0 = max(0, x0 - 2), max(0, y0 - 2)
                x1, y1 = min(a.shape[1], x1 + 3), min(a.shape[0], y1 + 3)
                # (dark: under 200 of 255, as the critic counted - the frame and the first column's rule anti-alias into one line)
                c = a[y0:y1, x0:x1] < 200
                if c.size == 0:
                    continue
                H, W = c.shape
                # a vertical rule: a pixel column with ONE unbroken dark run over 92 % of the grid's height; a horizontal one: a
                # pixel row unbroken over 92 % of its width (a row of sum rules is dark over 70 % of the width, but broken)
                v = len(groups([i for i in range(W) if longest(c[:, i]) >= 0.92 * (H - 5)]))
                h = len(groups([i for i in range(H) if longest(c[i, :]) >= 0.92 * (W - 5)]))
                print(json.dumps({"page": pg["page"], "dpi": dpi, "grid": gi, "v": v, "h": h, "wantV": g["cols"] + 1, "wantH": g["rows"] + 1}))


main()
