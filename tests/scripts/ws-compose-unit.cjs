// Unit test for shape COMPOSITION items (owner bug, 2026-09-25: "Combine Shapes" drew the answer in
// a "Result" panel, and its two pieces did not make that result).
//
//   node tests/scripts/ws-compose-unit.cjs            the full sample (every option value)
//   node tests/scripts/ws-compose-unit.cjs --n 20     20 items per option set (default 60)
//
// In the booted app, for every option set of shapes_early:compose_shapes, it deals N items through
// generateQuestionFor (seeded, page positions 0-5) and renders each one's kit cell on the pupil page
// (print, state blank) and as the screen twin (q.visual). Then, in node, with geometry written here
// and NOT shared with the generator:
//
//   UNION   the pieces tile the target exactly: their areas sum to the target's, and at ~2,500
//           sample points every point inside the target lies in exactly one piece and every point
//           outside lies in none (no gap, no overlap, nothing sticking out).
//   NAME    the answer is the target's most specific name (vertices merged where collinear; a
//           square before a rectangle or a rhombus), and no WRONG name on the bank is also true of
//           the shape (a square is never offered "rectangle" as a wrong name).
//   UNDRAWN on the "name the shape" task the pupil page and the screen twin draw the pieces only:
//           no element marked as the target, one drawn shape per piece, and no drawn shape as big
//           as the whole; the blank page rings no name.
//   PIECES  on the "which pieces" task: the target is drawn once, outline only; the right set is
//           the composition's pieces (so it tiles the target); every wrong set has a different
//           total area (so it cannot make it); and each set's pieces are drawn apart, not joined.
//
// Prints `ws-compose-unit: OK` or `ws-compose-unit: FAIL (n)` and exits non-zero on failure.
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const N = Number(arg('n', 60));

const SETS = [
    {}, { tiles: 3 }, { compose: 'pieces' }, { compose: 'pieces', tiles: 3 },
    { response: 'write' }, { response: 'write', count: 3, tiles: 3 }, { count: 3 }, { level: [3, 2, 1] },
    ...[0, 1, 2, 3, 4].flatMap((g) => [{ shapes: [g] }, { shapes: [g], tiles: 3 }, { shapes: [g], compose: 'pieces' }]),
];

/* ============================================================ geometry (independent of the app) */

const EPS = 1e-6;
function polyArea(pts) {
    let a = 0;
    pts.forEach(([x, y], i) => { const [X, Y] = pts[(i + 1) % pts.length]; a += x * Y - X * y; });
    return Math.abs(a) / 2;
}
const area = (s) => (s.pts ? polyArea(s.pts) : Math.PI * s.arc.r ** 2 * (s.arc.a1 - s.arc.a0) / 360);
function inPoly(pts, [x, y]) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
}
function inSector(a, [x, y]) {
    const dx = x - a.cx, dy = y - a.cy;
    if (dx * dx + dy * dy > a.r * a.r) return false;
    if (a.a1 - a.a0 >= 360) return true;
    let t = Math.atan2(dy, dx) * 180 / Math.PI;
    t = ((t - a.a0) % 360 + 360) % 360;
    return t <= a.a1 - a.a0;
}
const inside = (s, p) => (s.pts ? inPoly(s.pts, p) : inSector(s.arc, p));
/** Distance from p to a shape's boundary (a sector: its arc and its two radii). */
function segDist([px, py], [ax, ay], [bx, by]) {
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2)) : 0;
    return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
function edgeDist(s, p) {
    if (s.pts) return Math.min(...s.pts.map((a, i) => segDist(p, a, s.pts[(i + 1) % s.pts.length])));
    const a = s.arc;
    let d = Math.abs(Math.hypot(p[0] - a.cx, p[1] - a.cy) - a.r);
    if (a.a1 - a.a0 < 360) {
        for (const deg of [a.a0, a.a1]) {
            const e = [a.cx + a.r * Math.cos(deg * Math.PI / 180), a.cy + a.r * Math.sin(deg * Math.PI / 180)];
            d = Math.min(d, segDist(p, [a.cx, a.cy], e));
        }
    }
    return d;
}
function bboxOf(shapes) {
    const pts = shapes.flatMap((s) => (s.pts ? s.pts : [[s.arc.cx - s.arc.r, s.arc.cy - s.arc.r], [s.arc.cx + s.arc.r, s.arc.cy + s.arc.r]]));
    return { x0: Math.min(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])), x1: Math.max(...pts.map((p) => p[0])), y1: Math.max(...pts.map((p) => p[1])) };
}

/** Problems with "the pieces tile the target", or []. */
function unionProblems(target, parts) {
    const out = [];
    const sum = parts.reduce((a, s) => a + area(s), 0);
    if (Math.abs(sum - area(target)) > 1e-6 * Math.max(1, area(target))) out.push(`areas: pieces ${sum.toFixed(4)} vs target ${area(target).toFixed(4)}`);
    const b = bboxOf([target, ...parts]);
    const pad = 0.25, G = 50;
    const w = b.x1 - b.x0 + 2 * pad, h = b.y1 - b.y0 + 2 * pad;
    let bad = 0;
    for (let i = 0; i < G; i++) {
        for (let j = 0; j < G; j++) {
            // irrational offsets: a sample point never sits exactly on a lattice edge
            const p = [b.x0 - pad + (i + 0.5 + 0.1234567 * Math.SQRT2) * w / G, b.y0 - pad + (j + 0.5 + 0.0765432 * Math.PI) * h / G];
            if ([target, ...parts].some((s) => edgeDist(s, p) < 1e-4)) continue;
            const inT = inside(target, p);
            const hits = parts.filter((s) => inside(s, p)).length;
            if ((inT && hits !== 1) || (!inT && hits !== 0)) bad++;
        }
    }
    if (bad) out.push(`${bad} sample points break the tiling (gap, overlap or overhang)`);
    return out;
}

/** Every name that is TRUE of a shape, and its most specific name. */
function namesOf(s) {
    if (s.arc) {
        const sweep = s.arc.a1 - s.arc.a0;
        const nm = sweep >= 360 ? 'circle' : Math.abs(sweep - 180) < EPS ? 'half circle' : Math.abs(sweep - 90) < EPS ? 'quarter circle' : '?';
        return { best: nm, all: [nm] };
    }
    const n0 = s.pts.length;
    const pts = s.pts.filter((p, i) => {
        const a = s.pts[(i + n0 - 1) % n0], b = s.pts[(i + 1) % n0];
        return Math.abs((p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0])) > 1e-4;
    });
    const n = pts.length;
    if (n === 3) return { best: 'triangle', all: ['triangle'] };
    if (n === 5) return { best: 'pentagon', all: ['pentagon'] };
    if (n === 6) return { best: 'hexagon', all: ['hexagon'] };
    if (n !== 4) return { best: `${n}-gon`, all: [] };
    const v = pts.map((p, i) => { const q = pts[(i + 1) % 4]; return [q[0] - p[0], q[1] - p[1]]; });
    const len = v.map(([x, y]) => Math.hypot(x, y));
    const cross = (a, b) => a[0] * b[1] - a[1] * b[0], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
    // coordinates are rounded to 1e-6 by the generator: compare directions, not raw products
    const par = (a, b) => Math.abs(cross(a, b)) / (Math.hypot(...a) * Math.hypot(...b)) < 1e-4;
    const right = v.every((a, i) => Math.abs(dot(a, v[(i + 1) % 4])) / (Math.hypot(...a) * Math.hypot(...v[(i + 1) % 4])) < 1e-4);
    const equal = len.every((l) => Math.abs(l - len[0]) < 1e-4 * len[0]);
    const pairs = (par(v[0], v[2]) ? 1 : 0) + (par(v[1], v[3]) ? 1 : 0);
    const all = [];
    if (pairs >= 1) all.push('trapezoid');
    if (right) all.push('rectangle');
    if (equal) all.push('rhombus');
    if (right && equal) all.push('square');
    const best = right && equal ? 'square' : right ? 'rectangle' : equal ? 'rhombus' : pairs >= 1 ? 'trapezoid' : 'quadrilateral';
    return { best, all };
}

/* ============================================================ the rendered drawing */

/** Every shape element an SVG carries, with its markers and its area (mm^2). */
function drawnShapes(html) {
    const out = [];
    for (const m of String(html).matchAll(/<(polygon|path|circle)\b([^>]*)\/?>/g)) {
        const [, tag, attrs] = m;
        const get = (k) => { const r = new RegExp(`\\s${k}="([^"]*)"`).exec(attrs); return r ? r[1] : null; };
        let a = 0, xs = [];
        if (tag === 'polygon') {
            const pts = get('points').trim().split(/\s+/).map((p) => p.split(',').map(Number));
            a = polyArea(pts); xs = pts.map((p) => p[0]);
        } else if (tag === 'circle') {
            const r = Number(get('r')), cx = Number(get('cx'));
            a = Math.PI * r * r; xs = [cx - r, cx + r];
        } else {
            const nums = (get('d') || '').match(/-?\d+(?:\.\d+)?/g).map(Number);
            // M cx,cy L sx,sy A r,r 0 large 1 ex,ey Z
            const [cx, cy, sx, sy, r, , , large, , ex, ey] = nums;
            let t0 = Math.atan2(sy - cy, sx - cx), t1 = Math.atan2(ey - cy, ex - cx);
            let sweep = t1 - t0; while (sweep <= 0) sweep += 2 * Math.PI;
            if (large && sweep < Math.PI) sweep += Math.PI;
            a = r * r * sweep / 2;
            // the sector's own x extent: centre, both ends, and any axis point inside the sweep
            xs = [cx, sx, ex];
            for (let k = 0; k < 4; k++) {
                const t = k * Math.PI / 2;
                let rel = t - t0; while (rel < 0) rel += 2 * Math.PI;
                if (rel <= sweep + 1e-9) xs.push(cx + r * Math.cos(t));
            }
        }
        out.push({ tag, piece: get('data-ws-piece'), target: get('data-ws-target') === '1', hint: get('data-ws-hint'), area: a, x0: Math.min(...xs), x1: Math.max(...xs) });
    }
    return out;
}
/** The SVG blocks of an HTML string, with their class. */
const svgs = (html) => [...String(html).matchAll(/<svg\b[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/svg>/g)].map((m) => ({ cls: m[1], body: m[0] }));

/* ============================================================ run */

(async () => {
    const app = await open({ seed: 7 });
    const items = await app.page.evaluate(async (SETS, N) => {
        const K = await import('/js/modules/sheet/index.js');
        const out = [];
        for (let si = 0; si < SETS.length; si++) {
            for (let k = 0; k < N; k++) {
                const q = window.generateQuestionFor({ category: 'shapes_early', skill: 'compose_shapes', opts: SETS[si],
                    seed: 1000 * si + Math.floor(k / 6) + 17, itemIndex: k % 6, itemCount: 6 });
                if (!q) { out.push({ si, k, missing: true }); continue; }
                const pupil = K.renderCell(q, K.resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank', scaffoldLevel: 1 }));
                const key = K.renderCell(q, K.resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'answered', scaffoldLevel: 1 }));
                out.push({ si, k, ans: q.ans, text: q.text, answerType: q.answerType, options: q.options, visual: q.visual,
                    template: q.cell && q.cell.template, payload: q.cell && q.cell.payload, pupil, key });
            }
        }
        return out;
    }, SETS, N);
    await app.close();

    const fails = [];
    const bad = (it, msg) => fails.push(`set ${JSON.stringify(SETS[it.si])} item ${it.k}: ${msg}`);
    let checked = 0;
    for (const it of items) {
        if (it.missing) { bad(it, 'no item'); continue; }
        checked++;
        const p = it.payload || {};
        if (it.template !== 'shape-grid' || p.kind !== 'compose') { bad(it, `not a shape-grid compose cell (${it.template})`); continue; }
        if (!p.target || !Array.isArray(p.parts) || p.parts.length < 2) { bad(it, 'no target or pieces'); continue; }
        const want = Number((SETS[it.si] || {}).tiles) === 3 ? 3 : 2;
        if (p.parts.length !== want) bad(it, `${p.parts.length} pieces, the option says ${want}`);
        for (const e of unionProblems(p.target, p.parts)) bad(it, `UNION ${p.comp}: ${e}`);
        const names = namesOf(p.target);
        if (p.answer !== names.best) bad(it, `NAME the target is a ${names.best}, the answer says ${p.answer}`);
        const groups = (SETS[it.si] || {}).shapes;
        const GROUP = { triangle: 0, square: 1, rectangle: 1, hexagon: 2, pentagon: 3, trapezoid: 3, rhombus: 3, circle: 4, 'half circle': 4 };
        if (Array.isArray(groups) && !groups.includes(GROUP[p.answer])) bad(it, `the shape made (${p.answer}) is not a ticked kind`);
        const pupilShapes = drawnShapes(it.pupil);
        if (p.task === 'pieces') {
            const letter = 'ABCD'[p.correct];
            if (it.ans !== letter) bad(it, `key ${it.ans} is not the right set ${letter}`);
            const right = p.choices[p.correct].parts;
            for (const e of unionProblems(p.target, right)) bad(it, `PIECES right set: ${e}`);
            p.choices.forEach((c, i) => {
                if (i === p.correct) return;
                const t = c.parts.reduce((a, s) => a + area(s), 0);
                if (Math.abs(t - area(p.target)) < 1e-3 * area(p.target)) bad(it, `PIECES wrong set ${'ABCD'[i]} has the target's area (it might make it)`);
            });
            const targets = pupilShapes.filter((s) => s.target);
            if (targets.length !== 1) bad(it, `PIECES the shape is drawn ${targets.length} times`);
            const tSvg = svgs(it.pupil).find((s) => /sg-target/.test(s.cls));
            if (!tSvg || drawnShapes(tSvg.body).length !== 1) bad(it, 'PIECES the shape is not a single outline (seams would give the answer)');
            for (const s of svgs(it.pupil).filter((x) => /sg-choice/.test(x.cls))) {
                const d = drawnShapes(s.body).sort((a, b) => a.x0 - b.x0);
                for (let i = 1; i < d.length; i++) if (d[i].x0 < d[i - 1].x1 - 1e-6) bad(it, 'PIECES a set\'s pieces are drawn joined, not apart');
            }
            if (/data-ws-ink/.test(it.pupil) && !p.traced) bad(it, 'PIECES the blank page has a box checked');
        } else {
            const wrong = (p.names || []).filter((nm) => nm !== p.answer);
            if (!(p.names || []).includes(p.answer)) bad(it, 'NAME the bank does not hold the answer');
            for (const nm of wrong) if (names.all.includes(nm)) bad(it, `NAME "${nm}" is offered as wrong but is true of the shape`);
            const count = Number((SETS[it.si] || {}).count) === 3 ? 3 : 2;
            if ((p.names || []).length !== count) bad(it, `${(p.names || []).length} names on the bank, the option says ${count}`);
            // the screen answers in the same cell: check boxes by the names, or the box to write in
            if (p.response === 'write' ? !/data-mq-blank=/.test(it.visual) : ((it.visual.match(/data-k2-check=/g) || []).length !== (p.names || []).length)) bad(it, 'the screen twin does not carry the paper\'s answer places');
            if ((it.options || []).length) bad(it, 'the host would add choice buttons beside the cell');
            for (const [where, html] of [['pupil page', it.pupil], ['screen twin', it.visual]]) {
                if (drawnShapes(html).some((s) => s.target)) bad(it, `UNDRAWN the ${where} draws the target`);
                const pics = svgs(html).filter((x) => /sg-pieces/.test(x.cls));
                if (pics.length !== 1) { bad(it, `UNDRAWN the ${where} has ${pics.length} pictures`); continue; }
                // every shape in the picture (check marks live in the boxes, outside it)
                const d = drawnShapes(pics[0].body).filter((s) => !s.hint);
                const pieces = d.filter((s) => s.piece !== null);
                if (pieces.length !== p.parts.length) bad(it, `UNDRAWN the ${where} draws ${pieces.length} pieces for ${p.parts.length}`);
                if (d.length !== pieces.length) bad(it, `UNDRAWN the ${where} draws ${d.length - pieces.length} shapes that are not pieces`);
                const whole = pieces.reduce((a, s) => a + s.area, 0);
                if (pieces.some((s) => s.area > 0.99 * whole)) bad(it, `UNDRAWN the ${where} draws one shape as big as the whole`);
            }
            if (!p.traced && /data-ws-ink/.test(it.pupil)) bad(it, 'UNDRAWN the blank page rings or writes a name');
            if (!/data-ws-ink="solid"/.test(it.key)) bad(it, 'the key marks no answer');
        }
    }
    // PROVIDER: the skill's strings, worked steps and wrong answers hold for every item.
    const K = await import('../../js/modules/sheet/index.js');
    const prov = K.getProvider('shapes_early', 'compose_shapes');
    for (const m of ['strings', 'workedSteps', 'wrongAnswer']) if (!prov.real.includes(m)) fails.push(`PROVIDER has no real ${m}`);
    for (const it of items) {
        if (it.missing || !it.payload) continue;
        const q = { categoryId: 'shapes_early', skillId: 'compose_shapes', cell: { template: 'shape-grid', payload: it.payload, v: 1 }, ans: it.ans, text: it.text, seed: it.si * 1000 + it.k, itemIndex: it.k };
        const st = prov.strings({ categoryId: 'shapes_early', skillId: 'compose_shapes', q });
        const lint = K.lintInstruction(st.instruction);
        if (lint.length) bad(it, `PROVIDER instruction "${st.instruction}": ${lint.join('; ')}`);
        if (!/^I Can /.test(st.iCan)) bad(it, `PROVIDER iCan "${st.iCan}"`);
        const want = it.payload.task === 'pieces' ? 'compose-pieces' : it.payload.response === 'write' ? 'compose-name-write' : 'compose-name';
        if (st.instructionKey !== want) bad(it, `PROVIDER instruction key ${st.instructionKey}, the task needs ${want}`);
        if (!st.sayFill(q) || /__/.test(st.sayFill(q))) bad(it, `PROVIDER Say: frame not filled ("${st.sayFill(q)}")`);
        const steps = prov.workedSteps(q);
        const last = steps[steps.length - 1] || {};
        if (steps.length < 3 || steps.length > 6) bad(it, `PROVIDER ${steps.length} worked steps`);
        if (!(last.marks || []).some((mk) => String(mk.value) === String(it.ans))) bad(it, 'PROVIDER the last worked step does not mark the answer');
        const w = prov.wrongAnswer(q);
        if (!w || !w.misconception || String(w.value) === String(it.ans)) bad(it, `PROVIDER wrong answer ${JSON.stringify(w)}`);
        else if (it.payload.task !== 'pieces' && !(it.payload.names || []).includes(w.value)) bad(it, `PROVIDER wrong answer "${w.value}" is not on the bank`);
    }

    const byComp = {};
    items.forEach((it) => { const c = it.payload && it.payload.comp; if (c) byComp[c] = (byComp[c] || 0) + 1; });
    console.log(`ws-compose-unit: ${checked} items over ${SETS.length} option sets; compositions dealt: ${Object.keys(byComp).length}`);
    if (fails.length) {
        fails.slice(0, 40).forEach((f) => console.log('  FAIL ' + f));
        if (fails.length > 40) console.log(`  ... and ${fails.length - 40} more`);
        console.log(`ws-compose-unit: FAIL (${fails.length})`);
        process.exit(1);
    }
    console.log('ws-compose-unit: OK');
})().catch((e) => { console.error(e); console.log('ws-compose-unit: FAIL (crash)'); process.exit(1); });
