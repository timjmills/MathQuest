// LP-RASTER for ROLE pages (lf-checks queue 13; lf-algebra critic F3): what only the PRINTED PDF shows.
//
// lf-algebra's F3 - the number_patterns_rule Scripted Model at L ran its Say band 6 mm past the panel frame, and the frame
// cut the text in half - was clean on screen and in emulated print (no DOM overflow: the clip is the panel's). It shows only
// when Chrome prints the sheet to a real PDF and the PDF is rasterised. This module reads such a PDF (one role sheet, pupil
// or key, as ws-grade-render --roles prints it) and checks three things:
//
//   RR-PAGES  the PDF has as many pages as the role's PLAN (buildSheet's pageCount / keyPageCount): a sheet that spills
//             onto an extra printed page, or loses one, FAILs.
//   RR-EDGE   no ink within EDGE_MM of the paper's edge (the kit's margins are 12 / 12 / 14 mm and its copyright line ends
//             about 10 mm above the foot of the page; a printer cannot print the outer ~4-5 mm): content that ran past
//             the page's printable area.
//   RR-CLIP   every text span the PDF holds is INKED where its glyphs must be: for each tall glyph (capital, digit, b d f
//             h k l t) the raster has ink in its cap band (0.45-0.60 em above the baseline) and its foot band (0.03-0.20
//             em above it). A span whose tall glyphs miss either band in half or more of them was clipped or painted
//             over (F3: the Say band's tops cut off by the frame). White text (min channel > 230) is skipped.
//
// The raster is pdfium's (Chrome's own PDF engine, as LP-RASTER), else PyMuPDF's; the text layer is PyMuPDF's with
// small glyph heights. No browser: `roleRaster(pdf, {expectPages})` needs python3 with PyMuPDF (+ pypdfium2).
// selfTest() draws its own PDFs with PyMuPDF (a clean page, a half-covered line, ink at the edge, a page too many).
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const EDGE_MM = 5;
const RR_PY = `
import sys, json, pymupdf
src = sys.argv[1]; edge_mm = float(sys.argv[2]); DPI = 150; z = DPI / 72.0
pymupdf.TOOLS.set_small_glyph_heights(True)
try:
    import pypdfium2 as pdfium
    pdoc = pdfium.PdfDocument(src); engine = 'pdfium'
except Exception:
    pdoc = None; engine = 'pymupdf'
TALL = set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789bdfhklt')
d = pymupdf.open(src); out = {'engine': engine, 'pages': []}
for pi, p in enumerate(d):
    if pdoc is not None:
        img = pdoc[pi].render(scale=z, grayscale=True).to_pil().convert('L')
    else:
        pix = p.get_pixmap(dpi=DPI, colorspace=pymupdf.csGRAY)
        from PIL import Image
        img = Image.frombytes('L', (pix.width, pix.height), pix.samples)
    W, H = img.size; px = img.load()
    def ink(x0, x1, ya, yb):
        X0, X1 = max(0, int(x0 * z)), min(W, int(x1 * z) + 1)
        for Y in range(max(0, int(ya * z)), min(H, int(yb * z) + 1)):
            for X in range(X0, X1):
                if px[X, Y] < 200: return True
        return False
    # RR-EDGE: dark pixels in the outer band
    e = int(edge_mm / 25.4 * DPI); edge = []
    for (X0, Y0, X1, Y1, side) in ((0, 0, W, e, 'top'), (0, H - e, W, H, 'bottom'), (0, 0, e, H, 'left'), (W - e, 0, W, H, 'right')):
        hit = None
        for Y in range(Y0, Y1, 2):
            for X in range(X0, X1, 2):
                if px[X, Y] < 160: hit = (round(X / z * 25.4 / 72, 1), round(Y / z * 25.4 / 72, 1)); break
            if hit: break
        if hit: edge.append({'side': side, 'at_mm': hit})
    # RR-CLIP: each span's tall glyphs inked in their cap and foot bands
    clip = []; spans = 0
    for b in p.get_text('rawdict')['blocks']:
        for l in b.get('lines', []):
            if abs(l['dir'][1]) > 0.01: continue
            for s in l['spans']:
                c = s['color']
                if min(c >> 16, (c >> 8) & 255, c & 255) > 230: continue
                tall = [ch for ch in s['chars'] if ch['c'] in TALL]
                if not tall: continue
                size = s['size']; spans += 1; top = foot = 0
                for ch in tall:
                    oy = ch['origin'][1]; x0, x1 = ch['bbox'][0], ch['bbox'][2]
                    if not ink(x0, x1, oy - 0.60 * size, oy - 0.45 * size): top += 1
                    if not ink(x0, x1, oy - 0.20 * size, oy - 0.03 * size): foot += 1
                if top * 2 >= len(tall) or foot * 2 >= len(tall):
                    clip.append({'text': ''.join(ch['c'] for ch in s['chars'])[:48], 'pt': round(size, 1), 'tall': len(tall), 'topMiss': top, 'footMiss': foot,
                                 'y_mm': round(tall[0]['origin'][1] * 25.4 / 72, 1)})
    out['pages'].append({'page': pi + 1, 'spans': spans, 'edge': edge, 'clip': clip})
print(json.dumps(out))
`;

/** Reads one printed role PDF. expectPages: the plan's page count (null: not judged). label: names the sheet in findings.
 *  Returns {pass, pages, findings: [{rule, msg}], engine, spans}. */
function roleRaster(pdf, { expectPages = null, label = path.basename(pdf), edgeMm = EDGE_MM } = {}) {
    const res = JSON.parse(execFileSync('python3', ['-c', RR_PY, pdf, String(edgeMm)], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim().split('\n').pop());
    const findings = [];
    const n = res.pages.length;
    if (expectPages != null && n !== expectPages) findings.push({ rule: 'RR-PAGES', msg: `${label}: the printed PDF has ${n} page(s), the plan ${expectPages}` });
    for (const pg of res.pages) {
        for (const e of pg.edge) findings.push({ rule: 'RR-EDGE', msg: `${label} p${pg.page}: ink within ${edgeMm} mm of the ${e.side} edge (at ${e.at_mm[0]}, ${e.at_mm[1]} mm)` });
        for (const c of pg.clip) findings.push({ rule: 'RR-CLIP', msg: `${label} p${pg.page}: "${c.text}" (${c.pt} pt, ${c.y_mm} mm down) is clipped or covered in print: ${c.topMiss} of ${c.tall} tall glyphs lack their top, ${c.footMiss} their foot` });
    }
    const spans = res.pages.reduce((a, p) => a + p.spans, 0);
    if (!spans) findings.push({ rule: 'RR-READ', msg: `${label}: no text span read (nothing judged)` });
    return { pass: !findings.length, pages: n, findings, engine: res.engine, spans };
}

/* ------------------------------------------------------------------ self-test (no browser) */
const SELF_PY = `
import sys, pymupdf
out = sys.argv[1]
def page(doc):
    p = doc.new_page(width=595.3, height=841.9)
    p.insert_text((60, 120), 'Model: Trace the answer. Say the steps.', fontsize=15)
    p.insert_text((60, 200), 'Rule: add 10 each time', fontsize=15)
    p.draw_rect(pymupdf.Rect(50, 100, 545, 700), color=(0, 0, 0), width=1)
    return p
d = pymupdf.open(); page(d); d.save(out + '/clean.pdf')
d = pymupdf.open(); p = page(d)
p.insert_text((60, 690), 'Say: The rule is count on by 10.', fontsize=15)
p.draw_rect(pymupdf.Rect(55, 670, 540, 684), color=None, fill=(1, 1, 1))   # the frame's white covers the line's top half (F3)
d.save(out + '/clip.pdf')
d = pymupdf.open(); p = page(d); p.draw_line((100, 838), (300, 838), color=(0, 0, 0), width=2); d.save(out + '/edge.pdf')
d = pymupdf.open(); page(d); page(d); d.save(out + '/twopages.pdf')
`;
function selfTest() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-role-raster-'));
    const bad = [];
    try {
        execFileSync('python3', ['-c', SELF_PY, dir], { encoding: 'utf8' });
        const rules = (r) => [...new Set(r.findings.map((f) => f.rule))].sort().join(',') || 'OK';
        const cases = [['clean', 1, 'OK'], ['clip', 1, 'RR-CLIP'], ['edge', 1, 'RR-EDGE'], ['twopages', 1, 'RR-PAGES'], ['twopages', 2, 'OK'], ['clean', null, 'OK']];
        for (const [f, exp, want] of cases) {
            const got = rules(roleRaster(path.join(dir, f + '.pdf'), { expectPages: exp }));
            if (got !== want) bad.push(`${f}.pdf (plan ${exp}): got ${got}, want ${want}`);
        }
        return { pass: !bad.length, cases: cases.length, bad };
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

module.exports = { roleRaster, selfTest, EDGE_MM, RR_IDS: ['RR-PAGES', 'RR-EDGE', 'RR-CLIP'] };
