// 02 · Fact fluency: probes with the cue fade, division probes with / without the think box,
// fact-family Intro + Warm-up + Probe, and 2-up practice strips.
//
// KIT PROPOSALS (nothing in the kit was edited; everything below lives in this file for now)
//  1. fact(): accept { ans, ansTone: 'ink' | 'trace' } for an answered fact (Intro pages, Model cells),
//     and { cue: { n, row }, reserveCue: true } for the SF-30 dot tile with a reserved slot, plus
//     { ring: 'top' | 'bottom' } for the dotted model ring of SF-32.
//  2. dotTile(n, side): dice patterns 1-6, two-row ten-frame patterns 7-9 (here: p02 dotTile()).
//  3. equation(): an option for a fixed-width, right-aligned first operand (so `3 ÷ 3` and `12 ÷ 3`
//     keep "=" and the answer line in one place down a column), a `pt` override, and a "tight" spacing
//     preset (operator 0.7 em, gap 0.18 em). The kit's default spacing makes `12 ÷ 3 = ____` 58 mm wide
//     at 24 pt, which cannot fit the 3-column division probe of PT-FPR-6 (cell 56.7 mm).
//  4. sideStrip(): a `writeIn: true` form (ruled empty boxes, P-FL-9 "empty count-by strip the pupil
//     fills in") and a `fit: <mm>` option that derives the pitch from a block height.
//  5. thinkBox(): SF-40 helper (rounded, grey 1 pt, grey multiplication sign).
//  6. page(): `header: false` for header-less sheets (practice strips, flashcards). Here the header is
//     hidden with a local class.
//  7. cutLine({ dir, scissors }): dashed 0.75 pt, 3 on / 2 off, data-ws-cut, in-house scissors glyph.
//  8. instruction(): allow the underlined word of `mixed-sign` ("Look at the _sign_.").
//  9. cards(): rounded read-only flashcard cells (Warm-up).
// 10. (reviewer) .ws-foot: lay the footer out as grid 1fr auto 1fr so the page number is truly centred; with
//     flex space-between it drifts left or right with the length of the two teacher strings.
// 11. (reviewer) sideStrip width rule: a write-in strip needs B(2) = 16-17 mm, not the 12 mm of a printed strip;
//     when a packet fades full -> write-in, every part must use the wider value so the grid never moves.
import { page, instruction, grid, fact, line, box, sideStrip, withStrip, doc, rng, MINUS, TIMES, DIV } from '../kit/kit.mjs';

const GLYPH = { '+': '+', '-': MINUS, x: TIMES, '/': DIV };
const mm = v => Math.round(v * 1000) / 1000;

// ---------- local helpers ----------
// SF-30 dot tile: rounded square, 0.75 pt outline, solid dots, diameter 0.16 of the side.
function dotTile(n, side = 6.13) {
    const s = side, r = 0.08 * s, a = 0.27, b = 0.73;
    const dice = { 0: [], 1: [[.5, .5]], 2: [[a, a], [b, b]], 3: [[a, a], [.5, .5], [b, b]], 4: [[a, a], [b, a], [a, b], [b, b]],
        5: [[a, a], [b, a], [.5, .5], [a, b], [b, b]], 6: [[a, .22], [b, .22], [a, .5], [b, .5], [a, .78], [b, .78]] };
    const pts = n <= 6 ? dice[n] : [...Array.from({ length: 5 }, (_, i) => [.14 + .18 * i, .36]), ...Array.from({ length: n - 5 }, (_, i) => [.14 + .18 * i, .64])];
    return `<svg class="p02-tile" width="${s}mm" height="${s}mm" viewBox="0 0 ${s} ${s}" aria-hidden="true"><rect x=".14" y=".14" width="${mm(s - .28)}" height="${mm(s - .28)}" rx="1" fill="#fff" stroke="#000" stroke-width=".265"/>${pts.map(([x, y]) => `<circle cx="${mm(x * s)}" cy="${mm(y * s)}" r="${mm(r)}" fill="#000"/>`).join('')}</svg>`;
}
// SF-32 model ring: dotted = model mark, trace grey, first cell only.
const RING = `<svg class="p02-ringsvg" viewBox="0 0 12 12" aria-hidden="true"><circle cx="6" cy="6" r="5.4" fill="none" stroke="#949494" stroke-width=".79" stroke-linecap="round" stroke-dasharray="0 1.696"/></svg>`;

// vertical fact in the kit's .ws-fact markup; ans = printed answer row (Intro), ring = model ring on the top ones digit
function vfactHtml(a, b, op, { ans = null, ring = false } = {}) {
    const pad = v => [...String(v).padStart(3, ' ')];
    const row = (chars, first = '', ringed = false) => chars.map((ch, i) => i === 0 && first ? `<span class="op">${first}</span>`
        : `<span${ringed && i === 2 ? ' class="p02-ring"' : ''}>${ch === ' ' ? '' : ch}${ringed && i === 2 ? RING : ''}</span>`).join('');
    return `<div class="ws-fact">${row(pad(a), '', ring)}${row(pad(b), GLYPH[op])}<span class="rule"></span>${ans !== null ? row(pad(ans)) : ''}</div>`;
}
// probe cell: fact + reserved tile slot (the slot stays in every part so nothing moves between parts, PT-FPR-5)
function probeCell(a, b, op, { cue = false, ring = false } = {}) {
    const onTop = a < b, n = Math.min(a, b);
    const slot = `<div class="p02-slot"><span>${cue && onTop ? dotTile(n) : ''}</span><span>${cue && !onTop ? dotTile(n) : ''}</span></div>`;
    return { cls: 'fact', style: '--fd:28pt;--fp:3mm', html: `<div class="p02-cf">${vfactHtml(a, b, op, { ring })}${slot}</div>` };
}
// horizontal fact with a fixed-width first operand; cue = tile under the smaller numeral
function hfact(a, b, op, { pt = 28, cue = false, slot = line(2, 'L'), eq = true } = {}) {
    const small = Math.min(a, b), tile = `<i class="p02-under">${dotTile(small)}</i>`;
    const num = (v, mark) => `<span class="p02-d">${v}${cue && mark ? tile : ''}</span>`;
    return `<div class="ws-eq p02-eq" style="font-size:${pt}pt"><span class="p02-n">${num(a, a < b)}</span><span class="o">${GLYPH[op]}</span>${num(b, !(a < b))}${eq ? `<span class="o">=</span>${slot}` : ''}</div>`;
}
const instr = html => `<div class="ws-instrline"><span>${html}</span></div>`;   // one flex item, so the space before <u> survives
const writeStrip = (n, { width = 12, pitch = 10.5 } = {}) => `<div class="ws-sidestrip p02-wstrip" style="--sw:${width}mm;--pitch:${pitch}mm">${'<span></span>'.repeat(n)}</div>`;

// ================= A / B · Multiply by 3 probe, cue part 1 and part 3 =================
const V3 = [5, 2, 9, 1, 7, 4, 10, 6, 3, 8, 7, 3, 9, 6, 4];        // every fact 1-10 once, five repeats, no equal neighbours
const H3 = [8, 6, 9, 7, 4];                                        // the horizontal block repeats the hardest facts
const COUNT3 = Array.from({ length: 10 }, (_, i) => 3 * (i + 1));
const VROW = 49, VH = 3 * VROW;                                    // PT-FPR geometry at L: min(1.3 x 38, ...) = 49
const STRIP_PITCH = (VH - 4) / 10;                                 // the strip spans the vertical block exactly
// Reviewer: a write-in box has to hold a handwritten 2-digit number (Hw 10 mm -> about 15 mm clear), so the
// strip is 16 wide, not 12. Part 1 uses the SAME width so the grid and every digit stay put between parts (PT-FPR-5).
const STRIP_W = 16;

function multProbe(part) {
    const cue = part === 1;
    const vertical = grid(V3.map((a, i) => probeCell(a, 3, 'x', { cue, ring: cue && i === 0 })), { cols: 5, rows: 3, labels: 'tab', cls: 'facts fixed', height: `${VH}mm` });
    const horizontal = grid(H3.map(a => ({ cls: 'p02-hcell', html: hfact(a, 3, 'x', { cue }) })), { cols: 2, rows: 3, labels: 'tab', start: 16, cls: 'facts' });
    const strip = cue ? sideStrip(COUNT3, { width: STRIP_W, pitch: mm(STRIP_PITCH) }) : writeStrip(10, { width: STRIP_W, pitch: mm(VH / 10) });
    return page({
        look: 'daily', size: 'L', tab: 6,
        header: { score: 20, tab: ['Level 3', 'Multiplying', `Probe ${TIMES}3 A`], title: 'Multiply by 3' },
        footer: { left: `mult_facts ${TIMES}3 · Grade 3 · 3.OA.C.7`, right: cue ? 'Form A · cue part 1 · strip full' : 'Form A · cue part 3 · strip write-in' },
        body: instruction(cue ? 'Circle the bigger number. Multiply.' : 'Count by 3. Write the missing numbers. Multiply.')
            + withStrip(`${vertical}<div style="flex:none;height:6mm"></div>${horizontal}`, strip),
        note: cue
            ? '<b>02-A · Fact Fluency Probe, Multiply by 3, Form A — cue part 1.</b> 15 vertical + 5 horizontal, Score /20, black tabs 1–20. Options on: full skip-count side strip (3 … 30, 16 mm wide, spanning the vertical block), dot tile beside the smaller number in every cell, dotted grey model ring on fact 1 only (the pupil circles the rest).'
            : '<b>02-B · The same probe — cue part 3.</b> Identical item order and identical cell geometry (the tile slot stays reserved, so no digit moves). Cues off; the side strip prints as ten empty ruled boxes (16 mm wide, 14.7 mm tall: room for a handwritten 2-digit number) for the pupil to fill by counting by 3 first. Departs from PT-FPR-3 (“no write-in strip on a probe”) because the brief asks for it.',
    });
}

// ================= C / D · Divide by 3 probe, think box on / off =================
const D3 = [4, 1, 7, 10, 5, 2, 8, 3, 9, 6, 2, 10, 1, 9, 4, 7, 6, 3, 5, 8];   // quotients; each 1-10 twice
const DROW = 32.3;                                                 // (236 - 9 - 1) / 7, PT-FPR-6
function divProbe(think) {
    const cells = D3.map(q => ({ cls: `p02-dcell${think ? ' think' : ''}`, html: `${think ? `<div class="p02-think"><b>${TIMES}</b></div>` : ''}${hfact(3 * q, 3, '/', { pt: 24 })}` }));
    return page({
        look: 'daily', size: 'L', tab: 5,
        header: { score: 20, tab: ['Level 3', 'Dividing', `Probe ${DIV}3 A`], title: 'Divide by 3' },
        footer: { left: `div_facts ${DIV}3 · Grade 3 · 3.OA.C.7`, right: think ? 'Form A · think box on · strip full' : 'Form A · strip full' },
        body: instruction('Divide.') + withStrip(grid(cells, { cols: 3, rows: 7, labels: 'tab', cls: 'facts fixed', height: `${mm(7 * DROW)}mm` }), sideStrip(COUNT3, { width: 12, pitch: mm((4 * DROW - 4) / 10) })),   // strip ends on the rule under row 4
        note: think
            ? '<b>02-C · Division probe, Divide by 3 — think box ON.</b> Horizontal form, 3 columns × 7 rows (20 facts + one unruled slot), label above, 24 pt. The optional grey rounded think box sits above every fact for the related multiplication fact; the black line after “=” stays the only answer place. Full 3 … 30 strip.'
            : '<b>02-D · The same division probe — think box OFF (the default).</b> Same items, same order, same rows; the fact sits in the top half of its cell with the rest left free.',
    });
}

// ================= E · Fact-family Intro and Warm-up =================
const FAMS = [[3, 4, 7], [2, 6, 8], [4, 5, 9]];
const famFacts = ([a, b, c]) => [[a, b, '+', c], [b, a, '+', c], [c, a, '-', b], [c, b, '-', a]];
const FAM_NOTE = FAMS.map(f => `(${f.join(', ')})`).join('  ');
const famHeader = third => ({ score: false, tab: ['Level 1', 'Fact families', third], title: 'Fact families', titleNote: FAM_NOTE });

const intro = page({
    look: 'ican', size: 'L', tab: 6,
    header: famHeader('Intro'),
    footer: { left: 'fact_family · Grade 1 · 1.OA.B.3, 1.OA.C.6', right: 'Intro' },
    body: instruction('Read the three numbers. Say each fact.') + FAMS.map(f => `<div class="p02-fam"><div class="p02-trio">${f.map(v => `<span>${v}</span>`).join('')}</div>${
        grid(famFacts(f).map(([a, b, op, ans]) => ({ cls: 'fact', style: '--fd:28pt;--fp:5mm', html: vfactHtml(a, b, op, { ans }) })), { cols: 4, rows: 1 })}</div>`).join(''),
    note: '<b>02-E1 · Fact-family Intro.</b> I Can look, no labels, no Score (nothing is scored). Each family prints as a rounded trio box (a read container) over its four facts, complete and in black, to be read aloud. Nothing is written.',
});

const MIXED = [[9, 4, '-'], [2, 6, '+'], [7, 3, '-'], [5, 4, '+'], [8, 6, '-'], [4, 3, '+'], [9, 5, '-'], [6, 2, '+'], [3, 4, '+'], [8, 2, '-'], [4, 5, '+'], [7, 4, '-']];
const card = ([a, b, op]) => `<div class="p02-card" data-ws-cell>${hfact(a, b, op, { eq: false })}</div>`;
const warmup = page({
    look: 'ican', size: 'L', tab: 6,
    header: famHeader('Warm-up'),
    footer: { left: 'fact_family · Grade 1 · 1.OA.B.3, 1.OA.C.6', right: 'Warm-up' },
    body: instruction('Say the fact. Say the answer.') + `<div class="p02-cards">${[...FAMS.flatMap(famFacts), ...MIXED].map(card).join('')}</div>`,
    note: '<b>02-E2 · Fact-family Warm-up.</b> Rounded flashcard cells, no “=”, no blank, no answers — said aloud with a partner, nothing written. Rows 1–3 hold one family each; rows 4–6 hold the same twelve facts mixed. Families are listed beside the title.',
});

// ================= F · Fact-family probe, Form A, 40 facts =================
function familyProbeItems(seed) {
    const base = FAMS.flatMap(famFacts).map(([a, b, op]) => [a, b, op]);
    const pool = [...base, ...base, ...base, [9, 5, '-'], [8, 6, '-'], [4, 5, '+'], [2, 6, '+']];      // 36 + four of the hardest again
    const r = rng(seed), key = f => f.join();
    // seeded greedy fill with restarts: no fact repeats within three places, above, or on a diagonal; never four of one sign in a run
    for (let tries = 0; tries < 5000; tries++) {
        const left = [...pool], p = [];
        while (left.length) {
            const i = p.length, clash = j => j >= 0 && j < i;
            const fits = f => ![i - 1, i - 2, i - 3, i - 7, i - 8, i - 9].some(j => clash(j) && key(p[j]) === key(f))
                && !(i >= 3 && [1, 2, 3].every(k => p[i - k][2] === f[2]));
            const cands = left.map((f, k) => k).filter(k => fits(left[k]));
            if (!cands.length) break;
            p.push(left.splice(cands[Math.floor(r() * cands.length)], 1)[0]);
        }
        if (p.length === pool.length) return p;
    }
    throw new Error('no arrangement');
}
const famProbe = page({
    look: 'daily', size: 'L', tab: 4,
    header: { ...famHeader('Family A'), score: 40 },
    footer: { left: 'fact_family · Grade 1 · 1.OA.B.3, 1.OA.C.6', right: 'Form A' },
    body: instr('Add or subtract. Look at the <u>sign</u>.') + grid(familyProbeItems(347268459).map(([a, b, op]) => fact(a, b, op, { pt: 18, padTop: 5 })), { cols: 8, rows: 5, labels: 'tab', cls: 'facts' }),
    note: '<b>02-F · Fact-family probe, Form A.</b> Daily look, 8 columns × 5 rows = 40 facts drawn only from the three families, 18 pt (the 8-column ladder step), 4 mm black tabs, Score /40. No cue, no strip.',
});

// ================= G · Practice strips, 2-up =================
const SCISSORS = `<svg class="p02-sci" width="4.4mm" height="9mm" viewBox="0 0 4.4 9" aria-hidden="true" fill="none" stroke="#000" stroke-width=".353" stroke-linecap="round"><ellipse cx="1.15" cy="1.5" rx=".8" ry="1.15" fill="#fff"/><ellipse cx="3.25" cy="1.5" rx=".8" ry="1.15" fill="#fff"/><path d="M1.45 2.6 L2.9 8.7 M2.95 2.6 L1.5 8.7"/><circle cx="2.2" cy="5.7" r=".26" fill="#000" stroke="none"/></svg>`;
const CUT = `<div class="p02-cut" data-ws-cut>${SCISSORS}<svg class="p02-cutline" aria-hidden="true"><line x1="50%" y1="0" x2="50%" y2="100%" style="stroke:#000;stroke-width:.75pt;stroke-dasharray:3mm 2mm"/></svg></div>`;
function strip(id, order) {
    const rows = order.map((a, i) => `<div class="p02-srow" data-ws-cell><span class="ws-letter" data-ws-label="letter">${'abcdefghijk'[i]}.</span>${hfact(a, 7, '+', { slot: box(2, 'L') })}</div>`).join('');
    return `<div class="p02-strip"><div class="p02-shead"><div class="ws-field name">Name<i></i></div><div class="p02-set">Add 7</div></div>${rows}
      <div class="p02-sfoot"><div class="ws-field score">Score<i></i><b>/10</b></div><span>Strip ${id}</span></div></div>`;
}
const strips = page({
    look: 'daily', size: 'L', tab: 6, cls: 'p02-nohead',
    header: { name: false, date: false },
    footer: { left: 'add_facts +7 · Grade 1 · 1.OA.C.6', right: 'Strip A | Strip B' },
    body: `<div class="p02-2up">${strip('A', [3, 8, 0, 5, 9, 2, 6, 1, 7, 4])}${CUT}${strip('B', [6, 1, 9, 4, 0, 7, 3, 8, 2, 5])}</div>`,
    note: '<b>02-G · Practice strips, 2-up, Add 7.</b> No page header: each 90 mm strip carries its own Name, set box and Score /10. Ten lettered facts, answer boxes in one column (an answer ladder). The only dashed line on the page is the cut line, with the scissors glyph; 3 mm clear each side. Strip B holds Strip A’s facts re-ordered.',
});

const css = `
/* cue fact: fact + reserved tile slot, centred as one block */
.p02-cf { display: flex; justify-content: center; align-items: flex-start; gap: 1.5mm; font-size: var(--fd); line-height: 1; }
.p02-slot { flex: none; width: 6.13mm; display: flex; flex-direction: column; }
.p02-slot > span { height: 1.15em; display: flex; align-items: center; justify-content: center; }
.p02-tile { display: block; flex: none; }
.p02-ring { position: relative; }
.p02-ringsvg { position: absolute; left: 50%; top: 50%; width: 1.13em; height: 1.13em; transform: translate(-50%, -50%); overflow: visible; }
/* horizontal facts */
.p02-eq { gap: .18em; }
.p02-eq .o { width: .72em; }
.p02-n { display: inline-block; min-width: 1.22em; text-align: right; }
.p02-d { position: relative; display: inline-block; }
.p02-under { position: absolute; left: 50%; top: calc(100% + .6mm); transform: translateX(-50%); display: block; line-height: 0; }
.ws-cell.p02-hcell { padding-top: 4mm; }
/* write-in strip: ruled empty boxes */
.ws-sidestrip.p02-wstrip { padding: 0; overflow: hidden; }
.p02-wstrip span { width: 100%; }
.p02-wstrip span + span { border-top: var(--ws-hair) solid var(--ws-ink); }
/* division probe cells */
.ws-cell.p02-dcell { padding: 8mm 2mm 2mm; }
.ws-cell.p02-dcell.think { padding-top: 2.5mm; }
.p02-think { flex: none; width: 40mm; height: 14mm; margin-bottom: 2.2mm; border: 1pt solid var(--ws-grey); border-radius: 3mm; display: flex; align-items: center; justify-content: center; color: var(--ws-grey); font-size: 20pt; line-height: 1; }
.p02-think b { font-weight: 700; }
/* fact-family intro */
.p02-fam { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; padding-top: 8mm; }
.ws-instrline + .p02-fam { padding-top: 1mm; }
.p02-trio { flex: none; align-self: center; width: 92mm; height: 22mm; margin-bottom: 3mm; border: var(--ws-heavy) solid var(--ws-ink); border-radius: 3mm; display: flex; align-items: center; justify-content: space-evenly; font-size: 28pt; font-weight: 700; line-height: 1; padding: 0 8mm; }
/* warm-up cards */
.p02-cards { flex: 1 1 0; min-height: 0; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(6, 1fr); gap: 5mm 6mm; margin-top: 1mm; }
.p02-card { min-width: 0; min-height: 0; border: 1pt solid var(--ws-ink); border-radius: 3mm; display: flex; align-items: center; justify-content: center; }
.p02-card .p02-n { min-width: 0; }
/* practice strips */
.p02-nohead .ws-head { display: none; }
.p02-2up { flex: 1 1 0; min-height: 0; display: flex; align-items: stretch; }
.p02-strip { flex: none; width: 90mm; border: var(--ws-heavy) solid var(--ws-ink); display: flex; flex-direction: column; }
.p02-shead { flex: none; height: 14mm; display: flex; align-items: flex-end; gap: 4mm; padding: 0 3mm 2mm; border-bottom: var(--ws-heavy) solid var(--ws-ink); }
.p02-shead .ws-field.name { min-width: 0; height: 10mm; } .p02-shead .ws-field.name i { height: 9mm; }
.p02-set { flex: none; height: 9mm; padding: 0 3mm; border: var(--ws-heavy) solid var(--ws-ink); display: flex; align-items: center; font-size: var(--ws-text); font-weight: 700; line-height: 1; }
.p02-srow { position: relative; flex: 1 1 0; min-height: 0; display: flex; align-items: center; justify-content: center; padding-left: 6mm; }
.p02-srow + .p02-srow { border-top: var(--ws-hair) solid var(--ws-ink); }
.p02-srow .p02-n { min-width: 0; }
.p02-sfoot { flex: none; height: 12mm; border-top: var(--ws-heavy) solid var(--ws-ink); display: flex; align-items: center; justify-content: space-between; padding: 0 3mm; font-size: var(--ws-zone); }
.p02-sfoot .ws-field { height: auto; } .p02-sfoot .ws-field i { height: 7mm; width: 14mm; }
.p02-cut { flex: none; width: 6mm; display: flex; flex-direction: column; align-items: center; }
.p02-sci { flex: none; display: block; }
.p02-cutline { flex: 1 1 0; min-height: 0; width: 6mm; display: block; }
`;

export default doc('02 Fact fluency', [multProbe(1), multProbe(3), divProbe(true), divProbe(false), intro, warmup, famProbe, strips], css);
