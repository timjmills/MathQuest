#!/usr/bin/env node
// ws-screen-ink-size — check SCREEN-INK-SIZE: a picture on a screen host is drawn at least at its PRINT size, and it lies
// across its cell before it grows tall (lane lf-checks, 2026-11-13). Why: the owner caught division:div_facts screen arrays
// drawn as tall narrow strips of tiny dots (a 12 x 36 frame in a 720 px card); the screen critic listed "array dots small on
// screen" only as an unscored note, and no machine check compared the screen drawing with the paper one.
//
// Rules, judged on every screen cell of every host (practice card 390 / 820 / 1280, online worksheet .mq-wspaper and quiz
// .mq-qtpaper at 1280, as ws-empty-band renders them):
//   SIZE-INK    every repeated picture mark (dots, counters, base-10 blocks, cubes, tiles: SVG circle / ellipse / rect / use /
//               path / polygon groups of >= 3 like marks, and HTML leaf marks of one class) is at least its PRINT size in CSS
//               mm (1 mm = 96 / 25.4 px), with a 5 % tolerance. The print size is read off THE SAME ITEM on the Independent
//               page at the print size (--size, default M), built by buildSheet with the same options and seed (critic sis-r1
//               D2: never a median over different items). The card deals print items 0-2 (generateQuestionFor, seed + i,
//               itemIndex i) and the quiz items 0-1; every screen item is matched to its print cell by the numbers of its
//               fact (the cell's text outside its drawings; a [data-mq-item] attribute wins). Inside the item, a mark group
//               is compared with the print group of the same mark and count. An item paper does not hold (the worksheet
//               deals its own) falls back to GEOMETRY: the print drawing of the same kind, marks and count, then the same
//               marks and count under any label (D3: a relabelled picture is still judged), then the same kind and marks
//               with the nearest count (one drawing, never a median).
//   SIZE-REF    a screen mark group with no print counterpart at all FAILS (D3): it may not pass unjudged. A drawing marked
//               [data-mq-screen-only] (a screen-only cue) is listed in a note instead.
//   SIZE-WIDTH  a drawing uses at least 60 % of its cell's FREE width before it grows taller: FAIL when its INK width (the
//               union of its painted shapes, never its svg box: D1) < 60 % of the free width AND its ink height > ink width.
//               The free width is the cell's content-box width less every block beside the drawing that HOLDS INK, at each
//               level from the drawing up to the cell (D4: an empty spacer is not beside it).
//   TEXT-SIZE   (queue 16 / 17, 2026-11-13) every label and non-slot text run of a screen cell, at its RENDERED size (font-size x
//               every transform above it), against its floor: a numeral paper prints at working-digit size (or a count row's
//               number) is DIGIT text, held to the digit floor (card / quiz 40 / 48 / 56 px at 390 / 820 / 1280, read from
//               ws-screen-slots SCREEN-DIGIT; the online worksheet 29 px, the SP table; a count row on a phone 29 px, TY-10b);
//               the cell's largest numeral is SCREEN-DIGIT's and is skipped. Anything else is LABEL text, held to the same
//               item's print size (5 % tolerance; a word may match the same word anywhere on the page) and never under 8 pt.
//               --dump-text prints every run read. Fixtures: --width W sets the host width (default 1280).
//   CELL-READ   (lf-hosts, 2026-11-13; as ws-screen-slots / ws-screen-answer / ws-phone-card, lf-checks 1fbdb8eca) a host
//               render that read 0 [data-ws-cell] cells - it did not render, its root is missing, the card / quiz paper holds
//               no [data-ws-cell], the worksheet dealt 0 cards or a card holds none - is a FINDING, never a pass. It is not
//               filtered by --only, and its keys are never pinned (a new key breaks the pin).
// Worksheet items (queue 14): the worksheet deals its own items, so each card is also matched with the print cell of the item
// it DEALT (the kit's renderCell at --size, [data-mq-dealt]; fixtures: [data-mq-print-dealt]) before any geometric fallback.
// Pattern terms (queue 15): a drawing labelled "Term n" (or in [data-ws-term] / .mq-gp-term) is judged by its unit (SIZE-INK,
// with 1+ marks), never by SIZE-WIDTH: a one-dot-wide column is taller than wide by the maths.
// Only INK marks are sizes: a white or unfilled shape with no dark stroke (the touch numeral's halo and keyline) is not a mark,
// and a ring (no fill, a dark stroke) is its own mark beside the solid dots (lf-ops 2026-11-13): it is named "ring" and is
// paired only with a print ring, so a screen ring paper does not draw is SIZE-REF (critic sis-r2 D1). A support drawing whose
// label names no picture takes its `support` value's picture ("counter (ten frame)", "dot (dot tile)"; D3).
// Output (D2): each finding line starts "OVER  " (it breaks the pin, or no pin is read) or "pinned" (the pin holds it); the
// pin totals printed are those of the keys this run judged. --self-test also checks that the sweep report agrees with the pin (D5). A touch numeral's kind is
// its digit ("digit 7"), so its dots are compared with the same digit on paper.
// Drawings under 4 mm across both ways are not judged (a tick, a ring). A numeral drawing (an svg with data-digit: the touch
// dots laid on a digit) is judged by SIZE-INK only: its shape is the digit's, so SIZE-WIDTH does not apply. A mark group needs
// >= 3 like marks at >= 3 distinct places (a picture's detail drawn three times on one spot is not a set of marks).
// Messages name every mark by a NOUN from a fixed list (NOUNS: "dot", "counter", "base-10 rod" ...) and its picture from
// PICTURES ("array", "ten frame" ...), never the aria-label with its numbers stripped (D8).
//
//   node tests/scripts/ws-screen-ink-size.cjs --skill division:div_facts
//   node tests/scripts/ws-screen-ink-size.cjs --skill a:b,c:d --hosts card,worksheet --only SIZE-WIDTH
//   node tests/scripts/ws-screen-ink-size.cjs --passed                 # every id in js/modules/redesign-passed.js
//   node tests/scripts/ws-screen-ink-size.cjs --skill a:b --opts '{"support":["array"]}'
//   node tests/scripts/ws-screen-ink-size.cjs --html file.html         # a fixture: [data-mq-print] holds the paper cells,
//                                                                       # [data-mq-screen] the screen cells (backtest rows)
//   node tests/scripts/ws-screen-ink-size.cjs --passed --sweep design/status/lf-checks/screen-ink-size-sweep.md
//   node tests/scripts/ws-screen-ink-size.cjs --self-test              # the pure judging functions, no browser
// Options rendered per skill (absent --opts): the skill's defaults, plus each value of its supports-model `support` option
// (with that value's base options), so a support that draws a picture is judged. --report-only exits 0; --json <file> writes
// the findings; --sweep <md> writes the sweep report. Prints one line per finding, then `ws-screen-ink-size: OK` or
// `FAIL (n)`; exits 1 on FAIL.
//
// THE PIN (lead 2026-11-13, keyed per critic sis-r1 D5): design/audit/baselines/screen-ink-size.json holds, per key
// `skill {option} host width|rule|mark name|size bucket`, the count of findings and the WORST % (screen / print for SIZE-INK,
// ink width / free width for SIZE-WIDTH). A key the pin does not hold (a new mark kind, a new size class), a count above
// the pin, or a worst % more than 1 point below it (90 % falling to 50 %) FAILS. --write-baseline <file> writes it;
// --no-baseline judges raw.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..', '..');   // the pin is read from this checkout (MQ_ROOT serves another tree)

const NAME = 'ws-screen-ink-size';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const INK_TOL = 0.05;      // SIZE-INK: screen >= 95 % of print
const WIDTH_MIN = 0.60;    // SIZE-WIDTH: drawing width >= 60 % of the free width ...
const MIN_DRAW_MM = 4;     // drawings smaller than this both ways are not judged
const PIN_SLACK = 1;       // a worst % may move by 1 point (rounding) before it counts as worse

// TEXT-SIZE (lf-checks queue 16 / 17, 2026-11-13): the digit floors are ws-screen-slots' SCREEN-DIGIT targets, read from its
// source so the two never drift (40 / 48 / 56 px at 390 / 820 / 1280); the label floor is RUBRIC H2 / TY-11's 8 pt.
const DIGIT_FLOORS = (() => {
    try {
        const m = /const DIGIT_VIEWPORTS = (\[[^\n]*\]);/.exec(fs.readFileSync(path.join(__dirname, 'ws-screen-slots.cjs'), 'utf8'));
        const vs = Function(`return ${m[1]}`)();
        return Object.fromEntries(vs.map((v) => [v.w, v.px]));
    } catch (e) { return { 390: 40, 820: 48, 1280: 56 }; }
})();
const WORKSHEET_DIGIT_PX = 29;          // WORKSHEET_DESIGN_STANDARD SP table: the online worksheet grid's digit size
const COUNT_ROW_PHONE_PX = 29;          // TY-10b (owner exception): count rows on a phone (<= 480 px) draw ~29 px digits
const LABEL_FLOOR_PX = 8 * 96 / 72;     // RUBRIC H2 / TY-11: nothing a pupil reads under 8 pt
const TEXT_TOL = 0.05;                  // a label >= 95 % of its print size
const WORK_DIGIT_SHARE = 0.85;          // a print run at >= 85 % of the working digit size is a working digit

/* ------------------------------------------------------------------ pure judging */

/** TEXT-SIZE: the digit floor (px) of a host width; a count row on a phone takes TY-10b's 29 px. */
function digitFloorPx(width, { countRow = false, host = 'card' } = {}) {
    if (host === 'worksheet') return WORKSHEET_DIGIT_PX;
    if (countRow && width <= 480) return COUNT_ROW_PHONE_PX;
    const ws = Object.keys(DIGIT_FLOORS).map(Number).sort((a, b) => a - b);
    const w = ws.filter((x) => x <= width).pop() || ws[0];
    return DIGIT_FLOORS[w];
}
/** TEXT-SIZE: a screen text run's role and floor (px) from its print counterpart (px; NaN when paper has no such run).
 *  A run paper prints at working-digit size is a DIGIT (the host's digit floor); anything else is a LABEL, held to its print
 *  size (5 % tolerance) and never under 8 pt. */
function textFloor({ numeric, printPx, workPx, width, countRow = false, inSvg = false, host = 'card' }) {
    // (a numeral drawn INSIDE a picture - a hundred chart's square, an axis label - is the picture's label (RP-6), held to its print size)
    // (a count row's numbers ARE its working digits, TY-10a / TY-10b, whatever size paper fitted them at)
    if (numeric && !inSvg && (countRow || printPx >= WORK_DIGIT_SHARE * workPx)) return { role: 'digit text', floor: digitFloorPx(width, { countRow, host }) };
    const p = Number.isFinite(printPx) && printPx > 0 ? (1 - TEXT_TOL) * printPx : 0;
    return { role: 'label text', floor: +Math.max(LABEL_FLOOR_PX, p).toFixed(2) };
}
/** TEXT-SIZE: the finding text for a run of `px` against `floor`; null when it holds. */
function textFinding(role, text, px, floor, printPx) {
    if (!(px > 0) || !(floor > 0) || px >= floor - 0.05) return null;
    const pr = Number.isFinite(printPx) && printPx > 0 ? `, print ${(printPx * 72 / 96).toFixed(1)} pt` : ', no print run';
    return `${role} "${String(text).slice(0, 24)}" is ${px.toFixed(1)} px (${(px * 72 / 96).toFixed(1)} pt${pr}); needs >= ${floor.toFixed(1)} px`;
}
/** TEXT-SIZE pin bucket: the floor that held the run. */
function textBucket(role, floor) {
    if (role === 'digit text') return `digit floor ${Math.round(floor)} px`;
    const pt = floor * 72 / 96;
    return pt <= 8.05 ? 'label 8 pt floor' : pt < 11 ? 'label print under 11 pt' : pt < 15 ? 'label print 11-15 pt' : 'label print 15 pt+';
}
/** Queue 15: a TERM drawing of a growing pattern (one term of a sequence) is judged by its unit size, never its width. */
const isTermDrawing = ({ label = '', cls = '', term = false }) => !!term || /^term\b/i.test(String(label).trim()) || /(^|\s)(mq-gp-|gp-)?term(\s|$)/i.test(cls);

function median(xs) {
    const a = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q);
    if (!a.length) return NaN;
    const m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}
/** SIZE-INK: a screen mark group's size (mm) against its print item's; null when it holds. */
function inkFinding(name, screenMm, printMm, tol = INK_TOL) {
    if (!(screenMm > 0) || !(printMm > 0)) return null;
    if (screenMm >= (1 - tol) * printMm) return null;
    return `${name}: screen ${screenMm.toFixed(2)} mm, print ${printMm.toFixed(2)} mm (${Math.round(screenMm / printMm * 100)} %; needs >= ${Math.round((1 - tol) * 100)} % = ${((1 - tol) * printMm).toFixed(2)} mm)`;
}
/** SIZE-WIDTH: drawing ink w x h (mm) in a cell whose free width is freeW (mm); null when it holds. */
function widthFinding(name, w, h, freeW, min = WIDTH_MIN) {
    if (!(w > 0) || !(h > 0) || !(freeW > 0)) return null;
    if (w < MIN_DRAW_MM && h < MIN_DRAW_MM) return null;
    if (w >= min * freeW || h <= w) return null;
    return `${name}: drawing ${w.toFixed(1)} x ${h.toFixed(1)} mm uses ${Math.round(w / freeW * 100)} % of the ${freeW.toFixed(1)} mm free width (limit ${Math.round(min * 100)} %) and is taller than wide`;
}

// D8: every mark is named by a noun of this list, every picture by a name of PICTURES; nothing else reaches a message.
const NOUNS = ['dot', 'touch dot', 'ring', 'touch ring', 'counter', 'frame cell', 'tile', 'cube', 'base-10 rod', 'bar', 'square', 'box', 'picture mark', 'block'];
const PICTURES = ['array', 'ten frame', 'dot tile', 'digit', 'skip-count strip', 'base-10 blocks', 'five-dot groups', 'number track', 'pattern term', 'picture'];
/** The noun of a mark from its drawing's label / class and its own tag / class (D8). */
function nounOf({ label = '', cls = '', glyph = false, mark = '' }) {
    const [tag, ...mc] = String(mark).split('.');
    const t = `${label} ${cls} ${mc.join(' ')}`.toLowerCase();
    const round = /^(circle|ellipse)$/.test(tag);
    // a ring (no fill, a dark stroke: the reader keys it "<tag>.ring") is its own mark, never a "dot" (critic sis-r2 D1)
    if (round && mc.includes('ring')) return glyph || /\bws-td\b|ws-td-|touch/.test(t) ? 'touch ring' : 'ring';
    if (glyph || /\bws-td\b|ws-td-|touch/.test(t)) return round ? 'touch dot' : 'block';
    if (/frame/.test(t)) return round ? 'counter' : 'frame cell';
    if (/counter/.test(t)) return 'counter';
    if (round) return 'dot';
    if (/cube/.test(t)) return 'cube';
    if (/\brod|\bbase|\bblock|\bb10|\bflat\b|\btens?\b/.test(t)) return 'base-10 rod';
    if (/tile/.test(t)) return 'tile';
    if (/\bbar\b/.test(t)) return 'bar';
    if (/count by|skip|jump|track/.test(t)) return 'box';
    if (tag === 'rect') return 'square';
    if (/^(path|polygon|use)$/.test(tag)) return 'picture mark';
    return 'block';
}
/** The picture a drawing is, from its label / class (D8); '' when none of PICTURES fits. */
function pictureOf({ label = '', cls = '', glyph = false }) {
    const t = `${label} ${cls}`.toLowerCase();
    if (glyph || /\bws-td\b|ws-td-/.test(t)) return 'digit';
    if (/^\s*term\b/.test(t)) return 'pattern term';
    if (/array|rows? of/.test(t)) return 'array';
    if (/ten frame|frame/.test(t)) return 'ten frame';
    if (/dot tile/.test(t)) return 'dot tile';
    if (/count by|skip/.test(t)) return 'skip-count strip';
    if (/fives|five/.test(t)) return 'five-dot groups';
    if (/base|block|rod/.test(t)) return 'base-10 blocks';
    if (/track|number line/.test(t)) return 'number track';
    if (/k2-svg|picture|\(/.test(t)) return 'picture';
    return '';
}
/** The picture of a supports-model `support` value, for a drawing whose label names none (critic sis-r2 D3). */
const SUPPORT_PICTURES = { array: 'array', frame: 'ten frame', tenframe: 'ten frame', ten_frame: 'ten frame', tile: 'dot tile', dots: 'dot tile',
    skip: 'skip-count strip', strip: 'skip-count strip', base10: 'base-10 blocks', blocks: 'base-10 blocks', fives: 'five-dot groups', track: 'number track', touch: 'digit' };
const supportPicture = (v) => (v ? SUPPORT_PICTURES[v] || 'picture' : '');
/** "dot (array)": the mark's noun and its picture; a support drawing with no picture of its own takes its support's (D3). */
const markName = (d, g, support = '') => {
    const p = pictureOf(d) || supportPicture(support);
    const n = nounOf({ label: `${d.label} ${pictureOf(d) ? '' : p}`.trim(), cls: d.cls, glyph: d.glyph, mark: g.mark });
    return p ? `${n} (${p})` : n;
};
/** A drawing's name for SIZE-WIDTH: its picture, else "<noun> picture". */
const drawingName = (d, support = '') => pictureOf(d) || supportPicture(support) || `${nounOf({ label: d.label, cls: d.cls, glyph: d.glyph, mark: (d.groups[0] || {}).mark })} picture`;

/** The print reference of screen drawing sd's group g among the print drawings (D2, D3); null when none. `dealt` holds the
 *  print cells of the very items a host dealt (queue 14: the worksheet deals its own items, so a vocabulary word the
 *  Independent page never deals read as SIZE-REF): after the page's same item, a screen item is matched with its own dealt
 *  print cell, before any geometric fallback on the page. */
function matchRef(sd, g, prints, dealt = []) {
    // a ring is its own mark: it is paired only with a print ring, and a dot only with a print dot (critic sis-r2 D1)
    const ringy = (m) => /\.ring$/.test(m);
    const all = prints.flatMap((p) => p.groups.map((pg) => ({ p, g: pg }))).filter((c) => ringy(c.g.mark) === ringy(g.mark));
    const pick = (cs, how) => (cs.length ? { printMm: median(cs.map((c) => c.g.sizeMm)), how } : null);
    if (sd.sig) {
        const same = all.filter((c) => c.p.sig === sd.sig);
        for (const f of [(c) => c.p.kind === sd.kind && c.g.mark === g.mark && c.g.n === g.n, (c) => c.g.mark === g.mark && c.g.n === g.n, (c) => c.g.mark === g.mark, (c) => c.g.n === g.n]) {
            const r = same.filter(f); if (r.length) return pick(r, 'same item');
        }
    }
    if (sd.dealt) {
        const own = dealt.filter((p) => p.dealt === sd.dealt).flatMap((p) => p.groups.map((pg) => ({ p, g: pg }))).filter((c) => ringy(c.g.mark) === ringy(g.mark));
        for (const f of [(c) => c.p.kind === sd.kind && c.g.mark === g.mark && c.g.n === g.n, (c) => c.g.mark === g.mark && c.g.n === g.n, (c) => c.g.mark === g.mark]) {
            const r = own.filter(f); if (r.length) return pick(r, 'same item, dealt cell');
        }
    }
    let r = all.filter((c) => c.p.kind === sd.kind && c.g.mark === g.mark && c.g.n === g.n);
    if (r.length) return pick(r, 'same drawing');
    r = all.filter((c) => c.g.mark === g.mark && c.g.n === g.n);
    if (r.length) return pick(r, 'same marks, label differs');
    r = all.filter((c) => c.p.kind === sd.kind && c.g.mark === g.mark);
    if (r.length) {
        const best = Math.min(...r.map((c) => Math.abs(c.g.n - g.n)));
        const near = r.filter((c) => Math.abs(c.g.n - g.n) === best);
        return { printMm: Math.max(...near.map((c) => c.g.sizeMm)), how: 'nearest print drawing' };
    }
    return null;
}

/** D5: the size bucket of a finding (print mark size for SIZE-INK, ink aspect for SIZE-WIDTH). */
function inkBucket(printMm) { return printMm < 1.5 ? 'under 1.5 mm' : printMm < 2.5 ? '1.5-2.5 mm' : printMm < 4 ? '2.5-4 mm' : '4 mm+'; }
function widthBucket(w, h) { const a = h / w; return a < 2 ? 'taller than wide' : a < 3 ? 'strip 2:1' : 'strip 3:1+'; }
const pinKey = (x) => `${x.where}|${x.rule}|${x.name}|${x.bucket}`;
/** The pin entries {key: {n, worst}} of a list of findings. */
function pinOf(findings) {
    const out = {};
    for (const x of findings) {
        const k = pinKey(x); const e = out[k] || (out[k] = { n: 0, worst: Infinity });
        e.n++; e.worst = Math.min(e.worst, x.pct);
    }
    return out;
}
/** D5: the keys of `findings` that break `pin`, each with why: a new key, a higher count, a worse worst %. */
function judgePin(pin, findings) {
    const cur = pinOf(findings); const over = [];
    for (const k of Object.keys(cur)) {
        const p = pin[k]; const c = cur[k];
        if (!p) over.push({ key: k, why: `new: ${c.n} finding(s), worst ${c.worst} %` });
        else if (c.n > p.n) over.push({ key: k, why: `${c.n} finding(s) > ${p.n} pinned` });
        else if (c.worst < p.worst - PIN_SLACK) over.push({ key: k, why: `worst ${c.worst} % < ${p.worst} % pinned` });
    }
    return over;
}

/** D2: the printed finding lines, each prefixed OVER (breaks the pin, or no pin) or pinned (the pin holds its key). */
function findingLines(findings, over) {
    const ov = over ? new Set(over.map((o) => o.key)) : null;
    return findings.map((x) => `${!ov || ov.has(pinKey(x)) ? 'OVER  ' : 'pinned'} ${x.rule} ${x.where}${x.at}: ${x.msg}`);
}
/** D2: the pin's totals over the keys THIS run judged (a key whose skill / option / host / width was rendered here). */
function pinScope(pin, visited, findings) {
    const ks = Object.keys(pin).filter((k) => visited.has(k.split('|')[0]));
    const now = new Set(findings.map(pinKey));
    return { keys: ks.length, findings: ks.reduce((a, k) => a + pin[k].n, 0), cleared: ks.filter((k) => !now.has(k)).length };
}
/** D5: the sweep report's header totals against the pin's own totals and its keys; [] when they agree. */
function sweepPinDrift(sweepText, pj) {
    const m = /\*\*(\d+) keys, (\d+) findings\*\*/.exec(sweepText || '');
    const keys = Object.keys(pj.keys || {}); const n = keys.reduce((a, k) => a + pj.keys[k].n, 0);
    const out = [];
    if (!m) return ['the sweep has no "**N keys, M findings**" header'];
    if (+m[1] !== keys.length || +m[2] !== n) out.push(`sweep ${m[1]} keys / ${m[2]} findings, pin keys ${keys.length} / ${n}`);
    if ((pj.totals || {}).keys !== keys.length || (pj.totals || {}).findings !== n) out.push(`pin totals ${JSON.stringify(pj.totals)} != its keys ${keys.length} / ${n}`);
    for (const k of keys) if (!(sweepText.includes(`| ${k.split('|')[2]} | ${k.split('|')[3]} | ${pj.keys[k].n} | ${pj.keys[k].worst} % |`))) { out.push(`sweep has no row for ${k}`); break; }
    return out;
}

/**
 * CELL-READ (lf-hosts, 2026-11-13; the same rule as ws-screen-slots / ws-screen-answer / ws-phone-card, lf-checks 1fbdb8eca):
 * a host render that read no [data-ws-cell] cell (the root, a card or the quiz paper) judged nothing, so it is a FINDING,
 * never a pass. `r` is cellCountInPage's result (null: the host did not render). Pure: '' when the host holds its cells.
 */
function cellReadError(host, scope, r) {
    if (!r) return `${scope} rendered nothing on the ${host} host (0 cells read)`;
    if (r.error) return `${r.error} on the ${host} host (0 cells read)`;
    if (host === 'worksheet') {
        if (!(r.cards > 0)) return `the worksheet dealt 0 cards at ${scope} (0 cells read)`;
        if (r.cardsWithout > 0) return `${r.cardsWithout} of ${r.cards} worksheet card(s) hold no [data-ws-cell] cell - its checks read nothing there`;
        return '';
    }
    if (!(r.cells > 0)) return `0 [data-ws-cell] cells at ${scope} on the ${host} host - its checks read nothing (screen parity: the cell carries data-ws-cell)`;
    return '';
}

function selfTest() {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('median odd', median([3, 1, 2]), 2);
    eq('median even', median([1, 2, 3, 4]), 2.5);
    eq('median NaN dropped', median([NaN, 2]), 2);
    // SIZE-INK: div_facts 73e96fc1 screen dot 0.9 mm against print 1.96 mm fails; 1.90 (97 %) holds; 1.85 (94 %) fails
    eq('ink tiny dots (73e96fc1)', !!inkFinding('dot (array)', 0.9, 1.96), true);
    eq('ink within 5 %', inkFinding('dot (array)', 1.90, 1.96), null);
    eq('ink just under 95 %', !!inkFinding('dot (array)', 1.85, 1.96), true);
    eq('ink bigger', inkFinding('dot (array)', 3.2, 1.96), null);
    eq('ink no print ref', inkFinding('dot (array)', 0.5, NaN), null);
    // SIZE-WIDTH: a 10.8 x 32 mm strip in a 150 mm free width fails; a wide drawing holds; a tall drawing filling its free width holds
    eq('width tall strip (73e96fc1)', !!widthFinding('array', 10.8, 32.3, 150), true);
    eq('width landscape', widthFinding('array', 40, 25, 150), null);
    eq('width narrow but short', widthFinding('array', 30, 20, 150), null);
    eq('width tall but fills free width', widthFinding('array', 20, 60, 30), null);
    eq('width at 60 %', widthFinding('array', 60, 90, 100), null);
    eq('width at 59 %', !!widthFinding('array', 59, 90, 100), true);
    eq('width tiny drawing', widthFinding('tick', 3, 3.5, 100), null);
    // D2: the same item, not the page median (print 2 x 3 at 4 mm and 10 x 10 at 1 mm)
    const prints = [
        { sig: '6,2', kind: 'array', groups: [{ mark: 'circle', n: 6, sizeMm: 4 }] },
        { sig: '100,10', kind: 'array', groups: [{ mark: 'circle', n: 100, sizeMm: 1 }] },
    ];
    eq('ref same item (miss under the median)', matchRef({ sig: '6,2', kind: 'array' }, { mark: 'circle', n: 6 }, prints), { printMm: 4, how: 'same item' });
    eq('ref same item (false alarm under the median)', matchRef({ sig: '100,10', kind: 'array' }, { mark: 'circle', n: 100 }, prints), { printMm: 1, how: 'same item' });
    eq('ref same drawing, other item', matchRef({ sig: '8,2', kind: 'array' }, { mark: 'circle', n: 100 }, prints), { printMm: 1, how: 'same drawing' });
    // D3: a relabelled picture is judged by its marks; no counterpart at all is null (SIZE-REF)
    // a touch numeral in the same item is compared with the SAME digit (8 + 4: the 8's centre dots, never a median with the 4's)
    const tn = [{ sig: '8,4', kind: 'digit 8', groups: [{ mark: 'circle', n: 4, sizeMm: 0.79 }] }, { sig: '8,4', kind: 'digit 4', groups: [{ mark: 'circle', n: 4, sizeMm: 1.58 }] }];
    eq('ref same item, same digit', matchRef({ sig: '8,4', kind: 'digit 8' }, { mark: 'circle', n: 4 }, tn), { printMm: 0.79, how: 'same item' });
    eq('ref relabelled', matchRef({ sig: '', kind: 'dots for' }, { mark: 'circle', n: 6 }, prints), { printMm: 4, how: 'same marks, label differs' });
    eq('ref nearest count', matchRef({ sig: '', kind: 'array' }, { mark: 'circle', n: 90 }, prints), { printMm: 1, how: 'nearest print drawing' });
    eq('ref none', matchRef({ sig: '', kind: 'tiles' }, { mark: 'rect', n: 5 }, prints), null);
    // D5: the pin keys on the mark name and its size bucket and holds the worst %
    const f = (pct, name = 'dot (array)', bucket = '1.5-2.5 mm') => ({ where: 'a:b {defaults} card 390px', rule: 'SIZE-INK', name, bucket, pct });
    const pin = pinOf([f(90), f(92)]);
    eq('pin entry', pin['a:b {defaults} card 390px|SIZE-INK|dot (array)|1.5-2.5 mm'], { n: 2, worst: 90 });
    eq('pin holds', judgePin(pin, [f(90), f(93)]).length, 0);
    eq('pin rounding slack', judgePin(pin, [f(89)]).length, 0);
    eq('pin worse 90 -> 50 fails', judgePin(pin, [f(50)]).map((o) => o.why), ['worst 50 % < 90 % pinned']);
    eq('pin new kind fails', judgePin(pin, [f(90, 'counter (ten frame)')]).length, 1);
    eq('pin new size bucket fails', judgePin(pin, [f(90, 'dot (array)', 'under 1.5 mm')]).length, 1);
    eq('pin count rise fails', judgePin(pin, [f(91), f(91), f(91)]).map((o) => o.why), ['3 finding(s) > 2 pinned']);
    eq('ink bucket', [1.2, 1.96, 2.8, 5.9].map(inkBucket), ['under 1.5 mm', '1.5-2.5 mm', '2.5-4 mm', '4 mm+']);
    // D8: every name is a noun of NOUNS (and a picture of PICTURES) for every label the passed skills draw today, and for junk
    const labels = ['ws-td-svg', 'and', 'rows of', 'count by', 'count by to', 'array', 'array, 3 rows of 4', 'ten frame:', 'dot tile of',
        'k2-svg (fish)', 'k2-svg (balls)', 'counting dots in fives', 'base-10 rods', 'cubes', 'tiles', 'bar model', 'dots for', 'x y z', ''];
    const marks = ['circle', 'circle.ring', 'ellipse', 'rect', 'path', 'polygon', 'use', 'div.ws-counter', 'span', 'i.b10-rod', 'rect.cube'];
    let named = 0; const offList = [];
    for (const label of labels) for (const mark of marks) for (const glyph of [false, true]) {
        const d = { label, cls: '', glyph, groups: [{ mark }] };
        const nm = markName(d, d.groups[0]); const m = /^(.+?)(?: \((.+)\))?$/.exec(nm);
        named++;
        if (!m || !NOUNS.includes(m[1]) || (m[2] && !PICTURES.includes(m[2]))) offList.push(nm);
        const dn = drawingName(d); const dm = /^(.+) picture$/.exec(dn);
        if (!PICTURES.includes(dn) && !(dm && NOUNS.includes(dm[1]))) offList.push(dn);
    }
    eq(`every mark name is a listed noun (${named} names)`, offList.slice(0, 5), []);
    eq('noun: array dot', markName({ label: 'array, 3 rows of 4', cls: 'ws-factcue-svg' }, { mark: 'circle' }), 'dot (array)');
    eq('noun: the old "and circle"', markName({ label: 'and', cls: '' }, { mark: 'circle' }), 'dot');
    eq('noun: the old "count by rect"', markName({ label: 'count by', cls: '' }, { mark: 'rect' }), 'box (skip-count strip)');
    eq('noun: touch dots', markName({ label: '', cls: 'ws-td-svg', glyph: true }, { mark: 'circle' }), 'touch dot (digit)');
    eq('noun: ten frame counter', markName({ label: 'ten frame: 7', cls: '' }, { mark: 'circle' }), 'counter (ten frame)');
    // D1 (critic sis-r2): a ring is its own mark - never paired with print dots, named "ring", matched with a print ring
    const dotsOnly = [{ sig: '12,4', kind: 'array', groups: [{ mark: 'circle', n: 12, sizeMm: 2 }] }];
    eq('ring vs dots only, same item and count: no ref (SIZE-REF)', matchRef({ sig: '12,4', kind: 'svg' }, { mark: 'circle.ring', n: 12 }, dotsOnly), null);
    eq('ring vs dots only, no item: no ref', matchRef({ sig: '', kind: 'array' }, { mark: 'circle.ring', n: 12 }, dotsOnly), null);
    const withRing = dotsOnly.concat([{ sig: '12,4', kind: 'svg', groups: [{ mark: 'circle.ring', n: 12, sizeMm: 3.5 }] }]);
    eq('ring vs print ring: matched', matchRef({ sig: '12,4', kind: 'svg' }, { mark: 'circle.ring', n: 12 }, withRing), { printMm: 3.5, how: 'same item' });
    eq('dot vs print dots and rings of the same count: the dots', matchRef({ sig: '12,4', kind: 'other' }, { mark: 'circle', n: 12 }, withRing.slice().reverse()), { printMm: 2, how: 'same item' });
    eq('noun: ring', markName({ label: '', cls: '' }, { mark: 'circle.ring' }), 'ring');
    eq('noun: array ring', markName({ label: 'array, 3 rows of 4', cls: '' }, { mark: 'circle.ring' }), 'ring (array)');
    eq('noun: touch ring', markName({ label: '', cls: 'ws-td-svg', glyph: true }, { mark: 'circle.ring' }), 'touch ring (digit)');
    // D3: a support drawing with no picture name of its own takes its support's picture; never a bare "dot"
    eq('noun: add_facts frame support', markName({ label: '', cls: '' }, { mark: 'circle' }, 'frame'), 'counter (ten frame)');
    eq('noun: add_facts tile support', markName({ label: '', cls: '' }, { mark: 'circle' }, 'tile'), 'dot (dot tile)');
    eq('noun: own picture wins over the support', markName({ label: 'array, 2 rows of 3', cls: '' }, { mark: 'circle' }, 'tile'), 'dot (array)');
    eq('noun: unknown support', markName({ label: '', cls: '' }, { mark: 'circle' }, 'zzz'), 'dot (picture)');
    eq('drawing: support picture', drawingName({ label: '', cls: '', groups: [{ mark: 'circle' }] }, 'frame'), 'ten frame');
    const bare = [];
    for (const sup of ['array', 'frame', 'tile', 'skip', 'base10', 'fives', 'zzz']) for (const label of labels) for (const mark of marks) {
        const nm = markName({ label, cls: '', glyph: false }, { mark }, sup);
        if (!/ \((.+)\)$/.test(nm) || !PICTURES.includes(/ \((.+)\)$/.exec(nm)[1])) bare.push(`${sup}: ${nm}`);
    }
    eq('every support mark name carries a listed picture', bare.slice(0, 5), []);
    // D2: a pinned finding prints "pinned", one over the pin "OVER  "; totals count the keys judged here only
    const fa = f(90); const fb = f(50, 'counter (ten frame)');
    const lines = findingLines([fa, fb], judgePin(pin, [fa, fb]));
    eq('lines: pinned / OVER prefixes', lines.map((l) => l.slice(0, 6)), ['pinned', 'OVER  ']);
    eq('lines: no pin -> every line OVER', findingLines([fa], null).map((l) => l.slice(0, 6)), ['OVER  ']);
    const pin2 = Object.assign({}, pin, { 'x:y {defaults} card 390px|SIZE-INK|dot (array)|1.5-2.5 mm': { n: 7, worst: 80 } });
    eq('totals: the keys judged here only', pinScope(pin2, new Set(['a:b {defaults} card 390px']), [fa]), { keys: 1, findings: 2, cleared: 0 });
    eq('totals: a judged key with no finding now is clear', pinScope(pin2, new Set(['a:b {defaults} card 390px', 'x:y {defaults} card 390px']), [fa]), { keys: 2, findings: 9, cleared: 1 });
    // D5: the committed sweep report agrees with the committed pin (totals and every key's row)
    const sweepFile = path.join(ROOT_DIR, 'design/status/lf-checks/screen-ink-size-sweep.md');
    const pinFile = path.join(ROOT_DIR, 'design/audit/baselines/screen-ink-size.json');
    eq('sweep report matches the pin', fs.existsSync(sweepFile) && fs.existsSync(pinFile) ? sweepPinDrift(fs.readFileSync(sweepFile, 'utf8'), JSON.parse(fs.readFileSync(pinFile, 'utf8'))) : ['sweep or pin missing'], []);
    eq('sweep drift caught', sweepPinDrift('**38 keys, 99 findings**', { totals: { keys: 1, findings: 2 }, keys: { 'a|SIZE-INK|dot|b': { n: 2, worst: 90 } } }).length > 0, true);
    // queue 14: a word the Independent page never deals is matched with the print cell of the item the host DEALT
    const vocabPage = [{ sig: '', kind: 'picture', groups: [{ mark: 'circle', n: 12, sizeMm: 2.7 }] }];
    const dealtCells = [{ sig: '', dealt: 'w1', kind: 'picture', groups: [{ mark: 'path', n: 3, sizeMm: 5 }] }, { sig: '', dealt: 'w2', kind: 'picture', groups: [{ mark: 'path', n: 3, sizeMm: 9 }] }];
    eq('dealt: no page counterpart, no dealt cell -> SIZE-REF', matchRef({ sig: '', kind: 'picture' }, { mark: 'path', n: 3 }, vocabPage), null);
    eq('dealt: its own dealt cell', matchRef({ sig: '', dealt: 'w1', kind: 'picture' }, { mark: 'path', n: 3 }, vocabPage, dealtCells), { printMm: 5, how: 'same item, dealt cell' });
    eq('dealt: never another item\'s dealt cell', matchRef({ sig: '', dealt: 'w3', kind: 'picture' }, { mark: 'path', n: 3 }, vocabPage, dealtCells), null);
    eq('dealt: the page same item still wins', matchRef({ sig: '6,2', dealt: 'w1', kind: 'array' }, { mark: 'circle', n: 6 }, prints, dealtCells), { printMm: 4, how: 'same item' });
    // queue 15: a pattern term is judged by its unit, never its width
    eq('term: by label', isTermDrawing({ label: 'Term 1: 3 dots' }), true);
    eq('term: by flag', isTermDrawing({ label: '', term: true }), true);
    eq('term: an array is not a term', isTermDrawing({ label: 'array, 3 rows of 4', cls: 'ws-factcue-svg' }), false);
    eq('term: "determine" is not a term', isTermDrawing({ label: 'determine the rule', cls: 'determine' }), false);
    eq('term: picture name', markName({ label: 'Term 2: 5 dots', cls: '' }, { mark: 'circle.ring' }), 'ring (pattern term)');
    // queue 16 / 17: TEXT-SIZE floors
    eq('digit floors from ws-screen-slots', [390, 820, 1280].map((w) => digitFloorPx(w)), [40, 48, 56]);
    eq('count row on a phone: TY-10b 29 px', digitFloorPx(390, { countRow: true }), 29);
    eq('count row at 820: the card floor', digitFloorPx(820, { countRow: true }), 48);
    eq('the online worksheet: the SP table 29 px', digitFloorPx(1280, { host: 'worksheet' }), 29);
    const work = 22 * 96 / 72;
    eq('a working digit (print 22 pt) -> digit floor', textFloor({ numeric: true, printPx: work, workPx: work, width: 1280 }), { role: 'digit text', floor: 56 });
    eq('a numeral inside a picture -> label', textFloor({ numeric: true, printPx: work, workPx: work, width: 1280, inSvg: true }).role, 'label text');
    eq('a small numeral (print 10 pt) -> label at print size', textFloor({ numeric: true, printPx: 10 * 96 / 72, workPx: work, width: 390 }), { role: 'label text', floor: 12.67 });
    eq('a label with no print run -> 8 pt floor', textFloor({ numeric: false, printPx: NaN, workPx: work, width: 390 }), { role: 'label text', floor: 10.67 });
    // G9 (lf-algebra critic r2): "Term 1" at 8.3 pt on the quiz, 11 pt on paper -> FAIL; at 11 pt -> holds
    const g9 = textFloor({ numeric: false, printPx: 11 * 96 / 72, workPx: work, width: 1280 });
    eq('G9 quiz label 8.3 pt fails', !!textFinding(g9.role, 'Term 1', 11.0, g9.floor, 11 * 96 / 72), true);
    eq('G9 label at print size holds', textFinding(g9.role, 'Term 1', 14.7, g9.floor, 11 * 96 / 72), null);
    // G1 (lf-algebra critic r2 via lf-ops): count-row digits 20 px on the 390 card fail TY-10b's 29 px
    const g1 = textFloor({ numeric: true, printPx: work, workPx: work, width: 390, countRow: true });
    eq('G1 count-row 20 px at 390 fails', !!textFinding(g1.role, '12', 20, g1.floor, work), true);
    eq('G1 count-row 29 px at 390 holds', textFinding(g1.role, '12', 29, g1.floor, work), null);
    eq('text buckets', [textBucket('digit text', 40), textBucket('label text', 10.67), textBucket('label text', 13.9), textBucket('label text', 15), textBucket('label text', 22)], ['digit floor 40 px', 'label 8 pt floor', 'label print under 11 pt', 'label print 11-15 pt', 'label print 15 pt+']);
    // CELL-READ (lf-hosts): a host that read 0 cells is a finding, never a pass
    eq('CELL-READ host not rendered', /rendered nothing/.test(cellReadError('quiz', '#quizTakeView .mq-qtpaper', null)), true);
    eq('CELL-READ root missing', /no #questionCard/.test(cellReadError('card', '#questionCard', { error: 'no #questionCard' })), true);
    eq('CELL-READ card with 0 cells', /0 \[data-ws-cell\] cells/.test(cellReadError('card', '#questionCard', { cells: 0 })), true);
    eq('CELL-READ quiz with 0 cells', /quiz host/.test(cellReadError('quiz', '.mq-qtpaper', { cells: 0 })), true);
    eq('CELL-READ worksheet of 0 cards', /0 cards/.test(cellReadError('worksheet', '.mq-wspaper', { cells: 0, cards: 0, cardsWithout: 0 })), true);
    eq('CELL-READ worksheet card without a cell', /1 of 4/.test(cellReadError('worksheet', '.mq-wspaper', { cells: 3, cards: 4, cardsWithout: 1 })), true);
    eq('CELL-READ card with 1 cell reads', cellReadError('card', '#questionCard', { cells: 1 }), '');
    eq('CELL-READ worksheet every card read', cellReadError('worksheet', '.mq-wspaper', { cells: 4, cards: 4, cardsWithout: 0 }), '');
    for (const b of bad) console.log('  ' + b);
    console.log(`${NAME} --self-test: ${n - bad.length}/${n}`);
    console.log(`${NAME}: ${bad.length ? 'FAIL' : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
}
if (require.main === module && has('self-test')) selfTest();

/* ------------------------------------------------------------------ in the page */

// Run in the page: every drawing (svg with repeated marks, or the parent of repeated HTML marks) under `scope`, with its
// cell, its mark groups (mark, count, median smaller side in mm), its INK extent, its free width and its item's signature.
// CELL-READ, in the page: the visible [data-ws-cell] cells at or under `scope`; on the worksheet also its cards
// (#ws_card_N) and how many of them hold no visible [data-ws-cell].
function cellCountInPage({ scope, host }) {
    const roots = [...document.querySelectorAll(scope)];
    if (!roots.length) return { error: `no ${scope}` };
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
    const cellsIn = (el) => [el, ...el.querySelectorAll('[data-ws-cell]')].filter((e) => e.hasAttribute('data-ws-cell') && vis(e)).length;
    const cells = roots.reduce((a, r) => a + cellsIn(r), 0);
    if (host !== 'worksheet') return { cells };
    const cards = [...document.querySelectorAll('#worksheetView [id^="ws_card_"]')].filter(vis);
    return { cells, cards: cards.length, cardsWithout: cards.filter((c) => !cellsIn(c)).length };
}

function readDrawingsInPage({ scope, cellSel, withText = false }) {
    const MM = 96 / 25.4;
    const roots = [...document.querySelectorAll(scope)];
    if (!roots.length) return { error: `no ${scope}` };
    const visible = (e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
    const med = (xs) => { const a = xs.slice().sort((p, q) => p - q); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
    const clear = (c) => !c || c === 'none' || /rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c) || /^rgb\(255, 255, 255\)$/.test(c);
    const kindOf = (el) => {
        const lab = (el.getAttribute('aria-label') || '').replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
        if (lab) return lab.split(',')[0].trim();
        const cls = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)[0] || el.tagName.toLowerCase();
        // an unlabelled picture takes the object its item names ("3 and 4 fish" -> fish): a fish is compared with a fish
        let ctx = el.parentElement && el.parentElement.closest('[aria-label]');
        while (ctx && !/\d/.test(ctx.getAttribute('aria-label') || '')) ctx = ctx.parentElement && ctx.parentElement.closest('[aria-label]');   // an item's label holds its numbers
        const noun = ctx ? (ctx.getAttribute('aria-label') || '').toLowerCase().replace(/\d+/g, ' ').split(/[^a-z]+/).filter((w) => w && !/^(and|plus|minus|times|divided|by|equals|is|of|the|a|answer)$/.test(w)).join(' ') : '';
        return noun ? `${cls} (${noun})` : cls;
    };
    // an SVG shape drawn as a ring (no fill, a dark stroke) is its own mark kind beside the solid dots
    const ringOf = (m) => { if (!(m instanceof SVGElement)) return false; const cs = getComputedStyle(m); return clear(cs.fill) && !clear(cs.stroke) && parseFloat(cs.strokeWidth) > 0; };
    const markKey = (m) => `${m.tagName.toLowerCase()}${(m.getAttribute('class') || '').split(/\s+/).filter(Boolean).slice(0, 1).map((c) => '.' + c).join('')}${ringOf(m) ? '.ring' : ''}`;
    // groups of >= 3 like marks (same key, size within 20 % of the key's median); the frame (one big rect) never qualifies
    const groupsOf = (marks, minN = 3) => {
        const by = {};
        for (const m of marks) {
            if (!visible(m)) continue;
            const r = m.getBoundingClientRect();
            const s = Math.min(r.width, r.height);
            if (!(s > 0.5)) continue;
            (by[markKey(m)] = by[markKey(m)] || []).push({ s, w: r.width, h: r.height, at: `${Math.round(r.left + r.width / 2)},${Math.round(r.top + r.height / 2)}` });
        }
        const out = [];
        for (const k of Object.keys(by)) {
            const xs = by[k]; const m0 = med(xs.map((x) => x.s));
            const like = xs.filter((x) => Math.abs(x.s - m0) <= 0.2 * m0 && Math.abs(Math.max(x.w, x.h) - med(xs.map((y) => Math.max(y.w, y.h)))) <= 0.2 * Math.max(x.w, x.h));
            // >= 3 marks at >= 3 DISTINCT places (a picture's detail stacked on one spot - three eyes drawn at one point - is not a set of marks)
            if (like.length >= minN && new Set(like.map((x) => x.at)).size >= minN) out.push({ mark: k, n: like.length, sizeMm: +(med(like.map((x) => x.s)) / MM).toFixed(3) });
        }
        return out;
    };
    // D1: a drawing's extent is the union of its PAINTED shapes (a fill or a stroke that is not clear), not its box
    const union = (els) => {
        let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        for (const e of els) { const q = e.getBoundingClientRect(); if (!(q.width > 0 || q.height > 0)) continue; l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
        return l < Infinity ? { left: l, top: t, right: r, bottom: b, width: r - l, height: b - t } : null;
    };
    const painted = (e) => {
        if (!visible(e)) return false;
        if (/^(text|image)$/i.test(e.tagName)) return true;
        const cs = getComputedStyle(e);
        return !clear(cs.fill) || (!clear(cs.stroke) && parseFloat(cs.strokeWidth) > 0);
    };
    // D4: a block holds ink when it, or anything in it, shows text, a control, a picture, a fill or a border
    const inked = (e, depth = 0) => {
        if (!visible(e) || depth > 12) return false;
        if (/^(svg|img|canvas|input|textarea|select|button|video)$/i.test(e.tagName)) return true;
        const cs = getComputedStyle(e);
        if (!clear(cs.backgroundColor) || (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') || (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none')) return true;
        for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
        return [...e.children].some((c) => inked(c, depth + 1));
    };
    // D2: an item's signature, the numbers of its fact (the cell's text outside its drawings and its number tab [data-ws-label])
    const sigOf = (el, cell) => {
        const own = el.closest('[data-mq-item]');
        if (own) return 'id:' + own.getAttribute('data-mq-item');
        if (!cell) return '';
        const body = cell.querySelector('.ws-cell-body') || cell;
        const nums = []; const walk = (n) => {
            for (const c of n.childNodes) {
                if (c.nodeType === 3) { const m = c.textContent.match(/\d+(?:[.,]\d+)?/g); if (m) nums.push(...m); }
                else if (c.nodeType === 1 && !/^(svg|script|style|button|input)$/i.test(c.tagName) && !c.hasAttribute('data-ws-label')) walk(c);
            }
        };
        walk(body);
        // a fact the card writes twice (shown, and again for a screen reader) is one fact
        const h = nums.length >> 1;
        if (nums.length && nums.length % 2 === 0 && nums.slice(0, h).join(',') === nums.slice(h).join(',')) nums.length = h;
        return nums.join(',');
    };
    const drawings = [];
    for (const rt of roots) {
        // SVG drawings: the outermost svg (a nested svg is part of its parent's picture)
        for (const svg of rt.querySelectorAll('svg')) {
            if (svg.parentElement && svg.parentElement.closest('svg') || !visible(svg)) continue;
            // only INK marks: a white (or unfilled) shape with no dark stroke - the touch numeral's halo / keyline - is not a
            // mark (lf-ops 2026-11-13: pooling the halos read the touch dots at 1.64 mm when the ink dots are larger than paper)
            // queue 15: a pattern TERM (one term of a growing sequence) is sized by its unit, even with one or two marks
            const term = /^\s*term\b/i.test(svg.getAttribute('aria-label') || '') || !!svg.closest('[data-ws-term], .mq-gp-term');
            const g = groupsOf([...svg.querySelectorAll('circle, ellipse, rect, use, path, polygon')].filter((m) => m.tagName.toLowerCase() === 'use' || painted(m)), term ? 1 : 3);
            if (g.length) drawings.push({ el: svg, term, kind: svg.hasAttribute('data-digit') ? `digit ${svg.getAttribute('data-digit')}` : kindOf(svg), groups: g, glyph: svg.hasAttribute('data-digit'), ink: union([...svg.querySelectorAll('circle, ellipse, rect, path, polygon, polyline, line, use, text, image')].filter(painted)) });
        }
        // HTML marks: leaf elements with no text, a fill or a border, grouped under their parent by class
        const parents = new Map();
        for (const e of rt.querySelectorAll('div, span, i, b')) {
            if (e.children.length || e.textContent.trim() || e.closest('svg, input, [data-ws-slot], .mq-slot, button') || !visible(e)) continue;
            const cs = getComputedStyle(e);
            const filled = cs.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor);
            const bordered = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
            if (!filled && !bordered) continue;
            const r = e.getBoundingClientRect();
            if (r.width > 20 * MM || r.height > 20 * MM) continue;
            const p = e.parentElement; if (!parents.has(p)) parents.set(p, []); parents.get(p).push(e);
        }
        for (const [p, kids] of parents) {
            if (kids.length < 3 || p.closest('svg')) continue;
            const g = groupsOf(kids);
            if (g.length) drawings.push({ el: p, kind: kindOf(p), groups: g, ink: union(kids) });
        }
    }
    const out = [];
    for (const d of drawings) {
        const cell = d.el.closest(cellSel);
        const r = d.ink || d.el.getBoundingClientRect();
        let freeMm = null, cellMm = null;
        if (cell) {
            const cr = cell.getBoundingClientRect(); const cs = getComputedStyle(cell);
            const contentW = cr.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth);
            // every INKED block beside the drawing's chain (vertical overlap, no horizontal overlap), level by level up to the cell
            let beside = 0;
            for (let node = d.el; node && node !== cell; node = node.parentElement) {
                const nr = node.getBoundingClientRect();
                const par = node.parentElement; if (!par) break;
                for (const sib of par.children) {
                    if (sib === node || !visible(sib) || !inked(sib)) continue;
                    const sr = sib.getBoundingClientRect();
                    const vOver = Math.min(sr.bottom, nr.bottom) - Math.max(sr.top, nr.top);
                    const hOver = Math.min(sr.right, nr.right) - Math.max(sr.left, nr.left);
                    if (vOver > 0.3 * Math.min(sr.height, nr.height) && hOver <= 1) beside += sr.width;
                }
            }
            cellMm = +(contentW / MM).toFixed(1);
            freeMm = +(Math.max(0, contentW - beside) / MM).toFixed(1);
        }
        const lab = cell && cell.querySelector('[aria-label]:not(svg)');
        const item = lab ? lab.getAttribute('aria-label') : '';
        out.push({ kind: d.kind, label: (d.el.getAttribute('aria-label') || '').slice(0, 80), cls: String(d.el.getAttribute('class') || ''), groups: d.groups,
            wMm: +(r.width / MM).toFixed(1), hMm: +(r.height / MM).toFixed(1), cellMm, freeMm, sig: sigOf(d.el, cell), item: (item || '').slice(0, 40),
            hasCell: !!cell, glyph: !!d.glyph, term: !!d.term, dealt: (d.el.closest('[data-mq-dealt]') || { getAttribute: () => '' }).getAttribute('data-mq-dealt') || '', screenOnly: !!d.el.closest('[data-mq-screen-only]') });
    }
    if (!withText) return { drawings: out };
    // TEXT-SIZE (queue 16 / 17): every text run and answer slot in a cell, at its RENDERED size (font-size x the scale of
    // every transform above it: an SVG's CTM, a CSS scale on a host), with its cell's item signature
    const scaleOf = (el) => {
        if (el instanceof SVGElement && el.getScreenCTM) { const m = el.getScreenCTM(); return m ? Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) : 1; }
        const r = el.getBoundingClientRect(); const big = el.offsetWidth >= el.offsetHeight;
        const k = big ? (el.offsetWidth > 0 ? r.width / el.offsetWidth : 1) : (el.offsetHeight > 0 ? r.height / el.offsetHeight : 1);
        return Math.abs(k - 1) < 0.06 ? 1 : k;
    };
    const EXCL = '.ws-tab, [data-ws-label], .ws-letter, .mq-instr, .mq-tn-count, [data-mq-screen-only], button, script, style, title, desc, .pv-tracks tr:first-child';
    const texts = []; const seen = new Set();
    const allCells = [...document.querySelectorAll(cellSel)];
    for (const rt of roots) {
        const w = document.createTreeWalker(rt, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
            const t = n.nodeValue.replace(/\s+/g, ' ').trim(); const el = n.parentElement;
            if (!t || !/[A-Za-z0-9]/.test(t) || !el || seen.has(el)) continue;
            const cell = el.closest(cellSel); if (!cell || el.closest(EXCL)) continue;
            const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
            if (!el.getClientRects().length || r.width <= 2 || r.height <= 2 || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
            seen.add(el);
            const own = [...el.childNodes].filter((c) => c.nodeType === 3).map((c) => c.nodeValue).join(' ').replace(/\s+/g, ' ').trim();
            texts.push({ text: own.slice(0, 40), px: +(parseFloat(cs.fontSize) * scaleOf(el)).toFixed(2), numeric: /\d/.test(own) && !/[A-Za-z]/.test(own), inSvg: !!el.closest('svg'),
                countRow: !!el.closest('[data-ws-cell="count-row"], .k2-countrow') && !el.closest('.k2-timeslbl, .k2-steptab, .k2-rule, .k2-rulebox, .k2-swipe-cues'), sig: sigOf(el, cell), cellKey: allCells.indexOf(cell),
                item: ((cell.querySelector('[aria-label]:not(svg)') || { getAttribute: () => '' }).getAttribute('aria-label') || '').slice(0, 40) });
        }
    }
    return { drawings: out, texts };
}

/* ------------------------------------------------------------------ judging a host's drawings */

function judgeHost({ where, detail, drawings, prints, dealt = [], F, notes, support = '' }) {
    for (const d of drawings) {
        const at = `${detail || ''}${d.item ? ` [${d.item}]` : d.sig ? ` [${d.sig}]` : ''}`;
        for (const g of d.groups) {
            const name = markName(d, g, support);
            if (d.screenOnly) { notes.add(`${where}: ${name} is marked screen-only (not compared)`); continue; }
            const m = matchRef(d, g, prints, dealt);
            if (!m) { F({ rule: 'SIZE-REF', where, at, name, bucket: '-', pct: 0, msg: `${name}: ${g.n} marks of ${g.sizeMm.toFixed(2)} mm have no print counterpart (no same item, no print drawing of the same marks and count)` }); continue; }
            const f = inkFinding(name, g.sizeMm, m.printMm);
            if (f) F({ rule: 'SIZE-INK', where, at, name, bucket: inkBucket(m.printMm), pct: Math.round(g.sizeMm / m.printMm * 100), msg: `${f} [print: ${m.how}]` });
        }
        // queue 15: a pattern term is as wide as its maths (a one-dot column is taller than wide): its unit size is judged above
        if (d.hasCell && !d.glyph && !isTermDrawing(d)) {
            const name = drawingName(d, support);
            const f = widthFinding(name, d.wMm, d.hMm, d.freeMm);
            if (f) F({ rule: 'SIZE-WIDTH', where, at, name, bucket: widthBucket(d.wMm, d.hMm), pct: Math.round(d.wMm / d.freeMm * 100), msg: `${f} (cell content ${d.cellMm} mm)` });
        }
    }
}

const WORK_DIGIT_PT = { S: 16, M: 22, L: 28 };   // WORKSHEET_DESIGN_STANDARD type table: working digits

/** TEXT-SIZE (queue 16 / 17): every label and non-slot text run of a screen cell against its floor (textFloor). One finding per
 *  cell and role (its worst run). The cell's largest numeral is ws-screen-slots SCREEN-DIGIT's and is not judged twice. */
function judgeText({ where, detail, texts, printTexts, F, width, size = 'M', host = 'card' }) {
    const workPx = WORK_DIGIT_PT[size] * 96 / 72;
    // a run's print counterpart: the same text, in or out of a picture alike, in the SAME item; a word may also match the same
    // word anywhere on the page, a numeral never (a "7" on a skip strip is not the fact's operand 7)
    const bySig = new Map(); const byText = new Map();
    const pk = (t) => `${t.text}|${t.inSvg ? 'svg' : 'html'}`;
    for (const t of printTexts || []) {
        const k1 = `${t.sig}|${pk(t)}`; (bySig.get(k1) || bySig.set(k1, []).get(k1)).push(t.px);
        if (!t.numeric) (byText.get(pk(t)) || byText.set(pk(t), []).get(pk(t))).push(t.px);
    }
    const cells = new Map();
    for (const t of texts || []) (cells.get(t.cellKey) || cells.set(t.cellKey, []).get(t.cellKey)).push(t);
    for (const runs of cells.values()) {
        const nums = runs.filter((t) => t.numeric);
        const top = nums.length ? nums.reduce((a, b) => (b.px > a.px ? b : a)) : null;
        const worst = {};
        for (const t of runs) {
            if (t === top) continue;
            const printPx = median((t.sig && bySig.get(`${t.sig}|${pk(t)}`)) || (!t.numeric && byText.get(pk(t))) || []);
            const { role, floor } = textFloor({ numeric: t.numeric, printPx, workPx, width, countRow: t.countRow, inSvg: t.inSvg, host });
            const msg = textFinding(role, t.text, t.px, floor, printPx);
            if (msg && (!worst[role] || t.px / floor < worst[role].pct / 100)) worst[role] = { msg, floor, pct: Math.round(t.px / floor * 100), t };
        }
        for (const role of Object.keys(worst)) {
            const w = worst[role];
            F({ rule: 'TEXT-SIZE', where, at: `${detail || ''}${w.t.item ? ` [${w.t.item}]` : w.t.sig ? ` [${w.t.sig}]` : ''}`, name: role, bucket: textBucket(role, w.floor), pct: w.pct, msg: w.msg });
        }
    }
}

/* ------------------------------------------------------------------ the run */

function passedIds() {
    const src = fs.readFileSync(path.join(process.env.MQ_ROOT || ROOT_DIR, 'js/modules/redesign-passed.js'), 'utf8');
    return [...new Set([...src.matchAll(/^\s*'([a-z0-9_]+:[a-z0-9_]+)',?\s*$/gim)].map((m) => m[1]))];
}
function headOf(dir) {
    try { return require('child_process').execSync('git rev-parse --short=8 HEAD', { cwd: dir, encoding: 'utf8' }).trim(); } catch (e) { return '?'; }
}

/** D7: the sweep report, from a run's findings and the pin it wrote or read. */
function sweepReport({ skills, findings, notes, renders, secs, pinFile, pin, servedAt }) {
    const keys = Object.keys(pin);
    const total = keys.reduce((a, k) => a + pin[k].n, 0);
    const pre = fs.readFileSync(path.join(ROOT_DIR, 'tests/scripts/ws-precritic.cjs'), 'utf8');
    const dep = fs.readFileSync(path.join(ROOT_DIR, 'tests/scripts/ws-deploy-gates.sh'), 'utf8');
    const wired = [/gate\('screen-ink-size'/.test(pre) ? '`ws-precritic --skill` plans it (gate `screen-ink-size`, the default pin)' : 'NOT on ws-precritic',
        /ws-screen-ink-size\.cjs --passed/.test(dep) ? '`ws-deploy-gates.sh` runs `--passed`' : 'NOT in ws-deploy-gates.sh'];
    const hit = {};
    for (const x of findings) { const s = x.where.split(' ')[0]; (hit[x.rule] = hit[x.rule] || new Set()).add(s); }
    const L = [];
    L.push('# SCREEN-INK-SIZE sweep: every redesign-passed skill (lane lf-checks)', '');
    L.push(`Generated by \`node tests/scripts/ws-screen-ink-size.cjs --passed --sweep <this file>\` on ${new Date().toISOString().slice(0, 10)}. Do not hand-edit.`, '');
    L.push(`- **Commit:** ${servedAt} (the tree served and judged).`);
    L.push(`- **Pin:** \`${pinFile}\`: **${keys.length} keys, ${total} findings** (key = skill {option} host width | rule | mark name | size bucket; each holds its count and worst %).`);
    L.push(`- **Wiring:** ${wired.join('; ')}.`);
    L.push(`- **Scope:** ${skills.length} skills, each with its defaults and every value of its supports-model \`support\` option; card 390 / 820 / 1280 (print items 0-2), worksheet 1280, quiz 1280 (print items 0-1): ${renders} renders, ${secs} s.`);
    L.push(`- **Result:** ${findings.length} findings on ${new Set(findings.map((x) => x.where.split(' ')[0])).size} skills. Nothing was fixed (report only).`, '');
    L.push('Rules: SIZE-INK (a mark >= 95 % of the same item\'s print size; a worksheet item also matched with the print cell of the item it dealt; a pattern term by its unit), SIZE-REF (a mark with no print counterpart), SIZE-WIDTH (ink width < 60 % of the free width and taller than wide; pattern terms exempt), TEXT-SIZE (a label >= its print size and >= 8 pt; non-slot digit text >= the digit floor: card / quiz 40 / 48 / 56 px, worksheet 29 px, count row on a phone 29 px).', '');
    L.push('## Skills hit, per rule', '', '| Rule | Skills |', '|---|---|');
    for (const r of Object.keys(hit).sort()) L.push(`| ${r} | ${[...hit[r]].sort().join(', ')} |`);
    L.push('', '## Every pin key', '', '"n" counts the screen cells (card items 0-2, worksheet cards, quiz questions); "worst" is the lowest screen / print % (SIZE-INK) or ink / free width % (SIZE-WIDTH).', '');
    L.push('| Skill {option} | Host | Rule | Mark | Bucket | n | worst | Example |', '|---|---|---|---|---|---|---|---|');
    for (const k of keys.sort()) {
        const [where, rule, name, bucket] = k.split('|');
        const m = /^(\S+ \{[^}]*\}) (.*)$/.exec(where) || [null, where, ''];
        const ex = findings.find((x) => pinKey(x) === k);
        L.push(`| ${m[1]} | ${m[2]} | ${rule} | ${name} | ${bucket} | ${pin[k].n} | ${pin[k].worst} % | ${ex ? ex.msg.replace(/^[^:]+: /, '').replace(/\|/g, '/') : ''} |`);
    }
    const refs = [...notes].filter((n) => /: print /.test(n));
    if (refs.length) { L.push('', '## Print reference sizes (Independent page at M)', ''); for (const n of refs) L.push(`- ${n}`); }
    return L.join('\n') + '\n';
}

async function main() {
    const { open } = require('../lib/ws-harness.cjs');
    const ONLY = arg('only', null) ? arg('only').split(',').map((s) => s.trim().toUpperCase()) : null;
    const findings = []; const notes = new Set(); let renders = 0; const visited = new Set();
    const F = (x) => { if (!ONLY || ONLY.includes(x.rule)) findings.push(x); };
    const SEED = parseInt(arg('seed', '7'), 10);
    const SIZE = arg('size', 'M');
    const HOSTS = arg('hosts', 'card,worksheet,quiz').split(',').map((s) => s.trim()).filter(Boolean);
    const WIDTHS = arg('widths', null) ? arg('widths').split(',').map(Number) : null;
    const hostWidths = { card: [390, 820, 1280], worksheet: [1280], quiz: [1280] };
    const SKILLS = has('passed') ? passedIds() : (arg('skill', '') || arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
    const HTML = arg('html', null);
    if (!HTML && !SKILLS.length) { console.error('usage: --skill cat:skill[,...] | --passed | --html file | --self-test'); process.exit(2); }
    const app = await open({ seed: 1 });
    const { page } = app;
    const T0 = Date.now();
    try {
        if (HTML) {
            // a fixture: paper cells under [data-mq-print], screen cells under [data-mq-screen], in one document
            await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
            await page.setContent(fs.readFileSync(path.resolve(process.cwd(), HTML), 'utf8'), { waitUntil: 'load' });
            // (queue 14: [data-mq-print-dealt] holds the print cells of the items the screen dealt, each [data-mq-dealt="id"]
            // as on the screen cell; queue 16 / 17: --width W judges TEXT-SIZE at that host width)
            const FW = parseInt(arg('width', '1280'), 10);
            const pr = await page.evaluate(readDrawingsInPage, { scope: '[data-mq-print]', cellSel: '[data-ws-cell]', withText: true });
            const hasDealt = await page.evaluate(() => !!document.querySelector('[data-mq-print-dealt]'));
            const dl = hasDealt ? await page.evaluate(readDrawingsInPage, { scope: '[data-mq-print-dealt]', cellSel: '[data-ws-cell]' }) : { drawings: [] };
            const sc = await page.evaluate(readDrawingsInPage, { scope: '[data-mq-screen]', cellSel: '[data-ws-cell], .mq-scell', withText: true });
            if (pr.error || sc.error || dl.error) throw new Error(pr.error || sc.error || dl.error);
            renders += 2;
            if (!sc.drawings.length && !sc.texts.length) F({ rule: 'SIZE-READ', where: path.basename(HTML), at: '', name: '-', bucket: '-', pct: 0, msg: 'no screen drawing or text read' });
            visited.add(path.basename(HTML));
            judgeHost({ where: path.basename(HTML), detail: '', drawings: sc.drawings, prints: pr.drawings, dealt: dl.drawings, F, notes });
            judgeText({ where: path.basename(HTML), detail: '', texts: sc.texts, printTexts: pr.texts, F, width: FW, size: SIZE });
        }
        for (const key of SKILLS) {
            const [cat, skill] = key.split(':');
            let variants;
            if (arg('opts', null)) variants = [{ tag: 'opts', opts: JSON.parse(arg('opts')) }];
            else {
                const def = await page.evaluate(({ cat, skill }) => {
                    try {
                        const d = (window.offeredOptionsFor(cat, skill) || []).find((x) => x.id === 'support' && x.supportsModel);
                        return d ? { render: d.render || [], base: d.valueBase || {} } : null;
                    } catch (e) { return null; }
                }, { cat, skill });
                variants = [{ tag: 'defaults', opts: null }];
                if (def) for (const v of def.render) variants.push({ tag: `support ${v}`, support: v, opts: Object.assign({ support: [v] }, def.base[v] || {}) });
            }
            for (const v of variants) {
                const tag = `${key} {${v.tag}}`;
                // ---- paper: the Independent page at SIZE (item i under seed SEED + i)
                const doc = await page.evaluate(async ({ cat, skill, opts, SIZE, SEED }) => {
                    try {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [Object.assign({ categoryId: cat, skillId: skill }, opts ? { opts } : {})] }], size: SIZE, paper: 'A4', seed: SEED, key: false });
                        return { html: window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' }) };
                    } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                }, { cat, skill, opts: v.opts, SIZE, SEED });
                if (doc.error) { notes.add(`${tag}: paper not composed (${doc.error})`); continue; }
                const sh = await app.browser.newPage();
                let prints = []; let printTexts = [];
                try {
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url(), { waitUntil: 'domcontentloaded' });
                    await sh.setContent(doc.html, { waitUntil: 'networkidle0', timeout: 60000 });
                    await sh.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                    await sh.emulateMediaType('print');
                    const pr = await sh.evaluate(readDrawingsInPage, { scope: 'body', cellSel: '[data-ws-cell]', withText: true });
                    renders++;
                    prints = pr.drawings || []; printTexts = pr.texts || [];
                } finally { await sh.close(); }
                // ---- screen hosts: the card deals print items 0-2, the quiz items 0-1 (the same seed and itemIndex)
                for (const host of HOSTS) for (const w of (hostWidths[host] || []).filter((x) => !WIDTHS || WIDTHS.includes(x))) {
                    await page.setViewport({ width: w, height: w < 500 ? 844 : 900, deviceScaleFactor: 1 });
                    const runs = host === 'card' ? [0, 1, 2] : [0];
                    for (const i of runs) {
                        const scope = await page.evaluate(({ c, k, host, s, i, opts }) => {
                            try {
                                const st = window.state;
                                window.clearSetOptions({ silent: true });
                                if (opts) window.setSetOptions(c, k, opts, { silent: true });
                                const item = (sd, ix) => window.generateQuestionFor(Object.assign({ category: c, skill: k, seed: sd, itemIndex: ix }, opts ? { opts } : {}));
                                if (host === 'card') { st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false; window.showView('gameView'); st.currentQ = item(s + i, i); window.renderQuestion(); return '#questionCard'; }
                                if (host === 'worksheet') { if (window.__wsReseed) window.__wsReseed(4242 + s); st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 4; window.initWorksheet();
                                    // queue 14: the worksheet deals its own items; each card names its item for the dealt print cells
                                    window.__sisDealt = (st.worksheetQs || []).map((q, ix) => { const el = document.getElementById(`ws_card_${ix}`); if (el) el.setAttribute('data-mq-dealt', `w${ix}`); return { id: `w${ix}`, q }; });
                                    return '#worksheetView .mq-wspaper'; }
                                if (host === 'quiz') {
                                    const questions = [0, 1].map((ix) => { const q = item(s + ix, ix); return { id: ix, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }; });
                                    const test = { id: null, name: 'Ink', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                                    window.handleQuizURL(window.compressTestForURL(test));
                                    const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input'));
                                    window.startQuizTest(); return '#quizTakeView .mq-qtpaper';
                                }
                                return null;
                            } catch (e) { return 'ERR ' + String((e && e.message) || e).slice(0, 150); }
                        }, { c: cat, k: skill, host, s: SEED, i, opts: v.opts });
                        if (!scope || /^ERR/.test(scope)) {
                            notes.add(`${tag} ${host} ${w}: not rendered (${scope})`);
                            findings.push({ rule: 'CELL-READ', where: `${tag} ${host} ${w}px`, at: host === 'card' ? ` item ${i}` : '', name: 'host', bucket: 'read', pct: 0, msg: `CELL-READ ${cellReadError(host, host, null)}` });
                            continue;
                        }
                        await new Promise((r) => setTimeout(r, 450));
                        if (host === 'worksheet') await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !g || g.dataset.mqLaidOut !== '0'; }, { timeout: 5000 }).catch(() => {});
                        const sc = await page.evaluate(readDrawingsInPage, { scope, cellSel: '[data-ws-cell], .mq-scell, .problem-card', withText: true });
                        renders++;
                        // CELL-READ (lf-hosts): a host that read 0 [data-ws-cell] cells judged nothing - a finding, never a pass
                        const cr = cellReadError(host, scope, await page.evaluate(cellCountInPage, { scope, host }));
                        if (cr) findings.push({ rule: 'CELL-READ', where: `${tag} ${host} ${w}px`, at: host === 'card' ? ` item ${i}` : '', name: 'host', bucket: 'read', pct: 0, msg: `CELL-READ ${cr}` });
                        // queue 14: the print cells of the very items the worksheet dealt (the SAME word / item), drawn by the kit
                        let dealt = [];
                        if (host === 'worksheet' && !sc.error && sc.drawings.length) {
                            const dd = await page.evaluate(async ({ SIZE }) => {
                                try {
                                    // the app's own instance of the kit (its stamped URL), so its providers and templates are the ones registered
                                    const url = (performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/js\/modules\/sheet\/index\.js/.test(n))) || new URL('js/modules/sheet/index.js', location.href).href;
                                    const K = await import(url);
                                    const parts = [];
                                    for (const { id, q } of window.__sisDealt || []) {
                                        try { const h = K.renderCell(q, K.resolveCtx({ mode: 'print', size: SIZE, look: 'ican', state: 'blank' })); if (h) parts.push(`<div data-mq-dealt="${id}" style="width:186mm;margin:0 0 6mm 0;">${h}</div>`); } catch (e) { /* a cell the kit cannot draw alone: page reference only */ }
                                    }
                                    return parts.length ? { html: window.sheetDocument(`<div data-mq-print-dealt>${parts.join('')}</div>`, 'x', { paper: 'A4' }), n: parts.length } : { n: 0 };
                                } catch (e) { return { error: String((e && e.message) || e).slice(0, 200) }; }
                            }, { SIZE });
                            if (dd.error) notes.add(`${tag} worksheet: dealt print cells not drawn (${dd.error})`);
                            else if (dd.html) {
                                const sh2 = await app.browser.newPage();
                                try {
                                    await sh2.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                                    await sh2.goto(page.url(), { waitUntil: 'domcontentloaded' });
                                    await sh2.setContent(dd.html, { waitUntil: 'networkidle0', timeout: 60000 });
                                    await sh2.emulateMediaType('print');
                                    const r2 = await sh2.evaluate(readDrawingsInPage, { scope: 'body', cellSel: '[data-ws-cell]' });
                                    renders++;
                                    dealt = (r2.drawings || []).filter((d) => d.dealt);
                                } finally { await sh2.close(); }
                            }
                        }
                        await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
                        if (sc.error) { notes.add(`${tag} ${host} ${w}: ${sc.error}`); continue; }
                        visited.add(`${tag} ${host} ${w}px`);
                        if (has('dump-text')) for (const t of sc.texts) console.log(`text ${host} ${w} cell ${t.cellKey}: "${t.text}" ${t.px} px${t.numeric ? ' numeric' : ''}${t.inSvg ? ' svg' : ''}${t.countRow ? ' count-row' : ''} sig ${t.sig}`);
                        judgeText({ where: `${tag} ${host} ${w}px`, detail: host === 'card' ? ` item ${i}` : '', texts: sc.texts, printTexts, F, width: w, size: SIZE, host });
                        if (!sc.drawings.length) continue;
                        judgeHost({ where: `${tag} ${host} ${w}px`, detail: host === 'card' ? ` item ${i}` : '', drawings: sc.drawings, prints, dealt, F, notes, support: v.support || '' });
                    }
                }
                const ref = {};
                for (const d of prints) for (const g of d.groups) (ref[markName(d, g, v.support)] = ref[markName(d, g, v.support)] || []).push(g.sizeMm);
                if (Object.keys(ref).length) notes.add(`${tag}: print ${SIZE} ${Object.keys(ref).map((k) => `${k} ${Math.min(...ref[k]).toFixed(2)}${Math.max(...ref[k]) > Math.min(...ref[k]) + 0.005 ? '-' + Math.max(...ref[k]).toFixed(2) : ''} mm`).join(', ')}`);
            }
            await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) { /* ignore */ } });
        }
        if (app.problems.length) notes.add(`console: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } finally { await app.close(); }
    for (const n of notes) console.log(`note: ${n}`);
    const secs = ((Date.now() - T0) / 1000).toFixed(0);
    console.log(`(${SKILLS.length} skill(s)${HTML ? ' + fixture' : ''}, ${renders} renders, ${secs} s)`);
    if (arg('json', null)) fs.writeFileSync(path.resolve(process.cwd(), arg('json')), JSON.stringify({ skills: SKILLS, findings, notes: [...notes], renders }, null, 1));
    const servedAt = headOf(process.env.MQ_ROOT || ROOT_DIR);
    const PIN = HTML || has('no-baseline') ? null : path.resolve(ROOT_DIR, arg('baseline', 'design/audit/baselines/screen-ink-size.json'));
    const cur = pinOf(findings);
    if (arg('write-baseline', null)) {
        const total = Object.values(cur).reduce((a, e) => a + e.n, 0);
        fs.writeFileSync(path.resolve(process.cwd(), arg('write-baseline')), JSON.stringify({ note: 'ws-screen-ink-size pin: per key (skill {option} host width|rule|mark name|size bucket) the count and the WORST % accepted (lead ruling 2026-11-13, keyed per critic sis-r1 D5); a new key, a higher count or a worse % FAILS. The owning lane shrinks it. Re-pin only with a STATUS note.', written: new Date().toISOString().slice(0, 10), commit: servedAt, totals: { keys: Object.keys(cur).length, findings: total }, skills: SKILLS, keys: cur }, null, 1) + '\n');
        console.log(`wrote ${arg('write-baseline')}: ${Object.keys(cur).length} keys, ${total} findings`);
    }
    let judged = findings; let pinUsed = cur; let pinFile = arg('write-baseline', '(none)'); let over = []; let pj = null;
    if (PIN && fs.existsSync(PIN) && !arg('write-baseline', null)) {
        pj = JSON.parse(fs.readFileSync(PIN, 'utf8'));
        over = judgePin(pj.keys || {}, findings);
        const overKeys = new Set(over.map((o) => o.key));
        judged = findings.filter((x) => overKeys.has(pinKey(x)));
        pinUsed = pj.keys || {}; pinFile = path.relative(ROOT_DIR, PIN);
    }
    // D2: a finding over the pin prints "OVER  ", one the pin holds "pinned" (with no pin every finding is over)
    for (const l of findingLines(findings, pj ? over : null)) console.log(l);
    if (pj) {
        for (const o of over) console.log(`  over the pin: ${o.key}: ${o.why}`);
        const sc = pinScope(pj.keys || {}, visited, findings);
        console.log(`(${findings.length - judged.length} finding(s) within the pin ${pinFile}; judged here: ${sc.keys} of its keys, ${sc.findings} pinned findings${sc.cleared ? `, ${sc.cleared} key(s) now clear` : ''})`);
    }
    if (arg('sweep', null)) {
        fs.writeFileSync(path.resolve(process.cwd(), arg('sweep')), sweepReport({ skills: SKILLS, findings, notes, renders, secs, pinFile, pin: pinUsed, servedAt }));
        console.log(`wrote ${arg('sweep')}`);
    }
    const bad = judged.length || (!renders ? 1 : 0);
    console.log(`${NAME}: ${bad ? `FAIL (${judged.length || 'nothing rendered'})` : 'OK'}`);
    process.exit(bad && !has('report-only') ? 1 : 0);
}

if (require.main === module && !has('self-test')) main().catch((e) => { console.error(e); console.log(`${NAME}: FAIL`); process.exit(1); });

module.exports = { cellReadError, median, inkFinding, widthFinding, textFloor, textFinding, textBucket, digitFloorPx, isTermDrawing, matchRef, nounOf, pictureOf, markName, drawingName, pinOf, judgePin, findingLines, pinScope, sweepPinDrift, supportPicture, inkBucket, widthBucket, NOUNS, PICTURES };
