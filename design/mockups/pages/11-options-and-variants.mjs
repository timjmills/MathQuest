// 11 · Options and variants — decision aids for the owner.
// One plain sheet (three-digit addition with regrouping, I Can look, 2 x 3, size L) is reused so that
// only the option under test changes from page to page. The variant is named in the on-screen note and,
// as a 7 pt page id, in the teacher footer (11-A ... 11-I) so printed pages can still be told apart.
//
// KIT PROPOSALS (nothing in kit/ was edited; all of this lives locally, prefixed p11-)
//  1. stack(): accept `carry` and `ans` marks so a cell can print its regroup digits and answer digits
//     in three states: trace (grey), key (bold 700) and blank. Today 'traced' and 'boxes' are exclusive and
//     regroup boxes can never hold a digit, so this file patches the kit markup with fillBoxes().
//  2. page(): header reflow of design standard 8.3 — hide row A when no field and no tab is on, drop the
//     rule block when everything is off (H = 0), right-align Score when Date is off. Done here with
//     .p11-nohead / .p11-dateoff.
//  3. page(): `key: true` — prints bold "Answer Key" in place of the Name field and as tab line 3 (AK-3).
//     Done here by patching the header string.
//  4. Photocopy-safe: the kit turns .ws-trace into a solid 0.6 pt outline (0.6 pt is outside the allowed
//     stroke set, and the standard asks for a DOTTED 1 pt outline). CSS cannot dot a text outline, so
//     trace digits need an SVG <text> twin (stroke-dasharray 0 1.2mm, round caps). Same for grey scaffold
//     boxes: a CSS dotted border cannot hold the 1.2 mm pitch, so the box needs an SVG <rect> twin.
//     Proposal: kit helpers trace(ch) and a .ws-dotbox (and see 6 and 7 before building either).
//  5. A fraction answer slot helper (1.5 pt bar, Hw zone above and below, B(2) wide) and a fracBar() visual.
//  6. REVIEW FINDING for the standard (INK table 4.3 / SF-10): a 1 pt dotted stroke on a GLYPH OUTLINE does not read.
//     The stem of a 28 pt Andika digit is about 1 mm wide, so its inner and outer contours are two dot rows 1 mm
//     apart at 1.2 mm pitch: they fall out of step and the digit turns into a scatter (11-E). Two workable forms are
//     shown instead: hollow digits (11-E2, real Andika outline, solid 0.75 pt) and dotted CENTRE-LINE digits
//     (11-E3, one row of dots along the stroke skeleton, the familiar "trace me" look). E3 needs ten skeleton paths
//     drawn to match Andika (SKELETON below is a first cut); if adopted they belong in the kit as traceDigit(ch).
//  7. REVIEW FINDING for INK-22 (one shared SVG <pattern> per page): Chrome's print-to-PDF turns a rotated SVG pattern
//     fill into a coarse anti-aliased BITMAP (checked at 600 dpi: stair-stepped grey pixels), which defeats the point of
//     photocopy-safe. The hatch here is therefore real 0.75 pt vector lines at 1.6 mm pitch inside a clipPath per shaded
//     area (hatchLines()). Proposal: the kit's hatch(x, y, w, h, angle) emits clipped lines; drop the <pattern> rule.
import { page, instruction, grid, band, stack, steps, doc } from '../kit/kit.mjs';

const TITLE = 'I Can add three-digit numbers with regrouping';
const TAB = ['Level 3', 'Addition', 'Lesson 9'];
const FOOT = 'add_1k_regroup · Grade 3 · 3.NBT.A.2';

// The first six are "the sheet". They are rich in 1, 4, 6 and 9 so the digit-style pages show a difference.
const PAIRS = [
    [146, 219], [469, 114], [291, 164], [619, 146], [164, 196], [419, 391],
    [327, 458], [582, 263], [176, 647], [238, 125], [453, 372], [509, 294],
    [265, 417], [384, 239], [748, 136], [157, 272], [628, 185], [346, 349], [475, 261], [193, 528],
];
const carries = (a, b) => { const c1 = (a % 10) + (b % 10) > 9 ? 1 : 0; const c2 = (Math.floor(a / 10) % 10) + (Math.floor(b / 10) % 10) + c1 > 9 ? 1 : 0; return [c1, c2]; };
for (const [a, b] of PAIRS) { const [c1, c2] = carries(a, b); if (!c1 && !c2) throw new Error(`${a}+${b} does not regroup`); if (a + b > 999) throw new Error(`${a}+${b} passes 999`); }

const T = 4;
const plain = ([a, b]) => stack(a, b, '+', { T, regroup: 'add' });

// ---------- local helpers ----------
// A trace digit with two bodies: the grey glyph, and a dotted-outline SVG twin shown only under .ws-photocopy.
// Single-stroke digit skeletons in a 100 x 140 box (cap height), school letterforms with the open 4, drawn to sit
// on Andika's digits. Used only by the dotted centre-line trace of 11-E3.
const SKELETON = {
    0: 'M50,4 C24,4 10,32 10,70 C10,108 24,136 50,136 C76,136 90,108 90,70 C90,32 76,4 50,4 Z',
    1: 'M54,136 V4 L20,34 M54,136 H8 M54,136 H100',   // every stroke starts at the foot so the dots never bunch there
    2: 'M12,36 C14,16 30,4 50,4 C72,4 87,18 87,40 C87,58 74,74 56,92 L12,136 H90',
    3: 'M46,67 C70,67 85,54 85,35 C85,16 72,4 52,4 C36,4 22,11 14,24 M46,67 C72,67 89,81 89,101 C89,122 72,136 50,136 C33,136 18,128 10,114',   // both bowls start at the waist
    4: 'M36,4 L10,100 H92 M68,44 V136',
    5: 'M82,4 H26 L19,62 C28,54 40,50 52,50 C75,50 90,67 90,92 C90,119 72,136 48,136 C32,136 18,129 10,116',
    6: 'M78,9 C70,6 62,4 54,4 C26,4 10,36 10,82 C10,116 26,136 50,136 C74,136 90,119 90,95 C90,70 74,54 52,54 C31,54 15,68 10,88',
    7: 'M10,4 H90 L40,136',
    8: 'M50,67 C30,67 17,54 17,36 C17,17 31,4 50,4 C69,4 83,17 83,36 C83,54 70,67 50,67 C27,67 10,82 10,102 C10,122 27,136 50,136 C73,136 90,122 90,102 C90,82 73,67 50,67 Z',
    9: 'M90,52 C85,72 69,86 48,86 C26,86 10,70 10,45 C10,21 26,4 50,4 C74,4 90,24 90,58 C90,104 74,136 46,136 C38,136 30,134 22,131',
};
const trace = ch => `<b class="ws-trace p11-tr"><span class="p11-tr-g">${ch}</span><svg class="p11-tr-d" aria-hidden="true"><text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Andika">${ch}</text></svg><svg class="p11-tr-c" viewBox="0 0 100 140" aria-hidden="true"><path d="${SKELETON[ch]}"/></svg></b>`;
const dotBox = '<svg class="p11-dotbox" aria-hidden="true"><rect/></svg>';
const keyDigit = ch => `<b class="p11-key">${ch}</b>`;
// Fill the kit's empty <i></i> boxes in order (regroup boxes left to right, then answer boxes left to right).
function fillBoxes(html, fills, { dotted = false } = {}) {
    let k = 0;
    return html.replace(/<i><\/i>/g, () => { const f = fills[k++] || ''; return f || dotted ? `<i class="p11-fill">${dotted ? dotBox : ''}${f}</i>` : '<i></i>'; });
}
const digitsOf = n => [...String(n).padStart(T, ' ')].map(ch => (ch === ' ' ? '' : ch));

// Guided-page cell at scaffold level 3 (traced), 2 (grey scaffolds, first step traced) or 1 (structural only).
function guidedCell([a, b], level) {
    const [c1, c2] = carries(a, b); const ans = digitsOf(a + b);
    if (level === 1) return plain([a, b]);
    if (level === 3) return fillBoxes(stack(a, b, '+', { T, regroup: 'add', answer: 'boxes' }), [c2 && trace(1), c1 && trace(1), ...ans.map(d => d && trace(d))]);
    return fillBoxes(stack(a, b, '+', { T, regroup: 'add', answer: 'boxes', grey: true }), ['', c1 && trace(1), '', '', '', trace(ans[T - 1])], { dotted: true });
}
// Answer-key cell: the kit's traced answer row re-classed to bold black, regroup digits written in the boxes.
function keyCell([a, b]) {
    const [c1, c2] = carries(a, b);
    return fillBoxes(stack(a, b, '+', { T, regroup: 'add', answer: 'traced', ans: a + b }).replaceAll('class="ws-trace"', 'class="p11-key"'), [c2 && keyDigit(1), c1 && keyDigit(1)]);
}

// Fraction bar (RP-90): 1.5 pt outline, 0.75 pt dividers, shading contiguous from the left.
function fracBar(n, d, w = 56, h = 18) {   // RP table: 56 x 18 at L
    const o = 0.3, pw = w / d;
    const shade = `<rect class="p11-shade" x="${o}mm" y="${o}mm" width="${n * pw}mm" height="${h}mm"/>` + hatchLines(o, o, n * pw, h);
    const div = Array.from({ length: d - 1 }, (_, i) => `<line x1="${o + (i + 1) * pw}mm" y1="${o}mm" x2="${o + (i + 1) * pw}mm" y2="${o + h}mm" stroke="#000" stroke-width="0.75pt"/>`).join('');
    return `<svg class="ws-svg" width="${w + 2 * o}mm" height="${h + 2 * o}mm" role="img" aria-label="bar in ${d} equal parts, ${n} shaded">${shade}${div}<rect x="${o}mm" y="${o}mm" width="${w}mm" height="${h}mm" fill="none" stroke="#000" stroke-width="1.5pt"/></svg>`;
}
// 45 degree hatch as clipped vector lines: 0.75 pt, 1.6 mm pitch measured across the lines. Shown only under .ws-photocopy.
let clipN = 0;
function hatchLines(x, y, w, h, pitch = 1.6) {
    const id = `p11-clip-${++clipN}`, step = pitch * Math.SQRT2; let lines = '';
    for (let k = -h; k < w; k += step) lines += `<line x1="${(x + k).toFixed(3)}mm" y1="${y + h}mm" x2="${(x + k + h).toFixed(3)}mm" y2="${y}mm"/>`;
    return `<clipPath id="${id}"><rect x="${x}mm" y="${y}mm" width="${w}mm" height="${h}mm"/></clipPath><g class="p11-hatch" clip-path="url(#${id})">${lines}</g>`;
}
const fracSlot = '<span class="p11-fracslot" data-ws-slot="answer" data-ws-shape="fraction"><i></i></span>';
const fracCell = (n, d) => `<div class="p11-fraccell">${fracSlot}${fracBar(n, d)}</div>`;

// ---------- the base sheet ----------
function sheet({ id, cls = '', size = 'L', tab = 6, cols = 2, rows = 3, labels = 'letter', header = {}, items = null, footRight = 'Form A', note }) {
    const n = cols * rows;
    return page({
        look: 'ican', size, tab, cls,
        header: { score: n, tab: TAB, title: TITLE, ...header },
        footer: { left: FOOT, right: `${footRight} · ${id}` },
        body: instruction('Add.') + grid(items || PAIRS.slice(0, n).map(plain), { cols, rows, labels }),
        note: `<b>${id} · ${note}`,
    });
}

// A B C — digit style
const digitA = sheet({ id: '11-A', note: 'Digit style 1 — default.</b> Andika with the open-top 4 (cv04) only. The 1 has a flag and a base stroke; 6 and 9 have curved stems. Compare the 1, 6 and 9 with 11-B and 11-C; everything else is identical. I Can look, size L, 2 × 3, regroup boxes on.' });
const digitB = sheet({ id: '11-B', cls: 'ws-alt1', note: 'Digit style 2 — page class ws-alt1.</b> Open 4 plus cv01: the 1 loses its base stroke (flag only), closer to a hand-written 1. 6 and 9 as default.' });
const digitC = sheet({ id: '11-C', cls: 'ws-alt69', note: 'Digit style 3 — page class ws-alt69.</b> Open 4 plus cv06: 6 and 9 get straight diagonal stems, as many pupils are taught to write them. The 1 as default.' });

// D E — grey against photocopy-safe
function guidedPage(id, cls, note) {
    const cells = PAIRS.slice(0, 6).map((p, i) => guidedCell(p, i === 0 ? 3 : i < 3 ? 2 : 1));
    const stepBox = `<div class="p11-steps">${steps(['Add the ones.', 'Regroup 10 ones as 1 ten.', 'Add the tens.', 'Regroup 10 tens as 1 hundred.', 'Add the hundreds.'])}</div>`;
    return page({
        look: 'ican', size: 'L', tab: 6, cls,
        header: { score: 2, tab: ['Level 3', 'Addition', 'Lesson 9'], title: TITLE },
        footer: { left: 'add_1k_regroup · frac_write · Grade 3 · 3.NBT.A.2 · 3.NF.A.1', center: '2/4', right: `Form A · ${id}` },
        body: band('Steps:', '', stepBox)
            + band('Guided Practice:', 'Add.', grid(cells, { cols: 3, rows: 2, labels: 'none' }), { grow: true })
            + band('Mixed Review:', 'Write the fraction.', grid([fracCell(3, 4), fracCell(4, 6)], { cols: 2, rows: 1, labels: 'letter', cls: 'fixed', height: '38mm' })),
        note: `<b>${id} · ${note}`,
    });
}
const greyPage = guidedPage('11-D', '', 'Guided page — standard grey.</b> Every use of the one grey on one sheet: cell 1 is fully traced (grey answer digits and grey regroup digits in black boxes); cells 2–3 have grey 1 pt scaffold boxes with the first step traced; row 2 keeps only the black structural regroup boxes. The Mixed Review bars are shaded flat grey. Photocopy-safe: off.');
const copyPage = guidedPage('11-E', 'ws-photocopy', 'The same Guided page — Photocopy-safe on (page class ws-photocopy).</b> No grey is left: shaded parts become 45° hatch (0.75 pt lines, 1.6 mm pitch, drawn as clipped vector lines so the PDF stays sharp), trace digits become 1 pt dotted glyph outlines exactly as the standard words it, grey scaffold boxes become black 1 pt dotted boxes. Hatch and dotted boxes work; the dotted-outline digits do NOT read (two dot rows 1 mm apart fall out of step) — see 11-E2 and 11-E3 for two forms that do. Run 11-D, 11-E2 and 11-E3 through the school copier twice and compare.');
const copyPage2 = guidedPage('11-E2', 'ws-photocopy p11-hollow', 'Photocopy-safe, alternative trace digits (a proposal, not yet in the standard).</b> Identical to 11-E except that trace digits are hollow: the real Andika digit as a solid 0.75 pt outline with white fill. It keeps its shape at both sizes and cannot be mistaken for a printed black digit; the cost is that solid normally means "given", so the dotted = model rule is bent. Hatch and dotted scaffold boxes are unchanged.');
const copyPage3 = guidedPage('11-E3', 'ws-photocopy p11-centre', 'Photocopy-safe, alternative trace digits (a proposal, not yet in the standard).</b> Identical to 11-E except that trace digits are dotted CENTRE LINES: one row of round dots at 1.2 mm pitch along the stroke of the digit (dots 1.5 pt here, not the 1 pt of LS-1: at 1 pt a digit is too faint to trace), the familiar "trace me" numeral. It keeps dotted = model and reads at both sizes; the cost is ten hand-drawn skeleton digits that must be kept in step with Andika (these are a first cut). Choose between 11-E2 and 11-E3.');

// F — sizes
const sizeS = sheet({ id: '11-F1', size: 'S', tab: 4, cols: 4, rows: 5, note: 'Size S.</b> 16 pt digits, 6 mm writing height, 4 × 5 = 20 problems. Items a–f are the same six problems as on the M and L pages.' });
const sizeM = sheet({ id: '11-F2', size: 'M', tab: 5, cols: 3, rows: 4, note: 'Size M.</b> 22 pt digits, 8 mm writing height, 3 × 4 = 12 problems. Items a–f are the same six problems.' });
const sizeL = sheet({ id: '11-F3', note: 'Size L.</b> 28 pt digits, 10 mm writing height, 2 × 3 = 6 problems. Content never shrinks: a bigger size means fewer items, not smaller cells.' });

// G — header options (2 x 2 body so the header is the subject)
const g = (id, header, cls, note) => sheet({ id, cols: 2, rows: 2, header, cls, note });
const headAll = g('11-G1', {}, '', 'Header — all five parts on.</b> Name, Date, Score /4, strand tab, title. Header 26 mm, grid 227 mm tall.');
const headNoDate = g('11-G2', { date: false }, 'p11-dateoff p11-name90', 'Header — Date off.</b> Name line grows to its 90 mm maximum (ruled part, measured after the word Name) and Score moves to the right end of the field row, beside the tab. Height is unchanged (header 26 mm, grid 227 mm): this option reflows sideways only.');
const headNameTitle = g('11-G3', { date: false, score: false, tab: false }, 'p11-name90', 'Header — Name and title only.</b> No tab, no Score, no Date; the Name line is 90 mm, left-aligned. The field row drops from 14 to 11 mm, so the header is 23 mm and the freed 3 mm goes to the grid (230 mm).');
const headNone = g('11-G4', { name: false, date: false, score: false, tab: false, title: '' }, 'p11-nohead', 'Header — everything off.</b> Header 0 mm: no rule either, the instruction line is the first thing on the page and the grid takes all 26 freed mm (253 mm tall).');

// H — label style (the look stays I Can: 0.75 pt cell borders)
const labLetter = sheet({ id: '11-H1', note: 'Item labels — quiet letters (the I Can default).</b> 10 pt a. b. c., inset 1.5 mm.' });
const labTab = sheet({ id: '11-H2', labels: 'tab', note: 'Item labels — black number tabs.</b> 6 mm solid tab, white 11 pt bold numeral, flush in the corner. Only the label changes: borders and tracks stay I Can, and nothing reflows because both styles reserve the same corner box.' });
const labNone = sheet({ id: '11-H3', labels: 'none', note: 'Item labels — none.</b> The corner box stays reserved, so the stacks sit exactly where they do on 11-H1 and 11-H2.' });

// I — facsimile answer key for 11-A
const key = sheet({ id: '11-I', footRight: 'Key · Form A', header: { tab: ['Level 3', 'Addition', 'Answer Key'] }, items: PAIRS.slice(0, 6).map(keyCell),
    note: 'Facsimile answer key for 11-A.</b> Same cells, same letters, same Score denominator. Answers in bold 700 at the working digit size exactly where a pupil writes them, regroup digits written in the boxes; "Answer Key" in bold in place of the Name field, in tab line 3 and "Key" in the footer (AK-3).' })
    .replace('<div class="ws-field name">Name<i></i></div>', '<div class="ws-field name p11-keyname">Answer Key</div>');

const css = `
/* trace digit twins + filled boxes */
.p11-fill { position: relative; display: flex !important; align-items: center; justify-content: center; font-style: normal; line-height: 1; }
.ws-stack .rg .p11-fill > b { font-size: calc(var(--ws-carry) * .8); }   /* on the digit, not the box: the box width is in em */
.p11-fill > b { transform: translateY(-.07em); }   /* Andika's line box sits low: optical centring in a box */
.p11-tr { font-weight: 400; display: inline-flex; align-items: center; justify-content: center; }
.p11-tr-d { display: none; width: 1em; height: 1.15em; overflow: visible; -webkit-text-stroke: 0; }
.p11-tr-d text { fill: #fff; stroke: #000; stroke-width: 1pt; stroke-dasharray: 0 1.2mm; stroke-linecap: round; stroke-linejoin: round; }
/* hollow: stroke painted first at 1.5 pt, white fill on top hides the inner half and Andika's overlapping contours -> a clean .75 pt outline */
.p11-hollow .p11-tr-d text { stroke-width: 1.5pt; stroke-dasharray: none; paint-order: stroke fill; }
/* dotted centre line (11-E3) */
.p11-tr-c { display: none; height: .74em; width: .529em; overflow: visible; }
.p11-tr-c path { fill: none; stroke: #000; stroke-width: 1.5pt; stroke-dasharray: 0 1.2mm; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ws-photocopy.p11-centre .p11-tr-d { display: none; } .ws-photocopy.p11-centre .p11-tr-c { display: block; }
.p11-centre .p11-fill > b { transform: none; } .p11-centre .ws-stack .rg .p11-fill > b { font-size: var(--ws-carry); }   /* a dotted digit needs every mm it can get */
.ws-photocopy .p11-tr-g { display: none; } .ws-photocopy .p11-tr-d { display: block; }
.p11-dotbox { display: none; position: absolute; left: -.5pt; top: -.5pt; width: calc(100% + 1pt); height: calc(100% + 1pt); overflow: visible; }
.p11-dotbox rect { x: 0; y: 0; width: 100%; height: 100%; fill: none; stroke: #000; stroke-width: 1pt; stroke-dasharray: 0 1.2mm; stroke-linecap: round; }
.ws-photocopy .ws-grey i { border-color: transparent !important; } .ws-photocopy .p11-dotbox { display: block; }
/* grey fill -> hatch */
.p11-shade { fill: var(--ws-grey); } .ws-photocopy .p11-shade { fill: #fff; }
.p11-hatch { display: none; } .ws-photocopy .p11-hatch { display: inline; } .p11-hatch line { stroke: #000; stroke-width: .75pt; }
/* fraction row */
.p11-fraccell { display: flex; align-items: center; gap: 6mm; margin-top: 4mm; }
.p11-fracslot { display: block; position: relative; width: 17mm; height: 22mm; }
.p11-fracslot i { position: absolute; left: 0; right: 0; top: calc(50% - .75pt); border-top: var(--ws-heavy) solid var(--ws-ink); }
/* steps strip: two text columns */
.p11-steps { padding: 1mm 4mm 3mm; } .p11-steps .ws-steps { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, auto); grid-auto-flow: column; gap: 2.2mm 8mm; }
.p11-steps .ws-steps li { align-items: center; }
/* answer key */
.p11-key { font-weight: 700; font-style: normal; }
.ws-field.p11-keyname { font-size: var(--ws-title); line-height: 1; padding-bottom: .6mm; }
/* header reflow the kit does not do yet (design standard 8.3) */
.p11-nohead .ws-head { display: none; }
.p11-dateoff .ws-field.score { margin-left: auto; } .p11-dateoff .ws-tabbox { margin-left: 0; }
.p11-name90 .ws-field.name { flex: none; max-width: none; } .p11-name90 .ws-field.name i { flex: none; width: 90mm; }
`;

export default doc('11 Options and variants', [digitA, digitB, digitC, greyPage, copyPage, copyPage2, copyPage3, sizeS, sizeM, sizeL, headAll, headNoDate, headNameTitle, headNone, labLetter, labTab, labNone, key], css);
