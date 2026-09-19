// 12 · On-screen parity (phone / tablet / desktop), feedback states, and the print-dialog wireframe.
// These are SCREEN mock-ups, not A4 sheets: each frame is a px-sized element that carries the class
// "ws-page" only so build.cjs screenshots and overflow-checks it. Inside every frame the question region
// (.p12-paper) re-declares the sheet-kit tokens in px, so the same kit classes (.ws-cell, .ws-stack,
// .ws-grid, .ws-band, .ws-letter ...) draw the same black-and-white cell as print.
//
// KIT PROPOSALS
//  1. kit.mjs `ctx.mode = 'screen'`: stack() / equation() should emit <input data-slot> in place of the
//     answer row and regroup <i> boxes (local sStack() below is the shape: one input per track, aria-label
//     names the place, regroup inputs flagged data-ws-unmarked so feedback never touches them).
//  2. sheet-kit.css: a `.ws-screen` token block (px) beside .ws-S/.ws-M/.ws-L:
//     --ws-track:max(.95em,44px); --ws-hw:48px; strokes .5/.75pt->1px, 1pt->1.5px, 1.5pt->2px, 2.25pt->3px; pad 12px.
//  3. sheet-kit.css: on screen the digit box is `track - 10px` wide (print: track - 1 mm). With 44 px tracks the
//     print value leaves a 4 px gutter, too small for the AX-6 focus ring (3 px at 2 px offset) or for two
//     neighbouring SP-30 feedback outlines. 10 px fits a ring beside an outline with air between. Proposed wording for SP-22.
//  4. kit.mjs: ONE clock() builder (RP-100/101) drawn in mm units with a viewBox, so print and screen share it
//     and the container sets the scale (PT-SCR-1). clockSVG() below copies the geometry of 10-visual-grids clock()
//     (0.85 R minute hand behind haloed numerals, plain round ends); RP-101 should be amended to match.
//  5. kit.mjs: timeSlot() for the two-box  [ ]:[ ]  slot (RP-104); screen twin = two inputs.
//  6. kit.mjs: page({ thumb:true }) -> the same sheet under another root class, so the dialog preview can be
//     "built from the real print DOM" (PT-DLG-24) without being paginated. Done here by string-swapping the class.
//  7. build.cjs: allow a per-file capture selector so screen frames need not borrow the class "ws-page".
//  8. kit.mjs stack(): the VA-22 wide regroup box for borrowing across zeros (804 - 356) is not built yet, so this
//     file uses 824 - 356 instead of an across-zero item. The screen twin would be one two-digit input spanning the run.
//  9. Standard wording: SP-10 asks for 44 px inputs while SP 15.2 fixes tracks at max(.95em, 44px). Proposed ruling:
//     the touch target is the whole track (44 px); the drawn box is track - 10 px. PAGE_TYPES 3.1 Screen (56 / 64 px
//     tracks) and SP-12 (4 columns of 3-digit stacks at 1440) disagree with SP 15.2 / PT-SCR-7 and need one ruling.
import { page, grid, cell, band, label, stack, doc, MINUS } from '../kit/kit.mjs';

const PLACES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];

// ---------- feedback badges (chrome: colour allowed, shape carries the meaning) ----------
const BADGE = {
    ok: '<b class="p12-badge ok" data-ws-feedback role="img" aria-label="correct"><svg viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="8" fill="#2E7D5B"/><path d="M4.2 8.4l2.5 2.5 5-5.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></b>',
    no: '<b class="p12-badge no" data-ws-feedback role="img" aria-label="not correct"><svg viewBox="0 0 16 16" width="16" height="16"><rect width="16" height="16" rx="3" fill="#B73838"/><path d="M4.6 4.6l6.8 6.8M11.4 4.6l-6.8 6.8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></b>',
};

// ---------- the screen twin of kit stack(): same markup, inputs where print has space / boxes ----------
// ans / rg / marks are arrays of length T (index 0 = left-most track, the operator track). focus = index in the answer row.
function sStack(a, b, op, { T = 4, ans = [], rg = [], marks = [], focus = null, greyRg = false } = {}) {
    const A = String(a), B = String(b);
    const names = ['O', 'T', 'H', 'Th'];
    const pad = s => [...s.padStart(T, ' ')];
    const row = (chars, first = '') => chars.map((ch, i) => `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : ch === ' ' ? '' : ch}</span>`).join('');
    let h = Array.from({ length: T }, (_, i) => `<span class="head">${i === 0 ? '' : names[T - 1 - i]}</span>`).join('') + '<span class="headcap"></span>';
    h += Array.from({ length: T }, (_, i) => `<span class="rg">${i > T - 1 - A.length
        ? `<input class="p12-rg${greyRg ? ' grey' : ''}" data-ws-unmarked inputmode="numeric" maxlength="2" aria-label="regroup, ${PLACES[T - 1 - i]}" value="${rg[i] || ''}">` : ''}</span>`).join('');
    h += row(pad(A)) + '<span class="gap"></span>' + row(pad(B), op) + '<span class="rule"></span>';
    h += Array.from({ length: T }, (_, i) => `<span class="ab"><input class="p12-d${focus === i ? ' is-focus' : ''}${marks[i] ? ' is-' + marks[i] : ''}" data-slot inputmode="numeric" maxlength="1" tabindex="${focus === i ? 0 : -1}" aria-label="answer, ${PLACES[T - 1 - i]} digit" value="${ans[i] || ''}">${marks[i] ? BADGE[marks[i]] : ''}</span>`).join('');
    return `<div class="ws-stack wide" style="--t:${T}" role="group" aria-label="${A} minus ${B}" data-ws-slot="answer" data-ws-shape="digits">${h}</div>`;
}

// ---------- clock (RP-100 / RP-101), drawn in mm so the container sets the scale ----------
function clockSVG(hh, mm, px) {
    const D = 52, R = D / 2, c = R + 1, pt = v => (v * 0.3528).toFixed(3);
    const P = (deg, r) => { const t = (deg - 90) * Math.PI / 180; return [(c + r * Math.cos(t)).toFixed(2), (c + r * Math.sin(t)).toFixed(2)]; };
    let s = `<circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#000" stroke-width="${pt(1.5)}"/><circle cx="${c}" cy="${c}" r="${(0.9 * R).toFixed(2)}" fill="none" stroke="#000" stroke-width="${pt(0.5)}"/>`;
    for (let i = 0; i < 60; i++) {
        const five = i % 5 === 0, [x1, y1] = P(i * 6, 0.9 * R), [x2, y2] = P(i * 6, (five ? 0.8 : 0.85) * R);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${pt(five ? 0.75 : 0.5)}"/>`;
    }
    // Same departures from RP-101 as the print clock in 10-visual-grids: plain round ends (brief), and a 0.85 R minute hand that
    // passes BEHIND the numerals (paper patch + halo) so a five-minute time never strikes a numeral through.
    const [hx, hy] = P(30 * hh + 0.5 * mm, 0.46 * R), [mx, my] = P(6 * mm, 0.85 * R);
    s += `<line x1="${c}" y1="${c}" x2="${hx}" y2="${hy}" stroke="#000" stroke-width="${pt(2.25)}" stroke-linecap="round"/><line x1="${c}" y1="${c}" x2="${mx}" y2="${my}" stroke="#000" stroke-width="${pt(1.5)}" stroke-linecap="round"/>`;
    const fs = 0.12 * D, CAP = 0.7;
    for (let n = 1; n <= 12; n++) {
        const [x, y] = P(n * 30, 0.66 * R), tw = 0.6 * fs * String(n).length;
        s += `<rect x="${(x - tw / 2).toFixed(2)}" y="${(y - fs * CAP / 2).toFixed(2)}" width="${tw.toFixed(2)}" height="${(fs * CAP).toFixed(2)}" fill="#fff"/>`;
        s += `<text x="${x}" y="${(+y + fs * CAP / 2).toFixed(2)}" text-anchor="middle" font-family="Andika" font-weight="700" font-size="${fs.toFixed(2)}" fill="#000" stroke="#fff" stroke-width="${pt(2.25)}" stroke-linejoin="round" paint-order="stroke">${n}</text>`;
    }
    s += `<circle cx="${c}" cy="${c}" r="1" fill="#000"/>`;
    return `<svg class="ws-svg" role="img" aria-label="clock face" width="${px}" height="${px}" viewBox="0 0 ${D + 2} ${D + 2}" style="font-feature-settings:'cv04' 1">${s}</svg>`;
}

// ---------- chrome parts (colour lives here and only here) ----------
const ICON = {
    close: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    left: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    del: '<svg viewBox="0 0 28 20" width="26" height="19" aria-hidden="true"><path d="M9 1h17v18H9L1 10z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 6.5l7 7M21 6.5l-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    tick: '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 7.2v4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="4.7" r="1.1" fill="currentColor"/></svg>',
};
const dots = (done, total) => `<div class="p12-dots" role="img" aria-label="question ${done + 1} of ${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? 'done' : i === done ? 'now' : ''}"></i>`).join('')}</div>`;
const topBar = (done, total, xp) => `<div class="p12-top"><span class="p12-iconbtn" role="button" aria-label="Close">${ICON.close}</span>${dots(done, total)}<span class="p12-xp">${xp} XP</span></div>`;
const skillRow = (pill, count) => `<div class="p12-skillrow"><span class="p12-pill">${pill}</span><span class="p12-count">${count}</span></div>`;
const actions = ({ checkOff = false, mid = '' } = {}) => `<div class="p12-actions"><span class="p12-btn hint" role="button">Hint</span>${mid}<span class="p12-btn check${checkOff ? ' off' : ''}" role="button"${checkOff ? ' aria-disabled="true"' : ''}>Check</span></div>`;
const numPad = () => `<div class="p12-kbd pad" aria-hidden="true">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ICON.del].map(k => `<span${k === '' ? ' class="none"' : ''}>${k}</span>`).join('')}</div>`;
const wideKbd = () => `<div class="p12-kbd wide" aria-hidden="true"><div class="r">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(k => `<span>${k}</span>`).join('')}<span class="w">${ICON.del}</span></div>${[10, 9].map(n => `<div class="r dim">${'<span></span>'.repeat(n)}</div>`).join('')}<div class="r dim"><span class="w"></span><span class="sp"></span><span class="w"></span></div></div>`;

const frame = ({ w, h, cls = '', pz = 1, note, body }) => `<div class="ws-note" style="width:${Math.min(w, 1100)}px;${w > 1100 ? 'margin-left:0;' : ''}">${note}</div>
<section class="ws-page p12-frame ${cls}" style="width:${w}px;height:${h === 'auto' ? 'auto' : h + 'px'};padding:0;--pz:${pz}">${body}</section>`;

const paperCard = (sizeCls, instr, inner, cardCls = '') => `<div class="p12-card ${cardCls}"><div class="p12-paper ${sizeCls}"><div class="ws-instrline">${instr}</div>${inner}</div></div>`;

// =====================================================================================================
// A. PHONE 375 x 760 — single question card, Independent item, entry in progress (right to left)
// =====================================================================================================
const phone = frame({
    w: 375, h: 760, pz: 1.3,
    note: '<b>12-A · Phone 375 × 760, single question card.</b> Colourful chrome (progress dots, XP pill, Hint left / Check right in a sticky bar above the system number keyboard) around a white card that is the printed cell: quiet letter, H T O heads, 40 px digits on 44 px tracks, regroup boxes, and the answer row as one-digit inputs — one under every track, so the layout leaks nothing (SP-34). Entry runs right to left: the ones digit is in, the tens box has the focus ring (3 px at 2 px offset, AX-6). Regroup boxes take input but are never marked. Instruction unchanged from print: “Subtract.”',
    body: `${topBar(3, 10, 120)}
<main class="ws-body p12-main">${skillRow('Level 2 · Subtraction', '4 of 10')}
${paperCard('p12-d40', 'Subtract.', cell(sStack(632, 247, MINUS, { ans: ['', '', '', '5'], rg: ['', '', '2', '12'], focus: 2 }), { label: label('letter', 1), cls: 'p12-solo' }))}</main>
${actions()}${numPad()}`,
});

// =====================================================================================================
// B. TABLET 768 x 1024 — visual question: clock + [ ]:[ ] inputs, screen verb swap
// =====================================================================================================
const timeSlot = (hVal, mVal, focus) => `<div class="p12-time" data-ws-slot="answer" data-ws-shape="time"><input class="p12-t${focus === 0 ? ' is-focus' : ''}" data-slot inputmode="numeric" maxlength="2" aria-label="hours" value="${hVal}"><span class="p12-colon" aria-hidden="true">:</span><input class="p12-t${focus === 1 ? ' is-focus' : ''}" data-slot inputmode="numeric" maxlength="2" aria-label="minutes" value="${mVal}"></div>`;
const tablet = frame({
    w: 768, h: 1024, pz: 0.96,
    note: '<b>12-B · Tablet 768 × 1024, visual question.</b> The same clock builder as print (1.5 pt rim, minute and five-minute ticks, bold numerals, two plain round-ended hands told apart by length and weight, centre dot), scaled by the container. As on the printed clock sheet, the minute hand runs to 0.85 R behind haloed numerals, so a five-minute time never strikes a numeral through. The print slot <b>__:__</b> becomes two boxed inputs. The instruction is the print string with only its verb swapped: “Write the time.” → “Type the time.” Paper width 640 px, 48 px digits. The clock’s label says “clock face”, never the time.',
    body: `${topBar(5, 8, 85)}
<main class="ws-body p12-main">${skillRow('Level 2 · Time', '6 of 8')}
${paperCard('p12-d48', 'Type the time.', cell(`<div class="p12-clock">${clockSVG(4, 35, 360)}</div>${timeSlot('4', '', 1)}`, { label: label('letter', 1), cls: 'p12-solo p12-viscell' }), 'tab')}
<div class="p12-under">${actions()}</div></main>
${wideKbd()}`,
});

// =====================================================================================================
// C. DESKTOP 1440 x 900 — online worksheet view, 3-up grid identical to print, with inputs
// =====================================================================================================
const wsPairs = [[632, 247], [546, 178], [824, 356], [980, 356], [443, 153], [746, 558]];
const wsState = [
    { ans: ['', '3', '8', '5'], rg: ['', '5', '12', '12'] },
    { ans: ['', '3', '6', '8'], rg: ['', '4', '13', '16'] },
    { ans: ['', '', '', '8'], rg: ['', '', '1', '14'], focus: 2 },
    {}, {}, {},
];
const desktop = frame({
    w: 1440, h: 900, cls: 'p12-wide', pz: 0.74,
    note: '<b>12-C · Desktop 1440 × 900, online worksheet view.</b> A slim coloured toolbar, then a white sheet capped at 1120 px holding the print band and a 3-up grid of I Can cells — same title, band label, instruction, letters, heads, regroup boxes and rules as the A4 page, with 1 px cell lines, a 2 px outer border and 29 px digits on 44 px tracks. Each digit input owns its whole 44 px track as the touch target; the box that is drawn is 34 × 48 px so a focus ring and a feedback outline fit between neighbours. Items a and b are filled in, c is in progress with the focus ring, nothing is marked until Check. Hint sits left and Check right in the sticky bar.',
    body: `<div class="p12-toolbar"><span class="p12-iconbtn inv" role="button" aria-label="Back">${ICON.back}</span><b>Worksheet</b><span class="p12-pill inv">Level 2 · Subtraction</span><span class="p12-grow"></span><span class="p12-tbtext">2 of 6 done</span><span class="p12-xp">120 XP</span><span class="p12-btn ghost" role="button">Print</span></div>
<main class="ws-body p12-deskmain"><div class="p12-card sheet"><div class="p12-paper p12-d29">
<div class="ws-title">I Can subtract three-digit numbers with regrouping</div><div class="ws-headrule"></div>
${band('Independent Practice:', 'Subtract.', grid(wsPairs.map(([a, b], i) => sStack(a, b, MINUS, wsState[i])), { cols: 3, rows: 2, labels: 'letter' }), { grow: true })}
</div></div></main>
<div class="p12-sticky"><div class="p12-stickyin">${actions()}</div></div>`,
});

// =====================================================================================================
// D. FEEDBACK STATES — Guided live marks · Independent before Check · Independent after Check
// =====================================================================================================
const fbPanel = (title, sub, cardCls, cellHtml, status, statusCls, act) => `<div class="p12-fbcol"><h3>${title}</h3><p>${sub}</p>${paperCard('p12-d40', 'Subtract.', cellHtml, cardCls)}<div class="p12-banner ${statusCls}">${status}</div>${act}</div>`;
const feedback = frame({
    w: 1200, h: 'auto', cls: 'p12-wide', pz: 0.9,
    note: '<b>12-D · Feedback states (chrome, so green and red are allowed).</b> Left: a Guided item — unlabelled cell, grey regroup boxes, a live check mark or cross as each digit is typed; the wrong 7 stays visible and focus has moved on. Middle: an Independent item before Check — no marks at all. Right: after Check — a 16 px badge hangs outside the bottom-right corner of every answered box with a 2 px outline, the right-most wrong box takes the focus ring, the ring tint goes on the card frame and the banner, and the paper stays white. The check mark is a circle, the cross is a square: shape carries the meaning. Regroup boxes and the empty leading box are never marked.',
    body: `<main class="ws-body p12-fb">
${fbPanel('Guided item', 'Live check mark or cross per digit.', '', cell(sStack(546, 178, MINUS, { ans: ['', '', '7', '8'], rg: ['', '', '3', '16'], marks: ['', '', 'no', 'ok'], focus: 1, greyRg: true }), { cls: 'p12-solo' }), 'Marks show as you type.', '', actions({ checkOff: true }))}
${fbPanel('Independent item, before Check', 'Nothing is marked yet.', '', cell(sStack(546, 178, MINUS, { ans: ['', '3', '7', '8'], rg: ['', '4', '3', '16'] }), { label: label('letter', 2), cls: 'p12-solo' }), 'No marks until Check.', '', actions())}
${fbPanel('Independent item, after Check', 'Wrong digit stays. Focus goes to it.', 'ring-no', cell(sStack(546, 178, MINUS, { ans: ['', '3', '7', '8'], rg: ['', '4', '3', '16'], marks: ['', 'ok', 'no', 'ok'], focus: 2 }), { label: label('letter', 2), cls: 'p12-solo' }), 'Not yet. Look at the tens.', 'no', actions({ mid: '<span class="p12-btn text" role="button">Show answer</span>' }))}
</main>`,
});

// =====================================================================================================
// E. PRINT DIALOG wireframe, 1100 px wide
// =====================================================================================================
const seg = (items, sel, { dimFrom = 99, cls = '', eff = -1 } = {}) => `<div class="p12-seg ${cls}" role="radiogroup">${items.map((t, i) => `<span role="radio" aria-checked="${i === sel}" class="${i === sel ? 'on' : ''}${i >= dimFrom ? ' dim' : ''}${i === eff ? ' eff' : ''}">${t}</span>`).join('')}</div>`;
const tick = (text, on = false, { off = false, why = '' } = {}) => `<label class="p12-tick${off ? ' off' : ''}"><i class="${on ? 'on' : ''}" role="checkbox" aria-checked="${on}"${off ? ' aria-disabled="true"' : ''}>${on ? ICON.tick : ''}</i><span>${text}${why ? `<small>${why}</small>` : ''}</span></label>`;
const radio = (text, on = false) => `<label class="p12-tick"><i class="rd${on ? ' on' : ''}" role="radio" aria-checked="${on}"></i><span>${text}</span></label>`;
const select = (text, w = '') => `<span class="p12-select" role="combobox"${w ? ` style="width:${w}"` : ''}><span>${text}</span>${ICON.chev}</span>`;
const field = (name, control, { span = false, note = '' } = {}) => `<div class="p12-field${span ? ' span' : ''}"><div class="p12-lab">${name}</div>${control}${note ? `<div class="p12-fnote">${ICON.info}<span>${note}</span></div>` : ''}</div>`;
const group = (title, inner, extra = '') => `<section class="p12-group"><h3>${title}${extra}</h3><div class="p12-fields">${inner}</div></section>`;

// the live thumbnail: the real kit page under another root class, scaled with a transform; hairlines are lifted to 1.2 pt so they survive the 0.58 scale (PT-DLG-24)
const thumbPairs = [[632, 247], [546, 178], [824, 356], [980, 356], [443, 153], [746, 558]];   // 6 = the Independent ceiling at L (DN table 12.1)
const thumb = page({
    look: 'ican', size: 'L', tab: 6,
    header: { score: 6, tab: ['Level 2', 'Subtraction', 'Lesson 5'], title: 'I Can subtract three-digit numbers with regrouping' },
    footer: { left: 'sub_1k_regroup · Grade 2 · 2.NBT.B.7', center: '1/3', right: 'Form A' },
    body: band('Independent Practice:', 'Subtract.', grid(thumbPairs.map(([a, b]) => stack(a, b, '-', { T: 4, heads: true, regroup: 'sub' })), { cols: 3, rows: 2, labels: 'letter' }), { grow: true }),
}).replace('class="ws-page ', 'class="p12-sheet ').replace('class="ws-body"', 'class="ws-body p12-thumbbody"');

const filmPage = (n, name, on) => `<div class="p12-film${on ? ' on' : ''}"><i><u></u><u></u><u></u></i><span><b>${n}</b> · ${name}</span></div>`;

const dialog = frame({
    w: 1100, h: 'auto', pz: 0.7,
    note: '<b>12-E · Print dialog wireframe, 1100 px.</b> Left: the controls of one section (Sheet type with Lesson-packet parts as check boxes, Count, Columns Auto and 1–10 with its persistent clamp note — the stored choice 5 stays filled while the outlined 3 is what prints —, Size S / M / L, place-value labels, scaffold check boxes with a disabled box giving its reason, hints on tests, timing, objects; “More options” shown open: Look, Item labels, Problem mix) and the whole-job options (header fields, form and seed, photocopy-safe). Right: the live A4 thumbnail built from the real print DOM (3 × 2 = 6 items, the Independent ceiling at size L), the “Fits” line, a 1 / 3 pager with a page strip for the open section, a plain page count for the whole job, and Download PDF / Print. Flat product styling on the app’s purple; no gradients or glass.',
    body: `<main class="ws-body p12-dlg">
<header class="p12-dlghead"><h2>Print worksheet</h2><span class="p12-iconbtn" role="button" aria-label="Close">${ICON.close}</span></header>
<nav class="p12-tabs"><span class="on">Section 1 · Subtract three-digit numbers</span><span>Section 2 · Add within 1,000</span><span class="add">Add section</span></nav>
<div class="p12-dlgmain"><div class="p12-left">
${group('Sheet',
        field('Sheet type', select('Lesson packet')) +
        field('Count', `<div class="p12-inline">${select('Problems per page', '172px')}<span class="p12-input num">6</span></div>`) +
        field('Packet parts', `<div class="p12-ticks c4">${tick('Opener')}${tick('Scripted Model')}${tick('Guided page')}${tick('Independent', true)}${tick('More Practice A', true)}${tick('Error analysis')}${tick('Review')}${tick('Test A', true)}</div>`, { span: true }))}
${group('Layout',
        field('Columns', seg(['Auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], 5, { dimFrom: 4, cls: 'full', eff: 3 }), { span: true, note: '3-digit problems, size L: max 3 columns. Showing 3. Size M fits 4.' }) +
        field('Size', seg(['S', 'M', 'L'], 2, { cls: 'full' })) +
        field('Place-value labels', seg(['Words', 'Letters', 'None'], 1, { cls: 'full' })))}
${group('Supports',
        field('Scaffolds', `<div class="p12-ticks c3">${tick('Worked model')}${tick('Steps')}${tick('Regroup boxes', true)}${tick('Digit grid')}${tick('Support strip')}${tick('Check lines')}${tick('Estimation box')}${tick('Number line', false, { off: true, why: 'Not used by stacked problems' })}</div>`, { span: true }) +
        `<div class="p12-stackf">${field('Tests', `<div class="p12-ticks c1">${tick('Hints on tests')}${tick('Keep structural supports', true)}</div>`)}${field('Objects', seg(['Counters', 'Pictures'], 0, { cls: 'full' }))}</div>` +
        `<div class="p12-stackf">${field('Timing', `<div class="p12-ticks c1">${tick('“(1 minute)” tag')}${tick('Time line')}${tick('Goal line')}</div>`)}</div>`)}
${group('More options',
        field('Look', seg(['Auto', 'I Can', 'Daily'], 0, { cls: 'full' })) +
        field('Item labels', seg(['Auto', 'Letters', 'Tabs', 'None'], 0, { cls: 'full' })) +
        field('Problem mix', `<div class="p12-inline">${radio('Single type', true)}${select('Vertical, with regrouping', '226px')}<span class="p12-gap"></span>${radio('Mixed')}</div>`, { span: true }), `<span class="p12-disc">${ICON.chev}</span>`)}
${group('Whole job',
        field('Header fields', `<div class="p12-ticks row">${tick('Name', true)}${tick('Date', true)}${tick('Score', true)}${tick('Tab', true)}${tick('Title', true)}</div>`, { span: true }) +
        field('Form and seed', `<div class="p12-inline">${seg(['A', 'B', 'C', 'D'], 0)}<span class="p12-input num wide">48213</span><span class="p12-btn small" role="button">New numbers</span></div>`, { span: true }) +
        field('Photocopying', `<div class="p12-ticks c1">${tick('Photocopy-safe')}</div>`) +
        field('Answer key', `<div class="p12-ticks c1">${tick('Print the answer key', true)}</div>`))}
</div>
<aside class="p12-right"><div class="p12-prevhead"><h3>Preview</h3><span>Section 1 · A4 · Form A</span></div>
<div class="p12-thumb"><div class="p12-thumbin">${thumb}</div></div>
<div class="p12-fits"><b>Fits:</b> 3 columns · 28 pt digits · 6 per page · 3 pages</div>
<div class="p12-pager"><span class="p12-iconbtn sm off" role="button" aria-label="Previous page" aria-disabled="true">${ICON.left}</span><b>1 / 3</b><span class="p12-iconbtn sm" role="button" aria-label="Next page">${ICON.right}</span></div>
<div class="p12-films">${filmPage(1, 'Independent', true)}${filmPage(2, 'More Practice A', false)}${filmPage(3, 'Test A', false)}</div>
<div class="p12-job"><h3>In this job</h3><dl><div><dt>Section 1 · Subtract three-digit numbers</dt><dd>3 pages</dd></div><div><dt>Section 2 · Add within 1,000</dt><dd>2 pages</dd></div><div><dt>Answer key, full size</dt><dd>5 pages</dd></div><div class="sum"><dt>Total</dt><dd>10 pages</dd></div></dl></div>
<div class="p12-printrow"><span class="p12-btn outline" role="button">Download PDF</span><span class="p12-btn primary" role="button">Print</span></div>
</aside></div></main>`,
});

// =====================================================================================================
const css = `
/* ---- frames: px-sized screens. Chrome colours come from css/variables.css (flat, no gradients). ---- */
@page p12land { size: A4 landscape; margin: 0; }
.p12-frame { --mq-purple:#7C5CE6; --mq-purple-d:#5E3FCC; --mq-purple-l:#B5A5F4; --mq-purple-soft:#F4EFFF; --mq-teal-d:#14B8A6; --mq-yellow:#FFD66B; --mq-yellow-d:#E5C257;
    --mq-bg:#EAF8F8; --mq-ink:#2B2840; --mq-ink-2:#4F4B6B; --mq-rule:#E5E0F2; --mq-rule-2:#CFC8E4; --mq-ok:#2E7D5B; --mq-no:#B73838; --mq-no-bg:#FFE6E6;
    position: relative; margin: 10px auto 40px; background: var(--mq-bg); color: var(--mq-ink);
    font: 400 16px/1.35 system-ui, "Segoe UI", Roboto, sans-serif; font-feature-settings: normal; font-variant-numeric: normal; }
.p12-frame h2, .p12-frame h3, .p12-frame p { margin: 0; }
@media print { .p12-frame { zoom: var(--pz, 1); margin: 10mm auto 0; outline: 1px solid #B9B3CF; } .p12-wide { page: p12land; } }

/* ---- the paper: sheet-kit tokens re-declared in px (SP 15.2 stroke map: .5/.75pt->1px, 1.5pt->2px, 2.25pt->3px) ---- */
.p12-paper { --ws-ink:#000; --ws-paper:#fff; --ws-grey:#949494; --ws-hair:1px; --ws-fine:1px; --ws-heavy:2px; --ws-rule:3px; --ws-cell:1px; --ws-rowgap:0px;
    --ws-hw:48px; --ws-answer:66px; --ws-regroup:48px; --ws-carry:40px; --ws-tab:24px;
    background:#fff; color:#000; font-family:"Andika", sans-serif; font-synthesis:none; font-feature-settings:"cv04" 1; font-variant-numeric: lining-nums tabular-nums; line-height:1.3;
    display:flex; flex-direction:column; min-height:0; }
.p12-d40 { --ws-digit:40px; --ws-text:20px; --ws-zone:16px; --ws-letter:14px; --ws-heads:26px; --ws-instr:40px; }
.p12-d48 { --ws-digit:48px; --ws-text:22px; --ws-zone:18px; --ws-letter:15px; --ws-heads:28px; --ws-instr:46px; --ws-hw:60px; }
.p12-d29 { --ws-digit:29px; --ws-text:18px; --ws-zone:14px; --ws-letter:13px; --ws-heads:22px; --ws-instr:40px; --ws-strip:42px; --ws-title:24px; }
.p12-paper .ws-instrline { padding-left: 2px; }
.p12-paper .ws-cell { padding: 12px; }
.p12-paper .ws-cell.p12-solo { border: 1px solid #000; flex: 1 1 auto; }
.p12-paper .ws-letter { left: 8px; top: 6px; }
.p12-paper .ws-stack, .p12-paper .ws-stack.wide { --ws-track: max(0.95em, 44px); margin-top: 10px; }
.p12-paper .ws-stack .rule { height: 10px; margin-top: 4px; }
.p12-paper .ws-stack .headcap { height: 6px; }
.p12-paper .ws-stack .ab { position: relative; }
.p12-paper input { display:block; box-sizing:border-box; min-width:0; margin:0; padding:0; border:1px solid #000; border-radius:0; background:#fff; color:#000; font:inherit; line-height:1; text-align:center; outline:none; appearance:none; }
.p12-paper .p12-d  { width: calc(var(--ws-track) - 10px); height: var(--ws-hw); font-size: var(--ws-digit); }
.p12-paper .p12-rg { width: calc(var(--ws-track) - 10px); height: var(--ws-carry); font-size: 22px; }
.p12-paper .p12-rg.grey { border: 1.5px solid #949494; }
.p12-paper input.is-focus { outline: 3px solid var(--mq-purple-d); outline-offset: 2px; }
.p12-paper input.is-ok { box-shadow: 0 0 0 2px var(--mq-ok); }
.p12-paper input.is-no { box-shadow: 0 0 0 2px var(--mq-no); }
/* a marked box that also has focus keeps both: the 2 px feedback outline sits at 0-2 px, the focus ring at 2-5 px */
.p12-badge { position:absolute; right:3px; top: calc(var(--ws-hw) - 4px); width:16px; height:16px; line-height:0; }
.p12-badge svg { display:block; }

/* ---- phone / tablet chrome ---- */
.p12-top { flex:none; height:56px; padding:0 12px; display:flex; align-items:center; gap:12px; background:#fff; border-bottom:2px solid var(--mq-rule); }
.p12-iconbtn { flex:none; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; color:var(--mq-ink-2); }
.p12-iconbtn.inv { color:#fff; } .p12-iconbtn.sm { width:36px; height:36px; border:1px solid var(--mq-rule-2); background:#fff; border-radius:8px; } .p12-iconbtn.off { color:#A9A4BD; }
.p12-dots { flex:1; display:flex; justify-content:center; gap:7px; }
.p12-dots i { width:12px; height:12px; border-radius:50%; background:#DDD6EE; }
.p12-dots i.done { background:var(--mq-teal-d); } .p12-dots i.now { background:#fff; border:3px solid var(--mq-purple); }
.p12-xp { flex:none; padding:5px 12px; border-radius:999px; background:var(--mq-yellow); border-bottom:2px solid var(--mq-yellow-d); color:var(--mq-ink); font-weight:700; font-size:14px; }
.p12-main { padding: 0 12px; align-items: center; }
.p12-skillrow { flex:none; width:100%; height:44px; display:flex; align-items:center; justify-content:space-between; }
.p12-pill { padding:4px 12px; border-radius:999px; background:var(--mq-purple-soft); color:var(--mq-purple-d); font-weight:700; font-size:14px; border:1px solid #DCD2FA; }
.p12-pill.inv { background:#6A49DA; color:#fff; border-color:#9C85EE; }
.p12-count { font-size:14px; font-weight:600; color:var(--mq-ink-2); }
.p12-card { width:100%; background:#fff; border:2px solid var(--mq-rule-2); border-radius:16px; padding:6px 10px 10px; display:flex; flex-direction:column; }
.p12-card.ring-no { border-color: var(--mq-no); box-shadow: 0 0 0 2px var(--mq-no); }
.p12-card.tab { width: 668px; padding: 8px 12px 12px; }
.p12-actions { flex:none; display:flex; align-items:center; gap:12px; padding:10px 12px; background:#fff; border-top:2px solid var(--mq-rule); }
.p12-btn { display:inline-flex; align-items:center; justify-content:center; height:52px; padding:0 22px; border-radius:14px; font-weight:700; font-size:18px; white-space:nowrap; }
.p12-btn.hint { background:#fff; color:var(--mq-purple-d); border:2px solid var(--mq-purple-l); border-bottom-width:4px; min-width:104px; }
.p12-btn.check { flex:1; background:var(--mq-purple); color:#fff; border-bottom:4px solid var(--mq-purple-d); font-size:20px; }
.p12-btn.check.off { background:#DDD6EE; color:#5A5673; border-bottom-color:#C6BEDD; }
.p12-btn.text { height:44px; padding:0 8px; color:var(--mq-purple-d); font-size:16px; text-decoration:underline; text-underline-offset:3px; }
.p12-under { width: 668px; margin-top: 14px; } .p12-under .p12-actions { background:transparent; border:0; padding:0; } .p12-under .p12-btn.check { flex: 0 0 300px; margin-left:auto; }
.p12-kbd { flex:none; background:#D3D6DD; }
.p12-kbd span { display:flex; align-items:center; justify-content:center; background:#fff; border-radius:6px; border-bottom:1px solid #9A9EA8; color:#1B1B1F; font-size:24px; }
.p12-kbd span.none { background:transparent; border:0; }
.p12-kbd.pad { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; padding:6px 6px 22px; } .p12-kbd.pad span { height:44px; }
.p12-kbd.wide { padding:10px 8px 18px; display:flex; flex-direction:column; gap:8px; }
.p12-kbd.wide .r { display:flex; gap:8px; justify-content:center; } .p12-kbd.wide .r span { flex:1 1 0; height:52px; } .p12-kbd.wide .r.dim span { background:#EEF0F3; }
.p12-kbd.wide .r:nth-child(3) { padding:0 36px; } .p12-kbd.wide span.w { flex:1.6 1 0; } .p12-kbd.wide span.sp { flex:7 1 0; }

/* ---- tablet visual cell ---- */
.p12-clock { margin-top: 14px; line-height: 0; }
.p12-time { margin-top: 22px; display:flex; align-items:center; gap:10px; font-size: var(--ws-digit); line-height:1; }
.p12-paper .p12-t { width: 96px; height: var(--ws-hw); font-size: var(--ws-digit); }
.p12-colon { font-weight:700; width: 14px; text-align:center; position:relative; top:-5px; }
.p12-viscell { padding-bottom: 22px !important; }

/* ---- desktop worksheet ---- */
.p12-toolbar { flex:none; height:56px; padding:0 20px 0 8px; display:flex; align-items:center; gap:14px; background:var(--mq-purple); color:#fff; font-size:18px; }
.p12-grow { flex:1; } .p12-tbtext { font-size:15px; font-weight:600; }
.p12-btn.ghost { height:36px; padding:0 18px; border-radius:10px; font-size:15px; border:2px solid #fff; color:#fff; }
.p12-deskmain { padding: 18px 0 18px; align-items:center; }
.p12-card.sheet { width:1120px; flex:1 1 0; min-height:0; padding:14px 24px 22px; border-radius:12px; }
.p12-card.sheet .p12-paper { flex:1 1 0; }
.p12-card.sheet .ws-title { height:40px; margin-top:0; }
.p12-card.sheet .ws-headrule { margin: 4px 0 10px; }
.p12-card.sheet .ws-strip { padding: 0 12px; gap: 12px; }
.p12-sticky { flex:none; background:#fff; border-top:2px solid var(--mq-rule); }
.p12-stickyin { width:1120px; margin:0 auto; } .p12-stickyin .p12-actions { border:0; padding:10px 0; } .p12-stickyin .p12-btn.check { flex:0 0 320px; margin-left:auto; }

/* ---- feedback states ---- */
.p12-fb { flex: none; flex-direction: row !important; gap: 36px; padding: 28px 36px 32px; justify-content:center; }
.p12-fbcol { width: 352px; display:flex; flex-direction:column; }
.p12-fbcol h3 { font-size:18px; font-weight:700; } .p12-fbcol p { font-size:15px; color:var(--mq-ink-2); margin: 2px 0 14px; }
.p12-banner { margin-top:12px; height:44px; padding:0 14px; display:flex; align-items:center; border-radius:12px; font-size:16px; font-weight:600; color:var(--mq-ink-2); background:#fff; border:1px solid var(--mq-rule-2); }
.p12-banner.no { background:var(--mq-no-bg); border-color:var(--mq-no); color:#8E2323; }
.p12-fbcol .p12-actions { margin-top:12px; padding:0; background:transparent; border:0; }

/* ---- print dialog ---- */
.p12-dlg { flex: none; background:#fff; border:1px solid var(--mq-rule-2); }
.p12-dlghead { flex:none; height:60px; padding:0 12px 0 28px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--mq-rule-2); }
.p12-dlghead h2 { font-size:20px; font-weight:700; }
.p12-tabs { flex:none; display:flex; gap:4px; padding:10px 28px 0; border-bottom:1px solid var(--mq-rule-2); font-size:14px; font-weight:600; }
.p12-tabs span { padding:9px 14px 10px; border-radius:8px 8px 0 0; color:var(--mq-ink-2); border:1px solid transparent; border-bottom:0; margin-bottom:-1px; }
.p12-tabs span.on { color:var(--mq-purple-d); background:#fff; border-color:var(--mq-rule-2); box-shadow: inset 0 3px 0 var(--mq-purple); }
.p12-tabs span.add { color:var(--mq-purple-d); } .p12-tabs span.add::before { content:"+ "; }
.p12-dlgmain { display:flex; align-items:stretch; }
.p12-left { flex:1 1 0; min-width:0; padding: 6px 28px 26px; }
.p12-group { padding: 16px 0 18px; border-bottom:1px solid var(--mq-rule); } .p12-group:last-child { border-bottom:0; padding-bottom:0; }
.p12-group h3 { font-size:16px; font-weight:700; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.p12-disc { display:inline-flex; color:var(--mq-ink-2); }
.p12-fields { display:grid; grid-template-columns: 1fr 1fr; gap: 14px 28px; }
.p12-field.span { grid-column: 1 / -1; }
.p12-lab { font-size:13px; font-weight:600; color:var(--mq-ink-2); margin-bottom:6px; }
.p12-fnote { margin-top:8px; display:flex; align-items:center; gap:7px; font-size:13.5px; color:var(--mq-ink); background:var(--mq-purple-soft); border-radius:8px; padding:7px 10px; }
.p12-fnote svg { flex:none; color:var(--mq-purple-d); }
.p12-seg { display:inline-flex; border:1px solid var(--mq-rule-2); border-radius:8px; overflow:hidden; background:#fff; font-size:14px; font-weight:600; }
.p12-seg.full { display:flex; } .p12-seg.full span { flex:1 1 0; }
.p12-seg span { min-width:40px; height:36px; padding:0 10px; display:flex; align-items:center; justify-content:center; border-left:1px solid var(--mq-rule-2); color:var(--mq-ink); }
.p12-seg span:first-child { border-left:0; } .p12-seg span.dim { color:#6F6A88; background:#FAF9FD; }
.p12-seg span.on { background:var(--mq-purple); color:#fff; }
.p12-seg span.eff { box-shadow: inset 0 0 0 2px var(--mq-purple-d); color:var(--mq-purple-d); font-weight:700; }
.p12-select, .p12-input { display:flex; align-items:center; justify-content:space-between; gap:8px; height:36px; padding:0 10px 0 12px; border:1px solid var(--mq-rule-2); border-radius:8px; background:#fff; font-size:14px; font-weight:600; }
.p12-select svg { flex:none; color:var(--mq-ink-2); }
.p12-input.num { width:64px; justify-content:center; font-variant-numeric:tabular-nums; } .p12-input.wide { width:92px; }
.p12-inline { display:flex; align-items:center; gap:10px; }
.p12-ticks { display:grid; gap: 8px 16px; } .p12-ticks.c4 { grid-template-columns: repeat(4, auto); justify-content:space-between; } .p12-ticks.c3 { grid-template-columns: repeat(3, 1fr); } .p12-ticks.c1 { grid-template-columns: 1fr; }
.p12-ticks.row { display:flex; gap: 8px 26px; }
.p12-tick { display:flex; align-items:flex-start; gap:8px; font-size:14px; min-height:24px; line-height:20px; }
.p12-tick i { flex:none; width:20px; height:20px; border:1.5px solid #7D7896; border-radius:5px; background:#fff; display:flex; align-items:center; justify-content:center; }
.p12-tick i.rd { border-radius:50%; } .p12-tick i.on { background:var(--mq-purple); border-color:var(--mq-purple); } .p12-tick i.rd.on { background:#fff; border:6px solid var(--mq-purple); }
.p12-tick.off { color:#6F6A88; } .p12-tick.off i { background:#F1EFF7; border-color:#C4BFD6; }
.p12-tick small { display:block; font-size:12.5px; line-height:16px; color:#6F6A88; }
.p12-stackf { display:flex; flex-direction:column; gap:14px; } .p12-gap { width:18px; }
.p12-btn.small { height:36px; padding:0 14px; border-radius:8px; font-size:14px; color:var(--mq-purple-d); border:1px solid var(--mq-purple-l); background:#fff; }
.p12-right { flex:none; width:520px; padding: 20px 28px 26px; background:#F6F4FB; border-left:1px solid var(--mq-rule-2); display:flex; flex-direction:column; }
.p12-prevhead { display:flex; align-items:baseline; justify-content:space-between; margin-bottom:12px; } .p12-prevhead h3 { font-size:16px; font-weight:700; } .p12-prevhead span { font-size:13px; color:var(--mq-ink-2); font-weight:600; }
.p12-thumb { align-self:center; border:1px solid #B9B3CF; background:#fff; }
.p12-thumbin { width: calc(210mm * 0.58); height: calc(297mm * 0.58); overflow:hidden; }
.p12-sheet { --ws-ink:#000; --ws-paper:#fff; --ws-grey:#949494; --ws-heavy:1.5pt; --ws-rule:2.25pt; --ws-fine:0.5pt;
    transform: scale(0.58); transform-origin: 0 0; --ws-hair:1.2pt; width:210mm; height:297mm; box-sizing:border-box; padding:12mm 12mm 14mm; background:#fff; color:#000; display:flex; flex-direction:column; overflow:hidden;
    font-family:"Andika", sans-serif; font-synthesis:none; font-feature-settings:"cv04" 1; font-variant-numeric: lining-nums tabular-nums; font-size:var(--ws-text); line-height:1.3; }
.p12-sheet * { box-sizing:border-box; }
.p12-fits { margin-top:12px; font-size:13.5px; text-align:center; color:var(--mq-ink); }
.p12-pager { margin-top:12px; display:flex; align-items:center; justify-content:center; gap:16px; font-size:15px; font-variant-numeric:tabular-nums; }
.p12-films { margin-top:14px; display:flex; justify-content:center; gap:14px; }
.p12-film { width:120px; display:flex; flex-direction:column; align-items:center; text-align:center; font-size:12.5px; line-height:15px; color:var(--mq-ink-2); }
.p12-film i { height:74px; width:53px; margin-bottom:8px; background:#fff; border:1px solid #B9B3CF; display:flex; flex-direction:column; gap:3px; padding:9px 5px 5px; }
.p12-film i u { flex:1; border:1px solid #8C88A0; text-decoration:none; }
.p12-film.on i { outline:2px solid var(--mq-purple); outline-offset:2px; } .p12-film.on { color:var(--mq-ink); font-weight:600; }
.p12-film b { font-weight:700; }
.p12-job { margin-top:26px; background:#fff; border:1px solid var(--mq-rule-2); border-radius:10px; padding:14px 16px 8px; }
.p12-job h3 { font-size:15px; font-weight:700; margin-bottom:6px; } .p12-job dl { margin:0; font-size:14px; }
.p12-job dl div { display:flex; justify-content:space-between; gap:12px; padding:7px 0; border-top:1px solid var(--mq-rule); } .p12-job dl div:first-child { border-top:0; }
.p12-job dd { margin:0; font-variant-numeric:tabular-nums; white-space:nowrap; } .p12-job .sum { font-weight:700; }
.p12-printrow { margin-top:auto; padding-top:22px; display:flex; gap:12px; }
.p12-btn.outline { flex:1; height:48px; font-size:16px; border-radius:10px; background:#fff; color:var(--mq-purple-d); border:1.5px solid var(--mq-purple-l); }
.p12-btn.primary { flex:1; height:48px; font-size:16px; border-radius:10px; background:var(--mq-purple); color:#fff; }
`;

export default doc('12 On-screen parity and the print dialog', [phone, tablet, desktop, feedback, dialog], css);
