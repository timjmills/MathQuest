// ws-phone-card — THE TABLET CARD CHECK (owner rule 2026-11-13, CLAUDE.md "Fastest-implementation plan" 7: the screens are
// print, computer / Chromebook 1280-1366 px and tablet 820-1024 px; there is NO phone width). The name is kept so ws-precritic,
// the deploy gates and the backtests that call it keep working; its DEFAULT sizes are now the tablets, 820 x 1180 and
// 1024 x 768, and an explicit `--sizes 390x844,390x664` still runs the old phone check on request (backtest fixtures).
// The practice card at a tablet width: nothing a pupil needs is cut off sideways, typing goes where the pupil writes first,
// and every answer box is a 48 px touch target. (History: pilot-su-c critic r1 D5 found, at 390 px, a 6-digit stack that lost
// its ones column, rule and ones box at the cell edge, and from 4 digits the first focused box was the leftmost, not the
// ones box; ws-chromebook-fit measures 1366 / 1280 heights, ws-screen-slots never focuses.)
//
//   node tests/scripts/ws-phone-card.cjs --skills subtraction:sub_1m_no_regroup,subtraction:sub_100_no_regroup
//   node tests/scripts/ws-phone-card.cjs --skills a:b --sizes 820x1180,1024x768 --items 3 --shots <dir>
//   node tests/scripts/ws-phone-card.cjs --skills a:b --sizes 390x844,390x664     # the old phone check, on request only
//   node tests/scripts/ws-phone-card.cjs --self-test           # the entry-order and clip rules on a fixture page
//
// For every skill, size and seeded item (default 820x1180 and 1024x768, 3 items: a fresh page each, the card opened as a
// pupil opens it, playSelectedSkills('practice'), seeded) it checks, at scrollY as the app leaves it after load:
//   CLIP-X    the page does not scroll sideways (documentElement.scrollWidth <= innerWidth), and none of the question
//             text, the drawn problem (every visible element inside #questionPaper), the answer inputs and Check / Next
//             is cut off sideways: each lies inside the viewport's width AND inside every ancestor up to #questionCard
//             whose overflow-x clips (hidden / clip / auto / scroll) by more than 1 px.
//   FOCUS     the answer input the pupil writes first has the keyboard focus after load: the first non-optional answer
//             input in ENTRY order (DOM order, except that a row of column digit boxes is entered ones first, right to
//             left, as active-box.js / wireStackEntry order it; regroup and carry boxes are optional and never first).
//             On a column item (the kit stack, or a legacy column-* cell) that is the ONES box, found structurally,
//             never by pixel row (critic r6 D2: the focused legacy box is lifted 3-4 px by .mq-active-box): its
//             data-ws-slot / data-slot "ans-0", else the legacy data-col "<id>-ans-<i>" with the largest i, else the
//             last answer box of its cell in DOM order. A wrong focus is named by its place (ones = place 0) by the
//             same rule. An item with no typed answer (choices, a drawing) has no FOCUS check (listed as n/a).
//   INVIEW    that focused input lies inside the viewport (both axes).
//   CELL-READ the card's B&W cell (#questionPaper) carries [data-ws-cell], as the worksheet's and the quiz's cells do (lf-checks
//             queue 20: the mult_facts card drew none, so every card-host check read nothing there and passed); 0 cells is a
//             finding, never a pass.
//   TOUCH-TARGET every visible typed answer place (input, textarea) has a touch box (its border box, padding included) of
//             >= 48 x 48 px, an optional working box (carry, regroup, working row) >= 44 x 44 (lf-checks queue 10; word-stories
//             critic F3: the card's column inputs were 40 x 44 px at 390). The drawn box may be smaller (transparent padding).
//   TOUCH-UNIQUE every typed answer place owns its whole touch box: elementFromPoint 1 px inside each edge's middle returns
//             that input, never another typed box (lf-hosts critic r1 F4: 44 px boxes on a 47 px pitch, 48 px touch boxes
//             overlapping 1 px, so a tap on a box's right edge focused its neighbour). Card, worksheet and quiz.
//   FOCUS-RING in each [data-ws-cell] cell every focused answer place draws ONE ring, and every focused working box one ring
//             (outline, else the first inset shadow; same colour and width), with contrast >= 3:1 against its fill (AX-6) (lf-hosts critic r1 F3: the focused answer box
//             outlined in yellow #f2c200, 1.6:1, beside blue-ringed working boxes). Card and quiz.
//   TOUCH-HIT  REAL taps (page.mouse.click, so the app's own click handlers run): for every visible typed box (answer places and
//             working boxes) a tap 1 px inside each of its touch area's 4 edge midpoints and 4 corners must leave
//             document.activeElement on THAT box (lf-hosts critic r2 F1: the word-work answer box's 48 px padding ring sat under a
//             later div.mq-wwstep / div.mq-wwcols in paint order, so a tap 1 px inside its top edge hit the container and the
//             cell's click handler focused the active box - division box 1 -> box 0 at 820 and 1280. TOUCH-UNIQUE missed it: it
//             used elementFromPoint and skipped hits on elements that are not typed boxes). A rounded corner is probed 1 px
//             inside the rounded edge on its diagonal (the box's own hit shape). Card, worksheet and quiz.
//   --print-widths  print the widths the run would render (`widths: 820,...`) and exit (ws-screen-widths-plan)
//   --fixture FILE  the card checks (PROBE + the CELL-READ kind match) on a saved card page (backtest rows; lf-hosts r2 F3)
//   --only RULE[,RULE] judge only these rules (a backtest row runs the rule it proves; e.g. --only TOUCH-TARGET)
//   --hosts card,worksheet,quiz (default all three): the online worksheet (3 cards) and the quiz (2 questions) are rendered
//             once per skill and width as well, and judged on CELL-READ and TOUCH-TARGET (CLIP-X / FOCUS are the card's).
//   TOUCH     (owner 2026-11-13) every visible answer box (input, textarea, contenteditable in the card) is at least 48 x 48 px
//             at a tablet width (>= 600 px; SP-10, RUBRIC H6); at an explicit phone width (< 600 px) the old 44 px floor. A
//             regroup / carry box is scratch, not an answer (SP-23): it keeps SP-10's 44 x 44 floor at every width.
// Every finding names the skill, size, item and the element. Page errors raised while a skill rendered are its own.
//   A14       "siblings clean": after the lane's skills, the probe runs on the approved skills pinned in
//             tests/fixtures/precritic/phone-card-siblings.json (--siblings-file; two legacy column twins, a kit stack
//             skill, a K skill; --sibling-items N, default min(--items, 2)). If any approved sibling fails, the probe
//             misjudges approved skills, so the TOOL fails ("A14 siblings not clean"), whatever the lane did.
//             --no-siblings-check skips it (named in the last line).
//
// Prints one line per (skill, size, item) and `ws-phone-card: OK (...)` / `ws-phone-card: FAIL - ...`; exit 1 on FAIL
// (0 with --report-only), 2 on a usage error. An empty run (no skill, an unknown key) is a FAIL, never OK. Run through
// /tmp/mq-browser-run.sh. MQ_ROOT serves another checkout (tests/lib/ws-harness.cjs).
'use strict';
const fs = require('fs');
const path = require('path');
const { open, ROOT } = require('../lib/ws-harness.cjs');

const TOOL = 'ws-phone-card';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (...a) => console.log(...a);
let HOSTS = ['card', 'worksheet', 'quiz'];
let ONLY = [];
const keep = (m) => { if (ONLY.length && m && m.findings) m.findings = m.findings.filter((f) => ONLY.includes(f.rule)); return m; };
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* In the page: the checks. Pure DOM, so the self-test runs it on a fixture page too. */
function PROBE() {
    const W = innerWidth, H = innerHeight, TOL = 1;
    const card = document.getElementById('questionCard');
    if (!card) return { error: 'no #questionCard' };
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const name = (el) => {
        const id = el.id ? `#${el.id}` : '';
        const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        const slot = el.getAttribute && el.getAttribute('data-ws-slot') ? `[${el.getAttribute('data-ws-slot')}]` : '';
        const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18);
        return `${el.tagName.toLowerCase()}${id}${cls}${slot}${t && !/^(input|svg)$/i.test(el.tagName) ? ` "${t}"` : ''}`;
    };
    const OPTIONAL = /carry|regroup/i;
    const isOptional = (el) => OPTIONAL.test(String(el.className)) || /regroup|carry/i.test((el.closest('[data-mq-kind]') || el).getAttribute('data-mq-kind') || '') || /^regroup/.test(el.getAttribute('data-ws-slot') || '');
    const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
    const inputs = Array.from(card.querySelectorAll('input, textarea, [contenteditable="true"]'))
        .filter((el) => !(el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase())))
        .filter(vis).filter((el) => !el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container'));
    // entry order: a run of column digit boxes in one stack and one row is entered ones first (right to left)
    const DIGIT = 'input.mq-digit, input.column-answer-input';
    const order = [];
    for (let i = 0; i < inputs.length; i++) {
        const el = inputs[i];
        if (!el.matches(DIGIT) || isOptional(el)) { order.push(el); continue; }
        const stk = el.closest('.ws-stack, .column-problem, [data-mq-cell]') || el.parentElement;
        const top = Math.round(el.getBoundingClientRect().top);
        const run = [el];
        while (i + 1 < inputs.length) {
            const nx = inputs[i + 1];
            if (!nx.matches(DIGIT) || isOptional(nx) || Math.round(nx.getBoundingClientRect().top) !== top || (nx.closest('.ws-stack, .column-problem, [data-mq-cell]') || nx.parentElement) !== stk) break;
            run.push(nx); i++;
        }
        order.push(...run.reverse());
    }
    let graded = order.filter((el) => !isOptional(el));
    // a column item (the kit stack, or a legacy column cell) is written ones first whatever its inputs are called
    // (SP-20). The ones box is found STRUCTURALLY, never by pixel row (critic r6 D2: the focused legacy box
    // `.column-answer-input.mq-active-box` sits 3-4 px above its row, so a 2 px row tolerance picked the tens box):
    //   1. its place attribute: data-ws-slot / data-slot "ans-<place>" (the kit stack and its screen twin), place 0;
    //   2. the legacy column's data-col "<id>-ans-<i>": boxes are numbered left to right, so place = (largest i) - i;
    //   3. else the row by DOM structure: an answer box's row is its nearest ancestor holding another answer box;
    //      the bottom answer row is the row of the LAST answer box in DOM order; place = the
    //      number of boxes in its row lying to its right (left / right is safe: only the vertical lift misleads).
    //      (The r1 legacy twin's `input.mq-cellslot` boxes carry no place, no data-col, and no digit class.)
    const q = window.state && window.state.currentQ;
    const columnItem = !!q && ((q.cell && q.cell.template === 'stack') || /^column-/.test(String(q.printFormat || '')));
    // an answer box's row: its nearest ancestor that holds another graded box (the r1 twin wraps each box in <i> in
    // <span class="ab">, the legacy column puts the boxes side by side in one div)
    const rowOf = (g) => { let a = g.parentElement; while (a && a !== card && !graded.some((o) => o !== g && a.contains(o))) a = a.parentElement; return a; };
    const placeOf = (el) => {
        const sl = /^ans-(\d+)$/.exec(el.getAttribute('data-ws-slot') || el.getAttribute('data-slot') || '');
        if (sl) return { place: +sl[1], how: 'its place attribute' };
        const dc = /^(.*)-ans-(\d+)$/.exec(el.getAttribute('data-col') || '');
        if (dc) {
            const idx = graded.map((g) => /^(.*)-ans-(\d+)$/.exec(g.getAttribute('data-col') || '')).filter((m) => m && m[1] === dc[1]).map((m) => +m[2]);
            return { place: Math.max(...idx) - +dc[2], how: 'its data-col column index' };
        }
        const row = graded.filter((g) => rowOf(g) === rowOf(el));
        const r = el.getBoundingClientRect().right;
        return { place: row.filter((g) => g.getBoundingClientRect().right > r + 0.5).length, how: 'its row in the DOM and its left-to-right position' };
    };
    let onesHow = '';
    if (columnItem && graded.length > 1) {
        // the bottom answer row is the row of the last graded box in DOM order; its place-0 box (or, with place
        // attributes, any place-0 box) is the ones box
        const withAttr = (el) => /^ans-\d+$/.test(el.getAttribute('data-ws-slot') || el.getAttribute('data-slot') || '') || /-ans-\d+$/.test(el.getAttribute('data-col') || '');
        const last = graded[graded.length - 1];
        const lastRow = (el) => rowOf(el) === rowOf(last);
        const ones = graded.find((el) => { const p = placeOf(el); return p && p.place === 0 && (withAttr(el) || lastRow(el)); });
        if (ones) { onesHow = placeOf(ones).how; graded = [ones, ...graded.filter((el) => el !== ones)]; }
    }
    const findings = [];
    // CLIP-X
    const over = document.documentElement.scrollWidth - innerWidth;
    if (over > TOL) findings.push({ rule: 'CLIP-X', msg: `the page scrolls sideways by ${over} px at ${W} px` });
    const paper = document.getElementById('questionPaper');
    const go = [document.getElementById('qcCheckBtn'), document.getElementById('nextBtn'), document.querySelector('#answerInputArea .mq-inline-check')].filter(vis);
    const qtext = Array.from(card.querySelectorAll('#questionText, .question-text, .mq-qtext')).filter(vis);
    const subjects = [...qtext, ...(paper && vis(paper) ? Array.from(paper.querySelectorAll('*')).filter((e) => vis(e) && !e.closest('svg defs')) : []), ...inputs, ...go];
    const clippers = (el) => {
        const out = [];
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX;
            if (ox !== 'visible') out.push(a);
            if (a === card) break;
        }
        return out;
    };
    const seen = new Set();
    const cut = [];
    for (const el of subjects) {
        if (seen.has(el)) continue;
        seen.add(el);
        const r = el.getBoundingClientRect();
        if (r.width < 1) continue;
        let why = '';
        if (r.left < -TOL || r.right > W + TOL) why = `${Math.round(Math.max(-r.left, r.right - W))} px outside the ${W} px viewport`;
        else for (const a of clippers(el)) {
            const ar = a.getBoundingClientRect();
            const bl = parseFloat(getComputedStyle(a).borderLeftWidth) || 0, br = parseFloat(getComputedStyle(a).borderRightWidth) || 0;
            const L = ar.left + bl, R = ar.right - br;
            if (r.left < L - TOL || r.right > R + TOL) { why = `cut by ${name(a)} (overflow-x ${getComputedStyle(a).overflowX}): ${Math.round(Math.max(L - r.left, r.right - R))} px hidden`; break; }
        }
        if (why) cut.push({ el, why });
    }
    // one finding per clipping box (or per element outside the viewport), naming the first few cut elements
    const groups = new Map();
    for (const x of cut) { const k = x.why.replace(/: \d+ px hidden$/, ''); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
    for (const [k, list] of groups) findings.push({ rule: 'CLIP-X', msg: `${list.length} element(s) ${/^cut by/.test(k) ? '' : 'each '}${list[0].why}; e.g. ${list.slice(0, 4).map((x) => name(x.el)).join(', ')}` });
    // FOCUS / INVIEW
    const act = document.activeElement;
    let focus = 'n/a';
    if (graded.length) {
        const want = graded[0];
        if (act === want) focus = 'ok';
        else {
            focus = 'FAIL';
            // the place of the focused box, by the same structural rule that picked the ones box (never a pixel row)
            const pa = act && graded.includes(act) && columnItem ? placeOf(act) : null;
            const where = act && act !== document.body ? `${name(act)}${graded.includes(act) ? (columnItem ? (pa ? ` (the answer box at place ${pa.place}, counted from the ones = place 0, by ${pa.how}; ${graded.length} answer boxes)` : ` (an answer box of ${graded.length} with no place)`) : ` (answer box ${graded.indexOf(act) + 1} of ${graded.length} in entry order)`) : ''}` : 'nothing (body)';
            findings.push({ rule: 'FOCUS', msg: `focus is on ${where}; the pupil writes first in ${columnItem ? `the ones box (place 0, by ${onesHow || 'entry order'}) ` : ''}${name(want)}` });
        }
        const fr = (act && graded.includes(act) ? act : want).getBoundingClientRect();
        if (fr.left < -TOL || fr.right > W + TOL || fr.top < -TOL || fr.bottom > H + TOL) findings.push({ rule: 'INVIEW', msg: `the first answer box is not in view (left ${Math.round(fr.left)}, right ${Math.round(fr.right)}, top ${Math.round(fr.top)}, bottom ${Math.round(fr.bottom)} in ${W} x ${H})` });
    }
    // CELL-READ (lf-checks queue 20): the card's B&W cell carries [data-ws-cell] like the worksheet's and the quiz's, or every
    // card-host check reads nothing there (the r1 mult_facts card)
    const cellN = paper ? [paper, ...paper.querySelectorAll('[data-ws-cell]')].filter((e) => e.hasAttribute('data-ws-cell') && vis(e)).length : 0;
    if (!cellN) findings.push({ rule: 'CELL-READ', msg: paper ? '0 [data-ws-cell] cells on the card (#questionPaper): the card-host checks read nothing (screen parity with the worksheet and quiz)' : 'no #questionPaper on the card (0 cells read)' });
    // CELL-READ (lf-hosts critic r2 F3): the host stamps a kind on any paper, so a cell must also hold something - a drawn mark
    // (visible text, svg, img, canvas) or an answer slot - or it is read as empty, never a pass
    if (cellN && window.CELL_EMPTY && window.CELL_EMPTY(paper)) findings.push({ rule: 'CELL-READ', msg: 'the card cell (#questionPaper [data-ws-cell]) holds no drawn mark and no answer slot (an empty cell that carries a kind)' });
    // TOUCH-TARGET (lf-checks queue 10)
    for (const t of TARGETS('#questionCard')) findings.push({ rule: 'TOUCH-TARGET', msg: t });
    // TOUCH-UNIQUE (lf-hosts critic r1 F4); FOCUS-RING (F3) moves the focus, so main() runs it after this probe
    if (window.UNIQUE) for (const t of window.UNIQUE('#questionCard')) findings.push({ rule: 'TOUCH-UNIQUE', msg: t });
    // TOUCH (owner 2026-11-13): answer boxes are 48 px touch targets on a tablet (44 px at an explicit phone width)
    // (a regroup / carry box is scratch, never an answer: SP-10's 44 x 44 floor, SP-23)
    const FLOOR = W >= 600 ? 48 : 44;
    const floorOf = (el) => (isOptional(el) ? 44 : FLOOR);
    const small = inputs.filter((el) => { const r = el.getBoundingClientRect(); return Math.min(r.width, r.height) < floorOf(el) - 0.5; });
    if (small.length) findings.push({ rule: 'TOUCH', msg: `${small.length} box(es) under the touch floor at ${W} px (answer boxes ${FLOOR} px, regroup / carry boxes 44 px); e.g. ${small.slice(0, 3).map((el) => { const r = el.getBoundingClientRect(); return `${name(el)} ${Math.round(r.width)} x ${Math.round(r.height)} (floor ${floorOf(el)})`; }).join(', ')}` });
    return { focus, columnItem, onesHow, inputs: graded.length, findings: findings.map((f) => ({ rule: f.rule, msg: f.msg })), paperW: paper ? Math.round(paper.getBoundingClientRect().width) : 0 };
}

/* In the page: CELL-READ's empty-cell test (lf-hosts critic r2 F3). A cell is empty when it holds no visible answer slot (input,
   textarea, select, contenteditable, [data-ws-slot], [data-mq-cell]), no visible drawing (svg, img, canvas) and no visible text. */
function CELL_EMPTY(cell) {
    if (!cell) return true;
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    if (Array.from(cell.querySelectorAll('input:not([type=hidden]), textarea, select, [contenteditable="true"], [data-ws-slot], [data-mq-cell], svg, img, canvas')).some(vis)) return false;
    return !String(cell.innerText || '').trim();
}

/* In the page (async): CELL-READ's kind match (lf-hosts critic r2 F3). The kind the QUIZ host stamps on this same item - its
   own rule, quiz-take.js: 'msc' for a "Click ALL" item, else the kit template's kind (cellKindFor({...q, options: []})) - must
   be a [data-ws-cell] kind of the card's cell. Uses the app's own screen-cell.js module instance (the URL it loaded). */
async function CELL_KIND(modUrl) {
    const q = window.state && window.state.currentQ;
    const paper = document.getElementById('questionPaper');
    if (!q || !paper) return null;
    const url = modUrl || performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/js\/modules\/screen-cell\.js(\?|$)/.test(n));
    if (!url) return 'screen-cell.js was not loaded: the kind match cannot be read';
    const mod = await import(url);
    const msc = q.answerType === 'multi-select-check' && Array.isArray(q.options) && q.options.length > 0;
    const k = msc ? { kind: 'msc' } : mod.cellKindFor({ ...q, options: [] });
    if (!k || !k.kind) return null;
    const kinds = [paper, ...paper.querySelectorAll('[data-ws-cell]')].filter((e) => e.hasAttribute('data-ws-cell')).map((e) => e.getAttribute('data-ws-cell'));
    return kinds.includes(k.kind) ? null : `the card cell is labelled ${kinds.map((x) => `"${x}"`).join(', ') || 'nothing'}, the quiz labels this same item "${k.kind}" (the kit template's kind; screen parity)`;
}

/* In the page: TOUCH-TARGET (lf-checks queue 10; lf-builds word-stories critic F3, lead 2026-11-13: the practice card's
   inputs at 390 px were 40 x 44 px). Every visible typed answer place under `rootSel` (input, textarea, contenteditable;
   the host's chrome bar, nav and choice buttons are not answer places) has a touch box - its border box, padding included -
   of at least 48 x 48 px (SP-10: digit inputs >= 48 px); an optional working box (carry, regroup, a working row) at least
   44 x 44 px (RUBRIC H6). The drawn box may be smaller: the target is transparent padding around it (the kit line-slot rule).
   Returns one message per under-floor group (class + size), naming the count. Pure DOM: the self-test runs it on fixtures. */
function TARGETS(rootSel) {
    const roots = Array.from(document.querySelectorAll(rootSel));
    const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .mq-sr, [aria-hidden="true"]'); };
    const OPT = '.mq-carry, .column-carry-input, .mq-opswork, .mq-wwork, [data-mq-work], [data-ws-slot^="regroup"], .mq-regroup';
    const groups = new Map();
    for (const rt of roots) {
        for (const el of rt.querySelectorAll('input, textarea, [contenteditable="true"]')) {
            if (el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase())) continue;
            if (!vis(el) || el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container, .hint-popup')) continue;
            const r = el.getBoundingClientRect();
            const opt = el.matches(OPT) || /carry|regroup/i.test(String(el.className));
            const floor = opt ? 44 : 48;
            if (r.width >= floor - 0.5 && r.height >= floor - 0.5) continue;
            const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).filter((c) => !/^mq-(active-box|live-|wd-)/.test(c)).slice(0, 2).join('.') : '';
            const k = `${el.tagName.toLowerCase()}${cls} ${Math.round(r.width)} x ${Math.round(r.height)} px (${opt ? 'a working box: want >= 44 x 44, RUBRIC H6' : 'an answer place: want >= 48 x 48, SP-10'})`;
            groups.set(k, (groups.get(k) || 0) + 1);
        }
    }
    return [...groups.entries()].map(([k, n]) => `${n} x ${k}`);
}

/* In the page: TOUCH-UNIQUE (lf-hosts critic r1 F4: the word-work answer boxes drew 44 px on a 47 px pitch, so their 48 px
   touch boxes overlapped by 1 px and a tap on one box's right edge focused its neighbour). Every visible typed answer place
   under `rootSel` owns its whole touch box: document.elementFromPoint 1 px inside (Chrome hit-tests whole px) the middle of each of its four edges
   returns the input itself, never ANOTHER typed answer place (a hit on something else - a sticky bar, a label - is not this
   rule's). An input outside the viewport is scrolled to the centre first. Returns one message per (class, edge) group. */
function UNIQUE(rootSel) {
    const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .mq-sr, [aria-hidden="true"]'); };
    const typed = (el) => !!el && el.matches && el.matches('input, textarea, [contenteditable="true"]') && !(el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase()));
    const cls = (el) => (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).filter((c) => !/^mq-(active-box|live-|wd-)/.test(c)).slice(0, 2).join('.') : '');
    const groups = new Map();
    const sx = scrollX, sy = scrollY;
    for (const rt of document.querySelectorAll(rootSel)) {
        for (const el of rt.querySelectorAll('input, textarea, [contenteditable="true"]')) {
            if (!typed(el) || !vis(el) || el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container, .hint-popup')) continue;
            let r = el.getBoundingClientRect();
            if (r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth) { el.scrollIntoView({ block: 'center', inline: 'center' }); r = el.getBoundingClientRect(); }
            const pts = { left: [r.left + 1, r.top + r.height / 2], right: [r.right - 1, r.top + r.height / 2], top: [r.left + r.width / 2, r.top + 1], bottom: [r.left + r.width / 2, r.bottom - 1] };
            for (const [edge, [x, y]] of Object.entries(pts)) {
                const hit = document.elementFromPoint(x, y);
                if (!hit || hit === el || el.contains(hit)) continue;
                const other = typed(hit) ? hit : hit.closest && hit.closest('input, textarea, [contenteditable="true"]');
                if (!other || other === el || !typed(other)) continue;
                const k = `${el.tagName.toLowerCase()}${cls(el)} ${Math.round(r.width)} x ${Math.round(r.height)} px: a tap on its ${edge} edge lands on ${other.tagName.toLowerCase()}${cls(other)} (the touch boxes overlap; want each hit area its own box's)`;
                groups.set(k, (groups.get(k) || 0) + 1);
            }
        }
    }
    scrollTo(sx, sy);
    return [...groups.entries()].map(([k, n]) => `${n} x ${k}`);
}

/* Node side: TOUCH-HIT (lf-hosts critic r2 F1). Real taps with page.mouse.click 1 px inside the 4 edge midpoints and 4 corners
   of every visible typed box's touch area (its border box) under `rootSel`; each tap must leave document.activeElement on that
   box. A box out of view is scrolled to the centre first; the focus is cleared before each tap. Returns one message per
   (class, point, landed-on) group. */
async function touchHit(page, rootSel) {
    const n = await page.evaluate((sel) => {
        const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
        const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .mq-sr, [aria-hidden="true"]'); };
        const list = [];
        for (const rt of document.querySelectorAll(sel)) for (const el of rt.querySelectorAll('input, textarea, [contenteditable="true"]')) {
            if (el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase())) continue;
            if (el.disabled || el.readOnly || !vis(el) || el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container, .hint-popup')) continue;
            if (!list.includes(el)) list.push(el);
        }
        window.__mqTouchHit = list;
        return list.length;
    }, rootSel);
    const groups = new Map();
    for (let i = 0; i < n; i++) {
        for (const pt of ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']) {
            const xy = await page.evaluate((i, pt) => {
                const el = window.__mqTouchHit[i];
                if (!el || !el.isConnected) return null;
                let r = el.getBoundingClientRect();
                if (r.top < 2 || r.left < 2 || r.bottom > innerHeight - 2 || r.right > innerWidth - 2) { el.scrollIntoView({ block: 'center', inline: 'center' }); r = el.getBoundingClientRect(); }
                if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
                // a corner of a rounded box is probed on its 45-degree diagonal 1 px inside the rounded edge (the box's own
                // shape: the browser hit-tests the rounded border box), i.e. inset 1 + r(1 - 1/sqrt 2); a square corner at 1 px
                let ci = 1;
                if (pt.includes('-')) { const cs = getComputedStyle(el); const rad = parseFloat(cs[{ 'top-left': 'borderTopLeftRadius', 'top-right': 'borderTopRightRadius', 'bottom-left': 'borderBottomLeftRadius', 'bottom-right': 'borderBottomRightRadius' }[pt]]) || 0; const rr = /%/.test(cs.borderTopLeftRadius) ? Math.min(r.width, r.height) * rad / 100 : Math.min(rad, r.width / 2, r.height / 2); ci = 1 + Math.ceil(rr * (1 - Math.SQRT1_2)); }
                const x = /left/.test(pt) ? r.left + ci : /right/.test(pt) ? r.right - ci : r.left + r.width / 2;
                const y = /top/.test(pt) ? r.top + ci : /bottom/.test(pt) ? r.bottom - ci : r.top + r.height / 2;
                return [x, y];
            }, i, pt);
            if (!xy) continue;
            await page.mouse.click(xy[0], xy[1]);
            const got = await page.evaluate((i) => {
                const el = window.__mqTouchHit[i], a = document.activeElement, all = window.__mqTouchHit;
                const cls = (e) => (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).filter((c) => !/^mq-(active-box|live-|wd-)/.test(c)).slice(0, 2).join('.') : '');
                if (a === el) return null;
                const r = el.getBoundingClientRect();
                const who = !a || a === document.body ? 'nothing (body)' : all.includes(a) ? `typed box ${all.indexOf(a)} (${a.tagName.toLowerCase()}${cls(a)})` : `${a.tagName.toLowerCase()}${cls(a)}`;
                return [`${el.tagName.toLowerCase()}${cls(el)} ${Math.round(r.width)} x ${Math.round(r.height)} px (typed box ${i})`, who];
            }, i);
            if (!got) continue;
            const k = `${got[0]}: a real tap 1 px inside its touch area's ${pt} ${pt.includes('-') ? 'corner' : 'edge'} focuses ${got[1]} (want that box)`;
            groups.set(k, (groups.get(k) || 0) + 1);
        }
    }
    await page.evaluate(() => { delete window.__mqTouchHit; });
    return [...groups.entries()].map(([k, n]) => (n > 1 ? `${n} x ${k}` : k));
}

/* In the page: FOCUS-RING (lf-hosts critic r1 F3: the focused word-work answer box drew a yellow #f2c200 outline, about
   1.6:1 on white, while the other answer boxes drew master's blue next-box ring). In every [data-ws-cell] cell under `rootSel`
   each visible typed box is focused in turn, the page's focus handlers settle (two frames), and its ring is read: the outline
   (style not none, width >= 1 px), else the first inset box-shadow with a spread >= 1 px. Every focused ANSWER PLACE of one
   cell draws ONE ring (same colour and width), and every focused WORKING box (carry, regroup, working row) one ring - master
   rings a focused answer box as the next box and a carry / working box with the plain focus outline - and every ring
   has a contrast >= 3:1 (AX-6) against the box's fill (white when the fill is transparent). A box judged wrong (red) is
   skipped. The focus is put back where it was. Returns one message per finding. */
async function RINGS(rootSel) {
    const SKIP = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden], .mq-sr, [aria-hidden="true"]'); };
    const rgb = (s) => { const m = /rgba?\(([^)]+)\)/.exec(String(s || '')); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
    const lum = (c) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const over = (c, bg) => ({ r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a), a: 1 });
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const split = (v) => { const out = []; let d = 0, cur = ''; for (const ch of String(v)) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
    const ring = (el) => {
        const cs = getComputedStyle(el);
        if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1) return { by: 'outline', color: cs.outlineColor, w: Math.round(parseFloat(cs.outlineWidth)) };
        for (const sh of split(cs.boxShadow)) {
            if (!/inset/.test(sh)) continue;
            const col = (/rgba?\([^)]*\)/.exec(sh) || [''])[0];
            const nums = sh.replace(/rgba?\([^)]*\)/, '').replace('inset', '').trim().split(/\s+/).map(parseFloat);
            if (nums.length >= 4 && nums[3] >= 1) return { by: 'inset shadow', color: col, w: Math.round(nums[3]) };
        }
        return { by: 'none', color: 'none', w: 0 };
    };
    const fillOf = (el) => { const c = rgb(getComputedStyle(el).backgroundColor); return c && c.a > 0.05 ? over(c, { r: 255, g: 255, b: 255, a: 1 }) : { r: 255, g: 255, b: 255, a: 1 }; };
    const before = document.activeElement;
    const out = [];
    const cells = new Set();
    for (const rt of document.querySelectorAll(rootSel)) for (const c of [rt, ...rt.querySelectorAll('[data-ws-cell]')]) if (c.hasAttribute('data-ws-cell')) cells.add(c);
    for (const cell of cells) {
        if (cell.parentElement && cell.parentElement.closest('[data-ws-cell]') && cells.has(cell.parentElement.closest('[data-ws-cell]'))) continue;   // the outer cell reads its inner ones
        const boxes = Array.from(cell.querySelectorAll('input, textarea')).filter((el) => !(el.tagName === 'INPUT' && SKIP.has((el.type || '').toLowerCase())) && vis(el) && !el.readOnly && !el.disabled
            && !/mq-live-wrong|mq-wd-empty|mq-wrong-digit|box-wrong/.test(String(el.className)) && !el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .next-btn-container, .hint-popup'));
        if (boxes.length < 1) continue;
        const looks = { 'answer place': new Map(), 'working box': new Map() };
        const OPT = '.mq-carry, .column-carry-input, .mq-opswork, .mq-wwork, [data-mq-work], [data-ws-slot^="regroup"], .mq-regroup';
        for (const el of boxes) {
            el.focus({ preventScroll: true });
            // the page's focusin handlers settle on the next frames (active-box.js marks the next box on rAF)
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            if (document.activeElement !== el) continue;
            const role = el.matches(OPT) || /carry|regroup/i.test(String(el.className)) ? 'working box' : 'answer place';
            const g = ring(el);
            const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).filter((c) => !/^mq-(active-box|live-|wd-)/.test(c)).slice(0, 2).join('.') : '';
            const par = el.parentElement && typeof el.parentElement.className === 'string' && el.parentElement.className.trim() ? ` in .${el.parentElement.className.trim().split(/\s+/)[0]}` : '';
            const sig = g.by === 'none' ? 'no ring' : `${g.color} ${g.w} px`;
            if (!looks[role].has(sig)) looks[role].set(sig, new Set());
            looks[role].get(sig).add(`${el.tagName.toLowerCase()}${cls}${par}`);
            const c = rgb(g.color);
            if (c) { const k = ratio(over(c, fillOf(el)), fillOf(el)); if (k < 3) out.push(`a focused ${el.tagName.toLowerCase()}${cls}${par} rings in ${g.color} (${g.by}), ${k.toFixed(2)}:1 against its fill (want >= 3:1, AX-6)`); }
        }
        for (const [role, m] of Object.entries(looks)) if (m.size > 1) out.push(`${m.size} focus looks among the ${role}s of one ${cell.getAttribute('data-ws-cell')} cell: ${[...m.entries()].map(([sig, who]) => `${sig} (${[...who].join(', ')})`).join(' vs ')} (want one ring for every focused ${role})`);
    }
    if (before && before.focus) before.focus({ preventScroll: true }); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    return [...new Set(out)];
}

/* In the page, on the worksheet / quiz host: CELL-READ and TOUCH-TARGET only (CLIP-X and FOCUS are the card's). */
function HOST_PROBE(host) {
    const sel = host === 'worksheet' ? '#worksheetView .problem-card.mq-wscard' : '#quizTakeView .mq-qtpaper';
    const cards = Array.from(document.querySelectorAll(sel));
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const findings = [];
    if (!cards.length) findings.push({ rule: 'CELL-READ', msg: `no ${sel} on the ${host} host (0 cells read)` });
    const bare = cards.filter((c) => ![c, ...c.querySelectorAll('[data-ws-cell]')].some((e) => e.hasAttribute('data-ws-cell') && vis(e)));
    if (bare.length) findings.push({ rule: 'CELL-READ', msg: `${bare.length} of ${cards.length} ${host} cell(s) carry no [data-ws-cell] (0 cells read there)` });
    const empty = window.CELL_EMPTY ? cards.filter((c) => window.CELL_EMPTY(c)) : [];
    if (empty.length) findings.push({ rule: 'CELL-READ', msg: `${empty.length} of ${cards.length} ${host} cell(s) hold no drawn mark and no answer slot (an empty cell that carries a kind)` });
    for (const t of TARGETS(sel)) findings.push({ rule: 'TOUCH-TARGET', msg: t });
    if (window.UNIQUE) for (const t of window.UNIQUE(sel)) findings.push({ rule: 'TOUCH-UNIQUE', msg: t });
    return { cards: cards.length, findings };
}

const FIXTURE = (variant) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px sans-serif}#questionCard{width:370px;margin:0 10px;overflow:hidden}
.ws-stack{display:grid;grid-template-columns:repeat(4,${variant === 'clip' ? '120px' : '48px'})}input.mq-digit{width:48px;height:48px;box-sizing:border-box}
${variant === 'small' ? 'input.mq-digit{width:40px;height:44px}' : ''}${variant === 'padded' ? 'input.mq-digit{width:48px;height:48px;padding:4px;margin:-4px;background-clip:content-box;border:0;box-shadow:inset 0 0 0 1px #000}' : ''}</style>
<div id="questionCard"><div id="questionText">Subtract.</div><div id="questionPaper"${variant === 'nocell' ? '' : variant === 'empty' ? ' data-ws-cell="legacy" style="min-height:80px"' : ' data-ws-cell="stack"'}>${variant === 'empty' ? '<div class="ws-stack"></div>' : `<div class="ws-stack">
<span>4</span><span>3</span><span>6</span><span>7</span>
<input class="mq-digit" data-ws-slot="ans-3"><input class="mq-digit" data-ws-slot="ans-2"><input class="mq-digit" data-ws-slot="ans-1"><input class="mq-digit" data-ws-slot="ans-0">
</div>`}</div><button id="qcCheckBtn">Check</button></div>
<script>{ const b = document.querySelectorAll('input.mq-digit')[${variant === 'focus' ? 0 : 3}]; if (b) b.focus(); }</script>`;
// critic r6 D2: the legacy column twin (add_10k_regroup, sub_1m_regroup): data-col "<id>-ans-<i>" boxes left to right,
// the focused one lifted 4 px by .mq-active-box. 'lifted' focuses the ones box (ok); 'lifted-tens' the tens box (FAIL).
// pilot r1 D5: the r1 screen twin's boxes (input.mq-cellslot) carry no place, no data-col and no digit class; the
// leftmost focused must FAIL, the rightmost pass ('bare-left' / 'bare-right').
const BARE = (variant) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px sans-serif}#questionCard{width:370px;margin:0 10px}
input{width:48px;height:48px}</style><div id="questionCard"><div id="questionText">Subtract.</div><div id="questionPaper" data-ws-cell="legacy"><div><span>4,367</span><span>- 2,244</span></div>
<div><input class="mq-cellslot"><input class="mq-cellslot"><input class="mq-cellslot"><input class="mq-cellslot"></div></div><button id="qcCheckBtn">Check</button></div>
<script>window.state = { currentQ: { printFormat: 'column-sub', cell: { template: 'stack' } } }; (() => { const b = document.querySelectorAll('input.mq-cellslot')[${variant === 'bare-right' ? 3 : 0}]; b.classList.add('mq-active-box'); b.focus(); })();</script>`;
const LEGACY = (variant) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:16px sans-serif}#questionCard{width:370px;margin:0 10px}
.column-answer-input{width:48px;height:48px}.mq-active-box{position:relative;top:-4px}</style>
<div id="questionCard"><div id="questionText">Add.</div><div id="questionPaper" data-ws-cell="legacy"><div class="column-problem"><div>4 3 6 7</div><div>+ 1 2 2 1</div>
<div><input class="column-answer-input" data-col="q1-ans-0"><input class="column-answer-input" data-col="q1-ans-1"><input class="column-answer-input" data-col="q1-ans-2"><input class="column-answer-input" data-col="q1-ans-3"></div>
</div></div><button id="qcCheckBtn">Check</button></div>
<script>window.state = { currentQ: { printFormat: 'column-addition' } }; (() => { const b = document.querySelectorAll('input.column-answer-input')[${variant === 'lifted' ? 3 : 2}]; b.classList.add('mq-active-box'); b.focus(); })();</script>`;

async function selfTest() {
    const puppeteer = require('puppeteer');
    const { chromePath } = require('../lib/ws-harness.cjs');
    const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath(), args: ['--no-sandbox'] });
    const fails = [];
    try {
        const page = await browser.newPage();
        // the tablet default (owner 2026-11-13). The fixtures below predate TOUCH; their CLIP-X / FOCUS cases judge every
        // rule but TOUCH (noTouch), and TOUCH has its own cases at the end.
        await page.setViewport({ width: 820, height: 1180 });
        const run0 = async (v) => { await page.setContent(FIXTURE(v)); await page.waitForFunction(() => document.readyState === 'complete'); await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`); return page.evaluate(PROBE); };
        const noTouch = (r) => Object.assign({}, r, { findings: r.findings.filter((x) => x.rule !== 'TOUCH') });
        const run = async (v) => noTouch(await run0(v));
        const good = await run('good');
        if (good.findings.length || good.focus !== 'ok') fails.push(`good fixture: ${JSON.stringify(good)}`);
        const f = await run('focus');
        if (!f.findings.some((x) => x.rule === 'FOCUS')) fails.push('leftmost box focused: no FOCUS finding');
        const c = await run('clip');
        if (!c.findings.some((x) => x.rule === 'CLIP-X')) fails.push('stack wider than the card: no CLIP-X finding');
        // CELL-READ (lf-checks queue 20): the card's paper with no [data-ws-cell] is a finding
        const nc = await run('nocell');
        if (!nc.findings.some((x) => x.rule === 'CELL-READ')) fails.push(`card paper with no [data-ws-cell]: no CELL-READ finding (${JSON.stringify(nc.findings)})`);
        // CELL-READ (lf-hosts critic r2 F3): a paper stamped with a kind but holding nothing is a finding (the host stamps
        // 'legacy' on any paper, so the r1 check passed by construction); the same item labelled "legacy" on the card while the
        // quiz labels it "fact" is a finding; labelled "fact" it is not
        const em = await run('empty');
        if (!em.findings.some((x) => x.rule === 'CELL-READ' && /no drawn mark and no answer slot/.test(x.msg))) fails.push(`card paper with a kind but nothing in it: a CELL-READ empty finding (${JSON.stringify(em.findings)})`);
        const kmod = 'data:text/javascript,' + encodeURIComponent("export function cellKindFor(q) { return { kind: 'fact' }; }");
        const kindOn = async (label) => { await page.setContent(`<div id="questionPaper" data-ws-cell="${label}"><span>3 x 4 =</span><input></div><script>window.state = { currentQ: { answerType: 'text', text: '3 x 4' } };</script>`); return page.evaluate(`(${CELL_KIND})(${JSON.stringify(kmod)})`); };
        const kl = await kindOn('legacy');
        if (!kl || !/labels this same item "fact"/.test(kl)) fails.push(`card "legacy", quiz "fact": a CELL-READ kind finding (${JSON.stringify(kl)})`);
        const kf = await kindOn('fact');
        if (kf) fails.push(`card "fact", quiz "fact": no CELL-READ kind finding (${JSON.stringify(kf)})`);
        // TOUCH-TARGET (lf-checks queue 10): 40 x 44 px answer boxes (word-stories F3) fail; a 40 px drawn box inside 48 px of
        // transparent padding passes
        const sm = await run('small');
        const st = sm.findings.find((x) => x.rule === 'TOUCH-TARGET');
        if (!st || !/4 x input\.mq-digit 40 x 44 px/.test(st.msg)) fails.push(`40 x 44 px answer boxes: a TOUCH-TARGET finding naming 4 x 40 x 44 (${JSON.stringify(sm.findings)})`);
        const pd = await run('padded');
        if (pd.findings.some((x) => x.rule === 'TOUCH-TARGET')) fails.push(`a drawn 40 px box in 48 px of transparent padding: no TOUCH-TARGET finding (${JSON.stringify(pd.findings)})`);
        await page.setContent('<div id="h"><input class="mq-carry" style="width:44px;height:44px"><input class="mq-wwork" style="width:44px;height:44px"><input style="width:46px;height:48px"><textarea style="width:60px;height:30px"></textarea><div class="mq-wsbar"><input style="width:20px;height:20px"></div></div>');
        const ht = await page.evaluate(TARGETS, '#h');
        if (ht.length !== 2 || !ht.some((t) => /46 x 48/.test(t)) || !ht.some((t) => /textarea 60 x 30/.test(t))) fails.push(`working boxes at 44 pass, a 46 px answer box and a 30 px textarea fail, the chrome bar is skipped: ${JSON.stringify(ht)}`);
        const runL = async (v) => { await page.setContent(LEGACY(v)); await page.waitForFunction(() => document.readyState === 'complete'); await page.evaluate(() => document.querySelector('.mq-active-box').focus()); await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`); return noTouch(await page.evaluate(PROBE)); };
        const lifted = await runL('lifted');
        if (lifted.focus !== 'ok' || lifted.findings.length) fails.push(`legacy ones box lifted 4 px by .mq-active-box and focused: must be ok (${JSON.stringify(lifted.findings)})`);
        const tens = await runL('lifted-tens');
        const tf = tens.findings.find((x) => x.rule === 'FOCUS');
        if (!tf || !/place 1,/.test(tf.msg) || !/place 0/.test(tf.msg)) fails.push(`legacy tens box focused: a FOCUS finding naming place 1 and the ones box (place 0) (${JSON.stringify(tens.findings)})`);
        const runB = async (v) => { await page.setContent(BARE(v)); await page.waitForFunction(() => document.readyState === 'complete'); await page.evaluate(() => document.querySelector('.mq-active-box').focus()); await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`); return noTouch(await page.evaluate(PROBE)); };
        const bl = await runB('bare-left');
        const bf = bl.findings.find((x) => x.rule === 'FOCUS');
        if (!bf || !/place 3,/.test(bf.msg)) fails.push(`r1 twin, leftmost box focused: a FOCUS finding at place 3 (${JSON.stringify(bl.findings)})`);
        const br = await runB('bare-right');
        if (br.focus !== 'ok') fails.push(`r1 twin, ones box focused: must be ok (${JSON.stringify(br.findings)})`);
        // TOUCH-UNIQUE (lf-hosts critic r1 F4): 48 px touch boxes of 44 px drawn boxes on a 47 px pitch overlap by 1 px (FAIL);
        // on a 48 px pitch each owns its own (OK)
        const uq = (pitch) => `<!doctype html><style>body{margin:0}#h{display:flex;gap:${pitch - 44}px;padding:20px}#h span{width:44px;height:44px;border:2px solid #000;box-sizing:border-box;display:flex}#h input{box-sizing:border-box;width:48px;height:48px;margin:-4px;padding:4px;border:0;background-clip:content-box;flex:none}</style><div id="h" data-ws-cell="words"><span><input class="mq-cellslot"></span><span><input class="mq-cellslot"></span><span><input class="mq-cellslot"></span></div>`;
        await page.setContent(uq(47)); await page.evaluate(`window.UNIQUE = ${UNIQUE}`);
        const u47 = await page.evaluate(() => window.UNIQUE('#h'));
        if (!u47.length || !/right edge lands on input\.mq-cellslot/.test(u47[0])) fails.push(`47 px pitch: a TOUCH-UNIQUE finding naming the right edge (${JSON.stringify(u47)})`);
        await page.setContent(uq(48)); await page.evaluate(`window.UNIQUE = ${UNIQUE}`);
        const u48 = await page.evaluate(() => window.UNIQUE('#h'));
        if (u48.length) fails.push(`48 px pitch: no TOUCH-UNIQUE finding (${JSON.stringify(u48)})`);
        // FOCUS-RING (lf-hosts critic r1 F3): the answer box outlined in yellow #f2c200 beside blue-ringed working boxes FAILS
        // (two looks, 1.6:1); every answer box in the one blue ring (inset shadow or an outline of the same colour / width), a carry
        // box in the plain black focus outline, is OK
        const fr = (ans) => `<!doctype html><style>body{margin:0}input{width:48px;height:48px;outline:none;border:2px solid #000}input:focus{box-shadow:inset 0 0 0 4px #1565d8}input.mq-carry:focus{box-shadow:none;outline:3px solid #000}${ans}</style><div id="c" data-ws-cell="words"><input class="mq-carry"><input class="w"><input class="w"><input class="ans"></div>`;
        await page.setContent(fr('input.ans:focus{box-shadow:none;outline:3px solid #f2c200;outline-offset:-7px}')); await page.evaluate(`window.RINGS = ${RINGS}`);
        const ry = await page.evaluate(() => window.RINGS('#c'));
        if (!ry.some((t) => /2 focus looks among the answer places/.test(t)) || !ry.some((t) => /1\.\d+:1 against its fill/.test(t))) fails.push(`yellow answer ring beside blue working rings: FOCUS-RING findings for two looks and the contrast (${JSON.stringify(ry)})`);
        await page.setContent(fr('input.ans:focus{box-shadow:none;outline:4px solid #1565d8;outline-offset:-8px}')); await page.evaluate(`window.RINGS = ${RINGS}`);
        const rb = await page.evaluate(() => window.RINGS('#c'));
        if (rb.length) fails.push(`one blue 4 px ring (inset shadow and outline): no FOCUS-RING finding (${JSON.stringify(rb)})`);
        // TOUCH (owner 2026-11-13): 40 px answer boxes FAIL at 820 and 1024; 48 px boxes pass; at an explicit 390 the floor is 44
        const touchAt = async (w, px) => { await page.setViewport({ width: w, height: 900 }); await page.setContent(BARE('bare-right').replace('input{width:48px;height:48px}', `input{width:${px}px;height:${px}px;box-sizing:border-box}`)); await page.waitForFunction(() => document.readyState === 'complete'); await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`); return (await page.evaluate(PROBE)).findings.filter((x) => x.rule === 'TOUCH'); };
        if (!(await touchAt(820, 40)).length) fails.push('TOUCH: 40 px answer boxes at 820 must FAIL');
        if (!(await touchAt(1024, 46)).length) fails.push('TOUCH: 46 px answer boxes at 1024 must FAIL');
        if ((await touchAt(1024, 48)).length) fails.push('TOUCH: 48 px answer boxes at 1024 must pass');
        if ((await touchAt(390, 45)).length) fails.push('TOUCH: 45 px answer boxes at an explicit 390 pass (44 px floor)');
    } finally { await browser.close(); }
    for (const f of fails) say(`  self-test FAIL: ${f}`);
    say(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 22 fixture pages)`);
    process.exit(fails.length ? 1 : 0);
}

/* Readiness waits (lf-hosts critic r1 F5: the fixed 900 + 400 ms sleeps measured a card whose word-work twin had not mounted
   yet on a slow run). Ready = the host's [data-ws-cell] cell is on the page, every boxed slot ([data-mq-cell]) holds its input
   (the twin has mounted), and a typed input sits in a cell - or, for an item with no typed answer (choices), 1.5 s have passed
   with the cell mounted. Each wait gives up after 10 s and the probe measures anyway (a missing cell is CELL-READ's finding). */
async function waitCells(page, rootSel) {
    await page.waitForFunction((sel, t0) => {
        const roots = Array.from(document.querySelectorAll(sel));
        if (!roots.length) return false;
        for (const rt of roots) {
            if (!(rt.matches('[data-ws-cell]') || rt.querySelector('[data-ws-cell]'))) return false;
            if (Array.from(rt.querySelectorAll('[data-mq-cell]')).some((b) => !b.querySelector('input, textarea') && !b.matches('input, textarea'))) return false;
        }
        return roots.some((rt) => rt.querySelector('[data-ws-cell] input:not([type=hidden]), [data-ws-cell] textarea, input:not([type=hidden])')) || Date.now() - t0 > 1500;
    }, { timeout: 10000, polling: 50 }, rootSel, Date.now()).catch(() => {});
}
const cardReady = (page) => waitCells(page, '#questionPaper');
const hostReady = (page, sel) => waitCells(page, sel);
/** Two animation frames: layout and the late re-ink pass settle before the probe reads. */
const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50)))));

/* --fixture FILE (a backtest row's state, lf-hosts critic r2 F3): the card checks (PROBE, CELL-READ's kind match) on a saved
   card page. The page sets window.__MQ_KIND_MOD to the module URL whose cellKindFor stands in for the app's (the quiz's rule). */
async function fixtureRun(file) {
    const puppeteer = require('puppeteer');
    const { chromePath } = require('../lib/ws-harness.cjs');
    const browser = await puppeteer.launch({ headless: 'new', executablePath: chromePath(), args: ['--no-sandbox'] });
    let findings = [];
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 820, height: 1180 });
        await page.setContent(fs.readFileSync(path.resolve(file), 'utf8'));
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`);
        const m = await page.evaluate(PROBE);
        findings = m.findings;
        const ck = await page.evaluate(`(${CELL_KIND})(window.__MQ_KIND_MOD)`);
        if (ck) findings.push({ rule: 'CELL-READ', msg: ck });
        if (ONLY.length) findings = findings.filter((f) => ONLY.includes(f.rule));
    } finally { await browser.close(); }
    for (const f of findings) say(`  ${path.basename(file)}: ${f.rule} ${f.msg}`);
    say(findings.length ? `${TOOL}: FAIL - ${findings.length} finding(s) on fixture ${path.basename(file)}` : `${TOOL}: OK (fixture ${path.basename(file)})`);
    process.exit(findings.length ? 1 : 0);
}

async function main() {
    if (has('self-test')) return selfTest();
    if (has('fixture')) { ONLY = String(arg('only', '')).split(',').map((r) => r.trim()).filter(Boolean); return fixtureRun(arg('fixture')); }
    const VALUE = new Set(['skills', 'sizes', 'items', 'shots', 'json', 'siblings-file', 'sibling-items', 'hosts', 'only']);
    const BOOL = new Set(['report-only', 'self-test', 'no-siblings-check', 'print-widths']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    const skills = String(arg('skills', '')).split(',').map((s) => s.trim()).filter(Boolean);
    if (!skills.length) { say(`${TOOL}: give --skills cat:skill,...`); say(`${TOOL}: FAIL - usage (an empty run checks nothing)`); process.exit(2); }
    // lf-hosts critic r2 F2: the default is the owner's screen set, from the one table (tests/lib/ws-screen-widths.cjs)
    const SW = require('../lib/ws-screen-widths.cjs');
    const DEFAULT_SIZES = [...SW.SCREEN_WIDTHS].sort((a, b) => a - b).map((w) => `${w}x${SW.heightOf(w)}`).join(',');
    const sizes = String(arg('sizes', DEFAULT_SIZES)).split(',').map((s) => { const m = /^(\d+)x(\d+)$/.exec(s.trim()); return m ? { w: +m[1], h: +m[2] } : null; });
    if (sizes.some((s) => !s)) { say(`${TOOL}: --sizes takes WxH,...`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    if (has('print-widths')) { say(`widths: ${sizes.map((z) => z.w).join(',')}`); process.exit(0); }
    const ITEMS = Math.max(1, +arg('items', '3'));
    // --only R1,R2 (a backtest row runs the rule it proves): findings of other rules are dropped
    ONLY = String(arg('only', '')).split(',').map((r) => r.trim()).filter(Boolean);
    HOSTS = String(arg('hosts', 'card,worksheet,quiz')).split(',').map((h) => h.trim()).filter(Boolean);
    if (!HOSTS.includes('card') || HOSTS.some((h) => !['card', 'worksheet', 'quiz'].includes(h))) { say(`${TOOL}: --hosts takes card plus worksheet and / or quiz`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    const SHOTS = arg('shots', null);
    // A14 "siblings clean" (critic r6 D2): the approved skills of the pinned list must pass, or the probe is wrong
    let sibs = [];
    if (!has('no-siblings-check')) {
        const sf = path.resolve(__dirname, '..', '..', arg('siblings-file', 'tests/fixtures/precritic/phone-card-siblings.json'));
        try { sibs = (JSON.parse(fs.readFileSync(sf, 'utf8')).skills || []).filter((k) => !skills.includes(k)); } catch (e) { say(`${TOOL}: cannot read the A14 siblings list ${sf}: ${e.message}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    }
    const SIB_ITEMS = Math.max(1, +arg('sibling-items', String(Math.min(ITEMS, 2))));
    const T0 = Date.now();
    const app = await open({ seed: 1, viewport: { width: sizes[0].w, height: sizes[0].h, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => d.accept().catch(() => {}));
    const fails = [], sibFails = [];
    const rows = [], sibRows = [];
    let mark = 0;
    const take = () => { const p = app.problems.slice(mark); mark = app.problems.length; return p; };
    const hostRows = [];
    const measure = async (list, items, out, outFails, label) => {
        const seenW = new Set();
        for (const size of sizes) {
            await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
            for (const s of list) {
                const [c, k] = s.split(':');
                for (let it = 0; it < items; it++) {
                    const tag = `${label}${s} ${size.w}x${size.h} item ${it + 1}`;
                    let m;
                    try {
                        await page.reload({ waitUntil: 'networkidle2' });
                        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS, { timeout: 30000 });
                        await page.evaluate((c, k, seed) => {
                            if (window.__wsReseed) window.__wsReseed(seed);
                            if (window.setUserRole) window.setUserRole('student', { persist: false });
                            window.state.quizMode = false;
                            window.skillQueue.length = 0;
                            window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
                            window.playSelectedSkills('practice');
                        }, c, k, hash(`${s}:phone:${it}`));
                        // flake hardening (lf-hosts critic r1 F5): wait for the card's cell and its mounted inputs, not a fixed 900 + 400 ms
                        await cardReady(page);
                        try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                        await settle(page);
                        await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`);
                        m = await page.evaluate(PROBE);
                        // FOCUS-RING moves the focus, so it runs after PROBE (and puts it back)
                        if (!m.error) for (const t of await page.evaluate(() => window.RINGS('#questionCard'))) m.findings.push({ rule: 'FOCUS-RING', msg: t });
                        // CELL-READ kind match (lf-hosts critic r2 F3)
                        if (!m.error) { const ck = await page.evaluate(`(${CELL_KIND})()`); if (ck) m.findings.push({ rule: 'CELL-READ', msg: ck }); }
                        // TOUCH-HIT (lf-hosts critic r2 F1): real taps; skipped when --only names other rules
                        if (!m.error && (!ONLY.length || ONLY.includes('TOUCH-HIT'))) for (const t of await touchHit(page, '#questionCard')) m.findings.push({ rule: 'TOUCH-HIT', msg: t });
                        m = keep(m);
                        if (m.error) throw new Error(m.error);
                    } catch (e) { outFails.push(`${tag}: ERR ${e.message}`); say(`${tag}: ERR ${e.message}`); continue; }
                    for (const p of take()) m.findings.push({ rule: 'PAGE-ERROR', msg: `[${p.type}] ${String(p.text).split('\n')[0].slice(0, 160)}` });
                    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${label ? 'sibling-' : ''}${size.w}x${size.h}-${c}-${k}-${it + 1}.png`) }); }
                    for (const f of m.findings) outFails.push(`${tag}: ${f.rule} ${f.msg}`);
                    out.push({ skill: s, size: `${size.w}x${size.h}`, item: it + 1, focus: m.focus, ones: m.onesHow || null, inputs: m.inputs, findings: m.findings });
                    say(`${tag}: ${m.findings.length ? 'FAIL' : 'ok'} (focus ${m.focus}${m.columnItem ? ` (column: ones first, the ones box by ${m.onesHow || 'entry order'})` : ''}, ${m.inputs} answer box(es), paper ${m.paperW} px)${m.findings.length ? '\n' + m.findings.map((f) => `    ${f.rule} ${f.msg}`).join('\n') : ''}`);
                }
                // the online worksheet and the quiz at the same width (TOUCH-TARGET and CELL-READ; once per width)
                if (seenW.has(`${s}@${size.w}`)) continue;
                seenW.add(`${s}@${size.w}`);
                for (const host of HOSTS.filter((h) => h !== 'card')) {
                    const tag = `${label}${s} ${size.w}x${size.h} ${host}`;
                    let m;
                    // lf-hosts critic r2 F4: a host that fails to render is retried ONCE (logged); a second failure is the finding
                    for (let attempt = 1; attempt <= 2; attempt++) {
                    m = undefined;
                    try {
                        await page.reload({ waitUntil: 'networkidle2' });
                        await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS, { timeout: 30000 });
                        const ok = await page.evaluate((c, k, host, seed) => {
                            try {
                                if (window.__wsReseed) window.__wsReseed(seed);
                                if (window.setUserRole) window.setUserRole('student', { persist: false });
                                const st = window.state;
                                if (host === 'worksheet') { st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 3; window.initWorksheet(); return true; }
                                const questions = [0, 1].map((i) => ({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i }))) }));
                                const test = { id: null, name: 'Phone', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }], settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                                window.handleQuizURL(window.compressTestForURL(test));
                                return true;
                            } catch (e) { return String((e && e.message) || e).slice(0, 160); }
                        }, c, k, host, hash(`${s}:phone:${host}`));
                        if (ok !== true) throw new Error(`the ${host} host did not render (${ok})`);
                        // lf-hosts critic r2 F4: the quiz's start screen (#qtStudentName) mounts after handleQuizURL; starting before
                        // it existed threw "Cannot set properties of null" (placevalue:expand quiz at 1366). Wait for it, then start.
                        if (host === 'quiz') {
                            await page.waitForFunction(() => !!document.getElementById('qtStudentName') && typeof window.startQuizTest === 'function', { timeout: 15000 });
                            const st = await page.evaluate(() => { try { const nm = document.getElementById('qtStudentName'); nm.value = 'A'; nm.dispatchEvent(new Event('input')); window.startQuizTest(); return true; } catch (e) { return String((e && e.message) || e).slice(0, 160); } });
                            if (st !== true) throw new Error(`the quiz did not start (${st})`);
                            await page.waitForFunction(() => document.querySelectorAll('#quizTakeView .mq-qtpaper').length > 0, { timeout: 15000 });
                        }
                        if (host === 'worksheet') await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 15000 }).catch(() => {});
                        try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                        await hostReady(page, host === 'worksheet' ? '#worksheetView .problem-card.mq-wscard' : '#quizTakeView .mq-qtpaper');
                        await settle(page);
                        await page.evaluate(`window.TARGETS = ${TARGETS}; window.UNIQUE = ${UNIQUE}; window.RINGS = ${RINGS}; window.CELL_EMPTY = ${CELL_EMPTY};`);
                        m = await page.evaluate(HOST_PROBE, host);
                        if (host === 'quiz') for (const t of await page.evaluate((sel) => window.RINGS(sel), '#quizTakeView .mq-qtpaper')) m.findings.push({ rule: 'FOCUS-RING', msg: t });
                        if (!ONLY.length || ONLY.includes('TOUCH-HIT')) for (const t of await touchHit(page, host === 'worksheet' ? '#worksheetView .problem-card.mq-wscard' : '#quizTakeView .mq-qtpaper')) m.findings.push({ rule: 'TOUCH-HIT', msg: t });
                        m = keep(m);
                    } catch (e) {
                        const errs = take();
                        if (attempt === 1) { say(`${tag}: RETRY after a failed render (${e.message}; ${errs.length} page error(s) dropped with it)`); continue; }
                        outFails.push(`${tag}: ERR ${e.message} (after 1 retry)`); say(`${tag}: ERR ${e.message} (after 1 retry)`); m = null;
                    }
                    break;
                    }
                    if (!m) continue;
                    for (const p of take()) m.findings.push({ rule: 'PAGE-ERROR', msg: `[${p.type}] ${String(p.text).split('\n')[0].slice(0, 160)}` });
                    for (const f of m.findings) outFails.push(`${tag}: ${f.rule} ${f.msg}`);
                    hostRows.push({ skill: s, size: `${size.w}x${size.h}`, host, cards: m.cards, findings: m.findings });
                    say(`${tag}: ${m.findings.length ? 'FAIL' : 'ok'} (${m.cards} cell(s))${m.findings.length ? '\n' + m.findings.map((f) => `    ${f.rule} ${f.msg}`).join('\n') : ''}`);
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
                }
            }
        }
    };
    try {
        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && !!window.SKILLS, { timeout: 30000 });
        const live = await page.evaluate(() => { const o = []; for (const [c, l] of Object.entries(window.SKILLS)) for (const s of l || []) if (s && s.v && !s.retired) o.push(`${c}:${s.v}`); return o; });
        const unknown = skills.filter((k) => !live.includes(k));
        if (unknown.length) { say(`${TOOL}: not live skill(s): ${unknown.join(', ')}`); say(`${TOOL}: FAIL - unknown skill(s) ${unknown.join(', ')}`); await app.close(); process.exit(1); }
        const deadSibs = sibs.filter((k) => !live.includes(k));
        for (const k of deadSibs) sibFails.push(`A14 sibling ${k} is not a live skill in this tree`);
        sibs = sibs.filter((k) => live.includes(k));
        take();
        await measure(skills, ITEMS, rows, fails, '');
        if (sibs.length) { say(`A14 siblings clean: ${sibs.length} approved skill(s) the probe must pass`); await measure(sibs, SIB_ITEMS, sibRows, sibFails, 'A14 sibling '); }
    } finally { await app.close(); }
    const secs = ((Date.now() - T0) / 1000).toFixed(1);
    if (has('json')) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT, skills, sizes: sizes.map((z) => `${z.w}x${z.h}`), items: ITEMS, hosts: HOSTS, rows, hostRows, fails, siblingsCheck: { skills: sibs, items: SIB_ITEMS, rows: sibRows, fails: sibFails }, seconds: +secs }, null, 1) + '\n');
    const want = skills.length * sizes.length * ITEMS;
    if (rows.length < want && !fails.length) fails.push(`only ${rows.length} of ${want} renders measured`);
    // the worksheet / quiz renders (once per skill and width): an unmeasured host is a failure, never a pass (lf-checks queue 20)
    const laneHost = hostRows.filter((r) => skills.includes(r.skill));
    const wantH = skills.length * new Set(sizes.map((z) => z.w)).size * (HOSTS.length - 1);
    if (laneHost.length < wantH && !fails.length) fails.push(`only ${laneHost.length} of ${wantH} worksheet / quiz renders measured`);
    const byRule = {};
    for (const r of [...rows, ...laneHost]) for (const f of r.findings) byRule[f.rule] = (byRule[f.rule] || 0) + 1;
    const a14 = has('no-siblings-check') ? 'A14 siblings check skipped (--no-siblings-check)' : sibFails.length ? `A14 siblings NOT clean: ${sibFails.length} finding(s) on approved skill(s) ${[...new Set(sibFails.map((f) => f.split(' ')[2]))].join(', ')}` : `A14 siblings clean (${sibs.length} approved skill(s) × ${sizes.length} size(s) × ${SIB_ITEMS} item(s))`;
    const tail = `${skills.length} skill(s) × ${sizes.length} size(s) × ${ITEMS} item(s): ${rows.length} of ${want} renders measured; ${HOSTS.length > 1 ? `${HOSTS.filter((h) => h !== 'card').join(' + ')} ${laneHost.length} of ${wantH} renders; ` : ''}${a14}; ${secs} s`;
    let line;
    if (sibFails.length) line = `${TOOL}: FAIL - the probe misjudges approved skills (A14 siblings not clean), so its verdict cannot be trusted: ${sibFails.slice(0, 3).join(' | ').slice(0, 400)}${fails.length ? `; the lane's own: ${fails.length} finding(s)` : ''} (${tail})`;
    else if (fails.length) line = `${TOOL}: FAIL - ${fails.length} finding(s) (${Object.entries(byRule).map(([k, v]) => `${k} ${v}`).join(', ') || 'render errors'}) (${tail})`;
    else line = `${TOOL}: OK (${tail})`;
    say(line);
    process.exit((fails.length || sibFails.length) && !has('report-only') ? 1 : 0);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(1); });
