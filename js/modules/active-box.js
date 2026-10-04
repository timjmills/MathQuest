// The NEXT answer box pulses yellow (owner, 2026-10-04: "all boxes to put answers should pulse yellow
// when an answer needs to be put"). One rule for every answer box on the three pupil screens — the
// practice card, the online worksheet's current problem and the quiz question — whatever widget drew it.
//
// The active box is the answer input the pupil is in; when focus is elsewhere, it is the first empty
// answer input in reading order. Optional regroup / carry boxes pulse only while the pupil is in them,
// and a box already marked right never pulses. The look lives in css/screen-cell.css (.mq-active-box).
// Screen only: print never runs this.

const HOSTS = '#questionCard, .online-edition .problem-card.mq-active-problem, .qt-question-card';
// The enlarge (zoom) pop-up copies a problem's answer boxes; while it is open it is the ONLY host.
const POPUP = '.zoom-overlay .zoom-content';
const TYPING = 'input, textarea, select, [contenteditable="true"]';
const SKIP_TYPES = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
const OPTIONAL = /carry|regroup/i;
const isOptional = (el) => OPTIONAL.test(el.className) || /regroup|carry/i.test((el.closest('[data-mq-kind]') || el).getAttribute('data-mq-kind') || '');
const DIGIT = 'input.mq-digit, input.column-answer-input';

// Column digits are written ones first (SP-20, wireStackEntry): within one row of one stack the
// next box is the RIGHTMOST empty one, so each row's digit boxes are listed right to left.
function entryOrder(boxes) {
    const out = [];
    for (let i = 0; i < boxes.length; i++) {
        const el = boxes[i];
        if (!el.matches(DIGIT) || isOptional(el)) { out.push(el); continue; }
        const stack = el.closest('.ws-stack, .column-problem, [data-mq-cell]') || el.parentElement;
        const top = Math.round(el.getBoundingClientRect().top);
        const run = [el];
        while (i + 1 < boxes.length) {
            const nx = boxes[i + 1];
            if (!nx.matches(DIGIT) || isOptional(nx) || Math.round(nx.getBoundingClientRect().top) !== top
                || (nx.closest('.ws-stack, .column-problem, [data-mq-cell]') || nx.parentElement) !== stack) break;
            run.push(nx); i++;
        }
        out.push(...run.reverse());
    }
    return out;
}

function isAnswerBox(el) {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.closest('.mq-work-area, [data-mq-no-pulse]')) return false;   // scratch work areas are not answers
    if (el.isContentEditable) return el.getAttribute('contenteditable') === 'true';
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    if (SKIP_TYPES.has((el.type || 'text').toLowerCase())) return false;
    return !el.closest('.qt-name-row, .qt-header, [data-mq-no-pulse]') && !el.matches('.qt-name-input');
}

function visible(el) {
    const b = el.getBoundingClientRect();
    if (b.width < 4 || b.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none';
}

function valueOf(el) { return el.isContentEditable ? (el.textContent || '').trim() : String(el.value || '').trim(); }

function pickActive(host) {
    const boxes = [...host.querySelectorAll('input, textarea, [contenteditable="true"]')].filter(isAnswerBox).filter(visible);
    if (!boxes.length) return { boxes, active: null };
    const ae = document.activeElement;
    if (ae && boxes.includes(ae) && !ae.classList.contains('mq-live-correct')) return { boxes, active: ae };
    // A word-problem box the pupil copies a story number into, where that place holds no digit
    // (data-mq-expect=""), must stay blank — pulsing it would invite a wrong digit (critic D6). Only
    // these copy boxes: skipping blank ANSWER boxes would reveal how many digits the answer has.
    const mustStayBlank = (el) => el.matches('input.mq-wwork') && el.getAttribute('data-mq-expect') === '';
    const next = entryOrder(boxes).find(el => !valueOf(el) && !isOptional(el) && !mustStayBlank(el) && !el.classList.contains('mq-live-correct'));
    return { boxes, active: next || null };
}

let queued = false;
const visibleHost = (h) => h.offsetParent !== null || h.getClientRects().length > 0;

// Nothing else is in the way: the point at the middle of the box is the box itself (no pop-up,
// hint or celebration covers it), and it is on screen.
function uncovered(el) {
    const b = el.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    const top = document.elementFromPoint(x, y);
    return !!top && (top === el || el.contains(top));
}

// The next box is SELECTED, not only lit (owner 2026-10-04): when no typing place has the focus —
// on load, after a re-render, or when the pupil taps a blank part of the screen — the pulsing box
// takes it, so typing always lands there. A pupil who taps a button, another box or a pop-up keeps
// that focus. A count-by row on a phone manages its own focus (it holds back a box the start does
// not show), so its boxes are never auto-focused here.
function selectIfLoose(active) {
    const ae = document.activeElement;
    if (ae && ae !== document.body && ae !== document.documentElement && ae.matches) {
        if (ae.matches(TYPING) || ae.matches('button, a[href], select')) return;          // the pupil chose that
        // a focusable WRAPPER (a card, a cell) is a blank part of the problem: it does not hold the focus
        const inProblem = ae.closest(HOSTS + ', ' + POPUP) || ae.matches(HOSTS + ', ' + POPUP);
        if (ae.matches('[tabindex]:not([tabindex="-1"]), [role="button"]') && !inProblem) return;
    }
    if (active.closest('[data-mq-swiperow]')) return;
    if (!uncovered(active)) return;
    try { active.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}

export function refreshActiveBox() {
    if (typeof document === 'undefined') return;
    const popups = [...document.querySelectorAll(POPUP)].filter(visibleHost);
    const hosts = popups.length ? popups.slice(-1) : [...document.querySelectorAll(HOSTS)].filter(visibleHost);
    const keep = new Set();
    for (const host of hosts) {
        const { active } = pickActive(host);
        if (active) keep.add(active);
    }
    // Touch the class only when it changes: re-adding a class the box already has is still a DOM
    // mutation, which would wake the observer every frame (critic D1).
    document.querySelectorAll('.mq-active-box').forEach(el => { if (!keep.has(el)) el.classList.remove('mq-active-box'); });
    keep.forEach(el => { if (!el.classList.contains('mq-active-box')) el.classList.add('mq-active-box'); });
    if (keep.size === 1) selectIfLoose([...keep][0]);
}

function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; refreshActiveBox(); });
}

export function installActiveBox() {
    if (typeof document === 'undefined' || window.__mqActiveBoxInstalled) return;
    window.__mqActiveBoxInstalled = true;
    for (const ev of ['focusin', 'focusout', 'input', 'change', 'click']) document.addEventListener(ev, schedule, true);
    // Questions are re-rendered by many code paths; watch the DOM rather than hooking each one.
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'readonly', 'style'] });
    schedule();
}
