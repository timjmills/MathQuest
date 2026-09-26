// tests/scripts/ws-solid-unit.mjs
// Unit gate for the solid-kit cell (build lane geometry: area_perimeter:volume and
// area_perimeter:volume_composite; js/modules/gen-geo-kit.js + js/modules/sheet/cells/solid-kit.js).
// No browser.
//
// For every builder, N items x sizes S / M / L:
//   ANSWER   a solid drawn to scale holds exactly `ans` unit cubes; a missing edge times the two
//            given edges is the given volume; a composite's two prisms touch, do not overlap, and
//            their volumes add up to the answer
//   LABELS   every written edge label (a number) is the length of its edge, in real units
//   OVERLAP  no two labels touch; CROSS  no label crosses a real edge; ON  no label sits on a face
//   REVEAL   the blank pupil cell writes no answer; WIDTH  the drawing fits its cell
//
//   node tests/scripts/ws-solid-unit.mjs [--n 120]
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mod = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const kit = await mod('js/modules/gen-geo-kit.js');
const sheet = await mod('js/modules/sheet/index.js');
const sk = await mod('js/modules/sheet/cells/solid-kit.js');
const { state } = await mod('js/modules/state.js');

const argN = process.argv.indexOf('--n');
const N = argN > -1 ? Number(process.argv[argN + 1]) : 120;
const WIDTH = { S: 58, M: 86, L: 86 };
const builders = {
    volume_standard: (q) => kit.volumeFigure(q, 'standard', 6),
    volume_big: (q) => kit.volumeFigure(q, 'standard', 20),
    volume_missing: (q) => kit.volumeFigure(q, 'missing', 6),
    volume_story: (q) => kit.volumeFigure(q, 'word', 6),
    composite: (q) => kit.compositeVolume(q, 100),
};

let failures = 0, checks = 0;
const report = [];
const byName = {};
const fail = (name, msg) => { failures++; byName[name] = (byName[name] || 0) + 1; if (report.filter((r) => r.startsWith(name)).length < 4) report.push(`${name}: ${msg}`); };
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
function inPoly(q, [px, py]) {
    let c = false;
    for (let i = 0, j = q.length - 1; i < q.length; j = i++) {
        const [xi, yi] = q[i], [xj, yj] = q[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
}
const cubesIn = (boxes) => {
    const s = new Set();
    for (const b of boxes) for (let x = b.x; x < b.x + b.l; x++) for (let y = b.y; y < b.y + b.w; y++) for (let z = b.z; z < b.z + b.h; z++) s.add(`${x},${y},${z}`);
    return s;
};

for (const [name, build] of Object.entries(builders)) {
    for (let i = 0; i < N; i++) {
        state.itemIndex = i;
        const q = {};
        build(q);
        checks++;
        const p = q.cell && q.cell.payload;
        if (!p || q.cell.template !== 'solid-kit') { fail(name, 'no solid-kit payload'); continue; }
        const a = p.ask[0];
        if (String(q.ans) !== String(a.ans)) fail(name, `q.ans ${q.ans} is not the cell's ${a.ans}`);
        const cubes = cubesIn(p.boxes);
        const vol = p.boxes.reduce((s, b) => s + b.l * b.w * b.h, 0);
        if (cubes.size !== vol) fail(name, `the prisms overlap (${vol} cubes listed, ${cubes.size} distinct)`);
        if (p.toScale) {
            for (const lb of p.labels) {
                if (lb.v === '?') continue;
                const L = Math.hypot(lb.b[0] - lb.a[0], lb.b[1] - lb.a[1], lb.b[2] - lb.a[2]);
                if (Math.abs(L - Number(lb.v)) > 1e-9) fail(name, `label ${lb.v} on an edge ${L} long`);
            }
            if (a.id === 'volume' && cubes.size !== a.ans) fail(name, `answer ${a.ans}, the solid holds ${cubes.size} cubes`);
        }
        if (a.id === 'volume' && !p.toScale) {
            const prod = p.labels.reduce((s, l) => s * Number(l.v), 1);
            if (prod !== a.ans) fail(name, `answer ${a.ans}, the edges multiply to ${prod}`);
        }
        if (a.id === 'edge') {
            const V = Number(String(p.given[0]).replace(/[^0-9]+/g, ' ').trim().split(' ')[0]);
            const prod = p.labels.filter((l) => l.v !== '?').reduce((s, l) => s * Number(l.v), 1);
            if (prod * a.ans !== V) fail(name, `missing edge ${a.ans}: ${prod} x ${a.ans} is not ${V}`);
        }
        if ((p.parts || []).length === 2) {
            if (p.parts[0] + p.parts[1] !== a.ans) fail(name, `parts ${p.parts} do not add to ${a.ans}`);
            // the two prisms share a face: some cube of one is next to a cube of the other
            const [A, B] = p.boxes.map((b) => cubesIn([b]));
            const touch = [...A].some((k) => { const [x, y, z] = k.split(',').map(Number); return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(([dx, dy, dz]) => B.has(`${x + dx},${y + dy},${z + dz}`)); });
            if (!touch) fail(name, 'the two prisms do not touch');
        }
        for (const size of ['S', 'M', 'L']) {
            const r = sk.solidSVG({ ...p, sketch: false }, { size, scaffoldLevel: 1, state: 'blank' });
            const faces = [...r.html.matchAll(/<polygon points="([^"]+)"[^>]*data-ws-face="1"\/>/g)].map((m) => m[1].split(' ').map((t) => t.split(',').map(Number)));
            const edges = [...r.html.matchAll(/<line x1="([\d.-]+)" y1="([\d.-]+)" x2="([\d.-]+)" y2="([\d.-]+)"[^>]*data-ws-figure="1"/g)].map((m) => [[+m[1], +m[2]], [+m[3], +m[4]]]);
            const boxes = [...r.html.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"[^>]*><tspan font-size="([\d.]+)">([^<]*)<\/tspan>(?:<tspan font-size="([\d.]+)">([^<]*)<\/tspan>)?/g)].map((m) => {
                const x = +m[1], y = +m[2], fs = +m[3];
                const w = m[4].length * fs * 0.58 + (m[6] ? m[6].length * (+m[5]) * 0.58 : 0);
                return { v: m[4], b: [x - w / 2, y - fs * 0.72, x + w / 2, y + fs * 0.1] };
            });
            if (boxes.length !== p.labels.length) fail(name, `${size}: ${boxes.length} labels for ${p.labels.length} edges`);
            for (let u = 0; u < boxes.length; u++) for (let v = u + 1; v < boxes.length; v++) {
                const A = boxes[u].b, B = boxes[v].b;
                if (A[0] < B[2] && B[0] < A[2] && A[1] < B[3] && B[1] < A[3]) fail(name, `${size}: labels ${boxes[u].v} and ${boxes[v].v} overlap (${JSON.stringify(p.boxes)})`);
            }
            for (const bx of boxes) {
                if (edges.some(([A, B]) => segHits(A, B, bx.b))) fail(name, `${size}: label ${bx.v} crosses an edge (${JSON.stringify(p.boxes)})`);
                const c = [(bx.b[0] + bx.b[2]) / 2, (bx.b[1] + bx.b[3]) / 2];
                if (faces.some((f) => inPoly(f, c))) fail(name, `${size}: label ${bx.v} sits on the solid (${JSON.stringify(p.boxes)})`);
            }
            if (r.W > WIDTH[size]) fail(name, `${size}: the drawing is ${r.W.toFixed(1)} mm wide`);
            const html = sheet.renderCell(q, sheet.resolveCtx({ mode: 'print', size, look: 'ican', state: 'blank', scaffoldLevel: 1 }));
            if (new RegExp(`data-ws-slot="${a.id}"[^>]*>\\s*${a.ans}\\s*<`).test(html)) fail(name, `${size}: the blank cell writes the answer`);
            const key = sheet.renderCell(q, sheet.resolveCtx({ mode: 'print', size, look: 'ican', state: 'answered', scaffoldLevel: 1 }));
            if (!new RegExp(`data-ws-slot="${a.id}"[^>]*>\\s*${a.ans}\\s*<`).test(key)) fail(name, `${size}: the key does not write the answer`);
        }
    }
}
state.itemIndex = undefined;
for (const r of report) console.log("  " + r);
if (failures) console.log("  by builder:", JSON.stringify(byName));
if (failures) { console.log(`ws-solid-unit: FAIL (${failures} failure(s) in ${checks} items x 3 sizes)`); process.exit(1); }
console.log(`ws-solid-unit: OK (${Object.keys(builders).length} builders, ${checks} items x 3 sizes)`);
