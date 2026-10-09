/**
 * Touch numerals on screen (design/SUPPORTS.md S1.8): the pupil taps a number and the next mark is
 * counted. The WHOLE number is the target (at least 44 x 44 px, centred on it, one per number not
 * per digit); a tap counts the nearest mark that still has a touch left, so a tap never misses.
 * A counted mark turns the one grey; a double takes two taps (centre dot, then ring). The running
 * count sits quietly under the cell, outside the B&W cell, with "Start again". No timer.
 * Keyboard: Tab to a number, Space / Enter counts the next mark in counting order.
 *
 * Practice card, online worksheet and quiz only (never a print preview). Installed once, it watches
 * the DOM, because questions are re-rendered by many code paths.
 */
import { touchDots, touchDotOrder, touchDotCount } from './sheet/index.js';

const HOSTS = '#gameView, #worksheetView, #quizTakeView';
const GREY = '#949494';   // INK-1: the sheet's one grey

const isTn = (el) => el && el.nodeType === 1 && el.classList.contains('ws-tn');

/** The run of digit spans that make one number: adjacent .ws-tn siblings, only white space between. */
function runOf(first) {
    const run = [first];
    let n = first.nextSibling;
    while (n) {
        if (n.nodeType === 3 && !n.textContent.trim()) { n = n.nextSibling; continue; }
        if (!isTn(n)) break;
        run.push(n);
        n = n.nextSibling;
    }
    return run;
}

function prevTn(el) {
    let n = el.previousSibling;
    while (n && n.nodeType === 3 && !n.textContent.trim()) n = n.previousSibling;
    return isTn(n) ? n : null;
}

const groups = new WeakMap();   // digit span -> group

function enhance(root) {
    root.querySelectorAll('.ws-tn:not([data-mq-tn])').forEach((el) => {
        if (el.hasAttribute('data-mq-tn') || prevTn(el)) return;   // a run is handled from its first digit
        const run = runOf(el);
        const g = { run, counted: run.map(() => []) };
        const value = run.map((s) => s.getAttribute('data-digit')).join('');
        const total = run.reduce((t, s) => t + touchDotCount(s.getAttribute('data-digit')), 0);
        run.forEach((s, i) => {
            s.setAttribute('data-mq-tn', '1');
            s.classList.add('mq-tn-hit');
            groups.set(s, g);
            if (i === 0) {
                s.setAttribute('role', 'button');
                s.setAttribute('tabindex', '0');
                s.setAttribute('aria-label', `${value}: ${total} touch ${total === 1 ? 'dot' : 'dots'}. Tap to count.`);
            } else s.setAttribute('aria-hidden', 'true');
        });
    });
}

function cellOf(el) { return el.closest('.mq-scell') || el.closest('.ws-cell') || el.parentElement; }

const tnIn = (cell) => !!(cell && cell.querySelector && cell.querySelector('.ws-tn[data-mq-tn]'));

/** All touched counts in this cell. */
function cellCount(cell) {
    let t = 0;
    cell.querySelectorAll('.ws-tn[data-mq-tn]').forEach((s) => {
        const g = groups.get(s); if (!g) return;
        const i = g.run.indexOf(s);
        t += (g.counted[i] || []).reduce((a, b) => a + (b || 0), 0);
    });
    return t;
}

function paint(span, counted) {
    const marks = span.querySelectorAll('g.ws-td-mark');
    marks.forEach((m, i) => {
        const n = counted[i] || 0;
        const c = m.querySelectorAll('circle');
        if (m.classList.contains('dbl')) {
            if (c[2]) c[2].setAttribute('fill', n >= 1 ? GREY : '#000');
            if (c[0]) c[0].setAttribute('stroke', n >= 2 ? GREY : '#000');
        } else if (c[1]) c[1].setAttribute('fill', n >= 1 ? GREY : '#000');
    });
}

/* ---- what the count line says (SUPPORTS S1.8, owner rulings 2026-10-09) ---- */

const PLURAL = ['zeros', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines', 'tens', 'elevens', 'twelves'];
const ANSWERED = '.mq-ladder-extra, [data-mq-ladder], .correct-bg, .incorrect-bg, .locked-correct, input.correct, input.wrong';

function hostOf(cell) { return cell.closest('.problem-card, .qt-question-card, .ws-card') || cell.closest(HOSTS) || cell.parentElement || cell; }

/** Count all: every number of the problem is a touch numeral (count on / back leaves one plain). */
function allTouch(cell) {
    const c = (cell.querySelector('.ws-sheet, .mq-kit') || cell).cloneNode(true);
    c.querySelectorAll('.ws-tn, input, select, textarea, .ws-factans, .mq-factans, .mq-ladder-extra, .mq-tn-count, .mq-instr, .ws-regroup, [aria-hidden="true"]').forEach((e) => e.remove());
    return !/\d/.test(c.textContent || '');
}

/** How this cell counts: {kind: 'times', n, step} | {kind: 'all'} | {kind: 'on'}. */
function modeOf(cell) {
    const sup = Array.from(cell.querySelectorAll('[data-ws-supports], [data-mq-ladder]'))
        .concat(cell.matches('[data-ws-supports], [data-mq-ladder]') ? [cell] : [])
        .map((e) => `${e.getAttribute('data-ws-supports') || ''} ${e.getAttribute('data-mq-ladder') || ''}`).join(' ');
    const stack = !!cell.querySelector('.ws-stack, [data-ws-cell="stack"], table');
    const txt = (cell.textContent || '').replace(/\s+/g, ' ');
    const m = txt.match(/(\d+)\s*[×x*]\s*(\d+)/);
    if (m && !stack) {
        const tn = cell.querySelector('.ws-tn[data-mq-tn][role="button"]');
        const g = tn && groups.get(tn);
        const v = g ? Number(g.run.map((x) => x.getAttribute('data-digit')).join('')) : NaN;
        const a = Number(m[1]), b = Number(m[2]);
        if (v === a || v === b) return { kind: 'times', n: v, step: v === a ? b : a };
    }
    if (/\btouchall\b/.test(sup) || allTouch(cell)) return { kind: 'all' };
    return { kind: 'on' };
}

/** The line's words for this cell now: [said, showReset]. */
function words(cell) {
    const k = cellCount(cell);
    const md = modeOf(cell);
    if (md.kind === 'times') {
        const name = PLURAL[md.step] || `${md.step}s`;
        const ask = `How much is ${md.n} ${md.n === 1 ? name.replace(/s$/, '') : name}?`;
        if (!k) return [ask, false];
        const seq = Array.from({ length: k }, (_, i) => md.step * (i + 1)).join(', ');
        return [`${seq} (counting by ${name})`, true];
    }
    if (md.kind === 'all') {
        // count all: the last count IS the answer, so it shows only once the pupil has answered
        const h = hostOf(cell);
        const view = cell.closest(HOSTS);
        const answered = !!(h.querySelector(ANSWERED) || h.matches('.mq-ladder-card')
            || (view && view.querySelector('#feedbackArea.mq-ladder-feedback')));
        return [k && answered ? `Touched ${k}` : '', k > 0];
    }
    return [k ? `Touched ${k}` : '', k > 0];
}

/** The count line under a cell: made with the numerals, its space reserved from the start (R3-4). */
function lineFor(cell) {
    const host = cell.parentNode;
    if (!host) return null;
    let bar = cell.nextElementSibling;
    if (!bar || !bar.classList.contains('mq-tn-count')) {
        bar = document.createElement('div');
        bar.className = 'mq-tn-count';
        bar.innerHTML = '<span class="mq-tn-said" aria-live="polite"></span> <button type="button" class="mq-tn-reset">Start again</button>';
        host.insertBefore(bar, cell.nextSibling);
        // Start again acts on the LIVE cell before the line (a ladder redraw may replace it, R3-5)
        bar.querySelector('.mq-tn-reset').addEventListener('click', () => { const c = bar.previousElementSibling; if (c) reset(c); });
    }
    return bar;
}

function show(cell) {
    const bar = lineFor(cell);
    if (!bar) return;
    const [said, again] = words(cell);
    const sp = bar.querySelector('.mq-tn-said');
    if (sp.textContent !== said) sp.textContent = said;
    const btn = bar.querySelector('.mq-tn-reset');
    const vis = again ? 'visible' : 'hidden';
    if (btn.style.visibility !== vis) btn.style.visibility = vis;
}

function reset(cell) {
    cell.querySelectorAll('.ws-tn[data-mq-tn]').forEach((s) => {
        const g = groups.get(s); if (!g) return;
        g.counted = g.run.map(() => []);
        paint(s, []);
    });
    show(cell);
}

/** Keep every line true to its cell: a line whose cell lost its numerals goes, a new cell gets one. */
function sync() {
    const keep = (c) => tnIn(c) || !!(c && c.matches && c.matches('[data-mq-touch-floor]'));
    document.querySelectorAll('.mq-tn-count').forEach((bar) => { if (!keep(bar.previousElementSibling)) bar.remove(); });
    const seen = new Set();
    // a cell whose ladder can draw touch numerals keeps the line's space from the start, so nothing
    // grows when the numerals arrive mid-ladder (R3-3, R3-4)
    document.querySelectorAll(HOSTS).forEach((h) => h.querySelectorAll('[data-mq-touch-floor]').forEach((c) => {
        if (!tnIn(c) && !seen.has(c)) { seen.add(c); show(c); }
    }));
    document.querySelectorAll(HOSTS).forEach((h) => h.querySelectorAll('.ws-tn[data-mq-tn][role="button"]').forEach((s) => {
        if (s.closest('.zoom-overlay, .print-preview')) return;
        const c = cellOf(s);
        if (c && !seen.has(c)) { seen.add(c); show(c); }
    }));
}

function left(d, counted, i) { const p = touchDots(d)[i]; return p ? (p.double ? 2 : 1) - (counted[i] || 0) : 0; }

/** A tap at (x, y) page px: the nearest mark with a touch left, across the number's digits. */
function tapAt(g, x, y) {
    let best = null, bd = Infinity;
    g.run.forEach((s, di) => {
        const svg = s.querySelector('svg.ws-tn-svg, svg.ws-td-svg');
        if (!svg) return;
        const r = svg.getBoundingClientRect();
        const vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
        if (vb.length !== 4 || !r.width) return;
        const d = s.getAttribute('data-digit');
        touchDots(d).forEach((p, i) => {
            if (left(d, g.counted[di], i) <= 0) return;
            const px = r.left + ((p.x * 1000 - vb[0]) / vb[2]) * r.width;
            const py = r.top + ((p.y * 1000 - vb[1]) / vb[3]) * r.height;
            const dd = Math.hypot(px - x, py - y);
            if (dd < bd) { bd = dd; best = { di, i }; }
        });
    });
    return best;
}

/** Keyboard: the next touch in counting order (digit by digit, touchDotOrder within a digit). */
function nextInOrder(g) {
    for (let di = 0; di < g.run.length; di++) {
        const d = g.run[di].getAttribute('data-digit');
        for (const o of touchDotOrder(d)) if (left(d, g.counted[di], o.mark) > 0) return { di, i: o.mark };
    }
    return null;
}

function count(g, hit) {
    if (!hit) return;
    const c = g.counted[hit.di];
    c[hit.i] = (c[hit.i] || 0) + 1;
    paint(g.run[hit.di], c);
    show(cellOf(g.run[0]));
}

export function installTouchTap() {
    if (typeof document === 'undefined' || window.__mqTouchTapInstalled) return;
    window.__mqTouchTapInstalled = true;
    const scan = () => { document.querySelectorAll(HOSTS).forEach((h) => { if (h.querySelector('.ws-tn:not([data-mq-tn])')) enhance(h); }); sync(); };
    let pending = false;
    const schedule = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; scan(); }); };
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    // A pointer tap counts WITHOUT taking the focus (R3-2): the caret stays in the answer box, so a
    // digit typed next still lands there. Keyboard users still Tab to the number (tabindex 0).
    const keepFocus = (e) => {
        const s = e.target && e.target.closest && e.target.closest('.ws-tn[data-mq-tn]');
        if (s && s.closest(HOSTS)) e.preventDefault();
    };
    document.addEventListener('pointerdown', keepFocus, true);
    document.addEventListener('mousedown', keepFocus, true);
    document.addEventListener('click', (e) => {
        const s = e.target && e.target.closest && e.target.closest('.ws-tn[data-mq-tn]');
        if (!s || !s.closest(HOSTS)) return;
        const g = groups.get(s); if (!g) return;
        count(g, tapAt(g, e.clientX, e.clientY));
    });
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const s = e.target && e.target.closest && e.target.closest('.ws-tn[data-mq-tn][role="button"]');
        if (!s || !s.closest(HOSTS)) return;
        const g = groups.get(s); if (!g) return;
        e.preventDefault();
        e.stopPropagation();
        count(g, nextInOrder(g));
    }, true);
    scan();
}
