// ws-screen-support-eq — a fact skill's supports on SCREEN are paper's supports (lane lf-ops, critic div_facts screen r1).
//
// Three rules, each judged per support value the skill offers (its `support` option's render values), on the practice
// card (1280, 820, 390), the online worksheet (1280, 820) and the quiz (1280):
//   SCREEN-SUPPORT-EQ    (D1, D2) every screen cell draws the SAME support structure as the paper cell of the same
//                        support: the ÷ array a framed TRUE array (the section frame's size, the item's rows x cols, an
//                        empty frame on 0 ÷ n), the touch tally the same count, the skip strip the same terms, the think
//                        box; a cell that draws nothing where paper draws the support (0 ÷ n) fails.
//   SCREEN-CUE-SIZE      (D3) the text a cue carries (.ws-factcue: skip strip numbers, think box) stands to the fact's digit at
//                        >= 0.9 x paper's ratio (paper's ratio measured on the Independent page at M: about 0.38).
//   SCREEN-SUPPORT-PLACE (D4) on one online worksheet the support stands at ONE place (beside or under the fact) in
//                        every card.
//   ARRAY-ORIENT         (owner 2026-11-13, "arrays landscape so they can be bigger") a ÷ fact's framed array whose item has
//                        2 or more rows (the divisor) is drawn LANDSCAPE: its frame's drawn width >= its height, on every
//                        screen host and on the paper Independent page at S, M and L (0 ÷ n: the empty frame too).
//   ARRAY-DOT-MIN        (same ruling) the screen array dot stands to the fact digit at >= paper's ratio (CUE-SIZE's
//                        convention, paper measured on the Independent page at M): never smaller than the print dot.
//   ARRAY-CAPTION        (facts card §5.10, lead ruling C) an array's caption (its aria-label, what is read out) names the
//                        rows x columns DRAWN (the dots' distinct rows and columns); a × array is drawn the smaller factor's
//                        rows of the larger and its caption names the fact it supports ("3 rows of 7, for 7 × 3").
//   SUPPORT-NOT-SLOT     (critic divarray r1 D1) a support draws no empty closed box the size/shape of the answer slot
//                        (±40 %), and a frame drawn on only some cells of a band (the × zero frame, the lone framed support)
//                        is a finding - on paper and on every screen host. ARRAY-CAPTION also fails "1 rows" for one row.
//   ARRAY-FRAME          (lead ruling 2026-11-13) on an array-support band EVERY fact draws its array or frame: a × fact
//                        with a zero factor (4 × 0, 0 × n) the band's EMPTY frame, as 0 ÷ n does (no dots, never portrait;
//                        r2 ruling: one frame per band, so it is the frame its neighbours draw) - never nothing.
// ARRAY-ORIENT, ARRAY-DOT-MIN and ARRAY-CAPTION judge every dot array a support draws: the ÷ framed array and the × array.
//
//   node tests/scripts/ws-screen-support-eq.cjs                          # division:div_facts
//   node tests/scripts/ws-screen-support-eq.cjs --skills division:div_facts --only EQ,CUE,PLACE,ORIENT,DOTMIN
//   node tests/scripts/ws-screen-support-eq.cjs --self-test             # the pure rules, no browser
// A skill with no supports model is reported "no supports" (nothing to compare). Prints one line per finding, then
// `ws-screen-support-eq: OK` or `FAIL (n)`; exits 1 on FAIL.
const NAME = 'ws-screen-support-eq';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

/* ------------------------------------------------------------------ pure rules */

/** 'beside' | 'under' from the problem's and the support's rects ({top, bottom, left, right}). */
function placeOf(prob, pane) {
    if (!prob || !pane) return null;
    return pane.top >= prob.bottom - 2 ? 'under' : 'beside';
}
/** The support signature a cell's support drawing carries (data read off the DOM, see sigInPage). */
function sigKey(s) {
    if (!s) return 'none';
    if (s.kind === 'frame-array') return `frame-array ${s.frame}`;
    if (s.kind === 'tally') return `tally ${s.n}`;
    if (s.kind === 'skip') return `skip ${s.n}`;
    return s.kind;
}
/** EQ: does a screen item's signature equal paper's, and is the array's content the item's own? */
function eqFinding(id, paper, screen, item) {
    const pk = sigKey(paper), sk = sigKey(screen);
    if (pk !== sk) return `${id}: screen draws "${sk}", paper "${pk}"`;
    if (screen && screen.kind === 'frame-array' && item) {
        // (owner 2026-11-13: landscape - the divisor's rows of the quotient's dots)
        const want = item.a === 0 ? 'no dots' : `array, ${item.b} ${item.b === 1 ? 'row' : 'rows'} of ${item.a / item.b}`;
        if (screen.label !== want) return `${id}: ${item.a} ÷ ${item.b} array "${screen.label}", want "${want}"`;
    }
    return null;
}
/** CUE: the screen ratio (cue text px / fact digit px) against paper's. */
function cueFinding(id, paperRatio, screenRatio) {
    if (!(paperRatio > 0) || !(screenRatio > 0)) return null;
    return screenRatio < 0.9 * paperRatio ? `${id}: cue text ${screenRatio.toFixed(2)} x the fact digit, paper ${paperRatio.toFixed(2)} (needs >= ${(0.9 * paperRatio).toFixed(2)})` : null;
}
/** ORIENT: a framed array of 2 or more rows (the item's divisor) is drawn landscape (width >= height). */
function orientFinding(id, sig, item) {
    if (!sig || !item || !(sig.wPx > 0)) return null;
    // the rows the array must lay across: ÷ the divisor; × the smaller factor (a single row is free)
    const rows = item.op === '×' ? Math.min(item.a, item.b) : item.b;
    if (!(rows >= 2)) return null;
    return sig.wPx + 0.5 < sig.hPx ? `${id}: ${item.a} ${item.op || '÷'} ${item.b} array ${sig.wPx.toFixed(0)} x ${sig.hPx.toFixed(0)} px is portrait (want width >= height)` : null;
}
/** DOTMIN: the screen dot (diameter / fact digit) against paper's. */
function dotFinding(id, paperRatio, screenRatio) {
    if (!(paperRatio > 0) || !(screenRatio > 0)) return null;
    return screenRatio < 0.98 * paperRatio ? `${id}: array dot ${screenRatio.toFixed(3)} x the fact digit, paper ${paperRatio.toFixed(3)} (never smaller than the print dot)` : null;
}
/** CAPTION: the caption's rows x cols against the drawn grid; a × fact's array is min rows of max and names the fact. */
function captionFinding(id, arr, item) {
    if (!arr || !item) return null;
    const m = /(\d+) rows? of (\d+)/.exec(arr.label || '');
    if (!m) return arr.dots ? `${id}: ${item.a} ${item.op} ${item.b} array caption "${arr.label}" names no rows` : null;
    const R = Number(m[1]), C = Number(m[2]);
    if (arr.dots && (R !== arr.rows || C !== arr.cols)) return `${id}: caption "${arr.label}" but ${arr.rows} rows of ${arr.cols} drawn`;
    if (item.op === '×') {
        const lo = Math.min(item.a, item.b);
        const want = `${lo} ${lo === 1 ? 'row' : 'rows'} of ${Math.max(item.a, item.b)}, for ${item.a} × ${item.b}`;
        if (Math.min(item.a, item.b) > 0 && arr.label !== want) return `${id}: ${item.a} × ${item.b} caption "${arr.label}", want "${want}" (the smaller factor's rows, the fact named)`;
    }
    // (critic divarray r1 N1) a one-row array reads out "1 rows of n"; the caption is spoken, so a single row is "1 row of n"
    if (/\b1 rows of \b|\b1 rows of \d/.test(arr.label || '')) return `${id}: caption "${arr.label}" says "1 rows" (one row is "1 row of ...")`;
    return null;
}
/** SUPPORT-NOT-SLOT (critic divarray r1 D1): a support draws no empty closed box the size/shape of the answer slot,
 *  and is not the only framed support in a band whose other supports are unframed. `arr` is the support's drawn box
 *  ({wPx, hPx, dots, framed}); `slot` the cell's graded answer slot ({w, h}). */
function slotLikeFinding(id, arr, slot) {
    if (!arr || !arr.framed || arr.dots > 0 || !slot || !(slot.w > 0) || !(slot.h > 0)) return null;
    const rw = arr.wPx / slot.w, rh = arr.hPx / slot.h;
    // an empty closed box within +/- 40 % of the answer slot in both dimensions reads as a second slot
    if (rw >= 0.6 && rw <= 1.4 && rh >= 0.6 && rh <= 1.4) return `${id}: empty support frame ${arr.wPx.toFixed(0)} x ${arr.hPx.toFixed(0)} px is within +/-40% of the answer slot ${slot.w.toFixed(0)} x ${slot.h.toFixed(0)} (reads as a second answer box)`;
    return null;
}
/** The band rule: among a render's cells that draw an array support, framed and unframed must not coexist (a frame on
 *  only the zero facts is the lone framed support in its band). `framedFlags` is the per-cell `arr.framed` of array cells. */
function bandFrameFinding(id, framedFlags) {
    const f = framedFlags.filter((x) => x !== null && x !== undefined);
    if (f.length < 2) return null;
    const framed = f.filter(Boolean).length, bare = f.length - framed;
    return framed > 0 && bare > 0 ? `${id}: ${framed} framed and ${bare} unframed array support(s) in one band (a frame drawn on only some cells reads as the lone slot-like box)` : null;
}
/** FRAME: an array-support fact cell draws an array or frame; a × zero fact the short empty frame. */
function frameFinding(id, sup, item) {
    if (id !== 'array' || !item) return null;
    const arr = sup && sup.arr;
    if (!arr) return `${id}: ${item.a} ${item.op} ${item.b} draws no array or frame`;
    if (item.op === '×' && (item.a === 0 || item.b === 0)) {
        if (arr.dots) return `${id}: ${item.a} × ${item.b} frame holds ${arr.dots} dots (want the empty frame)`;
        // (lead ruling 2026-11-13, r2: a × 0 fact draws its BAND's empty frame - the frame its neighbours draw, landscape or
        // square - not a short strip of its own; SUPPORT-NOT-SLOT's band rule checks it matches the band)
        if (!(arr.hPx > 0 && arr.hPx <= arr.wPx + 0.5)) return `${id}: ${item.a} × ${item.b} frame ${arr.wPx.toFixed(0)} x ${arr.hPx.toFixed(0)} px is portrait (want the band's landscape frame)`;
    }
    return null;
}
/** PLACE: one place across a worksheet's cards. */
function placeFinding(id, places) {
    const set = [...new Set(places.filter(Boolean))];
    return set.length > 1 ? `${id}: worksheet places ${places.map((p, i) => `${i + 1}:${p}`).join(' ')}` : null;
}

function selfTest() {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('under', placeOf({ top: 0, bottom: 50 }, { top: 60, bottom: 90 }), 'under');
    eq('beside', placeOf({ top: 0, bottom: 50 }, { top: 0, bottom: 90 }), 'beside');
    eq('array same', eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'frame-array', frame: '12.0x34.6', label: 'array, 4 rows of 3' }, { a: 12, b: 4 }), null);
    eq('array loose (D1)', !!eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'pane' }, { a: 12, b: 4 }), true);
    eq('array none on 0 (D2)', !!eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, null, { a: 0, b: 2 }), true);
    eq('array empty frame on 0', eqFinding('array', { kind: 'frame-array', frame: '12.0x34.6' }, { kind: 'frame-array', frame: '12.0x34.6', label: 'no dots' }, { a: 0, b: 2 }), null);
    eq('array wrong rows', !!eqFinding('array', { kind: 'frame-array', frame: 'f' }, { kind: 'frame-array', frame: 'f', label: 'array, 2 rows of 4' }, { a: 12, b: 4 }), true);
    eq('array portrait rows (old)', !!eqFinding('array', { kind: 'frame-array', frame: 'f' }, { kind: 'frame-array', frame: 'f', label: 'array, 3 rows of 4' }, { a: 12, b: 4 }), true);
    eq('orient portrait', !!orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 28, b: 4, op: '÷' }), true);
    eq('orient landscape', orientFinding('array', { kind: 'frame-array', wPx: 160, hPx: 50 }, { a: 28, b: 4 }), null);
    eq('orient empty frame portrait', !!orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 0, b: 3 }), true);
    eq('orient 1 row free', orientFinding('array', { kind: 'frame-array', wPx: 40, hPx: 120 }, { a: 7, b: 1 }), null);
    eq('dot small', !!dotFinding('array', 0.33, 0.15), true);
    eq('dot ok', dotFinding('array', 0.33, 0.40), null);
    eq('caption ok ×', captionFinding('array', { label: '3 rows of 7, for 7 × 3', rows: 3, cols: 7, dots: 21 }, { a: 7, b: 3, op: '×' }), null);
    eq('caption portrait × (old)', !!captionFinding('array', { label: '7 rows of 3', rows: 7, cols: 3, dots: 21 }, { a: 3, b: 7, op: '×' }), true);
    eq('caption lies', !!captionFinding('array', { label: 'array, 4 rows of 7', rows: 7, cols: 4, dots: 28 }, { a: 28, b: 4, op: '÷' }), true);
    eq('caption ÷ ok', captionFinding('array', { label: 'array, 4 rows of 7', rows: 4, cols: 7, dots: 28 }, { a: 28, b: 4, op: '÷' }), null);
    eq('tally count', !!eqFinding('touch', { kind: 'tally', n: 12 }, { kind: 'tally', n: 10 }), true);
    eq('cue small (D3)', !!cueFinding('skip', 0.38, 0.20), true);
    eq('cue ok', cueFinding('skip', 0.38, 0.36), null);
    eq('place mixed (D4)', !!placeFinding('touch', ['under', 'beside', 'beside']), true);
    eq('frame missing × 0', !!frameFinding('array', {}, { a: 4, b: 0, op: '×' }), true);
    eq('frame empty short × 0', frameFinding('array', { arr: { dots: 0, wPx: 60, hPx: 12 } }, { a: 4, b: 0, op: '×' }), null);
    eq('frame band square × 0 (r2: the 12 x 12 band frame)', frameFinding('array', { arr: { dots: 0, wPx: 30, hPx: 30 } }, { a: 0, b: 3, op: '×' }), null);
    eq('frame portrait × 0', !!frameFinding('array', { arr: { dots: 0, wPx: 20, hPx: 30 } }, { a: 0, b: 3, op: '×' }), true);
    eq('frame dots × 0', !!frameFinding('array', { arr: { dots: 3, wPx: 30, hPx: 30 } }, { a: 0, b: 3, op: '×' }), true);
    eq('caption 1 row ok (N1)', captionFinding('array', { label: '1 row of 7, for 7 × 1', rows: 1, cols: 7, dots: 7 }, { a: 7, b: 1, op: '×' }), null);
    eq('frame other support', frameFinding('touch', {}, { a: 4, b: 0, op: '×' }), null);
    eq('place one', placeFinding('touch', ['beside', 'beside', null]), null);
    // caption grammar (N1): one row is "1 row", not "1 rows"
    eq('caption 1 rows (N1)', !!captionFinding('array', { label: '1 rows of 1, for 1 × 1', rows: 1, cols: 1, dots: 1 }, { a: 1, b: 1, op: '×' }), true);
    eq('caption 7 rows ok', captionFinding('array', { label: '7 rows of 11, for 11 × 7', rows: 7, cols: 11, dots: 77 }, { a: 11, b: 7, op: '×' }), null);
    // SUPPORT-NOT-SLOT (D1): an empty closed frame ~ the slot size, or the lone framed support in a band
    eq('slot-like empty frame (D1)', !!slotLikeFinding('array', { framed: true, dots: 0, wPx: 270, hPx: 50 }, { w: 300, h: 50 }), true);
    eq('slot-like dotted array ok', slotLikeFinding('array', { framed: true, dots: 12, wPx: 270, hPx: 50 }, { w: 300, h: 50 }), null);
    eq('slot-like far from slot ok', slotLikeFinding('array', { framed: true, dots: 0, wPx: 270, hPx: 10 }, { w: 300, h: 50 }), null);
    eq('band mix framed/unframed (D1)', !!bandFrameFinding('array', [true, false, false, false]), true);
    eq('band all framed ok (÷)', bandFrameFinding('array', [true, true, true]), null);
    eq('band all unframed ok', bandFrameFinding('array', [false, false]), null);
    for (const b of bad) console.log('  ' + b);
    console.log(`${NAME} --self-test: ${n - bad.length}/${n}`);
    console.log(`${NAME}: ${bad.length ? 'FAIL' : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
}
if (has('self-test')) selfTest();

/* ------------------------------------------------------------------ in the page */

// One function string run in the page: the support signature and cue ratio of every support drawn in `root`'s cells.
function readCellsInPage({ sel, cellSel }) {
    const root = document.querySelector(sel);
    if (!root) return { error: `no ${sel}` };
    const out = [];
    const cells = [...root.querySelectorAll(cellSel)];
    const seen = new Set();
    for (const cell of cells) {
        const eqEl = cell.querySelector('.ws-eq, .ws-fact');
        if (!eqEl || seen.has(eqEl)) continue;
        seen.add(eqEl);
        const label = (eqEl && eqEl.getAttribute('aria-label')) || '';
        const txt = eqEl ? eqEl.textContent : '';
        const m = /(\d+) divided by (\d+)/.exec(label) || /(\d+)\s*÷\s*(\d+)/.exec(txt);
        const mx = !m && (/(\d+) times (\d+)/.exec(label) || /(\d+)\s*[×x]\s*(\d+)/.exec(txt));
        const item = m ? { a: Number(m[1]), b: Number(m[2]), op: '÷' } : mx ? { a: Number(mx[1]), b: Number(mx[2]), op: '×' } : null;
        const digitPx = eqEl ? parseFloat(getComputedStyle(eqEl.querySelector('span') || eqEl).fontSize) : 0;
        const sups = {};
        for (const s of cell.querySelectorAll('.ws-support[data-ws-support-on]')) {
            const id = s.getAttribute('data-ws-support-on');
            const tally = s.querySelector('[data-ws-tally]');
            const skip = s.querySelector('[data-ws-skipstrip]');
            const svg = s.querySelector('svg');
            let sig = { kind: 'other' };
            if (tally) sig = { kind: 'tally', n: Number(tally.getAttribute('data-ws-tally')) };
            else if (skip) sig = { kind: 'skip', n: skip.querySelectorAll('[data-ws-term]').length };
            else if (svg && /^(array, \d+ rows? of \d+|no dots)$/.test(svg.getAttribute('aria-label') || '') && svg.firstElementChild && svg.firstElementChild.tagName.toLowerCase() === 'rect') {
                const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
                const br = svg.getBoundingClientRect(), k = br.width / (vb[2] || 1);
                const c0 = svg.querySelector('circle');
                sig = { kind: 'frame-array', frame: `${(vb[2] || 0).toFixed(1)}x${(vb[3] || 0).toFixed(1)}`, label: svg.getAttribute('aria-label'),
                    wPx: br.width, hPx: br.height, dotPx: c0 ? 2 * Number(c0.getAttribute('r')) * k : 0 };
            } else if (svg && /^think/.test(svg.getAttribute('aria-label') || '')) sig = { kind: 'think' };
            else if (id === 'array' && s.querySelector('svg, [data-ws-pane]')) sig = { kind: 'pane' };
            else if (svg) sig = { kind: 'svg:' + ((svg.getAttribute('class') || '').split(/\s+/)[0] || 'svg') };
            // the cue text's rendered font size: SVG units scaled by the drawn width over the viewBox width
            let textPx = 0;
            const texts = [...s.querySelectorAll('.ws-factcue svg text')];
            const csvg = texts.length ? texts[0].closest('svg') : null;
            if (csvg) {
                const vb = (csvg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
                const k = csvg.getBoundingClientRect().width / (vb[2] || 1);
                textPx = Math.max(...texts.map((t) => Number(t.getAttribute('font-size')) * k));
            }
            // where it stands: beside or under the fact
            let place = null;
            const wp = s.closest('.ws-with-pane');
            const pb = wp && wp.querySelector(':scope > .ws-pane-problem');
            if (pb && s.getBoundingClientRect().height > 0) {
                const a = pb.getBoundingClientRect(), b = s.getBoundingClientRect();
                place = b.top >= a.bottom - 2 ? 'under' : 'beside';
            }
            // any dot array (÷ frame or × array): its drawn box, dot, caption and the dots' distinct rows / columns
            let arr = null;
            const asvg = [...s.querySelectorAll('svg')].find((v) => /rows? of \d+|^no dots$/.test(v.getAttribute('aria-label') || ''));
            if (asvg) {
                const vb = (asvg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
                const br = asvg.getBoundingClientRect(), k = br.width / (vb[2] || 1);
                const cs = [...asvg.querySelectorAll('circle')];
                const xs = new Set(cs.map((c) => Number(c.getAttribute('cx')).toFixed(1))), ys = new Set(cs.map((c) => Number(c.getAttribute('cy')).toFixed(1)));
                // framed: the support draws a closed box (a <rect>) round / behind the dots (the ÷ section frame, the × zero frame)
                const framed = !!asvg.querySelector('rect');
                arr = { label: asvg.getAttribute('aria-label'), wPx: br.width, hPx: br.height, dotPx: cs.length ? 2 * Number(cs[0].getAttribute('r')) * k : 0,
                    dots: cs.length, rows: ys.size, cols: xs.size, framed };
            }
            sups[id] = { arr, sig, ratio: textPx && digitPx ? textPx / digitPx : 0, dotRatio: arr && arr.dotPx && digitPx ? arr.dotPx / digitPx : 0, place };
        }
        // the cell's graded answer slot (print span or screen input), for SUPPORT-NOT-SLOT
        let slot = null;
        const slotEl = cell.querySelector('[data-ws-slot="answer"]') || cell.querySelector('[data-ws-slot]:not([data-ws-slot$="-label"])') || cell.querySelector('input, [data-ws-slot]');
        if (slotEl) { const r = slotEl.getBoundingClientRect(); if (r.width > 0 && r.height > 0) slot = { w: r.width, h: r.height }; }
        out.push({ item, sups, digitPx, slot });
    }
    return { cells: out };
}

/* ------------------------------------------------------------------ the run */

(async () => {
    const { open } = require('../lib/ws-harness.cjs');
    const ONLY = (arg('only', 'EQ,CUE,PLACE,ORIENT,DOTMIN,CAPTION,FRAME,NOTSLOT') || '').split(',').map((s) => s.trim().toUpperCase());
    const keys = (arg('skills', 'division:div_facts') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const app = await open({ seed: 1 });
    const { page } = app;
    const findings = [];
    let renders = 0;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    try {
        for (const key of keys) {
            const [cat, skill] = key.split(':');
            const def = await page.evaluate(({ cat, skill }) => {
                try {
                    const d = window.offeredOptionsFor(cat, skill).find((x) => x.id === 'support' && x.supportsModel);
                    return d ? { render: d.render, base: d.valueBase || null } : null;
                } catch (e) { return { error: e.message }; }
            }, { cat, skill });
            if (!def) { console.log(`${key}: no supports (nothing to compare)`); continue; }
            if (def.error) { findings.push(`${key}: ${def.error}`); continue; }
            for (const sup of def.render) {
                const opts = Object.assign({ support: [sup] }, (def.base && def.base[sup]) || {});
                const tag = `${key} ${sup}`;
                // ---- paper: the Independent page at M (one frame for the section, the section's tally / strip)
                const paperAt = async (size) => {
                    const paperDoc = await page.evaluate(async ({ cat, skill, opts, size }) => {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: cat, skillId: skill, opts }] }], size, paper: 'A4', seed: 7, key: false });
                        return window.sheetDocument(r.pupilHtml, 'x', { paper: 'A4' });
                    }, { cat, skill, opts, size });
                    const sh = await app.browser.newPage();
                    await sh.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                    await sh.goto(page.url());
                    await sh.setContent(paperDoc, { waitUntil: 'networkidle0' });
                    await sh.evaluate(() => document.fonts.ready);
                    const r = await sh.evaluate(readCellsInPage, { sel: 'body', cellSel: '.ws-cell' });
                    await sh.close();
                    renders++;
                    return r;
                };
                const paper = await paperAt('M');
                // ARRAY-ORIENT on paper: the Independent page at S, M and L
                // (r2: NOTSLOT judges these paper pages too - `--only NOTSLOT` skipped them, so its backtest read only the screen hosts)
                if ((ONLY.includes('ORIENT') || ONLY.includes('CAPTION') || ONLY.includes('FRAME') || ONLY.includes('NOTSLOT')) && sup === 'array') {
                    for (const size of ['S', 'M', 'L']) {
                        const pr = size === 'M' ? paper : await paperAt(size);
                        if (ONLY.includes('FRAME')) for (const c of (pr.cells || []).filter((x) => x.item)) {
                            const f = frameFinding(sup, c.sups[sup], c.item);
                            if (f) findings.push(`ARRAY-FRAME ${key} paper ${size} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        for (const c of (pr.cells || []).filter((x) => x.item && x.sups[sup])) {
                            const f = ONLY.includes('ORIENT') ? orientFinding(sup, c.sups[sup].arr, c.item) : null;
                            if (f) findings.push(`ARRAY-ORIENT ${key} paper ${size} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                            const g = ONLY.includes('CAPTION') ? captionFinding(sup, c.sups[sup].arr, c.item) : null;
                            if (g) findings.push(`ARRAY-CAPTION ${key} paper ${size} ${c.item.a} ${c.item.op} ${c.item.b}: ${g}`);
                            if (ONLY.includes('NOTSLOT')) {
                                const s = slotLikeFinding(sup, c.sups[sup].arr, c.slot);
                                if (s) findings.push(`SUPPORT-NOT-SLOT ${key} paper ${size} ${c.item.a} ${c.item.op} ${c.item.b}: ${s}`);
                            }
                        }
                        if (ONLY.includes('NOTSLOT')) {
                            const bf = bandFrameFinding(sup, (pr.cells || []).filter((x) => x.item && x.sups[sup] && x.sups[sup].arr).map((x) => x.sups[sup].arr.framed));
                            if (bf) findings.push(`SUPPORT-NOT-SLOT ${key} paper ${size}: ${bf}`);
                        }
                    }
                }
                const pCells = (paper.cells || []).filter((c) => c.sups[sup]);
                if (!pCells.length) { console.log(`${tag}: paper draws no ${sup} (nothing to compare)`); continue; }
                const pSig = pCells[0].sups[sup].sig;
                const pRatio = Math.max(...pCells.map((c) => c.sups[sup].ratio || 0));
                const pDot = Math.max(...pCells.map((c) => c.sups[sup].dotRatio || 0));
                // ---- screen hosts
                const hosts = [];
                await page.evaluate(({ cat, skill, opts }) => { window.clearSetOptions({ silent: true }); window.setSetOptions(cat, skill, opts, { silent: true }); }, { cat, skill, opts });
                // the card: the zero item (0 ÷ n) first when the set deals one, then two more
                const cardItems = await page.evaluate(({ cat, skill, opts }) => {
                    const qs = []; let zero = null, oneRow = null;
                    // (the dealt question is kept and rendered as dealt: a dealer that avoids repeats does not deal the same
                    // item twice for one seed, so re-generating seed 10 drew 11 x 10 where the scan had found 0 - ARRAY-FRAME)
                    // A one-row fact (a factor of 1) is sought too, so ARRAY-CAPTION judges its "1 row of n" grammar (N1).
                    window.__sseqQs = {};
                    const facs = (t) => { const m = /(\d+)\s*[×x÷]\s*(\d+)/.exec(t || ''); return m ? [Number(m[1]), Number(m[2])] : null; };
                    for (let s = 1; s <= 300 && (!zero || !oneRow || qs.length < 2); s++) {
                        const q = window.generateQuestionFor({ category: cat, skill, opts, seed: s });
                        if (!q) continue;
                        window.__sseqQs[s] = q;
                        const f = facs(q.text);
                        if (Number(q.ans) === 0 && !zero) zero = s;
                        else if (f && Math.min(f[0], f[1]) === 1 && !oneRow) oneRow = s;
                        else if (qs.length < 2) qs.push(s);
                    }
                    return [zero, oneRow, ...qs].filter(Boolean);
                }, { cat, skill, opts });
                for (const [w, h] of [[1280, 900], [820, 1180], [390, 844]]) {
                    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
                    for (const seed of cardItems) {
                        const ok = await page.evaluate(({ cat, skill, opts, seed }) => {
                            const st = window.state; st.category = cat; st.skill = skill; st.gameMode = 'practice'; st.isMixedMode = false;
                            window.showView('gameView');
                            const q = (window.__sseqQs && window.__sseqQs[seed]) || window.generateQuestionFor({ category: cat, skill, opts, seed });
                            st.currentQ = q; window.renderQuestion(); return !!q;
                        }, { cat, skill, opts, seed });
                        if (!ok) continue;
                        await sleep(150);
                        hosts.push({ host: `card@${w} seed ${seed}`, r: await page.evaluate(readCellsInPage, { sel: '#questionCard', cellSel: '#questionPaper' }) });
                    }
                }
                for (const [w, h] of [[1280, 900], [820, 1180]]) {
                    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
                    await page.evaluate(() => { if (window.__wsReseed) window.__wsReseed(4242); const st = window.state; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6; window.initWorksheet(); });
                    await sleep(400);
                    await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !g || g.dataset.mqLaidOut !== '0'; }, { timeout: 5000 }).catch(() => {});
                    hosts.push({ host: `worksheet@${w}`, worksheet: true, r: await page.evaluate(readCellsInPage, { sel: '#worksheetGrid', cellSel: '.problem-card .ws-card-visual' }) });
                }
                await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
                const quizOk = await page.evaluate(({ cat, skill, opts, seeds }) => {
                    try {
                        const questions = seeds.map((seed, i) => {
                            const q = (window.__sseqQs && window.__sseqQs[seed]) || window.generateQuestionFor({ category: cat, skill, opts, seed });
                            const qd = window.quizQuestionData(q);
                            return { id: i, skillId: skill, points: 1, questionData: qd };
                        });
                        const test = { id: null, name: 'Support check', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                        window.handleQuizURL(window.compressTestForURL(test));
                        const nm = document.getElementById('qtStudentName'); nm.value = 'Check'; nm.dispatchEvent(new Event('input'));
                        window.startQuizTest();
                        return true;
                    } catch (e) { return e.message; }
                }, { cat, skill, opts, seeds: cardItems });
                if (quizOk === true) {
                    await sleep(400);
                    hosts.push({ host: 'quiz@1280', r: await page.evaluate(readCellsInPage, { sel: '#quizTakeView', cellSel: '.ws-cell, .mq-scell' }) });
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
                } else findings.push(`${tag} quiz: ${quizOk}`);
                // ---- judge
                for (const h of hosts) {
                    renders++;
                    if (h.r.error) { findings.push(`${tag} ${h.host}: ${h.r.error}`); continue; }
                    const cells = h.r.cells.filter((c) => c.item);
                    if (!cells.length) { findings.push(`${tag} ${h.host}: no ÷ fact cell rendered`); continue; }
                    for (const c of cells) {
                        const s = c.sups[sup];
                        if (ONLY.includes('EQ')) {
                            const f = eqFinding(sup, pSig, s ? s.sig : null, c.item);
                            if (f) findings.push(`SCREEN-SUPPORT-EQ ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('FRAME')) {
                            const f = frameFinding(sup, s, c.item);
                            if (f) findings.push(`ARRAY-FRAME ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('ORIENT') && s) {
                            const f = orientFinding(sup, s.arr, c.item);
                            if (f) findings.push(`ARRAY-ORIENT ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('CAPTION') && s && s.arr) {
                            const f = captionFinding(sup, s.arr, c.item);
                            if (f) findings.push(`ARRAY-CAPTION ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('DOTMIN') && s && s.dotRatio) {
                            const f = dotFinding(sup, pDot, s.dotRatio);
                            if (f) findings.push(`ARRAY-DOT-MIN ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('CUE') && s && s.ratio) {
                            const f = cueFinding(sup, pRatio, s.ratio);
                            if (f) findings.push(`SCREEN-CUE-SIZE ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                        if (ONLY.includes('NOTSLOT') && s) {
                            const f = slotLikeFinding(sup, s.arr, c.slot);
                            if (f) findings.push(`SUPPORT-NOT-SLOT ${key} ${h.host} ${c.item.a} ${c.item.op} ${c.item.b}: ${f}`);
                        }
                    }
                    if (ONLY.includes('PLACE') && h.worksheet) {
                        const f = placeFinding(sup, cells.map((c) => (c.sups[sup] ? c.sups[sup].place : null)));
                        if (f) findings.push(`SCREEN-SUPPORT-PLACE ${key} ${h.host}: ${f}`);
                    }
                    if (ONLY.includes('NOTSLOT')) {
                        // the band rule: a worksheet / page of cells where a frame on only some reads as the lone slot-like box
                        const bf = bandFrameFinding(sup, cells.filter((c) => c.sups[sup] && c.sups[sup].arr).map((c) => c.sups[sup].arr.framed));
                        if (bf) findings.push(`SUPPORT-NOT-SLOT ${key} ${h.host}: ${bf}`);
                    }
                }
                const sDots = hosts.flatMap((h) => ((h.r && h.r.cells) || []).map((c) => (c.sups[sup] && c.sups[sup].dotRatio) || 0)).filter((x) => x > 0);
                console.log(`${tag}: paper "${sigKey(pSig)}"${pRatio ? ` cue ratio ${pRatio.toFixed(2)}` : ''}${pDot ? ` dot ratio ${pDot.toFixed(3)}` : ''}${sDots.length ? ` (screen ${Math.min(...sDots).toFixed(3)}-${Math.max(...sDots).toFixed(3)})` : ''}; ${hosts.length} screen renders`);
            }
            await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) {} });
        }
        if (app.problems.length) findings.push(`console: ${app.problems.slice(0, 3).map((p) => p.text).join(' | ')}`);
    } catch (e) {
        findings.push(`crash: ${e.message}`);
    } finally { await app.close(); }
    for (const f of findings) console.log('  ' + f);
    if (!renders && !findings.length) { console.log(`${NAME}: ${keys.join(', ')} — no renders`); }
    console.log(`${NAME}: ${findings.length ? `FAIL (${findings.length})` : 'OK'}`);
    process.exit(findings.length ? 1 : 0);
})();

module.exports = { placeOf, sigKey, eqFinding, cueFinding, placeFinding, orientFinding, dotFinding, captionFinding, frameFinding, slotLikeFinding, bandFrameFinding };
