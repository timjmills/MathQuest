// tests/scripts/ws-coord-unit.mjs
// Unit gate for the coord-grid cell (build lane geometry: coordinates:coordinate_q1 / coordinate_all /
// coordinate_graph, geo_reflect / geo_rotate / geo_translate; js/modules/gen-geo-kit.js +
// js/modules/sheet/cells/coord-grid.js). No browser.
//
// For every builder, N items x sizes S / M / L:
//   READ       every point lies on the grid, two points are 2 or more apart, q.ans is the points,
//              the pupil page draws every point and its letter and writes no coordinate; the key does
//   PLOT       the pupil page draws no dot; the key draws one per point
//   TRANSFORM  the right grid shows the shape moved exactly as the question says; no other grid
//              does; every shape stays on the grid; a slide is at most "Slide up to"
//   TYPE       every numeral is at the text size or larger (options-r3: axis numerals at 5-8 pt)
//   LETTERS    no two point letters overlap
//
//   node tests/scripts/ws-coord-unit.mjs [--n 120]
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mod = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const kit = await mod('js/modules/gen-geo-kit.js');
const sheet = await mod('js/modules/sheet/index.js');
const { state } = await mod('js/modules/state.js');
const { SIZES } = await mod('js/modules/sheet/tokens.js');

const argN = process.argv.indexOf('--n');
const N = argN > -1 ? Number(process.argv[argN + 1]) : 120;
const PT_MM = 25.4 / 72;
let failures = 0, checks = 0;
const report = [], byName = {};
const fail = (name, msg) => { failures++; byName[name] = (byName[name] || 0) + 1; if (report.filter((r) => r.startsWith(name)).length < 4) report.push(`${name}: ${msg}`); };
const keyOf = (pts) => [...pts].map((p) => `${p[0]},${p[1]}`).sort().join('|');
const rotate = (pts, deg) => { const r = (-deg) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return pts.map(([x, y]) => [Math.round(x * c - y * s), Math.round(x * s + y * c)]); };

const withOpts = (skill, opts, fn) => (q) => {
    state.category = 'coordinates'; state.skill = skill; state.skillOptions = opts;
    try { return fn(q); } finally { state.skillOptions = null; }
};
const builders = {
    coordinate_q1: withOpts('coordinate_q1', null, (q) => kit.coordinateItem(q, 'coordinate_q1')),
    coordinate_all: withOpts('coordinate_all', null, (q) => kit.coordinateItem(q, 'coordinate_all')),
    coordinate_all_10: withOpts('coordinate_all', { band: 10 }, (q) => kit.coordinateItem(q, 'coordinate_all')),
    coordinate_all_left: withOpts('coordinate_all', { quadrants: 'left' }, (q) => kit.coordinateItem(q, 'coordinate_all')),
    coordinate_big: withOpts('coordinate_q1', { band: 20 }, (q) => kit.coordinateItem(q, 'coordinate_q1')),
    coordinate_graph: withOpts('coordinate_graph', null, (q) => kit.coordinateItem(q, 'coordinate_graph')),
    geo_reflect: withOpts('geo_reflect', null, (q) => kit.transformItem(q, 'geo_reflect')),
    geo_rotate: withOpts('geo_rotate', null, (q) => kit.transformItem(q, 'geo_rotate')),
    geo_translate: withOpts('geo_translate', null, (q) => kit.transformItem(q, 'geo_translate')),
};
const answerSlots = {};

for (const [name, build] of Object.entries(builders)) {
    for (let i = 0; i < N; i++) {
        state.itemIndex = i;
        const q = {};
        build(q);
        checks++;
        const p = q.cell && q.cell.payload;
        if (!p || q.cell.template !== 'coord-grid') { fail(name, 'no coord-grid payload'); continue; }
        if (p.kind === 'transform') {
            const src = p.shape, right = p.choices[p.correct];
            const m = /(reflected over the ([xy])-axis)|(rotated (\d+)°)|(translated (\d+) (right|left) and (\d+) (up|down))/.exec(q.text);
            if (!m) { fail(name, `cannot read the move in "${q.text}"`); continue; }
            let want;
            if (m[2]) want = m[2] === 'y' ? src.map(([x, y]) => [-x, y]) : src.map(([x, y]) => [x, -y]);
            else if (m[4]) want = rotate(src, Number(m[4]));
            else {
                const dx = Number(m[6]) * (m[7] === 'right' ? 1 : -1), dy = Number(m[8]) * (m[9] === 'up' ? 1 : -1);
                want = src.map(([x, y]) => [x + dx, y + dy]);
                if (Math.max(Math.abs(dx), Math.abs(dy)) > 3) fail(name, `a slide of ${dx}, ${dy} beyond the default 3`);
            }
            if (keyOf(want) !== keyOf(right)) fail(name, `the right grid is not the shape moved as asked (${q.text})`);
            p.choices.forEach((c, k) => { if (k !== p.correct && keyOf(c) === keyOf(want)) fail(name, 'a wrong grid also shows the move'); });
            for (const c of [src, ...p.choices]) for (const [x, y] of c) if (x < p.x0 || x > p.x1 || y < p.y0 || y > p.y1) fail(name, `a corner (${x}, ${y}) off the grid`);
            if (q.ans !== 'ABC'[p.correct] || q.printAnswer !== 'ABC'[p.correct] || !q.selfAnswering) fail(name, 'the answer is not the right grid');
            answerSlots[name] = answerSlots[name] || [0, 0, 0];
            answerSlots[name][p.correct]++;
        } else {
            const pts = p.points;
            for (const pt of pts) if (pt.x < p.x0 || pt.x > p.x1 || pt.y < p.y0 || pt.y > p.y1) fail(name, `point ${pt.label} off the grid`);
            for (let a = 0; a < pts.length; a++) for (let b = a + 1; b < pts.length; b++) {
                if (Math.max(Math.abs(pts[a].x - pts[b].x), Math.abs(pts[a].y - pts[b].y)) < 2) fail(name, 'two points closer than 2 squares');
            }
            if (p.ask && p.ask.kind === 'value') {
                if (q.ans !== pts[0].y) fail(name, 'the value asked is not the point\'s y');
            } else if (p.kind === 'plot') {
                const want = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y).map((a) => `(${a.x}, ${a.y})`).join(', ');
                if (q.ans !== want) fail(name, `a plot's answer ${q.ans} is not the set of points ${want}`);
            } else {
                const ans = Array.isArray(q.ans) ? q.ans : [q.ans];
                if (ans.length !== pts.length || ans.some((a, k) => a.x !== pts[k].x || a.y !== pts[k].y)) fail(name, 'q.ans is not the points');
            }
            // geometry-r1: all-quadrant items live off quadrant I, off the axes and off the grid's edge
            if (/coordinate_all/.test(name)) {
                const off = pts.filter((pt) => pt.x < 0 || pt.y < 0).length;
                if (off < Math.min(2, pts.length)) fail(name, `only ${off} of ${pts.length} points off quadrant I`);
                for (const pt of pts) {
                    if (pt.x === 0 || pt.y === 0) fail(name, `point ${pt.label} on an axis`);
                    if (Math.abs(pt.x) >= p.x1 || Math.abs(pt.y) >= p.y1) fail(name, `point ${pt.label} on the grid's edge`);
                }
                if (/left/.test(name) && pts.some((pt) => pt.y < 0)) fail(name, 'quadrants I and II dealt a negative y');
            } else if (pts.some((pt) => pt.x < 0 || pt.y < 0)) fail(name, 'a first-quadrant skill dealt a negative');
            if (/_10$/.test(name) && p.x1 !== 10) fail(name, `"Coordinates from -10 to 10" drew a grid to ${p.x1}`);
            if (/big/.test(name) && p.x1 !== 20) fail(name, `"Coordinates to 20" drew a grid to ${p.x1}`);
            if (name === 'coordinate_graph') {
                if (!p.axisNames) fail(name, 'a situation graph has no axis names');
                if (new Set(pts.map((pt) => pt.x)).size !== pts.length) fail(name, 'a table repeats an x');
            }
        }
        for (const size of ['S', 'M', 'L']) {
            const pupil = sheet.renderCell(q, sheet.resolveCtx({ mode: 'print', size, look: 'ican', state: 'blank', scaffoldLevel: 1 }));
            const key = sheet.renderCell(q, sheet.resolveCtx({ mode: 'print', size, look: 'ican', state: 'answered', scaffoldLevel: 1 }));
            const minPt = SIZES[size].textPt;
            // numerals: every <text> that is a number
            for (const m of pupil.matchAll(/<text[^>]*font-size="([\d.]+)"[^>]*>(−?\d+)<\/text>/g)) {
                if (Number(m[1]) / PT_MM < minPt - 0.05) { fail(name, `${size}: numeral ${m[2]} at ${(Number(m[1]) / PT_MM).toFixed(1)} pt, under ${minPt}`); break; }
            }
            const dots = (h) => (h.match(/<circle[^>]*r="1.1"/g) || []).length;
            if (p.kind === 'read' && p.ask && p.ask.kind === 'value') {
                if (dots(pupil) !== 1) fail(name, `${size}: the value item draws ${dots(pupil)} dots`);
                if (!/data-ws-slot="value"/.test(pupil)) fail(name, `${size}: no box for the value`);
            } else if (p.kind === 'read') {
                if (dots(pupil) !== p.points.length) fail(name, `${size}: the pupil page draws ${dots(pupil)} dots for ${p.points.length} points`);
                if (/data-ws-slot="px0"[^>]*>\s*-?\d/.test(pupil)) fail(name, `${size}: the blank cell writes a coordinate`);
                if (!new RegExp(`data-ws-slot="px0"[^>]*>\\s*${String(p.points[0].x).replace('-', '[−-]')}\\s*<`).test(key)) fail(name, `${size}: the key does not write x of ${p.points[0].label}`);
                // letters: their boxes do not overlap (read from the text positions)
                const L = [...pupil.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*font-weight="700"[^>]*paint-order="stroke">([A-C])<\/text>/g)].map((m) => [Number(m[1]), Number(m[2])]);
                for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) if (Math.abs(L[a][0] - L[b][0]) < 3.5 && Math.abs(L[a][1] - L[b][1]) < 4) fail(name, `${size}: two letters overlap`);
            } else if (p.kind === 'plot') {
                if (dots(pupil)) fail(name, `${size}: the pupil page draws a dot to plot`);
                if (dots(key) !== p.points.length) fail(name, `${size}: the key draws ${dots(key)} dots for ${p.points.length}`);
            }
        }
    }
}
state.itemIndex = undefined;
// L10: the right grid's place is dealt balanced (A, B and C each near a third)
for (const [name, c] of Object.entries(answerSlots)) {
    const tot = c[0] + c[1] + c[2];
    if (Math.min(...c) < tot * 0.25) fail(name, `the right grid sits at A/B/C ${c.join('/')} times: not balanced`);
}
for (const r of report) console.log('  ' + r);
if (failures) { console.log('  by builder:', JSON.stringify(byName)); console.log(`ws-coord-unit: FAIL (${failures} failure(s) in ${checks} items x 3 sizes)`); process.exit(1); }
console.log(`ws-coord-unit: OK (${Object.keys(builders).length} builders, ${checks} items x 3 sizes)`);
