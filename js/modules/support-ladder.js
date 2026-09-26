// support-ladder.js — THE SUPPORT LADDER for wrong answers on screen  (owner request 2026-09-25)
//
// "If an answer goes wrong, that is where to include one of our supports, and each time they get
// it wrong you can either add more / different approach to supports."
//
// One item, one ladder. Each wrong answer on the SAME item climbs one rung; the next item starts
// clean (the ladder is keyed by the question object, so nothing carries over).
//
//   wrong 1   the pupil's entry stays (marked gently, no red flood) and the skill's FIRST support
//             is drawn in the cell: the first support its provider declares (`supports`, the S2
//             list) that this item can draw — touch dots on the numbers, the dot tile / ten frame
//             / number line pane, the step checklist, the boxed sign or start arrow.
//   wrong 2   a DIFFERENT approach is ADDED: the first declared support of another kind (a
//             picture after touch dots, a checklist after a picture), never the first one again.
//   wrong 3   the worked steps for THIS item (the provider's `workedSteps`), calm and black and
//             white, with every answer number left as a blank to fill, and the Say: line (read
//             aloud with the app's voice when Voice is on). Then the pupil answers again.
//   wrong 4+  the ladder is spent: the host's own answer-reveal behaviour.
//
// A support never gives the answer away (S8, L-SUPPORT): a picture draws the given numbers, not
// the result; the worked steps blank the answer and cut a count that runs up to it.
//
// Where it runs: the practice card (answer-check.js), each online worksheet card (worksheet.js)
// and a quiz ONLY when its feedback is "instant" (quiz-take.js). Never a test-style quiz.
//
// The teacher decides how much help: Settings -> "Help after a wrong answer": support ladder (the
// default) / worked example only / none. A Direct Play link carries a non-default choice (the
// settings suffix token `H`: H1 worked example only, H0 none), so a class gets the teacher's
// choice. A set whose Support level is 0 only ("nothing given") has supports turned off: its
// ladder is the worked example alone.
//
// What was shown is recorded per skill for the session (state.sessionHelp -> the session
// history's `h`: {supportId: times shown, worked: n}), so progress can show it later.
//
// Layer 4 (state, storage, the sheet kit, screen-cell.js). No window writes.

import { state } from './state.js';
import { getCookie, setCookie } from './storage.js';
import {
    getProvider, canDraw, supportCompat, TOUCH_IDS, SUPPORT_IDS, COUNT_STEPS, withSupports, k2Twin,
    supportOpKey as opKey, renderCell, wordWorkTwin, WW_TEMPLATE,
} from './sheet/index.js';
import { declaredSupports } from './sheet/providers/util.js';
import { renderPane, PANES } from './sheet/cells/panes/index.js';
import { cellKindFor, kindHTML, binaryParts, regroupFor } from './screen-cell.js';

/* ------------------------------------------------------------------ the teacher's setting */

export const HELP_MODES = Object.freeze(['ladder', 'worked', 'none']);
const COOKIE = 'mathquest_help';
let _linkMode = null;          // a Direct Play link's choice, for this visit only

/** The help after a wrong answer: 'ladder' (default) | 'worked' | 'none'. */
export function helpMode() {
    if (_linkMode) return _linkMode;
    if (!HELP_MODES.includes(state.helpAfterWrong)) {
        let saved = null;
        try { saved = getCookie(COOKIE); } catch (e) { saved = null; }
        state.helpAfterWrong = HELP_MODES.includes(saved) ? saved : 'ladder';
    }
    return state.helpAfterWrong;
}

/** Settings -> "Help after a wrong answer". `link: true` = a shared link's choice (not saved). */
export function setHelpAfterWrong(mode, { link = false } = {}) {
    const m = HELP_MODES.includes(mode) ? mode : 'ladder';
    if (link) { _linkMode = m; return m; }
    _linkMode = null;
    state.helpAfterWrong = m;
    try { setCookie(COOKIE, m, 365); } catch (e) { /* not saved: still applies this visit */ }
    return m;
}

/** The settings-suffix token of a Direct Play link ('' for the default). */
export const helpShareToken = () => ({ worked: 'H1', none: 'H0' }[helpMode()] || '');
/** A settings-suffix token's value back to a mode (unknown: the default). */
export const helpFromToken = (v) => (v === '1' ? 'worked' : v === '0' ? 'none' : 'ladder');

/** The set's options for an item (its own, else the session's). */
function optionsOf(q, ctx) {
    return (q && q.skillOptions) || ctx.options || state.skillOptions || null;
}

/** Did the teacher turn the set's supports off? A Support level of 0 only ("nothing given"). */
export function supportsOff(o) {
    if (!o || typeof o !== 'object') return false;
    if (o.poolSupport === 0 || o.poolSupport === '0') return true;
    return Array.isArray(o.level) && o.level.length > 0 && o.level.every((v) => Number(v) === 0);
}

/** The mode for this item: the setting, narrowed to the worked example when supports are off. */
export function modeFor(q, ctx = {}) {
    const m = helpMode();
    if (m === 'ladder' && supportsOff(optionsOf(q, ctx))) return 'worked';
    return m;
}

/* ------------------------------------------------------------------ the item's candidates */

const SCREEN_TEMPLATE = { eq: 'equation', fact: 'fact', stack: 'stack', division: 'division' };
const MARK_IDS = ['boxsign', 'startarrow', 'steps', 'wpCues'];
// On screen the ladder draws: touch dots, the boxed sign and the start arrow IN the kit cell (the
// same code as paper); the dot tile and ten frame as counters BESIDE the number they stand for
// (drawTiles); every other picture as its S4 pane under the problem, at a touchable size.
const KIT_IDS = ['touch', 'touchall', 'boxsign', 'startarrow'];
const TILE_IDS = ['tile', 'frame'];
const PANE_FOR = { line: 'numberline', skip: 'numberline', array: 'array', think: 'bar' };
/** The kind of a support: touch dots, a mark / checklist, or a picture. Rung 2 changes kind. */
export const supportKind = (id) => (TOUCH_IDS.includes(id) ? 'touch' : MARK_IDS.includes(id) ? 'mark' : 'picture');

// The clock's checklists (no answer in them). The minute ring is the clock's picture support.
const TIME_STEPS = {
    60: ['Short hand: the hour.', "Long hand on 12: o'clock.", 'Write the time.'],
    30: ['Short hand: the hour.', 'Long hand on 6: half past.', 'Write the time.'],
    1: ['Short hand: the hour.', 'Long hand: 5s, then 1s.', 'Write the time.'],
    other: ['Short hand: the hour.', 'Long hand: count by 5s.', 'Write the time.'],
};
const DRAW_STEPS = ['Long hand: the minutes.', 'Short hand: the hour.', 'Check both hands.'];

function whereFrom(q, ctx) {
    const skill = (q && (q.requestedSkillId || q.skillId)) || ctx.skillId || state.skill || '';
    const cat = (q && (q.poolMember || q.categoryId)) || ctx.categoryId || state.category || '';
    return { cat, skill };
}

function declaredOf(q, ctx) {
    const { cat, skill } = whereFrom(q, ctx);
    let p = null;
    try { p = getProvider(cat, skill); } catch (e) { p = null; }
    try { return declaredSupports(cat, p); } catch (e) { return []; }
}

const countN = (q) => {
    const c = q && q.cell;
    if (!c || !c.payload) return null;
    if (!['counters', 'k2-count'].includes(c.template)) return null;
    const n = Number(c.payload.n ?? c.payload.count);
    return c.payload.kind === 'count' && Number.isInteger(n) && n > 0 ? n : null;
};

/**
 * Every support this item can draw on screen, in the order its skill declares them:
 * [{id, how, payload?, steps?}]. `how`: 'kit' (redrawn in the kit cell: touch dots, cues,
 * panes), 'eq' (a pane under a legacy-drawn fact), 'pane' (a pane under the drawing), 'ring' (the
 * clock face with its minute ring).
 */
export function candidatesFor(q, ctx = {}) {
    if (!q) return [];
    const declared = declaredOf(q, ctx);
    const c = q.cell;
    // the word-work cell: its own keyword supports (the payload flags hl / bar / kb)
    if (c && c.template === WW_TEMPLATE && c.payload && Array.isArray(c.payload.steps)) {
        const p = c.payload;
        const out = [];
        if (!p.hl) out.push({ id: 'wpCues', how: 'ww', flag: 'hl' });
        if (!p.bar && p.steps.length === 1) out.push({ id: 'wpBar', how: 'ww', flag: 'bar' });
        else if (!p.kb) out.push({ id: 'wpBank', how: 'ww', flag: 'kb' });
        return out;
    }
    // the draw-the-hands widget: its minute ring, then the checklist
    if (q.answerType === 'clock-set') {
        return [{ id: 'ring', how: 'csring' }, { id: 'steps', how: 'pane', pane: 'steps', payload: { steps: DRAW_STEPS } }];
    }
    const kind = ctx.kind !== undefined ? ctx.kind : cellKindFor(Object.assign({}, q, { options: [] }));
    const bp = kind && SCREEN_TEMPLATE[kind.kind] ? null : binaryParts(Object.assign({}, q, { options: [] }));
    if ((kind && SCREEN_TEMPLATE[kind.kind]) || bp) {
        const tpl = kind && SCREEN_TEMPLATE[kind.kind] ? SCREEN_TEMPLATE[kind.kind] : 'equation';
        const k = kind && SCREEN_TEMPLATE[kind.kind] ? kind : bp;
        const p = { a: k.a, b: k.b, op: k.op, operands: k.operands };
        const pay = { op: opKey(k.op), a: Number(k.a), b: Number(k.b) };
        return declared
            .filter((id) => !(bp && TOUCH_IDS.includes(id) && opKey(bp.op) !== '/'))
            .filter((id) => { try { return canDraw(id, p, tpl); } catch (e) { return false; } })
            .map((id) => (KIT_IDS.includes(id) ? (bp ? { id, how: 'eq', payload: pay } : { id, how: 'kit' })
                : TILE_IDS.includes(id) ? { id, how: 'tile', payload: pay }
                    : { id, how: 'pane', pane: PANE_FOR[id] || id, payload: pay }))
            .filter((r) => r.how !== 'pane' || !!(PANES[r.pane] && PANES[r.pane].accepts(r.payload)));
    }
    // rounding (the pv `round` cell, and one number rounded to several places: its first place):
    // the skill's rounding panes and its checklist
    const rmulti = c && c.template === 'pv' && c.payload && c.payload.kind === 'round-multi' && Array.isArray(c.payload.places);
    if (c && c.template === 'pv' && c.payload && (c.payload.kind === 'round' || rmulti) && Number.isFinite(Number(c.payload.n))) {
        const pay = { kind: 'round', n: Number(c.payload.n), place: Number(rmulti ? c.payload.places[0] : c.payload.place) };
        return declared.map((id) => ({ id, how: 'pane', pane: id, payload: pay }))
            .filter((r) => !!(PANES[r.pane] && PANES[r.pane].accepts(r.payload)));
    }
    if (c && c.template === 'clock' && c.payload) {
        const P = Number(c.payload.precision) || 60;
        if (c.payload.kind === 'read') {
            return [{ id: 'ring', how: 'ring' }, { id: 'steps', how: 'pane', payload: { steps: TIME_STEPS[P] || TIME_STEPS.other } }];
        }
        if (c.payload.kind === 'draw' || c.payload.kind === 'words') {
            return [{ id: 'steps', how: 'pane', payload: { steps: c.payload.kind === 'draw' ? DRAW_STEPS : TIME_STEPS[P] || TIME_STEPS.other } }];
        }
        return [];
    }
    // coins to count: the counting-on checklist (no amount in it)
    if (c && c.template === 'coins' && c.payload) {
        return [{ id: 'steps', how: 'pane', payload: { steps: ['Start with the biggest coin.', 'Count on by each coin.', 'Write the total.'] } }];
    }
    const n = countN(q);
    if (n) {
        const out = [];
        const pay = { n, kind: 'count', steps: COUNT_STEPS };
        if (declared.includes('steps')) out.push({ id: 'steps', how: 'pane', payload: pay });
        // A second approach for a count the skill does not declare one for: the same count in a
        // ten frame (the counters re-arranged in fives; the numeral is never drawn).
        if (n <= 20 && PANES.tenframe && PANES.tenframe.accepts({ n, kind: 'count' })) out.push({ id: 'tenframe', how: 'pane', payload: { n, kind: 'count' } });
        return out;
    }
    // box division: the divide-multiply-subtract-bring-down checklist
    const bd = q.boxDivisionData;
    if (bd && Number(bd.dividend) > 0 && Number(bd.divisor) > 0) {
        return [{ id: 'steps', how: 'pane', payload: { op: '/', a: Number(bd.dividend), b: Number(bd.divisor) } }];
    }
    // perimeter and area: what each one asks for
    if (q.dualAnswers && q.dualAnswers.perimeter != null) {
        return [{ id: 'steps', how: 'pane', payload: { steps: ['Perimeter: add every side.', 'Area: length × width.', 'Write both.'] } }];
    }
    return [];
}

const clashes = (x, y) => {
    if (x === y) return true;
    if (!SUPPORT_IDS.includes(x) || !SUPPORT_IDS.includes(y)) return false;
    try { return supportCompat(x, y) === 'clash'; } catch (e) { return false; }
};

/**
 * The rungs of this item's ladder, in order: [first support?, a different second one?, worked].
 * 'worked' mode: the worked steps alone. 'none': no rungs (the host's own behaviour at once).
 */
export function rungsFor(q, ctx = {}) {
    const mode = modeFor(q, ctx);
    if (mode === 'none') return [];
    if (mode === 'worked') return [{ id: 'worked', how: 'worked' }];
    const c = candidatesFor(q, ctx);
    const out = [];
    if (c.length) {
        const r1 = c[0];
        out.push(r1);
        // A different approach: the first declared support of another kind. When it cannot stand
        // on one problem with the first (two ways of counting, S4.7), it takes the first's place.
        const r2 = c.find((x) => x.id !== r1.id && supportKind(x.id) !== supportKind(r1.id))
            || c.find((x) => x.id !== r1.id && !clashes(r1.id, x.id));
        if (r2) out.push(r2);
    }
    out.push({ id: 'worked', how: 'worked' });
    return out;
}

/* ------------------------------------------------------------------ one item's ladder */

const _entries = new WeakMap();

/** The ladder state of an item (null before its first wrong answer). */
export function ladderOf(q) {
    return (q && typeof q === 'object' && _entries.get(q)) || null;
}

/** The rungs climbed so far (cumulative), and whether the ladder is spent. */
export function shownOf(q) {
    const e = ladderOf(q);
    if (!e) return { rungs: [], drawn: [], ids: [], drawnIds: [], worked: false, spent: false, n: 0 };
    const rungs = e.rungs.slice(0, Math.min(e.n, e.rungs.length));
    // What is drawn now: each rung ADDED, except that a support which clashes with an earlier one
    // (two ways of counting on one problem) REPLACES it.
    const drawn = [];
    for (const r of rungs) {
        if (r.id === 'worked') continue;
        for (let i = drawn.length - 1; i >= 0; i--) if (clashes(drawn[i].id, r.id)) drawn.splice(i, 1);
        drawn.push(r);
    }
    return { rungs, drawn, ids: rungs.map((r) => r.id), drawnIds: drawn.map((r) => r.id), worked: rungs.some((r) => r.id === 'worked'), spent: e.n > e.rungs.length, n: e.n };
}

const NAMES = {
    touch: 'the touch dots', touchall: 'the touch dots', tile: 'the dot tiles', frame: 'the ten frame', tenframe: 'the ten frame',
    line: 'the number line', skip: 'the number line', numberline: 'the number line', array: 'the array', think: 'the bar',
    bar: 'the bar', dice: 'the dot tiles', boxsign: 'the sign', startarrow: 'the arrow', steps: 'the steps', ring: 'the minute ring',
    'round-pv': 'the place value chart', 'round-mark': 'the marks', objects: 'the counters', base10: 'the blocks',
    wpCues: 'the key words', wpBar: 'the bar model', wpBank: 'the key word box',
};

/**
 * A wrong answer on item `q`. `value` is what the pupil entered; with `dedupe` (a host that checks
 * as the pupil types) the same wrong value twice is one wrong answer. Returns null when the ladder
 * is off, else {n, rung, spent, repeat, message}.
 */
export function ladderWrong(q, value, ctx = {}) {
    if (!q || typeof q !== 'object') return null;
    let e = _entries.get(q);
    if (!e) {
        const rungs = rungsFor(q, ctx);
        if (!rungs.length) return null;
        e = { n: 0, last: null, rungs };
        _entries.set(q, e);
    }
    const v = String(value == null ? '' : value).trim();
    if (ctx.dedupe && e.n > 0 && e.last === v) return { n: e.n, rung: e.rungs[Math.min(e.n, e.rungs.length) - 1] || null, spent: e.n > e.rungs.length, repeat: true, message: messageFor(e) };
    e.last = v;
    e.n += 1;
    const spent = e.n > e.rungs.length;
    const rung = spent ? null : e.rungs[e.n - 1];
    if (rung) recordHelp(q, rung.id, ctx);
    return { n: e.n, rung, spent, repeat: false, message: messageFor(e) };
}

/**
 * Will the NEXT wrong answer on this item climb a rung (true), or is the ladder off or spent?
 * The practice card asks before it paints its wrong-answer chrome, so a ladder step is calm.
 */
export function ladderWillHelp(q, ctx = {}) {
    if (!q || typeof q !== 'object') return false;
    const e = _entries.get(q);
    if (e) return e.n < e.rungs.length;
    return rungsFor(q, ctx).length > 0;
}

/** The calm message of the item's current rung ('' before a wrong answer or once spent). */
export function ladderMessage(q) {
    const e = ladderOf(q);
    return e && e.n ? messageFor(e) : '';
}

function messageFor(e) {
    if (e.n > e.rungs.length) return '';
    const r = e.rungs[e.n - 1];
    if (r.id === 'worked') return 'Here is how. Finish it, then try again.';
    const name = NAMES[r.id] || 'the help';
    if (e.n === 1) return `Not yet. Use ${name}, then try again.`;
    return clashes(e.rungs[0].id, r.id) ? `Not yet. Now try ${name}.` : `Not yet. Now use ${name} too.`;
}

/** Session data (small): per skill, how many times each support and the worked steps were shown. */
function recordHelp(q, id, ctx) {
    try {
        const { skill } = whereFrom(q, ctx);
        const key = skill || 'unknown';
        if (!state.sessionHelp || typeof state.sessionHelp !== 'object') state.sessionHelp = {};
        const row = state.sessionHelp[key] || (state.sessionHelp[key] = {});
        row[id] = (row[id] || 0) + 1;
    } catch (e) { /* never break the answer flow */ }
}

/* ------------------------------------------------------------------ drawing */

const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SCREEN_CTX = { mode: 'screen', size: 'L', metrics: { digitPt: 28 } };
// Pictures at L, marks and the checklist at M: drawn in --mq-k2 px per paper mm, which the ladder
// raises to at least the true millimetre (3.8 px) so a counter keeps its RP-5 touch size on screen.
const PANE_CTX = (id) => ({ size: MARK_IDS.includes(id) ? 'M' : 'L', twin: true, ink: 'black', sentence: false });

/** The item's kit drawing inside `root` (the outermost `.ws-supported` / `.ws-sheet.mq-kit`). */
function kitRootIn(root) {
    const all = Array.from(root.querySelectorAll('.ws-supported, .ws-sheet.mq-kit'));
    return all.find((el) => { const up = el.parentElement && el.parentElement.closest('.ws-supported'); return !up || !root.contains(up); }) || null;
}

/**
 * Redraw the kit cell with the ladder's supports `ids` (touch dots, boxed sign, start arrow) beside
 * the ones the set gave it; `[]` takes the ladder's off again. The pupil's live inputs (their
 * entry, their listeners) are moved into the new drawing, never re-created.
 */
function redrawKit(root, q, ids, ctx) {
    const kind = ctx.kind || cellKindFor(Object.assign({}, q, { options: [] }));
    if (!kind || !SCREEN_TEMPLATE[kind.kind]) return false;
    const old = kitRootIn(root);
    if (!old) return false;
    const mine = String(old.getAttribute('data-mq-ladder') || '').split(/\s+/).filter(Boolean);
    const had = old.classList.contains('ws-supported') ? String(old.getAttribute('data-ws-supports') || '').split(/\s+/).filter((x) => x && !mine.includes(x)) : [];
    const on = [...new Set([...had.filter((x) => !ids.some((y) => y !== x && clashes(x, y))), ...ids])];
    const supports = { on };
    if (opKey(kind.op) === '/') supports.tally = 10;
    const oldInputs = Array.from(old.querySelectorAll('input, select, textarea'));
    const html = kind.kind === 'stack'
        ? kindHTML(kind, { regroup: regroupFor(q.skillId || ctx.skillId || state.skill), supports })
        : kindHTML(kind, { slotHtml: '<span class="mq-slothost"></span>', supports });
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const fresh = tpl.content.firstElementChild;
    if (!fresh) return false;
    if (kind.kind === 'stack') {
        const neu = Array.from(fresh.querySelectorAll('input, select, textarea'));
        if (neu.length !== oldInputs.length) return false;
        neu.forEach((n, i) => n.replaceWith(oldInputs[i]));
    } else {
        const host = fresh.querySelector('.mq-slothost');
        if (oldInputs.length > 1) return false;
        if (host) { if (oldInputs[0]) host.replaceWith(oldInputs[0]); else host.remove(); }
    }
    fresh.setAttribute('data-mq-ladder', ids.join(' '));
    const focused = typeof document !== 'undefined' ? document.activeElement : null;
    old.replaceWith(fresh);
    // the pupil may be typing in the moved input: moving an element drops its focus
    if (focused && oldInputs.includes(focused) && document.activeElement !== focused) {
        try { focused.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    }
    return true;
}

/* ---- counters beside their number (the dot tile / ten frame on screen) */

// One ten frame (or two, past 10): cells of 10 units, counters of radius 4 (0.8 of a cell). Drawn
// at least 78 px tall, a 26 px counter (6.9 mm, RP-5: ten-frame counters 6.5-7 mm). The last
// `cross` counters carry a white-edged cross: the ones taken away.
const TILE_MIN_PX = 78;
function frameSVG(n, cross = 0) {
    const frames = n > 10 ? 2 : 1;
    const FW = 52, GAP = 5, W = frames * FW + (frames - 1) * GAP, H = 22;
    let body = '';
    for (let f = 0; f < frames; f++) {
        const x0 = f * (FW + GAP) + 1;
        body += `<rect x="${x0}" y="1" width="50" height="20" rx="2" fill="#fff" stroke="#000" stroke-width="1.1"/>`;
        for (let k = 1; k < 5; k++) body += `<line x1="${x0 + k * 10}" y1="1" x2="${x0 + k * 10}" y2="21" stroke="#000" stroke-width="0.6"/>`;
        body += `<line x1="${x0}" y1="11" x2="${x0 + 50}" y2="11" stroke="#000" stroke-width="0.6"/>`;
    }
    for (let i = 0; i < n; i++) {
        const f = Math.floor(i / 10), j = i % 10;
        const cx = f * (FW + GAP) + 1 + 5 + (j % 5) * 10, cy = 1 + 5 + Math.floor(j / 5) * 10;
        body += `<circle cx="${cx}" cy="${cy}" r="4" fill="#000"/>`;
        if (i >= n - cross) {
            const d = 3.2;
            const x = (w, c) => `<line x1="${cx - d}" y1="${cy - d}" x2="${cx + d}" y2="${cy + d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`
                + `<line x1="${cx - d}" y1="${cy + d}" x2="${cx + d}" y2="${cy - d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
            body += x(2.4, '#fff') + x(1.1, '#000');
        }
    }
    const label = cross ? `${n} counters, ${cross} crossed out` : `${n} counters`;
    return `<svg class="mq-ladder-frame" viewBox="0 0 ${W + 2} ${H + 2}" role="img" aria-label="${label}" style="display:block;height:var(--mq-lad-tile, ${TILE_MIN_PX}px);width:auto;max-width:100%;">${body}</svg>`;
}

/** The counters a tile rung draws: [{at: 'a'|'b', n, cross}] (addition: each addend to 10; subtraction: the minuend, the rest crossed out). */
function tileParts(pay) {
    const { op, a, b } = pay || {};
    if (op === '+') return [{ at: 'a', n: a, cross: 0 }, { at: 'b', n: b, cross: 0 }].filter((t) => t.n > 0 && t.n <= 10);
    if (op === '-' && a > 0 && a <= 20 && b >= 0 && b <= a) return [{ at: 'a', n: a, cross: b }];
    return [];
}

/**
 * Put the counters BESIDE the number each stands for: a vertical fact gets a column of frames,
 * one level with each row (its rows grow to the frame's height, so they line up at any digit
 * size); a horizontal fact gets each frame under its number. Returns the frames it could not
 * place there (drawn under the problem instead).
 */
function drawTiles(root, q, r, ctx) {
    const parts = tileParts(r.payload);
    if (!parts.length) return [];
    const kr = kitRootIn(root);
    if (!kr) return parts;
    if (kr.querySelector('.mq-ladder-tiles, .mq-ladder-under')) return [];
    const fact = kr.querySelector('.ws-fact');
    const eq = kr.querySelector('.ws-eq');
    const fs = parseFloat(getComputedStyle(fact || eq || kr).fontSize) || 40;
    const tileH = Math.max(TILE_MIN_PX, Math.round(fs * 1.2));
    // beside the rows when the cell has room for the fact, a gap and one frame (2.25 x its height)
    // (the fact is a grid block as wide as its cell: its INK width is its tracks')
    let factW = 0;
    if (fact) {
        const rs = Array.from(fact.children).map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
        factW = rs.length ? Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left)) : fact.offsetWidth;
    }
    const room = !fact || !root.clientWidth || root.clientWidth >= factW + 16 + tileH * 2.25;
    if (fact && !parts.some((t) => t.n > 10) && room) {
        fact.setAttribute('data-mq-ladder-tiles', '1');
        fact.style.setProperty('--mq-lad-row', `${tileH + 6}px`);
        const wrap = document.createElement('div');
        wrap.className = 'mq-lad-beside';
        fact.parentNode.insertBefore(wrap, fact);
        wrap.appendChild(fact);
        const col = document.createElement('div');
        col.className = 'mq-ladder-tiles';
        col.setAttribute('data-mq-ladder-on', r.id);
        col.style.cssText = `--mq-lad-tile:${tileH}px;padding-top:${getComputedStyle(fact).paddingTop};display:grid;grid-template-rows:repeat(2, ${tileH + 6}px);align-items:center;`;
        col.innerHTML = ['a', 'b'].map((at) => { const t = parts.find((x) => x.at === at); return `<div>${t ? frameSVG(t.n, t.cross) : ''}</div>`; }).join('');
        wrap.appendChild(col);
        return [];
    }
    if (eq && eq.children.length >= 3 && !parts.some((t) => t.n > 10)) {
        const spans = { a: eq.children[0], b: eq.children[2] };
        eq.style.alignItems = 'flex-start';
        eq.setAttribute('data-mq-ladder-on', r.id);
        for (const t of parts) {
            const sp = spans[t.at];
            if (!sp) continue;
            sp.style.display = 'inline-flex';
            sp.style.flexDirection = 'column';
            sp.style.alignItems = 'center';
            const box = document.createElement('span');
            box.className = 'mq-ladder-under';
            box.style.cssText = `--mq-lad-tile:${Math.min(tileH, 88)}px;margin-top:8px;line-height:0;`;
            box.innerHTML = frameSVG(t.n, t.cross);
            sp.appendChild(box);
        }
        return [];
    }
    return parts;
}

/** The clock face again, with its minute ring (the payload flag `ring: 'on'`). */
function ringClock(root, q) {
    const c = q.cell;
    const face = root.querySelector('.k2-twin[data-mq-template="clock"] svg, .tm-read svg');
    if (!c || !c.payload || !face) return false;
    const tpl = document.createElement('template');
    try { tpl.innerHTML = k2Twin('clock', Object.assign({}, c.payload, { ring: 'on' })); } catch (e) { return false; }
    const neu = tpl.content.querySelector('.tm-read svg') || tpl.content.querySelector('svg');
    if (!neu) return false;
    neu.setAttribute('data-mq-ladder', 'ring');
    face.replaceWith(neu);
    return true;
}

/**
 * The draw-the-hands widget's minute ring (RP-103c: 0-55 at 1.14 R round the face). The widget
 * reads its pointer through the SVG's own matrix, so widening the view box keeps the hands true.
 */
function ringWidget(root) {
    const svg = root.querySelector('svg.cs-clock');
    if (!svg || svg.querySelector('[data-mq-ladder="ring"]')) return !!svg;
    svg.setAttribute('viewBox', '-36 -36 312 312');
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('data-mq-ladder', 'ring');
    for (let i = 0; i < 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180;
        const t = document.createElementNS(NS, 'text');
        t.setAttribute('x', String(120 + 136 * Math.cos(a)));
        t.setAttribute('y', String(120 + 136 * Math.sin(a)));
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'central');
        t.setAttribute('style', "font:700 17px 'Andika','Open Sans',sans-serif;fill:#000;");
        t.textContent = String(i * 5);
        g.appendChild(t);
    }
    svg.insertBefore(g, svg.firstChild);
    return true;
}

/** The word-work cell with a keyword support turned on (its payload flags hl / bar / kb). */
function wwSupports(root, q, rungs) {
    const box = root.querySelector('.mq-ww');
    const c = q.cell;
    if (!box || !c || !c.payload) return false;
    const flags = {};
    rungs.forEach((r) => { flags[r.flag] = true; });
    const want = Object.keys(flags).sort().join(' ');
    if (box.getAttribute('data-mq-ladder') === want) return true;
    const make = (f) => {
        const tpl = document.createElement('template');
        tpl.innerHTML = wordWorkTwin(renderCell, Object.assign({}, c.payload, f));
        return tpl.content.querySelector('.mq-ww');
    };
    const neu = make(flags);
    if (!neu) return false;
    // the story (and the keyword bank beside it) is the first child: no inputs, swapped whole
    if (neu.children[0] && box.children[0]) box.replaceChild(neu.children[0].cloneNode(true), box.children[0]);
    if (flags.bar && !box.querySelector('[data-mq-ladder="wpBar"]')) {
        const without = make(Object.assign({}, flags, { bar: false }));
        const at = Array.from(neu.children).findIndex((el, i) => !without.children[i] || el.outerHTML !== without.children[i].outerHTML);
        const bar = at >= 0 ? neu.children[at] : null;
        if (bar) {
            bar.setAttribute('data-mq-ladder', 'wpBar');
            box.insertBefore(bar, box.children[at] || null);
        }
    }
    box.setAttribute('data-mq-ladder', want);
    return true;
}

function paneHTML(r) {
    const id = r.pane || r.id;
    const html = renderPane(id, r.payload, PANE_CTX(id));
    return html ? `<div class="mq-ladder-pane" data-mq-ladder-on="${esc(r.id)}">${html}</div>` : '';
}

function eqHTML(rs) {
    const p = rs[0].payload;
    const html = withSupports('<span class="mq-sup-anchor"></span>', { a: p.a, b: p.b, op: p.op, supports: { on: rs.map((r) => r.id), reserve: [], ...(opKey(p.op) === '/' ? { tally: 10 } : {}) } },
        'equation', SCREEN_CTX, { problemWMm: 0, problemHMm: 0 });
    return html && !/^<span class="mq-sup-anchor"><\/span>$/.test(html)
        ? `<div class="ws-sheet mq-kit mq-ladder-pane" data-mq-ladder-on="${esc(rs.map((r) => r.id).join(' '))}">${html}</div>` : '';
}

/**
 * Draw the item's ladder so far into `root` (the practice card's visual, a worksheet card's cell,
 * the quiz cell). Idempotent: call it after every wrong answer, or after the host re-renders.
 */
export function drawLadder(root, q, ctx = {}) {
    if (!root || !q || typeof document === 'undefined') return;
    ensureStyle();
    const s = shownOf(q);
    root.querySelectorAll(':scope .mq-ladder-extra').forEach((el) => el.remove());
    if (!s.rungs.length) return;
    const sup = s.drawn;
    const parts = [];
    if (ctx.message) parts.push(`<div class="mq-ladder-msg">${esc(ctx.message)}</div>`);
    // in the kit cell: the ladder's touch dots / sign / arrow, exactly what is on now
    const kitRoot = kitRootIn(root);
    if (kitRoot) {
        const want = sup.filter((r) => r.how === 'kit').map((r) => r.id).join(' ');
        const drawn = kitRoot.getAttribute('data-mq-ladder');
        if ((drawn || '') !== want && (want || drawn !== null)) redrawKit(root, q, want ? want.split(' ') : [], ctx);
    }
    const eq = sup.filter((r) => r.how === 'eq');
    if (eq.length) parts.push(eqHTML(eq));
    // counters beside their numbers (or under the problem when they cannot stand there)
    sup.filter((r) => r.how === 'tile').forEach((r) => {
        drawTiles(root, q, r, ctx).forEach((t) => parts.push(`<div class="mq-ladder-pane" data-mq-ladder-on="${esc(r.id)}" style="--mq-lad-tile:${TILE_MIN_PX}px">${frameSVG(t.n, t.cross)}</div>`));
    });
    if (sup.some((r) => r.how === 'ring') && !root.querySelector('svg[data-mq-ladder="ring"]')) ringClock(root, q);
    if (sup.some((r) => r.how === 'csring')) ringWidget(root);
    const ww = sup.filter((r) => r.how === 'ww');
    if (ww.length) wwSupports(root, q, ww);
    sup.filter((r) => r.how === 'pane').forEach((r) => parts.push(paneHTML(r)));
    if (s.worked) parts.push(workedHTML(q, ctx));
    const body = parts.filter(Boolean).join('');
    if (!body) return;
    const box = document.createElement('div');
    box.className = 'mq-ladder-extra';
    box.setAttribute('data-mq-ladder-step', String(Math.min(s.n, 3)));
    box.innerHTML = body;
    root.appendChild(box);
    // a pane wider than a phone's cell is drawn at a smaller millimetre, never cut off
    box.querySelectorAll('.mq-ladder-pane').forEach((pane) => {
        const room = box.clientWidth;
        const w = pane.scrollWidth;
        if (room > 0 && w > room) {
            const k2 = parseFloat(getComputedStyle(pane).getPropertyValue('--mq-k2')) || 3.8;
            pane.style.setProperty('--mq-k2', `${Math.max(2.4, k2 * (room - 4) / w).toFixed(2)}px`);
        }
    });
    const say = box.querySelector('.mq-lw-speak');
    if (say) say.addEventListener('click', (ev) => { ev.preventDefault(); speakSay(say.getAttribute('data-say') || ''); });
}

/* ------------------------------------------------------------------ the worked steps */

/** The answer's written forms, and every value the provider marks as written by the steps. */
function answerTokens(q, steps) {
    const out = new Set();
    const add = (v) => {
        const s = String(v == null ? '' : v).trim();
        if (!s || s.length > 12) return;
        out.add(s);
        const n = Number(s.replace(/,/g, ''));
        if (Number.isFinite(n) && Math.abs(n) >= 1000) out.add(n.toLocaleString('en-US'));
        const t = /^(\d{1,2}):(\d{2})$/.exec(s);
        if (t) { out.add(String(Number(t[1]))); out.add(t[2]); out.add(String(Number(t[2]))); }
    };
    if (q && (typeof q.ans === 'string' || typeof q.ans === 'number')) add(q.ans);
    // Every part of a many-slot answer is an answer too (one number rounded to several places).
    if (q && Array.isArray(q.keyParts)) q.keyParts.forEach(add);
    (steps || []).forEach((st) => (Array.isArray(st.marks) ? st.marks : []).forEach((m) => {
        if (m && (m.slot === 'ans' || m.slot === 'answer' || m.slot === 'hour' || m.slot === 'minute' || /^ans/.test(String(m.slot)))) add(m.value);
    }));
    out.delete('0');
    return [...out].sort((a, b) => b.length - a.length);
}

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A step's text with the answer left for the pupil: a count running up to it is cut, the answer blanked. */
export function hideAnswer(text, tokens) {
    let t = String(text || '');
    if (!tokens.length) return t;
    const isAns = (x) => tokens.includes(x.trim());
    // "Count on 2: 7, 8." -> "7, …" (where the count starts); a count from 1 up to the answer
    // ("Count: 1, 2, 3 ... 18.") is the answer itself, so it becomes the instruction to count.
    const N = '\\d+(?:,\\d{3})*';
    t = t.replace(new RegExp(`${N}(?:(?:, | ?\\.\\.\\. ?| ?… ?)${N})+`, 'g'), (run) => {
        const items = run.split(/, | ?\.\.\. ?| ?… ?/);
        const at = items.findIndex(isAns);
        if (at < 0) return run;
        if (items[0] === '1' || items[0] === '0') return 'say one number for each one';
        const keep = items.slice(0, Math.min(at, 3));
        return keep.length ? `${keep.join(', ')}, …` : '…';
    });
    for (const tok of tokens) {
        t = t.replace(new RegExp(`(^|[^\\d.,:])${reEsc(tok)}(?![\\d])`, 'g'), '$1___');
    }
    return t;
}

function plain(html) {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/** This item's worked steps, the answer hidden. */
export function workedStepsFor(q, ctx = {}) {
    const { cat, skill } = whereFrom(q, ctx);
    let raw = [];
    try {
        const p = getProvider(cat, skill);
        if (p && Array.isArray(p.real) && p.real.includes('workedSteps') && typeof p.workedSteps === 'function') {
            const st = p.workedSteps(q);
            if (Array.isArray(st)) raw = st.filter((s) => s && s.text);
        }
    } catch (e) { raw = []; }
    if (raw.length < 2 && typeof window !== 'undefined' && typeof window.generateSolutionSteps === 'function') {
        try {
            const g = window.generateSolutionSteps(q) || [];
            if (Array.isArray(g)) raw = g.map(plain).filter((t) => t && !/^Problem:/i.test(t)).map((t) => ({ text: t.replace(/^Step \d+:\s*/i, ''), marks: [] })).slice(0, 5);
        } catch (e) { /* keep what there is */ }
    }
    if (!raw.length && q && q.hint) raw = [{ text: plain(q.hint), marks: [] }];
    const tokens = answerTokens(q, raw);
    return raw.slice(0, 6).map((s) => hideAnswer(plain(s.text), tokens));
}

/** The Say: frame with this item's given numbers and the answer left as a blank. */
export function sayFor(q, ctx = {}) {
    const { cat, skill } = whereFrom(q, ctx);
    let frame = '';
    try {
        const p = getProvider(cat, skill);
        if (p && typeof p.strings === 'function') frame = String(p.strings({ q }).say || '');
    } catch (e) { frame = ''; }
    if (!frame) return '';
    const blanks = (frame.match(/__/g) || []).length;
    const bp = binaryParts(Object.assign({}, q, { options: [] }));
    const ops = bp ? [bp.a, bp.b] : Array.isArray(q.operands) ? q.operands.slice(0, 2) : [];
    if (blanks === 3 && ops.length === 2) {
        let k = 0;
        return frame.replace(/__/g, () => (k < 2 ? String(ops[k++]) : '___'));
    }
    return frame.replace(/__/g, '___');
}

function workedHTML(q, ctx) {
    const steps = workedStepsFor(q, ctx);
    const say = sayFor(q, ctx);
    if (!steps.length && !say) return '';
    const voice = !!state.ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window;
    const spoken = say.replace(/_{3}/g, '…');
    return `<div class="mq-ladder-worked" data-mq-ladder-on="worked" role="note" aria-label="How to do it">`
        + `<div class="mq-lw-title">Here is how</div>`
        + (steps.length ? `<ol class="mq-lw-steps">${steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : '')
        + (say ? `<div class="mq-lw-say"><b>Say:</b> <span>${esc(say)}</span>`
            + (voice ? ` <button type="button" class="mq-lw-speak" data-say="${esc(spoken)}" aria-label="Read the Say line aloud">Listen</button>` : '')
            + `</div>` : '')
        + `</div>`;
}

function speakSay(text) {
    if (!text || typeof window === 'undefined') return;
    if (typeof window.speakAnswerOption === 'function') { try { window.speakAnswerOption(text); } catch (e) { /* ignore */ } }
}

/* ------------------------------------------------------------------ the gentle mark */

/** Keep the pupil's entry, marked gently: a grey dashed underline, the text selected to retype. */
export function markTried(input) {
    if (!input || input.type === 'hidden') return;
    ensureStyle();
    input.classList.add('mq-tried');
    const clear = () => { input.classList.remove('mq-tried'); input.removeEventListener('input', clear); };
    input.addEventListener('input', clear);
}

let _styled = false;
function ensureStyle() {
    if (_styled || typeof document === 'undefined') return;
    _styled = true;
    const st = document.createElement('style');
    st.id = 'mqLadderStyle';
    // Ink, paper and the single grey (INK-1): the ladder is calm and black and white.
    st.textContent = `
.mq-ladder-extra{--mq-k2:3.8px;display:flex;flex-wrap:wrap;justify-content:center;align-items:flex-start;gap:14px;margin-top:12px;color:#000;}
.mq-ladder-msg{flex:1 1 100%;text-align:center;font-family:'Andika','Open Sans',sans-serif;font-size:1rem;font-weight:700;color:#000;}
.mq-ladder-pane{display:inline-flex;justify-content:center;max-width:100%;overflow:hidden;}
.mq-ladder-worked{flex:1 1 100%;max-width:560px;text-align:left;border:2px solid #000;border-radius:12px;background:#fff;color:#000;padding:10px 14px;font-family:'Andika','Open Sans',sans-serif;}
.mq-lw-title{font-weight:700;font-size:1.05rem;margin-bottom:4px;}
.mq-lw-steps{margin:0 0 6px 20px;padding:0;font-size:1.05rem;line-height:1.5;}
.mq-lw-say{font-size:1.05rem;border-top:1px solid #949494;padding-top:6px;}
.mq-lw-speak{margin-left:6px;min-height:36px;padding:4px 12px;border:2px solid #000;border-radius:18px;background:#fff;color:#000;font-weight:700;cursor:pointer;}
@media (min-width:600px){.mq-ladder-extra{--mq-k2:4.4px;}}
.mq-ladder-worked,.mq-ladder-worked *,.mq-ladder-msg{font-family:'Andika','Open Sans',sans-serif !important;color:#000;}
.mq-lad-beside{display:flex;justify-content:center;align-items:flex-start;gap:14px;}
.mq-lad-beside > .ws-fact{margin:0 !important;}
.ws-fact[data-mq-ladder-tiles] > span:not(.rule){height:var(--mq-lad-row) !important;}
input.mq-tried{border-bottom:3px dashed #949494 !important;background:#fff !important;}
.mq-ladder-card{background:var(--bg-card) !important;border:2px dashed #949494 !important;}
`;
    document.head.appendChild(st);
}

/* ------------------------------------------------------------------ host helpers */

/**
 * The practice card (answer-check.js): a wrong answer on the live item. Draws the next rung into
 * #visualAid and writes the calm message into #feedbackArea. Returns the ladderWrong() result
 * (null: the ladder is off; `spent`: the host's own behaviour runs).
 */
export function practiceLadderWrong(q, userAns) {
    if (typeof document === 'undefined') return null;
    const ctx = { categoryId: state.category, skillId: state.skill };
    const r = ladderWrong(q, userAns, ctx);
    if (!r || r.spent) return r;
    const vis = document.getElementById('visualAid');
    if (vis) {
        drawLadder(vis, q, ctx);
        if (vis.style.display === 'none' && vis.querySelector('.mq-ladder-extra')) vis.style.display = 'block';
    }
    const fb = document.getElementById('feedbackArea');
    if (fb) {
        fb.style.display = 'block';
        fb.className = 'feedback-area mq-ladder-feedback';
        fb.textContent = r.message;
    }
    return r;
}

/**
 * A worksheet card (worksheet.js): the next rung in card `idx`'s cell. `{wait: true}`: the entry
 * is still being typed (the card stays neutral); null: the ladder is off; `spent`: the card's red.
 */
export function worksheetLadderWrong(idx, q, value) {
    if (typeof document === 'undefined') return null;
    if (modeFor(q, { categoryId: state.category, skillId: state.skill }) === 'none') return null;
    // The card checks as the pupil types: a word or a fraction still shorter than its answer is
    // being typed, not answered (a number waits for its digits before it gets here; a multi-box
    // answer waits for every box).
    const v = String(value == null ? '' : value).replace(/\s+/g, '');
    const a = String(q && q.ans != null ? q.ans : '').replace(/\s+/g, '');
    const numeric = q && (q.answerType === 'number' || typeof q.ans === 'number');
    if (!numeric && !(q && q._mqSlots) && v.length < a.length) return { wait: true };
    const ctx = { categoryId: state.category, skillId: state.skill, dedupe: true };
    const r = ladderWrong(q, value, ctx);
    if (!r || r.spent) return r;
    const card = document.getElementById(`ws_card_${idx}`);
    const cell = card && card.querySelector('.ws-cell');
    if (cell) drawLadder(cell, q, Object.assign({}, ctx, { message: r.message }));
    if (card) {
        ensureStyle();
        card.classList.add('mq-ladder-card');
    }
    return r;
}

/** A quiz with instant feedback (quiz-take.js): count a wrong answer on question `qd`. */
export function quizLadderWrong(qd, value) {
    return ladderWrong(qd, value, { categoryId: qd && qd.categoryId, skillId: qd && qd.skillId, dedupe: true });
}
