// tests/scripts/ws-figure-unit.mjs
// Unit gate for the shape-grid kind `figure` (build lane geometry: the area and perimeter family,
// js/modules/gen-geo-kit.js + js/modules/sheet/cells/shape-figure.js). No browser.
//
// For every figure builder, N items x sizes S / M / L:
//   ANSWER   the answer is recomputed from the outline alone (shoelace area, summed sides, half
//            base x height), never read from the generator's own numbers
//   LABELS   every written side label equals the length of its side
//   OVERLAP  no two labels touch (the inner corners of an L, T or U used to stack them)
//   CROSS    no label crosses a side of the figure or the dotted height
//   REVEAL   the pupil page (state blank, Support level 1) prints no answer
//   WIDTH    the drawing fits its cell (a third of the page at S, a half at M and L)
//   PLACE    geometry-r1, the one label rule: no label is forced; each label is nearer its own edge
//            (or the height's dotted line) than any other line; two labels keep LABEL_GAP apart
//
//   node tests/scripts/ws-figure-unit.mjs            # 120 items per builder
//   node tests/scripts/ws-figure-unit.mjs --n 400
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mod = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const kit = await mod('js/modules/gen-geo-kit.js');
const fig = await mod('js/modules/sheet/cells/shape-figure.js');
const { state } = await mod('js/modules/state.js');

const argN = process.argv.indexOf('--n');
const N = argN > -1 ? Number(process.argv[argN + 1]) : 120;
const WIDTH = { S: 58, M: 86, L: 86 };

const builders = {
    area_unit_squares: (q) => kit.areaUnitSquares(q),
    perimeter_grid: (q) => kit.perimeterGrid(q),
    perimeter_standard: (q) => kit.perimeterFigure(q, 'standard', 12),
    perimeter_missing: (q) => kit.perimeterFigure(q, 'missing', 12),
    perimeter_story: (q) => kit.storyFigure(q, 'perimeter', 12),
    area_standard: (q) => kit.areaFigure(q, 'standard', 12),
    area_missing: (q) => kit.areaFigure(q, 'missing', 12),
    area_story: (q) => kit.storyFigure(q, 'area', 12),
    area_perimeter: (q) => kit.areaPerimeterFigure(q, 12),
    composite_perimeter: (q) => kit.compositeFigure(q, 'perim_only', 14),
    composite_dual: (q) => kit.compositeFigure(q, 'dual_pa', 14),
    decompose: (q) => kit.decomposeFigure(q, 12),
    triangle: (q) => kit.triangleFigure(q, 12),
    perimeter_intro: (q) => kit.perimeterIntroFigure(q),
};

const len = (A, B) => Math.hypot(B[0] - A[0], B[1] - A[1]);
function shoelace(poly) {
    let a = 0;
    poly.forEach(([x, y], i) => { const [X, Y] = poly[(i + 1) % poly.length]; a += x * Y - X * y; });
    return Math.abs(a) / 2;
}
function segHits(A, B, [x1, y1, x2, y2]) {
    const inside = (x, y) => x > x1 && x < x2 && y > y1 && y < y2;
    if (inside(...A) || inside(...B)) return true;
    const cr = (p, q, r, t) => {
        const d = (q[0] - p[0]) * (t[1] - r[1]) - (q[1] - p[1]) * (t[0] - r[0]);
        if (Math.abs(d) < 1e-9) return false;
        const u = ((r[0] - p[0]) * (t[1] - r[1]) - (r[1] - p[1]) * (t[0] - r[0])) / d;
        const v = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
        return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    };
    return cr(A, B, [x1, y1], [x2, y1]) || cr(A, B, [x2, y1], [x2, y2]) || cr(A, B, [x2, y2], [x1, y2]) || cr(A, B, [x1, y2], [x1, y1]);
}

let failures = 0, checks = 0;
const report = [];
const fail = (name, msg) => { failures++; if (process.env.FIGALL || report.filter((r) => r.startsWith(name)).length < 4) report.push(`${name}: ${msg}`); };

for (const [name, build] of Object.entries(builders)) {
    for (let i = 0; i < N; i++) {
        state.itemIndex = i;
        const q = {};
        build(q);
        const p = q.cell && q.cell.payload;
        checks++;
        if (!p || p.kind !== 'figure') { fail(name, 'no figure payload'); continue; }
        const poly = p.poly;
        // ANSWER: from the outline alone
        const per = poly.reduce((s, A, j) => s + len(A, poly[(j + 1) % poly.length]), 0);
        const area = p.height ? len(poly[1], poly[2]) * Math.abs(p.height.to[1] - p.height.from[1]) / 2 : shoelace(poly);
        for (const a of p.ask) {
            if (a.id === 'area' && Math.abs(a.ans - area) > 1e-9) fail(name, `area ${a.ans} but the outline gives ${area}`);
            if ((a.id === 'perimeter' || a.id === 'answer') && Math.abs(a.ans - per) > 1e-9) fail(name, `perimeter ${a.ans} but the outline gives ${per}`);
            if (a.id === 'side') {
                const e = p.edges.find((x) => x.v === '?');
                if (!e || Math.abs(len(poly[e.i], poly[(e.i + 1) % poly.length]) - a.ans) > 1e-9) fail(name, `missing side ${a.ans} is not the side marked ?`);
                const g = Number(String(p.given[0]).replace(/^[^=]*=\s*/, '').replace(/[^0-9.].*$/, ''));
                const want = /Perimeter/.test(p.given[0]) ? per : shoelace(poly);
                if (g !== want) fail(name, `given "${p.given[0]}" but the outline gives ${want}`);
            }
        }
        const want = p.ask.length === 1 ? p.ask[0].ans : p.ask.map((a) => a.ans).join(', ');
        if (String(q.ans) !== String(want)) fail(name, `q.ans ${q.ans} is not the cell's answer ${want}`);
        // LABELS: each written label is its side's length
        for (const e of p.edges || []) {
            if (e.v === '?' || e.show === false) continue;
            const L = len(poly[e.i], poly[(e.i + 1) % poly.length]);
            if (Math.abs(Number(e.v) - L) > 1e-9) fail(name, `edge ${e.i} labelled ${e.v}, its length is ${L}`);
        }
        for (const size of ['S', 'M', 'L']) {
            const r = fig.figureSVG(p, { size, scaffoldLevel: 1, state: 'blank' });
            const pm = r.html.match(/<polygon points="([^"]+)" fill="none"/);
            const pts = pm[1].split(' ').map((s) => s.split(',').map(Number));
            const segs = pts.map((A, j) => [A, pts[(j + 1) % pts.length]]);
            const hm = r.html.match(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"[^>]*data-ws-guide="height"/);
            if (hm) segs.push([[+hm[1], +hm[2]], [+hm[3], +hm[4]]]);
            const boxes = [...r.html.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*><tspan font-size="([\d.]+)">([^<]*)<\/tspan>(?:<tspan font-size="([\d.]+)">([^<]*)<\/tspan>)?/g)].map((m) => {
                const x = +m[1], y = +m[2], fs = +m[3];
                const w = m[4].length * fs * 0.58 + (m[6] ? m[6].length * (+m[5]) * 0.58 : 0);
                return { v: m[4], b: [x - w / 2, y - fs * 0.72, x + w / 2, y + fs * 0.1] };
            });
            for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
                const A = boxes[a].b, B = boxes[b].b;
                if (A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3]) fail(name, `${size}: labels ${boxes[a].v} and ${boxes[b].v} overlap (${JSON.stringify(poly)})`);
            }
            for (const bx of boxes) if (segs.some(([A, B]) => segHits(A, B, bx.b))) fail(name, `${size}: label ${bx.v} crosses a side (${JSON.stringify(poly)})`);
            if (r.W > WIDTH[size]) fail(name, `${size}: the drawing is ${r.W.toFixed(1)} mm wide (cell ${WIDTH[size]})`);
            // PLACE: the one label rule
            const dSeg = ([x, y], [A, B]) => {
                const vx = B[0] - A[0], vy = B[1] - A[1], L2 = vx * vx + vy * vy || 1;
                const t = Math.max(0, Math.min(1, ((x - A[0]) * vx + (y - A[1]) * vy) / L2));
                return Math.hypot(x - (A[0] + t * vx), y - (A[1] + t * vy));
            };
            for (const lb of r.labels || []) {
                if (lb.forced) fail(name, `${size}: label ${lb.v} has no clear place by its edge (${JSON.stringify(poly)})`);
                const own = lb.edge === 'h' ? segs[segs.length - 1] : segs[lb.edge];
                if (!own) continue;
                // the gap from the label's box to a line: the nearest of points round the box
                const ring = [];
                for (let u = 0; u <= 4; u++) {
                    const fx = lb.x - lb.w / 2 + (lb.w * u) / 4, fy = lb.y - lb.h / 2 + (lb.h * u) / 4;
                    ring.push([fx, lb.y - lb.h / 2], [fx, lb.y + lb.h / 2], [lb.x - lb.w / 2, fy], [lb.x + lb.w / 2, fy]);
                }
                const gapTo = (sg) => Math.min(...ring.map((pt) => dSeg(pt, sg)));
                const dOwn = gapTo(own);
                const other = segs.filter((sg) => sg !== own).map(gapTo);
                if (other.some((d) => d < dOwn - 0.05)) fail(name, `${size}: label ${lb.v} is nearer another side than its own (${JSON.stringify(poly)})`);
            }
            const lbs = r.labels || [];
            for (let a = 0; a < lbs.length; a++) for (let b = a + 1; b < lbs.length; b++) {
                const A = lbs[a], B = lbs[b];
                const bA = [A.x - A.w / 2, A.y - A.h / 2, A.x + A.w / 2, A.y + A.h / 2], bB = [B.x - B.w / 2, B.y - B.h / 2, B.x + B.w / 2, B.y + B.h / 2];
                if (!fig.labelsClear(bA, bB, r.gap - 0.01)) fail(name, `${size}: labels ${A.v} and ${B.v} are too close to read apart (${JSON.stringify(poly)})`);
            }
            // REVEAL: the blank pupil cell writes no answer
            const root = (ctx, cls, inner) => inner;
            const html = fig.renderFigure(p, { size, scaffoldLevel: 1, state: 'blank', metrics: null }, root);
            for (const a of p.ask) {
                const boxRe = new RegExp(`data-ws-slot="${a.id}"[^>]*>\\s*${String(a.ans).replace('.', '\\.')}\\s*<`);
                if (boxRe.test(html)) fail(name, `${size}: the blank cell writes the answer ${a.ans}`);
            }
        }
    }
}
state.itemIndex = undefined;
for (const r of report) console.log('  ' + r);
if (failures) { console.log(`ws-figure-unit: FAIL (${failures} failure(s) in ${checks} items x 3 sizes)`); process.exit(1); }
console.log(`ws-figure-unit: OK (${Object.keys(builders).length} builders, ${checks} items x 3 sizes)`);
