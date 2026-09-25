// Unit tests for the support panes (js/modules/sheet/cells/panes/, design/SUPPORTS.md §S4).
//
//   node tests/scripts/ws-panes-unit.mjs            run the checks
//   node tests/scripts/ws-panes-unit.mjs --matrix   also print the compatibility matrix (markdown)
//
// For every pane, every sample payload it accepts, at S / M / L, on paper and as the screen twin:
//   - it renders, with data-ws-support="<id>" and data-ws-answer-free="1" on its root;
//   - its footprint is positive and matches the drawn SVG width;
//   - NO ANSWER: the problem's answer appears in no text of the pane, except as a number of a
//     reference scale (data-ws-ref: a hundreds-chart cell, a multiple on a rounding line), and every
//     data-ws-support-part="unknown" holds nothing but an optional "?";
//   - INK: only #000, #fff and the one grey #949494; stroke widths from {0.5, 0.75, 1, 1.5, 2.25} pt
//     and never under 1 pt in grey; no dashes;
//   - SIZES: counters, beads, fingers, grid squares and area squares a pupil touches or shades are
//     6 mm or more; grid-paper writing squares are 14 mm or more.
// Prints `ws-panes-unit: OK` or `ws-panes-unit: FAIL` and exits non-zero on failure.

import { PANES, PANE_IDS, OBJECT_IDS, compat, placePane, attachPane } from '../../js/modules/sheet/cells/panes/index.js';

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { if (cond) pass++; else { fail++; console.log(`  FAIL ${name} ${detail}`); } };

const SAMPLES = [
    { n: 7 }, { n: 10 }, { n: 16 }, { n: 47 }, { n: 368 },
    { op: '+', a: 3, b: 4 }, { op: '+', a: 7, b: 5 }, { op: '+', a: 8, b: 9 }, { op: '+', a: 47, b: 25 }, { op: '+', a: 368, b: 257 },
    { op: '-', a: 9, b: 3 }, { op: '-', a: 15, b: 7 }, { op: '-', a: 72, b: 38 }, { op: '-', a: 403, b: 167 },
    { op: '*', a: 3, b: 4 }, { op: '*', a: 6, b: 7 }, { op: '*', a: 23, b: 4 }, { op: '*', a: 4, b: 5 },
    { op: '/', a: 24, b: 6 }, { op: '/', a: 35, b: 5 },
    { op: '-', a: 12, b: 5, model: 'compare' },
    { op: '+', a: 17, b: 5, bottomUp: true },
    { kind: 'round', n: 47, place: 10 }, { kind: 'round', n: 350, place: 100 }, { kind: 'round', n: 6812, place: 1000 },
    { op: '+', a: 2, b: 3, object: 'car' }, { op: '-', a: 8, b: 3, object: 'turtle' }, { n: 6, object: 'flower' }, { n: 9, object: 'block' },
];
const answerOf = (p) => (p.kind === 'round' ? Math.round(p.n / p.place) * p.place
    : p.op === '+' ? p.a + p.b : p.op === '-' ? p.a - p.b : p.op === '*' ? p.a * p.b : p.op === '/' ? p.a / p.b : NaN);

const PT = 25.4 / 72;
const ALLOWED_W = [0.5, 0.75, 1, 1.5, 2.25].map((v) => +(v * PT).toFixed(2));
const COLORS = new Set(['#000', '#000000', '#fff', '#ffffff', '#949494', 'none']);

/** Every <text> of the HTML with its attributes and content. */
const texts = (html) => [...html.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => ({ attrs: m[1], s: m[2] }));

let rendered = 0;
for (const id of PANE_IDS) {
    const P = PANES[id];
    ok(`${id} answerFree flag`, P.answerFree === true);
    ok(`${id} has label/grades/ops`, !!P.label && P.grades.length > 0 && P.ops.length > 0);
    let accepted = 0;
    for (const p of SAMPLES) {
        if (!P.accepts(p)) continue;
        accepted++;
        const ans = answerOf(p);
        for (const size of ['S', 'M', 'L']) for (const twin of [false, true]) for (const ink of ['black', 'grey']) {
            const tag = `${id} ${JSON.stringify(p)} ${size}${twin ? ' twin' : ''} ${ink}`;
            let html = '', fp = null;
            try { html = P.draw(p, { size, twin, ink }); fp = P.footprint(p, { size, twin, ink }); } catch (e) { ok(`${tag} renders`, false, e.stack); continue; }
            rendered++;
            ok(`${tag} renders`, html.length > 100);
            ok(`${tag} root`, html.includes(`data-ws-support="${id}"`) && html.includes('data-ws-answer-free="1"'));
            ok(`${tag} footprint`, fp && fp.wMm > 0 && fp.hMm > 0 && Number.isFinite(fp.wMm) && Number.isFinite(fp.hMm), JSON.stringify(fp));
            if (!twin) {
                const m = /width:([\d.]+)mm/.exec(html);
                ok(`${tag} footprint = drawn width`, m && Math.abs(Number(m[1]) - fp.wMm) < 0.6, `${m && m[1]} vs ${fp.wMm}`);
            } else {
                ok(`${tag} twin scales`, html.includes('--mq-k2') && html.includes('max-width:100%'));
            }
            // No answer, except as a reference-scale number.
            if (Number.isFinite(ans)) {
                const a = String(ans), aFmt = ans.toLocaleString('en-US');
                for (const t of texts(html)) {
                    if (/data-ws-ref="1"/.test(t.attrs)) continue;
                    const toks = t.s.replace(/&amp;/g, '&').split(/[\s+−×÷=?.,]+(?=\s|$)|\s+/).filter(Boolean);
                    const hit = toks.includes(a) || toks.includes(aFmt) || t.s.trim() === a || t.s.trim() === aFmt;
                    // An operand that equals the answer (9 - 0, 1 x 7) is not a leak.
                    const operand = [p.a, p.b, p.n].map(String).includes(a);
                    ok(`${tag} no answer "${a}" in "${t.s}"`, !hit || operand);
                }
            }
            for (const m of html.matchAll(/<g data-ws-support-part="unknown">([\s\S]*?)<\/g>/g)) {
                const inner = texts(m[1]).map((t) => t.s.trim()).join('');
                ok(`${tag} unknown part empty or ?`, inner === '' || inner === '?', inner);
            }
            // Ink.
            for (const m of html.matchAll(/(?:fill|stroke)="([^"]+)"/g)) ok(`${tag} colour ${m[1]}`, COLORS.has(m[1].toLowerCase()));
            for (const m of html.matchAll(/color:\s*(#[0-9a-fA-F]{3,6})/g)) ok(`${tag} css colour ${m[1]}`, COLORS.has(m[1].toLowerCase()));
            ok(`${tag} no dashes`, !/stroke-dasharray/.test(html));
            ok(`${tag} no opacity / gradient`, !/opacity|Gradient|filter=/.test(html));
            // Stroke widths from the closed set; a pane's grey strokes are 1 pt or more. Art drawn in
            // a scaled <g> (the 24-unit line art) is checked in its own units, so only top-level mm
            // strokes are compared here.
            if (!/scale\(/.test(html)) {
                for (const m of html.matchAll(/stroke="([^"]+)" stroke-width="([\d.]+)"/g)) {
                    const w = Number(m[2]);
                    ok(`${tag} stroke width ${w}`, ALLOWED_W.some((v) => Math.abs(v - w) < 0.011), m[0]);
                    if (m[1] === '#949494') ok(`${tag} grey stroke >= 1pt`, w >= PT - 0.011, m[0]);
                }
            }
        }
    }
    ok(`${id} accepts some samples`, accepted > 0);
}

/* ---- sizes the pupil touches, shades or writes in */
const L = { size: 'L' }, S = { size: 'S' };
const rMin = (html) => Math.min(...[...html.matchAll(/<circle[^>]* r="([\d.]+)"/g)].map((m) => Number(m[1])).filter((r) => r > 1.3));
ok('ten frame counters >= 6 mm', 2 * rMin(PANES.tenframe.draw({ op: '+', a: 7, b: 5 }, S)) >= 6 - 0.3);
ok('rekenrek beads >= 6 mm', 2 * rMin(PANES.rekenrek.draw({ op: '+', a: 7, b: 5 }, S)) >= 6 - 0.3);
ok('dice dots >= 6 mm', 2 * rMin(PANES.dice.draw({ op: '+', a: 6, b: 9 }, S)) >= 6 - 0.3);
ok('array counters >= 6 mm', 2 * rMin(PANES.array.draw({ op: '*', a: 3, b: 4 }, S)) >= 6 - 0.3);
{
    const html = PANES.area.draw({ op: '*', a: 3, b: 4 }, S);
    const m = /<rect x="0" y="0" width="([\d.]+)" height="([\d.]+)"/.exec(html);
    ok('area squares >= 6 mm', m && Number(m[1]) / 4 >= 6 && Number(m[2]) / 3 >= 6);
}
{
    const html = PANES.fingers.draw({ n: 8 }, S);
    const ws = [...html.matchAll(/data-ws-finger="up"[^>]* width="([\d.]+)"/g)].map((m) => Number(m[1]));
    ok('fingers are 6 mm wide', ws.length === 8 && ws.every((w) => w >= 6), JSON.stringify(ws));
}
{
    const html = PANES.gridpaper.draw({ op: '+', a: 47, b: 25 }, S);
    const fp = PANES.gridpaper.footprint({ op: '+', a: 47, b: 25 }, S);
    ok('grid-paper squares are 14 mm writing places', fp.wMm >= 4 * 14 && /data-ws-support-part="unknown"/.test(html));
}
for (const kind of OBJECT_IDS) {
    const html = PANES.objects.draw({ n: 3, object: kind }, L);
    ok(`object ${kind} draws 3`, (html.match(/data-ws-count="1"/g) || []).length === 3);
}
ok('fingers 1-10 count', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => (PANES.fingers.draw({ n }, L).match(/data-ws-finger="up"/g) || []).length === n));
ok('rekenrek 12 pushes 12 beads', (PANES.rekenrek.draw({ n: 12 }, L).match(/data-ws-bead="in"/g) || []).length === 12);
ok('base10 47 = 4 rods 7 ones', (() => { const h = PANES.base10.draw({ n: 47 }, L); return (h.match(/data-ws-block="10"/g) || []).length === 4 && (h.match(/data-ws-block="1"/g) || []).length === 7; })());
ok('hundreds bottom-up puts 1 below 91', (() => {
    const h = PANES.hundreds.draw({ n: 50, chart: 'full', bottomUp: true }, L);
    const y = (v) => Number(new RegExp(`y="([\\d.]+)"[^>]*>${v}</text>`).exec(h)[1]);
    return y(1) > y(91);
})());
ok('rounding line marks the midpoint', /data-ws-mid="1"[^>]*>45</.test(PANES['round-line'].draw({ kind: 'round', n: 47, place: 10 }, L)));
ok('number line omits the answer label', !/>12</.test(PANES.numberline.draw({ op: '+', a: 7, b: 5 }, L)));
ok('rejects out-of-range', !PANES.tenframe.accepts({ op: '+', a: 15, b: 9 }) && !PANES.base10.accepts({ n: 368 }) && !PANES.fingers.accepts({ n: 11 }));

/* ---- placement + compatibility */
const fp = PANES.tenframe.footprint({ op: '+', a: 7, b: 5 }, L);
ok('place beside in a wide cell', placePane(fp, { problemWMm: 30, cellWMm: 186, problemHMm: 40 }) === 'beside');
ok('place under in a narrow cell', placePane(fp, { problemWMm: 30, cellWMm: 70, problemHMm: 40 }) === 'under');
ok('no place when too wide', placePane(PANES.numberline.footprint({ op: '+', a: 7, b: 5 }, L), { problemWMm: 30, cellWMm: 60 }) === null);
ok('start arrow goes over the ones', placePane(PANES.startarrow.footprint({ op: '+', a: 47, b: 25 }, L), { problemWMm: 30, cellWMm: 60 }) === 'over-ones');
ok('boxed sign goes before the problem', placePane(PANES.boxsign.footprint({ op: '+', a: 4, b: 5 }, L), { problemWMm: 30, cellWMm: 87 }) === 'before');
ok('attach before/beside/under/over', ['before', 'beside', 'under', 'over-ones'].every((pl) => attachPane('<b>x</b>', '<i>p</i>', pl).includes(`data-ws-pane-place="${pl}"`)));
ok('compat symmetric', PANE_IDS.every((x) => PANE_IDS.every((y) => compat(x, y) === compat(y, x))));
ok('tenframe x touchdots clash', compat('tenframe', 'touchdots') === 'clash');
ok('gridpaper x touchdots ok', compat('gridpaper', 'touchdots') === 'ok');
ok('boxsign stacks with all', PANE_IDS.filter((x) => x !== 'boxsign').every((x) => compat('boxsign', x) !== 'clash'));

if (process.argv.includes('--matrix')) {
    const ids = [...PANE_IDS, 'touchdots'];
    const sym = { ok: '✓', wide: 'W', clash: '✗' };
    console.log(`| | ${ids.map((i) => `\`${i}\``).join(' | ')} |`);
    console.log(`|---|${ids.map(() => ':-:').join('|')}|`);
    for (const x of ids) console.log(`| \`${x}\` | ${ids.map((y) => (x === y && x !== 'touchdots' ? '—' : sym[compat(x, y)])).join(' | ')} |`);
}

console.log(`ws-panes-unit: ${fail ? 'FAIL' : 'OK'} (${pass} passed, ${fail} failed, ${rendered} renders of ${PANE_IDS.length} panes)`);
process.exit(fail ? 1 : 0);
