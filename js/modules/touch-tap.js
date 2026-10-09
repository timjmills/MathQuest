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
                s.setAttribute('aria-label', `${value}: ${total} touch dots. Tap to count.`);
            } else s.setAttribute('aria-hidden', 'true');
        });
    });
}

function cellOf(el) { return el.closest('.mq-scell') || el.closest('.ws-cell') || el.parentElement; }

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

function status(cell) {
    const host = cell.parentNode;
    if (!host) return null;
    let bar = cell.nextElementSibling;
    if (!bar || !bar.classList.contains('mq-tn-count')) {
        bar = document.createElement('div');
        bar.className = 'mq-tn-count';
        bar.innerHTML = '<span class="mq-tn-said" aria-live="polite"></span> <button type="button" class="mq-tn-reset">Start again</button>';
        host.insertBefore(bar, cell.nextSibling);
        bar.querySelector('.mq-tn-reset').addEventListener('click', () => reset(cell, bar));
    }
    return bar;
}

function reset(cell, bar) {
    cell.querySelectorAll('.ws-tn[data-mq-tn]').forEach((s) => {
        const g = groups.get(s); if (!g) return;
        g.counted = g.run.map(() => []);
        paint(s, []);
    });
    if (bar) bar.remove();
}

function show(cell) {
    const bar = status(cell);
    if (bar) bar.querySelector('.mq-tn-said').textContent = `Touched ${cellCount(cell)}`;
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
    const scan = () => { document.querySelectorAll(HOSTS).forEach((h) => { if (h.querySelector('.ws-tn:not([data-mq-tn])')) enhance(h); }); };
    let pending = false;
    const schedule = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; scan(); }); };
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
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
