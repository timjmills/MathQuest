// js/modules/sheet/cells/words.js
// The `words` template: a number and its NAME (composing:number_word_form; detailed lesson 1,
// 2026-10-16). Two ways round, one per page (the generator deals the way):
//
//   to_number   the number name, bold, on one line ("three hundred five"), and under it the
//               answer line at digit size, B(4) wide: the pupil writes 305
//   to_words    the numeral at digit size, and under it one long ruled line the pupil writes the
//               words on (two lines' room is never needed under 1,000: "seven hundred seventy-seven"
//               is 27 characters)
//
// Black and white, Andika, the kit's sizes (ctx.metrics): words at text size + 4 pt, the numeral
// and the written number at digit size. The given form is never repeated inside the cell (BD-10).
// Key (AK-1): the answer in its slot.
//
// payload: {n, words, way: 'to_number'|'to_words', ans, slot?: 'line'|'hto'}
//
// `slot: 'hto'` (skill option answerSlot, detailed lesson 1 r3, critic D16): words to numeral is
// written in the place-value boxes, one digit a box, the place letters above (H T O; Th H T O for
// 1,000) - the structural scaffold of the Critical Atom ("3 boxes, 3 digits"). Its slots are
// pv-0 .. pv-n (one per place, left to right). `stepState` draws the anchor chart's panels.
//
// Pure module (SCC-01).

import { register, getCell } from '../registry.js';
import { esc, blank } from '../cell.js';

/** US number names to 1,000 (no "and", hyphenated tens) - the generator's own form. */
export function numberWords(n) {
    const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
        'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const two = (v) => (v < 20 ? ones[v] : tens[Math.floor(v / 10)] + (v % 10 ? `-${ones[v % 10]}` : ''));
    n = Math.trunc(Number(n));
    if (n === 1000) return 'one thousand';
    if (n < 100) return two(n);
    const h = Math.floor(n / 100), r = n % 100;
    return `${ones[h]} hundred${r ? ` ${two(r)}` : ''}`;
}

const pt = (v) => `${Math.round(v * 100) / 100}pt`;
const toWords = (p) => p.way === 'to_words';
const PLACE_LETTERS = { 1: ['O'], 2: ['T', 'O'], 3: ['H', 'T', 'O'], 4: ['Th', 'H', 'T', 'O'] };
/** The digits of a shown wrong value, one a box, right-aligned in the item's boxes ('' where it wrote nothing). */
function wrongDigits(p, wrong) {
    const n = htoDigits(p).length;
    const w = wrong || {};
    if (w.slots && Object.keys(w.slots).some((k) => /^pv-\d+$/.test(k))) return Array.from({ length: n }, (_, i) => String(w.slots[`pv-${i}`] === undefined || w.slots[`pv-${i}`] === null ? '' : w.slots[`pv-${i}`]));
    const v = String(w.value === undefined || w.value === null ? '' : w.value).replace(/[^0-9]/g, '').slice(-n);
    return Array.from({ length: n }, (_, i) => { const j = i - (n - v.length); return j >= 0 ? v[j] : ''; });
}
// (critic nwf r2 CLAIM-INK: a number under 100 took THREE boxes - its key wrote a leading 0 (083) and a claimed 38 left the H
// box empty; one box a digit of the number itself: T O for 83, H T O for 305, Th H T O for 1,000)
const htoDigits = (p) => String(Math.trunc(Number(p.n))).split('');
/** The place boxes row: `valueOf(i)` the digit shown in box i ('' = empty), `inkOf(i)` 'trace' | 'solid' | null. */
function htoRow(p, ctx, valueOf, inkOf) {
    const m = ctx.metrics || {};
    const ds = htoDigits(p);
    const letters = PLACE_LETTERS[ds.length] || PLACE_LETTERS[3];
    const textPt = m.textPt || 15;
    const boxes = ds.map((d, i) => {
        const v = valueOf(i);
        const ink = inkOf(i);
        let html = blank({ id: `pv-${i}`, kind: 'number', shape: 'box', digits: 1, graded: true }, Object.assign({}, ctx, { state: v === '' ? 'blank' : 'answered' }), v === '' ? null : v);
        // (each box as tall as a digit at the page's digit size, the digit centred in it)
        const dPt = m.digitPt || 28;
        html = html.replace('style="--w:', `style="height:${(dPt * 0.3528 * 1.3).toFixed(2)}mm;min-width:${(dPt * 0.3528 * 1.05).toFixed(2)}mm;display:inline-flex;align-items:center;justify-content:center;line-height:1;font-size:${pt(dPt)};box-sizing:border-box;--w:`);
        if (ink === 'trace') html = html.replace('class="ws-box', 'class="ws-box ws-trace').replace(/ data-ws-ink="[a-z]+"/, '').replace('<span ', '<span data-ws-ink="trace" ');
        return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:1mm;"><span style="font-size:${pt(textPt)};font-weight:700;line-height:1;">${letters[i]}</span>${html}</span>`;
    }).join('');
    return `<span class="ws-words-hto" data-ws-hto style="display:inline-flex;gap:2.5mm;align-items:flex-end;font-size:${pt(m.digitPt || 28)};font-weight:700;">${boxes}</span>`;
}
/** The name, its hundreds part (k = 0) or the rest (k = 1) underlined (the chart's panels). */
function nameHtml(p, under) {
    const w = String(p.words || numberWords(p.n)).replace(/ hundred/g, '\u00a0hundred');
    const i = w.indexOf('\u00a0hundred');
    if (under === null || under === undefined || i < 0) return esc(w);
    const head = w.slice(0, i + 8), rest = w.slice(i + 8).trim();
    const u = (t) => `<span style="text-decoration:underline;text-decoration-thickness:1.5pt;text-underline-offset:1.2mm;">${esc(t)}</span>`;
    return under === 0 ? `${u(head)}${rest ? ` ${esc(rest)}` : ''}` : `${esc(head)}${rest ? ` ${u(rest)}` : ''}`;
}
// (critic nwf r1 N7: the two-line name box is a flex box, so a bare text run and an underlined span inside it were two flex
// items and the space between them was dropped - "one hundredthirteen". The name is ONE inner span: one flex item, its spaces kept.)
// (only the flex name box takes the inner span: a plain name is one inline run already, and an inner span there re-measured the
// detailed lesson's practice cells narrower - three across, names wrapped, ws-detailed-lesson E9b)
const nameSpan = (p, textPt, inner) => { const box = p.inPlace === false ? '' : nameBox(p, textPt); return `<span style="font-size:${pt(textPt + 2)};font-weight:700;line-height:1.2;text-align:center;max-width:100%;text-wrap:balance;${box}">${box ? `<span data-ws-name style="max-width:100%;">${inner}</span>` : inner}</span>`; };
function htoCell(p, ctx, valueOf, inkOf, under) {
    const m = ctx.metrics || {};
    return `<div class="ws-words" data-ws-words="to_number" style="display:flex;flex-direction:column;align-items:center;gap:4mm;">`
        + nameSpan(p, m.textPt || 15, nameHtml(p, under))
        + `${htoRow(p, ctx, valueOf, inkOf)}</div>`;
}
// (lf-placevalue w2, ws-empty-band band=1000 at L 39 %: a name of a 3-digit number may take two lines, so one cell of a row is a
// line taller than its neighbours; every such name keeps two lines, bottom-aligned, so the answer lines of a row line up and no
// one-line cell carries an empty band under its line. Names under 100 are one line and keep their own height.)
// (critic nwf r1 N4: "one hundred" is one line - only a name long enough to wrap takes the two-line box)
const nameBox = (p, textPt) => (Number(p.n) > 100 && String(p.words || numberWords(p.n)).length >= 15 ? `min-height:${(2 * 1.2 * (textPt + 2) * 0.3528).toFixed(1)}mm;display:flex;align-items:flex-end;justify-content:center;` : '');
const keyOf = (p) => String(p.ans !== undefined ? p.ans : (toWords(p) ? (p.words || numberWords(p.n)) : p.n));

register('words', {
    render(p, ctx) {
        const m = ctx.metrics || {};
        const digitPt = m.digitPt || 28, textPt = m.textPt || 15;
        // (critic nwf r1 N5: a Model cell is drawn `traced` - the answer in grey; the key was read in `answered` only, so every
        // Model, the Scripted Model's last row and the opener's Model cells printed an EMPTY answer line)
        const key = ctx.state === 'answered' || ctx.state === 'traced' ? keyOf(p) : null;
        if (toWords(p)) {
            const line = blank({ id: 'answer', kind: 'text', shape: 'line', widthMm: ctx.size === 'S' ? 70 : ctx.size === 'M' ? 85 : 100, graded: true }, ctx, key);
            return `<div class="ws-words" data-ws-words="to_words" style="display:flex;flex-direction:column;align-items:center;gap:2mm;">`
                + `<span style="font-size:${pt(digitPt)};font-weight:700;line-height:1.1;">${esc(Number(p.n).toLocaleString('en-US'))}</span>`
                + `<span style="font-size:${pt(textPt + 4)};line-height:1.2;">${line}</span></div>`;
        }
        if (p.slot === 'hto') {
            // (critic nwf r1 N2: a True or False? / Reason It / error-analysis cell draws the CLAIM in state `wrong`; the boxes read
            // the key only, so the claimed number never printed and the key marked False against empty boxes. The wrong value is
            // written one digit a box, right-aligned, as the pupil wrote it; a traced Model writes the answer in grey.)
            const wv = ctx.state === 'wrong' ? wrongDigits(p, ctx.wrong) : null;
            const ds = htoDigits(p);
            return htoCell(p, ctx, (i) => (wv ? wv[i] : key === null ? '' : ds[i]), () => (ctx.state === 'traced' ? 'trace' : null), p.under === 0 || p.under === 1 ? p.under : null);
        }
        // (numbers to 20, a K-1 page: the line is a digit wider - young writers' digits are big, and at S three across the 4-digit
        // line left 32 % of the cell beside the ink, ws-empty-band EB-SIDE)
        const slot = blank({ id: 'answer', kind: 'number', shape: 'line', digits: p.pool === 20 ? 5 : 4, graded: true }, ctx, key);
        // (lf-placevalue w2: the room over the answer line grows with the size - 5 / 6 / 7 mm, was 4 at every size - the numeral is
        // written above its line at the digit size, and 4 mm left the L and test rows 30-33 % empty under the line)
        const gapMm = p.inPlace === false ? 4 : (({ S: 5, M: 6, L: 7 })[ctx.size] || 6);
        return `<div class="ws-words" data-ws-words="to_number" style="display:flex;flex-direction:column;align-items:center;gap:${gapMm}mm;">`
            + nameSpan(p, textPt, esc(String(p.words || numberWords(p.n)).replace(/ hundred/g, '\u00a0hundred')))
            + `<span style="font-size:${pt(digitPt)};font-weight:700;line-height:1.1;">${slot}</span></div>`;
    },
    answerKey(p) {
        const v = keyOf(p);
        const slots = { answer: { value: v, graded: true } };
        if (p.slot === 'hto' && !toWords(p)) { slots.answer.graded = false; htoDigits(p).forEach((d, i) => { slots[`pv-${i}`] = { value: d, graded: true }; }); }
        return { value: v, display: v, slots };
    },
    /**
     * P-LC-9 (the anchor chart): a place box is empty until the step that first writes it, grey on
     * that step, black after; step 0 underlines the hundreds words, step 1 the rest.
     */
    stepState(p, steps, k, ctx) {
        if (p.slot !== 'hto' || toWords(p)) return getCell('words').render(p, Object.assign({}, ctx, { state: k >= steps.length - 1 ? 'answered' : 'blank' }));
        const first = new Map();
        steps.forEach((g, gi) => ((g && g.marks) || []).forEach((mk) => { if (mk && mk.slot && !first.has(mk.slot)) first.set(mk.slot, gi); }));
        const ds = htoDigits(p);
        const at = (i) => (first.has(`pv-${i}`) ? first.get(`pv-${i}`) : steps.length - 1);
        return htoCell(p, ctx, (i) => (at(i) <= k ? ds[i] : ''), (i) => (at(i) === k ? 'trace' : at(i) < k ? 'solid' : null), k <= 1 ? k : null);
    },
    footprint(p, ctx) {
        const words = String(p.words || numberWords(p.n));
        const textPt = (ctx && ctx.metrics && ctx.metrics.textPt) || 15;
        // (A long name wraps to two balanced lines, so a words-to-numeral cell takes two columns.)
        // (lf-placevalue w2, ws-empty-band EB-BAND 364: a number name is answered IN PLACE - one line or three boxes, no working
        // space - so its rows pack to the measured ink (layout IN_PLACE_FILL, as the pv read-and-write cells) and the page takes
        // more rows instead of a 31-40 % band under every cell. A lesson ref may keep the old fill: cellPayload {inPlace: false}.)
        // (and its columns are capped by size - 4 / 3 / 3 at S / M / L: five across a 30-item S page left six rows for thirty
        // short cells, each stretched 31-37 % past its ink; more rows at the item's own height fill the page instead)
        const ip = p.inPlace === false ? {} : { inPlace: true, denseRoom: 1, hardCap: true };
        // (critic nwf r1 band 20: the 21 names 0-20 cannot fill the S page's 4 x 7 - its rows were stretched 45 % past their ink;
        // three across x 7 rows holds all 21 at about the item's own height)
        const capCols = p.pool === 20 && ctx && ctx.size === 'S' ? 3 : (({ S: 4, M: 3, L: 3 })[ctx && ctx.size] || 3);
        if (p.slot === 'hto' && !toWords(p)) return { wMm: Math.min(84, Math.max(62, words.length * (textPt + 2) * 0.52 * 0.3528 + 10)), hMm: null, measure: true, factLike: false, maxCols: p.inPlace === false ? 2 : Math.max(2, capCols), ...ip };
        const wMm = toWords(p) ? 110 : Math.min(84, Math.max(60, words.length * (textPt + 2) * 0.52 * 0.3528 + 10));
        return { wMm, hMm: null, measure: true, factLike: false, maxCols: toWords(p) ? 1 : p.inPlace === false ? 2 : capCols, ...ip };
    },
    inputs(p) {
        if (p && p.slot === 'hto' && !toWords(p)) return htoDigits(p).map((d, i) => ({ id: `pv-${i}`, kind: 'number', shape: 'box', graded: true, order: i, maxLength: 1, inputmode: 'numeric', scopes: ['full'] }));
        return [{ id: 'answer', kind: toWords(p) ? 'text' : 'number', shape: 'line', graded: true, order: 0, scopes: ['full'] }]; },
    layout() { return { card: 'card-simple', checker: 'value' }; },
});

export default { numberWords };
